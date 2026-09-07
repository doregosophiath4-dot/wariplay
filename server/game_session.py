import json
import os
import secrets
from datetime import datetime, timezone
from redis_session import get_redis
from db import get_pool
from game_helpers import log_game_result

GAME_SESSION_PREFIX = "game_session:"
ACTIVE_SESSION_PREFIX = "active_session:"
GAME_SESSION_TTL = 60 * 10  # 10 minutes
COTE = 2
SESSIONS_DIR = "data/sessions"

# ============================================================
# Script Lua : réservation atomique d'un "slot" de session active
# ============================================================
# Empêche un même user_id d'avoir plus d'une session de jeu en cours
# à la fois. On stocke, sous active_session:{user_id}, le token de
# la session en cours. Avant d'en créer une nouvelle, on vérifie que
# l'ancienne référence (si elle existe) ne pointe plus vers une
# session réellement encore vivante dans Redis (EXISTS) — si elle
# est morte (expirée/réglée mais slot pas encore nettoyé), on la
# remplace ; sinon on refuse la création.
#
# Codes de retour :
#   1  -> slot réservé avec succès pour new_token
#   0  -> une session est déjà active pour cet utilisateur
ACTIVE_SESSION_SCRIPT = """
local active_key = KEYS[1]
local new_token = ARGV[1]
local ttl = tonumber(ARGV[2])
local session_prefix = ARGV[3]

local existing_token = redis.call('GET', active_key)
if existing_token then
    local exists = redis.call('EXISTS', session_prefix .. existing_token)
    if exists == 1 then
        return 0
    end
end

redis.call('SET', active_key, new_token, 'EX', ttl)
return 1
"""

# ============================================================
# Script Lua : vérification atomique du nonce
# ============================================================
# Tourne entièrement côté serveur Redis : lecture de la session +
# comparaison du nonce + écriture du nouveau nonce, sans jamais
# rendre la main entre ces étapes. Deux requêtes concurrentes avec
# le même game_token ne peuvent donc jamais lire le même last_nonce
# avant que l'une des deux ait écrit sa mise à jour.
#
# Codes de retour :
#   1  -> nonce accepté et consommé
#   0  -> nonce invalide (<= dernier nonce connu)
#  -1  -> session introuvable (expirée ou inexistante)
NONCE_VERIFY_SCRIPT = """
local raw = redis.call('GET', KEYS[1])
if not raw then
    return -1
end

local data = cjson.decode(raw)
local new_nonce = tonumber(ARGV[1])

if data.last_nonce == nil then
    data.last_nonce = 0
end

if new_nonce <= data.last_nonce then
    return 0
end

data.last_nonce = new_nonce

local ttl = redis.call('TTL', KEYS[1])
if ttl and ttl > 0 then
    redis.call('SET', KEYS[1], cjson.encode(data), 'EX', ttl)
else
    redis.call('SET', KEYS[1], cjson.encode(data))
end

return 1
"""

# ============================================================
# Script Lua : verrouillage atomique du règlement (settle)
# ============================================================
# Vérifie appartenance (user_id), jeu (game_name) et statut encore
# "pending", puis bascule immédiatement le statut vers le résultat
# (win/loss) — le tout en une seule opération atomique côté Redis.
# Ça empêche deux appels concurrents à settle_game_session (bug,
# double connexion, retry réseau) de tous les deux lire "pending"
# et donc de créditer deux fois le solde d'un même gain.
#
# Codes de retour (premier élément du tableau) :
#   1  -> verrouillage réussi, statut basculé, data à jour renvoyée
#  -1  -> session introuvable ou expirée
#  -2  -> user_id ne correspond pas
#  -3  -> game_name ne correspond pas
#  -4  -> session déjà réglée (status != pending)
SETTLE_LOCK_SCRIPT = """
local raw = redis.call('GET', KEYS[1])
if not raw then
    return {-1, ''}
end

local data = cjson.decode(raw)

if data.user_id ~= ARGV[1] then
    return {-2, ''}
end

if data.game_name ~= ARGV[2] then
    return {-3, ''}
end

if data.status ~= 'pending' then
    return {-4, ''}
end

data.status = ARGV[3]

local ttl = redis.call('TTL', KEYS[1])
if ttl and ttl > 0 then
    redis.call('SET', KEYS[1], cjson.encode(data), 'EX', ttl)
else
    redis.call('SET', KEYS[1], cjson.encode(data))
end

return {1, cjson.encode(data)}
"""

