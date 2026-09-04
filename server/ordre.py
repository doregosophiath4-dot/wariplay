
from quart import Blueprint, jsonify, websocket 
from security import require_origin, login_required, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_jwt, require_ip_score, update_fingerprint_if_changed, authenticate_websocket, check_ws_message_rate
from db import get_pool
from redis_session import session, get_redis
from datetime import datetime, timedelta
from helper import SECRET_KEY
import hmac
import hashlib
import os 
import json
import time
import asyncio



# =======================================
# ROUTES DES ELEMENTS DE LA PAGE ORDRE
# =======================================

get_other_products_bp = Blueprint("get_other_products", __name__)


@get_other_products_bp.route('/api/get-other-products', methods=["GET"])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_other_products(wari_session):
    try:
        pool = await get_pool()
        now = datetime.now()
        user_id = session.get("user_id")

        if not user_id:
            return jsonify({"error": "Utilisateur non connecté"}), 401

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:

                # --- Nettoyage Wari Wallet (plus vieux que 31 jours) ---
                date_31_days_ago = now - timedelta(days=31)
                await cursor.execute("""
                    SELECT purchase_date FROM product_purchases
                    WHERE user_id = %s AND product_name = %s
                    ORDER BY purchase_date DESC LIMIT 1
                """, (user_id, "Wari Wallet"))
                wari_wallet = await cursor.fetchone()

                if wari_wallet:
                    purchase_date = wari_wallet[0]
                    if purchase_date <= date_31_days_ago:
                        await cursor.execute("""
                            DELETE FROM game_settings
                            WHERE user_id = %s AND product_name = %s
                        """, (user_id, "Wari Wallet"))
                        await conn.commit()

                # --- Récupérer les achats de l'utilisateur ---
                await cursor.execute("""
                    SELECT id, user_id, product_name, purchase_date 
                    FROM product_purchases
                    WHERE user_id = %s
                """, (user_id,))
                purchases = await cursor.fetchall()

                result = []
                seen_products = set()

                for purchase_id, uid, product_name, purchase_date in purchases:

                    if product_name in seen_products:
                        continue
                    seen_products.add(product_name)

                    # --- Pass VIP 7 jours : uniquement vérification d'expiration ---
                    if product_name == "Pass VIP 7 jours":
                        expiration_time = purchase_date + timedelta(days=7)

                        if now >= expiration_time:
                            await cursor.execute(
                                "DELETE FROM product_purchases WHERE id = %s AND user_id = %s",
                                (purchase_id, user_id)
                            )
                            await cursor.execute("""
                                UPDATE game_settings 
                                SET product_name = 'Dino Run', vies = 0, duree_jours = 0, renewal = NULL
                                WHERE user_id = %s AND product_name = 'Dino Run'
                            """, (user_id,))
                            await conn.commit()
                            continue

                        # Toujours actif -> l'activation a déjà été faite à l'achat, on ne fait qu'afficher
                        await cursor.execute(
                            "SELECT image_path FROM products WHERE title = %s",
                            ("Pass VIP 7 jours",)
                        )
                        image_data = await cursor.fetchone()
                        image_url = image_data[0] if image_data else ""

                        result.append({
                            'product_name': product_name,
                            'image_url': image_url,
                            'id': product_name.replace(" ", "_").lower(),
                            'expires_at': expiration_time.isoformat()
                        })
                        continue

                    # --- Vies illimitées 24h : uniquement vérification d'expiration ---
                    if product_name == "Vies illimitées 24h":
                        expiration_time = purchase_date + timedelta(hours=24)

                        if now >= expiration_time:
                            await cursor.execute(
                                "DELETE FROM product_purchases WHERE id = %s AND user_id = %s",
                                (purchase_id, user_id)
                            )
                            await conn.commit()

                            await cursor.execute(
                                "SELECT id, renewal_start FROM game_settings WHERE user_id = %s",
                                (user_id,)
                            )
                            settings = await cursor.fetchall()
                            for setting_id, renewal_start in settings:
                                new_vies = 0 if renewal_start else 3
                                await cursor.execute(
                                    "UPDATE game_settings SET vies = %s WHERE id = %s AND user_id = %s",
                                    (new_vies, setting_id, user_id)
                                )
                            await conn.commit()
                            continue
                        # sinon toujours actif -> vies déjà à 1000000000 depuis l'achat, rien à refaire

                    # --- Vérif si produit pas déjà en games_pro ---
                    await cursor.execute(
                        "SELECT 1 FROM games_pro WHERE name = %s",
                        (product_name,)
                    )
                    if not await cursor.fetchone():
                        await cursor.execute(
                            "SELECT image_path FROM products WHERE title = %s",
                            (product_name,)
                        )
                        image_data = await cursor.fetchone()
                        if image_data:
                            product = {
                                'product_name': product_name,
                                'image_url': image_data[0],
                                'id': product_name.replace(" ", "_").lower()
                            }
                            if product_name == "Vies illimitées 24h":
                                product['expires_at'] = expiration_time.isoformat()
                            result.append(product)

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': 'Erreur interne'}), 500



