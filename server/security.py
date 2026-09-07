from redis_session import session, get_session, get_redis
from quart import Blueprint, jsonify, request, abort, redirect, flash
from typing import Callable
from quart import websocket
from helper import FRONTEND_URL, SECRET_KEY
import time
import secrets
import functools
import hashlib
import jwt
import uuid
import hmac
import os
import json
import httpx
from functools import wraps
from datetime import datetime, timedelta,  timezone






#########################################################################################################################################"
#########################################################################################################################################
#########################################################################################################################################
#######################################Alghorithmes de Securiter backend  #############################################
#########################################################################################################################################
#########################################################################################################################################
#########################################################################################################################################




# =====================================================
# CSRF PROTECTION 
# =====================================================

CSRF_TTL = 3600  # 1h — durée de validité d'un token CSRF (plus long que le wari_token, réutilisable sur plusieurs actions)


# =====================================================
# SEED CSRF liée à la session du navigateur (cookie signé httponly)
# =====================================================
def get_or_create_csrf_seed() -> str:
    """Récupère (ou crée) un secret aléatoire propre à cette session.
    Stocké dans le cookie de session signé — un attaquant ne peut ni le lire
    ni le forger sans compromettre la clé de signature de session elle-même."""
    if "csrf_seed" not in session:
        session["csrf_seed"] = secrets.token_urlsafe(24)
    return session["csrf_seed"]


# =====================================================
# GÉNÉRATION token CSRF (stateless, expirant, lié à la session)
# =====================================================
def generate_csrf_token(csrf_seed: str) -> str:
    """Token = expiration + HMAC(seed de session + expiration).
    Aucun stockage serveur nécessaire : la validité se recalcule à la volée."""
    expires_at = int(time.time()) + CSRF_TTL
    payload = f"{csrf_seed}:{expires_at}"
    sig = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return f"{expires_at}.{sig}"


# =====================================================
# VALIDATION token CSRF
# =====================================================
def is_valid_csrf_token(token: str, csrf_seed: str) -> bool:
    """Vérifie l'expiration puis la signature. Sans le bon csrf_seed
    (propre à CETTE session), impossible de produire une signature valide —
    même si l'attaquant connaît le token en clair d'une autre session."""
    if not token or "." not in token:
        return False

    expires_at_str, sig = token.split(".", 1)
    try:
        expires_at = int(expires_at_str)
    except ValueError:
        return False

    if expires_at < int(time.time()):
        return False  # token expiré

    payload = f"{csrf_seed}:{expires_at}"
    expected = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig, expected)










# =====================================================
# SYSTEME DE WARI-TOKEN
# =====================================================


TOKEN_TTL = 60  # secondes — durée de validité d'une fenêtre de token


# =====================================================
# RÔLE DE CE SYSTÈME
# =====================================================
# Token anti-bot léger, entièrement stateless : sa validité se recalcule à
# chaque requête via HMAC (IP + fenêtre de temps de 60s + clé secrète).
# Rien n'est stocké côté serveur : pas de dict en mémoire, pas de session,
# pas de user_id. Un token est valide s'il correspond au HMAC attendu pour
# la fenêtre actuelle ou la précédente — point.
# =====================================================


# =====================================================
# IP CLIENT (HTTP)
# =====================================================
def get_client_ip_http(request) -> str:
    """Récupère l'IP réelle du client même derrière un proxy."""
    headers = request.headers

    if "CF-Connecting-IP" in headers:
        return headers.get("CF-Connecting-IP")
    if "X-Forwarded-For" in headers:
        return headers.get("X-Forwarded-For").split(",")[0].strip()
    if request.remote_addr:
        return request.remote_addr
    return "0.0.0.0"


# =====================================================
# GÉNÉRATION wari_token
# =====================================================
def generate_wari_token(ip: str) -> str:
    """Génère un token lié à l'IP du client et à la fenêtre de temps courante."""
    time_window = int(time.time() / TOKEN_TTL)
    identity = f"ip:{ip}|{time_window}"
    return hmac.new(SECRET_KEY, identity.encode(), hashlib.sha256).hexdigest()