# ============================================================
# Script Lua : reprise atomique d'une session active
# ============================================================
# Utilisé par get_active_session : relit la session, la renvoie
# telle quelle SAUF last_nonce qui est remis à 0 si besoin (une
# session "reused" doit redémarrer son compteur anti-replay comme
# une partie neuve, puisque le client va rouvrir une connexion WS
# et recompter son propre nonce depuis 1). Le TTL restant est
# préservé (pas de EX explicite si aucun TTL positif n'existe).
#
# Fait en Lua plutôt qu'en lecture+écriture séparées côté Python
# pour éviter que deux requêtes concurrentes (ex: deux onglets)
# ne se marchent dessus pendant la reprise de la même session.
#
# Codes de retour (premier élément du tableau) :
#   1  -> session lue (et nonce remis à 0 si nécessaire), data renvoyée
#  -1  -> session introuvable ou expirée
RESUME_SESSION_SCRIPT = """
local raw = redis.call('GET', KEYS[1])
if not raw then
    return {-1, ''}
end

local data = cjson.decode(raw)

if data.last_nonce == nil or data.last_nonce ~= 0 then
    data.last_nonce = 0

    local ttl = redis.call('TTL', KEYS[1])
    if ttl and ttl > 0 then
        redis.call('SET', KEYS[1], cjson.encode(data), 'EX', ttl)
    else
        redis.call('SET', KEYS[1], cjson.encode(data))
    end
end

return {1, cjson.encode(data)}
"""