game_settings_bp = Blueprint("game_settings", __name__)


@game_settings_bp.route('/api/game-settings', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_game_settings(wari_session):
    try:
        pool = await get_pool()
        current_time = datetime.now()

        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # 0. Initialiser le renewal si vies = 0 et renewal_start est NULL
                await cur.execute("""
                    SELECT id, product_name, renewal
                    FROM game_settings
                    WHERE vies = 0
                    AND renewal IS NOT NULL
                    AND renewal_start IS NULL
                """)
                needs_renewal = await cur.fetchall()

                for (game_id, product_name, renewal) in needs_renewal:
                    try:
                        await cur.execute("""
                            UPDATE game_settings
                            SET renewal_start = NOW()
                            WHERE id = %s
                        """, (game_id,))
                        await conn.commit()
                    except Exception as renewal_error:
                        await conn.rollback()

                # 1. Gestion des renewals expirés
                await cur.execute("""
                    SELECT gs.id, gs.product_name, gs.renewal, gs.renewal_start
                    FROM game_settings gs
                    WHERE gs.vies = 0 
                    AND gs.renewal IS NOT NULL
                    AND gs.renewal_start IS NOT NULL
                    AND gs.renewal_start + INTERVAL CAST(SUBSTRING_INDEX(gs.renewal, 'h', 1) AS SIGNED) HOUR <= NOW()
                """)
                expired_renewals = await cur.fetchall()

                for (game_id, product_name, renewal, renewal_start) in expired_renewals:
                    try:
                        await cur.execute("""
                            UPDATE game_settings 
                            SET vies = 3, 
                                renewal_start = NULL,
                                created_at = NOW()
                            WHERE id = %s
                        """, (game_id,))
                        await conn.commit()
                    except Exception as update_error:
                        await conn.rollback()

                # 2. Suppression des jeux expirés et leurs achats
                await cur.execute("""
                    SELECT id, product_name 
                    FROM game_settings 
                    WHERE created_at + INTERVAL duree_jours DAY <= NOW()
                """)
                expired_games = await cur.fetchall()

                for (game_id, product_name) in expired_games:
                    try:
                        await cur.execute("DELETE FROM product_purchases WHERE product_name = %s", (product_name,))
                        await cur.execute("DELETE FROM game_settings WHERE id = %s", (game_id,))
                        await conn.commit()
                    except Exception as delete_error:
                        await conn.rollback()

                # 3. Récupération des jeux actifs
                await cur.execute("""
                    SELECT id, product_name, image_url, vies, duree_jours, renewal, renewal_start, created_at 
                    FROM game_settings
                    WHERE user_id = %s
                """, (session.get('user_id'),))
                result = await cur.fetchall()

        # --- Construction des jeux ---
        games = []
        for (id, product_name, image_url, vies, duree_jours, renewal, renewal_start, created_at) in result:
            try:
                created_at = created_at if isinstance(created_at, datetime) else datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
                end_time = created_at + timedelta(days=duree_jours)
                remaining_seconds = int((end_time - current_time).total_seconds())

                renewal_timestamp = None
                renewal_remaining = 0

                if vies == 0 and renewal and renewal_start:
                    renewal_hours = int(renewal.replace('h', ''))
                    if not isinstance(renewal_start, datetime):
                        renewal_start = datetime.strptime(renewal_start, '%Y-%m-%d %H:%M:%S')
                    renewal_end = renewal_start + timedelta(hours=renewal_hours)
                    renewal_timestamp = int(renewal_end.timestamp())
                    renewal_remaining = max(0, int((renewal_end - current_time).total_seconds()))

                games.append({
                    'id': id,
                    'product_name': product_name,
                    'image_url': image_url or 'default-icon.jpg',
                    'vies': vies,
                    'renewal': renewal,
                    'end_timestamp': int(end_time.timestamp()),
                    'remaining_seconds': max(0, remaining_seconds),
                    'renewal_timestamp': renewal_timestamp,
                    'renewal_remaining': renewal_remaining,
                    'renewal_started': renewal_start is not None if vies == 0 else None
                })
            except Exception as game_error:
                continue

        return jsonify({
            'success': True,
            'games': games,
            'server_time': current_time.isoformat(),
            'refresh_interval': 30
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Erreur interne',
            'message': 'Erreur lors de la récupération des jeux'
        }), 500



niveaux_utilisateur_bp = Blueprint("niveaux_utilisateur", __name__)

@niveaux_utilisateur_bp.route('/api/niveaux-utilisateur', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_niveaux_achetes(wari_session):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT b.niveau, b.benefice, b.taux, a.vies, a.duree, a.renouvellement
                    FROM achats a
                    JOIN benef b ON a.produit = b.niveau
                    WHERE a.user_id = %s
                """, (user_id,))
                
                data = await cursor.fetchall()

        # --- Préparer le résultat ---
        result = []
        for row in data:
            niveau, benefice, taux, vies, duree, renouvellement = row

            # Formater renouvellement
            if isinstance(renouvellement, datetime):
                renouvellement = renouvellement.strftime("%Y-%m-%d %H:%M:%S")

            # Nettoyer durée (ex: "10jours" -> "10")
            duree_clean = ''.join([c for c in str(duree) if c.isdigit()])

            result.append({
                'niveau': niveau,
                'benefice': benefice,
                'taux': taux,
                'vies': vies,
                'duree': duree_clean,
                'renouvellement': renouvellement
            })

        return jsonify({'success': True, 'data': result}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': 'Erreur serveur'}), 500




temps_restant_bp = Blueprint("temps_restant", __name__)


@temps_restant_bp.route('/api/temps-restant', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def temps_restant(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT id, produit, duree, created_at
                    FROM achats
                    WHERE user_id = %s
                """, (user_id,))
                achats = await cur.fetchall()

                result = []
                now = datetime.now()

                for achat_id, produit, duree, created_at in achats:
                    # Extraction de la durée en jours (par défaut 10)
                    jours = 10
                    if duree:
                        try:
                            jours = int(''.join(filter(str.isdigit, duree)))
                        except ValueError:
                            jours = 10

                    # Conversion de la date si nécessaire
                    if isinstance(created_at, str):
                        created_at = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')

                    # Calcul de la fin et du temps restant
                    end_time = created_at + timedelta(days=jours)
                    remaining = end_time - now

                    if remaining.total_seconds() <= 0:
                        # Suppression des achats expirés
                        await cur.execute("DELETE FROM achats WHERE id = %s", (achat_id,))
                        continue

                    # Formatage du temps restant
                    j = remaining.days
                    h, rem = divmod(remaining.seconds, 3600)
                    m = rem // 60
                    temps_restant_str = f"{j}j {h}h {m}min" if j > 0 else f"{h}h {m}min"

                    result.append({
                        'niveau': produit,
                        'temps_restant': temps_restant_str,
                        'expire_le': end_time.strftime('%Y-%m-%d %H:%M:%S')
                    })

                await conn.commit()  # commit suppression si nécessaire
                return jsonify(result)

    except Exception as e:
        return jsonify({'error': f"Erreur de calcul du temps restant"}), 500



renouvellement_temps_bp = Blueprint("renouvellement_temps", __name__)


@renouvellement_temps_bp.route('/api/renouvellement-temps', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_renouvellement_time(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # 1. Sélectionner les achats où vies = 0
                await cur.execute("""
                    SELECT id, produit, start_time, renouvellement, vies
                    FROM achats 
                    WHERE user_id = %s AND vies = 0
                """, (user_id,))
                rows = await cur.fetchall()

                results = []
                now = datetime.now()

                for achat_id, produit, start_time, renouvellement, vies in rows:
                    # Extraction du nombre d'heures
                    try:
                        nb_heures = int(renouvellement.replace('h', ''))
                    except Exception:
                        nb_heures = 24  # valeur par défaut

                    total_seconds = nb_heures * 3600

                    # 2. Si start_time est NULL, on l'initialise à maintenant
                    if start_time is None:
                        start_time = now
                        await cur.execute("""
                            UPDATE achats
                            SET start_time = %s
                            WHERE id = %s
                        """, (start_time, achat_id))

                    # 3. Calcul du temps restant
                    next_time = start_time + timedelta(hours=nb_heures)
                    remaining = next_time - now

                    # 4. Si le temps est écoulé, remettre vies à 3 et start_time à NULL
                    if remaining.total_seconds() <= 0:
                        await cur.execute("""
                            UPDATE achats
                            SET vies = 3, start_time = NULL
                            WHERE id = %s
                        """, (achat_id,))
                        remaining = timedelta(seconds=0)

                    results.append({
                        'niveau': produit,
                        'remaining_seconds': int(remaining.total_seconds()),
                        'total_seconds': total_seconds
                    })

                await conn.commit()  # commit pour toutes les mises à jour
                return jsonify(results)

    except Exception as e:
        return jsonify({'error': f"Erreur serveur"}), 500

# ----------------------------------------------
# SYSTEME DE JEU DE WARI LEVEL (LES NIVEAUX)
# -----------------------------------------------

# Configuration
QUESTIONS_JSON = "html 1/lang/cherif.json"
TEMPS_PAR_QUESTION = 13
MAX_QUESTIONS = 3
WERI_TOKEN_VALIDITY = 600  # 10 minutes
QUESTIONS_PAR_RECHARGEMENT = 200

questions_memoire = {}


def weri_generate_token(user_id, niveau):
    timestamp = int(time.time())
    payload = f"weri:{user_id}:{niveau}:{timestamp}"
    token = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return token, timestamp

def weri_verify_token(user_id, niveau, token, timestamp):
    if not token or not timestamp:
        return False
    if abs(time.time() - timestamp) > WERI_TOKEN_VALIDITY:
        return False
    payload = f"weri:{user_id}:{niveau}:{timestamp}"
    expected = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, token)

def charger_questions_json():
    """Charge toutes les questions depuis le fichier JSON au démarrage"""
    if not os.path.exists(QUESTIONS_JSON):
        return {}
    with open(QUESTIONS_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

def recharger_categorie(categorie, toutes_questions):
    """Recharge 200 questions aléatoires pour une catégorie donnée en mémoire"""
    global questions_memoire
    
    if categorie not in toutes_questions or not toutes_questions[categorie]:
        questions_memoire[categorie] = []
        return
    
    # Sélection aléatoire de 200 questions (ou moins si pas assez)
    import random
    questions_disponibles = toutes_questions[categorie][:]
    if len(questions_disponibles) > QUESTIONS_PAR_RECHARGEMENT:
        questions_selectionnees = random.sample(questions_disponibles, QUESTIONS_PAR_RECHARGEMENT)
    else:
        questions_selectionnees = questions_disponibles[:]
    
    questions_memoire[categorie] = questions_selectionnees

def obtenir_question_memoire(categorie, toutes_questions):
    """Obtient une question de la mémoire, recharge si nécessaire"""
    global questions_memoire
    
    # Si la catégorie n'existe pas en mémoire ou est vide, recharger
    if categorie not in questions_memoire or not questions_memoire[categorie]:
        recharger_categorie(categorie, toutes_questions)
    
    if not questions_memoire.get(categorie):
        return None
    
    # Retirer et retourner la dernière question (pour éviter les doublons immédiats)
    return questions_memoire[categorie].pop()

# Chargement initial au démarrage du serveur
toutes_questions_source = charger_questions_json()
CATEGORIES = ["sport", "art", "histoire", "musique", "litterature", "science", "geographie", "cinema", "cuisine", "politique", "monde"]

# Préchargement initial de 200 questions par catégorie
for cat in CATEGORIES:
    recharger_categorie(cat, toutes_questions_source)



# =====================================================
# wari_level_session.py — Sessions Wari Level dans Redis (TTL 20 min)
# =====================================================

WARI_LEVEL_SESSION_PREFIX = "wari_level_session:"
WARI_LEVEL_SESSION_TTL = 60 * 20  # 20 minutes


async def create_wari_level_session(user_id, state: dict):
    redis = await get_redis()
    await redis.setex(
        f"{WARI_LEVEL_SESSION_PREFIX}{user_id}",
        timedelta(seconds=WARI_LEVEL_SESSION_TTL),
        json.dumps(state),
    )


async def get_wari_level_session(user_id) -> dict | None:
    redis = await get_redis()
    raw = await redis.get(f"{WARI_LEVEL_SESSION_PREFIX}{user_id}")
    return json.loads(raw) if raw else None


async def update_wari_level_session(user_id, state: dict):
    """Réécrit l'état complet et renouvelle le TTL à 20 min —
    tant que le joueur répond, sa partie ne doit pas expirer."""
    await create_wari_level_session(user_id, state)


async def delete_wari_level_session(user_id):
    redis = await get_redis()
    await redis.delete(f"{WARI_LEVEL_SESSION_PREFIX}{user_id}")



ws_wari_level_bp = Blueprint("ws_wari_level", __name__)

@ws_wari_level_bp.websocket("/ws/wari-level")
async def ws_wari_level():
    """WebSocket pour le jeu Wari Level avec authentification intégrée"""
    user_id = await authenticate_websocket()
    
    if not user_id:
        return
    
    pool = await get_pool()

    try:
        while True:
            msg = await websocket.receive_json()

            if not await check_ws_message_rate(user_id):
                await websocket.send_json({
                    "success": False,
                    "message": "Trop d'actions, ralentis un peu."
                })
                continue

            action = msg.get("action")

            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:

                    if action == "start_game":
                        niveau = msg.get("niveau")
                        
                        await cursor.execute(
                            "SELECT vies FROM achats WHERE user_id=%s AND produit=%s",
                            (user_id, niveau)
                        )
                        row = await cursor.fetchone()
                        
                        if not row or int(row[0]) <= 0:
                            await websocket.send_json({"success": False, "message": "Jeu impossible"})
                            continue

                        vies = int(row[0])
                        
                        await cursor.execute(
                            "SELECT benefice FROM benef WHERE niveau=%s",
                            (niveau,)
                        )
                        benefice_row = await cursor.fetchone()
                        
                        if not benefice_row:
                            await websocket.send_json({"success": False, "message": "Bénéfice introuvable"})
                            continue
                            
                        benefice = int(benefice_row[0])
                        gain_unitaire = benefice // (vies if vies >= 3 else 3)

                        token, timestamp = weri_generate_token(user_id, niveau)

                        state = {
                            "niveau": niveau,
                            "gain_unitaire": gain_unitaire,
                            "gain_total": 0,
                            "question_count": 0,
                            "token": token,
                            "timestamp": timestamp
                        }
                        await create_wari_level_session(user_id, state)

                        await websocket.send_json({
                            "success": True,
                            "gainUnitaire": gain_unitaire,
                            "temps": TEMPS_PAR_QUESTION,
                            "vies": vies,
                            "token": token,
                            "timestamp": timestamp
                        })

                    elif action == "get_question":
                        categorie = msg.get("categorie")
                        token = msg.get("token")
                        timestamp = msg.get("timestamp")
                        state = await get_wari_level_session(user_id)

                        if not state or not weri_verify_token(user_id, state["niveau"], token, timestamp):
                            await websocket.send_json({"success": False, "message": "Token invalide"})
                            continue

                        if state["question_count"] >= MAX_QUESTIONS:
                            await websocket.send_json({"fin": True, "gainTotal": state["gain_total"]})
                            await delete_wari_level_session(user_id)
                            continue

                        global toutes_questions_source
                        question_data = obtenir_question_memoire(categorie, toutes_questions_source)
                        
                        if not question_data:
                            await websocket.send_json({"success": False, "message": "Aucune question disponible"})
                            continue

                        question = question_data["question"]
                        reponse = question_data["reponse"]

                        state["question_count"] += 1
                        state["reponse"] = bool(reponse)
                        state["deadline"] = asyncio.get_event_loop().time() + TEMPS_PAR_QUESTION
                        await update_wari_level_session(user_id, state)

                        await websocket.send_json({
                            "question": question, 
                            "numero": state["question_count"]
                        })

                    elif action == "answer":
                        token = msg.get("token")
                        timestamp = msg.get("timestamp")
                        reponse_utilisateur = msg.get("reponse")
                        state = await get_wari_level_session(user_id)

                        if not state or "deadline" not in state or not weri_verify_token(user_id, state["niveau"], token, timestamp):
                            await websocket.send_json({"success": False, "message": "Token invalide"})
                            continue

                        now = asyncio.get_event_loop().time()
                        correct = reponse_utilisateur == state["reponse"] and now <= state["deadline"]

                        if correct:
                            state["gain_total"] += state["gain_unitaire"]
                            await cursor.execute(
                                "UPDATE solde SET solde = solde + %s WHERE user_id=%s",
                                (state["gain_unitaire"], user_id)
                            )

                        await cursor.execute(
                            "UPDATE achats SET vies=vies-1 WHERE user_id=%s AND produit=%s AND vies>0",
                            (user_id, state["niveau"])
                        )

                        await cursor.execute(
                            "SELECT vies FROM achats WHERE user_id=%s AND produit=%s",
                            (user_id, state["niveau"])
                        )
                        vies_row = await cursor.fetchone()
                        vies_restantes = int(vies_row[0]) if vies_row else 0

                        bonnes = 1 if correct else 0
                        mauvaises = 0 if correct else 1
                        total = 1

                        await cursor.execute("""
                            INSERT INTO stats_niveau (user_id, niveau, bonnes, mauvaises, total)
                            VALUES (%s,%s,%s,%s,%s)
                        """, (user_id, state["niveau"], bonnes, mauvaises, total))

                        await cursor.execute("""
                            INSERT INTO stats_globales (user_id, bonnes, mauvaises, total)
                            VALUES (%s, %s, %s, %s) AS new
                            ON DUPLICATE KEY UPDATE
                                stats_globales.bonnes = stats_globales.bonnes + new.bonnes,
                                stats_globales.mauvaises = stats_globales.mauvaises + new.mauvaises,
                                stats_globales.total = stats_globales.total + new.total
                        """, (user_id, bonnes, mauvaises, total))

                        await conn.commit()

                        fin = vies_restantes <= 0 or state["question_count"] >= MAX_QUESTIONS

                        await websocket.send_json({
                            "correct": correct,
                            "gainUnitaire": state["gain_unitaire"] if correct else 0,
                            "gainTotal": state["gain_total"],
                            "vies": vies_restantes,
                            "fin": fin
                        })

                        if fin:
                            await delete_wari_level_session(user_id)
                        else:
                            await update_wari_level_session(user_id, state)

                    else:
                        await websocket.send_json({"success": False, "message": f"Action inconnue: {action}"})

    except Exception as e:
        if user_id:
            await delete_wari_level_session(user_id)
            
        try:
            await websocket.send_json({"success": False, "error": "Erreur serveur"})
        except:
            pass