# =====================================================
# VALIDATION wari_token
# =====================================================
def is_valid_wari_token(token: str, ip: str) -> bool:
    """Vérifie le token par recalcul du HMAC — aucune donnée stockée,
    aucune consultation de session. Tolère la fenêtre actuelle et la
    précédente pour absorber le délai entre génération et vérification."""
    for offset in (0, -1):
        time_window = int(time.time() / TOKEN_TTL) + offset
        identity = f"ip:{ip}|{time_window}"
        expected = hmac.new(SECRET_KEY, identity.encode(), hashlib.sha256).hexdigest()
        if hmac.compare_digest(token, expected):
            return True
    return False


# =====================================================
# MIDDLEWARE
# =====================================================
async def get_current_wari_token_status(request) -> bool:
    """Renvoie True si le client a fourni un wari_token valide."""
    token = request.headers.get("X-Wari-Token")
    if not token:
        return False

    ip = get_client_ip_http(request)
    return is_valid_wari_token(token, ip)







# =====================================================
# CONFIG JWT
# =====================================================
# Le secret DOIT être fixe et persistant — jamais régénéré au chargement du module,
# sinon un simple restart (ou plusieurs workers) invalide/désynchronise tous les tokens.
# Génère-le UNE FOIS : python -c "import secrets; print(secrets.token_hex(32))"
# et mets-le dans une variable d'environnement, jamais en dur dans le code.
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_MINUTES = 15  # court, car pas de révocation possible avant expiration


# =====================================================
# GÉNÉRATION ACCESS TOKEN
# =====================================================
def generate_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        'user_id': user_id,
        'jti': str(uuid.uuid4()),  # identifiant unique — utile pour logs/debug
        'iat': now,
        'exp': now + timedelta(minutes=JWT_EXPIRY_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)









# =====================================================
# fingerprint_security.py — Détection de vol de session/JWT
# =====================================================
 

FINGERPRINT_MIN_LENGTH = 16  # visitorId FingerprintJS fait généralement 32-40 caractères


# =====================================================
# LIER le fingerprint à la session — appelé juste après un login/register réussi
# =====================================================
async def bind_fingerprint_to_session(fingerprint: str) -> bool:
    """Enregistre le fingerprint du client comme référence pour cette session.
    À appeler dans ta route de login, juste après avoir authentifié l'utilisateur."""
    if not fingerprint or len(fingerprint) < FINGERPRINT_MIN_LENGTH:
        return False

    redis_session = get_session()
    redis_session['fingerprint'] = fingerprint
    return True


# =====================================================
# VÉRIFIER le fingerprint courant contre celui enregistré en session
# =====================================================
def check_fingerprint(current_fingerprint: str | None, stored_fingerprint: str | None) -> str:
    """Retourne un statut plutôt qu'un booléen, pour logger précisément
    ce qui s'est passé : 'match', 'mismatch', 'missing', ou 'unbound'."""
    if not stored_fingerprint:
        return "unbound"  # session créée avant l'intégration, ou jamais liée — on laisse passer
    if not current_fingerprint:
        return "missing"  # le client n'a pas envoyé de fingerprint
    if hmac.compare_digest(stored_fingerprint, current_fingerprint):
        return "match"
    return "mismatch"