async def add_gains(user_id, gains):
    """Mettre à jour le solde d'un utilisateur"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                result = await cur.fetchone()

                if not result:
                    return None

                current_solde = result[0]
                new_solde = current_solde + gains

                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id)
                )

                await conn.commit()
                # Conversion en float : la colonne SQL est un DECIMAL,
                # donc current_solde (et new_solde) sont des objets
                # Decimal côté Python. Un Decimal n'est pas JSON-
                # sérialisable nativement — le laisser tel quel fait
                # planter json.dump/json.dumps plus loin (archivage de
                # session, écriture Redis), ce qui a pour effet de
                # bord de bloquer le nettoyage de la session (voir
                # settle_game_session).
                return float(new_solde)

    except Exception:
        return None


async def create_game_session(user_id: str, bet: int, game_name: str) -> dict:
    """
    Crée une session de jeu, indexée dans Redis directement par le game_token
    (TTL 10 min). bet, cote, gains, user_id, game_name, last_nonce restent en
    base Redis, jamais renvoyés au client (sauf session_id et token).

    Un seul slot de session active est autorisé par utilisateur
    (voir ACTIVE_SESSION_SCRIPT) : si une session est déjà en cours,
    la création est refusée pour empêcher qu'un même joueur cumule
    plusieurs parties en parallèle.
    """
    # Normalisation : user_id est toujours stocké comme string pour éviter
    # les mismatchs de comparaison (int vs str) lors du settle.
    user_id = str(user_id)

    game_token = secrets.token_urlsafe(32)
    session_id = secrets.token_hex(16)

    try:
        redis = await get_redis()
    except Exception:
        return {"success": False, "error": "redis_unavailable"}

    # Réservation atomique du slot "une seule session active à la fois"
    try:
        reserved = await redis.eval(
            ACTIVE_SESSION_SCRIPT,
            1,
            f"{ACTIVE_SESSION_PREFIX}{user_id}",
            game_token,
            GAME_SESSION_TTL,
            GAME_SESSION_PREFIX,
        )
    except Exception:
        return {"success": False, "error": "redis_unavailable"}

    if reserved != 1:
        return {"success": False, "error": "session_already_active"}

    data = {
        "session_id": session_id,
        "user_id": user_id,
        "bet": bet,
        "game_name": game_name,
        "cote": COTE,
        "gains": bet * COTE,
        "status": "pending",  # pending | win | loss
        "last_nonce": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        await redis.setex(
            f"{GAME_SESSION_PREFIX}{game_token}",
            GAME_SESSION_TTL,
            json.dumps(data),
        )
    except Exception:
        # On libère le slot réservé puisque la session n'a pas pu être écrite
        try:
            await redis.delete(f"{ACTIVE_SESSION_PREFIX}{user_id}")
        except Exception:
            pass
        return {"success": False}

    return {
        "session_id": session_id,
        "token": game_token,
        "success": True,
    }


async def touch_game_session(game_token: str, user_id: str | None = None) -> None:
    """
    Renouvelle le TTL d'une session de jeu (et de son slot
    active_session associé si user_id est fourni) à GAME_SESSION_TTL.

    À appeler à chaque fois qu'un joueur "reprend" une session déjà
    existante — via get_active_session (reused=True côté /api/cherif)
    ou via la validation WS (game_session/bind_session) — pour lui
    donner une fenêtre pleine à partir du moment où il commence
    réellement à jouer, au lieu de laisser le TTL continuer son
    compte à rebours depuis la création d'origine. Sans ça, une
    session reprise après un long moment d'inactivité (popups de
    mise/objectif, page rechargée) peut expirer silencieusement en
    plein milieu d'une partie qui vient tout juste de démarrer.
    """
    redis = await get_redis()

    try:
        await redis.expire(f"{GAME_SESSION_PREFIX}{game_token}", GAME_SESSION_TTL)
    except Exception:
        pass

    if user_id:
        try:
            await redis.expire(f"{ACTIVE_SESSION_PREFIX}{str(user_id)}", GAME_SESSION_TTL)
        except Exception:
            pass


async def get_active_session(user_id: str) -> dict | None:
    """
    Retourne la session active en cours pour ce user_id (s'il y en a
    une), y compris son game_token, session_id et game_name.

    À utiliser côté route de mise (ex: /api/cherif) AVANT de débiter
    et d'appeler create_game_session : si une session active existe
    déjà (ex: le joueur a rechargé la page en pleine partie), il faut
    la lui renvoyer directement plutôt que de le bloquer jusqu'à
    expiration du TTL, ou pire, le débiter une seconde fois pour une
    nouvelle session qui de toute façon serait refusée.

    Renvoie None si aucune session active, ou si la référence stockée
    pointait vers une session qui n'existe déjà plus (TTL expiré).

    Le TTL est rafraîchi ici (touch_game_session) : une session
    reprise obtient une fenêtre complète plutôt que de continuer un
    compte à rebours entamé pendant que le joueur n'était pas en
    train de jouer.

    Une session reprise (reused) redémarre aussi son compteur
    anti-replay (last_nonce remis à 0 via RESUME_SESSION_SCRIPT) :
    le client va rouvrir une connexion WS et recompter son propre
    nonce depuis 1, donc côté serveur last_nonce doit repartir de 0
    lui aussi — sinon le premier message de la nouvelle connexion
    est rejeté comme rejoué. Ce reset est générique (fait ici, pas
    dans chaque serveur de jeu) : il s'applique à tous les jeux qui
    passent par get_active_session sans rien à modifier ailleurs.
    Il ne touche jamais "status" ni le verrouillage financier — le
    règlement des gains reste protégé indépendamment par
    SETTLE_LOCK_SCRIPT.
    """
    user_id = str(user_id)
    redis = await get_redis()

    game_token = await redis.get(f"{ACTIVE_SESSION_PREFIX}{user_id}")
    if not game_token:
        return None

    if isinstance(game_token, bytes):
        game_token = game_token.decode()

    key = f"{GAME_SESSION_PREFIX}{game_token}"

    try:
        code, raw_data = await redis.eval(RESUME_SESSION_SCRIPT, 1, key)
    except Exception:
        code, raw_data = -1, ""

    if code != 1:
        try:
            await redis.delete(f"{ACTIVE_SESSION_PREFIX}{user_id}")
        except Exception:
            pass
        return None

    session = json.loads(raw_data)

    await touch_game_session(game_token, user_id)

    session["token"] = game_token
    return session


async def get_session_by_token(game_token: str) -> dict | None:
    """
    Lecture publique d'une session par son token. Utilisée notamment
    pour vérifier l'appartenance (user_id) et le jeu (game_name)
    AVANT de laisser une partie démarrer côté serveur de jeu, plutôt
    que d'attendre le settle pour détecter un token volé/étranger.
    """
    redis = await get_redis()
    raw = await redis.get(f"{GAME_SESSION_PREFIX}{game_token}")
    return json.loads(raw) if raw else None


async def _delete_session_by_token(game_token: str):
    redis = await get_redis()
    await redis.delete(f"{GAME_SESSION_PREFIX}{game_token}")


async def verify_and_consume_nonce(game_token: str, nonce) -> bool:
    """
    Vérifie et consomme un nonce de manière atomique, directement dans
    Redis via un script Lua (voir NONCE_VERIFY_SCRIPT plus haut).

    Règles :
    - la session (game_token) doit exister dans Redis
    - nonce doit être convertible en entier
    - nonce doit être strictement supérieur au last_nonce déjà stocké
    """
    if not game_token:
        return False

    try:
        nonce = int(nonce)
    except (ValueError, TypeError):
        return False

    redis = await get_redis()
    key = f"{GAME_SESSION_PREFIX}{game_token}"

    try:
        result = await redis.eval(NONCE_VERIFY_SCRIPT, 1, key, nonce)
    except Exception:
        return False

    if result == 1:
        return True
    elif result == 0:
        return False
    else:  # -1
        return False


def _save_session_to_file(session: dict):
    """Archive la session réglée dans data/sessions/<user_id>.json"""
    os.makedirs(SESSIONS_DIR, exist_ok=True)
    path = os.path.join(SESSIONS_DIR, f"{session['user_id']}.json")

    history = []
    if os.path.exists(path):
        with open(path, "r") as f:
            try:
                history = json.load(f)
            except json.JSONDecodeError:
                history = []

    history.append(session)

    with open(path, "w") as f:
        json.dump(history, f, indent=2)


def get_last_session(user_id: str) -> dict | None:
    """
    Retourne la dernière session réglée (par settled_at) pour un user_id,
    en lisant l'historique archivé dans data/sessions/<user_id>.json.
    """
    user_id = str(user_id)
    path = os.path.join(SESSIONS_DIR, f"{user_id}.json")

    if not os.path.exists(path):
        return None

    with open(path, "r") as f:
        try:
            history = json.load(f)
        except json.JSONDecodeError:
            return None

    if not history:
        return None

    return max(history, key=lambda s: s.get("settled_at", ""))


async def settle_game_session(game_token: str, user_id: str, game_name: str, result: str) -> dict:
    """
    Règle une session (win/loss) de manière atomique.

    Le verrouillage (vérif appartenance + game_name + statut pending,
    puis bascule immédiate du statut) se fait en une seule opération
    Redis via SETTLE_LOCK_SCRIPT, AVANT tout appel à la base SQL.
    Ça garantit qu'un double appel concurrent (bug, retry réseau,
    double connexion) ne peut pas créditer deux fois le même gain :
    le second appel trouvera status != "pending" et sera rejeté.

    Si le crédit en base (add_gains) échoue APRÈS que le statut a
    déjà basculé sur "win" côté Redis, on tente de revenir en
    arrière (best effort) pour permettre un nouveau essai, plutôt
    que de laisser la session dans un état "win" jamais payé.

    Une fois le règlement confirmé (win ou loss), le résultat est
    aussi journalisé via log_game_result (game_helpers), en plus de
    l'archivage local dans data/sessions/<user_id>.json.
    """
    user_id = str(user_id)

    if result not in ("win", "loss"):
        return {"success": False}

    redis = await get_redis()
    key = f"{GAME_SESSION_PREFIX}{game_token}"

    try:
        code, raw_data = await redis.eval(
            SETTLE_LOCK_SCRIPT, 1, key, user_id, game_name, result
        )
    except Exception:
        return {"success": False}

    if code == -1:
        return {"success": False}
    if code == -2:
        return {"success": False}
    if code == -3:
        return {"success": False}
    if code == -4:
        return {"success": False}

    session = json.loads(raw_data)
    gains = 0
    has_won = result == "win"
    # Montant à journaliser : le gain crédité en cas de win, la mise
    # perdue en cas de loss.
    logged_amount = session["gains"] if has_won else session["bet"]

    if has_won:
        gains = session["gains"]
        new_solde = await add_gains(user_id, gains)
        if new_solde is None:
            try:
                session["status"] = "pending"
                await redis.set(key, json.dumps(session), keepttl=True)
            except Exception:
                pass
            return {"success": False}
        session["new_solde"] = new_solde

    session["settled_at"] = datetime.now(timezone.utc).isoformat()

    # Archivage local en best effort : si l'écriture du fichier échoue
    # (données non sérialisables, disque plein, etc.), ça ne doit
    # JAMAIS empêcher le nettoyage Redis ci-dessous — sinon la session
    # reste bloquée avec status="win"/"loss" pour toute la durée du
    # TTL restant, et /api/cherif la renverra comme "active" alors
    # qu'elle est en réalité déjà réglée (voir le bug Decimal corrigé
    # dans add_gains, qui provoquait exactement ce scénario).
    try:
        _save_session_to_file(session)
    except Exception:
        pass

    await _delete_session_by_token(game_token)

    try:
        await redis.delete(f"{ACTIVE_SESSION_PREFIX}{user_id}")
    except Exception:
        pass

    # Journalisation du résultat (best effort : un échec ici ne doit
    # pas annuler un règlement déjà confirmé et crédité/archivé).
    try:
        await log_game_result(
            user_id=int(user_id),
            has_won=has_won,
            amount=float(logged_amount),
            game_type=game_name,
        )
    except Exception:
        pass

    return {"success": True, "gains": gains}