# =====================================================
# DÉCORATEUR : protège les routes HTTP sensibles (paiement, etc.)
# =====================================================
def require_fingerprint(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        current = request.headers.get('X-Fingerprint')
        redis_session = get_session()
        stored = redis_session.get('fingerprint')

        status = check_fingerprint(current, stored)

        if status == "mismatch":
            # Signal fort de vol de session : on détruit la session
            # pour forcer une reconnexion, plutôt qu'un ban définitif —
            # ça peut aussi être un faux positif (navigateur mis à jour, etc.)
            redis_session.clear()
            return jsonify({"error": "Session invalide, veuillez vous reconnecter"}), 401

        # "missing" et "unbound" : on laisse passer
        return await f(*args, **kwargs)
    return decorated_function


# =====================================================
# VÉRIFICATION pour le WebSocket (appelée depuis authenticate_websocket)
# =====================================================
async def check_websocket_fingerprint(current_fingerprint: str | None, session_id: str) -> bool:
    """Retourne True si OK (match ou unbound/missing tolérés),
    False si mismatch avéré — à appeler avec le session_id lu depuis websocket.cookies."""
    from redis_session import _load_session

    session_data = await _load_session(session_id) if session_id else {}
    stored = session_data.get('fingerprint')
    status = check_fingerprint(current_fingerprint, stored)

    return status != "mismatch"









# =====================================================
# Scoring IP renforcé et plus securiser 
# =====================================================


IP_SCORE_REQUIRED = 40
IP_CACHE_TTL = 60 * 60 * 6  # 6h — évite de re-consulter l'API à chaque requête
IP_CACHE_PREFIX = "ipscore:"

ABUSEIPDB_KEY = os.environ.get("ABUSEIPDB_KEY")  # à créer gratuitement sur abuseipdb.com

# IP réelles de ton reverse proxy (ngrok, nginx, Cloudflare...).
# Seules ces IP ont le droit de fournir un X-Forwarded-For — sinon on l'ignore.
TRUSTED_PROXY_IPS = set(
    filter(None, os.environ.get("TRUSTED_PROXY_IPS", "").split(","))
)

IP_REPUTATION = {
    'suspicious_ips': set(),
    'whitelist': set(),
    'blacklist': set(),
}


# =====================================================
# Récupération de la vraie IP client (résistante à la falsification)
# =====================================================
def resolve_client_ip(headers, remote_addr: str) -> str:
    """N'accepte X-Forwarded-For que si la requête vient bien de notre
    proxy de confiance (remote_addr). Sinon, remote_addr fait foi —
    plus fiable qu'un header que n'importe quel client peut forger."""
    if remote_addr in TRUSTED_PROXY_IPS:
        forwarded = headers.get('X-Forwarded-For')
        if forwarded:
            ip = forwarded.split(',')[0].strip()
            return ip
    return remote_addr


# =====================================================
# Consultation AbuseIPDB (avec cache Redis pour économiser le quota)
# =====================================================
async def fetch_ip_reputation(ip: str) -> dict:
    redis = await get_redis()
    cache_key = f"{IP_CACHE_PREFIX}{ip}"

    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    result = {"abuse_score": 0, "is_vpn_or_proxy": False}

    if ABUSEIPDB_KEY:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    params={"ipAddress": ip, "maxAgeInDays": 90},
                    headers={"Key": ABUSEIPDB_KEY, "Accept": "application/json"},
                )
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    result = {
                        "abuse_score": data.get("abuseConfidenceScore", 0),
                        "is_vpn_or_proxy": bool(data.get("isTor")) or data.get("usageType") in
                            ("Data Center/Web Hosting/Transit", "Fixed Line ISP" if False else ""),
                    }
        except (httpx.TimeoutException, httpx.HTTPError):
            # API indisponible : on ne bloque pas l'utilisateur pour une panne externe,
            # on retombe sur le comportement par défaut (score neutre)
            pass

    await redis.setex(cache_key, timedelta(seconds=IP_CACHE_TTL), json.dumps(result))
    return result


# =====================================================
# Calcul du score final
# =====================================================
async def calculate_ip_score(ip: str) -> int:
    if ip in IP_REPUTATION['blacklist']:
        return 0
    if ip in IP_REPUTATION['whitelist']:
        return 100

    score = 100

    if ip in IP_REPUTATION['suspicious_ips']:
        score -= 50

    reputation = await fetch_ip_reputation(ip)
    score -= reputation["abuse_score"]  # 0-100, directement proportionnel au risque connu
    if reputation["is_vpn_or_proxy"]:
        score -= 20

    return max(0, score)


#########################################################################################################################################"
#########################################################################################################################################
#########################################################################################################################################
####################################Decorateur de Protection des routes http et ws  #############################################
#########################################################################################################################################
#########################################################################################################################################
#########################################################################################################################################




# =====================================================
# DECORATEUR DE DE VERIFICATION ET VALIDATION DORIGINE
# ORIGINES AUTORISÉES — production uniquement, aucune détection d'environnement
# =====================================================
ALLOWED_ORIGINS = {
    "https://wariplay.online",
    "https://dares-exert-rhyme.ngrok-free.dev",
}


def require_origin(func: Callable):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        origin = request.headers.get("Origin", "")
        referer = request.headers.get("Referer", "")

        origin_ok = origin in ALLOWED_ORIGINS
        referer_ok = any(referer.startswith(o + "/") or referer == o for o in ALLOWED_ORIGINS)

        if not (origin_ok or referer_ok):
            abort(403, description="Accès refusé : domaine non autorisé.")

        return await func(*args, **kwargs)
    return wrapper






# =====================================================
# DÉCORATEUR : protection CSRF
# =====================================================
def require_csrf(f):
    """Décorateur pour protéger les routes contre les attaques CSRF."""
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if request.path.startswith('/ws/'):
            return await f(*args, **kwargs)  # Ignore les WebSockets

        if request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
            csrf_token = request.headers.get('X-CSRF-Token')
            csrf_seed = session.get("csrf_seed") if session else None

            if not csrf_seed or not is_valid_csrf_token(csrf_token, csrf_seed):
                return {"error": "Invalid or missing CSRF token"}, 403

        return await f(*args, **kwargs)
    return decorated_function







# =====================================================
# DÉCORATEUR DE PROTECTION Wari-token
# =====================================================
def require_valid_session(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if request.path.startswith('/ws/'):
            return await f(*args, **kwargs)  # Passe à travers pour les WebSockets

        # 1️⃣ Récupérer le token (header prioritaire, sinon session)
        wari_token = request.headers.get("X-Wari-Token")
        if not wari_token:
            wari_token = session.get("wari_token") if session else None

        ip = get_client_ip_http(request)

        # 2️⃣ Valider le token ; en générer un nouveau si absent/invalide
        if not wari_token or not is_valid_wari_token(wari_token, ip):
            wari_token = generate_wari_token(ip)
            session["wari_token"] = wari_token

        # 3️⃣ Passe le token au handler (utile si le handler doit le renvoyer au client)
        kwargs['wari_session'] = wari_token
        return await f(*args, **kwargs)

    return decorated_function






# =====================================================
# DÉCORATEUR POUR PROTÉGER LES ROUTES AVEC JWT
# =====================================================
def require_jwt(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if request.path.startswith('/ws/'):
            return await f(*args, **kwargs)  # laisse passer — l'auth WS a son propre flux

        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return {"error": "Token requis"}, 401
        token = auth_header[len('Bearer '):]

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return {"error": "Token expiré"}, 401
        except jwt.InvalidTokenError:
            return {"error": "Token invalide"}, 401

        request.user_id = payload['user_id']
        return await f(*args, **kwargs)
    return decorated_function





# ============================================================================
# DÉCORATEUR : protège les routes HTTP sensibles (paiement, etc.) Fingerprint
# ===========================================================================
def require_fingerprint(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        current = request.headers.get('X-Fingerprint')
        redis_session = get_session()
        stored = redis_session.get('fingerprint')

        status = check_fingerprint(current, stored)

        if status == "mismatch":
            # Signal fort de vol de session : on détruit la session
            # pour forcer une reconnexion, plutôt qu'un ban définitif —
            # ça peut aussi être un faux positif (navigateur mis à jour, etc.)
            print(f"[FINGERPRINT] Mismatch détecté — session détruite (user_id={redis_session.get('user_id')})")
            redis_session.clear()
            return jsonify({"error": "Session invalide, veuillez vous reconnecter"}), 401

        # "missing" et "unbound" : on laisse passer mais on pourrait
        # logger ces cas pour surveiller leur fréquence si besoin
        return await f(*args, **kwargs)
    return decorated_function







# =====================================================
# DÉCORATEUR : sécurité IP - supporte HTTP et WebSocket
# =====================================================
def require_ip_score(f):
    @wraps(f)
    async def decorated(*args, **kwargs):
        try:
            from quart import websocket as ws_ctx
            ip = resolve_client_ip(ws_ctx.headers, ws_ctx.remote_addr)
        except RuntimeError:
            ip = resolve_client_ip(request.headers, request.remote_addr)

        score = await calculate_ip_score(ip)

        if score < IP_SCORE_REQUIRED:
            return jsonify({
                "error": "IP non autorisée",
                "score": score,
                "required": IP_SCORE_REQUIRED
            }), 403  # IP non renvoyée au client — évite de confirmer qu'on la traque précisément

        return await f(*args, **kwargs)
    return decorated









# =====================================================
# rate_limit.py — Rate limiting distribué via Redis
# =====================================================

RATE_LIMIT_MAX = 40
RATE_LIMIT_WINDOW = 60  # secondes

def rate_limit(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        try:
            from quart import websocket as ws_ctx
            remote_addr = resolve_client_ip(ws_ctx.headers, ws_ctx.remote_addr)
            path = ws_ctx.path
        except RuntimeError:
            remote_addr = resolve_client_ip(request.headers, request.remote_addr)
            path = request.path

        try:
            user_id = session.get('user_id') if session else None
        except RuntimeError:
            user_id = None

        key = str(user_id) if user_id else remote_addr
        if not key:
            return {"error": "Requête non identifiable"}, 400

        redis_key = f"ratelimit:{key}:{path}"
        redis = await get_redis()

        current_count = await redis.incr(redis_key)

        # Même correctif que pour check_ws_message_rate : on vérifie le TTL
        # réel à chaque appel plutôt que de supposer que count==1 signifie
        # "clé neuve" — élimine le risque de blocage permanent.
        ttl = await redis.ttl(redis_key)
        if ttl == -1:
            await redis.expire(redis_key, RATE_LIMIT_WINDOW)

        if current_count > RATE_LIMIT_MAX:
            ttl = await redis.ttl(redis_key)
            return {
                "error": "Trop de requêtes",
                "retry_after": max(ttl, 0)
            }, 429

        return await f(*args, **kwargs)
    return decorated_function



# =====================================================
# rate_limit.py — ajout : limite par message WebSocket
# =====================================================
WS_MESSAGE_RATE_MAX = 20      # ex: 20 actions par fenêtre
WS_MESSAGE_RATE_WINDOW = 10   # 10 secondes — à ajuster selon le rythme réel du jeu


async def check_ws_message_rate(user_id: int) -> bool:
    redis = await get_redis()
    redis_key = f"ratelimit:ws:{user_id}"

    current_count = await redis.incr(redis_key)

    # Vérifie le TTL réel à chaque appel plutôt que de supposer que
    # current_count == 1 signifie "clé neuve" — si jamais la clé existe
    # déjà sans TTL (bug, redémarrage, ancien code), on la corrige ici
    # au lieu de la laisser grossir indéfiniment.
    ttl = await redis.ttl(redis_key)
    if ttl == -1:
        await redis.expire(redis_key, WS_MESSAGE_RATE_WINDOW)

    return current_count <= WS_MESSAGE_RATE_MAX








# ==============================================================
# DÉCORATEUR  DE VERIFICATION DE CONNEXION POUR ROUTE HTTP SEUL
# ==============================================================


def login_required(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            await flash('Veuillez vous connecter pour accéder à cette page.', 'warning')
            return redirect(f'{FRONTEND_URL}/connexion')

        request.user_id = user_id
        return await f(*args, **kwargs)

    return decorated_function




# =====================================================
# DÉCORATEUR NE FAIT RIEN ET SERT A RIEN 
# =====================================================

def update_fingerprint_if_changed(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        return await f(*args, **kwargs)
    return decorated_function






# =====================================================
# DÉCORATEUR DE PROTECTION DES WS
# =====================================================

from redis_session import SESSION_COOKIE_NAME, _load_session

async def authenticate_websocket():
    """Authentifie un WebSocket et retourne user_id si réussi"""
    try:
        data = await websocket.receive_json()
        
        if data.get('type') != 'auth':
            await websocket.close(1008, 'Auth required first')
            return None
        

        # 1. Vérifier JWT
        token = data.get('jwt')
        if not token:
            await websocket.close(1008, 'JWT required')
            return None

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get('user_id')
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            await websocket.close(1008, 'Invalid JWT')
            return None
        
        # 2. Vérifier fingerprint (détection vol de session — comparaison
        # avec le fingerprint enregistré en session au login, pas une DB séparée)
        session_id = websocket.cookies.get(SESSION_COOKIE_NAME)
        fingerprint = data.get('fingerprint')
        if session_id and not await check_websocket_fingerprint(fingerprint, session_id):
            await websocket.close(1008, 'Fingerprint mismatch')
            return None
        
        # 3. Vérifier CSRF (session chargée manuellement depuis Redis —
        # le before_request HTTP ne s'exécute pas sur les WebSockets)
        csrf_token = data.get('csrf')
        if csrf_token:
            session_data = await _load_session(session_id) if session_id else {}
            csrf_seed = session_data.get("csrf_seed")
            if not csrf_seed or not is_valid_csrf_token(csrf_token, csrf_seed):
                await websocket.close(1008, 'Invalid CSRF')
                return None
        
        # 4. Vérifier Wari Token (HMAC stateless — aucune consultation de store)
        wari_token = data.get('wari')
        if wari_token:
            ip = get_client_ip_http(websocket)
            if not is_valid_wari_token(wari_token, ip):
                await websocket.close(1008, 'Invalid Wari token')
                return None
        
        # 5. Vérifier le score IP (même logique que require_ip_score,
        # appelée ici directement car le décorateur HTTP ne couvre pas
        # le message 'auth' envoyé après l'upgrade WebSocket)
        client_ip = resolve_client_ip(websocket.headers, websocket.remote_addr)
        ip_score = await calculate_ip_score(client_ip)
        if ip_score < IP_SCORE_REQUIRED:
            await websocket.close(1008, 'IP non autorisée')
            return None
        
        await websocket.send_json({'type': 'auth_success'})
        return user_id
        
    except Exception as e:
        await websocket.close(1011, 'Auth error')
        return None








#########################################################################################################################################"
#########################################################################################################################################
#########################################################################################################################################
####################################Routes de recuperation des token de securiter  #############################################
#########################################################################################################################################
#########################################################################################################################################
#########################################################################################################################################



# =====================================================
# ROUTE : obtenir un wari_token
# =====================================================

wari_token_init_bp = Blueprint("wari_token_init", __name__)

@wari_token_init_bp.route('/api/wari-token/init', methods=['GET'])
@require_origin
@rate_limit
@require_ip_score
async def wari_token_init():
    """Route pour obtenir le token initial."""
    ip = get_client_ip_http(request)
    wari_tok = generate_wari_token(ip)

    return {
        "wari_tok": wari_tok
    }




# =====================================================
# ROUTE : valider un wari_token
# =====================================================

validate_wari_token_bp = Blueprint("validate_wari_token", __name__)

@validate_wari_token_bp.route('/api/wari-token/validate', methods=['POST'])
@require_origin
@require_csrf
@rate_limit
@require_ip_score
async def wari_token_validate():
    """Route pour valider/renouveler le token."""
    data = await request.get_json()
    client_token = data.get("wari_tok") if data else None

    if not client_token:
        return {"valid": False}, 400

    ip = get_client_ip_http(request)

    if not is_valid_wari_token(client_token, ip):
        return {
            "valid": False,
            "wari_tok": generate_wari_token(ip),
            "reason": "invalid_token"
        }

    return {
        "valid": True
    }






# =====================================================
# ROUTE : obtenir un token CSRF
# =====================================================

csfr_token_bp = Blueprint("csfr_token", __name__)

@csfr_token_bp.route('/api/csrf-token', methods=['GET'])
@require_origin
@require_valid_session
@rate_limit
@require_ip_score
async def get_csrf_token(wari_session):
    """Génère un token CSRF lié à la session courante du navigateur."""
    csrf_seed = get_or_create_csrf_seed()
    csrf_token = generate_csrf_token(csrf_seed)

    return {
        "csrf_token": csrf_token
    }





# =====================================================
# ROUTE : récupérer un nouveau JWT (login initial ET renouvellement)
# =====================================================

get_jwt_bp = Blueprint("get_jtw", __name__)

@get_jwt_bp.route('/api/get-jwt', methods=['GET'])
@require_origin
@login_required
@require_valid_session
@rate_limit
@require_ip_score
async def get_jwt(wari_session):
    """Appelée après login/register, et rappelée par le client
    quand son JWT expire — le cookie de session (Redis, révocable,
    httponly) fait office de justificatif à chaque fois, sans
    nécessiter de refresh token séparé."""
    user_id = session.get('user_id')
    if not user_id:
        return {"error": "Non authentifié"}, 401

    access_token = generate_access_token(user_id)

    return {
        "token": access_token,
        "expires_in": JWT_EXPIRY_MINUTES * 60,
    }



is_logged_in_bp = Blueprint("is_logged_in", __name__)

# =====================================================
# ROUTE : verifier si utilisteur est connecter 
# =====================================================
@is_logged_in_bp.route('/api/is_logged_in')
@require_valid_session
@require_origin
@require_csrf 
@rate_limit 
@require_ip_score
async def is_logged_in(wari_session):
    """Vérifie si l'utilisateur est connecté et retourne un statut sans user_id"""
    
    user_id = session.get('user_id')
    
    if user_id:
        return {
            "authenticated": True,
            "message": "Utilisateur connecté"
        }
    
    return {
        "authenticated": False,
        "message": "Non connecté"
    }, 401