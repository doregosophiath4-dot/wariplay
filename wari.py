from __future__ import annotations
import os
import asyncio
import random
import string
import aiobcrypt
import aiofiles
import uuid
import hmac
import hashlib
import json
import httpx
import time
import io
import asyncio
import base64
import secrets
import subprocess
import sys
import traceback
import math
import smtplib
import re
import jwt
import datetime
import secrets
import copy
import time
from datetime import datetime, timedelta,  timezone
from functools import wraps
from decimal import Decimal
from difflib import SequenceMatcher
import bcrypt
import unicodedata
from urllib.parse import urlencode, quote, unquote
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from dateutil.parser import parse
from quart import Quart, request, jsonify, send_from_directory, g, request, redirect, make_response, url_for, abort, send_file,  websocket, Response, flash
from quart import websocket as ws_ctx
from quart_cors import cors
from redis_session import session, open_session, save_session, destroy_session, close_redis, get_session, get_redis
import asyncmy
import requests
import aiohttp
import redis.asyncio as redis
from asyncmy.cursors import DictCursor
from dotenv import load_dotenv
from typing import Optional, Tuple, Dict, Any
from asyncmy import errors
from async_timeout import timeout
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from decimal import Decimal, ROUND_HALF_UP
from contextlib import asynccontextmanager
from typing import Dict, List, Set, Optional, Tuple
from collections import defaultdict
from threading import Lock


# 🚫 Debug désactivé en production
DEBUG = False

# 🍪 Cookies sécurisés
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # nécessite HTTPS
REMEMBER_COOKIE_HTTPONLY = True
REMEMBER_COOKIE_SECURE = True
# ⏳ Durée de vie des sessions
PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
# 📜 Logging
LOG_LEVEL = "INFO"

load_dotenv()

# Charger les variables d'environnement
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")
RECAPTCHA_SECRET1 = os.getenv("RECAPTCHA_SECRET1")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")  # Nouvelle variable pour SendGrid
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
SERVER_SECRET = os.environ.get('GAME_SERVER_SECRET', 'default-secret-key')
FRONTEND_URL         = os.getenv("FRONTEND_URL")
BACKEND_URL          = os.getenv("BACKEND_URL")

# -------------------
# Configuration Quart
# -------------------
app = Quart(__name__)

app = cors(
    app,
    allow_origin=[
        "https://wariplay.online",
        "http://127.0.0.1:5000",
        "http://localhost",        # ← celui-là
        "http://localhost:3000",
        "https://distract-swab-culprit.ngrok-free.dev",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    allow_credentials=True,
    max_age=86400
)

# ── Désactiver totalement la session native Quart ─────────────────────────────
from quart.sessions import SessionInterface, NullSession

class DisabledSessionInterface(SessionInterface):
    async def open_session(self, app, request):
        return NullSession()
    async def save_session(self, app, session, response):
        pass

app.session_interface = DisabledSessionInterface()
# ─────────────────────────────────────────────────────────────────────────────

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)


# ========== CONFIGURATION MYSQL ==========
# Pool MySQL global
async def get_pool():
    if not hasattr(app, "db_pool"):
        app.db_pool = await asyncmy.create_pool(
            host="127.0.0.1",
            port=3306,  # ← Ajoutez cette ligne
            user="root",
            password="Dev1234",
            db="wariplay",
            autocommit=True
        )
    return app.db_pool


@app.before_serving
async def startup():
    print("✅ Serveur démarré")

@app.after_serving
async def shutdown():
    await close_redis()

@app.before_request
async def load_session():
    await open_session()

@app.after_request
async def persist_session(response):
    return await save_session(response)














# =====================================================
# CONSTANTES JWT
# =====================================================




















































def admin_only(f):
    """
    Décorateur qui vérifie si l'utilisateur est l'administrateur (user_id = 11).
    Redirige vers /home si ce n'est pas l'administrateur.
    
    Utilisation:
        @app.route('/admin/dashboard')
        @login_required
        @admin_only
        async def admin_dashboard():
            return await render_template('admin/dashboard.html')
    """
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        
        if user_id != 11 and str(user_id) != '11':
            await flash('Accès réservé à l\'administrateur.', 'error')  # ✅ await ajouté
            return redirect(f'{FRONTEND_URL}/home')
        
        return await f(*args, **kwargs)
    
    return decorated_function















async def check_game_exists(user_id: int, game_name: str) -> bool:
    """
    Vérifie si le jeu existe pour l'utilisateur en base de données.
    
    Args:
        user_id: L'ID de l'utilisateur
        game_name: Le nom du jeu (ex: 'Lettricide', 'GridPop')
    
    Returns:
        bool: True si le jeu existe pour l'utilisateur, False sinon
    """
    print(f"[CHECK_GAME] Vérification existence jeu '{game_name}' pour user {user_id}")
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence du jeu pour l'utilisateur
                await cur.execute("""
                    SELECT id
                    FROM game_settings
                    WHERE product_name = %s AND user_id = %s
                    LIMIT 1
                """, (game_name, user_id))
                
                result = await cur.fetchone()
                
                if result:
                    print(f"[CHECK_GAME] Jeu '{game_name}' trouvé pour user {user_id}")
                    return True
                else:
                    print(f"[CHECK_GAME] Jeu '{game_name}' NON trouvé pour user {user_id}")
                    return False
                    
    except Exception as e:
        print(f"[CHECK_GAME] Erreur lors de la vérification: {e}")
        return False
        















import functools
from typing import Callable
import os



@app.route('/stats')
async def stats(wari_session):
    if 'user_id' not in session:
        return redirect(f'{FRONTEND_URL}/connexion')

    user_id = session['user_id']
    pool = await get_pool()

    query = """
        SELECT COUNT(*) AS total
        FROM product_purchases
        WHERE user_id = %s
        AND product_name IN ('Badge Or Exclusif', 'Pass VIP 7 jours')
    """

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, (user_id,))
            result = await cur.fetchone()
            count = result[0] if result else 0  # ✅ Accès par index

    if count > 0:
        return await send_from_directory('html 1', 'stats.html')
    else:
        return redirect('/home')

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
SECRET_KEY = b"\x9f\x1c\xd3\xab\x8e\x01\xf4\xaa\xcf\x12\x9a\x84\xed\x88\x9b\x02\xad\x0f\x91\xce\x1e\xaa\x8c\xef\x90\x77\x1d\x0b\xaa\x5c\x33\x71"
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
    "https://distract-swab-culprit.ngrok-free.dev",
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
        # ── Détection du contexte (WS ou HTTP) et récupération de la vraie IP ──
        try:
            from quart import websocket as ws_ctx
            remote_addr = resolve_client_ip(ws_ctx.headers, ws_ctx.remote_addr)
            path = ws_ctx.path
        except RuntimeError:
            remote_addr = resolve_client_ip(request.headers, request.remote_addr)
            path = request.path

        # ── user_id si connecté, sinon IP ──
        try:
            user_id = session.get('user_id') if session else None
        except RuntimeError:
            user_id = None

        # Si ni user_id ni IP n'est disponible (cas extrême, proxy mal configuré),
        # on refuse par prudence plutôt que de laisser passer sans aucune limite.
        key = str(user_id) if user_id else remote_addr
        if not key:
            return {"error": "Requête non identifiable"}, 400

        redis_key = f"ratelimit:{key}:{path}"

        redis = await get_redis()

        # INCR est atomique côté Redis — élimine la race condition de la
        # version précédente (lire puis écrire n'était pas une seule opération).
        current_count = await redis.incr(redis_key)

        if current_count == 1:
            # Première requête de la fenêtre : on pose le TTL.
            # Fait juste après l'INCR pour rester au plus près de l'atomicité —
            # un crash entre les deux laisserait au pire une clé sans expiration,
            # nettoyée au prochain déploiement plutôt qu'une fuite silencieuse indéfinie.
            await redis.expire(redis_key, RATE_LIMIT_WINDOW)

        if current_count > RATE_LIMIT_MAX:
            # TTL restant, pour que le client sache combien de temps attendre
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
    """Retourne True si le message est autorisé, False si la limite est dépassée.
    À appeler à CHAQUE message reçu dans la boucle WebSocket, après l'auth initiale."""
    redis = await get_redis()
    redis_key = f"ratelimit:ws:{user_id}"

    current_count = await redis.incr(redis_key)
    if current_count == 1:
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

@app.route('/api/wari-token/init', methods=['GET'])
@require_origin
#@rate_limit
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

@app.route('/api/wari-token/validate', methods=['POST'])
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
@app.route('/api/csrf-token', methods=['GET'])
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
@app.route('/api/get-jwt', methods=['GET'])
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





# =====================================================
# ROUTE : verifier si utilisteur est connecter 
# =====================================================
@app.route('/api/is_logged_in')
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




#########################################################################################################################################"
#########################################################################################################################################
#########################################################################################################################################
################################################################  ROUTES GENERALE  WARIPLAY  #############################################
#########################################################################################################################################
#########################################################################################################################################
#########################################################################################################################################




# =====================================================
# INSCRIPTION / CONNEXION / RECEPERATION DE COMPTE
# =====================================================

SMTP_USERNAME = os.getenv("EMAIL_ADDRESS")
SMTP_PASSWORD = os.getenv("EMAIL_PASSWORD")

recovery_codes = {}

def send_email_sync(to_email, body, subject="Code de vérification"):
    msg = MIMEText(body, "html", "utf-8")
    msg["From"] = SMTP_USERNAME
    msg["To"] = to_email
    msg["Subject"] = subject

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(msg)

@app.route("/api/send-recovery-email", methods=["POST"])
@require_origin
@require_valid_session
@require_csrf 
@require_fingerprint
@rate_limit 
@require_ip_score
async def send_recovery_email(wari_session):
    try:
        data = await request.get_json()
        email_to = data.get("value")
        if not email_to:
            return jsonify({"success": False, "message": "Aucune valeur fournie"}), 400

        # Récupérer le user_id depuis la table users
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT id FROM users WHERE email=%s", (email_to,))
                user = await cur.fetchone()
                if not user:
                    return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
                user_id = user[0]

        # Génération du code et expiration
        code = str(random.randint(100000, 999999))
        expire_time = datetime.now() + timedelta(minutes=15)
        recovery_codes[email_to] = code

        # Corps HTML de l'email
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2d3748;">Bonjour,</h2>
                    <p>Nous avons reçu une demande de vérification pour votre compte. Voici votre code de sécurité :</p>
                    <div style="background: #f8f9fa; border: 1px dashed #e2e8f0; 
                             padding: 15px; text-align: center; margin: 20px 0; 
                             font-size: 24px; font-weight: bold; color: #4f46e5;">
                        {code}
                    </div>
                    <p>Ce code est valable pendant 15 minutes. Ne le partagez avec personne.</p>
                    <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email ou 
                       <a href="wariplay.online" style="color: #4f46e5;">nous contacter</a>.</p>
                    <p style="margin-top: 30px;">Cordialement,<br>
                    <strong>L'équipe de Wariplay.</strong></p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #718096;">
                        Pour des raisons de sécurité, ne répondez pas à cet email. 
                        © {datetime.now().year} [WariPlay]. Tous droits réservés.
                    </p>
                </div>
            </body>
        </html>
        """

        # Envoi de l'email dans un thread séparé
        await asyncio.to_thread(send_email_sync, email_to, body)

        # Insertion du code dans la base avec asyncmy
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO verification_gmail (user_id, code, expires_at)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE code=%s, expires_at=%s
                    """,
                    (user_id, code, expire_time, code, expire_time)
                )

        return jsonify({"success": True, "message": "Email envoyé "})

    except Exception as e:
        return jsonify({"success": False, "message": f"Erreur: {e}"})

recovery_codes = {}

@app.route('/api/verify-email-code', methods=['POST'])
@require_origin
@require_valid_session
@require_csrf 
@require_fingerprint
@rate_limit 
@require_ip_score
async def verify_email_codes(wari_session):
    try:
        data = await request.get_json()
        email_to = data.get('value')
        code_client = data.get('code')
        
        if not email_to or not code_client:
            return jsonify({"success": False, "message": "Données manquantes"}), 400

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM users WHERE email=%s", (email_to,))
                user = await cursor.fetchone()
                if not user:
                    return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
                user_id = user[0]

                await cursor.execute(
                    "SELECT code, expires_at FROM verification_gmail WHERE user_id=%s",
                    (user_id,)
                )
                result = await cursor.fetchone()
                if not result:
                    return jsonify({"success": False, "message": "Code inexistant ou déjà utilisé"}), 404

                code_db, expires_at = result
                if code_db != code_client:
                    return jsonify({"success": False, "message": "Code invalide"}), 400
                if expires_at < datetime.now():
                    return jsonify({"success": False, "message": "Code expiré"}), 400

                await cursor.execute(
                    "UPDATE users SET verify=1 WHERE id=%s",
                    (user_id,)
                )

        if email_to in recovery_codes:
            del recovery_codes[email_to]

        return jsonify({
            "success": True,
            "message": "Code vérifié avec succès"
        })

    except Exception as e:
        return jsonify({"success": False, "message": f"Erreur: {str(e)}"}), 500


@app.route('/api/update-password', methods=['POST'])
@require_origin
@require_valid_session
@require_csrf 
@require_fingerprint
@rate_limit 
@require_ip_score
async def update_passwords(wari_session):
    try:
        data = await request.get_json()
        email = data.get('email')
        new_password = data.get('new_password')

        if not email or not new_password:
            return jsonify({"success": False, "message": "Données manquantes"}), 400

        # --- Hashage du mot de passe avec bcrypt ---
        loop = asyncio.get_event_loop()
        hashed_password = await loop.run_in_executor(
            None,
            lambda: bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
        )

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
                user = await cursor.fetchone()
                if not user:
                    return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
                user_id = user[0]

                await cursor.execute(
                    "UPDATE users SET password=%s WHERE id=%s",
                    (hashed_password, user_id)
                )
        
        return jsonify({"success": True, "message": "Mot de passe mis à jour avec succès"})

    except Exception as e:
        return jsonify({"success": False, "message": f"Erreur: Erreur serveur"}), 500


GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


@app.route('/api/login1')
@require_valid_session
@rate_limit 
@require_ip_score
async def google_login(wari_session):
    params = {
        'client_id':     GOOGLE_CLIENT_ID,
        'redirect_uri':  f'{FRONTEND_URL}/api/google-callback',
        'response_type': 'code',
        'scope':         'openid email profile',
        'access_type':   'online',
        'prompt':        'consent',
    }
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return redirect(auth_url)


@app.route('/api/google-callback')
@require_valid_session
@rate_limit 
@require_ip_score
async def google_callback(wari_session):
    try:
        code = request.args.get('code')
        if not code:
            error = request.args.get('error', 'Erreur inconnue')
            return redirect(f'{FRONTEND_URL}/connexion?error={error}')

        # Échange le code contre un token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'code':          code,
            'client_id':     GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri':  f'{FRONTEND_URL}/api/google-callback',
            'grant_type':    'authorization_code',
        }

        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=data)
        tokens = token_response.json()

        if 'error' in tokens:
            return redirect(f'{FRONTEND_URL}/connexion?error={tokens["error"]}')

        # Vérifier le token ID
        id_token_str = tokens.get('id_token')
        if not id_token_str:
            return redirect(f'{FRONTEND_URL}/connexion?error=No id_token')

        # Vérifier le token avec Google
        id_info = await asyncio.to_thread(
            id_token.verify_oauth2_token,
            id_token_str,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Extraction infos utilisateur
        google_id = id_info.get("sub")
        email     = id_info.get("email")
        name      = id_info.get("name")
        picture   = id_info.get("picture")

        # DB async - Gestion utilisateur (nouveau ou existant)
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                await cur.execute("SELECT id FROM users WHERE google_id=%s", (google_id,))
                user = await cur.fetchone()

                if user is None:
                    # NOUVEAU utilisateur
                    await cur.execute(
                        """INSERT INTO users (email, name, google_id, picture, created_at) 
                           VALUES (%s, %s, %s, %s, NOW())""",
                        (email, name, google_id, picture)
                    )
                    await conn.commit()

                    await cur.execute("SELECT id FROM users WHERE google_id=%s", (google_id,))
                    user    = await cur.fetchone()
                    user_id = user[0]
                else:
                    # ANCIEN utilisateur
                    user_id = user[0]
                    await cur.execute(
                        """UPDATE users SET email=%s, name=%s, picture=%s, updated_at=NOW() 
                           WHERE google_id=%s""",
                        (email, name, picture, google_id)
                    )
                    await conn.commit()

        # Stockage en session
        session["user_id"]    = user_id
        session["user_email"] = email

        # Redirection vers home
        return redirect(f'{FRONTEND_URL}/home')

    except Exception as e:
        return redirect(f'{FRONTEND_URL}/connexion')



# --- Vérification reCAPTCHA async ---
async def verify_recaptcha_async(token: str) -> Dict[str, Any]:

    if not token:
        return {'success': False, 'error': 'Token manquant'}

    async with aiohttp.ClientSession() as session_http:
        try:
            async with session_http.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": RECAPTCHA_SECRET,
                    "response": token
                },
                headers={
                    "User-Agent": "Python/Quart"
                }
            ) as response:
                
                text = await response.text()
                
                return await response.json()
        except Exception as e:

            traceback.print_exc()
            return {'success': False, 'error': str(e)}

async def send_recovery_code_session(email_to, raw_password):
    try:
        # Génération du code et expiration
        code = str(random.randint(100000, 999999))
        expire_time = datetime.now() + timedelta(minutes=15)

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """
                    INSERT INTO codes (email, password, code, expires_at)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        password = VALUES(password),
                        code = VALUES(code),
                        expires_at = VALUES(expires_at),
                        used = 0
                    """,
                    (email_to, raw_password, code, expire_time)
                )
                await conn.commit()

        # Corps HTML de l'email
        body = f"""
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color:#f4f6f8; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="text-align:center; padding-bottom:20px;">
              <h1 style="margin:0; font-size:24px; color:#1f2937;">Bonjour !</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 20px 20px 20px; text-align:center;">
              <p style="margin:0; font-size:16px; line-height:1.6; color:#4b5563;">
                Voici votre code de sécurité pour confirmer votre identité :
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:10px 0;">
              <div style="display:inline-block; background-color:#eef2ff; color:#4f46e5; font-size:28px; font-weight:bold; padding:15px 25px; border-radius:8px; letter-spacing:4px;">
                {code}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 20px 10px 20px; text-align:center;">
              <p style="margin:0; font-size:14px; color:#6b7280;">
                Ce code est valable pendant 15 minutes. Ne le partagez avec personne.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px; text-align:center;">
              <p style="margin:0; font-size:14px; color:#6b7280;">
                Cordialement,<br>
                <strong>L'équipe de [Wariplay]</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:30px; text-align:center; font-size:12px; color:#9ca3af;">
              <p style="margin:0;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

        # Envoi de l'email dans un thread séparé
        await asyncio.to_thread(send_email_sync, email_to, body)

        return {"success": True, "message": "Email envoyé."}

    except Exception as e:
        return {"success": False, "message": f"Erreur interne: Erreur interne"}


@app.route('/api/register', methods=['POST'])
@require_origin
@require_valid_session
@require_csrf 
@require_fingerprint
@rate_limit 
@require_ip_score
async def register(wari_session):
    try:
        data = await request.get_json()
        email = data.get('email')
        raw_password = data.get('password')
        recaptcha_token = data.get('recaptcha')

        if not email or not raw_password:
            return jsonify({'success': False, 'message': 'Email ou mot de passe manquant.'})

        # --- Vérification reCAPTCHA ---
        recaptcha_result = await verify_recaptcha_async(recaptcha_token)
        if not recaptcha_result.get('success'):
            return jsonify({'success': False, 'message': 'Échec de la vérification reCAPTCHA.'})

        # --- Vérification complexité mot de passe ---
        if not any(c.isalpha() for c in raw_password) or not any(c.isdigit() for c in raw_password):
            return jsonify({'success': False, 'message': 'Le mot de passe doit contenir au moins une lettre et un chiffre.'})

        # --- Vérification si l'utilisateur existe déjà ---
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1 FROM users WHERE email=%s LIMIT 1", (email,))
                exists = await cur.fetchone()

        if exists:
            return jsonify({'success': False, 'message': 'Cet utilisateur existe déjà.'})

        # --- Génération + stockage code en session ---
        send_result = await send_recovery_code_session(email, raw_password)
        if not send_result['success']:
            return jsonify(send_result)

        # --- Retourne juste un succès, le frontend gère le popup ---
        return jsonify({'success': True, 'message': 'Code de vérification envoyé par email.'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur : Erreur interne '})
# --- Route pour vérifier le code stocké en session ---

@app.route('/api/verify-coded', methods=['POST'])
@require_origin
@require_valid_session
@require_csrf 
@require_fingerprint
@rate_limit 
@require_ip_score
async def verify_coded(wari_session):
    try:
        data = await request.get_json()
        code = data.get('code')

        if not code:
            return jsonify({'success': False, 'message': 'Code manquant.'}), 400
        
        pool = await get_pool()

        # --- Vérifier le code dans la table `codes` ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT email, password, expires_at, used FROM codes WHERE code=%s LIMIT 1",
                    (code,)
                )
                row = await cursor.fetchone()

        if not row:
            return jsonify({'success': False, 'message': 'Code introuvable.'}), 404

        email, raw_password, expires_at, used = row
        expires_at = expires_at if isinstance(expires_at, datetime) else datetime.fromisoformat(str(expires_at))

        if used:
            return jsonify({'success': False, 'message': 'Ce code a déjà été utilisé.'}), 400

        if datetime.now() > expires_at:
            return jsonify({'success': False, 'message': 'Ce code a expiré.'}), 400

        # --- Vérification si l'utilisateur existe déjà ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
                existing_user = await cursor.fetchone()
                if existing_user:
                    return jsonify({'success': False, 'message': 'Cet utilisateur existe déjà.'}), 400

        # --- Hash du mot de passe ---
        hashed_password_bytes = await asyncio.to_thread(
            bcrypt.hashpw,
            raw_password.encode(),
            bcrypt.gensalt()
        )
        hashed_password = hashed_password_bytes.decode('utf-8')

        # --- Préparer infos utilisateur ---
        local_part = email.split('@')[0]
        name = local_part.replace('.', ' ').replace('_', ' ').title()
        picture_path = 'img/warii.png'

        # --- Insertion dans la table `users` ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO users (email, password, picture, name) VALUES (%s, %s, %s, %s)",
                    (email, hashed_password, picture_path, name)
                )
                user_id = cursor.lastrowid
                await conn.commit()

        # --- Marquer le code comme utilisé ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("UPDATE codes SET used=1 WHERE code=%s", (code,))
                await conn.commit()

        # --- Stocker l'ID utilisateur dans la session ---
        session['user_id'] = user_id

        # --- ✅ Retourner du JSON au lieu d'une redirection ---
        return jsonify({'success': True, 'message': 'Compte vérifié avec succès !'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur serveur'}), 500

@app.route('/api/search-account', methods=['POST'])
@require_origin
@require_valid_session
@require_csrf 
@require_fingerprint
@rate_limit 
@require_ip_score
async def search_account(wari_session):
    # 🔑 récupération JSON async
    data = await request.get_json()
    input_value = data.get('query', '').strip() if data else ""

    if not input_value:
        return jsonify({'found': False, 'message': 'Champ vide'}), 400

    # 🔑 Déterminer type d’entrée
    if '@' in input_value:
        query = "SELECT email FROM users WHERE email = %s"
        result_type = "email"
    elif input_value.replace(' ', '').isdigit():
        query = "SELECT phone FROM users WHERE phone = %s"
        result_type = "phone"
    else:
        query = "SELECT name FROM users WHERE name = %s"
        result_type = "name"

    try:
        # 🔑 Connexion DB async
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, (input_value,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'found': True,
                'value': result[0],
                'type': result_type
            }), 200
        else:
            return jsonify({'found': False}), 200

    except Exception as e:
        return jsonify({'found': False, 'message': 'Erreur interne'}), 500


# ==============================
# Vérification reCAPTCHA
# ==============================
async def verify_recaptcha(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": RECAPTCHA_SECRET,
                "response": token
            }
        )
        return response.json()
    
# ==============================
# Vérification mot de passe
# ==============================

async def verify_password(raw_password: str, stored_password: str) -> bool:
    loop = asyncio.get_event_loop()

    def check():
        # Premièrement : essayer le base64
        try:
            decoded = base64.b64decode(stored_password).decode('utf-8')
            if raw_password == decoded:
                return True
        except Exception:
            pass

        # Ensuite : vérifier le hash bcrypt
        try:
            return bcrypt.checkpw(raw_password.encode(), stored_password.encode())
        except Exception:
            return False

    return await loop.run_in_executor(None, check)


# Route /login

@app.route('/api/login', methods=['POST'])
@require_origin
@require_valid_session
@require_csrf 
@require_fingerprint
@rate_limit 
@require_ip_score
async def login(wari_session):
    try:
        data = await request.get_json()
        email = data.get("email")
        raw_password = data.get("password")
        recaptcha_token = data.get("recaptcha_token")

        if not email or not raw_password:
            return jsonify({"error": "Email et mot de passe requis"}), 400
        if not recaptcha_token:
            return jsonify({"error": "Captcha manquant"}), 400

        # Vérification reCAPTCHA
        verification_result = await verify_recaptcha(recaptcha_token)

        if not verification_result.get("success") or verification_result.get("score", 0) < 0.5:
            return jsonify({"error": "Échec vérification reCAPTCHA"}), 403

        # Connexion à la base de données
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Vérifier utilisateur
                await cursor.execute(
                    "SELECT id, password FROM users WHERE email = %s",
                    (email,)
                )
                user = await cursor.fetchone()

                if user:
                    user_id, hashed_password = user
                    if await verify_password(raw_password, hashed_password):
                        # --- Connexion réussie, mettre user en session ---
                        session["user_id"] = user_id
                        session["email"] = email
                        return jsonify({"success": True})
        
        return jsonify({"error": "Identifiants incorrects"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# DECONNEXION
# ==============================

@app.route('/api/logout', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
async def logout(wari_session):
    session.clear()
    return jsonify({'success': True})


# =================================
# ROUTES DES ELEMENTS DE HOME
# =================================

@app.route('/api/wari_games', methods=['GET'])
@login_required
@require_origin
@rate_limit 
@require_ip_score
async def get_wari_games():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT name, title_prefix, description, demo_btn, play_btn, img FROM wari_games")
                rows = await cur.fetchall()

        games = [
            {
                'name': row[0],
                'titlePrefix': row[1],
                'description': row[2],
                'demoBtn': row[3],
                'playBtn': row[4],
                'img': row[5]
            }
            for row in rows
        ]

        return jsonify(games), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/wari_paths', methods=['GET'])
@login_required
@require_origin
@rate_limit 
@require_ip_score
async def get_wari_paths():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT name, title_prefix, description, button_text, img FROM wari_paths")
                rows = await cur.fetchall()

        paths = [
            {
                'name': row[0],
                'titlePrefix': row[1],
                'description': row[2],
                'buttonText': row[3],
                'img': row[4]
            }
            for row in rows
        ]

        return jsonify(paths), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/wari_levels', methods=['GET'])
@login_required
@require_origin
@rate_limit 
@require_ip_score
async def get_wari_levels():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, title_prefix, niveau_text, prix, duree, button_text, img "
                    "FROM wari_levels ORDER BY id ASC"
                )
                rows = await cur.fetchall()

        levels = [
            {
                'id': row[0],
                'titlePrefix': row[1],
                'niveauText': row[2],
                'prix': row[3],
                'duree': row[4],
                'buttonText': row[5],
                'img': row[6]
            }
            for row in rows
        ]

        return jsonify(levels), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



# ==============================
# ELEMENTS DE PROFIL 
# ==============================

@app.route('/api/user-info', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_ip_score
@update_fingerprint_if_changed
async def user_info(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT name, picture, created_at FROM users WHERE id = %s", (user_id,)
                )
                result = await cur.fetchone()

        if not result:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        name, picture, created_at = result
        return jsonify({
            'name': name,
            'picture': picture,
            'created_at': created_at.strftime('%Y-%m-%dT%H:%M:%S')
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def admin_required(f):
    """
    Décorateur qui bloque l'accès si l'utilisateur n'est pas admin (user_id != 11).
    Retourne une erreur 403 Forbidden.
    
    Utilisation:
        @app.route('/api/admin/delete-user')
        @admin_required
        async def delete_user():
            return jsonify({"success": True})
    """
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        
        if user_id != 11 and str(user_id) != '11':
            return jsonify({
                "error": "forbidden",
                "message": "NON"
            }), 403
        
        return await f(*args, **kwargs)
    
    return decorated_function

@app.route('/api/current-user')
@login_required
@require_origin
@admin_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def current_user(wari_session):
    user_id = session.get('user_id')
    is_admin = 'yes' if (user_id == 11 or str(user_id) == '11') else 'no'
    return jsonify({
        'is_admin': is_admin,
        'authenticated': 'yes' if user_id else 'no'
    })    

async def generate_referral_code(cursor, username):
    # Nettoyer le pseudo
    base = re.sub(r'[^a-zA-Z0-9]', '', username.lower())
    base = base[:12]  # limite raisonnable

    # Tous les codes ont un chiffre obligatoire
    candidates = [f"@{base}{i}" for i in range(1, 100)]  # @username1 → @username99

    # Vérifier en base les codes déjà utilisés
    await cursor.execute(
        "SELECT code FROM bonus WHERE code IN %s",
        (tuple(candidates),)
    )
    rows = await cursor.fetchall()
    used = {row[0] for row in rows}

    # Retourner le premier code libre
    for code in candidates:
        if code not in used:
            return code

    raise Exception("Impossible de générer un code de parrainage unique")


@app.route('/api/get-user-referral', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_user_referral(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:

            # Vérifier si l'utilisateur a déjà un code
            await cursor.execute(
                "SELECT code FROM bonus WHERE pere_id=%s LIMIT 1",
                (user_id,)
            )
            result = await cursor.fetchone()
            if result:
                return jsonify({"success": True, "code": result[0]})

            # Récupérer le username
            await cursor.execute(
                "SELECT name FROM users WHERE id=%s LIMIT 1",
                (user_id,)
            )
            user = await cursor.fetchone()
            if not user:
                return jsonify({"success": False, "error": "Utilisateur introuvable"}), 404

            username = user[0]

            # Générer un code unique avec chiffre obligatoire
            new_code = await generate_referral_code(cursor, username)

            # Sauvegarder le code
            try:
                await cursor.execute(
                    "INSERT INTO bonus (code, pere_id) VALUES (%s, %s)",
                    (new_code, user_id)
                )
                await conn.commit()
            except Exception:
                return jsonify({"success": False, "error": "/"}), 500

            return jsonify({"success": True, "code": new_code})

# =====================================================
# SECTION DES PARAMETRES
# =====================================================

@app.route("/api/supprimer-code", methods=["POST"])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def supprimer_code(wari_session):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Utilisateur non connecté"}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "DELETE FROM verification_codes WHERE user_id = %s",
                    (user_id,)
                )
                await conn.commit()

        return jsonify({"status": "success"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/enregistrer-code', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def enregistrer_code(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Utilisateur non connecté'}), 401

    data = await request.get_json()
    code = data.get('code') if data else None

    if not code:
        return jsonify({'status': 'error', 'message': 'Code manquant'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # REPLACE INTO pour insérer ou mettre à jour
                await cur.execute(
                    "REPLACE INTO verification_codes (user_id, code) VALUES (%s, %s)",
                    (user_id, code)
                )
                await conn.commit()

        return jsonify({'status': 'success', 'message': 'Code enregistré avec succès'}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/update-phone', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def update_phone(wari_session):
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Utilisateur non connecté'}), 401

    # 🔑 récupération JSON async
    data = await request.get_json()
    phone = data.get('phone', '').strip() if data else ""

    # 🔑 validation
    digits_only = ''.join(filter(str.isdigit, phone))
    if len(digits_only) < 8:
        return jsonify({'status': 'error', 'message': 'Numéro invalide'}), 400

    user_id = session['user_id']

    try:
        # 🔑 Connexion DB async
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE users SET phone = %s WHERE id = %s",
                    (phone, user_id)
                )
                await conn.commit()

        return jsonify({'status': 'success'}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route("/api/verif-activee", methods=["GET"])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def verif_activee(wari_session):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"active": False}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT 1 FROM verification_codes WHERE user_id = %s",
                    (user_id,)
                )
                result = await cur.fetchone()

        return jsonify({"active": bool(result)}), 200

    except Exception as e:
        return jsonify({"active": False, "error": str(e)}), 500
    
@app.route('/api/check_notifications')
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def check_notifications(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT email_notifications FROM users WHERE id = %s", (user_id,))
            result = await cur.fetchone()

    return jsonify({
        'email_notifications': bool(result[0]) if result else False
    })

# --- Route async pour vérifier le statut du referral ---
@app.route('/api/check-referral-status', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def check_referral_status(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"activated": False}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id FROM bonus_usage WHERE user_id=%s LIMIT 1",
                (user_id,)
            )
            result = await cur.fetchone()

    activated = bool(result)
    return jsonify({"activated": activated})


@app.route('/api/check-verification-status', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def check_verification_status(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"verify": False, "error": "Non connecté"}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT verify FROM users WHERE id = %s", (user_id,))
            result = await cursor.fetchone()
            verify = result[0] if result else 0

    return jsonify({"verify": verify})

@app.route('/api/deactivate-referral', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def deactivate_referral(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Non connecté"}), 401

    try:
        db_pool = await get_pool()
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE users SET email_notifications = 0 WHERE id = %s",
                    (user_id,)
                )
                await conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --- Route activate-referral async ---
@app.route('/api/activate-referral', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def activate_referral(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

    data = await request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({"success": False, "error": "Code manquant"}), 400

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # Vérifier si l'utilisateur a déjà été parrainé
                await cur.execute(
                    "SELECT id FROM bonus_usage WHERE user_id=%s LIMIT 1", 
                    (user_id,)
                )
                if await cur.fetchone():
                    return jsonify({"success": False, "error": "Vous avez déjà été parrainé"}), 400

                # Vérifier si le code existe
                await cur.execute(
                    "SELECT id, pere_id FROM bonus WHERE code=%s", 
                    (code,)
                )
                bonus = await cur.fetchone()
                if not bonus:
                    return jsonify({"success": False, "error": "Code invalide"}), 400

                bonus_id, pere_id = bonus

                # Empêcher l'utilisateur de se parrainer lui-même
                if pere_id == user_id:
                    return jsonify({"success": False, "error": "Vous ne pouvez pas utiliser votre propre code"}), 400

                # Ajouter 200F à l'utilisateur
                await cur.execute(
                    "UPDATE solde SET solde = solde + 200 WHERE user_id=%s", 
                    (user_id,)
                )
                # Ajouter 100F au propriétaire du code
                await cur.execute(
                    "UPDATE solde SET solde = solde + 100 WHERE user_id=%s", 
                    (pere_id,)
                )
                # Enregistrer l'utilisation du code
                await cur.execute(
                    "INSERT INTO bonus_usage (bonus_id, user_id, used_at) VALUES (%s, %s, %s)",
                    (bonus_id, user_id, datetime.now())
                )

                return jsonify({
                    "success": True,
                    "message": "Code utilisé avec succès ! +200F ajouté à votre solde"
                })

            except Exception as e:
                # rollback automatique impossible avec autocommit=True, sinon gérer manuellement
                return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/update_notifications', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def update_notifications(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = await request.get_json()
    new_state = data.get('email_notifications')
    if new_state is None:
        return jsonify({'error': 'Missing data'}), 400

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE users SET email_notifications = %s WHERE id = %s",
                (new_state, user_id)
            )
        await conn.commit()

    return jsonify({'success': True, 'email_notifications': new_state})


@app.route('/api/password', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def update_password(wari_session):
    try:
        data = await request.get_json()
        
        # Le frontend envoie seulement 'password', pas 'confirm_password'
        new_password = data.get('password')
        
        if not new_password:
            return jsonify({"status": "error", "message": "Mot de passe manquant"}), 400
        
        if len(new_password) < 6:
            return jsonify({"status": "error", "message": "6 caractères minimum"}), 400
        
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({"status": "error", "message": "Non connecté"}), 401
        
        loop = asyncio.get_event_loop()
        hashed_password = await loop.run_in_executor(
            None,
            lambda: bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
        )
        
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE users SET password = %s WHERE id = %s",
                    (hashed_password, user_id)
                )
                await conn.commit()
        
        return jsonify({"status": "success", "message": "Mot de passe mis à jour"})
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

# =====================================
# ROUTE GENERALE POUR OBTENIR LE SOLDE 
# =====================================

@app.route('/api/get_lettricide_solde', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_lettricide_solde(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT solde, wari_id FROM solde WHERE user_id = %s", 
                    (user_id,)
                )
                result = await cur.fetchone()

        if result:
            return jsonify({
                'solde': result[0],
                'wari_id': result[1]
            })
        else:
            return jsonify({'error': 'Aucun solde trouvé pour cet utilisateur'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================
# ROUTES DE LA PAGE GAME
# =====================================

@app.route('/api/get-games', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_games(wari_session):
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT g.name, g.description, g.players, g.rating, g.image_url, 
                           IFNULL(gp.is_paid, 0) as is_paid
                    FROM games1 g
                    LEFT JOIN games_pro gp ON g.name = gp.name
                """)
                rows = await cur.fetchall()

        games = []
        for row in rows:
            games.append({
                'name': row[0],
                'description': row[1],
                'players': row[2],
                'rating': row[3],
                'image_url': row[4],
                'is_paid': bool(row[5])
            })

        return jsonify(games)

    except Exception as e:
        app.logger.error(f"Erreur get_games: {str(e)}")
        return jsonify([])

@app.route('/api/check-pro-access', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def check_pro_access(wari_session):
    if 'user_id' not in session:
        return jsonify({
            'has_access': False,
            'message': 'Veuillez vous connecter',
            'requires_login': True
        })

    data = await request.get_json()
    game_name = data.get('game_name')
    user_id = session['user_id']

    if not game_name:
        return jsonify({'has_access': False, 'message': 'Nom du jeu manquant'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT gp.is_paid, 
                           (SELECT COUNT(*) FROM product_purchases 
                            WHERE user_id = %s AND product_name = %s) as has_purchased
                    FROM games1 g
                    LEFT JOIN games_pro gp ON g.name = gp.name
                    WHERE g.name = %s
                """, (user_id, game_name, game_name))
                
                result = await cur.fetchone()

        if not result:
            return jsonify({'has_access': False, 'message': 'Jeu non trouvé'})

        is_paid = bool(result[0]) if result[0] is not None else False
        has_purchased = result[1] > 0

        if not is_paid or has_purchased:
            return jsonify({'has_access': True})
        else:
            return jsonify({
                'has_access': False,
                'message': 'Version pro requise',
                'game_name': game_name
            })

    except Exception as e:
        return jsonify({'has_access': False, 'message': 'Erreur serveur'}), 500

# =====================================
# ROUTES DES ELEMENTS DE LA PAGE GAME
# =====================================

def row_to_dict(columns, row):
    """Convertit une ligne tuple en dictionnaire en utilisant les noms de colonnes"""
    return dict(zip(columns, row))

@app.route('/api/products', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_products(wari_session):
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer les produits avec leurs catégories
                query = """
                SELECT p.*, c.name as category_name, c.icon as category_icon 
                FROM products p
                JOIN categories c ON p.category_id = c.id
                """
                await cur.execute(query)
                
                columns = [desc[0] for desc in cur.description]
                rows = await cur.fetchall()
                products = [row_to_dict(columns, row) for row in rows]

                # Récupérer les avantages pour chaque produit
                for product in products:
                    await cur.execute(
                        "SELECT advantage FROM product_advantages WHERE product_id = %s",
                        (product['id'],)
                    )
                    adv_rows = await cur.fetchall()
                    product['advantages'] = [r[0] for r in adv_rows]

        return jsonify(products)

    except Exception as e:
        return jsonify({'error': 'Erreur interne '}), 500


# ============================================
# ROUTES DES ELEMENTS DE LA PAGE DE PAIEMENT
# ============================================

@app.route('/api/get_product_price', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_product_price(wari_session):
    try:
        produit = request.args.get('produit')
        if not produit:
            return jsonify({'error': 'Paramètre produit manquant'}), 400

        produit_clean = unquote(produit).strip()

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT price FROM products WHERE title = %s LIMIT 1",
                    (produit_clean,)
                )
                row = await cur.fetchone()

        if not row:
            return jsonify({'error': 'Produit non trouvé'}), 404

        # Conversion robuste du prix (supprime tout sauf chiffres)
        price_str = re.sub(r'[^\d]', '', str(row[0]))
        if not price_str:
            return jsonify({'error': 'Format de prix invalide'}), 500

        return jsonify({
            'prix': int(price_str),
            'produit': produit_clean
        })

    except Exception as e:
        return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.route('/api/get_level_info', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_level_info(wari_session):
    niveau_id = request.args.get('niveau')

    if not niveau_id:
        return jsonify({'error': 'Niveau non fourni'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer le nom depuis la table levels
                await cur.execute("SELECT name FROM levels WHERE id = %s", (niveau_id,))
                level_row = await cur.fetchone()

                # Récupérer prix et durée depuis wari_levels
                await cur.execute("SELECT prix, duree FROM wari_levels WHERE id = %s", (niveau_id,))
                wari_row = await cur.fetchone()

        if not level_row or not wari_row:
            return jsonify({'error': 'Données introuvables'}), 404

        # Extraire le prix numérique (ex : 1000) depuis "Prix de vente : 1000 FCFA"
        prix_text = wari_row[0]
        prix_match = re.search(r'(\d+)', prix_text)
        prix = int(prix_match.group(1)) if prix_match else 0

        # Extraire la durée (texte complet ou chiffre)
        duree_text = wari_row[1]  # ex : "Durée : 10 jours"
        # Si tu veux juste le chiffre :
        duree_match = re.search(r'(\d+)', duree_text)
        duree = int(duree_match.group(1)) if duree_match else 0
        duree = duree_text

        return jsonify({
            'name': level_row[0],
            'prix': prix,
            'duree': duree
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/save_purchase', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def save_purchase(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    data = await request.get_json()

    product_name = data.get('name')
    duration = data.get('duration')
    amount = data.get('amount')
    operation = data.get('operation')  # 'debit' attendu

    user_id = session['user_id']

    # Vérifications des données
    if not product_name or not duration or amount is None or operation not in ['debit', 'credit']:
        return jsonify({'error': 'Données incomplètes ou invalides'}), 400

    try:
        lives = 3
        renewal_time = "24h"

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # 1️⃣ Récupérer le solde actuel
                await cur.execute(
                    "SELECT solde FROM solde WHERE user_id = %s",
                    (user_id,)
                )
                row = await cur.fetchone()

                if not row:
                    return jsonify({'error': 'Compte introuvable'}), 404

                current_balance = row[0]

                # 2️⃣ Calcul du nouveau solde
                if operation == 'debit':
                    new_balance = current_balance - amount
                    if new_balance < 0:
                        return jsonify({'error': 'Solde insuffisant'}), 400
                else:
                    new_balance = current_balance + amount

                # 3️⃣ Mise à jour du solde
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_balance, user_id)
                )

                # 4️⃣ Enregistrement de l'achat
                await cur.execute("""
                    INSERT INTO achats (user_id, produit, duree, vies, renouvellement)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, product_name, duration, lives, renewal_time))

                # 5️⃣ Commit final (solde + achat)
                await conn.commit()

        return jsonify({
            'success': True,
            'new_balance': new_balance
        }), 200

    except Exception as e:
        return jsonify({'error': 'Erreur serveur'}), 500
    
# ==================================================
# HELPERS
# ==================================================

def parse_price(raw_price):
    """Extrait un entier depuis products.price, qui peut être '1,000 FCFA' ou un nombre brut."""
    digits = re.sub(r'[^\d]', '', str(raw_price))
    if not digits:
        raise ValueError("Prix invalide")
    return int(digits)


async def insert_product_purchase(cur, user_id, produit, amount):
    await cur.execute("""
        INSERT INTO product_purchases (user_id, product_name, amount, purchase_date)
        VALUES (%s, %s, %s, NOW())
    """, (user_id, produit, amount))


async def insert_achat(cur, user_id, produit, duree, vies, renouvellement):
    await cur.execute("""
        INSERT INTO achats (user_id, produit, duree, vies, renouvellement, created_at, start_time)
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
    """, (user_id, produit, duree, vies, renouvellement))


async def handle_pass_vip(cur, user_id):
    """Étape 1 : Niveau 1 / Niveau 2 (exclusivité, réservée à ce flux). Étape 2 : Dino Run / XO Clash."""

    # --- Étape 1 : Niveau 1 / Niveau 2 dans `achats` ---
    await cur.execute(
        "SELECT produit FROM achats WHERE user_id = %s AND produit IN ('Niveau 1', 'Niveau 2')",
        (user_id,)
    )
    actifs = {row[0] for row in await cur.fetchall()}
    has_n1 = "Niveau 1" in actifs
    has_n2 = "Niveau 2" in actifs

    if has_n1 and not has_n2:
        await insert_achat(cur, user_id, "Niveau 2", "Durée : 7 jours", 4, "24h")
    elif has_n2 and not has_n1:
        await insert_achat(cur, user_id, "Niveau 1", "Durée : 7 jours", 4, "24h")
    elif not has_n1 and not has_n2:
        # Aucun des deux actif -> Niveau 1 par défaut
        await insert_achat(cur, user_id, "Niveau 1", "Durée : 7 jours", 4, "24h")
    # si les deux sont déjà actifs -> on ignore cette étape

    # --- Étape 2 : Dino Run / XO Clash dans `game_settings` ---
    await cur.execute(
        "SELECT COUNT(*) FROM game_settings WHERE product_name = 'Dino Run' AND user_id = %s",
        (user_id,)
    )
    has_dino = (await cur.fetchone())[0] > 0

    if not has_dino:
        await cur.execute("""
            INSERT INTO game_settings
            (product_name, image_url, vies, duree_jours, renewal, user_id, created_at, renewal_start)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NULL)
        """, ("Dino Run", "/img/Dino Run.png", 10, 7, "24h", user_id))
    else:
        await cur.execute(
            "SELECT COUNT(*) FROM game_settings WHERE product_name = 'XO Clash' AND user_id = %s",
            (user_id,)
        )
        has_xo = (await cur.fetchone())[0] > 0
        if not has_xo:
            await cur.execute("""
                INSERT INTO game_settings
                (product_name, image_url, vies, duree_jours, renewal, user_id, created_at, renewal_start)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NULL)
            """, ("XO Clash", "/img/XOclash.png", 10, 7, "24h", user_id))
        # si Dino Run ET XO Clash existent déjà -> on n'ajoute rien


# ==================================================
# ROUTE PRINCIPALE
# ==================================================

@app.route('/api/save_product_purchase', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf
@rate_limit
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def save_product_purchase(wari_session):
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Non connecté'}), 401

    try:
        data = await request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        produit = data.get('name')
        operation = data.get('operation')
        user_id = session['user_id']

        if not all([produit, operation]):
            return jsonify({'success': False, 'error': 'Paramètres manquants'}), 400

        if operation != 'debit':
            return jsonify({'success': False, 'error': 'Opération invalide'}), 400

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # --- Résolution du produit : games1 d'abord ---
                await cur.execute("SELECT image_url FROM games1 WHERE name = %s", (produit,))
                game_row = await cur.fetchone()
                is_game = game_row is not None
                image_url = game_row[0] if game_row else None

                # --- Prix de confiance : toujours products, jamais l'amount du frontend ---
                await cur.execute("SELECT price FROM products WHERE title = %s", (produit,))
                price_row = await cur.fetchone()
                if not price_row:
                    return jsonify({'success': False, 'error': 'Produit introuvable'}), 404

                try:
                    amount_clean = parse_price(price_row[0])
                except ValueError:
                    return jsonify({'success': False, 'error': 'Prix invalide en base'}), 500

                # --- Verrou + débit du solde ---
                await cur.execute(
                    "SELECT solde FROM solde WHERE user_id = %s FOR UPDATE",
                    (user_id,)
                )
                row = await cur.fetchone()
                if not row:
                    return jsonify({'success': False, 'error': 'Compte introuvable'}), 404

                current_balance = row[0]
                new_balance = current_balance - amount_clean

                if new_balance < 0:
                    return jsonify({'success': False, 'error': 'Solde insuffisant'}), 400

                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_balance, user_id)
                )

                # --- Branchement selon le type de produit ---

                if produit == "Pack de 10 vies":
                    # +10 vies sur tous les jeux du user, jamais stocké nulle part
                    await cur.execute(
                        "UPDATE game_settings SET vies = vies + 10 WHERE user_id = %s",
                        (user_id,)
                    )

                elif produit == "Vies illimitées 24h":
                    await cur.execute(
                        "UPDATE game_settings SET vies = %s WHERE user_id = %s",
                        (1000000000, user_id)
                    )
                    await insert_product_purchase(cur, user_id, produit, amount_clean)

                elif produit == "Pass VIP 7 jours":
                    await handle_pass_vip(cur, user_id)
                    await insert_product_purchase(cur, user_id, produit, amount_clean)

                elif produit.startswith("Niveau 1") or produit.startswith("Niveau 2"):
                    # Achat direct hors Pass VIP -> stocké dans achats, pas de logique d'exclusivité
                    niveau = "Niveau 1" if produit.startswith("Niveau 1") else "Niveau 2"
                    await insert_achat(cur, user_id, niveau, "Durée : 7 jours", 4, "24h")
                    await insert_product_purchase(cur, user_id, produit, amount_clean)

                elif is_game:
                    # Jeu classique trouvé dans games1
                    await cur.execute("""
                        SELECT COUNT(*) FROM game_settings
                        WHERE product_name = %s AND user_id = %s
                    """, (produit, user_id))
                    count = (await cur.fetchone())[0]

                    if count == 0:
                        await cur.execute("""
                            INSERT INTO game_settings
                            (product_name, image_url, vies, duree_jours, renewal, user_id)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (produit, image_url, 3, 35, "24h", user_id))

                    await insert_product_purchase(cur, user_id, produit, amount_clean)

                else:
                    # Produit "patch" générique, sans règle nommée : juste débit + log
                    await insert_product_purchase(cur, user_id, produit, amount_clean)

                await conn.commit()

        return jsonify({
            'success': True,
            'message': 'Achat effectué avec succès',
            'new_balance': new_balance
        })

    except Exception as e:
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500

# =======================================
# ROUTES DES ELEMENTS DE LA PAGE ORDRE
# =======================================
@app.route('/api/get-other-products', methods=["GET"])
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

@app.route('/api/game-settings', methods=['GET'])
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


@app.route('/api/niveaux-utilisateur', methods=['GET'])
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


@app.route('/api/temps-restant', methods=['GET'])
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

@app.route('/api/renouvellement-temps', methods=['GET'])
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

@app.websocket("/ws/wari-level")
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





















































































































































# =====================================================
# SYSTEME GENERALE DE MISE / ROUTE GENERALE POUR MISER
# =====================================================
#CREATE TABLE historique_mises (
#    id INT AUTO_INCREMENT PRIMARY KEY,
#    montant DECIMAL(10,2) NOT NULL,
#    date_mise DATETIME DEFAULT CURRENT_TIMESTAMP
#);

from datetime import datetime
import functools
from typing import Callable


def track_mise():
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            response = await func(*args, **kwargs)
            status_code = response[1] if isinstance(response, tuple) else 200

            if status_code == 200:
                try:
                    montant = getattr(g, "mise_montant", None)
                    user_id = getattr(g, "user_id", None)

                    if montant and user_id:
                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cursor:

                                # 1️⃣ Stats par utilisateur
                                await cursor.execute(
                                    """
                                    INSERT INTO user_stats (user_id, nombre_mises, total_mise, derniere_mise)
                                    VALUES (%s, 1, %s, NOW()) AS new
                                    ON DUPLICATE KEY UPDATE
                                        user_stats.nombre_mises = user_stats.nombre_mises + 1,
                                        user_stats.total_mise = user_stats.total_mise + new.total_mise,
                                        user_stats.derniere_mise = NOW()
                                    """,
                                    (user_id, montant)
                                )

                                # 2️⃣ Stats du jour (globales, tous users confondus)
                                await cursor.execute(
                                    """
                                    INSERT INTO today_stats (stat_date, nombre_mises, total_mise)
                                    VALUES (CURDATE(), 1, %s) AS new
                                    ON DUPLICATE KEY UPDATE
                                        today_stats.nombre_mises = today_stats.nombre_mises + 1,
                                        today_stats.total_mise = today_stats.total_mise + new.total_mise
                                    """,
                                    (montant,)
                                )

                                # 3️⃣ Stats globales (all-time, une seule ligne id=1)
                                await cursor.execute(
                                    """
                                    UPDATE globale_states
                                    SET nombre_mises_total = nombre_mises_total + 1,
                                        total_mise_total = total_mise_total + %s
                                    WHERE id = 1
                                    """,
                                    (montant,)
                                )

                            await conn.commit()

                except Exception:
                    pass

            return response
        return wrapper
    return decorator


@app.route('/api/cherif', methods=['POST'])
@require_origin
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
@track_mise()
async def cherif(wari_session):
    try:
        # 1️⃣ Vérification utilisateur connecté
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        # ✅ Nécessaire pour que le décorateur track_mise() puisse le récupérer via g
        g.user_id = user_id

        # 2️⃣ Données envoyées par le frontend
        data = await request.get_json()

        # ✅ Vérification que le body n'est pas vide
        if not data:
            return jsonify({
                "success": False,
                "error": "Body invalide"
            }), 400

        bet_raw = data.get("bet")

        if not bet_raw:
            return jsonify({
                "success": False,
                "error": "Mise manquante"
            }), 400

        try:
            bet = round(float(bet_raw), 2)  # ✅ Arrondi à 2 décimales max
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Mise invalide"
            }), 400

        if bet <= 0:
            return jsonify({
                "success": False,
                "error": "La mise doit être positive"
            }), 400

        if bet <= 99:
            return jsonify({
                "success": False,
                "error": "La mise doit être supérieure à 99"
            }), 400

        # ✅ Stocke le montant dans g pour le décorateur track_mise
        g.mise_montant = bet

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    # 3️⃣ Récupération du solde avec lock pour éviter race condition
                    await cursor.execute(
                        "SELECT solde FROM solde WHERE user_id=%s LIMIT 1 FOR UPDATE",
                        (user_id,)
                    )
                    solde_row = await cursor.fetchone()

                    if not solde_row:
                        return jsonify({
                            "success": False,
                            "error": "Solde introuvable"
                        }), 404

                    solde_avant = float(solde_row[0])

                    # 4️⃣ Vérification solde suffisant
                    if bet > solde_avant:
                        return jsonify({
                            "success": False,
                            "error": "Solde insuffisant"
                        }), 400

                    # 5️⃣ Calcul du nouveau solde
                    solde_apres = solde_avant - bet

                    # 6️⃣ Mise à jour du solde
                    await cursor.execute(
                        "UPDATE solde SET solde=%s WHERE user_id=%s",
                        (solde_apres, user_id)
                    )

                    # 7️⃣ Récupération du nom utilisateur
                    await cursor.execute(
                        "SELECT name FROM users WHERE id=%s LIMIT 1",
                        (user_id,)
                    )
                    user_row = await cursor.fetchone()
                    user_name = user_row[0] if user_row else f"Utilisateur #{user_id}"

                    # 8️⃣ Génération du texte historique
                    now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

                    description = (
                        f"Le joueur {user_name} (ID {user_id}) "
                        f"a misé {bet} XOF le {now_str}. "
                        f"Son solde avant la mise était {solde_avant} XOF "
                        f"et son nouveau solde est de {solde_apres} XOF."
                    )

                    # 9️⃣ Insertion dans bets_history
                    await cursor.execute(
                        """
                        INSERT INTO bets_history
                        (user_id, mise, solde_avant, solde_apres, description, created_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        """,
                        (user_id, bet, solde_avant, solde_apres, description)
                    )

                    await conn.commit()

                except Exception as e:
                    await conn.rollback()
                    raise e

        # 🔟 Réponse propre au frontend
        response_data = {
            "success": True,
            "message": "Mise effectuée avec succès",
            "bet": bet,
            "new_solde": solde_apres
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Erreur interne"  # ✅ Message générique, ne expose pas les détails en prod
        }), 500






































































# =========================================================
# SYSTEME GENERALE DE DEPOT / DEPOT DES GAINS SUR LE SITE
# =========================================================

#CREATE TABLE historique_depots (
#    id INT AUTO_INCREMENT PRIMARY KEY,
#    montant DECIMAL(10,2) NOT NULL,
#    date_depot DATETIME DEFAULT CURRENT_TIMESTAMP
#);

import hmac

def track_depot():
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            response = await func(*args, **kwargs)

            # Enregistre seulement si le dépôt a réussi
            if getattr(g, "depot_success", False):
                try:
                    montant = getattr(g, "depot_montant", None)
                    if montant:
                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cursor:
                                await cursor.execute(
                                    "INSERT INTO historique_depots (montant, date_depot) VALUES (%s, NOW())",
                                    (montant,)
                                )
                            await conn.commit()
                except Exception:
                    pass

            return response
        return wrapper
    return decorator

# --- Clés et variables d'environnement ---
HMAC_KEY = os.environ.get("TOKENS_HMAC_KEY")
if HMAC_KEY is None:
    raise RuntimeError("TOKENS_HMAC_KEY non défini dans les env")
HMAC_KEY = HMAC_KEY.encode()  # bytes

FEDAPAY_SECRET = os.environ.get("FEDAPAY_SECRET")
API_URL = os.environ.get("API_URL")

@app.route("/api/create-transaction", methods=["POST"])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def create_transaction(wari_session):
    data = await request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "Body invalide"}), 400

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Utilisateur non connecté"}), 401

    amount = data.get("amount")
    try:
        amount = round(float(amount), 2)
    except Exception:
        return jsonify({"status": "error", "message": "Montant invalide"}), 400

    if amount < 1000:
        return jsonify({"status": "error", "message": "Montant minimal = 100 FCFA"}), 400

    # --- Génération du token ---
    token_plain = secrets.token_urlsafe(32)
    token_hmac = hmac.new(HMAC_KEY, token_plain.encode(), hashlib.sha256).hexdigest()

    # --- Construire le callback_url ---
    callback_url = f"http://127.0.0.1:5000/api/callbackss/{token_plain}"

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=5)

    payload = {
        "amount": amount,
        "currency": {"iso": "XOF"},
        "description": f"Dépôt de {amount} FCFA",
        "callback_url": callback_url,
        "metadata": {"user_id": user_id}
    }
    headers = {"Authorization": f"Bearer {FEDAPAY_SECRET}"}

    async with httpx.AsyncClient() as client:
        resp = await client.post(API_URL, json=payload, headers=headers)
        try:
            data_resp = resp.json()
        except Exception:
            return jsonify({"status": "error", "message": "Réponse API invalide"}), resp.status_code

    trx = data_resp.get("v1/transaction") or data_resp.get("transaction") or data_resp
    if not trx:
        return jsonify({"status": "error", "message": "Réponse API inattendue", "detail": resp.text}), resp.status_code

    payment_url = trx.get("payment_url")
    payment_token = trx.get("payment_token")

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # ✅ ON DUPLICATE KEY UPDATE → toujours 1 seule ligne par user
            await cur.execute("""
                INSERT INTO tokens (user_id, amount, token, created_at, expires_at)
                VALUES (%s, %s, %s, %s, %s) AS new_token
                ON DUPLICATE KEY UPDATE
                    amount     = new_token.amount,
                    token      = new_token.token,
                    created_at = new_token.created_at,
                    expires_at = new_token.expires_at
            """, (
                user_id,
                amount,
                token_hmac,
                now.strftime("%Y-%m-%d %H:%M:%S"),
                expires_at.strftime("%Y-%m-%d %H:%M:%S")
            ))
        await conn.commit()

    return jsonify({
        "status": "success",
        "payment_url": payment_url,
        "payment_token": payment_token,
        "transaction_token": token_plain,
        "expires_at": expires_at.isoformat()
    }), 201

#################################################################################################################################
#Deuxieme partie du depot qui gere la verification quand fedapay redirige vers /callbackss avec le statut et l'id du transfer .#
#################################################################################################################################
@app.route("/api/callbackss/<transaction_token>", methods=["GET", "POST"])
@require_origin
@rate_limit 
@require_ip_score
@track_depot()
async def callbackss(transaction_token):
    try:
        # 1️⃣ Vérification HMAC en premier avant toute requête DB
        token_hmac_calc = hmac.new(HMAC_KEY, transaction_token.encode(), hashlib.sha256).hexdigest()

        # 2️⃣ Paramètres Fedapay
        status = request.args.get("status")
        feda_id = request.args.get("id")

        if status not in ("success", "approved"):
            return redirect(f'{FRONTEND_URL}/recharger')

        if not feda_id or not feda_id.isdigit():
            return redirect(f'{FRONTEND_URL}/recharger')

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                try:
                    # 3️⃣ Récupère le token depuis la DB par HMAC (pas par user_id)
                    await cur.execute("""
                        SELECT id, user_id, amount, expires_at
                        FROM tokens
                        WHERE token=%s
                        LIMIT 1
                    """, (token_hmac_calc,))
                    row = await cur.fetchone()

                    if not row:
                        return redirect(f'{FRONTEND_URL}/recharger')

                    token_id, user_id, amount_db, expires_at = row

                    # 4️⃣ Vérifier expiration
                    if expires_at.tzinfo is None:
                        expires_at = expires_at.replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    if now > expires_at:
                        await cur.execute("DELETE FROM tokens WHERE id=%s", (token_id,))
                        await conn.commit()
                        return redirect(f'{FRONTEND_URL}/recharger')

                    # 5️⃣ Vérifier que feda_id n'existe pas déjà (anti-replay)
                    await cur.execute(
                        "SELECT 1 FROM mobile_money WHERE transaction_id=%s",
                        (feda_id,)
                    )
                    exists = await cur.fetchone()
                    if exists:
                        return redirect(f'{FRONTEND_URL}/recharger')

                    # 6️⃣ Récupération du solde avec lock (anti race condition)
                    await cur.execute(
                        "SELECT solde FROM solde WHERE user_id=%s FOR UPDATE",
                        (user_id,)
                    )
                    row_solde = await cur.fetchone()

                    if row_solde:
                        new_solde = row_solde[0] + amount_db
                        await cur.execute(
                            "UPDATE solde SET solde=%s WHERE user_id=%s",
                            (new_solde, user_id)
                        )
                    else:
                        new_solde = amount_db
                        await cur.execute(
                            "INSERT INTO solde (user_id, solde) VALUES (%s, %s)",
                            (user_id, new_solde)
                        )

                    # 7️⃣ Journaliser la transaction
                    msg = (
                        f"Vous avez effectué un dépôt de {amount_db} FCFA "
                        f"le {now.strftime('%d/%m/%Y %H:%M:%S')}. "
                        f"Votre solde actuel est de {new_solde} FCFA."
                    )
                    await cur.execute("""
                        INSERT INTO mobile_money (user_id, amount, solde, message, transaction_id)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (user_id, amount_db, new_solde, msg, feda_id))

                    # 8️⃣ Supprimer le token utilisé
                    await cur.execute("DELETE FROM tokens WHERE id=%s", (token_id,))

                    # 9️⃣ Mise à jour stats globales
                    await cur.execute("""
                        INSERT INTO feeds (id, total_deposits_count, total_deposits_amount, last_updated)
                        VALUES (1, 1, %s, NOW())
                        ON DUPLICATE KEY UPDATE
                            total_deposits_count  = total_deposits_count + 1,
                            total_deposits_amount = total_deposits_amount + %s,
                            last_updated          = NOW()
                    """, (amount_db, amount_db))

                    # ✅ Signal succès pour le décorateur track_depot
                    g.depot_success = True
                    g.depot_montant = amount_db

                    await conn.commit()

                except Exception as e:
                    await conn.rollback()
                    return redirect(f'{FRONTEND_URL}/recharger')

        return redirect(f'{FRONTEND_URL}/recharger')

    except Exception as e:
        return redirect(f'{FRONTEND_URL}/recharger')







SEB_PUBLIC_KEY = "pk_test_EV0RLmri9X1miEIfjtTjZXBVHScy1WaPdjz9iwdR"
SEB_SECRET_KEY = "sk_test_o2N2UAX2LPPjpHTjXvSh4Wod692cq19sbkRvAvdBN3DUs9xp9VjnBeBohvL0"

COUNTRY_CODE_MAP = {
    "Benin": "BJ",
    "Burkina Faso": "BF",
    "Cote d'Ivoire": "CI",
    "Senegal": "SN",
    "Cameroun": "CM",
    "Congo Brazzaville": "CG",
    "Gabon": "GA"
}

OPERATOR_MAP = {
    "BJ": {
        "MTN Money": "mtn",
        "Moov Money": "moov",
        "Celtiis Money": "celtiis",
        "Free Money": "free"
    },
    "BF": {
        "Orange Money": "orange",
        "Moov Money": "moov",
        "Free Money": "free"
    },
    "CI": {
        "Orange Money": "orange",
        "MTN Money": "mtn",
        "Moov Money": "moov",
        "Wave Money": "wave"
    },
    "SN": {
        "Orange Money": "orange",
        "Free Money": "free",
        "Wave Money": "wave",
        "E-money": "emoney"
    },
    "CM": {
        "Orange Money": "orange",
        "MTN Money": "mtn"
    },
    "CG": {
        "MTN Money": "mtn",
        "Airtel Money": "airtel"
    },
    "GA": {
        "Airtel Money": "airtel",
        "Moov Money": "moov"
    }
}


@app.post("/api/sebpay")
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def subpay(wari_session):
    data = await request.get_json()

    numero = data.get("numero")
    montant = data.get("montant")
    country = data.get("country")
    operator = data.get("operator")

    champs_manquants = []
    if not numero:
        champs_manquants.append("numero")
    if not montant:
        champs_manquants.append("montant")
    if not country:
        champs_manquants.append("country")
    if not operator:
        champs_manquants.append("operator")

    if champs_manquants:
        return jsonify({
            "success": False,
            "message": f"Informations manquantes : {', '.join(champs_manquants)}"
        }), 400

    try:
        montant_float = float(montant)
        if montant_float < 1000:
            return jsonify({
                "success": False,
                "message": "Le montant minimum est de 1000 XOF"
            }), 400
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Le montant doit être un nombre valide"
        }), 400

    country_code = COUNTRY_CODE_MAP.get(country)
    if not country_code:
        return jsonify({
            "success": False,
            "message": f"Pays non supporte : {country}"
        }), 400

    operator_code = operator
    if country_code in OPERATOR_MAP:
        mapped_operator = OPERATOR_MAP[country_code].get(operator)
        if mapped_operator:
            operator_code = mapped_operator

    external_ref = str(uuid.uuid4())

    payload = {
        "amount": montant,
        "currency": "XOF",
        "phone": numero,
        "operator": operator_code,
        "country": country_code,
        "external_reference": external_ref,
        "callback_url": "http://localhost/api/webhook"
    }

    try:
        response = requests.post(
            "https://newapi.sebpay.bj/api/v1/collections",
            json=payload,
            headers={
                "X-Public-Key": SEB_PUBLIC_KEY,
                "X-Secret-Key": SEB_SECRET_KEY,
                "Content-Type": "application/json"
            },
            timeout=30
        )

        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "message": "Le service de paiement ne repond pas. Veuillez reessayer."
        }), 504

    except requests.exceptions.ConnectionError:
        return jsonify({
            "success": False,
            "message": "Impossible de se connecter au service de paiement."
        }), 502

    except requests.exceptions.RequestException:
        return jsonify({
            "success": False,
            "message": "Une erreur est survenue lors de la communication avec SebPay."
        }), 500

    except Exception:
        return jsonify({
            "success": False,
            "message": "Une erreur inattendue est survenue."
        }), 500


@app.post("/api/webhook")
@require_origin
@rate_limit 
@require_ip_score
@track_depot()
async def webhook():
    body = await request.get_data()
    signature = request.headers.get("X-SebPay-Signature")

    expected = hmac.new(
        SECRET_KEY.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if signature != expected:
        return jsonify({
            "success": False,
            "message": "Signature invalide"
        }), 403

    data = await request.get_json()
    status = data.get("status")
    reference = data.get("external_reference")

    return jsonify({
        "success": True
    }), 200










@app.route("/api/historique_depots", methods=["GET"])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def historique_depots(wari_session):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Utilisateur non connecté"}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT amount, date, solde, message
                    FROM mobile_money
                    WHERE user_id=%s
                    ORDER BY date DESC
                    """,
                    (user_id,)
                )
                rows = await cur.fetchall()

        # Transformation des données en dictionnaires
        historique = []
        for row in rows:
            historique.append({
                "amount": row[0],
                "date": row[1].strftime('%d/%m/%Y %H:%M:%S') if row[1] else None,
                "solde": row[2],
                "message": row[3]
            })

        return jsonify({"status": "success", "historique": historique})

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Impossible de récupérer l'historique"
        }), 500


# ==============================================================
# SECTION DE RETRAIT ( PAYOUT ) / GESTION DES RETRAITS DES GAINS 
# ===============================================================


# décorateur pour vérifier dépôt
def depot_required():

    def decorator(func):

        @wraps(func)
        async def wrapper(*args, **kwargs):

            user_id = session.get("user_id")

            if not user_id:
                return jsonify({"error": "Utilisateur non connecté"}), 403

            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(
                        "SELECT COUNT(*) FROM mobile_money WHERE user_id=%s AND amount>0",
                        (user_id,)
                    )
                    result = await cursor.fetchone()

                    if not result or result[0] == 0:
                        return jsonify({
                            "error": "Vous ne pouvez pas retirer sans avoir joué"
                        }), 403


            return await func(*args, **kwargs)

        return wrapper

    return decorator


def track_retrait():
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            response = await func(*args, **kwargs)

            status_code = response[1] if isinstance(response, tuple) else 200

            # 200 = payout démarré, 207 = payout créé mais pas démarré
            if status_code in (200, 207):
                try:
                    montant = getattr(g, "retrait_montant", None)
                    if montant:
                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cursor:
                                await cursor.execute(
                                    "INSERT INTO historique_retraits (montant, date_retrait) VALUES (%s, NOW())",
                                    (montant,)
                                )
                            await conn.commit()
                except Exception:
                    pass

            return response
        return wrapper
    return decorator

FEDAPAY_API_KEY = os.environ.get("FEDAPAY_SECRET")
FEDAPAY_API_URL = "https://api.fedapay.com/v1/payouts"

#-------------#
# Route 1 : Création du payout
# --------------------------

# Fonction pour calculer les frais internes selon le montant demandé
def calculate_internal_fee(amount: float) -> int:
    if amount <= 5000:
        return 50
    elif amount <= 10000:
        return 75
    elif amount <= 25000:
        return 100
    elif amount <= 50000:
        return 150
    elif amount <= 100000:
        return 250
    elif amount <= 250000:
        return 400
    else:  # jusqu'à 500 000
        return 600

# Fonction pour calculer les frais Fedapay
def calculate_fedapay_fee(amount: float) -> int:
    if amount <= 10000:
        return 150
    elif amount <= 50000:
        return 300
    elif amount <= 150000:
        return 800
    elif amount <= 500000:
        return 2000
    else:
        return 2500

@app.route('/api/create-payout', methods=['POST'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
@depot_required()
async def create_payout(wari_session):
    try:

        # Vérification session utilisateur
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        # Récupération des données de la requête
        data = await request.get_json()
        print(data)

        # ✅ Vérification que le body n'est pas vide
        if not data:
            return jsonify({"success": False, "error": "Body invalide"}), 400

        firstname    = data.get("firstname")
        lastname     = data.get("lastname")
        email        = data.get("email")
        phone        = data.get("phone")
        network      = data.get("network")
        amount_raw   = data.get("amount")
        country      = data.get("country")

        # Vérification des champs obligatoires
        if not all([firstname, lastname, email, phone, amount_raw, network, country]):
            return jsonify({"success": False, "error": "Champs manquants"}), 400

        # Conversion sécurisée du montant
        try:
            amount_requested = round(float(amount_raw), 2)  # ✅ Arrondi à 2 décimales
        except (TypeError, ValueError):
            return jsonify({"success": False, "error": "Montant invalide"}), 400

        # ✅ Vérification du montant minimum
        if amount_requested < 1000:
            return jsonify({"success": False, "error": "Le montant minimum autorisé est de 1000 XOF"}), 400

        # Vérification du montant maximum
        if amount_requested > 500000:
            return jsonify({"success": False, "error": "Le montant maximum autorisé est de 500 000 XOF"}), 400

        # Calcul des frais
        internal_fee = calculate_internal_fee(amount_requested)
        fedapay_fee  = calculate_fedapay_fee(amount_requested)
        total_fees   = internal_fee + fedapay_fee
        net_received = amount_requested - total_fees

        if net_received <= 0:
            return jsonify({"success": False, "error": "Montant trop faible après application des frais"}), 400

        # Préfixe international pour Bénin
        if country == "BJ":
            if not phone.startswith("+229"):
                phone = "+229" + phone

        elif country == "CI":
            if not phone.startswith("+225"):
                phone = "+225" + phone

        print(phone)

        # Vérification du réseau
        if network not in ["mtn", "moov", "celtiis", "mtn_ci"]:
            return jsonify({"success": False, "error": "Réseau invalide"}), 400

        pool = await get_pool()

        # ✅ Une seule connexion DB avec FOR UPDATE pour éviter la race condition
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    # ✅ FOR UPDATE → lock sur le solde pendant toute la transaction
                    await cursor.execute(
                        "SELECT solde FROM solde WHERE user_id=%s LIMIT 1 FOR UPDATE",
                        (user_id,)
                    )
                    row = await cursor.fetchone()
                    if not row:
                        return jsonify({"success": False, "error": "Solde introuvable"}), 404

                    current_solde = float(row[0])

                    if amount_requested > current_solde:
                        return jsonify({
                            "success": False,
                            "error": f"Solde insuffisant. Total requis : {amount_requested} XOF"
                        }), 400

                    # Heure programmée pour le payout
                    scheduled_time = datetime.now(timezone.utc) + timedelta(minutes=5)
                    scheduled_at   = scheduled_time.isoformat().replace("+00:00", "Z")

                    # Préparation du payload pour Fedapay
                    payload = {
                        "amount": int(amount_requested - internal_fee),
                        "currency": {"iso": "XOF"},
                        "customer": {
                            "firstname": firstname,
                            "lastname": lastname,
                            "email": email,
                            "phone_number": {
                                "country": country,
                                "number": phone
                            }
                        },
                        "mode": network,
                        "scheduled_at": scheduled_at,
                        "description": "Retrait utilisateur"
                    }

                    headers = {
                        "Authorization": f"Bearer {FEDAPAY_API_KEY}",
                        "Content-Type": "application/json"
                    }

                    # Envoi de la requête à Fedapay pour créer le payout
                    async with httpx.AsyncClient() as client:
                        response = await client.post(FEDAPAY_API_URL, json=payload, headers=headers)

                    # Lecture sécurisée de la réponse de création
                    if response.content:
                        try:
                            response_data = response.json()
                        except Exception:
                            response_data = {"status": response.status_code, "raw_content": response.text}
                    else:
                        response_data = {"status": response.status_code, "message": "No content returned"}

                    # Vérification du statut HTTP de création
                    if response.status_code not in [200, 201]:
                        return jsonify({"success": False, "error": response_data}), response.status_code
                    

                    # Extraction de l'ID du payout créé
                    payout_id = response_data.get("id")

                    if not payout_id and "payout" in response_data:
                        payout_id = response_data.get("payout", {}).get("id")

                    if not payout_id and "data" in response_data:
                        payout_id = response_data.get("data", {}).get("id")

                    if not payout_id:
                        for key in response_data.keys():
                            if isinstance(response_data[key], dict) and "id" in response_data[key]:
                                payout_id = response_data[key]["id"]
                                break

                    if not payout_id:
                        return jsonify({
                            "success": False,
                            "error": "Impossible de récupérer l'ID du payout depuis la réponse FedaPay",
                        }), 500

                    # Conversion en int pour l'API start
                    try:
                        payout_id_int = int(payout_id)
                    except (TypeError, ValueError):
                        return jsonify({
                            "success": False,
                            "error": "Veillez Réessayer"
                        }), 500

                    # === DÉMARRAGE IMMÉDIAT DU PAYOUT ===
                    start_url     = f"{FEDAPAY_API_URL}/start"
                    start_payload = [
                        {
                            "id": payout_id_int,
                            "phone_number": {
                                "number": phone,
                                "country": "BJ"
                            }
                        }
                    ]

                    async with httpx.AsyncClient(timeout=30.0) as client:
                        start_response = await client.put(
                            start_url,
                            json=start_payload,
                            headers=headers
                        )

                    # Lecture de la réponse de démarrage
                    if start_response.content:
                        try:
                            start_data = start_response.json()
                        except Exception:
                            start_data = {
                                "status": start_response.status_code,
                                "raw_content": start_response.text
                            }
                    else:
                        start_data = {
                            "status": start_response.status_code,
                            "message": "Réponse vide"
                        }

                    start_success = start_response.status_code in [200, 201]

                    # ✅ On ne débite le solde QUE si Fedapay a bien démarré le payout
                    if not start_success:
                        return jsonify({
                            "success": False,
                            "error": "Le retrait n'a pas pu être démarré, votre solde n'a pas été débité",
                            "start_error": start_data
                        }), 400

                    # Retrait du solde
                    new_solde = current_solde - amount_requested
                    await cursor.execute(
                        "UPDATE solde SET solde=%s WHERE user_id=%s",
                        (new_solde, user_id)
                    )

                    # Historique dans retraits
                    contact_str    = f"{firstname} {lastname} - {phone}"
                    statut_retrait = "envoyé"
                    await cursor.execute(
                        "INSERT INTO retraits (user_id, methode, montant, contact, statut, created_at, frais) "
                        "VALUES (%s, %s, %s, %s, %s, NOW(), %s)",
                        (user_id, network, net_received, contact_str, statut_retrait, total_fees)
                    )

                    # Mise à jour de la table feeds (stats globales)
                    await cursor.execute("""
                        INSERT INTO feeds (id, total_payouts_count, total_payouts_amount, last_updated)
                        VALUES (1, 1, %s, NOW())
                        ON DUPLICATE KEY UPDATE
                            total_payouts_count  = total_payouts_count + 1,
                            total_payouts_amount = total_payouts_amount + VALUES(total_payouts_amount),
                            last_updated         = NOW()
                    """, (amount_requested,))

                    # ✅ Signal succès pour le décorateur track_retrait
                    g.retrait_montant = amount_requested

                    await conn.commit()

                except Exception as e:
                    await conn.rollback()  # ✅ Rollback si n'importe quelle étape plante
                    app.logger.error(f"Payout error: {e}")
                    return jsonify({"success": False, "error": "Erreur interne"}), 500

        # Construction de la réponse finale
        result = {
            "success": True,
            "payout_created": True,
            "payout_started": start_success,
            "payout_id": payout_id_int,
            "amount_requested": amount_requested,
            "fees": {
                "internal_fee": internal_fee,
                "fedapay_fee": fedapay_fee,
                "total_fees": total_fees,
                "net_received": net_received
            },
            "balance": {
                "previous": current_solde,
                "new": new_solde
            },
            "create_response": response_data,
            "start_response": start_data
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"success": False, "error": "Erreur interne"}), 500



"""
Intégration SebPay Payouts
-----------------------------
- POST /payouts/withdraw -> le frontend appelle cette route pour retirer de l'argent
- POST /webhook/sebpay    -> SebPay appelle cette route quand le statut final est connu

"""

import os
import uuid
import httpx
from quart import request, jsonify

SEBPAY_BASE_URL = "https://newapi.sebpay.bj/api/v1"
SEBPAY_PUBLIC_KEY = os.environ["SEBPAY_PUBLIC_KEY"]
SEBPAY_SECRET_KEY = os.environ["SEBPAY_SECRET_KEY"]


async def sebpay_create_payout(recipient_name, phone, operator, country, amount, currency,
                                external_reference, callback_url=None, description=None):
    payload = {
        "recipient_name": recipient_name,
        "phone": phone,
        "operator": operator,
        "country": country,
        "amount": amount,
        "currency": currency,
        "external_reference": external_reference,
    }
    if callback_url:
        payload["callback_url"] = callback_url
    if description:
        payload["description"] = description

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{SEBPAY_BASE_URL}/payouts",
            json=payload,
            headers={
                "X-Public-Key": SEBPAY_PUBLIC_KEY,
                "X-Secret-Key": SEBPAY_SECRET_KEY,
                "Content-Type": "application/json",
            },
        )

    print(f"[SebPay] POST /payouts -> {resp.status_code} {resp.text}")

    data = resp.json()
    if resp.status_code >= 400:
        raise Exception(data.get("message", "Erreur SebPay"))
    return data


# --- Colle tout ce qui suit dans ton main.py, APRES la ligne `app = Quart(__name__)` ---

@app.route("/api/payouts/withdraw", methods=["POST"])
async def withdraw():
    body = await request.get_json()

    required = ["recipient_name", "phone", "operator", "country", "amount", "currency"]
    missing = [f for f in required if f not in body]
    if missing:
        return jsonify({"success": False, "error": f"Champs manquants: {', '.join(missing)}"}), 400

    external_reference = f"WD-{uuid.uuid4().hex[:12]}"

    try:
        result = await sebpay_create_payout(
            recipient_name=body["recipient_name"],
            phone=body["phone"],
            operator=body["operator"],
            country=body["country"],
            amount=body["amount"],
            currency=body["currency"],
            external_reference=external_reference,
            callback_url=body.get("callback_url", "https://wariplay.online/api/webhook/sebpay"),
            description=body.get("description"),
        )
    except Exception as e:
        print(f"[SebPay] Echec payout: {e}")
        return jsonify({"success": False, "error": str(e)}), 502

    return jsonify({
        "success": True,
        "message": "Retrait en cours de traitement",
        "transaction_id": result["transaction_id"],
        "status": result["status"],
        "external_reference": result["external_reference"],
        "total_deducted": result.get("total_deducted"),
    }), 202


@app.route("/api/webhook/sebpay", methods=["POST"])
async def sebpay_webhook():
    payload = await request.get_json(silent=True)
    print(f"[SebPay] Webhook reçu: {payload}")

    if not payload or "external_reference" not in payload or "status" not in payload:
        return jsonify({"error": "payload invalide"}), 400

    # TODO: mettre à jour ta base de données ici
    # ex: UPDATE payouts SET status = payload["status"] WHERE external_reference = payload["external_reference"]

    if payload["status"] == "rejected":
        print(f"[SebPay] Payout rejeté, solde remboursé: {payload['external_reference']}")

    return jsonify({"received": True}), 200


@app.route('/api/historique-retraits')
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def historique_retraits(wari_session):
    user_id = session['user_id']
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                    SELECT id, methode, montant, contact, statut, created_at, frais 
                    FROM retraits 
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    LIMIT 100
                """
                await cur.execute(query, (user_id,))
                rows = await cur.fetchall()

                # Récupération des colonnes depuis description
                columns = [col[0] for col in cur.description]

                retraits = [dict(zip(columns, row)) for row in rows]

                # Formatage des résultats
                result = []
                for retrait in retraits:
                    result.append({
                        'id': retrait['id'],
                        'methode': retrait['methode'],
                        'montant': float(retrait['montant']),
                        'contact': retrait['contact'],
                        'statut': retrait['statut'].lower(),
                        'created_at': retrait['created_at'].strftime('%Y-%m-%d %H:%M:%S'),
                        'frais': float(retrait['frais'])
                    })

        return jsonify({'data': result})

    except Exception as e:
        return jsonify({'error': 'Erreur serveur'}), 500



# ====================================================================
# SYSTEME DU JEU CLOUD_RUN
# ====================================================================

from typing import Dict, Optional, Any

user_sessions: Dict[str, dict] = {}
game_states: Dict[str, dict] = {}

GAME_DURATION = 120


async def log_game_result(user_id: int, has_won: bool, amount: float, game_type: str = "cloud_run"):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            try:
                now = datetime.now()

                if has_won:
                    message = f"L'utilisateur {user_id} vient de gagner {amount:.2f} XOF"
                else:
                    message = f"L'utilisateur {user_id} vient de perdre {amount:.2f} XOF"

                print(f"[log_game_result] user_id={user_id} has_won={has_won} amount={amount} game_type={game_type}")

                # 1️⃣ Historique brut dans stats
                await cursor.execute(
                    """
                    INSERT INTO stats
                    (user_id, game_type, total_gains, total_losses, last_message,
                     last_result, last_amount, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (user_id, game_type,
                     amount if has_won else 0.0,
                     0.0 if has_won else amount,
                     message,
                     "win" if has_won else "loss",
                     amount, now, now)
                )
                print("[log_game_result] INSERT stats OK")

                # 2️⃣ Compteurs + montants + parties jouées par utilisateur (user_stats)
                gains_incr = 1 if has_won else 0
                pertes_incr = 0 if has_won else 1
                montant_gain = amount if has_won else 0.0
                montant_perte = 0.0 if has_won else amount
                parties_incr = 1  # toujours incrémenté, peu importe le résultat

                await cursor.execute(
                    """
                    INSERT INTO user_stats
                    (user_id, nombre_gains, nombre_pertes, montant_gains, montant_pertes, nombre_parties, derniere_mise)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW()) AS new
                    ON DUPLICATE KEY UPDATE
                        user_stats.nombre_gains = user_stats.nombre_gains + new.nombre_gains,
                        user_stats.nombre_pertes = user_stats.nombre_pertes + new.nombre_pertes,
                        user_stats.montant_gains = user_stats.montant_gains + new.montant_gains,
                        user_stats.montant_pertes = user_stats.montant_pertes + new.montant_pertes,
                        user_stats.nombre_parties = user_stats.nombre_parties + new.nombre_parties
                    """,
                    (user_id, gains_incr, pertes_incr, montant_gain, montant_perte, parties_incr)
                )
                print(f"[log_game_result] UPDATE user_stats OK (gains+={gains_incr}, pertes+={pertes_incr}, "
                      f"montant_gains+={montant_gain:.2f}, montant_pertes+={montant_perte:.2f}, parties+={parties_incr})")

                # 3️⃣ Compteurs + montants + parties jouées du jour, tous users confondus (today_stats)
                await cursor.execute(
                    """
                    INSERT INTO today_stats
                    (stat_date, nombre_gains, nombre_pertes, montant_gains, montant_pertes, nombre_parties)
                    VALUES (CURDATE(), %s, %s, %s, %s, %s) AS new
                    ON DUPLICATE KEY UPDATE
                        today_stats.nombre_gains = today_stats.nombre_gains + new.nombre_gains,
                        today_stats.nombre_pertes = today_stats.nombre_pertes + new.nombre_pertes,
                        today_stats.montant_gains = today_stats.montant_gains + new.montant_gains,
                        today_stats.montant_pertes = today_stats.montant_pertes + new.montant_pertes,
                        today_stats.nombre_parties = today_stats.nombre_parties + new.nombre_parties
                    """,
                    (gains_incr, pertes_incr, montant_gain, montant_perte, parties_incr)
                )
                print(f"[log_game_result] UPDATE today_stats OK (gains+={gains_incr}, pertes+={pertes_incr}, "
                      f"montant_gains+={montant_gain:.2f}, montant_pertes+={montant_perte:.2f}, parties+={parties_incr})")

                # 4️⃣ Compteurs + montants + parties jouées globaux all-time (globale_states)
                await cursor.execute(
                    """
                    UPDATE globale_states
                    SET nombre_gains_total = nombre_gains_total + %s,
                        nombre_pertes_total = nombre_pertes_total + %s,
                        montant_gains_total = montant_gains_total + %s,
                        montant_pertes_total = montant_pertes_total + %s,
                        nombre_parties_total = nombre_parties_total + %s
                    WHERE id = 1
                    """,
                    (gains_incr, pertes_incr, montant_gain, montant_perte, parties_incr)
                )
                print(f"[log_game_result] UPDATE globale_states OK (gains+={gains_incr}, pertes+={pertes_incr}, "
                      f"montant_gains+={montant_gain:.2f}, montant_pertes+={montant_perte:.2f}, parties+={parties_incr})")

                await conn.commit()
                print("[log_game_result] COMMIT OK")

            except Exception as e:
                await conn.rollback()
                print(f"[log_game_result] ERREUR: {e}")
                raise e


def validate_payload_consistency(session_id: str, payload: dict, game_state: dict) -> tuple[bool, str]:
    score = float(payload.get("score", 0))
    remaining_time = float(payload.get("remainingTime", 0))
    cloud_speed = float(payload.get("cloudSpeed", 0))
    clouds_avoided = float(payload.get("cloudsAvoided", 0))
    
    MAX_SCORE = 50000000
    MAX_CLOUD_SPEED = 10.0
    MAX_CLOUDS = 5000
    
    if score > MAX_SCORE:
        return False, f"Score {score} dépasse le maximum {MAX_SCORE}"
    
    if cloud_speed > MAX_CLOUD_SPEED:
        return False, f"Vitesse nuages {cloud_speed} dépasse le maximum {MAX_CLOUD_SPEED}"
    
    if clouds_avoided > MAX_CLOUDS:
        return False, f"Nuages évités {clouds_avoided} dépasse le maximum {MAX_CLOUDS}"
    
    elapsed_time = GAME_DURATION - remaining_time
    if elapsed_time > 0:
        score_per_sec = score / elapsed_time
        MAX_SCORE_PER_SEC = 200
        if score_per_sec > MAX_SCORE_PER_SEC:
            return False, f"Score/sec {score_per_sec:.2f} dépasse {MAX_SCORE_PER_SEC}"
    
    if game_state and game_state.get("initialized", False):
        last_score = game_state.get("last_score", 0)
        last_time = game_state.get("last_time", GAME_DURATION)
        
        if score < last_score:
            return False, f"Score a diminué: {last_score} -> {score}"
        
        if remaining_time > last_time:
            return False, f"Temps a augmenté: {last_time} -> {remaining_time}"
        
        score_diff = score - last_score
        time_diff = last_time - remaining_time
        if time_diff > 0:
            instant_rate = score_diff / time_diff
            if instant_rate > 300:
                return False, f"Rate instantané trop élevé: {instant_rate:.2f} pts/sec"
        
        game_state["last_score"] = score
        game_state["last_time"] = remaining_time
        game_state["last_cloud_speed"] = cloud_speed
        game_state["last_clouds"] = clouds_avoided
        game_state["last_check"] = time.time()
    else:
        game_state["last_score"] = score
        game_state["last_time"] = remaining_time
        game_state["last_cloud_speed"] = cloud_speed
        game_state["last_clouds"] = clouds_avoided
        game_state["last_check"] = time.time()
        game_state["initialized"] = True
    
    return True, "OK"


def detect_cheat(payload: dict) -> tuple[bool, str, float]:
    score = float(payload.get("score", 0))
    remaining_time = float(payload.get("remainingTime", 0))
    cloud_speed = float(payload.get("cloudSpeed", 0))
    clouds_avoided = float(payload.get("cloudsAvoided", 0))
    
    cheat_detected = False
    reasons = []
    
    MAX_SCORE = 50000000
    MAX_SCORE_PER_SEC = 200
    MAX_CLOUD_SPEED = 10.0
    MAX_CLOUDS = 5000
    
    penalty = 1.0
    
    if score > MAX_SCORE:
        cheat_detected = True
        reasons.append(f"Score max dépassé ({score} > {MAX_SCORE})")
        penalty *= 0.5
    
    elapsed = max(GAME_DURATION - remaining_time, 1)
    rate = score / elapsed
    if rate > MAX_SCORE_PER_SEC:
        cheat_detected = True
        reasons.append(f"Rate score/temps suspect ({rate:.2f} > {MAX_SCORE_PER_SEC})")
        penalty *= 0.5
    
    if cloud_speed > MAX_CLOUD_SPEED:
        cheat_detected = True
        reasons.append(f"Vitesse nuage impossible ({cloud_speed} > {MAX_CLOUD_SPEED})")
        penalty *= 0.5
    
    if clouds_avoided > MAX_CLOUDS:
        cheat_detected = True
        reasons.append(f"Nuages évités impossible ({clouds_avoided} > {MAX_CLOUDS})")
        penalty *= 0.5
    
    reason_str = " | ".join(reasons) if reasons else ""
    return cheat_detected, reason_str, penalty


@app.websocket("/ws/game")
async def ws_game():
    user_id = await authenticate_websocket()
    
    if not user_id:
        return

    session_id = str(uuid.uuid4())
    
    user_sessions[session_id] = {
        "user_id": user_id,
        "websocket": websocket,
        "created_at": datetime.now()
    }
    
    game_states[session_id] = {
        "active": False,
        "win_condition": None,
        "last_score": 0,
        "last_time": GAME_DURATION,
        "last_cloud_speed": 0,
        "last_clouds": 0,
        "last_check": 0,
        "start_time": 0,
        "last_heartbeat": 0,
        "mise": 0,
        "bet_placed": False,
        "initialized": False,
        "has_won": False,
        "game_ended": False
    }

    try:
        while True:
            data = await websocket.receive_json()

            if not await check_ws_message_rate(user_id):
                await websocket.send_json({
                    "success": False,
                    "message": "Trop d'actions, ralentis un peu."
                })
                continue
            
            action = data.get("action")

            if action == "heartbeat":
                game_state = game_states.get(session_id)
                if game_state:
                    game_state["last_heartbeat"] = time.time()
                    payload = data.get("payload", {})
                    game_state["last_score"] = float(payload.get("score", game_state["last_score"]))
                    game_state["last_time"] = float(payload.get("remainingTime", game_state["last_time"]))
                    await websocket.send_json({"event": "heartbeat_ack", "timestamp": time.time()})
                continue

            if action == "get_honor":
                conditions = [
                    {"type": "time", "name": "Durée de survie", "description": "Survivez pendant X secondes", "target": random.randint(10, 20)},
                    {"type": "score", "name": "Score à atteindre", "description": "Atteignez un score de X points", "target": random.randint(100, 1000)},
                    {"type": "clouds", "name": "Nuages évités", "description": "Évitez X nuages", "target": random.randint(10, 50)},
                    {"type": "speed", "name": "Vitesse maximale", "description": "Atteignez une vitesse de X", "target": round(random.uniform(4.0, 7.0), 2)}
                ]
                selected_condition = random.choice(conditions)
                selected_condition["description"] = selected_condition["description"].replace("X", str(selected_condition["target"]))
                
                game_states[session_id]["win_condition"] = selected_condition
                game_states[session_id]["active"] = True
                game_states[session_id]["start_time"] = time.time()
                game_states[session_id]["last_heartbeat"] = time.time()
                
                await websocket.send_json({"event": "honor", "condition": selected_condition})

            elif action == "check_mindset":
                payload = data.get("payload", {})
                game_state = game_states.get(session_id, {})
                session_data = user_sessions.get(session_id, {})
                real_user_id = session_data.get("user_id")

                score = float(payload.get("score", 0))
                remaining_time = float(payload.get("remainingTime", 0))
                clouds_avoided = float(payload.get("cloudsAvoided", 0))
                cloud_speed = float(payload.get("cloudSpeed", 0))
                win_condition_type = payload.get("winConditionType", "")
                win_condition_target = float(payload.get("winConditionTarget", 0))
                mise = float(payload.get("mise", 0))

                game_state["mise"] = mise

                is_valid, validation_reason = validate_payload_consistency(session_id, payload, game_state)
                if not is_valid:
                    await log_game_result(real_user_id, False, mise)
                    game_state["game_ended"] = True
                    await websocket.send_json({
                        "event": "mindset_result",
                        "success": False,
                        "has_won": False,
                        "gain_final": 0,
                        "new_solde": 0,
                        "cheat_detected": True,
                        "reason": f"Données invalides: {validation_reason}",
                        "message": "Défaite - Données incohérentes détectées"
                    })
                    game_states[session_id]["active"] = False
                    continue

                has_won = False
                if win_condition_type == "time":
                    has_won = remaining_time <= 0
                elif win_condition_type == "score":
                    has_won = score >= win_condition_target
                elif win_condition_type == "clouds":
                    has_won = clouds_avoided >= win_condition_target
                elif win_condition_type == "speed":
                    has_won = cloud_speed >= win_condition_target

                gain_final = 0.0
                new_solde = 0.0
                cheat_detected = False
                cheat_reason = ""

                if has_won:
                    cheat_detected, cheat_reason, penalty = detect_cheat(payload)
                    gain_final = mise * 2 * penalty

                    pool = await get_pool()
                    async with pool.acquire() as conn:
                        async with conn.cursor() as cursor:
                            await cursor.execute("SELECT solde FROM solde WHERE user_id=%s", (real_user_id,))
                            result = await cursor.fetchone()
                            if result:
                                current_solde = float(result[0])
                                nouveau_solde = current_solde + gain_final
                                await cursor.execute(
                                    "UPDATE solde SET solde=%s WHERE user_id=%s", 
                                    (nouveau_solde, real_user_id)
                                )
                            else:
                                nouveau_solde = gain_final
                                await cursor.execute(
                                    "INSERT INTO solde (user_id, solde) VALUES (%s, %s)", 
                                    (real_user_id, gain_final)
                                )
                            new_solde = nouveau_solde

                    await log_game_result(real_user_id, True, gain_final)
                    game_state["has_won"] = True
                    game_state["game_ended"] = True
                    
                    await websocket.send_json({
                        "event": "mindset_result",
                        "success": True,
                        "has_won": True,
                        "gain_final": gain_final,
                        "new_solde": new_solde,
                        "cheat_detected": cheat_detected,
                        "cheat_reason": cheat_reason,
                        "message": f"Victoire! +{gain_final:.2f} XOF" + (" (triche détectée - gain réduit)" if cheat_detected else "")
                    })
                else:
                    await log_game_result(real_user_id, False, mise)
                    game_state["game_ended"] = True
                    
                    await websocket.send_json({
                        "event": "mindset_result",
                        "success": True,
                        "has_won": False,
                        "gain_final": 0,
                        "new_solde": new_solde,
                        "cheat_detected": False,
                        "message": "Défaite - Objectif non atteint"
                    })
                
                game_states[session_id]["active"] = False

    except Exception as e:
        try:
            await websocket.send_json({"event": "error", "error": str(e)})
        except:
            pass
    
    finally:
        game_state = game_states.get(session_id, {})
        session_data = user_sessions.get(session_id, {})
        real_user_id = session_data.get("user_id")
        mise = game_state.get("mise", 0)
        has_won = game_state.get("has_won", False)
        game_ended = game_state.get("game_ended", False)
        active = game_state.get("active", False)
        
        if mise > 0 and not has_won:
            if not game_ended or active:
                await log_game_result(real_user_id, False, mise)
        
        if session_id in game_states:
            game_states[session_id]["active"] = False
        if session_id in user_sessions:
            del user_sessions[session_id]


# ====================================================================
# SYSTEME DU JEU MEMO_POP
# ====================================================================

# Symboles disponibles

SYMBOLS = ['🍎', '🍌', '🍒', '🍇', '🥝', '🍉', '🍓', '🍍', '🥭', '🍊']
SYMBOLS_COUNT = 8

# =====================================================
# memo_session.py — Sessions Memo Pop dans Redis (TTL 20 min)
# =====================================================
import json
from datetime import timedelta

from redis_session import get_redis

MEMO_SESSION_PREFIX = "memo_session:"
MEMO_SESSION_TTL = 60 * 20  # 20 minutes


def _serialize(game: dict) -> str:
    # 'matched' est un set, non sérialisable en JSON natif
    data = {**game, "matched": list(game["matched"])}
    return json.dumps(data)


def _deserialize(raw: str) -> dict:
    data = json.loads(raw)
    data["matched"] = set(data["matched"])
    return data


async def save_memo_game(user_id, game: dict):
    redis = await get_redis()
    await redis.setex(
        f"{MEMO_SESSION_PREFIX}{user_id}",
        timedelta(seconds=MEMO_SESSION_TTL),
        _serialize(game),
    )


async def get_memo_game(user_id) -> dict | None:
    redis = await get_redis()
    raw = await redis.get(f"{MEMO_SESSION_PREFIX}{user_id}")
    return _deserialize(raw) if raw else None


async def delete_memo_game(user_id):
    redis = await get_redis()
    await redis.delete(f"{MEMO_SESSION_PREFIX}{user_id}")


win_conditions = [
    {"id": 1, "name": "Vitesse Éclair", "timeLimit": 50, "maxErrors": None, "requirePerfectMatch": True, "multiplier": 1.5},
    {"id": 2, "name": "Expert en Mémoire", "timeLimit": 60, "maxErrors": 4, "requirePerfectMatch": True, "multiplier": 1.8},
    {"id": 4, "name": "Perfectionniste", "timeLimit": None, "maxErrors": 0, "requirePerfectMatch": True, "multiplier": 2.0},
    {"id": 5, "name": "Débutant Chanceux", "timeLimit": None, "maxErrors": None, "requirePerfectMatch": True, "multiplier": 1.2}
]

def select_random_challenge():
    return random.choice(win_conditions)

async def create_game(user_id, bet, objective):
    selected = random.sample(SYMBOLS, SYMBOLS_COUNT)
    deck = selected * 2
    random.shuffle(deck)
    game_token = secrets.token_hex(16)
    
    game = {
        "token": game_token,
        "start_time": time.time(),
        "deck": deck,
        "revealed": [],
        "matched": set(),
        "errors": 0,
        "matches": 0,
        "bet": bet,
        "objective": objective,
        "finished": False
    }
    await save_memo_game(user_id, game)
    return deck, game_token

def get_elapsed(game):
    return int(time.time() - game["start_time"])

async def check_objective(game, user_id):
    elapsed = get_elapsed(game)
    errors = game["errors"]
    matches = game["matches"]
    total_pairs = len(game["deck"]) // 2

    for cond in win_conditions:
        if cond["name"] != game["objective"]:
            continue

        if cond["maxErrors"] is not None and errors > cond["maxErrors"]:
            game["finished"] = True
            await save_memo_game(user_id, game)
            await log_game_result(user_id, False, game["bet"], "memo_pop")
            return {"success": False, "condition": cond, "reason": f"Erreur(s) dépassant la limite ({errors}/{cond['maxErrors']})"}

        if cond["timeLimit"] is not None and elapsed > cond["timeLimit"]:
            game["finished"] = True
            await save_memo_game(user_id, game)
            await log_game_result(user_id, False, game["bet"], "memo_pop")
            return {"success": False, "condition": cond, "reason": f"Temps dépassé ({elapsed}s > {cond['timeLimit']}s)"}

        if cond["requirePerfectMatch"] and matches == total_pairs:
            game["finished"] = True
            win_amount = game["bet"] * cond["multiplier"]
            try:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                            (win_amount, user_id)
                        )
            except Exception:
                pass

            await save_memo_game(user_id, game)
            await log_game_result(user_id, True, win_amount, "memo_pop")
            return {"success": True, "win": win_amount, "condition": cond}

    return None

async def handle_click(user_id, index, token):
    game = await get_memo_game(user_id)
    if not game or game["finished"]:
        return {"error": "Partie invalide"}
    
    if token != game.get("token"):
        return {"error": "Token invalide – tentative de triche détectée"}

    if index in game["matched"] or index in game["revealed"]:
        return {"ignore": True}

    game["revealed"].append(index)
    result = {"flip": index, "symbol": game["deck"][index]}

    if len(game["revealed"]) == 2:
        i1, i2 = game["revealed"]
        if game["deck"][i1] == game["deck"][i2]:
            game["matched"].update([i1, i2])
            game["matches"] += 1
            result["match"] = True
        else:
            game["errors"] += 1
            result["match"] = False
        game["revealed"] = []

    result["errors"] = game["errors"]
    result["matches"] = game["matches"]

    check = await check_objective(game, user_id)
    if check:
        result["auto_finish"] = True
        result.update(check)
    else:
        await save_memo_game(user_id, game)

    return result

async def finish_game(user_id, token):
    game = await get_memo_game(user_id)
    if not game:
        return {"success": False}

    if token != game.get("token"):
        return {"success": False, "error": "Token invalide – tentative de triche détectée"}

    game["finished"] = True
    elapsed = get_elapsed(game)
    errors = game["errors"]
    matches = game["matches"]
    total_pairs = len(game["deck"]) // 2

    await save_memo_game(user_id, game)

    for cond in win_conditions:
        if cond["name"] != game["objective"]:
            continue
        
        if cond["requirePerfectMatch"] and matches != total_pairs:
            return {"success": False}
        if cond["timeLimit"] is not None and elapsed > cond["timeLimit"]:
            return {"success": False}
        if cond["maxErrors"] is not None and errors > cond["maxErrors"]:
            return {"success": False}

        win = game["bet"] * cond["multiplier"]
        return {"success": True, "win": win, "condition": cond}

    return {"success": False}


@app.websocket("/ws/memo")
async def memo_ws():
    user_id = None
    ws_closed = False
    
    try:
        user_id = await authenticate_websocket()
        
        if not user_id:
            try:
                await websocket.send(json.dumps({"type": "error", "message": "Authentification requise"}))
            except:
                pass
            return
        
        game_name = "Memo Pop"
        game_exists = await check_game_exists(user_id, game_name)
                
        if not game_exists:
            await websocket.send_json({
                "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
                "action": "game_not_found"
            })
            await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
            return

        selected_challenge = select_random_challenge()
        
        try:
            await websocket.send(json.dumps({
                "type": "win_condition", 
                "condition": selected_challenge
            }))
        except Exception:
            return

        while True:
            try:
                raw_msg = await websocket.receive()
                
                try:
                    payload = json.loads(raw_msg)
                except json.JSONDecodeError:
                    continue

                if not await check_ws_message_rate(user_id):
                    await websocket.send_json({
                        "success": False,
                        "message": "Trop d'actions, ralentis un peu."
                    })
                    continue

                if payload.get("type") == "start_game":
                    bet = payload.get("bet")
                    objective = selected_challenge["name"]
                    deck, token = await create_game(user_id, bet, objective)
                    
                    response = {"type": "game_started", "deck": deck, "token": token}
                    
                    try:
                        await websocket.send(json.dumps(response))
                    except Exception:
                        await delete_memo_game(user_id)
                        raise

                elif payload.get("type") == "click":
                    token = payload.get("token")
                    index = payload.get("index")
                    
                    result = await handle_click(user_id, index, token)
                    response = {"type": "state", **result}
                    
                    try:
                        await websocket.send(json.dumps(response))
                    except Exception:
                        raise
                    
                    if result.get("auto_finish"):
                        await delete_memo_game(user_id)

                elif payload.get("type") == "end_game":
                    token = payload.get("token")
                    result = await finish_game(user_id, token)
                    response = {"type": "win_result", **result}
                    
                    try:
                        await websocket.send(json.dumps(response))
                    except Exception:
                        raise
                    
                    if result.get("success"):
                        await log_game_result(user_id, True, result["win"], "memo_pop")
                    else:
                        game = await get_memo_game(user_id)
                        if game:
                            await log_game_result(user_id, False, game["bet"], "memo_pop")
                    
                    await delete_memo_game(user_id)

                else:
                    pass

            except Exception:
                break

    except Exception:
        pass
    
    finally:
        ws_closed = True




@app.route('/api/decrement_memo', methods=['POST'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def decrement_memo(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # SELECT ... FOR UPDATE
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s FOR UPDATE",
                    ('Memo Pop', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name=%s AND user_id=%s",
                    ('Memo Pop', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500

# --- Récupérer les vies Memo Pop ---
@app.route('/api/get_memo', methods=['GET'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_memo(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s",
                    ('Memo Pop', user_id)
                )
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Memo Pop'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Memo Pop',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Memo Pop'
                }), 500

# ====================================================================
# SYSTEME DU JEU SYNO_POP
# ====================================================================
import traceback

WORDS_PATH = os.path.join('html 1', 'lang', 'words.json')

# Charger et mélanger les mots
async def load_words(limit=20):
    if not os.path.exists(WORDS_PATH):
        raise FileNotFoundError(f"Le fichier {WORDS_PATH} n'existe pas.")

    async with aiofiles.open(WORDS_PATH, 'r', encoding='utf-8') as f:
        content = await f.read()
        words = json.loads(content)

    random.shuffle(words)
    return words[:limit]

# Générer l'objectif
def generate_syno_objective():
    total_questions = 20
    questions_to_answer = random.randint(5, total_questions)
    objective_type = random.choice([1, 2])

    obj = {
        "type": objective_type,
        "text": "",
        "total_questions": total_questions,
        "questions_to_answer": questions_to_answer
    }

    if objective_type == 1:
        obj["text"] = f"Réponds à {questions_to_answer} questions sur {total_questions}"
    else:
        allowed_errors = random.randint(2, 4)
        obj["allowed_errors"] = allowed_errors
        obj["text"] = (
            f"Réponds à {questions_to_answer} questions sur {total_questions} "
            f"avec seulement {allowed_errors} erreurs autorisées"
        )

    return obj

# =====================================================
# syno_session.py — Sessions Syno stockées dans Redis (TTL 20 min)
# =====================================================

SYNO_SESSION_PREFIX = "syno_session:"
SYNO_SESSION_TTL = 60 * 20  # 20 minutes


async def create_syno_session(game_session_id: str, session_data: dict):
    redis = await get_redis()
    # Les 'set' ne sont pas sérialisables en JSON natif — on convertit en liste
    data_to_store = {**session_data, "answered_questions": list(session_data["answered_questions"])}
    await redis.setex(
        f"{SYNO_SESSION_PREFIX}{game_session_id}",
        timedelta(seconds=SYNO_SESSION_TTL),
        json.dumps(data_to_store),
    )


async def get_syno_session(game_session_id: str) -> dict | None:
    redis = await get_redis()
    raw = await redis.get(f"{SYNO_SESSION_PREFIX}{game_session_id}")
    if not raw:
        return None
    data = json.loads(raw)
    data["answered_questions"] = set(data["answered_questions"])
    return data


async def update_syno_session(game_session_id: str, session_data: dict):
    """Réécrit la session complète et RENOUVELLE le TTL à 20 min —
    tant que le joueur est actif, sa session ne doit pas expirer en plein jeu."""
    await create_syno_session(game_session_id, session_data)


async def delete_syno_session(game_session_id: str):
    redis = await get_redis()
    await redis.delete(f"{SYNO_SESSION_PREFIX}{game_session_id}")



@app.websocket('/ws/ws_syno')
async def ws_syno():
    game_session_id = None
    try:
        
        user_id = await authenticate_websocket()
        
        if not user_id:
            try:
                await websocket.send(json.dumps({"type": "error", "message": "Authentification requise"}))
            except:
                pass
            return

        init_data = await websocket.receive_json()

        if not isinstance(init_data, dict):
            await websocket.send(json.dumps({"error": "Message initial invalide"}))
            return

        mise = float(init_data.get("mise", 0))

        game_session_id = str(uuid.uuid4())

        words_full = await load_words(20)
        objective = generate_syno_objective()
        errors_remaining = objective.get("allowed_errors", 0)
        questions_to_answer = objective["questions_to_answer"]
        score = 0
        gains_par_question = (mise * 1.5) / questions_to_answer
        gains_actuels = 0.0

        # Stockage de la session dans Redis (TTL 20 min, auto-nettoyage garanti)
        session_data = {
            "user_id": user_id,
            "mise": mise,
            "gains_actuels": gains_actuels,
            "score": score,
            "errors_remaining": errors_remaining,
            "objective": objective,
            "answered_questions": set(),
            "timestamp": time.time()
        }
        await create_syno_session(game_session_id, session_data)

        words_for_client = [
            {"id": idx, "word": w["word"], "options": w["options"]}
            for idx, w in enumerate(words_full)
        ]

        await websocket.send(json.dumps({
            "objective": objective,
            "words": words_for_client,
            "game_session_id": game_session_id
        }))

        # 2️⃣ Boucle pour recevoir les réponses
        for idx, word_data in enumerate(words_full):
            data = await websocket.receive_json()

            if not isinstance(data, dict):
                await websocket.send(json.dumps({"error": "Message invalide"}))
                continue

            if not await check_ws_message_rate(user_id):
                await websocket.send(json.dumps({"error": "Trop d'actions, ralentis un peu."}))
                continue

            client_session_id = data.get("game_session_id")
            if client_session_id != game_session_id:
                await websocket.send(json.dumps({"error": "Session invalide"}))
                return

            word_id = data.get("word_id")
            selection = data.get("selection")

            session_data = await get_syno_session(game_session_id)
            if session_data is None:
                # Session expirée (20 min écoulées) ou déjà supprimée
                await websocket.send(json.dumps({"error": "Session expirée, veuillez recommencer"}))
                return

            if word_id in session_data["answered_questions"]:
                await websocket.send(json.dumps({"error": "Question déjà répondue"}))
                continue

            session_data["answered_questions"].add(word_id)

            correct_word = words_full[word_id]["correct"]
            if selection == correct_word:
                correct = True
                session_data["score"] += 1
                session_data["gains_actuels"] += gains_par_question
            else:
                correct = False
                if objective["type"] == 2:
                    session_data["errors_remaining"] -= 1

            await update_syno_session(game_session_id, session_data)

            await websocket.send(json.dumps({
                "word_id": word_id,
                "correct": correct,
                "score": session_data["score"],
                "gains_actuels": round(session_data["gains_actuels"], 2),
                "errors_remaining": session_data["errors_remaining"]
            }))

            if objective["type"] == 2 and session_data["errors_remaining"] <= 0:
                await websocket.send(json.dumps({"game_over": True, "reason": "Trop d'erreurs", "gains": 0}))
                await log_game_result(user_id, False, mise, "syno_pop")
                await delete_syno_session(game_session_id)
                return

            if session_data["score"] >= questions_to_answer:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                            (round(session_data["gains_actuels"], 2), user_id)
                        )
                        await conn.commit()

                gains_final = round(session_data["gains_actuels"], 2)
                
                await websocket.send(json.dumps({
                    "game_over": True,
                    "reason": "Objectif atteint",
                    "gains": gains_final
                }))
                
                await log_game_result(user_id, True, gains_final, "syno_pop")
                await delete_syno_session(game_session_id)
                return

        await websocket.send(json.dumps({
            "game_over": True,
            "reason": "Toutes les questions terminées mais objectif non rempli",
            "gains": 0
        }))
        
        await log_game_result(user_id, False, 0.0, "syno_pop")
        await delete_syno_session(game_session_id)

    except Exception as e:
        traceback.print_exc()
        try:
            await websocket.send(json.dumps({"error": str(e)}))
        except Exception:
            pass
        if game_session_id:
            await delete_syno_session(game_session_id)



# ====================================================================
# SYSTEME DU JEU 2048
# ====================================================================

# Stockage sessions
active_sessions: Dict[str, Dict] = {}
connected_clients: Dict[str, Set] = {}
pending_credits: Set[str] = set()

class Game2048:
    """Implémentation complète du jeu 2048 côté serveur"""
    
    def __init__(self):
        self.grid = [0] * 16
        self.score = 0
        self.add_random_tile()
        self.add_random_tile()
    
    def add_random_tile(self):
        """Ajoute une tuile aléatoire (2 ou 4)"""
        empty_cells = [i for i, val in enumerate(self.grid) if val == 0]
        if empty_cells:
            random_index = random.choice(empty_cells)
            self.grid[random_index] = 2 if random.random() < 0.9 else 4
            return True
        return False
    
    def move(self, direction: str) -> bool:
        """Effectue un mouvement et retourne True si mouvement effectué"""
        moved = False
        
        if direction == 'left':
            moved = self._move_left()
        elif direction == 'right':
            moved = self._move_right()
        elif direction == 'up':
            moved = self._move_up()
        elif direction == 'down':
            moved = self._move_down()
        
        if moved:
            self.add_random_tile()
        
        return moved
    
    def _move_left(self) -> bool:
        moved = False
        for row in range(4):
            start = row * 4
            row_cells = self.grid[start:start+4]
            new_row = self._process_row(row_cells)
            
            for col in range(4):
                idx = start + col
                if self.grid[idx] != new_row[col]:
                    moved = True
                self.grid[idx] = new_row[col]
        
        return moved
    
    def _move_right(self) -> bool:
        moved = False
        for row in range(4):
            start = row * 4
            row_cells = self.grid[start:start+4][::-1]
            new_row = self._process_row(row_cells)[::-1]
            
            for col in range(4):
                idx = start + col
                if self.grid[idx] != new_row[col]:
                    moved = True
                self.grid[idx] = new_row[col]
        
        return moved
    
    def _move_up(self) -> bool:
        moved = False
        for col in range(4):
            col_cells = [self.grid[row*4 + col] for row in range(4)]
            new_col = self._process_row(col_cells)
            
            for row in range(4):
                idx = row*4 + col
                if self.grid[idx] != new_col[row]:
                    moved = True
                self.grid[idx] = new_col[row]
        
        return moved
    
    def _move_down(self) -> bool:
        moved = False
        for col in range(4):
            col_cells = [self.grid[row*4 + col] for row in range(3, -1, -1)]
            new_col = self._process_row(col_cells)
            
            for row in range(3, -1, -1):
                idx = row*4 + col
                if self.grid[idx] != new_col[3-row]:
                    moved = True
                self.grid[idx] = new_col[3-row]
        
        return moved
    
    def _process_row(self, row: List[int]) -> List[int]:
        """Fusionne une rangée comme dans 2048"""
        filtered = [cell for cell in row if cell != 0]
        
        i = 0
        while i < len(filtered) - 1:
            if filtered[i] == filtered[i + 1]:
                filtered[i] *= 2
                self.score += filtered[i]
                del filtered[i + 1]
            i += 1
        
        while len(filtered) < 4:
            filtered.append(0)
        
        return filtered
    
    def can_move(self) -> bool:
        """Vérifie si des mouvements sont encore possibles"""
        if any(cell == 0 for cell in self.grid):
            return True
        
        for i in range(16):
            row, col = divmod(i, 4)
            
            if col < 3 and self.grid[i] == self.grid[i + 1]:
                return True
            
            if row < 3 and self.grid[i] == self.grid[i + 4]:
                return True
        
        return False
    
    def get_state(self) -> Dict:
        """Retourne l'état actuel du jeu"""
        return {
            'grid': self.grid.copy(),
            'score': self.score,
            'can_move': self.can_move()
        }

def generate_objectif() -> Dict:
    """Génère un objectif aléatoire"""
    objectifs = [
        {
            "type": "score_time",
            "name": "Score en temps limité",
            "target": random.choice([500, 1000, 1500]),
            "time": random.choice([30, 45, 60]),
            "description": "Atteindre X points en X secondes"
        },
        {
            "type": "tile_2048",
            "name": "Atteindre 2048",
            "target": 2048,
            "time": None,
            "description": "Atteindre la tuile 2048"
        }
    ]
    
    return random.choice(objectifs)

def calcul_2048(score: float, mise: float) -> int:
    """Le gain est simplement le double de la mise"""
    gain_final = mise * 2
    return int(round(gain_final, 0))

@app.websocket("/ws/2048")
async def game_session_ws():
    # Récupérer l'objet WebSocket
    ws_connection = websocket._get_current_object()
    session_id = None
    user_id = None
    
    try:
        user_id = await authenticate_websocket()
        
        if not user_id:
            try:
                await websocket.send(json.dumps({"type": "error", "message": "Authentification requise"}))
            except:
                pass
            return
        
        # Étape 1: Initialisation
        init_data = await ws_connection.receive()
        init_message = json.loads(init_data)

        if init_message.get("type") != "init":
            await ws_connection.send(json.dumps({
                "type": "error",
                "reason": "message_init_manquant"
            }))
            return

        # Générer un ID de session pour le jeu
        session_id = init_message.get("session_id") or f"game_{int(time.time())}_{secrets.token_hex(8)}"
        
        # Lire correctement betAmount
        bet_amount = 0
        if "betAmount" in init_message and init_message["betAmount"] is not None:
            try:
                bet_amount = float(init_message["betAmount"])
            except (ValueError, TypeError):
                bet_amount = 0.0

        # Créer le jeu 2048
        game = Game2048()
        
        # Création de la session de jeu (DIFFÉRENTE de la session Quart)
        session_data = {
            "game": game,
            "bet_amount": bet_amount,
            "objectif": None,
            "game_active": False,
            "already_won": False,
            "ws": ws_connection,
            "last_activity": time.time()
        }
        
        # Stocker dans active_sessions
        active_sessions[session_id] = session_data
        
        # Enregistrer dans connected_clients
        if user_id not in connected_clients:
            connected_clients[user_id] = set()
        connected_clients[user_id].add(ws_connection)

        # Accusé de réception
        await ws_connection.send(json.dumps({
            "type": "init_ok",
            "session_id": session_id,
            "timestamp": int(time.time())
        }))

        # Étape 2: Générer et envoyer l'objectif
        objectif = generate_objectif()
        session_data["objectif"] = objectif
        
        await ws_connection.send(json.dumps({
            "type": "objectif",
            "objectif": objectif,
            "timestamp": int(time.time())
        }))
        
        # Étape 3: Boucle principale de communication
        while True:
            try:
                data = await asyncio.wait_for(ws_connection.receive(), timeout=30)
                message = json.loads(data)

                if not await check_ws_message_rate(user_id):
                    await websocket.send_json({
                        "type": "error",
                        "error": "Trop d'actions, ralentis un peu."
                    })
                    continue

                # RÉCUPÉRER LES DONNÉES DE SESSION
                session_data = active_sessions.get(session_id)
                if not session_data:
                    break

                # Mettre à jour le timestamp d'activité
                session_data["last_activity"] = time.time()
                
                msg_type = message.get("type")

                if msg_type == "heartbeat":
                    await ws_connection.send(json.dumps({
                        "type": "heartbeat_ok",
                        "timestamp": int(time.time())
                    }))

                elif msg_type == "objectif_ack":
                    session_data["game_active"] = True
                    
                    # Envoyer l'état initial du jeu
                    game_state = session_data["game"].get_state()
                    await ws_connection.send(json.dumps({
                        "type": "game_started",
                        "grid": game_state["grid"],
                        "score": game_state["score"],
                        "timestamp": int(time.time())
                    }))

                elif msg_type == "move":
                    if not session_data.get("game_active"):
                        continue

                    direction = message.get("direction")
                    game = session_data["game"]
                    
                    # Effectuer le mouvement côté serveur
                    moved = game.move(direction)
                    
                    if moved:
                        # Mouvement réussi
                        new_state = game.get_state()
                        
                        await ws_connection.send(json.dumps({
                            "type": "move_result",
                            "valid": True,
                            "grid": new_state["grid"],
                            "score": new_state["score"],
                            "timestamp": int(time.time())
                        }))
                        
                        # Vérifier si objectif atteint
                        await check_objectif(session_id, user_id)
                        
                    else:
                        # Mouvement invalide
                        await ws_connection.send(json.dumps({
                            "type": "move_result",
                            "valid": False,
                            "reason": "mouvement_impossible",
                            "timestamp": int(time.time())
                        }))
                        
                        # Vérifier si le jeu est bloqué
                        if not game.can_move():
                            session_data["game_active"] = False
                            await check_objectif(session_id, user_id, no_moves=True)

                elif msg_type == "no_moves":
                    game = session_data["game"]
                    if not game.can_move():
                        session_data["game_active"] = False
                        await check_objectif(session_id, user_id, no_moves=True)

                elif msg_type == "timeout":
                    session_data["game_active"] = False
                    await check_objectif(session_id, user_id, timeout=True)

                elif msg_type == "close":
                    break

            except asyncio.TimeoutError:
                try:
                    await ws_connection.send(json.dumps({
                        "type": "heartbeat_check",
                        "timestamp": int(time.time())
                    }))
                except:
                    break
            except json.JSONDecodeError:
                break
            except Exception:
                break

    except json.JSONDecodeError:
        pass
    except Exception:
        pass
    finally:
        if session_id:
            if session_id in active_sessions:
                del active_sessions[session_id]
            pending_credits.discard(session_id)

        if user_id and user_id in connected_clients:
            connected_clients[user_id].discard(ws_connection)
            if not connected_clients[user_id]:
                del connected_clients[user_id]

async def check_objectif(session_id: str, user_id: int, **kwargs):
    """Vérifie si l'objectif est atteint"""
    session_data = active_sessions.get(session_id)
    if not session_data or session_data.get("already_won"):
        return
    
    objectif = session_data.get("objectif")
    game = session_data.get("game")
    
    if not objectif or not game:
        return
    
    state = game.get_state()
    score = state["score"]
    grid = state["grid"]
    
    result = {
        "status": "pending",
        "reason": "En cours"
    }
    
    if objectif["type"] == "score_time":
        target = objectif["target"]
        
        if kwargs.get("timeout"):
            if score >= target:
                result = {
                    "status": "success",
                    "reason": f"Score atteint à temps: {score}/{target}"
                }
            else:
                result = {
                    "status": "fail",
                    "reason": f"Temps écoulé! Score: {score}/{target}"
                }
        elif score >= target:
            result = {
                "status": "success",
                "reason": f"Objectif atteint: {score}/{target}"
            }
        elif kwargs.get("no_moves") or not game.can_move():
            if score >= target:
                result = {
                    "status": "success",
                    "reason": f"Objectif atteint avant blocage: {score}/{target}"
                }
            else:
                result = {
                    "status": "fail",
                    "reason": f"Plus de mouvements! Score: {score}/{target}"
                }
    
    elif objectif["type"] == "tile_2048":
        if 2048 in grid:
            result = {
                "status": "success",
                "reason": "Tuile 2048 atteinte!"
            }
        elif kwargs.get("no_moves") or not game.can_move():
            result = {
                "status": "fail",
                "reason": "Plus de mouvements! Tuile 2048 non atteinte"
            }
    
    if result["status"] in ["success", "fail"]:
        session_data["game_active"] = False
        bet_amount = session_data.get("bet_amount", 0)
        
        if result["status"] == "success":
            session_data["already_won"] = True
            gains = calcul_2048(score, bet_amount)
            
            # Enregistrer le gain dans la base de données
            await log_game_result(user_id, True, gains, "2048")
            
            # MISE À JOUR RÉELLE DU SOLDE EN BASE DE DONNÉES (IMMÉDIATE)
            try:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                            (gains, user_id)
                        )
                        await conn.commit()
                
                # Récupérer le nouveau solde
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            "SELECT solde FROM solde WHERE user_id = %s",
                            (user_id,)
                        )
                        row = await cur.fetchone()
                        new_solde = float(row[0]) if row else 0.0
            except Exception:
                new_solde = 0.0
            
            try:
                await session_data["ws"].send(json.dumps({
                    "type": "objectif_result",
                    "result": "success",
                    "reason": result["reason"],
                    "gains": gains,
                    "new_solde": new_solde,
                    "timestamp": int(time.time())
                }))
                # Attendre 500ms pour que le message soit bien livré
                await asyncio.sleep(0.5)
            except:
                pass
                
            try:
                await session_data["ws"].close()
            except:
                pass
                
        elif result["status"] == "fail":
            # Enregistrer la perte dans la base de données
            await log_game_result(user_id, False, bet_amount, "2048")
            
            try:
                await session_data["ws"].send(json.dumps({
                    "type": "objectif_result",
                    "result": "fail",
                    "reason": result["reason"],
                    "timestamp": int(time.time())
                }))
                # Attendre 500ms pour que le message soit bien livré
                await asyncio.sleep(0.5)
                
                await session_data["ws"].send(json.dumps({
                    "type": "game_over",
                    "reason": result["reason"],
                    "timestamp": int(time.time())
                }))
            except:
                pass
                
            try:
                await session_data["ws"].close()
            except:
                pass

async def cleanup_inactive_sessions():
    """Nettoie les sessions inactives toutes les minutes"""
    while True:
        await asyncio.sleep(60)
        now = time.time()

        for session_id in list(active_sessions.keys()):
            session_data = active_sessions[session_id]
            
            if now - session_data["last_activity"] > 300:
                try:
                    ws = session_data["ws"]
                    await ws.send(json.dumps({
                        "type": "session_timeout",
                        "reason": "inactivite"
                    }))
                except:
                    pass
                finally:
                    del active_sessions[session_id]
                    pending_credits.discard(session_id)





# ====================================================================
# SYSTEME DU JEU NEURO_DAME
# ====================================================================

# Configuration de sécurité
MAX_GAMES_PER_SESSION = 10
MAX_MOVES_PER_GAME = 800
SESSION_TIMEOUT = timedelta(hours=2)

class DameSession:
    """Classe pour gérer la sécurité des sessions de jeu"""
    
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}
        self.session_games: Dict[str, set] = {}
        self.game_sessions: Dict[str, str] = {}
    
    def create_session(self, session_token: str) -> Dict:
        """Créer une nouvelle session"""
        session_data = {
            'created_at': datetime.now(),
            'last_activity': datetime.now(),
            'active_games': 0,
            'total_moves': 0,
            'ip_address': self._get_client_ip(),
            'user_agent': self._get_user_agent()
        }
        self.sessions[session_token] = session_data
        self.session_games[session_token] = set()
        return session_data
    
    def validate_session(self, session_token: str) -> bool:
        """Valider une session"""
        if session_token not in self.sessions:
            return False
        
        session_data = self.sessions[session_token]
        
        # Vérifier le timeout
        if datetime.now() - session_data['last_activity'] > SESSION_TIMEOUT:
            self.cleanup_session(session_token)
            return False
        
        # Mettre à jour la dernière activité
        session_data['last_activity'] = datetime.now()
        
        return True
    
    def can_create_game(self, session_token: str) -> bool:
        """Vérifier si la session peut créer une nouvelle partie"""
        if session_token not in self.sessions:
            return False
        
        session_data = self.sessions[session_token]
        return session_data['active_games'] < MAX_GAMES_PER_SESSION
    
    def register_game(self, session_token: str, game_id: str):
        """Enregistrer une nouvelle partie pour une session"""
        if session_token in self.session_games:
            self.session_games[session_token].add(game_id)
            self.game_sessions[game_id] = session_token
        
        if session_token in self.sessions:
            self.sessions[session_token]['active_games'] += 1
    
    def unregister_game(self, game_id: str):
        """Supprimer l'enregistrement d'une partie"""
        if game_id in self.game_sessions:
            session_token = self.game_sessions[game_id]
            if session_token in self.session_games:
                self.session_games[session_token].discard(game_id)
            
            if session_token in self.sessions:
                self.sessions[session_token]['active_games'] = max(0, 
                    self.sessions[session_token]['active_games'] - 1)
            
            del self.game_sessions[game_id]
    
    def increment_moves(self, session_token: str):
        """Incrémenter le compteur de mouvements"""
        if session_token in self.sessions:
            self.sessions[session_token]['total_moves'] += 1
    
    def cleanup_session(self, session_token: str):
        """Nettoyer une session expirée"""
        if session_token in self.sessions:
            # Nettoyer les jeux associés
            if session_token in self.session_games:
                for game_id in list(self.session_games[session_token]):
                    self.unregister_game(game_id)
                del self.session_games[session_token]
            
            del self.sessions[session_token]
    
    def cleanup_expired_sessions(self):
        """Nettoyer toutes les sessions expirées"""
        expired = []
        for token, data in self.sessions.items():
            if datetime.now() - data['last_activity'] > SESSION_TIMEOUT:
                expired.append(token)
        
        for token in expired:
            self.cleanup_session(token)
    
    def _get_client_ip(self) -> str:
        """Obtenir l'adresse IP du client"""
        try:
            return websocket.remote_addr if websocket else 'unknown'
        except:
            return 'unknown'
    
    def _get_user_agent(self) -> str:
        """Obtenir le user-agent"""
        try:
            return request.headers.get('User-Agent', 'unknown')
        except:
            return 'unknown'

# Initialiser le gestionnaire de sessions
session_manager = DameSession()

class CheckersAI:
    def __init__(self, board_size: int = 10):
        self.BOARD_SIZE = board_size
        self.AI_PLAYER = 'black'
        self.HUMAN_PLAYER = 'white'
        
    def create_empty_board(self):
        return [[None for _ in range(self.BOARD_SIZE)] for _ in range(self.BOARD_SIZE)]
    
    def setup_board(self):
        board = self.create_empty_board()
        
        # Pions noirs (AI) en haut
        for row in range(4):
            for col in range(self.BOARD_SIZE):
                if (row + col) % 2 == 1:
                    board[row][col] = {'type': 'pawn', 'color': self.AI_PLAYER}
        
        # Pions blancs (humain) en bas
        for row in range(self.BOARD_SIZE - 4, self.BOARD_SIZE):
            for col in range(self.BOARD_SIZE):
                if (row + col) % 2 == 1:
                    board[row][col] = {'type': 'pawn', 'color': self.HUMAN_PLAYER}
        
        return board
    
    def clone_board(self, board):
        return [[cell.copy() if cell else None for cell in row] for row in board]
    
    def is_valid_position(self, row: int, col: int) -> bool:
        return 0 <= row < self.BOARD_SIZE and 0 <= col < self.BOARD_SIZE
    
    def get_all_capture_moves_for_piece(self, board, row: int, col: int, visited: set = None):
        if visited is None:
            visited = set()
        
        piece = board[row][col]
        if not piece:
            return []
        
        key = f"{row},{col}"
        if key in visited:
            return []
        visited.add(key)
        
        moves = []
        max_capture_length = 1 if piece['type'] == 'pawn' else self.BOARD_SIZE - 1
        
        directions = []
        if piece['type'] == 'pawn':
            if piece['color'] == self.HUMAN_PLAYER:
                directions = [(-1, -1), (-1, 1)]
            else:
                directions = [(1, -1), (1, 1)]
        else:  # king
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
        
        for dx, dy in directions:
            for dist in range(1, max_capture_length + 1):
                adj_row = row + (dx * dist)
                adj_col = col + (dy * dist)
                
                if not self.is_valid_position(adj_row, adj_col):
                    break
                
                adj_piece = board[adj_row][adj_col]
                if not adj_piece:
                    continue
                
                if adj_piece['color'] != piece['color']:
                    land_row = adj_row + dx
                    land_col = adj_col + dy
                    
                    if (self.is_valid_position(land_row, land_col) and 
                        not board[land_row][land_col]):
                        capture = {'row': adj_row, 'col': adj_col}
                        
                        original_board = self.clone_board(board)
                        board[land_row][land_col] = piece.copy()
                        board[row][col] = None
                        board[adj_row][adj_col] = None
                        
                        additional_captures = self.get_all_capture_moves_for_piece(
                            board, land_row, land_col, visited.copy()
                        )
                        
                        board[:] = original_board
                        
                        if additional_captures:
                            for additional_move in additional_captures:
                                moves.append({
                                    'row': additional_move['row'],
                                    'col': additional_move['col'],
                                    'captures': [capture] + additional_move['captures']
                                })
                        else:
                            moves.append({
                                'row': land_row,
                                'col': land_col,
                                'captures': [capture]
                            })
                    break
                else:
                    break
        
        return moves
    
    def get_valid_moves_for_piece(self, board, row: int, col: int):
        piece = board[row][col]
        if not piece:
            return []
        
        capture_moves = self.get_all_capture_moves_for_piece(board, row, col)
        if capture_moves:
            return capture_moves
        
        moves = []
        
        if piece['type'] == 'pawn':
            if piece['color'] == self.HUMAN_PLAYER:
                directions = [(-1, -1), (-1, 1)]
            else:
                directions = [(1, -1), (1, 1)]
            
            for dx, dy in directions:
                new_row = row + dx
                new_col = col + dy
                
                if (self.is_valid_position(new_row, new_col) and 
                    not board[new_row][new_col]):
                    moves.append({
                        'row': new_row,
                        'col': new_col,
                        'captures': []
                    })
        else:  # king
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
            
            for dx, dy in directions:
                current_row = row + dx
                current_col = col + dy
                
                while self.is_valid_position(current_row, current_col):
                    if not board[current_row][current_col]:
                        moves.append({
                            'row': current_row,
                            'col': current_col,
                            'captures': []
                        })
                        current_row += dx
                        current_col += dy
                    else:
                        break
        
        return moves
    
    def get_all_moves_for_player(self, board, player: str):
        moves = []
        
        for row in range(self.BOARD_SIZE):
            for col in range(self.BOARD_SIZE):
                piece = board[row][col]
                if piece and piece['color'] == player:
                    piece_moves = self.get_valid_moves_for_piece(board, row, col)
                    for move in piece_moves:
                        moves.append({
                            'from': {'row': row, 'col': col},
                            'to': {'row': move['row'], 'col': move['col']},
                            'captures': move['captures'],
                            'piece': piece.copy()
                        })
        
        return moves
    
    def will_promote(self, move, player: str) -> bool:
        """Vérifier si le mouvement entraîne une promotion"""
        piece = move['piece']
        if piece['type'] != 'pawn':
            return False
        
        promotion_row = 0 if player == self.HUMAN_PLAYER else self.BOARD_SIZE - 1
        return move['to']['row'] == promotion_row
    
    def evaluate_move(self, board, move, player: str) -> int:
        score = 0
        
        # Bonus pour les captures
        score += len(move['captures']) * 100
        
        # Bonus pour la promotion
        if self.will_promote(move, player):
            score += 150
        
        # Bonus pour le centre
        center_rows = [4, 5]
        center_cols = [4, 5]
        if (move['to']['row'] in center_rows and 
            move['to']['col'] in center_cols):
            score += 30
        
        # Simuler le mouvement pour évaluer les risques
        original_board = self.clone_board(board)
        self.simulate_move(board, move)
        
        # Pénalité si le mouvement expose la pièce à une capture
        penalty = 0
        for r in range(self.BOARD_SIZE):
            for c in range(self.BOARD_SIZE):
                p = board[r][c]
                if p and p['color'] != player:
                    captures = self.get_all_capture_moves_for_piece(board, r, c)
                    for capture in captures:
                        if any(cap['row'] == move['to']['row'] and 
                               cap['col'] == move['to']['col'] 
                               for cap in capture['captures']):
                            penalty += 80
        
        score -= penalty
        board[:] = original_board
        
        return score
    
    def simulate_move(self, board, move):
        piece = board[move['from']['row']][move['from']['col']]
        board[move['to']['row']][move['to']['col']] = piece.copy()
        board[move['from']['row']][move['from']['col']] = None
        
        for capture in move['captures']:
            board[capture['row']][capture['col']] = None
        
        # Promotion en dame
        if piece['type'] == 'pawn':
            promotion_row = 0 if piece['color'] == self.HUMAN_PLAYER else self.BOARD_SIZE - 1
            if move['to']['row'] == promotion_row:
                board[move['to']['row']][move['to']['col']]['type'] = 'king'
    
    def get_best_move(self, board, max_time: int = 2000):
        start_time = datetime.now()
        
        all_moves = self.get_all_moves_for_player(board, self.AI_PLAYER)
        
        if not all_moves:
            return None
        
        # Trier les mouvements par qualité
        all_moves.sort(key=lambda m: (
            -len(m['captures']),  # Plus de captures d'abord
            -self.evaluate_move(board, m, self.AI_PLAYER)  # Meilleure évaluation ensuite
        ))
        
        # Si on a assez de temps, on peut faire une recherche plus approfondie
        elapsed = (datetime.now() - start_time).total_seconds() * 1000
        
        if elapsed > max_time:
            # Sélectionner parmi les 3 meilleurs mouvements
            top_moves = all_moves[:min(3, len(all_moves))]
            return random.choice(top_moves)
        
        # Retourner le meilleur mouvement
        return all_moves[0] if all_moves else None
    
    def check_game_state(self, board):
        human_pieces = 0
        ai_pieces = 0
        human_moves = 0
        ai_moves = 0
        
        for row in range(self.BOARD_SIZE):
            for col in range(self.BOARD_SIZE):
                piece = board[row][col]
                if piece:
                    moves = self.get_valid_moves_for_piece(board, row, col)
                    if piece['color'] == self.HUMAN_PLAYER:
                        human_pieces += 1
                        human_moves += len(moves)
                    else:
                        ai_pieces += 1
                        ai_moves += len(moves)
        
        if human_pieces == 0 or human_moves == 0:
            return {'winner': self.AI_PLAYER, 'reason': 'human_no_pieces_or_moves'}
        elif ai_pieces == 0 or ai_moves == 0:
            return {'winner': self.HUMAN_PLAYER, 'reason': 'ai_no_pieces_or_moves'}
        
        return {'winner': None, 'reason': 'game_continues'}


class CheckersGame:
    def __init__(self):
        self.ai = CheckersAI()
        self.active_games: Dict[str, Dict] = {}
    
    def create_game(self, game_id: str, bet_amount: int, user_id: str, session_token: str):
        board = self.ai.setup_board()
        self.active_games[game_id] = {
            'board': board,
            'current_player': 'white',
            'turn_count': 1,
            'bet_amount': bet_amount,
            'user_id': user_id,
            'session_token': session_token,
            'move_history': [],
            'created_at': datetime.now(),
            'move_count': 0
        }
        return board
    
    def get_valid_moves(self, game_id: str, from_pos: Dict):
        """Calculer les mouvements valides pour une pièce donnée"""
        if game_id not in self.active_games:
            return {'success': False, 'error': 'Game not found'}
        
        game = self.active_games[game_id]
        board = game['board']
        
        from_row = from_pos['row']
        from_col = from_pos['col']
        
        piece = board[from_row][from_col]
        if not piece:
            return {'success': False, 'error': 'No piece at position'}
        
        # Calculer les mouvements valides
        valid_moves = self.ai.get_valid_moves_for_piece(board, from_row, from_col)
        
        return {
            'success': True,
            'valid_moves': valid_moves,
            'piece': piece
        }
    
    def get_game_state(self, game_id: str):
        if game_id not in self.active_games:
            return None
        
        game = self.active_games[game_id]
        
        # Vérifier l'état du jeu
        game_state = self.ai.check_game_state(game['board'])
        
        state = {
            'board': game['board'],
            'current_player': game['current_player'],
            'turn_count': game['turn_count'],
            'bet_amount': game['bet_amount'],
            'game_state': game_state,
            'move_history': game['move_history'][-10:],
            'move_count': game['move_count']
        }
        return state
    
    def make_move(self, game_id: str, from_pos: Dict, to_pos: Dict):
        if game_id not in self.active_games:
            return {'success': False, 'error': 'Game not found'}
        
        game = self.active_games[game_id]
        
        # Vérifier le nombre maximum de mouvements
        if game['move_count'] >= MAX_MOVES_PER_GAME:
            return {'success': False, 'error': 'Maximum moves reached'}
        
        board = game['board']
        
        from_row = from_pos['row']
        from_col = from_pos['col']
        to_row = to_pos['row']
        to_col = to_pos['col']
        
        piece = board[from_row][from_col]
        if not piece:
            return {'success': False, 'error': 'Invalid move'}
        
        if piece['color'] != game['current_player']:
            return {'success': False, 'error': 'Invalid move'}
        
        # Vérifier si le mouvement est valide
        valid_moves = self.ai.get_valid_moves_for_piece(board, from_row, from_col)
        move = None
        for valid_move in valid_moves:
            if (valid_move['row'] == to_row and 
                valid_move['col'] == to_col):
                move = valid_move
                break
        
        if not move:
            return {'success': False, 'error': 'Invalid move'}
        
        # Vérifier la promotion
        will_promote = self.ai.will_promote({
            'from': from_pos,
            'to': to_pos,
            'piece': piece
        }, game['current_player'])
        
        # Exécuter le mouvement
        self.ai.simulate_move(board, {
            'from': from_pos,
            'to': to_pos,
            'captures': move['captures'],
            'piece': piece
        })
        
        # Ajouter à l'historique
        game['move_history'].append({
            'from': from_pos.copy(),
            'to': to_pos.copy(),
            'piece': piece.copy(),
            'captures': [c.copy() for c in move['captures']],
            'will_promote': will_promote
        })
        
        # Incrémenter le compteur de mouvements
        game['move_count'] += 1
        
        # Changer de joueur
        game['current_player'] = 'white' if game['current_player'] == 'black' else 'black'
        
        if game['current_player'] == 'white':
            game['turn_count'] += 1
        
        # Vérifier l'état du jeu
        game_state = self.ai.check_game_state(board)
        
        # Vérifier s'il y a des captures supplémentaires possibles
        additional_captures = []
        if move['captures'] and not will_promote:
            additional_captures = self.ai.get_all_capture_moves_for_piece(board, to_row, to_col)
        
        result = {
            'success': True,
            'new_board': board,
            'current_player': game['current_player'],
            'turn_count': game['turn_count'],
            'game_state': game_state,
            'move': move,
            'move_count': game['move_count'],
            'will_promote': will_promote,
            'additional_captures': additional_captures
        }
        return result
    
    def get_ai_move(self, game_id: str):
        if game_id not in self.active_games:
            return {'success': False, 'error': 'Game not found'}
        
        game = self.active_games[game_id]
        
        if game['current_player'] != 'black':
            return {'success': False, 'error': 'Not AI turn'}
        
        # Vérifier le nombre maximum de mouvements
        if game['move_count'] >= MAX_MOVES_PER_GAME:
            return {'success': False, 'error': 'Maximum moves reached'}
        
        best_move = self.ai.get_best_move(game['board'])
        
        if not best_move:
            return {'success': False, 'error': 'No moves available'}
        
        # Exécuter le mouvement de l'IA
        result = self.make_move(game_id, best_move['from'], best_move['to'])
        
        if result['success']:
            result['ai_move'] = best_move
        
        return result
    
    def cleanup_old_games(self, hours_old: int = 24):
        """Nettoyer les vieilles parties"""
        cutoff = datetime.now() - timedelta(hours=hours_old)
        to_remove = []
        
        for game_id, game in self.active_games.items():
            if game['created_at'] < cutoff:
                to_remove.append(game_id)
        
        for game_id in to_remove:
            if game_id in self.active_games:
                # Libérer la session
                session_token = self.active_games[game_id].get('session_token')
                if session_token:
                    session_manager.unregister_game(game_id)
                del self.active_games[game_id]


game_manager = CheckersGame()

# Fonction pour mettre à jour le solde dans la base de données
async def update_user_balance(user_id: str, amount: int, is_win: bool = True):
    """
    Met à jour le solde de l'utilisateur
    is_win: True pour gain, False pour remboursement
    """
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                if is_win:
                    # Ajouter les gains (montant x 1.95)
                    await cursor.execute(
                        "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                        (amount, user_id)
                    )
                    await conn.commit()
                    return {'success': True, 'amount': amount, 'type': 'win'}
                else:
                    # Rembourser la mise (égalité)
                    await cursor.execute(
                        "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                        (amount, user_id)
                    )
                    await conn.commit()
                    return {'success': True, 'amount': amount, 'type': 'refund'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


@app.websocket('/ws/dame')
async def dame_websocket():
    """
    WebSocket pour le jeu de dame
    """
    game_id = None
    user_id = await authenticate_websocket()
    
    if not user_id:
        try:
            await websocket.send(json.dumps({"type": "error", "message": "Authentification requise"}))
        except:
            pass
        return

    game_name = "Neuro Dame"  # ou "GridPop" selon votre base de données
    game_exists = await check_game_exists(user_id, game_name)
            
    if not game_exists:
        await websocket.send_json({
            "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
            "action": "game_not_found"
        })
        await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
        return
    
    session_token = None
    
    # Nettoyer les sessions expirées périodiquement
    session_manager.cleanup_expired_sessions()
    
    try:
        while True:
            message = await websocket.receive()

            if not await check_ws_message_rate(user_id):
                await websocket.send_json({
                    "type": "error",
                    "error": "Trop d'actions, ralentis un peu."
                })
                continue
            try:
                data = json.loads(message)
                event_type = data.get('type')
                
                # Authentification requise pour tous les événements sauf auth
                if event_type != 'auth':
                    session_token = data.get('session_token')
                    if not session_token:
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session token required'
                        }))
                        continue
                    
                    # Valider la session
                    if not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'auth_failed',
                            'message': 'Session invalide ou expirée'
                        }))
                        continue
                
                if event_type == 'auth':
                    # Authentification initiale
                    session_token = data.get('session_token')
                    if not session_token:
                        session_token = str(uuid.uuid4())
                    
                    if not session_manager.validate_session(session_token):
                        session_manager.create_session(session_token)
                    
                    await websocket.send(json.dumps({
                        'type': 'auth_success',
                        'session_token': session_token,
                        'message': 'Session sécurisée établie'
                    }))
                
                elif event_type == 'new_game':
                    # Créer une nouvelle partie
                    bet_amount = data.get('bet_amount', 100)
                    session_token = data.get('session_token')
                    
                    # Vérifier la session
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    # Vérifier la mise
                    if bet_amount < 100 or bet_amount > 1000:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Mise invalide (100-1000 XOF)'
                        }))
                        continue
                    
                    # Vérifier si la session peut créer une nouvelle partie
                    if not session_manager.can_create_game(session_token):
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Nombre maximum de parties atteint pour cette session'
                        }))
                        continue
                    
                    game_id = f"game_{datetime.now().timestamp()}_{random.randint(1000, 9999)}"
                    board = game_manager.create_game(game_id, bet_amount, user_id, session_token)
                    
                    # Enregistrer la partie dans la session
                    session_manager.register_game(session_token, game_id)
                    
                    await websocket.send(json.dumps({
                        'type': 'game_created',
                        'game_id': game_id,
                        'board': board,
                        'current_player': 'white',
                        'turn_count': 1
                    }))
                
                elif event_type == 'get_valid_moves':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    from_pos = data.get('from')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    result = game_manager.get_valid_moves(game_id, from_pos)
                    
                    if result['success']:
                        await websocket.send(json.dumps({
                            'type': 'valid_moves',
                            'valid_moves': result['valid_moves'],
                            'piece': result['piece']
                        }))
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': result.get('error', 'Error getting valid moves')
                        }))
                
                elif event_type == 'get_state':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    state = game_manager.get_game_state(game_id)
                    if state:
                        await websocket.send(json.dumps({
                            'type': 'game_state',
                            'state': state
                        }))
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Game not found'
                        }))
                
                elif event_type == 'make_move':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    from_pos = data.get('from')
                    to_pos = data.get('to')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    if not from_pos or not to_pos:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Missing move data'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    # Incrémenter le compteur de mouvements pour la session
                    session_manager.increment_moves(session_token)
                    
                    result = game_manager.make_move(game_id, from_pos, to_pos)
                    
                    if result['success']:
                        await websocket.send(json.dumps({
                            'type': 'move_made',
                            'result': result
                        }))
                        
                        # Vérifier si la partie est terminée
                        if result['game_state']['winner']:
                            game_info = game_manager.active_games[game_id]
                            bet_amount = game_info['bet_amount']
                            
                            if result['game_state']['winner'] == 'white':  # Victoire du joueur
                                win_amount = int(bet_amount * 2)
                                balance_result = await update_user_balance(user_id, win_amount, True)
                                
                                # LOGUER LA VICTOIRE
                                await log_game_result(user_id, True, win_amount, "Neuro Dame")
                                
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'victory',
                                    'message': 'Victoire !',
                                    'win_amount': win_amount,
                                    'balance_update': balance_result
                                }))
                                
                            elif result['game_state']['winner'] == 'black':  # Défaite
                                # LOGUER LA DÉFAITE
                                await log_game_result(user_id, False, bet_amount, "Neuro Dame")
                                
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'defeat',
                                    'message': 'Défaite',
                                    'loss_amount': bet_amount
                                }))
                            
                            # Nettoyer la partie
                            if game_id in game_manager.active_games:
                                session_manager.unregister_game(game_id)
                                del game_manager.active_games[game_id]
                            
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': result.get('error', 'Invalid move')
                        }))
                
                elif event_type == 'ai_move':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    # Vérifier que c'est bien le tour de l'IA
                    state = game_manager.get_game_state(game_id)
                    if not state or state['current_player'] != 'black':
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Not AI turn'
                        }))
                        continue
                    
                    # Faire réfléchir l'IA
                    await websocket.send(json.dumps({
                        'type': 'ai_thinking',
                        'message': 'WARI réfléchit...'
                    }))
                    
                    # Simuler un temps de réflexion
                    await asyncio.sleep(0.5)
                    
                    # Incrémenter le compteur de mouvements pour la session
                    session_manager.increment_moves(session_token)
                    
                    # Obtenir le mouvement de l'IA
                    result = game_manager.get_ai_move(game_id)
                    
                    if result['success']:
                        await websocket.send(json.dumps({
                            'type': 'ai_move_made',
                            'result': result
                        }))
                        
                        # Vérifier si la partie est terminée
                        if result['game_state']['winner']:
                            game_info = game_manager.active_games[game_id]
                            bet_amount = game_info['bet_amount']
                            
                            if result['game_state']['winner'] == 'white':  # Victoire du joueur
                                win_amount = int(bet_amount * 2)
                                balance_result = await update_user_balance(user_id, win_amount, True)
                                
                                # LOGUER LA VICTOIRE
                                await log_game_result(user_id, True, win_amount, "Neuro Dame")
                                
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'victory',
                                    'message': 'Victoire !',
                                    'win_amount': win_amount,
                                    'balance_update': balance_result
                                }))
                                
                            elif result['game_state']['winner'] == 'black':  # Défaite
                                # LOGUER LA DÉFAITE
                                await log_game_result(user_id, False, bet_amount, "Neuro Dame")
                                
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'defeat',
                                    'message': 'Défaite',
                                    'loss_amount': bet_amount
                                }))
                            
                            # Nettoyer la partie
                            if game_id in game_manager.active_games:
                                session_manager.unregister_game(game_id)
                                del game_manager.active_games[game_id]
                            
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': result.get('error', 'AI failed to move')
                        }))
                
                elif event_type == 'check_draw':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    state = game_manager.get_game_state(game_id)
                    if state and state['turn_count'] > 60:
                        game_info = game_manager.active_games[game_id]
                        bet_amount = game_info['bet_amount']
                        
                        # Rembourser la mise
                        balance_result = await update_user_balance(user_id, bet_amount, False)
                        
                        await websocket.send(json.dumps({
                            'type': 'game_result',
                            'result': 'draw',
                            'message': 'Match nul ! Remboursement de la mise.',
                            'refund_amount': bet_amount,
                            'balance_update': balance_result
                        }))
                        
                        # Nettoyer la partie
                        if game_id in game_manager.active_games:
                            session_manager.unregister_game(game_id)
                            del game_manager.active_games[game_id]
                
                elif event_type == 'reset':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if game_id and game_id in game_manager.active_games:
                        # Vérifier que la partie appartient à cette session
                        if game_id in session_manager.game_sessions:
                            if session_manager.game_sessions[game_id] != session_token:
                                await websocket.send(json.dumps({
                                    'type': 'session_error',
                                    'message': 'Cette partie ne vous appartient pas'
                                }))
                                continue
                        
                        session_manager.unregister_game(game_id)
                        del game_manager.active_games[game_id]
                    
                    await websocket.send(json.dumps({
                        'type': 'game_reset',
                        'message': 'Game reset successfully'
                    }))
                
                else:
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'message': f'Unknown event type: {event_type}'
                    }))
            
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON'
                }))
            except Exception as e:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': f'Server error: {str(e)}'
                }))
    
    except Exception as e:
        # Gérer la déconnexion
        if game_id and game_id in game_manager.active_games:
            session_manager.unregister_game(game_id)

# Tâche périodique pour nettoyer les vieilles parties
async def cleanup_old_games_periodically():
    while True:
        await asyncio.sleep(3600)  # Toutes les heures
        game_manager.cleanup_old_games()
        session_manager.cleanup_expired_sessions()


# --- Décrémenter les vies Neuro Dame ---
@app.route('/api/decrement_Ndame', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def decrement_Ndame(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # SELECT ... FOR UPDATE
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s FOR UPDATE",
                    ('Neuro Dame', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name=%s AND user_id=%s",
                    ('Neuro Dame', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500

# --- Récupérer les vies Neuro Dame ---
@app.route('/api/get_Ndame', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_Ndame(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s",
                    ('Neuro Dame', user_id)
                )
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Neuro Dame'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Neuro Dame',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({
                    'error': 'Erreur interne',
                    'product': 'Neuro Dame'
                }), 500

# ====================================================================
# SYSTEME DU JEU NEURO_XO
# ====================================================================

# Dictionnaire pour stocker les sessions de jeu actives
active_game_sessions = {}
# Dictionnaire pour les verrous de sessions
session_locks = {}
# Dictionnaire pour stocker les nonces utilisés (prévention replay)
used_nonces = set()

# Fonctions de base pour le jeu - REPRODUCTION EXACTE DU JAVASCRIPT
def get_empty_cells(board):
    """Reproduction EXACTE de xGetEmptyCells()"""
    return [index for index, cell in enumerate(board) if cell == '']

def check_winner_for_player(board, player):
    """Reproduction EXACTE de xCheckWinnerForPlayer()"""
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    
    for combination in winning_combinations:
        if all(board[index] == player for index in combination):
            return True
    return False

def get_winning_combination(board):
    """Reproduction EXACTE de xGetWinningCombination()"""
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    
    for combination in winning_combinations:
        a, b, c = combination
        if board[a] and board[a] == board[b] and board[a] == board[c]:
            return combination
    return None

def is_board_full(board):
    """Reproduction EXACTE de xIsBoardFull()"""
    return all(cell != '' for cell in board)

# CORRECTION ICI : Fonction calcul de gains modifiée
def calculate_prize_for_session(session_data):
    """Calcul des gains basé sur les données de session"""
    result = session_data.get('result', 'draw')
    bet_amount = session_data.get('bet_amount', 0)
    difficulty = session_data.get('difficulty', 'medium')
    
    if result == 'player':
        if difficulty == 'hard':
            return int(bet_amount * 2.0)  # Gain 2x sur difficulté hard
        else:  # medium
            return int(bet_amount * 1.5)  # Gain 1.5x sur medium
    elif result == 'computer':
        return 0  # Pas de gain si l'IA gagne
    elif result == 'draw':
        return bet_amount  # Remboursement
    return 0

# Classe IA avec TOUTE la logique de l'ancien JavaScript
class GameAI:
    def __init__(self):
        self.difficulty = 'medium'
        
    def set_difficulty(self, difficulty):
        self.difficulty = difficulty
    
    def random_move(self, board):
        """Reproduction EXACTE de xRandomMove()"""
        available_moves = get_empty_cells(board)
        if available_moves:
            return random.choice(available_moves)
        return None
    
    def advanced_ai(self, board, player):
        """Reproduction EXACTE de xAdvancedAI() - algorithme MinMax"""
        available_moves = get_empty_cells(board)
        
        # Évaluation terminale
        if check_winner_for_player(board, 'O'):
            return {'score': 10}
        if check_winner_for_player(board, 'X'):
            return {'score': -10}
        if not available_moves:
            return {'score': 0}
        
        moves = []
        
        for move_index in available_moves:
            move = {'index': move_index}
            
            # Faire le mouvement
            board[move_index] = player
            
            # Récursivité
            if player == 'O':
                result = self.advanced_ai(board, 'X')
                move['score'] = result['score']
            else:
                result = self.advanced_ai(board, 'O')
                move['score'] = result['score']
            
            # Annuler le mouvement
            board[move_index] = ''
            moves.append(move)
        
        # Choisir le meilleur mouvement
        if player == 'O':
            best_score = -float('inf')
            best_move_index = 0
            for i, move in enumerate(moves):
                if move['score'] > best_score:
                    best_score = move['score']
                    best_move_index = i
        else:
            best_score = float('inf')
            best_move_index = 0
            for i, move in enumerate(moves):
                if move['score'] < best_score:
                    best_score = move['score']
                    best_move_index = i
        
        return moves[best_move_index]
    
    def computer_move(self, board):
        """Reproduction EXACTE de xComputerMove()"""
        if self.difficulty == 'medium':
            # 50% chance de mouvement aléatoire, 50% chance d'IA avancée
            if random.random() < 0.5:
                return self.random_move(board)
            else:
                return self.advanced_ai(board, 'O')['index']
        elif self.difficulty == 'hard':
            return self.advanced_ai(board, 'O')['index']
        else:
            return self.advanced_ai(board, 'O')['index']
    
    def check_game_state(self, board, current_player):
        """Vérifier l'état COMPLET du jeu avec TOUTE la logique"""
        # Vérifier les gagnants
        x_wins = check_winner_for_player(board, 'X')
        o_wins = check_winner_for_player(board, 'O')
        
        # Vérifier si le plateau est plein
        draw = is_board_full(board)
        
        # Obtenir la combinaison gagnante
        winning_line = get_winning_combination(board)
        
        # Déterminer le résultat
        game_result = 'ongoing'
        if x_wins:
            game_result = 'player'
        elif o_wins:
            game_result = 'computer'
        elif draw:
            game_result = 'draw'
        
        return {
            'game_result': game_result,
            'x_wins': x_wins,
            'o_wins': o_wins,
            'draw': draw,
            'winning_line': winning_line,
            'empty_cells': get_empty_cells(board),
            'current_player': current_player
        }

# Instance globale de l'IA
game_ai = GameAI()

# NOUVEAU : Fonction de validation anti-replay
def validate_nonce(nonce, user_id, timestamp=None, max_age=300):
    """Valider un nonce pour éviter les attaques par rejeu"""
    # Vérifier que le nonce n'a pas déjà été utilisé
    nonce_key = f"{user_id}:{nonce}"
    if nonce_key in used_nonces:
        return False, "Nonce déjà utilisé"
    
    # Vérifier le timestamp si fourni
    if timestamp:
        current_time = int(time.time())
        if abs(current_time - timestamp) > max_age:
            return False, "Timestamp expiré"
    
    # Marquer le nonce comme utilisé
    used_nonces.add(nonce_key)
    
    # Nettoyer les anciens nonces (plus vieux que 1 heure)
    cleanup_old_nonces()
    
    return True, "Nonce valide"

def cleanup_old_nonces():
    """Nettoyer les anciens nonces (simplifié - en production utiliser Redis avec TTL)"""
    global used_nonces
    # Pour simplifier, on limite la taille du set
    if len(used_nonces) > 10000:
        # Garder seulement les 5000 plus récents
        used_nonces = set(list(used_nonces)[-5000:])

def generate_nonce():
    """Générer un nonce unique"""
    return hashlib.sha256(f"{random.getrandbits(256)}:{time.time()}".encode()).hexdigest()[:32]

# NOUVEAU : Gestionnaire de verrous pour sessions
@asynccontextmanager
async def session_lock(session_id, timeout=5):
    """Verrou asynchrone pour une session"""
    if session_id not in session_locks:
        session_locks[session_id] = asyncio.Lock()
    
    lock = session_locks[session_id]
    
    try:
        # Acquérir le verrou avec timeout
        await asyncio.wait_for(lock.acquire(), timeout=timeout)
        yield
    except asyncio.TimeoutError:
        raise Exception(f"Timeout sur le verrou de session {session_id}")
    finally:
        if lock.locked():
            lock.release()
            # Nettoyer les verrous inutilisés
            if session_id in session_locks:
                del session_locks[session_id]

# Fonctions de gestion des sessions
def generate_game_session_id(user_id, bet_amount):
    """Générer un ID de session de jeu unique avec timestamp"""
    timestamp = int(time.time())
    unique_string = f"{user_id}_{bet_amount}_{timestamp}_{random.randint(1000, 9999)}"
    session_hash = hashlib.sha256(unique_string.encode()).hexdigest()[:16]
    return f"game_{session_hash}"

def create_game_session(user_id, bet_amount, difficulty):
    """Créer une nouvelle session de jeu avec nonce initial"""
    session_id = generate_game_session_id(user_id, bet_amount)
    
    # Générer un nonce initial pour la session
    initial_nonce = generate_nonce()
    
    game_session = {
        'session_id': session_id,
        'user_id': user_id,
        'bet_amount': bet_amount,
        'difficulty': difficulty,
        'board': [''] * 9,
        'current_player': 'X',
        'game_over': False,
        'created_at': datetime.now(),
        'last_activity': datetime.now(),
        'moves_history': [],
        'initial_nonce': initial_nonce,
        'last_nonce': initial_nonce,
        'ws_connection': None,
        'result': None,
        'prize': 0
    }
    
    active_game_sessions[session_id] = game_session
    return session_id

def get_game_session(session_id):
    """Récupérer une session de jeu"""
    if session_id in active_game_sessions:
        active_game_sessions[session_id]['last_activity'] = datetime.now()
        return active_game_sessions[session_id]
    return None

def update_game_session(session_id, board, current_player, game_over=False, move=None, result=None, prize=None):
    """Mettre à jour une session de jeu"""
    if session_id in active_game_sessions:
        session_data = active_game_sessions[session_id]
        session_data['board'] = board.copy()
        session_data['current_player'] = current_player
        session_data['game_over'] = game_over
        session_data['last_activity'] = datetime.now()
        
        if result is not None:
            session_data['result'] = result
            # CORRECTION ICI : Calcul du prix basé sur les données session
            session_data['prize'] = calculate_prize_for_session(session_data)
        
        if move is not None:
            session_data['moves_history'].append({
                'player': current_player,
                'move': move,
                'timestamp': datetime.now().isoformat()
            })
        
        return True
    return False

def cleanup_old_sessions():
    """Nettoyer les anciennes sessions"""
    now = datetime.now()
    sessions_to_remove = []
    
    for session_id, session_data in active_game_sessions.items():
        if (now - session_data['last_activity']) > timedelta(hours=1):
            sessions_to_remove.append(session_id)
    
    for session_id in sessions_to_remove:
        del active_game_sessions[session_id]
        # Nettoyer aussi le verrou si existe
        if session_id in session_locks:
            del session_locks[session_id]



async def update_user_solde(user_id, amount_change):
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
                new_solde = current_solde + amount_change
                
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id)
                )
                
                await conn.commit()
                return new_solde
                
    except Exception as e:
        return None

def validate_game_session(session_id, expected_user_id, require_nonce=False, nonce=None):
    """Valider une session de jeu avec option anti-replay"""
    session_data = get_game_session(session_id)
    
    if not session_data:
        return False, "Session de jeu introuvable"
    
    if session_data['user_id'] != expected_user_id:
        return False, "Session de jeu non autorisée"
    
    if session_data['game_over']:
        return False, "La partie est déjà terminée"
    
    if (datetime.now() - session_data['created_at']) > timedelta(hours=2):
        return False, "Session de jeu expirée"
    
    # NOUVEAU : Validation anti-replay
    if require_nonce and nonce:
        if nonce == session_data.get('last_nonce'):
            return False, "Nonce réutilisé"
        
        # Mettre à jour le dernier nonce
        session_data['last_nonce'] = nonce
    
    return True, session_data

# NOUVEAU : Fonction wrapper pour messages WebSocket
async def handle_websocket_message(websocket, data, user_id):
    """Gestionnaire principal pour messages WebSocket avec sécurité"""
    try:
        message_type = data.get('type')
        
        # NOUVEAU : Vérification de base des messages
        if not message_type:
            return {'type': 'error', 'message': 'Type de message manquant'}
        
        # NOUVEAU : Validation du timestamp et nonce pour les messages critiques
        if message_type in ['player_move', 'get_ai_move', 'game_result']:
            nonce = data.get('nonce')
            timestamp = data.get('timestamp')
            
            if not nonce or not timestamp:
                return {'type': 'error', 'message': 'Nonce ou timestamp manquant'}
            
            # Valider le nonce et timestamp
            valid, msg = validate_nonce(nonce, user_id, timestamp)
            if not valid:
                return {'type': 'error', 'message': msg}
        
        # NOUVEAU : Vérification du timestamp (pas trop vieux)
        if 'timestamp' in data:
            current_time = int(time.time())
            message_time = data.get('timestamp', 0)
            
            # Rejeter les messages de plus de 5 minutes
            if abs(current_time - message_time) > 300:
                return {'type': 'error', 'message': 'Message trop vieux'}
        
        # Routeur de messages
        if message_type == 'create_session':
            return await handle_create_session(data, user_id)
        
        elif message_type == 'set_difficulty':
            return await handle_set_difficulty(data, user_id)
        
        elif message_type == 'player_move':
            return await handle_player_move(data, user_id)
        
        elif message_type == 'get_ai_move':
            return await handle_get_ai_move(data, user_id)
        
        elif message_type == 'calculate_prize':
            return await handle_calculate_prize(data, user_id)
        
        elif message_type == 'game_result':
            return await handle_game_result(data, user_id)
        
        elif message_type == 'get_session_status':
            return await handle_get_session_status(data, user_id)
        
        elif message_type == 'cancel_session':
            return await handle_cancel_session(data, user_id)
        
        else:
            return {'type': 'error', 'message': f'Type de message inconnu: {message_type}'}
            
    except Exception as e:
        return {'type': 'error', 'message': f'Erreur interne: {str(e)}'}

# Dictionnaire pour stocker l'historique des parties par utilisateur
player_history = {}

# Fonction pour récupérer l'historique d'un joueur
def get_player_history(user_id):
    """Récupérer l'historique des parties d'un joueur"""
    if user_id not in player_history:
        player_history[user_id] = {
            'total_games': 0,
            'wins': 0,
            'losses': 0,
            'draws': 0,
            'last_difficulty': 'medium',
            'consecutive_losses': 0,
            'consecutive_wins': 0,
            'recent_results': []  # Derniers 10 résultats
        }
    return player_history[user_id]

# Fonction pour mettre à jour l'historique après une partie
def update_player_history(user_id, result):
    """Mettre à jour l'historique après une partie"""
    history = get_player_history(user_id)
    
    history['total_games'] += 1
    
    if result == 'player':
        history['wins'] += 1
        history['consecutive_wins'] += 1
        history['consecutive_losses'] = 0
    elif result == 'computer':
        history['losses'] += 1
        history['consecutive_losses'] += 1
        history['consecutive_wins'] = 0
    else:  # draw
        history['draws'] += 1
        history['consecutive_wins'] = 0
        history['consecutive_losses'] = 0
    
    # Garder les 10 derniers résultats
    history['recent_results'].append(result)
    if len(history['recent_results']) > 10:
        history['recent_results'].pop(0)
    
    return history

# Fonction de calcul de la difficulté adaptative
def calculate_adaptive_difficulty(user_id):
    """Calculer la difficulté adaptative basée sur l'historique"""
    history = get_player_history(user_id)
    
    # Si moins de 3 parties, commencer par medium
    if history['total_games'] < 3:
        return 'medium'
    
    # Analyser les 5 dernières parties
    recent = history['recent_results'][-5:] if len(history['recent_results']) >= 5 else history['recent_results']
    
    # Compter les victoires et défaites récentes
    recent_wins = recent.count('player')
    recent_losses = recent.count('computer')
    recent_draws = recent.count('draw')
    
    # Règle 1 : Si le joueur a perdu 3 fois de suite -> passer en medium (ou rester medium)
    if history['consecutive_losses'] >= 3:
        return 'medium'
    
    # Règle 2 : Si le joueur a gagné 3 fois de suite -> passer en hard
    if history['consecutive_wins'] >= 3:
        return 'hard'
    
    # Règle 3 : Si le joueur gagne plus de 60% des dernières parties -> augmenter difficulté
    if len(recent) >= 5 and (recent_wins / len(recent)) > 0.6:
        # Si actuellement medium, passer à hard
        if history['last_difficulty'] == 'medium':
            return 'hard'
        else:
            return 'hard'
    
    # Règle 4 : Si le joueur perd plus de 60% des dernières parties -> diminuer difficulté
    if len(recent) >= 5 and (recent_losses / len(recent)) > 0.6:
        # Si actuellement hard, passer à medium
        if history['last_difficulty'] == 'hard':
            return 'medium'
        else:
            return 'medium'
    
    # Règle 5 : Si le joueur a beaucoup de parties nulles -> ajuster
    if len(recent) >= 5 and (recent_draws / len(recent)) > 0.4:
        # Beaucoup de matchs nuls, essayer de changer la difficulté
        return 'hard' if history['last_difficulty'] == 'medium' else 'medium'
    
    # Règle 6 : Si le joueur a une alternance win/loss (1 victoire, 1 défaite, 1 victoire...)
    # Garder la difficulté actuelle
    return history['last_difficulty']

# Fonction avec probabilité de victoire ajustée
def get_difficulty_with_win_probability(user_id, base_difficulty):
    """
    Retourne la difficulté avec une probabilité que le joueur gagne entre 30% et 50%
    """
    history = get_player_history(user_id)
    
    # Si moins de 5 parties, on laisse la difficulté de base
    if history['total_games'] < 2:
        return base_difficulty
    
    # Calculer le taux de victoire global
    win_rate = history['wins'] / max(history['total_games'], 1)
    
    # Si le joueur gagne trop souvent (> 60%), augmenter la difficulté
    if win_rate > 0.6:
        return 'hard'
    
    # Si le joueur perd trop souvent (< 30%), diminuer la difficulté
    if win_rate < 0.3:
        return 'medium'
    
    # Sinon, garder la difficulté actuelle
    return history['last_difficulty']

# NOUVEAU : Handlers spécifiques avec verrous
async def handle_create_session(data, user_id):
    """Créer une nouvelle session de jeu avec difficulté adaptative"""
    bet_amount = data.get('bet', 0)
    
    if bet_amount <= 0:
        return {'type': 'error', 'message': 'Mise invalide'}
    
    # Calculer la difficulté adaptative
    difficulty = calculate_adaptive_difficulty(user_id)
    
    # Appliquer un peu de hasard pour éviter la prévisibilité
    # 20% de chance d'utiliser la difficulté opposée pour surprendre
    if random.random() < 0.2:
        difficulty = 'hard' if difficulty == 'medium' else 'medium'
    
    # Mémoriser la difficulté choisie
    history = get_player_history(user_id)
    history['last_difficulty'] = difficulty
    
    session_id = create_game_session(user_id, bet_amount, difficulty)
    game_ai.set_difficulty(difficulty)
    
    print(f"[ADAPTIVE] Joueur {user_id} - Difficulté: {difficulty} - "
          f"Stats: {history['wins']}W/{history['losses']}L/{history['draws']}D")
    
    return {
        'type': 'session_created',
        'session_id': session_id,
        'difficulty': difficulty,
        'bet': bet_amount,
        'nonce': generate_nonce()
    }

async def handle_set_difficulty(data, user_id):
    """Définir la difficulté pour la session"""
    session_id = data.get('session_id')
    difficulty = data.get('difficulty', 'medium')
    
    async with session_lock(session_id):
        valid, result = validate_game_session(session_id, user_id)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        session_data['difficulty'] = difficulty
        game_ai.set_difficulty(difficulty)
        
        return {
            'type': 'difficulty_set',
            'difficulty': difficulty,
            'session_id': session_id
        }

async def handle_player_move(data, user_id):
    """Traiter le mouvement du joueur avec verrou"""
    session_id = data.get('session_id')
    move = data.get('move')
    
    async with session_lock(session_id):
        # NOUVEAU : Validation anti-replay supplémentaire
        nonce = data.get('nonce')
        valid, result = validate_game_session(session_id, user_id, require_nonce=True, nonce=nonce)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        board = session_data.get('board', [''] * 9)
        current_player = session_data.get('current_player', 'X')
        
        if current_player != 'X':
            return {'type': 'error', 'message': "Ce n'est pas votre tour"}
        
        if move < 0 or move >= 9 or board[move] != '':
            return {'type': 'error', 'message': 'Mouvement invalide'}
        
        # Enregistrer le mouvement du joueur
        board[move] = 'X'
        update_game_session(session_id, board, 'O', move=move)
        
        # Vérifier l'état du jeu
        game_state = game_ai.check_game_state(board, 'O')
        
        response = {
            'type': 'move_processed',
            'move': move,
            'player': 'X',
            'session_id': session_id,
            'board': board,
            'game_state': game_state,
            'nonce': generate_nonce()  # NOUVEAU : Nouveau nonce pour la réponse
        }
        
        # Si le jeu continue, mouvement de l'IA
        if game_state['game_result'] == 'ongoing':
            ai_move = game_ai.computer_move(board.copy())
            if ai_move is not None:
                board[ai_move] = 'O'
                update_game_session(session_id, board, 'X', move=ai_move)
                
                ai_game_state = game_ai.check_game_state(board, 'X')
                
                response['ai_move'] = ai_move
                response['board'] = board
                response['game_state'] = ai_game_state
                response['nonce'] = generate_nonce()  # NOUVEAU : Nouveau nonce
        
        return response

async def handle_get_ai_move(data, user_id):
    """Obtenir uniquement le mouvement de l'IA"""
    session_id = data.get('session_id')
    
    async with session_lock(session_id):
        valid, result = validate_game_session(session_id, user_id)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        board = session_data.get('board', [''] * 9)
        current_player = session_data.get('current_player', 'O')
        difficulty = session_data.get('difficulty', 'medium')
        
        if current_player != 'O':
            return {'type': 'error', 'message': "Ce n'est pas le tour de l'IA"}
        
        game_ai.set_difficulty(difficulty)
        move = game_ai.computer_move(board.copy())
        
        if move is not None:
            board[move] = 'O'
            update_game_session(session_id, board, 'X', move=move)
            
            game_state = game_ai.check_game_state(board, 'X')
            
            return {
                'type': 'ai_move',
                'move': move,
                'player': 'O',
                'difficulty': difficulty,
                'session_id': session_id,
                'board': board,
                'game_state': game_state,
                'nonce': generate_nonce()  # NOUVEAU : Nonce pour la réponse
            }
        else:
            return {'type': 'error', 'message': 'Aucun mouvement possible'}

async def handle_calculate_prize(data, user_id):
    """Calculer le prix selon le résultat et la difficulté"""
    result = data.get('result')
    bet = data.get('bet', 0)
    difficulty = data.get('difficulty', 'medium')
    
    # Simulation du calcul - en réalité utilise les données session
    if result == 'player':
        if difficulty == 'hard':
            prize = int(bet * 2.0)
        else:  # medium
            prize = int(bet * 1.5)
    elif result == 'computer':
        prize = 0
    elif result == 'draw':
        prize = bet
    else:
        prize = 0
    
    return {
        'type': 'prize_calculated',
        'result': result,
        'bet': bet,
        'difficulty': difficulty,
        'prize': prize
    }

async def handle_game_result(data, user_id):
    """Traiter le résultat final du jeu et mettre à jour l'historique"""
    session_id = data.get('session_id')
    
    async with session_lock(session_id):
        valid, result = validate_game_session(session_id, user_id)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        result_type = data.get('result')
        
        if session_data['game_over']:
            return {'type': 'error', 'message': 'La partie est déjà terminée'}
        
        # Stocker le résultat et calculer le prix
        session_data['result'] = result_type
        session_data['game_over'] = True
        
        # Calcul du prix basé sur les données session
        prize = calculate_prize_for_session(session_data)
        session_data['prize'] = prize
        
        # Calculer le changement de solde
        amount_change = 0
        bet_amount = session_data.get('bet_amount', 0)
        
        if result_type == 'player':
            amount_change = prize  # Gains = prize
        elif result_type == 'computer':
            amount_change = 0  # Pas de gain si IA gagne
        elif result_type == 'draw':
            amount_change = bet_amount  # Remboursement
        
        # Mettre à jour le solde
        new_solde = await update_user_solde(user_id, amount_change)
        
        if new_solde is not None:
            update_game_session(session_id, session_data['board'], 
                              session_data['current_player'], 
                              game_over=True, result=result_type, prize=prize)
            
            # ✅ AJOUT : Mettre à jour l'historique du joueur
            update_player_history(user_id, result_type)
            
            # ✅ AJOUT : Logger le résultat du jeu
            if result_type == 'player':
                await log_game_result(
                    user_id=user_id,
                    has_won=True,
                    amount=float(prize),
                    game_type="XO Clash"
                )
                
            elif result_type == 'computer':
                await log_game_result(
                    user_id=user_id,
                    has_won=False,
                    amount=float(bet_amount),
                    game_type="XO Clash"
                )
            
            # Convertir Decimal en float pour la sérialisation JSON
            new_solde_serializable = float(new_solde) if new_solde is not None else None
            
            return {
                'type': 'game_result_processed',
                'result': result_type,
                'prize': prize,
                'new_solde': new_solde_serializable,
                'session_id': session_id,
                'message': 'Résultat traité avec succès'
            }
        else:
            return {'type': 'error', 'message': 'Utilisateur sans solde ou erreur de traitement'}

async def handle_get_session_status(data, user_id):
    """Obtenir le statut d'une session"""
    session_id = data.get('session_id')
    
    valid, result = validate_game_session(session_id, user_id)
    if not valid:
        return {'type': 'error', 'message': result}
    
    session_data = result
    
    return {
        'type': 'session_status',
        'session_id': session_id,
        'board': session_data['board'],
        'current_player': session_data['current_player'],
        'game_over': session_data['game_over'],
        'difficulty': session_data['difficulty'],
        'bet_amount': session_data['bet_amount'],
        'created_at': session_data['created_at'].isoformat(),
        'moves_count': len(session_data['moves_history']),
        'result': session_data.get('result'),
        'prize': session_data.get('prize', 0)
    }

async def handle_cancel_session(data, user_id):
    """Annuler une session"""
    session_id = data.get('session_id')
    
    async with session_lock(session_id):
        if session_id in active_game_sessions:
            session_data = active_game_sessions[session_id]
            
            if session_data['user_id'] == user_id and not session_data['game_over']:
                bet_amount = session_data['bet_amount']
                await update_user_solde(user_id, bet_amount)
                
                del active_game_sessions[session_id]
                
                return {
                    'type': 'session_cancelled',
                    'session_id': session_id,
                    'message': 'Session annulée et mise remboursée'
                }
            else:
                return {'type': 'error', 'message': 'Impossible d\'annuler cette session'}
        else:
            return {'type': 'error', 'message': 'Session introuvable'}

# WebSocket pour communiquer avec le frontend
@app.websocket('/ws/xo_ai')
async def xo_ai_websocket():
    """
    WebSocket avec TOUTE la logique de jeu déportée côté serveur
    """
    
    try:
        # Authentification
        user_id = await authenticate_websocket()
        
        if not user_id:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Utilisateur non connecté'
            }))
            await websocket.close()
            return


        game_name = "XO Clash"  # ou "GridPop" selon votre base de données
        game_exists = await check_game_exists(user_id, game_name)
            
        if not game_exists:
            await websocket.send_json({
                "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
                "action": "game_not_found"
            })
            await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
            return
        
        # Envoyer auth_success
        await websocket.send(json.dumps({
            'type': 'auth_success',
            'message': 'Authentification réussie',
        }))
        
        # Boucle principale pour recevoir les messages
        while True:
            try:
                message = await websocket.receive()

                if not await check_ws_message_rate(user_id):
                    await websocket.send_json({
                    "type": "error",
                    "error": "Trop d'actions, ralentis un peu."
                    })
                    continue
                
                if message is None:
                    break
                
                # Si message est un string, le parser
                if isinstance(message, str):
                    data = json.loads(message)
                else:
                    # Si c'est déjà un dict
                    data = message
                
                # Gestion sécurisée des messages
                response = await handle_websocket_message(websocket, data, user_id)
                await websocket.send(json.dumps(response))
                
                # Si c'est un résultat de jeu, nettoyer après délai
                if data.get('type') == 'game_result':
                    await asyncio.sleep(10)
                    session_id = data.get('session_id')
                    if session_id and session_id in active_game_sessions:
                        del active_game_sessions[session_id]
                
            except json.JSONDecodeError as e:
                continue
            except Exception as e:
                break
    
    except asyncio.CancelledError:
        pass
    except Exception as e:
        pass
    
    finally:
        cleanup_old_sessions()

# Tâche de nettoyage périodique
async def periodic_cleanup():
    while True:
        await asyncio.sleep(3600)  # Toutes les heures
        cleanup_old_sessions()
        
        # Nettoyage des nonces
        global used_nonces
        used_nonces = set(list(used_nonces)[-5000:])  # Garder les 5000 plus récents


@app.route('/api/get_XO_lives', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_XO_lives(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('XO Clash', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({'error': 'Aucune entrée trouvée'}), 404

                return jsonify({'lives': result[0]})

    except Exception as e:
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/api/decrement_XO_lives', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def decrement_XO_lives(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Décrémenter les vies (minimum 0)
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = GREATEST(0, vies - 1) 
                    WHERE product_name = %s AND user_id = %s
                """, ('XO Clash', user_id))

                # Récupérer le nouveau nombre de vies
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = %s AND user_id = %s
                """, ('XO Clash', user_id))

                result = await cur.fetchone()
                if not result:
                    return jsonify({'error': 'Aucune entrée trouvée'}), 404

                return jsonify({'new_lives': result[0]})

    except Exception as e:
        return jsonify({'error': 'Erreur serveur'}), 500


# ====================================================================
# SYSTEME DU JEU NEURO_QUIZ
# ====================================================================

QUESTIONS_NEURO = "html 1/lang/neuro.json"
MAX_QUESTIONS = 20
MAX_ERRORS = 5
TIME_LIMIT = 10  # secondes
SESSION_COOLDOWN = 60  # secondes entre les parties

active_sessions = {}  # user_id -> {"last_play": timestamp, "count": n}


async def reward_user(user_id: int, bet: float):
    gain = bet * 2
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (gain, user_id)
            )
            await conn.commit()


async def load_neuro():
    async with aiofiles.open(QUESTIONS_NEURO, "r", encoding="utf-8") as f:
        return json.loads(await f.read())


def generate_session_token():
    return secrets.token_hex(16)  # 32 caractères hex

def sign_question(q_id):
    return hmac.new(SECRET_KEY, str(q_id).encode(), hashlib.sha256).hexdigest()


async def send_neuro(ws, questions_data, state):
    subject = state["subject"]
    pool = questions_data[subject]

    available = [q for q in pool if id(q) not in state["used"]]

    if not available:
        await ws.send(json.dumps({
            "status": "lost",
            "reason": "Plus de questions disponibles"
        }))
        return False

    q = random.choice(available)

    state["used"].add(id(q))
    state["asked"] += 1
    state["current_answer"] = q["correct"]
    state["current_qid"] = id(q)
    state["question_start"] = time.time()

    # Créer la signature HMAC pour cette question
    signature = sign_question(state["current_qid"])

    message = {
        "status": "question",
        "number": state["asked"],
        "time": TIME_LIMIT,
        "q": q["q"],
        "options": {
            "A": q["a"],
            "B": q["b"],
            "C": q["c"]
        },
        "q_id": state["current_qid"],
        "signature": signature
    }
    await ws.send(json.dumps(message))
    return True


@app.websocket("/ws/neuro_quiz")
async def ws_neuro_quiz():
    user_id = await authenticate_websocket()
    
    if not user_id:
        await websocket.send(json.dumps({
            'type': 'error',
            'message': 'Utilisateur non connecté'
        }))
        await websocket.close()
        return

    game_name = "Neuro Quiz"  # ou "GridPop" selon votre base de données
    game_exists = await check_game_exists(user_id, game_name)
        
    if not game_exists:
        await websocket.send_json({
            "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
            "action": "game_not_found"
        })
        await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
        return
    
    # Envoyer auth_success
    await websocket.send(json.dumps({
        'type': 'auth_success',
        'message': 'Authentification réussie',
    }))

    now = time.time()
    last_sess = active_sessions.get(user_id)
    
    if last_sess and now - last_sess["last_play"] < SESSION_COOLDOWN:
        await websocket.send(json.dumps({"error": "Veuillez attendre avant de rejouer"}))
        return
    
    active_sessions[user_id] = {"last_play": now, "count": (last_sess["count"] + 1) if last_sess else 1}

    questions_data = await load_neuro()

    state = {
        "subject": None,
        "bet": 0.0,
        "asked": 0,
        "correct": 0,
        "wrong": 0,
        "current_answer": None,
        "current_qid": None,
        "session_token": generate_session_token(),
        "used": set(),
        "game_started": False
    }

    # Envoyer token au frontend
    await websocket.send(json.dumps({
        "status": "start",
        "session_token": state["session_token"]
    }))

    while True:
        # Si le jeu n'a pas encore démarré, on attend indéfiniment (pas de timeout)
        if not state["game_started"]:
            try:
                msg = await websocket.receive()

                if not await check_ws_message_rate(user_id):
                    await websocket.send_json({
                        "type": "error",
                        "error": "Trop d'actions, ralentis un peu."
                    })
                    continue
                
                data = json.loads(msg)
            except Exception:
                continue
        else:
            # Si le jeu a démarré, on utilise le timeout par question
            try:
                msg = await asyncio.wait_for(
                    websocket.receive(),
                    timeout=TIME_LIMIT
                )
                data = json.loads(msg)
            except asyncio.TimeoutError:
                # Timeout automatique
                state["wrong"] += 1
                if state["wrong"] >= MAX_ERRORS:
                    # PERDU par timeout
                    await websocket.send(json.dumps({
                        "status": "lost",
                        "reason": "Temps écoulé",
                        "score": state["correct"]
                    }))
                    # Log du résultat - PERDU (amount = mise)
                    await log_game_result(user_id, False, state["bet"], "Neuro Quiz")
                    return
                await websocket.send(json.dumps({
                    "result": "timeout",
                    "wrong": state["wrong"]
                }))
                await send_neuro(websocket, questions_data, state)
                continue

        action = data.get("action")
        token = data.get("session_token")

        if token != state["session_token"]:
            await websocket.send(json.dumps({"error": "Token invalide"}))
            continue

        if action == "start":
            subject = data.get("subject")
            bet = float(data.get("bet", 0))
            if subject not in questions_data or bet <= 0:
                await websocket.send(json.dumps({"error": "Paramètres invalides"}))
                return
            state["subject"] = subject
            state["bet"] = bet
            state["game_started"] = True
            await send_neuro(websocket, questions_data, state)

        elif action == "answer":
            choice = data.get("choice")
            q_id = data.get("q_id")
            signature = data.get("signature")

            # Vérification HMAC
            expected_signature = sign_question(q_id)
            if q_id != state["current_qid"] or signature != expected_signature:
                await websocket.send(json.dumps({"error": "Signature invalide"}))
                continue

            # Vérification réponse
            if choice == state["current_answer"]:
                state["correct"] += 1
                result = "correct"
            else:
                state["wrong"] += 1
                result = "wrong"

            # PERDU
            if state["wrong"] >= MAX_ERRORS:
                await websocket.send(json.dumps({
                    "status": "lost",
                    "reason": f"{MAX_ERRORS} erreurs atteintes",
                    "score": state["correct"]
                }))
                # Log du résultat - PERDU (amount = mise)
                await log_game_result(user_id, False, state["bet"], "Neuro Quiz")
                return

            # GAGNÉ
            if state["asked"] >= MAX_QUESTIONS:
                gain = state["bet"] * 2
                await reward_user(user_id, state["bet"])
                await websocket.send(json.dumps({
                    "status": "won",
                    "gain": gain,
                    "score": state["correct"],
                    "errors": state["wrong"]
                }))
                # Log du résultat - GAGNÉ (amount = gains finaux)
                await log_game_result(user_id, True, gain, "Neuro Quiz")
                return

            # Résultat intermédiaire
            await websocket.send(json.dumps({
                "result": result,
                "correct": state["correct"],
                "wrong": state["wrong"]
            }))

            # Envoyer question suivante
            await send_neuro(websocket, questions_data, state)

        else:
            await websocket.send(json.dumps({"error": f"Action inconnue: {action}"}))


@app.route('/api/get_Nquiz', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_Nquiz(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s",
                    ('Neuro Quiz', user_id)
                )
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Neuro Quiz'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Neuro Quiz',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Neuro Quiz'
                }), 500


@app.route('/api/decrement_Nquiz', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def decrement_Nquiz(wari_session):
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # SELECT ... FOR UPDATE
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s FOR UPDATE",
                    ('Neuro Quiz', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name=%s AND user_id=%s",
                    ('Neuro Quiz', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500


# ====================================================================
# SYSTEME DU JEU TREND-UP
# ====================================================================



##################################################################################
##Systeme du cycle de calcule toute les 2min (70) Utiliser par XOF trader et Trend Up 
# ##########################################################################


import math
import random
import asyncio
from datetime import datetime, timedelta, timezone

CYCLE_DURATION = 70  # Durée du cycle en secondes


# --- Factorial sécurisée ---
def safe_factorial(n: int) -> int:
    MAX_FACTORIAL = 20
    if n > MAX_FACTORIAL:
        n = MAX_FACTORIAL
    if n < 0:
        raise ValueError("Factorial non défini pour négatif")
    return math.factorial(n)


def calcul_fx(x: float) -> int:
    ceil_x = math.ceil(x)
    floor_x = math.floor(x)
    mod_base = floor_x + 1
    fact = safe_factorial(ceil_x)
    val_mod = fact % mod_base
    cos_val = math.cos(math.pi * val_mod)
    rounded = round(cos_val)
    result = (rounded ** 2) % 2
    return result


# --- Calcul et upsert async ---
async def calculate_and_store_fx():
    x = random.uniform(0, 30)
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Lire la valeur actuelle
                await cur.execute("SELECT result FROM calcul_fx WHERE id = 1")
                row = await cur.fetchone()

                if row:
                    current_result = row[0]
                    new_result = 0 if current_result == 1 else 1
                else:
                    new_result = 1

                timestamp = datetime.now(timezone.utc).replace(tzinfo=None)

                upsert_query = """
                    INSERT INTO calcul_fx (id, timestamp, x, result)
                    VALUES (1, %s, %s, %s) AS new_vals
                    ON DUPLICATE KEY UPDATE
                        timestamp = new_vals.timestamp,
                        x = new_vals.x,
                        result = new_vals.result
                """
                await cur.execute(upsert_query, (timestamp, x, new_result))
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Tâche asynchrone pour cycles réguliers ---
async def fx_cycle_loop():
    while True:
        fin_cycle = datetime.now(timezone.utc) + timedelta(seconds=CYCLE_DURATION)
        await asyncio.sleep(CYCLE_DURATION)
        try:
            await calculate_and_store_fx()
        except Exception as e:
            pass


# --- Démarrage de la boucle de fond ---
@app.before_serving
async def startup():
    asyncio.create_task(fx_cycle_loop())

##########################################################################
##################################################################################
##########################################################################"#####"


def generate_hmac(payload: dict) -> str:
    msg = json.dumps(payload, sort_keys=True).encode()
    hmac_result = hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()
    return hmac_result

def check_hmac(payload: dict, signature: str) -> bool:
    expected = generate_hmac(payload)
    result = hmac.compare_digest(expected, signature)
    return result

connected_clients = {}
active_games = {}

@app.websocket('/ws/trend')
async def ws_chart():
    client_id = id(websocket._get_current_object())
    connected_clients[client_id] = websocket._get_current_object()

    try:
        user_id = await authenticate_websocket()
        if not user_id:
            await websocket.send_json({'error': 'Utilisateur non connecté', 'type': 'auth_error'})
            return

        game_name = "Trend Up"  # ou "GridPop" selon votre base de données
        game_exists = await check_game_exists(user_id, game_name)
        
        if not game_exists:
            await websocket.send_json({
                "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
                "action": "game_not_found"
            })
            await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
            return

        await websocket.accept()

        data = await websocket.receive_json()

        if not await check_ws_message_rate(user_id):
                            await websocket.send_json({
                                "type": "error",
                                "error": "Trop d'actions, ralentis un peu."
                            })
                            return

        # Vérification HMAC côté serveur
        payload = {k: v for k, v in data.items() if k != "hmac"}
        hmac_sig = generate_hmac(payload)  # le serveur génère l'HMAC
        await websocket.send_json({'type': 'hmac', 'hmac': hmac_sig})  # envoi au frontend si besoin

        if data.get('action') != 'start_game':
            await websocket.send_json({'error': 'Action invalide'})
            return

        # Bet depuis le frontend
        bet_amount = float(data.get('bet', 0))
        if bet_amount < 100:
            await websocket.send_json({'error': 'Mise minimale 100'})
            return

        # Anti double gain / anti replay
        if user_id in active_games:
            await websocket.send_json({'error': 'Partie déjà en cours ou gains déjà crédités', 'type': 'double_play'})
            return

        # Générer token unique pour cette partie
        game_token = hmac.new(SECRET_KEY, f"{user_id}-{datetime.utcnow().timestamp()}".encode(), hashlib.sha256).hexdigest()
        active_games[user_id] = game_token

        # Vérifier booster
        has_booster = await check_booster(user_id)

        # Résultat maître (0 ou 1)
        result = await fetch_latest_result()
        if result not in [0, 1]:
            result = 0

        # Lancer le jeu
        await run_chart_game(
            ws=websocket,
            user_id=user_id,
            bet_amount=bet_amount,
            result=result,
            has_booster=has_booster,
            game_token=game_token
        )

    except Exception as e:
        await websocket.send_json({'type': 'error', 'message': str(e)})

    finally:
        connected_clients.pop(client_id, None)
        if 'user_id' in locals() and user_id in active_games:
            active_games.pop(user_id)

async def fetch_latest_result():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT result FROM calcul_fx ORDER BY timestamp DESC LIMIT 1")
            row = await cur.fetchone()
            result = int(row[0]) if row else 0
            return result

async def check_booster(user_id: int) -> bool:
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT 1 FROM product_purchases WHERE user_id=%s AND product_name=%s LIMIT 1",
                (user_id, "Booster +20% gains")
            )
            result = bool(await cur.fetchone())
            return result

async def update_user_balance(user_id: int, amount: float):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE solde SET solde = solde + %s WHERE user_id=%s", (amount, user_id))
            await conn.commit()

async def run_chart_game(ws, user_id, bet_amount, result, has_booster, game_token):
    duration = 180
    current_price = 100.0
    initial_bet = bet_amount

    price_history = []
    candlestick_data = []

    # Variations inverses visibles
    opposite_count = 10
    # chaque variation dure ≥ 8s
    base_seconds = list(range(duration))
    opposite_starts = random.sample(base_seconds[:-8], opposite_count)

    negative_variations = []
    for s in opposite_starts:
        negative_variations.extend(range(s, s+8))
    negative_variations = set([sec for sec in negative_variations if sec < duration])

    try:
        for second in range(duration):

            # Variation principale
            if result == 1:
                change = random.uniform(0.2, 1.0)  # hausse normale
            else:
                change = -random.uniform(0.2, 1.0)  # baisse normale

            # Injecter variations inverses
            if second in negative_variations:
                change *= -1

            current_price += change
            current_price = max(70.0, min(130.0, current_price))  # clamp max/min ±30%

            current_bet_value = bet_amount * (current_price / 100.0)

            current_time = second + 1
            price_history.append({'time': current_time, 'price': round(current_price, 2)})

            # Chandeliers
            if current_time % 5 == 0 and len(price_history) >= 5:
                last = price_history[-5:]
                candlestick_data.append({
                    'time': current_time,
                    'open': last[0]['price'],
                    'high': max(p['price'] for p in last),
                    'low': min(p['price'] for p in last),
                    'close': last[-1]['price'],
                    'color': 'green' if last[-1]['price'] >= last[0]['price'] else 'red'
                })
                if len(candlestick_data) > 20:
                    candlestick_data.pop(0)

            # Envoi WS
            payload = {
                'type': 'chart_update',
                'timestamp': datetime.now().isoformat(),
                'current_time': current_time,
                'current_price': round(current_price, 2),
                'current_value': round(current_bet_value, 2),
                'price_history': price_history[-50:],
                'candlestick_data': candlestick_data,
                'remaining_seconds': duration - current_time,
                'status': 'running'
            }
            await ws.send_json(payload)

            await asyncio.sleep(1)

            # Crash
            if current_price <= 20:
                crash_payload = {
                    'type': 'game_over',
                    'status': 'crashed',
                    'message': 'Crash du marché, mise perdue.',
                    'final_value': 0
                }
                await ws.send_json(crash_payload)
                active_games.pop(user_id, None)

                # Log résultat : crash = perte, amount = mise initiale
                await log_game_result(
                    user_id=user_id,
                    has_won=False,
                    amount=initial_bet,
                    game_type="Trend Up"
                )
                return

        final_value = bet_amount * (current_price / 100)
        gain_net = final_value - initial_bet

        if gain_net >= 0:
            bonus = gain_net * 0.2 if has_booster else 0
            total_credit = final_value + bonus

            # Anti double gain
            if user_id in active_games and active_games[user_id] == game_token:
                await update_user_balance(user_id, total_credit)
                active_games.pop(user_id, None)

                victory_payload = {
                    'type': 'game_over',
                    'status': 'won',
                    'initial_bet': round(initial_bet, 2),
                    'final_value': round(final_value, 2),
                    'gain_net': round(gain_net, 2),
                    'bonus': round(bonus, 2),
                    'credited': round(total_credit, 2),
                    'message': 'Victoire ! Gains crédités.'
                }
                await ws.send_json(victory_payload)

                # Log résultat : victoire, amount = gains finaux crédités
                await log_game_result(
                    user_id=user_id,
                    has_won=True,
                    amount=total_credit,
                    game_type="Trend Up"
                )
            else:
                await ws.send_json({'type': 'error', 'message': 'Gains déjà crédités ou partie invalide.'})
        else:
            active_games.pop(user_id, None)

            defeat_payload = {
                'type': 'game_over',
                'status': 'lost',
                'initial_bet': round(initial_bet, 2),
                'final_value': round(final_value, 2),
                'message': 'Défaite. Mise perdue.'
            }
            await ws.send_json(defeat_payload)

            # Log résultat : défaite, amount = mise initiale
            await log_game_result(
                user_id=user_id,
                has_won=False,
                amount=initial_bet,
                game_type="Trend Up"
            )

    except Exception as e:
        active_games.pop(user_id, None)
        await ws.send_json({'type': 'error', 'message': str(e)})


# --- Décrémenter les vies du jeu Trend Up ---
@app.route('/api/decrement_trend_lives', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def decrement_trend_lives(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Trend Up' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'Trend Up' AND user_id = %s
                """, (user_id,))

        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


# --- Récupérer les vies du jeu Trend Up ---
@app.route('/api/get_trend_lives', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_trend_lives(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Trend Up' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'lives': result[0],
                'product': 'Trend Up'
            })
        else:
            # Valeur par défaut si aucune entrée n'existe
            return jsonify({
                'lives': 0,
                'product': 'Trend Up',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Trend Up'
        }), 500

# ====================================================================
# SYSTEME DU JEU DE WORLD_CAP 
# ===================================================================

def quiz_generate_hmac(session_id: str) -> str:
    return hmac.new(SECRET_KEY, session_id.encode(), hashlib.sha256).hexdigest()

def quiz_verify_hmac(session_id: str, signature: str) -> bool:
    expected = quiz_generate_hmac(session_id)
    return hmac.compare_digest(expected, signature)

countries_data = []

async def load_countries_data():
    global countries_data
    file_path = os.path.join("html 1", "lang", "cap.json")
    async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
        countries_data = json.loads(await f.read())

@app.before_serving
async def startup():
    await load_countries_data()

user_sessions = {}

async def credit_user_balance(pool, user_id: str, amount: float):
    if amount <= 0:
        return
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            await conn.commit()


@app.websocket("/ws/cap")
async def ws_cap():
    await websocket.accept()

    client_disconnected = False

    async def safe_send(payload: dict) -> bool:
        nonlocal client_disconnected
        if client_disconnected:
            return False
        try:
            await websocket.send_json(payload)
            return True
        except Exception:
            client_disconnected = True
            return False

    user_id = await authenticate_websocket()
    if not user_id:
        await safe_send({"error": "Utilisateur non connecté"})
        await _safe_close(websocket)
        return

    game_name = "World Cap"
    game_exists = await check_game_exists(user_id, game_name)
        
    if not game_exists:
        await websocket.send_json({
            "error": f"Jeu '{game_name}' non trouvé pour cet utilisateur",
            "action": "game_not_found"
        })
        await websocket.close(code=4000, reason="Game not found for user")
        return

    pool = await get_pool()

    # ===== DEMANDE MISE =====
    if not await safe_send({"action": "send_bet", "min": 100}):
        return

    bet = None
    try:
        while bet is None:
            bet_data = await websocket.receive_json()

            if not await check_ws_message_rate(user_id):
                await safe_send({"error": "Trop d'actions, ralentis un peu."})
                continue

            if bet_data.get("action") != "send_bet":
                await safe_send({"error": "Action invalide, mise attendue"})
                continue

            try:
                bet = float(bet_data.get("bet", 0))
            except (TypeError, ValueError):
                bet = None

            if bet is None:
                await safe_send({"error": "Mise invalide"})
                await _safe_close(websocket)
                return
    except Exception:
        await safe_send({"error": "Mise invalide"})
        await _safe_close(websocket)
        return

    if bet < 100:
        await safe_send({"error": "La mise doit être >= 100"})
        await _safe_close(websocket)
        return

    # ===== SESSION UNIQUE =====
    session_id = secrets.token_hex(16)
    session_token = quiz_generate_hmac(session_id)

    user_sessions[user_id] = {
        "session_id": session_id,
        "token": session_token,
        "mise_initiale": bet,
        "current_bet": bet,
        "correct": 0,
        "wrong": 0,
        "asked": 0,
        "credited": False
    }
    s = user_sessions[user_id]

    if not await safe_send({"session_token": session_token}):
        user_sessions.pop(user_id, None)
        return

    # ===== ATTENTE DU SIGNAL "PRÊT" DU CLIENT =====
    try:
        ready = False
        while not ready:
            start_data = await asyncio.wait_for(websocket.receive_json(), timeout=15)

            if not await check_ws_message_rate(user_id):
                await safe_send({"error": "Trop d'actions, ralentis un peu."})
                continue

            if start_data.get("action") != "start_game":
                continue

            if not quiz_verify_hmac(session_id, start_data.get("session_token", "")):
                await safe_send({"error": "Token invalide"})
                continue

            ready = True
    except asyncio.TimeoutError:
        await safe_send({"error": "Démarrage non confirmé"})
        user_sessions.pop(user_id, None)
        await _safe_close(websocket)
        return
    except Exception:
        user_sessions.pop(user_id, None)
        return

    result_logged = False

    async def log_result(has_won: bool, amount: float):
        nonlocal result_logged
        if result_logged:
            return
        result_logged = True
        try:
            await log_game_result(int(user_id), has_won, amount, game_type="World Cap")
        except Exception:
            pass

    try:
        while s["asked"] < 20:

            if s["current_bet"] <= 0:
                s["current_bet"] = 0
                await safe_send({"finished": True, "message": "Mise épuisée. Perdu.", "current_bet": 0})
                await log_result(False, bet)
                break

            if s["wrong"] >= 10:
                await safe_send({"finished": True, "message": "Trop d'erreurs. Perdu."})
                await log_result(False, bet)
                break

            q = random.choice(countries_data)
            country = q["country"]
            correct = q["capital"]

            options = random.sample(
                [c["capital"] for c in countries_data if c["capital"] != correct],
                k=4
            ) + [correct]
            random.shuffle(options)

            if not await safe_send({
                "country": country,
                "options": options,
                "session_token": s["token"]
            }):
                break

            answer_data = None
            try:
                while answer_data is None:
                    candidate = await asyncio.wait_for(websocket.receive_json(), timeout=8)

                    if not await check_ws_message_rate(user_id):
                        await safe_send({"error": "Trop d'actions, ralentis un peu."})
                        continue

                    if candidate.get("action") != "answer":
                        await safe_send({"error": "Action invalide, réponse attendue"})
                        continue

                    if not quiz_verify_hmac(s["session_id"], candidate.get("session_token", "")):
                        await safe_send({"error": "Token invalide"})
                        continue

                    answer_data = candidate

            except asyncio.TimeoutError:
                s["wrong"] += 1
                s["current_bet"] -= 0.2 * bet
                s["asked"] += 1

                if s["current_bet"] <= 0:
                    s["current_bet"] = 0
                    await safe_send({
                        "result": "timeout",
                        "current_bet": 0,
                        "finished": True,
                        "message": "Mise épuisée. Perdu."
                    })
                    await log_result(False, bet)
                    break

                if not await safe_send({
                    "result": "timeout",
                    "current_bet": round(s["current_bet"], 2)
                }):
                    break
                continue
            except Exception:
                client_disconnected = True
                break

            user_answer = answer_data.get("answer", "").lower()

            if user_answer == correct.lower():
                s["correct"] += 1
                s["current_bet"] += 0.2 * bet
                result = "correct"
            else:
                s["wrong"] += 1
                s["current_bet"] -= 0.2 * bet
                result = "wrong"

            s["asked"] += 1

            if s["current_bet"] <= 0:
                s["current_bet"] = 0
                await safe_send({
                    "result": result,
                    "current_bet": 0,
                    "finished": True,
                    "message": "Mise épuisée. Perdu."
                })
                await log_result(False, bet)
                break

            if not await safe_send({
                "result": result,
                "current_bet": round(s["current_bet"], 2)
            }):
                break

        if not result_logged and not client_disconnected:
            gain = s["current_bet"] - bet

            if gain > 0 and not s["credited"]:
                await credit_user_balance(pool, user_id, gain)
                s["credited"] = True
                msg = "Gains crédités"
                await log_result(True, gain)
            else:
                msg = "Dommage"
                await log_result(False, gain)

            await safe_send({
                "finished": True,
                "message": msg,
                "current_bet": round(s["current_bet"], 2)
            })

    except Exception:
        pass
    finally:
        if not result_logged:
            await log_result(False, bet)
        user_sessions.pop(user_id, None)
        await _safe_close(websocket)


async def _safe_close(ws, code: int = 1000):
    try:
        await ws.close(code=code)
    except Exception:
        pass

# ====================================================================
# SYSTEME DU JEU GRID_POP
# ====================================================================

FALLBACK_CACHE = []
GRID_SIZE = 10
# Directions pour placer les mots dans la grille
DIRECTIONS = [
    (1, 0),  # horizontal vers la droite
    (0, 1),  # vertical vers le bas
    (1, 1),  # diagonal droite-bas
    (1, -1), # diagonal droite-haut
]

# Longueur maximale acceptable pour un mot (marge de sécurité pour le placement)
MAX_WORD_LENGTH = GRID_SIZE - 1  # = 9

# ✅ NOUVEAU : durée d'une partie gérée entièrement côté serveur.
# Le serveur ne fait plus confiance à un timer côté client : c'est lui qui
# décompte ce délai et met fin à la partie tout seul si besoin.
GAME_DURATION_SECONDS = 3 * 60  # 3 minutes

active_games: Dict[str, Dict] = {}

# Utilise  lettricide_generate_hmac et  lettricide_verify_hmac pour la generation et la verification du token 

async def load_fallback_words():
    global FALLBACK_CACHE
    try:
        async with aiofiles.open("html 1/lang/grid.json", mode="r", encoding="utf-8") as f:
            content = await f.read()
            data = json.loads(content)
            raw_words = data.get("fallback_words", [])
            # Filtre dès le chargement les mots trop longs pour la grille.
            FALLBACK_CACHE = [w for w in raw_words if len(w) <= MAX_WORD_LENGTH]
    except Exception:
        FALLBACK_CACHE = []

@app.before_serving
async def startup():
    await load_fallback_words()

async def fetch_words_from_api():
    """Récupère des mots aléatoires depuis l'API externe"""
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://random-word-api.herokuapp.com/word?number=6"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    words = await response.json()
                    upper_words = [word.upper() for word in words]
                    # Rejette les mots trop longs pour tenir dans la grille.
                    filtered_words = [w for w in upper_words if len(w) <= MAX_WORD_LENGTH]
                    return filtered_words
    except Exception:
        pass
    return None

def get_fallback_words():
    """Récupère des mots depuis le cache de secours"""
    safe_cache = [w for w in FALLBACK_CACHE if len(w) <= MAX_WORD_LENGTH]
    if len(safe_cache) >= 6:
        return [word.upper() for word in random.sample(safe_cache, 6)]
    return [word.upper() for word in safe_cache[:6]]

def can_place_word(grid, word, row, col, direction):
    """Vérifie si un mot peut être placé à la position donnée"""
    dr, dc = direction
    word_len = len(word)

    # Vérifier que le mot tient dans la grille
    for i in range(word_len):
        r = row + dr * i
        c = col + dc * i
        if r < 0 or r >= GRID_SIZE or c < 0 or c >= GRID_SIZE:
            return False

    # Vérifier les conflits avec les lettres existantes
    for i in range(word_len):
        r = row + dr * i
        c = col + dc * i
        existing = grid[r][c]
        if existing != '' and existing != word[i]:
            return False

    return True

def place_word_in_grid(grid, word, row, col, direction):
    """Place un mot dans la grille"""
    dr, dc = direction
    positions = []
    for i in range(len(word)):
        r = row + dr * i
        c = col + dc * i
        grid[r][c] = word[i]
        positions.append((r, c))
    return positions

def place_words_in_grid(words):
    """Place tous les mots dans la grille - Version corrigée et garantie"""
    grid = [['' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
    word_positions = {}

    # Trier les mots par longueur (les plus longs d'abord pour faciliter le placement)
    sorted_words = sorted(words, key=len, reverse=True)

    for word in sorted_words:
        placed = False
        word_len = len(word)

        # Si le mot est plus long que la grille, il est mathématiquement
        # impossible à placer : on saute directement au fallback.
        if word_len > GRID_SIZE:
            placed = False
        else:
            attempts = 0
            max_attempts = 1000

            while not placed and attempts < max_attempts:
                dr, dc = random.choice(DIRECTIONS)

                if dr == 1:
                    min_row = 0
                    max_row = GRID_SIZE - word_len
                elif dr == -1:
                    min_row = word_len - 1
                    max_row = GRID_SIZE - 1
                else:
                    min_row = 0
                    max_row = GRID_SIZE - 1

                if dc == 1:
                    min_col = 0
                    max_col = GRID_SIZE - word_len
                elif dc == -1:
                    min_col = word_len - 1
                    max_col = GRID_SIZE - 1
                else:
                    min_col = 0
                    max_col = GRID_SIZE - 1

                if min_row > max_row or min_col > max_col:
                    attempts += 1
                    continue

                row = random.randint(min_row, max_row)
                col = random.randint(min_col, max_col)

                if can_place_word(grid, word, row, col, (dr, dc)):
                    positions = place_word_in_grid(grid, word, row, col, (dr, dc))
                    word_positions[word] = positions
                    placed = True

                attempts += 1

            if not placed:
                # Recherche exhaustive comme dernier recours
                for dr, dc in DIRECTIONS:
                    if dr == 1:
                        row_range = range(0, GRID_SIZE - word_len + 1)
                    elif dr == -1:
                        row_range = range(word_len - 1, GRID_SIZE)
                    else:
                        row_range = range(0, GRID_SIZE)

                    if dc == 1:
                        col_range = range(0, GRID_SIZE - word_len + 1)
                    elif dc == -1:
                        col_range = range(word_len - 1, GRID_SIZE)
                    else:
                        col_range = range(0, GRID_SIZE)

                    for r in row_range:
                        for c in col_range:
                            if can_place_word(grid, word, r, c, (dr, dc)):
                                positions = place_word_in_grid(grid, word, r, c, (dr, dc))
                                word_positions[word] = positions
                                placed = True
                                break
                        if placed:
                            break
                    if placed:
                        break

        if not placed:
            # Créer un mot alternatif simple
            simple_word = "LALMA"
            if len(simple_word) <= GRID_SIZE:
                fallback_placed = False
                fallback_attempts = 0
                while not fallback_placed and fallback_attempts < 50:
                    r = random.randint(0, GRID_SIZE - len(simple_word))
                    c = random.randint(0, GRID_SIZE - 1)
                    if can_place_word(grid, simple_word, r, c, (1, 0)):
                        positions = place_word_in_grid(grid, simple_word, r, c, (1, 0))
                        word_positions[simple_word] = positions
                        words[words.index(word)] = simple_word
                        fallback_placed = True
                    fallback_attempts += 1

    return grid, word_positions

def fill_empty_cells(grid):
    """Remplit les cellules vides avec des lettres aléatoires"""
    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            if grid[r][c] == '':
                grid[r][c] = chr(random.randint(65, 90))
    return grid

def generate_game_grid(words):
    """
    Fonction CPU-bound synchrone. Doit être appelée via
    `await asyncio.to_thread(generate_game_grid, words)` depuis le code async
    pour ne pas bloquer la boucle d'événements pendant son exécution.
    """
    safe_words = [w for w in words if len(w) <= MAX_WORD_LENGTH]
    if not safe_words:
        safe_words = ["TEST", "PLAY", "GAME"]

    grid, word_positions = place_words_in_grid(safe_words)
    grid = fill_empty_cells(grid)

    return {
        "grid": grid,
        "words": list(word_positions.keys()),
        "word_positions": word_positions
    }

def is_adjacent(pos1: Tuple[int, int], pos2: Tuple[int, int]) -> bool:
    """Vérifie si deux positions sont adjacentes"""
    r1, c1 = pos1
    r2, c2 = pos2
    return abs(r1 - r2) <= 1 and abs(c1 - c2) <= 1

def is_valid_selection(game_data: Dict, selection: List[Tuple[int, int]]) -> Tuple[bool, str]:
    """Valide une sélection de cellules"""
    if not game_data.get("active", False):
        return False, "La partie n'est pas active"

    if not selection:
        return False, "Sélection vide"

    for row, col in selection:
        if row < 0 or row >= GRID_SIZE or col < 0 or col >= GRID_SIZE:
            return False, "Cellule hors de la grille"

    for i in range(1, len(selection)):
        if not is_adjacent(selection[i-1], selection[i]):
            return False, "Les cellules ne sont pas adjacentes"

    found_positions = set()
    for positions in game_data.get("found_words", {}).values():
        found_positions.update([tuple(pos) for pos in positions])

    for cell in selection:
        if tuple(cell) in found_positions:
            return False, "Cette cellule fait déjà partie d'un mot trouvé"

    return True, "Sélection valide"

def check_word(game_data: Dict, selection: List[Tuple[int, int]]) -> Tuple[bool, str, str]:
    """Vérifie si la sélection correspond à un mot"""
    selection_tuple = [tuple(pos) for pos in selection]
    for word, positions in game_data["word_positions"].items():
        if selection_tuple == positions:
            return True, word, "direct"
        if selection_tuple == positions[::-1]:
            return True, word, "reversed"
    return False, "", ""

async def add_win_to_user_solde(user_id: str, win_amount: float, word_found: str):
    """Ajoute le gain d'un mot trouvé au solde de l'utilisateur"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT solde FROM solde WHERE user_id = %s",
                    (user_id,)
                )
                result = await cursor.fetchone()

                if not result:
                    return False, "Utilisateur non trouvé"

                current_solde = float(result[0])
                new_solde = current_solde + win_amount

                await cursor.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id)
                )

                await conn.commit()

                return True, new_solde

    except Exception as e:
        return False, str(e)

def update_game_state(game_data: Dict, word: str, positions: List[Tuple[int, int]]) -> Dict:
    """Met à jour l'état du jeu après la découverte d'un mot"""
    if "found_words" not in game_data:
        game_data["found_words"] = {}

    game_data["found_words"][word] = positions

    all_words = set(game_data["words"])
    found_words = set(game_data["found_words"].keys())

    if all_words.issubset(found_words):
        game_data["completed"] = True
        game_data["active"] = False

    return game_data

# ✅ NOUVEAU : fonction centralisée qui appelle log_game_result UNE SEULE FOIS
# par partie, quelle que soit la façon dont elle se termine (tous les mots
# trouvés, fin volontaire du joueur, temps écoulé, ou déconnexion en cours
# de partie). Le flag "finalized" empêche tout double appel.
async def finalize_game(user_id: str, game_data: Dict, reason: str = "unknown"):
    if game_data.get("finalized"):
        return
    game_data["finalized"] = True

    total_win = game_data.get("total_win", 0)
    current_bet = game_data.get("current_bet", 100)

    has_won = total_win > 0
    # amount = le total gagné pendant la partie si le joueur a gagné quelque
    # chose, sinon la mise initiale (le joueur perd sa mise).
    amount = float(total_win) if has_won else float(current_bet)

    try:
        await log_game_result(int(user_id), has_won, amount, "Grid Pop")
    except Exception:
        pass

    game_data["active"] = False
    game_data["completed"] = True

# ✅ NOUVEAU : gère la fin de partie automatique quand les 3 minutes sont
# écoulées, indépendamment de toute action du client.
async def handle_time_up(user_id: str):
    game_data = active_games.get(user_id)
    if not game_data or not game_data.get("active"):
        return

    await finalize_game(user_id, game_data, reason="time_up")

    found_count = len(game_data.get("found_words", {}))
    total_words = len(game_data.get("words", []))

    try:
        await websocket.send_json({
            "action": "game_ended",
            "message": f"Temps écoulé! {found_count}/{total_words} mots trouvés.",
            "found_count": found_count,
            "total_words": total_words,
            "hmac_token": game_data.get("hmac_token", ""),
            "reason": "time_up",
            "game_state": {
                "active": False,
                "completed": True,
                "found_words": game_data["found_words"],
                "remaining_words": total_words - found_count
            }
        })
    except Exception:
        pass

    if user_id in active_games:
        del active_games[user_id]

@app.websocket("/ws/Gpop")
async def ws_Gpop():
    """WebSocket principal pour le jeu"""

    try:
        user_id = await authenticate_websocket()
        if not user_id:
            await websocket.send_json({
                "error": "Utilisateur non connecté",
                "action": "auth_error"
            })
            return

        game_name = "Grid Pop"
        game_exists = await check_game_exists(user_id, game_name)

        if not game_exists:
            await websocket.send_json({
                "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
                "action": "game_not_found"
            })
            await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
            return

        while True:
            # ✅ NOUVEAU : le serveur applique lui-même la limite de 3 minutes.
            # Si une partie est active, on calcule le temps restant jusqu'à
            # son "deadline" et on attend le prochain message du client avec
            # ce délai comme timeout. Si rien n'arrive à temps (ou si le
            # temps est déjà écoulé), la partie est terminée automatiquement
            # côté serveur, sans dépendre d'un quelconque timer côté client.
            game_data = active_games.get(user_id)
            if game_data and game_data.get("active"):
                remaining = game_data.get("deadline", 0) - time.monotonic()
                if remaining <= 0:
                    await handle_time_up(user_id)
                    continue
                try:
                    data = await asyncio.wait_for(websocket.receive_json(), timeout=remaining)
                except asyncio.TimeoutError:
                    await handle_time_up(user_id)
                    continue
            else:
                data = await websocket.receive_json()

                if not await check_ws_message_rate(user_id):
                                    await websocket.send_json({
                                        "type": "error",
                                        "error": "Trop d'actions, ralentis un peu."
                                    })
                                    continue

            action = data.get("action")

            if action == "get_game":
                api_words = await fetch_words_from_api()

                if api_words and len(api_words) >= 3:
                    words_source = "api"
                    words = api_words[:6]
                else:
                    fallback_words = get_fallback_words()
                    if fallback_words and len(fallback_words) >= 3:
                        words_source = "fallback"
                        words = fallback_words[:6]
                    else:
                        words_source = "default"
                        words = ["TEST", "CLOUDSIDE", "LALMATECH", "GRIDPOP", "PLAYING", "CHANGE"]
                        words = [word.upper() for word in words if len(word) <= MAX_WORD_LENGTH]

                # Génération de la grille dans un thread séparé pour ne pas
                # bloquer la boucle asyncio (et donc tous les autres joueurs).
                game_data = await asyncio.to_thread(generate_game_grid, words)

                game_id = str(int(datetime.now().timestamp()))
                hmac_token = lettricide_generate_hmac(game_id, int(user_id))

                game_data.update({
                    "game_id": game_id,
                    "hmac_token": hmac_token,
                    "active": True,
                    "completed": False,
                    "finalized": False,          # ✅ NOUVEAU : garde-fou anti double log
                    "total_win": 0,               # ✅ NOUVEAU : cumul des gains de la partie
                    "found_words": {},
                    "selected_cells": [],
                    "start_time": datetime.now().isoformat(),
                    # ✅ NOUVEAU : instant limite de la partie, calculé côté serveur
                    "deadline": time.monotonic() + GAME_DURATION_SECONDS,
                    "source": words_source,
                    "current_bet": data.get("bet", 100)
                })

                active_games[user_id] = game_data

                await websocket.send_json({
                    "action": "game_created",
                    "grid": game_data["grid"],
                    "words": game_data["words"],
                    "word_positions": game_data["word_positions"],
                    "grid_size": GRID_SIZE,
                    "source": words_source,
                    "game_id": game_id,
                    "hmac_token": hmac_token,
                    "duration_seconds": GAME_DURATION_SECONDS,  # ✅ utile pour que le frontend affiche le bon timer
                    "game_state": {
                        "active": True,
                        "completed": False,
                        "found_words": {},
                        "remaining_words": len(game_data["words"])
                    }
                })

            elif action == "select_cell":
                if user_id not in active_games:
                    await websocket.send_json({
                        "error": "Aucune partie active",
                        "action": "select_cell"
                    })
                    continue

                game_data = active_games[user_id]

                client_token = data.get("hmac_token")
                game_id = game_data.get("game_id")

                if not client_token or not game_id:
                    await websocket.send_json({
                        "error": "Token manquant",
                        "action": "select_cell"
                    })
                    continue

                if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                    await websocket.send_json({
                        "error": "Token invalide",
                        "action": "select_cell"
                    })
                    continue

                row = data.get("row")
                col = data.get("col")

                if row is None or col is None:
                    await websocket.send_json({
                        "error": "Coordonnées manquantes",
                        "action": "select_cell"
                    })
                    continue

                cell = (row, col)

                if cell in game_data.get("selected_cells", []):
                    await websocket.send_json({
                        "action": "selection_updated",
                        "selected_cells": game_data["selected_cells"],
                        "valid": True,
                        "message": "Cellule déjà sélectionnée"
                    })
                    continue

                selection = game_data.get("selected_cells", []) + [cell]
                valid, message = is_valid_selection(game_data, selection)

                if valid:
                    game_data["selected_cells"] = selection
                    active_games[user_id] = game_data

                    await websocket.send_json({
                        "action": "selection_updated",
                        "selected_cells": selection,
                        "valid": True,
                        "message": "Sélection mise à jour"
                    })

                    word_found, word, direction = check_word(game_data, selection)

                    if word_found:
                        current_bet = game_data.get("current_bet", 100)
                        # ✅ CORRECTION : arrondi à l'entier AVANT de créditer le
                        # solde. Avant, (bet * 2) / 6 pouvait donner des valeurs
                        # à virgule (ex: 33.33 XOF pour une mise de 100), ce qui
                        # n'a pas de sens pour une devise comme le XOF (pas de
                        # centimes). On utilise round() puis int() pour garantir
                        # un montant entier.
                        raw_amount = (current_bet * 2) / 6
                        win_amount = int(round(raw_amount))

                        success, result = await add_win_to_user_solde(user_id, win_amount, word)

                        if success:
                            # ✅ NOUVEAU : on cumule le gain réel dans la partie.
                            # Ce total (et non chaque gain individuel) servira
                            # à l'appel unique de log_game_result en fin de
                            # partie.
                            game_data["total_win"] = game_data.get("total_win", 0) + win_amount
                        else:
                            win_amount = 0

                        game_data = update_game_state(game_data, word, selection)
                        game_data["selected_cells"] = []
                        active_games[user_id] = game_data

                        await websocket.send_json({
                            "action": "word_found",
                            "word": word,
                            "direction": direction,
                            "positions": selection,
                            "win_amount": win_amount,
                            "gain_added": success,
                            "hmac_token": game_data["hmac_token"],
                            "game_state": {
                                "active": game_data["active"],
                                "completed": game_data["completed"],
                                "found_words": game_data["found_words"],
                                "remaining_words": len(game_data["words"]) - len(game_data["found_words"])
                            }
                        })

                        if game_data["completed"]:
                            # ✅ NOUVEAU : c'est ICI, à la toute fin de la partie
                            # (tous les mots trouvés), que log_game_result est
                            # appelé - une seule fois, avec le total réel gagné.
                            await finalize_game(user_id, game_data, reason="completed")

                            await websocket.send_json({
                                "action": "game_completed",
                                "message": "Tous les mots ont été trouvés!",
                                "total_win": game_data.get("total_win", 0),
                                "hmac_token": game_data["hmac_token"],
                                "game_state": {
                                    "active": False,
                                    "completed": True,
                                    "found_words": game_data["found_words"],
                                    "remaining_words": 0
                                }
                            })

                            if user_id in active_games:
                                del active_games[user_id]
                    else:
                        max_word_length = max([len(w) for w in game_data["words"]]) if game_data["words"] else 0
                        if len(selection) > max_word_length:
                            game_data["selected_cells"] = []
                            active_games[user_id] = game_data

                            await websocket.send_json({
                                "action": "invalid_word",
                                "selected_cells": [],
                                "hmac_token": game_data["hmac_token"],
                                "message": "Mot incorrect. Essayez encore!"
                            })
                else:
                    await websocket.send_json({
                        "action": "selection_invalid",
                        "selected_cells": game_data.get("selected_cells", []),
                        "hmac_token": game_data["hmac_token"],
                        "valid": False,
                        "message": message
                    })

            elif action == "clear_selection":
                if user_id in active_games:
                    game_data = active_games[user_id]

                    client_token = data.get("hmac_token")
                    game_id = game_data.get("game_id")

                    if not client_token or not game_id:
                        await websocket.send_json({
                            "error": "Token manquant",
                            "action": "clear_selection"
                        })
                        continue

                    if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                        await websocket.send_json({
                            "error": "Token invalide",
                            "action": "clear_selection"
                        })
                        continue

                    game_data["selected_cells"] = []
                    active_games[user_id] = game_data

                    await websocket.send_json({
                        "action": "selection_cleared",
                        "selected_cells": [],
                        "hmac_token": game_data["hmac_token"],
                        "message": "Sélection effacée"
                    })

            elif action == "end_game":
                if user_id in active_games:
                    game_data = active_games[user_id]

                    client_token = data.get("hmac_token")
                    game_id = game_data.get("game_id")

                    if client_token and game_id:
                        if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                            await websocket.send_json({
                                "error": "Token invalide",
                                "action": "end_game"
                            })
                            continue

                    # ✅ NOUVEAU : fin volontaire du joueur = fin de partie.
                    # log_game_result est appelé ici (une seule fois grâce au
                    # flag "finalized"), avec le total gagné jusque-là si > 0,
                    # sinon la mise initiale (partie perdue).
                    await finalize_game(user_id, game_data, reason="manual")

                    found_count = len(game_data.get("found_words", {}))
                    total_words = len(game_data["words"])

                    await websocket.send_json({
                        "action": "game_ended",
                        "message": f"Partie terminée! {found_count}/{total_words} mots trouvés.",
                        "found_count": found_count,
                        "total_words": total_words,
                        "hmac_token": game_data.get("hmac_token", ""),
                        "game_state": {
                            "active": False,
                            "completed": True,
                            "found_words": game_data["found_words"],
                            "remaining_words": total_words - found_count
                        }
                    })

                    if user_id in active_games:
                        del active_games[user_id]

            elif action == "get_game_state":
                if user_id in active_games:
                    game_data = active_games[user_id]

                    client_token = data.get("hmac_token")
                    game_id = game_data.get("game_id")

                    if client_token and game_id:
                        if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                            await websocket.send_json({
                                "error": "Token invalide",
                                "action": "get_game_state"
                            })
                            continue

                    await websocket.send_json({
                        "action": "game_state",
                        "game_state": {
                            "active": game_data["active"],
                            "completed": game_data["completed"],
                            "found_words": game_data["found_words"],
                            "selected_cells": game_data.get("selected_cells", []),
                            "remaining_words": len(game_data["words"]) - len(game_data.get("found_words", {})),
                            "grid": game_data["grid"],
                            "words": game_data["words"]
                        },
                        "hmac_token": game_data.get("hmac_token", "")
                    })
                else:
                    await websocket.send_json({
                        "action": "game_state",
                        "game_state": None,
                        "message": "Aucune partie active"
                    })

            else:
                await websocket.send_json({
                    "error": "Action inconnue",
                    "action": action,
                    "valid_actions": [
                        "get_game",
                        "select_cell",
                        "clear_selection",
                        "end_game",
                        "get_game_state"
                    ]
                })

    except Exception:
        pass
    finally:
        if 'user_id' in locals() and user_id in active_games:
            leftover_game = active_games[user_id]
            # ✅ NOUVEAU : si la connexion se coupe pendant qu'une partie est
            # encore active (déconnexion, crash client, etc.), on finalise
            # quand même la partie pour ne jamais perdre un appel à
            # log_game_result. Sans appel réseau ici puisque la websocket
            # peut déjà être fermée.
            if leftover_game.get("active") and not leftover_game.get("finalized"):
                try:
                    await finalize_game(user_id, leftover_game, reason="disconnected")
                except Exception:
                    pass
            del active_games[user_id]


# ====================================================================
# SYSTEME DU JEU LETTRICIDE
# ====================================================================

WORD_DURATION = 30      # Source unique de vérité pour la durée d'un mot (secondes)
TARGET_MIN = 3           # Objectif minimum (mots à trouver sur 10)
TARGET_MAX = 10          # Objectif maximum


def lettricide_generate_hmac(game_id: str, user_id: int) -> str:
    msg = f"{game_id}:{user_id}".encode()
    token = hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()
    return token


def lettricide_verify_hmac(token: str, game_id: str, user_id: int) -> bool:
    expected = lettricide_generate_hmac(game_id, user_id)
    valid = hmac.compare_digest(expected, token)
    return valid


word_cache: list[str] = []
default_words: list[str] = []
games: dict[str, dict] = {}


@app.before_serving
async def lettricide_load_words():
    global default_words
    JSON_PATH = os.path.join("html 1", "lang", "lettricide.json")
    async with aiofiles.open(JSON_PATH, "r", encoding="utf-8") as f:
        content = await f.read()
        data = json.loads(content)
        default_words = data.get("default_words", [])


async def lettricide_get_random_word() -> str:
    if word_cache:
        word = word_cache.pop()
        return word
    word = random.choice(default_words)
    return word


def lettricide_generate_game_id() -> str:
    game_id = str(random.randint(100000, 999999))
    return game_id


def lettricide_generate_target() -> int:
    """Génère l'objectif (nombre de mots à trouver sur 10) côté serveur.
    C'est la SEULE source de vérité pour l'objectif — jamais le client."""
    target = random.randint(TARGET_MIN, TARGET_MAX)
    return target


def lettricide_generate_hint(word: str) -> str:
    if len(word) <= 4:
        hint = "_" * len(word)
        return hint
    hint = word[0] + "".join("_" for _ in word[1:-1]) + word[-1]
    return hint


def lettricide_time_left(game_data: dict) -> float:
    """Calcule le temps restant réel (secondes) pour le mot en cours,
    basé sur l'horloge serveur uniquement."""
    elapsed = time.time() - game_data["word_start_time"]
    return max(0.0, WORD_DURATION - elapsed)


def lettricide_evaluate_progress(game_data: dict) -> str:
    """Détermine si la partie doit se terminer immédiatement.
    Retourne 'win' si l'objectif est déjà atteint, 'lose' si l'objectif
    est devenu mathématiquement impossible à atteindre avec les mots
    restants, sinon 'continue'."""
    words_won = game_data["words_won"]
    target = game_data["target"]
    remaining_words = game_data["words_total"] - game_data["current_word_index"]

    if words_won >= target:
        return "win"

    if words_won + remaining_words < target:
        return "lose"

    return "continue"


async def lettricide_word_timer(game_data: dict, websocket):
    game_id = game_data.get("game_id")
    word_index_at_start = game_data["current_word_index"]
    await asyncio.sleep(WORD_DURATION)

    # Si le mot est toujours en jeu → perdu
    # On vérifie aussi que c'est bien le même mot (évite une race condition
    # si un nouveau mot a démarré entre-temps avec le même statut "playing")
    if game_data["status"] == "playing" and game_data["current_word_index"] == word_index_at_start:
        game_data["status"] = "timeout"
        game_data["current_word_index"] += 1

        await websocket.send_json({
            "status": "timeout",
            "word": game_data["current_word"],
            "server_time": time.time()
        })

        progress = lettricide_evaluate_progress(game_data)
        if progress in ("win", "lose") or game_data["current_word_index"] >= game_data["words_total"]:
            await lettricide_finish_game(game_data, websocket)
        else:
            await lettricide_next_word(game_data, websocket)


async def lettricide_finish_game(game_data: dict, websocket):
    game_id = game_data.get("game_id")
    words_won = game_data["words_won"]
    target = game_data["target"]
    has_won = words_won >= target
    payout = game_data["bet"] * 2 if has_won else 0
    log_amount = (game_data["bet"] * 2) if has_won else game_data["bet"]

    if payout > 0 and not game_data["credited"]:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (payout, game_data["user_id"])
            )
        game_data["credited"] = True

    if not game_data.get("result_logged"):
        await log_game_result(game_data["user_id"], has_won, log_amount, "Lettricide")
        game_data["result_logged"] = True

    await websocket.send_json({
        "status": "finished",
        "has_won": has_won,
        "words_won": words_won,
        "target": target,
        "payout": payout,
        "server_time": time.time()
    })


async def lettricide_next_word(game_data: dict, websocket):
    game_id = game_data.get("game_id")

    word = await lettricide_get_random_word()
    game_data["current_word"] = word
    game_data["used_letters"] = []
    game_data["tries_left"] = 10
    game_data["status"] = "playing"
    game_data["word_start_time"] = time.time()

    game_data["hint"] = lettricide_generate_hint(word)
    game_data["masked"] = game_data["hint"]

    payload = {
        "status": "new_word",
        "masked": game_data["masked"],
        "tries_left": 10,
        "word_index": game_data["current_word_index"] + 1,
        "total_words": game_data["words_total"],
        "target": game_data["target"],
        "words_won": game_data["words_won"],
        "time_left": WORD_DURATION,
        "duration": WORD_DURATION,
        "server_time": time.time()
    }
    await websocket.send_json(payload)

    # 🔥 Démarrage du timer serveur (source unique de vérité pour l'expiration)
    asyncio.create_task(lettricide_word_timer(game_data, websocket))


@app.websocket("/ws/lettricide")
async def lettricide_ws():
    game_id = None

    try:
        user_id = await authenticate_websocket()

        if not user_id:
            await websocket.send_json({"error": "Utilisateur non connecté"})
            return

        game_name = "Lettricide"  # ou "GridPop" selon votre base de données
        game_exists = await check_game_exists(user_id, game_name)
        
        if not game_exists:
            await websocket.send_json({
                "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
                "action": "game_not_found"
            })
            await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
            return

        game_id = lettricide_generate_game_id()
        game_token = lettricide_generate_hmac(game_id, user_id)

        game_data = {
            "user_id": user_id,
            "game_id": game_id,
            "token": game_token,
            "current_word_index": 0,
            "words_total": 10,
            "tries_left": 10,
            "used_letters": [],
            "current_word": "",
            "masked": "",
            "hint": "",
            "status": "playing",
            "bet": 0,
            "target": None,
            "words_won": 0,
            "credited": False,
            "result_logged": False,
            "word_start_time": 0
        }

        games[game_id] = game_data

        session_response = {
            "status": "session_created",
            "game_id": game_id,
            "token": game_token,
            "server_time": time.time()
        }
        await websocket.send_json(session_response)

        while True:
            msg = await websocket.receive()

            if not await check_ws_message_rate(user_id):
                                await websocket.send_json({
                                    "type": "error",
                                    "error": "Trop d'actions, ralentis un peu."
                                })
                                continue
            
            data = json.loads(msg)

            action = data.get("action")

            # Pour init_session, on n'a pas encore de token valide
            if action == "init_session":
                await websocket.send_json({
                    "status": "session_created",
                    "game_id": game_id,
                    "token": game_token,
                    "timestamp": int(time.time()),
                    "server_time": time.time()
                })
                continue

            # Pour toutes les autres actions, on vérifie le token
            token = data.get("token")

            if not token or not lettricide_verify_hmac(token, game_id, user_id):
                await websocket.send_json({"error": "Token invalide"})
                continue

            if action == "start":
                bet = data.get("bet", 0)

                if bet < 100:
                    await websocket.send_json({"error": "Mise minimale 100"})
                    continue

                # ⚠️ NOTE DEBUG : aucune vérification de plafond ici (voir analyse)

                # Vérifier si le jeu est déjà démarré → renvoyer l'état actuel
                # avec un statut "resume" explicite pour que le client resynchronise
                # correctement son timer au lieu de le laisser figé.
                if game_data["current_word"]:
                    time_left = lettricide_time_left(game_data)
                    resend_payload = {
                        "status": "resume",
                        "masked": game_data["masked"],
                        "tries_left": game_data["tries_left"],
                        "time_left": time_left,
                        "duration": WORD_DURATION,
                        "server_time": time.time(),
                        "target": game_data["target"],
                        "words_won": game_data["words_won"],
                        "words_left": game_data["words_total"] - game_data["current_word_index"],
                        "word_index": game_data["current_word_index"] + 1
                    }
                    await websocket.send_json(resend_payload)
                    continue

                game_data["bet"] = bet

                # 🎯 Génération de l'objectif côté serveur — jamais côté client.
                game_data["target"] = lettricide_generate_target()

                objective_payload = {
                    "status": "objective",
                    "target": game_data["target"],
                    "words_total": game_data["words_total"],
                    "bet": game_data["bet"],
                    "potential_payout": game_data["bet"] * 2,
                    "server_time": time.time()
                }
                await websocket.send_json(objective_payload)

                # Démarrer le jeu avec le premier mot
                await lettricide_next_word(game_data, websocket)
                continue

            if action == "guess" and game_data["status"] == "playing":
                letter = data.get("letter", "").lower()

                if not letter.isalpha() or len(letter) != 1:
                    continue

                if letter in game_data["used_letters"]:
                    continue

                game_data["used_letters"].append(letter)

                # Vérification si la lettre est dans le mot
                if letter not in game_data["current_word"]:
                    game_data["tries_left"] -= 1

                # Construction du mot masqué
                masked = "".join(
                    c if c in game_data["used_letters"] or game_data["hint"][i] != "_"
                    else "_"
                    for i, c in enumerate(game_data["current_word"])
                )
                game_data["masked"] = " ".join(masked)

                # Vérification de victoire ou défaite du mot
                if "_" not in masked:
                    game_data["status"] = "win"
                    game_data["words_won"] += 1
                elif game_data["tries_left"] <= 0:
                    game_data["status"] = "lose"

                # Envoi de la réponse
                time_left = lettricide_time_left(game_data)
                response = {
                    "masked": game_data["masked"],
                    "tries_left": game_data["tries_left"],
                    "time_left": time_left,
                    "duration": WORD_DURATION,
                    "server_time": time.time(),
                    "words_left": game_data["words_total"] - game_data["current_word_index"],
                    "words_won": game_data["words_won"],
                    "target": game_data["target"],
                    "status": game_data["status"]
                }
                await websocket.send_json(response)

                # Gestion de la fin du mot
                if game_data["status"] in ["win", "lose"]:
                    game_data["current_word_index"] += 1

                    progress = lettricide_evaluate_progress(game_data)
                    if progress in ("win", "lose") or game_data["current_word_index"] >= game_data["words_total"]:
                        await lettricide_finish_game(game_data, websocket)
                        break
                    else:
                        await lettricide_next_word(game_data, websocket)

            else:
                if action != "guess":
                    await websocket.send_json({"error": f"Action non reconnue: {action}"})

    except Exception as e:
        try:
            await websocket.send_json({"error": f"Erreur interne: {str(e)}"})
        except:
            pass
    finally:
        if game_id in games:
            del games[game_id]



# Route 100% async
@app.route('/api/get_lettricide_lives', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def get_lettricide_lives(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('Lettricide', user_id)
                )
                row = await cur.fetchone()

        if row:
            return jsonify({
                'lives': row[0],
                'product': 'Lettricide'
            })
        else:
            # Valeur par défaut si aucune entrée n'existe
            return jsonify({
                'lives': 0,
                'product': 'Lettricide',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Lettricide'
        }), 500


# Route 100% async pour décrémenter les vies Lettricide
@app.route('/api/decrement_lettricide_lives', methods=['POST'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def decrement_lettricide_lives(wari_session):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = %s AND user_id = %s
                    FOR UPDATE
                """, ('Lettricide', user_id))
                row = await cur.fetchone()

                if not row:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = row[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings
                    SET vies = vies - 1
                    WHERE product_name = %s AND user_id = %s
                """, ('Lettricide', user_id))

        # Le pool est en autocommit, donc pas besoin de commit explicite
        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

# ====================================================================
# SYSTEME DU JEU ANA MIND
# ====================================================================

FALLBACK_WORDS = ['ordinateur', 'programmation', 'développeur', 'algorithm', 'internet']

HMAC_SECRET_KEY = os.environ.get("HMAC_SECRET_KEY").encode()

def normalize_text(text: str) -> str:
    text = text.lower().strip()
    normalized = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in normalized if not unicodedata.combining(c))

def shuffle_word(word: str) -> str:
    letters = list(word)
    random.shuffle(letters)
    return ''.join(letters)

def generate_hmac_ana(word: str) -> str:
    return hmac.new(HMAC_SECRET_KEY, word.encode(), hashlib.sha256).hexdigest()

def verify_hmac_ana(word: str, received_hmac: str) -> bool:
    if not received_hmac:
        return False
    expected_hmac = generate_hmac_ana(word)
    return hmac.compare_digest(expected_hmac, received_hmac)


# --- Stocke le mot ET la mise associée, par utilisateur ---
ACTIVE_WORDS = {}


async def generate_new_word(user_id, bet):
    """Génère un nouveau mot, le stocke, et renvoie le payload à envoyer au client."""
    word = None
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get('https://trouve-mot.fr/api/random')
            response.raise_for_status()
            data = response.json()
            if data and len(data) > 0 and 'name' in data[0]:
                word = data[0]['name'].lower()
    except Exception:
        pass

    if not word:
        word = random.choice(FALLBACK_WORDS)

    current = ACTIVE_WORDS.get(user_id)
    if current and current['word'] == word:
        word = random.choice([w for w in FALLBACK_WORDS if w != word])

    shuffled = shuffle_word(word)
    word_hmac = generate_hmac_ana(word)

    ACTIVE_WORDS[user_id] = {'word': word, 'bet': bet}

    return {
        'shuffled': shuffled,
        'time_limit': 30,
        'hmac': word_hmac
    }


@app.websocket('/ws/amind')
async def ws_get_word():
    pool = await get_pool()

    # ============================================================
    # --- Authentification (une seule fois, hors boucle) ---
    # ============================================================
    try:
        user_id = await authenticate_websocket()
    except BaseException:
        traceback.print_exc()
        return

    if user_id is None:
        await websocket.send_json({'error': 'Utilisateur non connecté'})
        return

    # ============================================================
    # --- Vérification du jeu possédé (une fois aussi) ---
    # ============================================================
    game_name = "Ana Mind"
    try:
        game_exists = await check_game_exists(user_id, game_name)
    except BaseException:
        traceback.print_exc()
        return

    if not game_exists:
        await websocket.send_json({
            "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
            "action": "game_not_found"
        })
        await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
        return

    # ============================================================
    # --- Boucle de jeu unique : route selon le contenu du message ---
    # ============================================================
    while True:
        try:
            has_active_word = user_id in ACTIVE_WORDS
            if has_active_word:
                msg = await asyncio.wait_for(websocket.receive_json(), timeout=30)
            else:
                msg = await websocket.receive_json()

            if not await check_ws_message_rate(user_id):
                                await websocket.send_json({
                                    "type": "error",
                                    "error": "Trop d'actions, ralentis un peu."
                                })
                                continue

            # ============================================================
            # CAS 1 : Le message est une RÉPONSE (contient 'answer')
            # ============================================================
            if 'answer' in msg:
                current = ACTIVE_WORDS.get(user_id)
                if not current:
                    await websocket.send_json({'success': False, 'message': 'Aucune partie active', 'gain': 0})
                    continue

                word = current['word']
                bet = current['bet']

                player_answer = msg.get('answer', '').lower().strip()
                response_hmac = msg.get('hmac')

                if not verify_hmac_ana(word, response_hmac):
                    await websocket.send_json({'success': False, 'message': 'HMAC invalide !', 'gain': 0})
                    continue

                normalized_answer = normalize_text(player_answer)
                normalized_word = normalize_text(word)

                if normalized_answer == normalized_word:
                    gain = bet * 2
                    async with pool.acquire() as conn:
                        async with conn.cursor() as cur:
                            await cur.execute(
                                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                                (gain, user_id)
                            )
                    await log_game_result(user_id, True, gain, "Ana Mind")
                    result = {'success': True, 'message': 'Correct !', 'gain': gain}
                else:
                    await log_game_result(user_id, False, bet, "Ana Mind")
                    result = {'success': False, 'message': 'Échec !', 'gain': 0}

                ACTIVE_WORDS.pop(user_id, None)
                await websocket.send_json(result)
                continue

            # ============================================================
            # CAS 2 : Le message est une DEMANDE DE MOT (bet) — nouveau jeu OU skip
            # ============================================================
            bet = msg.get('bet')

            if bet is None or bet < 100:
                await websocket.send_json({'error': 'Le pari doit être >= 100'})
                continue

            if user_id in ACTIVE_WORDS:
                ACTIVE_WORDS.pop(user_id, None)

            game_id = lettricide_generate_game_id()
            game_token = lettricide_generate_hmac(game_id, user_id)

            payload = await generate_new_word(user_id, bet)
            await websocket.send_json(payload)

        except asyncio.TimeoutError:
            current = ACTIVE_WORDS.pop(user_id, None)
            if current:
                await log_game_result(user_id, False, current['bet'], "Ana Mind")
            await websocket.send_json({'success': False, 'message': 'Temps écoulé !', 'gain': 0})

        except BaseException:
            traceback.print_exc()
            break


# ====================================================================
# SYSTEME DU JEU SPEED MIND
# ====================================================================

JSON_MIND_PATH = "html 1/lang/mind.json"
SMIND_QUESTION_TIME = 10
SMIND_TOTAL_QUESTIONS = 40
SMIND_MIN_BET = 100
SMIND_QUESTIONS_BY_ID = {}

# Générateur aléatoire dédié à Smind, isolé de tout random.seed() appelé
# ailleurs dans l'application (autres jeux, tests, etc.)
smind_rng = random.Random()
smind_rng.seed(os.urandom(16))


@app.before_serving
async def smind_load_questions():
    global SMIND_QUESTIONS_BY_ID
    async with aiofiles.open(JSON_MIND_PATH, "r", encoding="utf-8") as f:
        data = json.loads(await f.read())
    SMIND_QUESTIONS_BY_ID = {
        i: q for i, q in enumerate(data["questions"])
    }


def smind_create_question_token(question_id: int) -> str:
    return hmac.new(
        SECRET_KEY,
        str(question_id).encode(),
        hashlib.sha256
    ).hexdigest()


def smind_verify_question_token(question_id: int, token: str) -> bool:
    expected = smind_create_question_token(question_id)
    return hmac.compare_digest(expected, token)


async def smind_credit_user(user_id: int, amount: int):
    if amount <= 0:
        return
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            if cur.rowcount == 0:
                raise Exception("Utilisateur introuvable")
            await conn.commit()


def smind_cancel_timer(smind_game):
    """Annule proprement le timer en cours s'il existe."""
    timer = smind_game.get("current_timer")
    if timer is not None and not timer.done():
        timer.cancel()
    smind_game["current_timer"] = None


@app.websocket("/ws/Smind")
async def smind_websocket():
    user_id = None

    try:
        # authenticate_websocket() attend le message d'auth du frontend
        # ({type: 'auth', jwt, fingerprint, csrf, ...}) et retourne le user_id
        user_id = await authenticate_websocket()
        if user_id is None:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Utilisateur non connecté"
            }))
            return
    except Exception:
        try:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Erreur d'authentification"
            }))
        except Exception:
            pass
        return

    smind_game = {
        "question_ids": [],
        "current_qid": None,
        "current_correct_index": None,
        "index": 0,
        "good": 0,
        "bad": 0,
        "bet": 0,
        "gain_per_question": 0,
        "waiting": False,
        "current_timer": None
    }

    try:
        while True:
            raw = await websocket.receive()

            if not await check_ws_message_rate(user_id):
                                await websocket.send_json({
                                    "type": "error",
                                    "error": "Trop d'actions, ralentis un peu."
                                })
                                continue

            try:
                data = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "Message invalide"
                }))
                continue

            action = data.get("action")

            if action == "start_game":
                bet = int(data.get("bet", 0))
                if bet < SMIND_MIN_BET:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": f"Mise minimale : {SMIND_MIN_BET}"
                    }))
                    continue

                smind_cancel_timer(smind_game)

                available_ids = list(SMIND_QUESTIONS_BY_ID.keys())
                n = min(SMIND_TOTAL_QUESTIONS, len(available_ids))
                smind_game["question_ids"] = smind_rng.sample(available_ids, n)

                smind_game["index"] = 0
                smind_game["good"] = 0
                smind_game["bad"] = 0
                smind_game["bet"] = bet
                smind_game["gain_per_question"] = round((bet * 2) / SMIND_TOTAL_QUESTIONS)

                await smind_send_question(smind_game)

            elif action == "answer":
                if not smind_game["waiting"]:
                    continue

                qid = data.get("id")
                token = data.get("token")
                choice = data.get("choice")

                if qid != smind_game["current_qid"]:
                    smind_cancel_timer(smind_game)
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Question invalide"
                    }))
                    return

                if not smind_verify_question_token(qid, token):
                    smind_cancel_timer(smind_game)
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Tentative de triche détectée"
                    }))
                    return

                smind_cancel_timer(smind_game)
                await smind_process_answer(smind_game, choice, user_id)

    except Exception:
        pass
    finally:
        smind_cancel_timer(smind_game)


async def smind_send_question(smind_game):
    if smind_game["index"] >= SMIND_TOTAL_QUESTIONS:
        await websocket.send(json.dumps({
            "type": "game_over",
            "good": smind_game["good"],
            "bad": smind_game["bad"]
        }))
        return

    qid = smind_game["question_ids"][smind_game["index"]]
    q = SMIND_QUESTIONS_BY_ID[qid]
    token = smind_create_question_token(qid)
    smind_game["current_qid"] = qid
    smind_game["waiting"] = True

    # --- Mélange des options pour éviter que la bonne réponse soit
    #     toujours au même index (faille de triche : dans mind.json la
    #     bonne réponse est presque toujours à l'index 0). On mélange
    #     à CHAQUE envoi de question, et on retient l'index correct
    #     correspondant à CETTE présentation mélangée. C'est cet index
    #     mélangé qui sert de référence pour valider la réponse du
    #     joueur, jamais l'index brut du JSON. ---
    n_options = len(q["options"])
    order = list(range(n_options))
    smind_rng.shuffle(order)
    shuffled_options = [q["options"][i] for i in order]
    shuffled_correct_index = order.index(q["correct"])

    smind_game["current_correct_index"] = shuffled_correct_index

    smind_game["current_timer"] = asyncio.create_task(smind_question_timeout(smind_game, qid))

    await websocket.send(json.dumps({
        "type": "question",
        "id": qid,
        "index": smind_game["index"] + 1,
        "total": SMIND_TOTAL_QUESTIONS,
        "question": q["question"],
        "options": shuffled_options,
        "token": token,
        "time": SMIND_QUESTION_TIME
    }))


async def smind_question_timeout(smind_game, qid):
    try:
        await asyncio.sleep(SMIND_QUESTION_TIME)
        if smind_game.get("waiting") and smind_game.get("current_qid") == qid:
            await smind_process_answer(smind_game, None, None)
    except asyncio.CancelledError:
        pass


async def smind_process_answer(smind_game, choice, user_id):
    if not smind_game["waiting"]:
        return

    smind_game["waiting"] = False
    qid = smind_game["current_qid"]
    correct_index = smind_game["current_correct_index"]

    if choice is not None and choice == correct_index:
        smind_game["good"] += 1
        gain = smind_game["gain_per_question"]
        if user_id is not None:
            await smind_credit_user(user_id, gain)
        result = {
            "type": "result",
            "status": "correct",
            "gain": gain
        }
    else:
        smind_game["bad"] += 1
        result = {
            "type": "result",
            "status": "wrong",
            "gain": 0
        }

    smind_game["index"] += 1

    await websocket.send(json.dumps({
        **result,
        "good": smind_game["good"],
        "bad": smind_game["bad"]
    }))

    if smind_game["index"] >= SMIND_TOTAL_QUESTIONS:
        total_gain = smind_game["good"] * smind_game["gain_per_question"]
        has_won = total_gain > smind_game["bet"]
        amount = total_gain if has_won else smind_game["bet"]
        if user_id is not None:
            await log_game_result(user_id, has_won, amount, "Speed Mind")

    await smind_send_question(smind_game)


# ====================================================================
# SYSTEME DU JEU SMART_BATTLE
# ====================================================================

SMART_PATH = os.path.join("html 1", "lang", "smart.json")
CATEGORIES_ORDER = ["science", "litterature", "maths", "histoire"]
CATEGORY_DURATION = 30  # secondes

CATEGORY_POINTS = {
    "science": 4,
    "litterature": 3,
    "maths": 2,
    "histoire": 1
}

# --- Objectif de la partie, géré côté backend ---
OBJECTIVE_TARGET_SCORE = 150

QUESTIONS = {}      # category -> list of questions SAFE
ANSWER_KEY = {}     # question_id -> correct index
PLAYER_STATS = {}   # smart_id -> stats
QUESTION_USED = {}  # smart_id -> set(question_id) pour anti-rejeu

async def load_questions():
    if QUESTIONS:
        return
    async with aiofiles.open(SMART_PATH, "r", encoding="utf-8") as f:
        raw = json.loads(await f.read())
    for category, qs in raw.items():
        QUESTIONS[category] = []
        for idx, q in enumerate(qs):
            qid = f"{category}_{idx}"
            ANSWER_KEY[qid] = q["correct"]
            QUESTIONS[category].append({
                "id": qid,
                "question": q["question"],
                "options": q["options"]
            })

def generate_smart_id(user_id):
    return hashlib.sha256(str(user_id).encode()).hexdigest()[:16]

#Utilise create_question_token et verify_question_token pour la securiter hmac

async def send_question(category, smart_id, remaining_time):
    used = QUESTION_USED.get(smart_id, set())
    available = [q for q in QUESTIONS[category] if q["id"] not in used]
    if not available:
        QUESTION_USED[smart_id] = set()
        available = QUESTIONS[category].copy()
    question = random.choice(available)
    QUESTION_USED.setdefault(smart_id, set()).add(question["id"])
    token = smind_create_question_token(question["id"])
    await websocket.send(json.dumps({
        "type": "question",
        "category": category,
        "data": question,
        "token": token,
        "remaining": round(remaining_time, 1)
    }))
    return question["id"], token

async def credit_player(user_id, amount):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            await conn.commit()


async def finish_game(user_id, smart_id, bet, stats, objective_reached):
    """Calcule le gain, crédite le joueur, log le résultat et notifie le client."""
    total_score = stats["score"]
    gain = 0
    winner = objective_reached

    if winner:
        total_q = stats["total"]
        divisor = total_q if total_q < 50 else 40
        gain = bet * 2 / divisor * stats["correct"]
        await credit_player(user_id, gain)
        await log_game_result(user_id, True, gain, "Smart Battle")
    else:
        await log_game_result(user_id, False, bet, "Smart Battle")

    await websocket.send(json.dumps({
        "type": "game_over",
        "score": total_score,
        "stats": stats,
        "gain": gain,
        "winner": winner,
        "objective": {
            "target_score": OBJECTIVE_TARGET_SCORE,
            "reached": objective_reached
        }
    }))

    if smart_id in PLAYER_STATS:
        del PLAYER_STATS[smart_id]
    if smart_id in QUESTION_USED:
        del QUESTION_USED[smart_id]
@app.websocket("/ws/sbattle")
async def sbattle_ws():
    try:
        user_id = await authenticate_websocket()

        if not user_id:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Authentification échouée"
            }))
            await websocket.close(code=4001, reason="Authentification échouée")
            return

        game_name = "Smart Battle"
        game_exists = await check_game_exists(user_id, game_name)

        if not game_exists:
            await websocket.send_json({
                "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
                "action": "game_not_found"
            })
            await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
            return

        smart_id = generate_smart_id(user_id)

        # Attendre START + BET
        start_msg = await websocket.receive()
        start_msg = json.loads(start_msg)

        if not await check_ws_message_rate(user_id):
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Trop d'actions, ralentis un peu."
            }))
            return

        if start_msg.get("type") != "start":
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Message de démarrage invalide"
            }))
            return

        bet = start_msg.get("bet")
        if not isinstance(bet, (int, float)) or bet < 100:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Bet invalide (minimum 100)"
            }))
            return

        PLAYER_STATS[smart_id] = {"total": 0, "correct": 0, "wrong": 0, "score": 0}
        QUESTION_USED[smart_id] = set()
        await load_questions()

        await websocket.send(json.dumps({
            "type": "objective",
            "target_score": OBJECTIVE_TARGET_SCORE,
            "description": f"Obtenez plus de {OBJECTIVE_TARGET_SCORE} points au score total pour gagner"
        }))

        objective_reached = False

        for category in CATEGORIES_ORDER:
            start_time = time.monotonic()
            await websocket.send(json.dumps({
                "type": "category_start",
                "category": category,
                "duration": CATEGORY_DURATION
            }))

            while time.monotonic() - start_time < CATEGORY_DURATION:
                remaining = CATEGORY_DURATION - (time.monotonic() - start_time)
                qid, token = await send_question(category, smart_id, remaining)

                while True:
                    remaining = CATEGORY_DURATION - (time.monotonic() - start_time)
                    if remaining <= 0:
                        break
                    try:
                        msg = await asyncio.wait_for(websocket.receive(), timeout=remaining)
                    except asyncio.TimeoutError:
                        break

                    data = json.loads(msg)

                    if not await check_ws_message_rate(user_id):
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "Trop d'actions, ralentis un peu."
                        }))
                        continue

                    if data.get("type") != "answer" or data.get("question_id") != qid:
                        continue

                    recv_token = data.get("token")
                    if not smind_verify_question_token(qid, recv_token):
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "Token invalide. Triche détectée."
                        }))
                        continue

                    selected = data["selected"]
                    stats = PLAYER_STATS[smart_id]
                    stats["total"] += 1
                    is_correct = selected == ANSWER_KEY.get(qid)
                    if is_correct:
                        stats["correct"] += 1
                        stats["score"] += CATEGORY_POINTS[category]
                    else:
                        stats["wrong"] += 1

                    if stats["score"] > OBJECTIVE_TARGET_SCORE:
                        objective_reached = True

                    await websocket.send(json.dumps({
                        "type": "result",
                        "question_id": qid,
                        "correct": is_correct,
                        "score": stats["score"],
                        "stats": stats,
                        "remaining": round(CATEGORY_DURATION - (time.monotonic() - start_time), 1),
                        "objective_reached": objective_reached
                    }))
                    break

                if objective_reached:
                    break

            await websocket.send(json.dumps({
                "type": "category_end",
                "category": category
            }))

            if objective_reached:
                break

        stats = PLAYER_STATS[smart_id]
        await finish_game(user_id, smart_id, bet, stats, objective_reached)

    except Exception as e:
        await websocket.send(json.dumps({
            "type": "error",
            "message": str(e)
        }))

# ====================================================================
# SYSTEME DU JEU DASJ_JUMP
# ====================================================================

SCORE_PER_COIN = 10

MAX_COINS_PER_SECOND = 3
SESSION_TIME_TOLERANCE_SECONDS = 6
active_sessions = {}


@app.websocket('/ws/dash_game')
async def dash_game_ws():
    """
    Route WebSocket principale pour le jeu Dash.
    Gère toutes les communications en temps réel du jeu.
    """
    client_id = str(id(websocket._get_current_object()))

    # ── Authentification : première action, avant toute boucle ──────────
    user_id = await authenticate_websocket()

    if not user_id:
        await websocket.send(json.dumps({
            "type": "error",
            "message": "Authentification échouée"
        }))
        await websocket.close(code=4001, reason="Authentification échouée")
        return
    
    game_name = "Dash Jump"
    game_exists = await check_game_exists(user_id, game_name)

    if not game_exists:
        await websocket.send_json({
            "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
            "action": "game_not_found"
        })
        await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
        return

    # Le frontend attend un message explicite de confirmation d'auth
    await websocket.send(json.dumps({"type": "auth_success"}))

    try:
        while True:
            data = await websocket.receive()

            if not await check_ws_message_rate(user_id):
                                await websocket.send_json({
                                    "type": "error",
                                    "error": "Trop d'actions, ralentis un peu."
                                })
                                continue
            
            message = json.loads(data)
            action = message.get('action')

            if action == 'get_dash_objectives':
                await ws_get_objectives(message, user_id)

            elif action == 'start_dash_session':
                await ws_start_session(message, client_id, user_id)

            elif action == 'update_dash_session':
                await ws_update_session(message, client_id, user_id)

            elif action == 'validate_dash_objective':
                await ws_validate_objective(message, client_id, user_id)

            elif action == 'clear_dash_session':
                await ws_clear_session(client_id)

            else:
                await ws_send_message({
                    'success': False,
                    'error': 'Action inconnue'
                })

    except Exception as e:
        await ws_send_message({
            'success': False,
            'error': str(e)
        })
    finally:
        # Nettoyer la session à la déconnexion
        if client_id in active_sessions:
            del active_sessions[client_id]


async def ws_send_message(message):
    """Envoie un message JSON via WebSocket."""
    await websocket.send(json.dumps(message))


async def credit_player(user_id, amount):
    """
    Crédite le solde du joueur de façon atomique (UPDATE direct, pas de
    lecture puis écriture séparées, ce qui évite toute race condition
    entre deux crédits concurrents sur le même user_id).
    Retourne le nouveau solde après crédit.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            await conn.commit()

            await cur.execute(
                "SELECT solde FROM solde WHERE user_id=%s LIMIT 1",
                (user_id,)
            )
            row = await cur.fetchone()
            return float(row[0]) if row else None


async def generate_random_objective():
    """
    Génère un objectif complètement aléatoire.
    Retourne un dictionnaire avec l'objectif généré.
    """
    # Types d'objectifs possibles
    objective_types = [
        'collect_coins',    # Collecter X pièces
        'survive_time',     # Survivre X secondes
        'score_in_time',    # Atteindre X points en Y secondes
        'reach_score'       # Atteindre X points
    ]

    # Sélection aléatoire du type
    selected_type = random.choice(objective_types)

    # Noms et icônes selon le type
    type_info = {
        'collect_coins': {
            'names': ['Collecteur', 'Chasseur de Pièces', 'Magnat', 'Trésorier', 'Numismate'],
            'icons': ['💰', '🪙', '💎', '🏦', '💵']
        },
        'survive_time': {
            'names': ['Survivant', 'Increvable', 'Résistant', 'Endurant', 'Immortel'],
            'icons': ['⏱️', '🛡️', '💪', '🏃', '⚡']
        },
        'score_in_time': {
            'names': ['Rapide', 'Éclair', 'Sprinteur', 'Véloce', 'Turbo'],
            'icons': ['⚡', '🚀', '💨', '🔥', '🎯']
        },
        'reach_score': {
            'names': ['Score Master', 'Champion', 'Légende', 'Titan', 'Dieu du Score'],
            'icons': ['🏆', '👑', '⭐', '🌟', '💫']
        }
    }

    # Sélection aléatoire du nom et de l'icône
    selected_name = random.choice(type_info[selected_type]['names'])
    selected_icon = random.choice(type_info[selected_type]['icons'])

    # Niveaux de difficulté
    difficulties = ['FACILE', 'MOYEN', 'DIFFICILE', 'EXTRÊME']
    selected_difficulty = random.choice(difficulties)

    objective = None

    # Génération des valeurs selon le type et la difficulté
    if selected_type == 'collect_coins':
        coins_ranges = {
            'FACILE': (5, 15),
            'MOYEN': (20, 40),
            'DIFFICILE': (50, 80),
            'EXTRÊME': (90, 150)
        }
        min_coins, max_coins = coins_ranges[selected_difficulty]
        target_coins = random.randint(min_coins, max_coins)
        description = f"Collecter {target_coins} pièces"

        objective = {
            'type': selected_type,
            'name': selected_name,
            'icon': selected_icon,
            'difficulty': selected_difficulty,
            'description': description,
            'target': target_coins
        }

    elif selected_type == 'survive_time':
        time_ranges = {
            'FACILE': (15, 30),
            'MOYEN': (35, 60),
            'DIFFICILE': (65, 90),
            'EXTRÊME': (100, 150)
        }
        min_time, max_time = time_ranges[selected_difficulty]
        target_time = random.randint(min_time, max_time)
        description = f"Survivre {target_time} secondes"

        objective = {
            'type': selected_type,
            'name': selected_name,
            'icon': selected_icon,
            'difficulty': selected_difficulty,
            'description': description,
            'target': target_time
        }

    elif selected_type == 'score_in_time':
        score_time_ranges = {
            'FACILE': {'score': (50, 100), 'time': (20, 35)},
            'MOYEN': {'score': (150, 250), 'time': (25, 45)},
            'DIFFICILE': {'score': (300, 450), 'time': (30, 50)},
            'EXTRÊME': {'score': (500, 800), 'time': (40, 60)}
        }
        ranges = score_time_ranges[selected_difficulty]
        target_score = random.randint(ranges['score'][0], ranges['score'][1])
        target_time = random.randint(ranges['time'][0], ranges['time'][1])
        description = f"Atteindre {target_score} points en {target_time} secondes"

        objective = {
            'type': selected_type,
            'name': selected_name,
            'icon': selected_icon,
            'difficulty': selected_difficulty,
            'description': description,
            'target': target_score,
            'time_limit': target_time
        }

    elif selected_type == 'reach_score':
        score_ranges = {
            'FACILE': (100, 200),
            'MOYEN': (250, 400),
            'DIFFICILE': (450, 600),
            'EXTRÊME': (700, 1000)
        }
        min_score, max_score = score_ranges[selected_difficulty]
        target_score = random.randint(min_score, max_score)
        description = f"Atteindre {target_score} points"

        objective = {
            'type': selected_type,
            'name': selected_name,
            'icon': selected_icon,
            'difficulty': selected_difficulty,
            'description': description,
            'target': target_score
        }

    # Ajout de bonus aléatoire (optionnel, 30% de chance)
    if random.random() < 0.3:
        bonuses = [
            {'type': 'multiplier', 'value': round(random.uniform(1.1, 2.0), 1), 'description': 'Multiplicateur de gains'},
            {'type': 'extra_time', 'value': random.randint(5, 15), 'description': 'Temps bonus'},
            {'type': 'extra_coins', 'value': random.randint(5, 20), 'description': 'Pièces bonus'}
        ]
        selected_bonus = random.choice(bonuses)
        objective['bonus'] = selected_bonus

    return objective


async def ws_get_objectives(data, user_id):
    """Récupère des objectifs de jeu aléatoires via WebSocket."""
    try:
        # Nombre d'objectifs à générer (par défaut 1, max 5)
        count = min(data.get('count', 1), 5)

        # Générer les objectifs
        objectives = []
        for i in range(count):
            objective = await generate_random_objective()
            objectives.append(objective)

        await ws_send_message({
            'success': True,
            'objectives': objectives,
            'objective': objectives[0] if count == 1 else objectives,
            'count': count
        })

    except Exception as e:
        await ws_send_message({
            'success': False,
            'error': str(e)
        })


async def ws_start_session(data, client_id, user_id):
    """Démarre une session de jeu via WebSocket."""
    try:
        bet = data.get('bet')
        objective = data.get('objective')

        if not bet or not objective:
            await ws_send_message({
                'success': False,
                'error': 'Données de session manquantes'
            })
            return

        # Générer un token unique
        session_token = secrets.token_urlsafe(32)
        now = datetime.now()
        expires_at = now + timedelta(hours=1)

        # Stocker la session (user_id vient de l'authentification serveur)
        active_sessions[client_id] = {
            'token': session_token,
            'user_id': user_id,
            'bet': float(bet),
            'objective': objective,
            'objective_type': objective.get('type'),
            'objective_target': objective.get('target'),
            'objective_time_limit': objective.get('time_limit', 0),
            'bonus': objective.get('bonus'),
            'start_time': now.isoformat(),
            'expires_at': expires_at.isoformat(),
            'game_started': False,
            'game_completed': False,
            'objective_completed': False,
            'validated': False,          # empêche une double validation/payout
            'score': 0,
            'coins_collected': 0,
            'game_duration': 0,
            'last_update_server_time': now.isoformat(),  # pour le calcul de débit anti-triche
        }

        await ws_send_message({
            'success': True,
            'session_token': session_token,
            'message': 'Session de jeu créée avec succès'
        })

    except Exception as e:
        await ws_send_message({
            'success': False,
            'error': str(e)
        })


def _validate_gameplay_data(game_session, new_score, new_coins, new_duration, client_id):
    """
    Vérifie la plausibilité des données de gameplay envoyées par le client.
    Retourne (is_valid: bool, error_message: str | None).

    Ces contrôles ne prouvent pas la légitimité à 100% (le jeu reste
    client-authoritative), mais bloquent les falsifications grossières :
    valeurs incohérentes, progression trop rapide, ou horloge décalée.
    """
    # 1) Invariant du jeu : le score ne peut provenir QUE des pièces
    #    collectées (10 points par pièce, aucune autre source de score).
    if new_score != new_coins * SCORE_PER_COIN:
        return False, (
            f"Score incohérent (score={new_score}, "
            f"attendu={new_coins * SCORE_PER_COIN} pour {new_coins} pièces)"
        )

    # 2) Les pièces collectées ne peuvent jamais diminuer au cours d'une
    #    partie.
    if new_coins < game_session['coins_collected']:
        return False, "Nombre de pièces en régression (falsification suspectée)"

    # 3) Débit de collecte de pièces : borné par un maximum plausible,
    #    mesuré sur le temps RÉEL écoulé côté serveur (pas le temps annoncé
    #    par le client) depuis la dernière mise à jour acceptée.
    last_update = datetime.fromisoformat(game_session['last_update_server_time'])
    now = datetime.now()
    real_elapsed_since_last_update = max((now - last_update).total_seconds(), 0.001)
    coins_delta = new_coins - game_session['coins_collected']
    max_allowed_coins = MAX_COINS_PER_SECOND * real_elapsed_since_last_update + 1  # +1 marge anti-arrondi
    if coins_delta > max_allowed_coins:
        return False, (
            f"Collecte de pièces trop rapide ({coins_delta} pièces en "
            f"{real_elapsed_since_last_update:.2f}s, max plausible: {max_allowed_coins:.1f})"
        )

    # 4) La durée de partie annoncée par le client doit correspondre au
    #    temps réellement écoulé depuis le début de la session, mesuré par
    #    l'horloge serveur (protège contre une horloge client manipulée
    #    pour berner les objectifs de type survive_time / score_in_time).
    start_time = datetime.fromisoformat(game_session['start_time'])
    real_elapsed_since_start = (now - start_time).total_seconds()
    if abs(new_duration - real_elapsed_since_start) > SESSION_TIME_TOLERANCE_SECONDS:
        return False, (
            f"Durée de partie incohérente (annoncée={new_duration:.1f}s, "
            f"réelle={real_elapsed_since_start:.1f}s)"
        )

    return True, None


async def ws_update_session(data, client_id, user_id):
    """Met à jour les données de la session via WebSocket."""
    try:
        game_session = active_sessions.get(client_id)
        if not game_session:
            await ws_send_message({
                'success': False,
                'error': 'Aucune session de jeu active'
            })
            return

        if game_session.get('user_id') != user_id:
            await ws_send_message({
                'success': False,
                'error': 'Session invalide'
            })
            return

        # Une fois la session validée (game over traité), on n'accepte plus
        # de mise à jour de gameplay dessus.
        if game_session.get('validated'):
            await ws_send_message({
                'success': False,
                'error': 'Session déjà terminée'
            })
            return

        # Mise à jour de l'état simple (pas de risque de triche)
        if 'game_started' in data:
            game_session['game_started'] = bool(data['game_started'])

        # Mise à jour des données de gameplay (score/coins/durée) : passe
        # par la validation anti-triche avant d'être acceptée.
        if 'score' in data or 'coins_collected' in data:
            new_score = int(data.get('score', game_session['score']))
            new_coins = int(data.get('coins_collected', game_session['coins_collected']))
            new_duration = float(data.get('game_duration', game_session['game_duration']))

            is_valid, error_message = _validate_gameplay_data(
                game_session, new_score, new_coins, new_duration, client_id
            )

            if not is_valid:
                await ws_send_message({
                    'success': False,
                    'error': 'Données de session incohérentes'
                })
                return

            game_session['score'] = new_score
            game_session['coins_collected'] = new_coins
            game_session['last_update_server_time'] = datetime.now().isoformat()

        if 'game_duration' in data:
            game_session['game_duration'] = float(data['game_duration'])

        await ws_send_message({
            'success': True,
            'message': 'Session mise à jour avec succès'
        })

    except Exception as e:
        await ws_send_message({
            'success': False,
            'error': str(e)
        })


async def ws_validate_objective(data, client_id, user_id):
    """Valide l'objectif et calcule les gains via WebSocket."""
    try:
        game_session = active_sessions.get(client_id)
        if not game_session:
            await ws_send_message({
                'success': False,
                'error': 'Aucune session de jeu active'
            })
            return

        if game_session.get('user_id') != user_id:
            await ws_send_message({
                'success': False,
                'error': 'Session invalide'
            })
            return

        # Empêche une double validation / un double payout sur la même
        # session (rejeu de l'action validate_dash_objective).
        if game_session.get('validated'):
            await ws_send_message({
                'success': False,
                'error': 'Objectif déjà validé'
            })
            return

        # Vérifier l'expiration
        expires_at = datetime.fromisoformat(game_session.get('expires_at', '2000-01-01'))
        if datetime.now() > expires_at:
            await ws_send_message({
                'success': False,
                'error': 'Session expirée'
            })
            return

        final_score = int(data.get('score', 0))
        coins_collected = int(data.get('coins_collected', 0))
        game_duration = float(data.get('game_duration', 0))

        # ── Validation anti-triche finale, avant tout calcul de gain ────
        is_valid, error_message = _validate_gameplay_data(
            game_session, final_score, coins_collected, game_duration, client_id
        )
        if not is_valid:
            await ws_send_message({
                'success': False,
                'error': 'Données de session incohérentes'
            })
            return

        objective_type = game_session.get('objective_type')
        objective_target = game_session.get('objective_target')
        objective_time_limit = game_session.get('objective_time_limit', 0)
        bet = game_session.get('bet', 0)
        bonus = game_session.get('bonus')

        # Vérifier l'objectif
        objective_completed = False
        progress_info = ""

        if objective_type == 'collect_coins':
            objective_completed = coins_collected >= objective_target
            progress_info = f"Pièces collectées: {coins_collected}/{objective_target}"

        elif objective_type == 'survive_time':
            objective_completed = game_duration >= objective_target
            progress_info = f"Temps survécu: {game_duration:.1f}s/{objective_target}s"

        elif objective_type == 'score_in_time':
            objective_completed = final_score >= objective_target and game_duration <= objective_time_limit
            progress_info = f"Score: {final_score}/{objective_target} en {game_duration:.1f}s (limite: {objective_time_limit}s)"

        elif objective_type == 'reach_score':
            objective_completed = final_score >= objective_target
            progress_info = f"Score: {final_score}/{objective_target}"

        else:
            await ws_send_message({
                'success': False,
                'error': "Type d'objectif inconnu"
            })
            return

        # Calculer les gains avec bonus éventuel : mise initiale x 2,
        # multipliée par le bonus si un multiplicateur est actif.
        win_amount = 0
        nouveau_solde = None
        base_multiplier = 2.0

        if objective_completed:
            if bonus and bonus['type'] == 'multiplier':
                multiplier = bonus['value']
            else:
                multiplier = 1.0

            win_amount = bet * base_multiplier * multiplier

            # Crédit atomique en base, sans SELECT préalable (évite toute
            # race condition entre deux crédits concurrents).
            nouveau_solde = await credit_player(user_id, win_amount)

        # Marquer la session comme terminée et validée (empêche tout
        # rejeu ultérieur de validate_dash_objective/update_dash_session)
        game_session['game_completed'] = True
        game_session['objective_completed'] = objective_completed
        game_session['score'] = final_score
        game_session['coins_collected'] = coins_collected
        game_session['game_duration'] = game_duration
        game_session['validated'] = True

        # Historique de la partie : le montant loggé correspond à la mise
        # en cas de défaite, ou au gain final crédité (mise x 2 x bonus)
        # en cas de victoire / objectif rempli.
        await log_game_result(
            user_id,
            has_won=objective_completed,
            amount=win_amount if objective_completed else bet,
            game_type="Dash Jump"
        )

        await ws_send_message({
            'success': True,
            'objective_completed': objective_completed,
            'progress_info': progress_info,
            'final_score': final_score,
            'coins_collected': coins_collected,
            'game_duration': game_duration,
            'win_amount': win_amount,
            'new_solde': nouveau_solde,
            'bonus_applied': bonus if objective_completed else None,
            'message': 'Objectif validé avec succès'
        })

    except Exception as e:
        await ws_send_message({
            'success': False,
            'error': str(e)
        })


async def ws_clear_session(client_id):
    """Nettoie la session de jeu via WebSocket."""
    try:
        if client_id in active_sessions:
            del active_sessions[client_id]

        await ws_send_message({
            'success': True,
            'message': 'Session de jeu nettoyée'
        })

    except Exception as e:
        await ws_send_message({
            'success': False,
            'error': str(e)
        })

# ====================================================================
# SYSTEME DU JEU W-RISK
# ====================================================================

# Enum des raisons de fin de partie valides
VALID_END_REASONS = {'collected', 'zero_gains', 'max_cells_revealed', 'abandoned'}

class w_risk_GameManager:
    def __init__(self):
        self.active_games = {}
        self.game_logs = []
        self.player_stats = {}
        # Tâche de nettoyage périodique
        self._cleanup_task = None

    async def start_cleanup_task(self):
        """Démarre la tâche de nettoyage périodique des parties zombies"""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())

    async def _cleanup_loop(self):
        """Boucle de nettoyage des parties zombies toutes les 5 minutes"""
        while True:
            try:
                await asyncio.sleep(300)  # 5 minutes
                await self.w_risk_cleanup_zombie_games()
            except Exception as e:
                print(f"Erreur lors du nettoyage des parties zombies: {e}")

    def w_risk_generate_game_id(self, user_id):
        game_id = f"{user_id}_{datetime.now().timestamp()}_{random.randint(1000, 9999)}"
        return game_id

    async def w_risk_start_game(self, user_id, bet_amount, cases_to_reveal):
        """Démarrer une nouvelle partie avec validation et décision IA préalable"""
        if not isinstance(bet_amount, int) or bet_amount < 100 or bet_amount > 1000:
            raise ValueError("Mise invalide (100-1000 XOF requis)")
        if not isinstance(cases_to_reveal, int) or cases_to_reveal < 3 or cases_to_reveal > 25:
            raise ValueError("Nombre de cases invalide (3-25 requis)")

        game_id = self.w_risk_generate_game_id(user_id)
        
        fate = await self._decide_fate(user_id, bet_amount, cases_to_reveal)
        pools = await self._generate_pools(bet_amount, cases_to_reveal, fate)

        self.active_games[game_id] = {
            'user_id': user_id,
            'bet_amount': bet_amount,
            'positive_pool': pools['positive'],
            'negative_pool': pools['negative'],
            'bonus_pool': pools['bonus'],
            'revealed_cells': {},
            'start_time': datetime.now(),
            'cases_to_reveal': cases_to_reveal,
            'total_gains': bet_amount,
            'fate': fate,
            'max_gains': fate['max_gains'],
            'max_loss': fate['max_loss'],
            'target_outcome': fate['target'],
            'ended': False,
            'collected': False,
            'credit_pending': False  # Flag: crédit DB en attente
        }

        await self.w_risk_log_game_action(game_id, 'start', {
            'bet_amount': bet_amount,
            'cases_to_reveal': cases_to_reveal,
            'fate': fate
        })

        return game_id

    async def _decide_fate(self, user_id, bet_amount, cases_to_reveal):
        """L'IA décide du sort du joueur pour cette partie"""
        
        stats = self.player_stats.get(user_id, {'games': 0, 'total_net': 0, 'last_net': 0})
        games_played = stats['games']
        last_result = stats['last_net']
        total_net = stats['total_net']
        
        win_probability = 0.3
        
        if games_played > 0:
            if last_result < 0:
                win_probability += 0.15
            else:
                win_probability -= 0.1
                
            if total_net < -bet_amount * 3:
                win_probability += 0.2
            elif total_net > bet_amount * 3:
                win_probability -= 0.15
        
        cases_factor = cases_to_reveal / 25
        win_probability += (0.5 - cases_factor) * 0.2
        
        bet_factor = min(bet_amount / 1000, 1.0)
        win_probability -= bet_factor * 0.1
        
        win_probability = max(0.1, min(0.7, win_probability))
        
        r = random.random()
        if r < win_probability:
            target = 'win'
        elif r < win_probability + 0.2:
            target = 'break_even'
        else:
            target = 'loss'
        
        if target == 'win':
            max_gain_percent = 0.2 + (cases_to_reveal / 25) * 0.6
            max_gains = int(bet_amount * (1 + max_gain_percent))
            max_loss = bet_amount
        elif target == 'break_even':
            max_gain_percent = 0.1 + random.random() * 0.1
            max_gains = int(bet_amount * (1 + max_gain_percent))
            max_loss = bet_amount
        else:
            max_loss_percent = 0.3 + (cases_to_reveal / 25) * 0.7
            max_gains = bet_amount
            max_loss = bet_amount
        
        return {
            'target': target,
            'max_gains': max_gains,
            'max_loss': max_loss,
            'win_probability': win_probability,
            'cases_to_reveal': cases_to_reveal
        }

    async def _generate_pools(self, bet_amount, cases_to_reveal, fate):
        """Générer les pools de valeurs en fonction du destin décidé"""
        
        total_cells = 25
        positive_count = 12
        negative_count = 12
        bonus_count = 1
        
        interval_min = (bet_amount * 25) // 100
        interval_max = bet_amount
        
        positive_pool = []
        negative_pool = []
        bonus_pool = []
        
        if fate['target'] == 'win':
            for i in range(positive_count):
                if i < 4:
                    value = random.randint(interval_max // 2, interval_max)
                else:
                    value = random.randint(interval_min, interval_max // 2)
                positive_pool.append(value)
            
            for i in range(negative_count):
                if i < 3:
                    value = -random.randint(interval_max // 2, interval_max)
                else:
                    value = -random.randint(interval_min, interval_max // 3)
                negative_pool.append(value)
                
        elif fate['target'] == 'loss':
            for i in range(positive_count):
                if i < 3:
                    value = random.randint(interval_min, interval_max // 2)
                else:
                    value = random.randint(interval_min // 2, interval_min)
                positive_pool.append(value)
            
            for i in range(negative_count):
                if i < 6:
                    value = -random.randint(interval_max // 2, interval_max)
                else:
                    value = -random.randint(interval_min, interval_max // 2)
                negative_pool.append(value)
                
        else:
            for i in range(positive_count):
                value = random.randint(interval_min, interval_max // 2)
                positive_pool.append(value)
            
            for i in range(negative_count):
                value = -random.randint(interval_min, interval_max // 2)
                negative_pool.append(value)
        
        if fate['target'] == 'win':
            bonus_pool.append(bet_amount * 3)
        elif fate['target'] == 'loss':
            bonus_pool.append(bet_amount * 2)
        else:
            bonus_pool.append(bet_amount * 2)
        
        random.shuffle(positive_pool)
        random.shuffle(negative_pool)
        random.shuffle(bonus_pool)
        
        return {
            'positive': positive_pool,
            'negative': negative_pool,
            'bonus': bonus_pool
        }

    async def _choose_pool(self, game, user_id):
        """Décide intelligemment quelle pool utiliser pour la prochaine révélation"""
        pos_left = len(game['positive_pool'])
        neg_left = len(game['negative_pool'])
        bonus_left = len(game['bonus_pool'])
        total_left = pos_left + neg_left + bonus_left
        if total_left == 0:
            return None

        fate = game['fate']
        target = fate['target']
        
        current_gains = game['total_gains']
        bet = game['bet_amount']
        gain_ratio = current_gains / bet
        revealed = len(game['revealed_cells'])
        cases_to_reveal = game['cases_to_reveal']
        
        pos_weight = pos_left
        neg_weight = neg_left
        bonus_weight = bonus_left * 0.5
        
        if target == 'win':
            if gain_ratio < 1.2:
                pos_weight *= 1.8
                neg_weight *= 0.6
            elif gain_ratio > fate['max_gains'] / bet:
                pos_weight *= 0.3
                neg_weight *= 1.5
                
        elif target == 'loss':
            if gain_ratio > 0.8:
                pos_weight *= 0.5
                neg_weight *= 1.8
            elif gain_ratio < 0.3:
                pos_weight *= 1.5
                neg_weight *= 0.5
                
        else:
            if gain_ratio > 1.1:
                pos_weight *= 0.6
                neg_weight *= 1.4
            elif gain_ratio < 0.9:
                pos_weight *= 1.4
                neg_weight *= 0.6
        
        progress = revealed / cases_to_reveal
        if progress > 0.7:
            if target == 'win':
                pos_weight *= 1.3
            elif target == 'loss':
                neg_weight *= 1.3
        
        if pos_left == 0:
            pos_weight = 0
        if neg_left == 0:
            neg_weight = 0
        if bonus_left == 0:
            bonus_weight = 0
        
        total_weight = pos_weight + neg_weight + bonus_weight
        if total_weight == 0:
            available = []
            if pos_left > 0:
                available.append('positive')
            if neg_left > 0:
                available.append('negative')
            if bonus_left > 0:
                available.append('bonus')
            return random.choice(available) if available else None
        
        r = random.random() * total_weight
        if r < pos_weight:
            return 'positive'
        elif r < pos_weight + neg_weight:
            return 'negative'
        else:
            return 'bonus'

    async def w_risk_reveal_cell(self, game_id, cell_index, user_id):
        """Révéler une cellule avec décision dynamique"""
        game = self.active_games.get(game_id)
        if not game:
            raise ValueError("Partie non trouvée")
        
        if game['user_id'] != user_id:
            raise ValueError("Cette partie ne vous appartient pas")
        
        if game.get('ended', False):
            raise ValueError("Cette partie est déjà terminée")
        
        if game.get('collected', False):
            raise ValueError("Cette partie a déjà été encaissée")
        
        if cell_index < 0 or cell_index >= 25:
            raise ValueError("Index de cellule invalide")
        
        if len(game['revealed_cells']) >= game['cases_to_reveal']:
            raise ValueError("Nombre maximum de cases déjà révélées")
        
        if cell_index in game['revealed_cells']:
            raise ValueError("Cellule déjà révélée")

        pool_choice = await self._choose_pool(game, game['user_id'])

        if pool_choice == 'positive':
            value = game['positive_pool'].pop()
        elif pool_choice == 'negative':
            value = game['negative_pool'].pop()
        else:
            value = game['bonus_pool'].pop()

        game['revealed_cells'][cell_index] = value
        current_gains = game['total_gains']
        new_gains = max(0, current_gains + value)
        game['total_gains'] = new_gains

        game_ended = False
        end_reason = None
        if new_gains <= 0:
            game_ended = True
            end_reason = "zero_gains"
            game['ended'] = True
        elif len(game['revealed_cells']) >= game['cases_to_reveal']:
            game_ended = True
            end_reason = "max_cells_revealed"
            game['ended'] = True

        await self.w_risk_log_game_action(game_id, 'reveal', {
            'cell_index': cell_index,
            'cell_value': value,
            'pool_used': pool_choice,
            'previous_gains': current_gains,
            'new_gains': new_gains
        })

        return {
            'cell_value': value,
            'new_gains': new_gains,
            'game_ended': game_ended,
            'end_reason': end_reason,
            'revealed_count': len(game['revealed_cells'])
        }

    async def w_risk_collect_gains(self, game_id, user_id):
        """Prépare l'encaissement sans supprimer la partie. Retourne le montant à créditer."""
        game = self.active_games.get(game_id)
        if not game:
            raise ValueError("Partie non trouvée")
        if game['user_id'] != user_id:
            raise ValueError("Cette partie ne vous appartient pas")
        
        if game.get('collected', False):
            raise ValueError("Cette partie a déjà été encaissée")
        
        if game.get('credit_pending', False):
            raise ValueError("Un crédit est déjà en cours pour cette partie")
        
        if game.get('ended', False) and game.get('end_reason') == 'zero_gains':
            raise ValueError("Cette partie est déjà terminée sans gains")
        
        # Marquer comme "crédit en attente" mais NE PAS supprimer la partie
        game['credit_pending'] = True
        final_gains = game['total_gains']
        
        return final_gains

    async def w_risk_confirm_collect(self, game_id, user_id):
        """Confirme l'encaissement après succès DB. Supprime la partie."""
        game = self.active_games.get(game_id)
        if not game:
            # Partie déjà nettoyée, c'est OK
            return True
        
        if game['user_id'] != user_id:
            raise ValueError("Cette partie ne vous appartient pas")
        
        # Marquer comme collecté et terminé
        game['collected'] = True
        game['ended'] = True
        game['credit_pending'] = False
        
        final_gains = game['total_gains']
        net = final_gains - game['bet_amount']
        
        # Mise à jour des stats
        if user_id not in self.player_stats:
            self.player_stats[user_id] = {'games': 0, 'total_net': 0, 'last_net': 0, 'sessions': []}
        
        stats = self.player_stats[user_id]
        stats['games'] += 1
        stats['total_net'] += net
        stats['last_net'] = net
        
        stats['sessions'].append({
            'bet': game['bet_amount'],
            'net': net,
            'cases': game['cases_to_reveal'],
            'fate': game['fate']['target']
        })
        if len(stats['sessions']) > 10:
            stats['sessions'] = stats['sessions'][-10:]
        
        await self.w_risk_log_game_action(game_id, 'collect', {
            'user_id': user_id,
            'bet_amount': game['bet_amount'],
            'final_gains': final_gains,
            'net_gains': net,
            'fate': game['fate']['target'],
            'revealed_count': len(game['revealed_cells'])
        })
        
        # Maintenant seulement, supprimer la partie
        self.active_games.pop(game_id, None)
        return True

    async def w_risk_cancel_collect(self, game_id, user_id):
        """Annule un encaissement en attente (en cas d'échec DB)"""
        game = self.active_games.get(game_id)
        if game and game['user_id'] == user_id:
            game['credit_pending'] = False
        return True

    async def w_risk_end_game(self, game_id, reason, user_id):
        """Prépare la fin de partie. Retourne le montant à créditer si nécessaire."""
        game = self.active_games.get(game_id)
        if not game:
            return None  # Partie déjà nettoyée
        
        if game['user_id'] != user_id:
            raise ValueError("Cette partie ne vous appartient pas")
        
        # Validation de la raison
        if reason not in VALID_END_REASONS:
            reason = 'abandoned'
        
        # Si déjà collecté, ne rien faire
        if game.get('collected', False):
            self.active_games.pop(game_id, None)
            return None
        
        if game.get('credit_pending', False):
            raise ValueError("Un crédit est déjà en cours pour cette partie")
        
        final_gains = game['total_gains']
        
        # Déterminer s'il faut créditer le joueur
        should_credit = False
        
        if reason == 'max_cells_revealed' and final_gains > 0:
            should_credit = True
        elif reason == 'collected':
            # Déjà traité par w_risk_collect_gains
            should_credit = False
        elif reason == 'abandoned' and final_gains > 0:
            # L'abandon avec gains positifs crédite quand même
            should_credit = True
        elif reason == 'zero_gains':
            should_credit = False
        
        # Marquer comme "crédit en attente" si nécessaire
        if should_credit:
            game['credit_pending'] = True
        
        return final_gains if should_credit else None

    async def w_risk_confirm_end(self, game_id, user_id):
        """Confirme la fin de partie après succès DB."""
        game = self.active_games.get(game_id)
        if not game:
            return True
        
        if game['user_id'] != user_id:
            raise ValueError("Cette partie ne vous appartient pas")
        
        final_gains = game['total_gains']
        net = final_gains - game['bet_amount']
        
        # Marquer comme terminé
        game['ended'] = True
        game['credit_pending'] = False
        
        if final_gains > 0 and not game.get('collected', False):
            game['collected'] = True
        
        # Mise à jour des stats
        if user_id not in self.player_stats:
            self.player_stats[user_id] = {'games': 0, 'total_net': 0, 'last_net': 0, 'sessions': []}
        
        stats = self.player_stats[user_id]
        stats['games'] += 1
        stats['total_net'] += net
        stats['last_net'] = net
        
        stats['sessions'].append({
            'bet': game['bet_amount'],
            'net': net,
            'cases': game['cases_to_reveal'],
            'fate': game['fate']['target']
        })
        if len(stats['sessions']) > 10:
            stats['sessions'] = stats['sessions'][-10:]
        
        await self.w_risk_log_game_action(game_id, 'end', {
            'user_id': user_id,
            'bet_amount': game['bet_amount'],
            'final_gains': final_gains,
            'net_gains': net,
            'fate': game['fate']['target'],
            'revealed_count': len(game['revealed_cells'])
        })
        
        # Maintenant seulement, supprimer la partie
        self.active_games.pop(game_id, None)
        return True

    async def w_risk_cancel_end(self, game_id, user_id):
        """Annule une fin de partie en attente (en cas d'échec DB)"""
        game = self.active_games.get(game_id)
        if game and game['user_id'] == user_id:
            game['credit_pending'] = False
            game['ended'] = False
        return True

    async def w_risk_cleanup_zombie_games(self):
        """Nettoie les parties zombies"""
        now = datetime.now()
        zombie_ids = []
        
        for game_id, game in self.active_games.items():
            # Partie terminée depuis plus de 10 minutes
            if game.get('ended', False) and not game.get('collected', False):
                if hasattr(game['start_time'], 'timestamp'):
                    age = (now - game['start_time']).total_seconds()
                    if age > 600:  # 10 minutes
                        zombie_ids.append(game_id)
            # Partie avec crédit en attente depuis plus de 5 minutes
            elif game.get('credit_pending', False):
                if hasattr(game['start_time'], 'timestamp'):
                    age = (now - game['start_time']).total_seconds()
                    if age > 300:  # 5 minutes
                        zombie_ids.append(game_id)
        
        for game_id in zombie_ids:
            self.active_games.pop(game_id, None)
        
        if zombie_ids:
            print(f"Nettoyage de {len(zombie_ids)} parties zombies")

    async def w_risk_log_game_action(self, game_id, action, data):
        """Logger les actions pour audit"""
        log_entry = {
            'game_id': game_id,
            'action': action,
            'data': data,
            'timestamp': datetime.now().isoformat(),
            'user_id': data.get('user_id') if action in ['end', 'collect'] else self.active_games.get(game_id, {}).get('user_id')
        }
        self.game_logs.append(log_entry)
        if len(self.game_logs) > 1000:
            self.game_logs = self.game_logs[-1000:]

# Instance globale du gestionnaire
w_risk_game_manager = w_risk_GameManager()

# Démarrage du nettoyage périodique
@app.before_serving
async def startup():
    await w_risk_game_manager.start_cleanup_task()

# Routes API
@app.route('/api/game/start', methods=['POST'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
@track_mise()
async def w_risk_api_start_game(wari_session):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401

        data = await request.get_json()
        bet_amount = data.get('bet_amount')
        cases_to_reveal = data.get('cases_to_reveal', 3)

        if not isinstance(bet_amount, int) or bet_amount < 100 or bet_amount > 1000:
            return jsonify({'error': 'Mise invalide (100-1000 XOF requis)'}), 400
        if not isinstance(cases_to_reveal, int) or cases_to_reveal < 3 or cases_to_reveal > 25:
            return jsonify({'error': 'Nombre de cases invalide (3-25 requis)'}), 400

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("BEGIN")
                try:
                    await cur.execute(
                        "SELECT solde FROM solde WHERE user_id = %s FOR UPDATE",
                        (user_id,)
                    )
                    result = await cur.fetchone()
                    if not result:
                        await cur.execute("ROLLBACK")
                        return jsonify({'error': 'Solde non trouvé'}), 404
                    
                    current_balance = result[0]
                    solde_avant = current_balance
                    
                    if current_balance < bet_amount:
                        await cur.execute("ROLLBACK")
                        return jsonify({'error': 'Fonds insuffisants'}), 400
                    
                    await cur.execute(
                        "UPDATE solde SET solde = solde - %s WHERE user_id = %s",
                        (bet_amount, user_id)
                    )
                    
                    new_balance = current_balance - bet_amount
                    solde_apres = new_balance
                    
                    await cur.execute(
                        "SELECT name FROM users WHERE id = %s LIMIT 1",
                        (user_id,)
                    )
                    user_row = await cur.fetchone()
                    user_name = user_row[0] if user_row else f"Utilisateur #{user_id}"
                    
                    now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                    
                    description = (
                        f"Le joueur {user_name} (ID {user_id}) "
                        f"a misé {bet_amount} XOF le {now_str} "
                        f"pour une partie avec {cases_to_reveal} cases à révéler. "
                        f"Son solde avant la mise était {solde_avant} XOF "
                        f"et son nouveau solde est de {solde_apres} XOF."
                    )
                    
                    await cur.execute(
                        """
                        INSERT INTO bets_history
                        (user_id, mise, solde_avant, solde_apres, description, created_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        """,
                        (user_id, bet_amount, solde_avant, solde_apres, description)
                    )
                    
                    await cur.execute("COMMIT")
                except Exception as e:
                    await cur.execute("ROLLBACK")
                    raise e

        game_id = await w_risk_game_manager.w_risk_start_game(user_id, bet_amount, cases_to_reveal)

        return jsonify({
            'game_id': game_id,
            'new_balance': new_balance,
            'initial_gains': bet_amount
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/game/reveal', methods=['POST'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def w_risk_api_reveal_cell(wari_session):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401

        data = await request.get_json()
        game_id = data.get('game_id')
        cell_index = data.get('cell_index')

        if not game_id or cell_index is None:
            return jsonify({'error': 'Données manquantes'}), 400

        result = await w_risk_game_manager.w_risk_reveal_cell(game_id, cell_index, user_id)
        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/game/collect', methods=['POST'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def w_risk_api_collect_gains(wari_session):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401

        data = await request.get_json()
        game_id = data.get('game_id')

        if not game_id:
            return jsonify({'error': 'Partie non spécifiée'}), 400

        # Étape 1: Préparer l'encaissement (sans supprimer la partie)
        collected_amount = await w_risk_game_manager.w_risk_collect_gains(game_id, user_id)

        # Étape 2: Créditer en base
        try:
            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("BEGIN")
                    try:
                        await cur.execute(
                            "SELECT solde FROM solde WHERE user_id = %s FOR UPDATE",
                            (user_id,)
                        )
                        result = await cur.fetchone()
                        if not result:
                            await cur.execute("ROLLBACK")
                            await w_risk_game_manager.w_risk_cancel_collect(game_id, user_id)
                            return jsonify({'error': 'Solde non trouvé'}), 404
                        
                        await cur.execute(
                            "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                            (collected_amount, user_id)
                        )
                        
                        new_balance = result[0] + collected_amount
                        
                        now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                        await cur.execute(
                            "SELECT name FROM users WHERE id = %s LIMIT 1",
                            (user_id,)
                        )
                        user_row = await cur.fetchone()
                        user_name = user_row[0] if user_row else f"Utilisateur #{user_id}"
                        
                        description = (
                            f"Le joueur {user_name} (ID {user_id}) "
                            f"a encaissé {collected_amount} XOF le {now_str}. "
                            f"Son solde avant l'encaissement était {result[0]} XOF "
                            f"et son nouveau solde est de {new_balance} XOF."
                        )
                        
                        await cur.execute(
                            """
                            INSERT INTO bets_history
                            (user_id, mise, solde_avant, solde_apres, description, created_at)
                            VALUES (%s, %s, %s, %s, %s, NOW())
                            """,
                            (user_id, 0, result[0], new_balance, description)
                        )
                        
                        await cur.execute("COMMIT")
                        
                        # Étape 3: Confirmer l'encaissement (supprime la partie)
                        await w_risk_game_manager.w_risk_confirm_collect(game_id, user_id)
                        
                    except Exception as e:
                        await cur.execute("ROLLBACK")
                        raise e
        except Exception:
            # En cas d'échec DB, annuler l'encaissement
            await w_risk_game_manager.w_risk_cancel_collect(game_id, user_id)
            raise

        return jsonify({
            'new_balance': new_balance,
            'collected_amount': collected_amount
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/game/end', methods=['POST'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def w_risk_api_end_game(wari_session):
    try:
        user_id = session.get('user_id')
        data = await request.get_json()
        game_id = data.get('game_id')
        reason = data.get('reason', 'unknown')

        if not game_id:
            return jsonify({'error': 'Partie non spécifiée'}), 400

        # Étape 1: Préparer la fin de partie
        credited_amount = await w_risk_game_manager.w_risk_end_game(game_id, reason, user_id)
        
        # Étape 2: Créditer si nécessaire
        if credited_amount is not None and credited_amount > 0:
            try:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute("BEGIN")
                        try:
                            await cur.execute(
                                "SELECT solde FROM solde WHERE user_id = %s FOR UPDATE",
                                (user_id,)
                            )
                            result = await cur.fetchone()
                            if result:
                                await cur.execute(
                                    "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                                    (credited_amount, user_id)
                                )
                            await cur.execute("COMMIT")
                            
                            # Étape 3: Confirmer la fin de partie
                            await w_risk_game_manager.w_risk_confirm_end(game_id, user_id)
                            
                        except Exception as e:
                            await cur.execute("ROLLBACK")
                            raise e
            except Exception:
                # En cas d'échec DB, annuler la fin de partie
                await w_risk_game_manager.w_risk_cancel_end(game_id, user_id)
                raise
        else:
            # Pas de crédit à faire, confirmer directement
            await w_risk_game_manager.w_risk_confirm_end(game_id, user_id)

        return jsonify({'success': True})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400



# ====================================================================
# SYSTEME DU JEU FLAPPY JUMP
# ====================================================================

"""
Moteur du jeu Flappy Bird - logique pure, sans pygame.
Fait autorite sur la physique, les collisions et le score.
Le client (pygame/pygbag) ne fait QUE afficher l'etat recu et envoyer les taps.
"""

import random
import time


# --- Constantes (identiques a la version pygame originale) ---
GAME_WIDTH = 360
GAME_HEIGHT = 640

BIRD_WIDTH = 34
BIRD_HEIGHT = 24
BIRD_X = GAME_WIDTH / 8  # position X fixe, comme dans la version pygame

PIPE_WIDTH = 64
PIPE_HEIGHT = 512
PIPE_GAP = GAME_HEIGHT // 4          # 160
PIPE_INTERVAL_MS = 1500              # ms entre deux paires de tuyaux

VELOCITY_X = -2                      # vitesse horizontale des tuyaux (par tick)
GRAVITY = 0.4                        # gravite (par tick)
TAP_VELOCITY = -6                    # impulsion du saut

TICK_RATE = 60                       # Hz, boucle serveur (correspond a clock.tick(60))
TICK_DT_MS = 1000 / TICK_RATE


def rects_collide(ax, ay, aw, ah, bx, by, bw, bh):
    """Test de collision AABB simple (equivalent a pygame.Rect.colliderect)."""
    return ax < bx + bw and ax + aw > bx and ay < by + bh and ay + ah > by


class Pipe:
    __slots__ = ("x", "y", "kind", "passed")

    def __init__(self, x, y, kind):
        self.x = x
        self.y = y
        self.kind = kind  # "top" ou "bottom" (info utile pour l'affichage client)
        self.passed = False

    def to_dict(self):
        return {"x": round(self.x, 2), "y": round(self.y, 2), "kind": self.kind}


class FlappyGame:
    """
    Une instance = une partie en cours pour un joueur.
    Le serveur appelle update() a chaque tick ; le client ne fait qu'afficher get_state().
    """

    def __init__(self, seed: int | None = None):
        # RNG dediee a la partie : permet de fixer une seed si besoin (ex: replay, anti-triche verifiable)
        self.rng = random.Random(seed)
        self.reset()

    def reset(self):
        self.bird_y = GAME_HEIGHT / 2
        self.velocity_y = 0.0
        self.pipes: list[Pipe] = []
        self.score = 0.0
        self.game_over = False
        self.pipe_timer_ms = 0.0
        self.play_time_s = 0.0
        self.tick_count = 0
        # Hook pour brancher un payout plus tard (voir end_game)
        self._ended_handled = False

    # ------------------------------------------------------------------
    # Entrees joueur
    # ------------------------------------------------------------------
    def handle_tap(self):
        """Appele quand le serveur recoit un message {"action": "tap"} du client."""
        if self.game_over:
            self.reset()
        else:
            self.velocity_y = TAP_VELOCITY

    # ------------------------------------------------------------------
    # Boucle de simulation (appelee a TICK_RATE Hz par le serveur)
    # ------------------------------------------------------------------
    def _spawn_pipes(self):
        top_y = -PIPE_HEIGHT // 4 - self.rng.random() * (PIPE_HEIGHT // 2)
        bottom_y = top_y + PIPE_HEIGHT + PIPE_GAP
        self.pipes.append(Pipe(GAME_WIDTH, top_y, "top"))
        self.pipes.append(Pipe(GAME_WIDTH, bottom_y, "bottom"))

    def update(self, dt_ms: float = TICK_DT_MS):
        self.tick_count += 1

        if self.game_over:
            return

        dt_s = dt_ms / 1000.0
        self.play_time_s += dt_s

        # Spawn des tuyaux
        self.pipe_timer_ms += dt_ms
        if self.pipe_timer_ms >= PIPE_INTERVAL_MS:
            self._spawn_pipes()
            self.pipe_timer_ms = 0.0

        # Physique de l'oiseau
        self.velocity_y += GRAVITY
        self.bird_y += self.velocity_y
        self.bird_y = max(self.bird_y, 0)

        if self.bird_y > GAME_HEIGHT:
            self._trigger_game_over()
            return

        # Deplacement des tuyaux + collisions + score
        remaining = []
        for pipe in self.pipes:
            pipe.x += VELOCITY_X

            if not pipe.passed and BIRD_X > pipe.x + PIPE_WIDTH:
                self.score += 0.5
                pipe.passed = True

            if rects_collide(
                BIRD_X, self.bird_y, BIRD_WIDTH, BIRD_HEIGHT,
                pipe.x, pipe.y, PIPE_WIDTH, PIPE_HEIGHT,
            ):
                self._trigger_game_over()
                return

            if pipe.x + PIPE_WIDTH >= -10:
                remaining.append(pipe)

        self.pipes = remaining

    def _trigger_game_over(self):
        self.game_over = True
        # Point d'entree unique pour brancher plus tard la logique de mise/payout
        # sans toucher au reste du moteur (cf. pattern Lettricide).
        self.end_game()

    def end_game(self):
        """
        Hook appele une seule fois quand la partie se termine.
        TODO (quand la mise sera decidee) : calculer le payout ici a partir
        de self.score, ecrire en base, notifier le client via un message dedie.
        """
        if self._ended_handled:
            return
        self._ended_handled = True
        # Pour l'instant : rien. Le score final est deja dans get_state().

    # ------------------------------------------------------------------
    # Serialisation pour le client
    # ------------------------------------------------------------------
    def get_state(self) -> dict:
        return {
            "type": "state",
            "tick": self.tick_count,
            "bird_y": round(self.bird_y, 2),
            "velocity_y": round(self.velocity_y, 2),
            "pipes": [p.to_dict() for p in self.pipes],
            "score": self.score,
            "game_over": self.game_over,
            "play_time": round(self.play_time_s, 2),
        }


SERVER_SECRETS = b"53ba2392e7e9f0e1b68570f262c55390fb88b7ac9647b4eeed303b3896b7cc25"

def sign_objective(seed: int, nonce: str, obj_type: str, target: float) -> str:
    payload = f"{seed}:{nonce}:{obj_type}:{target:.2f}".encode()
    return hmac.new(SERVER_SECRETS, payload, hashlib.sha256).hexdigest()[:16]


def verify_objective_signature(seed: int, nonce: str, obj_type: str, target: float, signature: str) -> bool:
    return hmac.compare_digest(sign_objective(seed, nonce, obj_type, target), signature)


def generate_nonce() -> str:
    return f"{random.randint(0, 2**63 - 1)}:{time.time():.6f}"


def generate_objective() -> tuple[str, float]:
    """Génère un objectif aléatoire : score ou temps."""
    if random.random() < 0.5:
        # Objectif de score : entre 5 et 30 points
        return "score", float(random.randint(5, 30))
    else:
        # Objectif de temps : entre 10 et 60 secondes
        return "time", float(random.randint(10, 60))


@app.websocket("/ws/flappy")
async def flappy_ws():
    ws_id = id(websocket)
    print(f"[SERVER] === CONNEXION #{ws_id} ===")

    # === AUTHENTIFICATION ===
    print(f"[SERVER] #{ws_id} → authentification en cours...")
    user_id = await authenticate_websocket()
    print(f"[SERVER] #{ws_id} → authenticate_websocket() a retourné: {user_id!r}")

    if user_id is None:
        print(f"[SERVER] #{ws_id} → AUTH ÉCHOUÉE, fermeture de la connexion")
        await websocket.send(json.dumps({
            "type": "error",
            "message": "Utilisateur non connecté"
        }))
        return

    user = {"user_id": user_id}
    print(f"[SERVER] #{ws_id} → AUTH OK, user={user}")

    try:
        while True:
            # === NOUVELLE PARTIE ===
            seed = random.randint(0, 2**31 - 1)
            nonce = generate_nonce()
            print(f"[SERVER] #{ws_id} → nouveau tour: seed={seed}, nonce={nonce}")

            # Génération de l'objectif
            obj_type, target = generate_objective()
            obj_signature = sign_objective(seed, nonce, obj_type, target)
            print(f"[SERVER] #{ws_id} → objectif généré: type={obj_type}, target={target}, signature={obj_signature}")

            print(f"[SERVER] #{ws_id} Partie — seed={seed}, objectif={obj_type}:{target}")

            # Envoi init avec objectif
            init_payload = {
                "type": "init",
                "seed": seed,
                "nonce": nonce,
                "objective": {
                    "type": obj_type,
                    "target": target,
                    "signature": obj_signature,
                }
            }
            print(f"[SERVER] #{ws_id} → envoi init: {init_payload}")
            await websocket.send(json.dumps(init_payload))

            game_ended = False

            while not game_ended:
                print(f"[SERVER] #{ws_id} → en attente d'un message (timeout 30s)...")
                try:
                    raw = await asyncio.wait_for(websocket.receive(), timeout=30.0)
                    print(f"[SERVER] #{ws_id} → message brut reçu: {raw!r}")
                except asyncio.TimeoutError:
                    print(f"[SERVER] #{ws_id} → TIMEOUT (30s) en attente de message — fermeture")
                    return

                try:
                    msg = json.loads(raw)
                except json.JSONDecodeError as e:
                    print(f"[SERVER] #{ws_id} → JSON invalide, message ignoré: {e}")
                    continue

                msg_type = msg.get("type")
                print(f"[SERVER] #{ws_id} → msg_type='{msg_type}', contenu={msg}")

                if msg_type == "tap":
                    print(f"[SERVER] #{ws_id} → tap reçu (tick={msg.get('tick')}), ignoré côté serveur (temps réel)")

                elif msg_type == "submit":
                    print(f"[SERVER] #{ws_id} SUBMIT reçu")

                    claimed_score = msg.get("claimed_score", 0)
                    replay = msg.get("replay", [])
                    play_time = msg.get("play_time", 0)
                    client_nonce = msg.get("nonce")
                    client_obj_signature = msg.get("objective_signature")
                    client_obj_type = msg.get("objective_type")
                    client_obj_target = msg.get("objective_target")

                    print(f"[SERVER] #{ws_id} → claimed_score={claimed_score}, play_time={play_time}, "
                          f"replay_len={len(replay)}, client_nonce={client_nonce}")
                    print(f"[SERVER] #{ws_id} → client_obj_type={client_obj_type}, client_obj_target={client_obj_target}, "
                          f"client_obj_signature={client_obj_signature}")

                    sig_valid = verify_objective_signature(
                        seed, nonce, client_obj_type, client_obj_target, client_obj_signature
                    )
                    print(f"[SERVER] #{ws_id} → signature objectif valide? {sig_valid}")

                    if not sig_valid:
                        print(f"[SERVER] #{ws_id} ERREUR: signature objectif invalide!")
                        await websocket.send(json.dumps({
                            "type": "result",
                            "error": "INVALID_OBJECTIVE_SIGNATURE",
                            "objective_achieved": False,
                            "payout": 0,
                        }))
                        game_ended = True
                        continue

                    print(f"[SERVER] #{ws_id} → rejeu du replay ({len(replay)} actions) pour vérification...")
                    verified = FlappyGame(seed=seed)
                    for tick, action in replay:
                        if action == "tap":
                            while verified.tick_count < tick and not verified.game_over:
                                verified.update(TICK_DT_MS)
                            if not verified.game_over:
                                verified.handle_tap()

                    while not verified.game_over:
                        verified.update(TICK_DT_MS)

                    verified_score = verified.score
                    score_match = abs(verified_score - claimed_score) < 1.0
                    print(f"[SERVER] #{ws_id} → verified_score={verified_score}, claimed_score={claimed_score}, "
                          f"score_match={score_match}")

                    objective_achieved = False
                    if obj_type == "score":
                        objective_achieved = verified_score >= target
                        print(f"[SERVER] #{ws_id} Objectif score: {verified_score}/{target} → {objective_achieved}")
                    elif obj_type == "time":
                        objective_achieved = play_time >= target
                        print(f"[SERVER] #{ws_id} Objectif temps: {play_time:.1f}s/{target}s → {objective_achieved}")

                    payout = 0.0
                    if score_match and objective_achieved:
                        payout = target * 2.0
                        print(f"[SERVER] #{ws_id} PAYOUT: {payout}")
                    else:
                        print(f"[SERVER] #{ws_id} Pas de payout (score_match={score_match}, obj_achieved={objective_achieved})")

                    result_payload = {
                        "type": "result",
                        "verified_score": verified_score,
                        "claimed_score": claimed_score,
                        "score_match": score_match,
                        "objective": {
                            "type": obj_type,
                            "target": target,
                            "achieved": objective_achieved,
                        },
                        "play_time": play_time,
                        "payout": payout,
                    }
                    print(f"[SERVER] #{ws_id} → envoi result: {result_payload}")
                    await websocket.send(json.dumps(result_payload))
                    game_ended = True

                elif msg_type == "new_game":
                    print(f"[SERVER] #{ws_id} new_game reçu en cours de partie — break")
                    break

                else:
                    print(f"[SERVER] #{ws_id} → msg_type inconnu/non géré: '{msg_type}'")

            print(f"[SERVER] #{ws_id} Attente new_game (timeout 60s)...")
            try:
                raw = await asyncio.wait_for(websocket.receive(), timeout=60.0)
                print(f"[SERVER] #{ws_id} → message reçu en attente de new_game: {raw!r}")
                msg = json.loads(raw)
                if msg.get("type") == "new_game":
                    print(f"[SERVER] #{ws_id} new_game reçu — prochaine partie")
                    continue
                else:
                    print(f"[SERVER] #{ws_id} → message inattendu (type={msg.get('type')}), ignoré")
            except asyncio.TimeoutError:
                print(f"[SERVER] #{ws_id} → TIMEOUT (60s) en attente de new_game — fermeture")
                return
            except json.JSONDecodeError as e:
                print(f"[SERVER] #{ws_id} → JSON invalide en attente de new_game: {e} — fermeture")
                return

    except Exception as e:
        print(f"[SERVER] #{ws_id} EXCEPTION: {type(e).__name__}: {e}")
    finally:
        print(f"[SERVER] === CONNEXION #{ws_id} FERMÉE ===")


















"""
game_engine.py
──────────────────────────────────────────────────────────────────────────
Moteur de jeu AUTORITAIRE pour Dino Run.

Tout ce qui compte pour la triche (position du dino, obstacles, collisions,
score, vitesse) est calculé ICI, côté serveur. Le client n'envoie que des
INTENTIONS ("je saute", "pause", "start") et ne reçoit que de l'ÉTAT en
lecture seule. Le client ne peut donc plus jamais s'auto-attribuer un score.

Le repère logique est fixe (indépendant de la taille d'écran du client) :
le frontend n'a qu'à mapper GAME_WIDTH x GAME_HEIGHT sur son propre canvas.
"""

import random
import time
from dataclasses import dataclass, field
from typing import Optional

# ──────────────────────────────────────────────────────────────────────
# CONSTANTES (miroir exact des constantes du frontend React)
# ──────────────────────────────────────────────────────────────────────

GAME_WIDTH = 1280
GAME_HEIGHT = 720
GROUND_Y = GAME_HEIGHT * 0.7  # 504

DINO_WIDTH = 80
DINO_HEIGHT = 80
DINO_X = 50  # le dino ne bouge jamais horizontalement

CACTUS_WIDTH = 30
CACTUS_HEIGHT = 50

PTERO_WIDTH = 80
PTERO_HEIGHT = 40

INITIAL_GAME_SPEED = 5.0
SPEED_INCREMENT = 0.3
SPEED_STEP_SCORE = 10  # tous les 10 points -> vitesse += SPEED_INCREMENT

INITIAL_CACTUS_INTERVAL_MS = 2000
MIN_CACTUS_INTERVAL_MS = 800

INITIAL_PTERO_INTERVAL_MS = 5000
MIN_PTERO_INTERVAL_MS = 2000
PTERO_MIN_SCORE = 20  # les ptérodactyles n'apparaissent qu'après 20 points

JUMP_GRAVITY = 0.5
JUMP_POWER = 15.0
JUMP_POWER_MAX = 18.0

COLLISION_MARGIN = 5

TICK_HZ = 60
TICK_DT_S = 1.0 / TICK_HZ

# Un "pas" logique par tick, pour que le mouvement horizontal soit
# indépendant du framerate réel du serveur (fixed timestep).
# À TICK_HZ=60 cela reproduit fidèlement le rythme du jeu original
# (qui bougeait les objets de `speed` px par frame ~60fps).


@dataclass
class Dino:
    y: float = GROUND_Y - DINO_HEIGHT
    is_jumping: bool = False
    jump_velocity: float = 0.0
    jump_power: float = JUMP_POWER

    def to_dict(self) -> dict:
        return {"x": DINO_X, "y": self.y, "isJumping": self.is_jumping}


@dataclass
class Obstacle:
    x: float
    y: float
    width: float
    height: float
    speed: float = 0.0  # utilisé seulement par les ptéros (vitesse propre)

    def to_dict(self) -> dict:
        return {"x": self.x, "y": self.y, "width": self.width, "height": self.height}


@dataclass
class GameEngine:
    """Une instance = une partie pour un joueur connecté."""

    high_score: int = 0

    # État interne, jamais exposé tel quel au client
    dino: Dino = field(default_factory=Dino)
    cacti: list[Obstacle] = field(default_factory=list)
    pteros: list[Obstacle] = field(default_factory=list)

    score: int = 0
    game_speed: float = INITIAL_GAME_SPEED
    cactus_interval_ms: float = INITIAL_CACTUS_INTERVAL_MS
    ptero_interval_ms: float = INITIAL_PTERO_INTERVAL_MS

    started: bool = False
    paused: bool = False
    game_over: bool = False

    _elapsed_ms: float = 0.0
    _last_cactus_ms: float = 0.0
    _last_ptero_ms: float = 0.0

    # ── Cycle de vie ────────────────────────────────────────────────
    def start(self) -> None:
        """Démarre une toute nouvelle partie (reset complet)."""
        self.dino = Dino()
        self.cacti = []
        self.pteros = []
        self.score = 0
        self.game_speed = INITIAL_GAME_SPEED
        self.cactus_interval_ms = INITIAL_CACTUS_INTERVAL_MS
        self.ptero_interval_ms = INITIAL_PTERO_INTERVAL_MS
        self.started = True
        self.paused = False
        self.game_over = False
        self._elapsed_ms = 0.0
        self._last_cactus_ms = 0.0
        self._last_ptero_ms = 0.0

    def restart(self) -> None:
        self.start()

    def toggle_pause(self) -> None:
        if self.started and not self.game_over:
            self.paused = not self.paused

    def jump(self) -> None:
        d = self.dino
        if self.started and not self.paused and not self.game_over and not d.is_jumping:
            d.is_jumping = True
            d.jump_velocity = -d.jump_power

    # ── Boucle physique (appelée à TICK_HZ) ────────────────────────
    def tick(self, dt_ms: float) -> dict:
        """Avance la simulation de dt_ms millisecondes et renvoie l'état
        public à diffuser au client. C'est la SEULE source de vérité."""
        if self.started and not self.paused and not self.game_over:
            self._elapsed_ms += dt_ms

            self._update_dino()
            self._spawn_and_move_cacti()
            self._spawn_and_move_pteros()

            if self._check_collisions():
                self.game_over = True
                if self.score > self.high_score:
                    self.high_score = self.score

        return self._public_state()

    # ── Dino ─────────────────────────────────────────────────────
    def _update_dino(self) -> None:
        d = self.dino
        if d.is_jumping:
            d.y += d.jump_velocity
            d.jump_velocity += JUMP_GRAVITY
            floor = GROUND_Y - DINO_HEIGHT
            if d.y >= floor:
                d.y = floor
                d.is_jumping = False
                d.jump_velocity = 0.0

    # ── Cactus ───────────────────────────────────────────────────
    def _spawn_and_move_cacti(self) -> None:
        if self._elapsed_ms - self._last_cactus_ms > self.cactus_interval_ms:
            self.cactus_interval_ms = max(
                MIN_CACTUS_INTERVAL_MS, 2000 - self.score * 20
            )
            group_size = (
                random.randint(1, 3) if random.random() < 0.2 and self.score > 30 else 1
            )
            for i in range(group_size):
                self.cacti.append(
                    Obstacle(
                        x=GAME_WIDTH + i * 40,
                        y=GROUND_Y - CACTUS_HEIGHT,
                        width=CACTUS_WIDTH,
                        height=CACTUS_HEIGHT,
                    )
                )
            self._last_cactus_ms = self._elapsed_ms

        still_alive: list[Obstacle] = []
        for cactus in self.cacti:
            cactus.x -= self.game_speed
            if cactus.x + cactus.width < 0:
                # le cactus est sorti de l'écran -> +1 point (calculé serveur)
                self.score += 1
                if self.score % SPEED_STEP_SCORE == 0:
                    self.game_speed += SPEED_INCREMENT
                    self.dino.jump_power = min(
                        JUMP_POWER_MAX, JUMP_POWER + self.score / 50
                    )
            else:
                still_alive.append(cactus)
        self.cacti = still_alive

    # ── Ptérodactyles ────────────────────────────────────────────
    def _spawn_and_move_pteros(self) -> None:
        if (
            self._elapsed_ms - self._last_ptero_ms > self.ptero_interval_ms
            and self.score > PTERO_MIN_SCORE
        ):
            altitude = GROUND_Y - 80 - random.random() * 100
            self.pteros.append(
                Obstacle(
                    x=GAME_WIDTH,
                    y=altitude,
                    width=PTERO_WIDTH,
                    height=PTERO_HEIGHT,
                    speed=self.game_speed + 1 + random.random() * 2,
                )
            )
            self.ptero_interval_ms = max(
                MIN_PTERO_INTERVAL_MS, 5000 - self.score * 30
            )
            self._last_ptero_ms = self._elapsed_ms

        still_alive: list[Obstacle] = []
        for ptero in self.pteros:
            ptero.x -= ptero.speed
            if ptero.x + ptero.width >= 0:
                still_alive.append(ptero)
        self.pteros = still_alive

    # ── Collisions (AABB avec marge, identique au frontend) ────────
    def _check_collisions(self) -> bool:
        d = self.dino
        dx0, dx1 = DINO_X + COLLISION_MARGIN, DINO_X + DINO_WIDTH - COLLISION_MARGIN
        dy0, dy1 = d.y + COLLISION_MARGIN, d.y + DINO_HEIGHT - COLLISION_MARGIN

        for obstacle in (*self.cacti, *self.pteros):
            ox0 = obstacle.x + COLLISION_MARGIN
            ox1 = obstacle.x + obstacle.width - COLLISION_MARGIN
            oy0 = obstacle.y + COLLISION_MARGIN
            oy1 = obstacle.y + obstacle.height - COLLISION_MARGIN
            if dx0 < ox1 and dx1 > ox0 and dy0 < oy1 and dy1 > oy0:
                return True
        return False

    # ── Sérialisation pour le client ─────────────────────────────
    def _public_state(self) -> dict:
        return {
            "type": "state",
            "started": self.started,
            "paused": self.paused,
            "gameOver": self.game_over,
            "score": self.score,
            "highScore": self.high_score,
            "speed": round(self.game_speed, 2),
            "dino": self.dino.to_dict(),
            "cacti": [c.to_dict() for c in self.cacti],
            "pteros": [p.to_dict() for p in self.pteros],
        }

    def config(self) -> dict:
        """Envoyé une fois à la connexion : dimensions logiques du terrain,
        pour que le client puisse mettre à l'échelle son rendu."""
        return {
            "type": "config",
            "gameWidth": GAME_WIDTH,
            "gameHeight": GAME_HEIGHT,
            "groundY": GROUND_Y,
            "dinoWidth": DINO_WIDTH,
            "dinoHeight": DINO_HEIGHT,
            "cactusWidth": CACTUS_WIDTH,
            "cactusHeight": CACTUS_HEIGHT,
            "pteroWidth": PTERO_WIDTH,
            "pteroHeight": PTERO_HEIGHT,
            "tickHz": TICK_HZ,
            "highScore": self.high_score,
        }



"""
app.py — Serveur backend Dino Run (anti-triche)
──────────────────────────────────────────────────────────────────────────
Stack : Quart (async, API ~Flask) + WebSocket natif Quart.

Principe :
  - Le client N'ENVOIE QUE des intentions : start / jump / pause / restart.
  - Le serveur fait tourner le GameEngine (physique, spawn, collisions,
    score) dans une boucle à pas de temps fixe (60 Hz) et diffuse l'état
    au client à chaque tick.
  - Le client se contente d'AFFICHER l'état reçu. Il ne calcule plus rien
    de ce qui touche au score -> impossible de tricher côté client.

Lancer en dev :
    pip install quart hypercorn
    python app.py            # écoute sur 0.0.0.0:8000

Lancer en prod (exemple) :
    hypercorn app:app -b 0.0.0.0:8000 -w 4
"""

import asyncio
import json
import logging
import uuid
from dataclasses import asdict


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dino-backend")

# ──────────────────────────────────────────────────────────────────────
# Persistance minimale du meilleur score (en mémoire).
# À remplacer par Redis / PostgreSQL / etc. en production, gardez juste
# la même interface (get_high_score / set_high_score) pour ne rien casser.
# ──────────────────────────────────────────────────────────────────────

_high_scores: dict[str, int] = {}


def get_high_score(player_id: str) -> int:
    return _high_scores.get(player_id, 0)


def set_high_score(player_id: str, value: int) -> None:
    _high_scores[player_id] = value


# ──────────────────────────────────────────────────────────────────────
# Endpoint HTTP simple de santé (utile pour un load balancer / uptime check)
# ──────────────────────────────────────────────────────────────────────

@app.route("/health")
async def health():
    return {"status": "ok"}


# ──────────────────────────────────────────────────────────────────────
# WebSocket de jeu
# ──────────────────────────────────────────────────────────────────────
#
# Protocole (JSON) :
#
#   Client -> Serveur
#     {"action": "start"}                    démarre une nouvelle partie
#     {"action": "jump"}                     fait sauter le dino
#     {"action": "pause"}                    bascule pause / reprise
#     {"action": "restart"}                  relance une partie (= start)
#     {"action": "identify", "playerId": ..} (optionnel) rattache un
#                                             joueur pour persister son
#                                             meilleur score entre parties
#
#   Serveur -> Client
#     {"type": "config", ...}                envoyé une seule fois à la connexion
#     {"type": "state", ...}                 diffusé à ~60 Hz pendant la partie
#     {"type": "game_over", "score", "highScore", "isNewHighScore"}
#     {"type": "error", "message": ...}
#
# ──────────────────────────────────────────────────────────────────────

@app.websocket("/ws/dino")
async def ws_dino():
    connection_id = str(uuid.uuid4())
    player_id = connection_id  # remplacé si le client envoie "identify"
    engine = GameEngine(high_score=get_high_score(player_id))

    logger.info("Nouvelle connexion %s", connection_id)
    await websocket.send(json.dumps(engine.config()))

    # `was_game_over` permet de détecter la TRANSITION vers game-over pour
    # n'émettre qu'UNE fois l'événement "game_over" (et persister le score),
    # plutôt qu'à chaque tick tant que gameOver reste vrai.
    was_game_over = False

    async def receiver():
        nonlocal player_id
        while True:
            raw = await websocket.receive()
            try:
                msg = json.loads(raw)
            except (TypeError, ValueError):
                await websocket.send(json.dumps({"type": "error", "message": "JSON invalide"}))
                continue

            action = msg.get("action")

            if action == "identify":
                new_id = str(msg.get("playerId") or "").strip()
                if new_id:
                    player_id = new_id
                    engine.high_score = max(engine.high_score, get_high_score(player_id))
                    await websocket.send(json.dumps(engine.config()))

            elif action == "start":
                engine.start()

            elif action == "jump":
                engine.jump()

            elif action == "pause":
                engine.toggle_pause()

            elif action == "restart":
                engine.restart()

            else:
                await websocket.send(
                    json.dumps({"type": "error", "message": f"Action inconnue: {action}"})
                )

    async def sender():
        nonlocal was_game_over
        loop = asyncio.get_event_loop()
        next_tick = loop.time()
        while True:
            next_tick += TICK_DT_S
            state = engine.tick(dt_ms=TICK_DT_S * 1000)
            await websocket.send(json.dumps(state))

            if state["gameOver"] and not was_game_over:
                was_game_over = True
                is_new_high_score = engine.score >= engine.high_score
                if is_new_high_score:
                    set_high_score(player_id, engine.score)
                await websocket.send(
                    json.dumps(
                        {
                            "type": "game_over",
                            "score": engine.score,
                            "highScore": engine.high_score,
                            "isNewHighScore": is_new_high_score,
                        }
                    )
                )
            elif not state["gameOver"]:
                was_game_over = False

            # Pas de temps fixe, en compensant la dérive d'exécution.
            delay = next_tick - loop.time()
            if delay > 0:
                await asyncio.sleep(delay)
            else:
                next_tick = loop.time()  # on a pris du retard, on resynchronise

    try:
        await asyncio.gather(receiver(), sender())
    except asyncio.CancelledError:
        pass
    finally:
        logger.info("Connexion fermée %s (score final=%s)", connection_id, engine.score)
























@app.errorhandler(500)
async def log_500(error):
    print(f"\n🔥 ERREUR 500 sur {request.method} {request.path}")
    print(traceback.format_exc())
    return {"error": "Erreur interne du serveur"}, 500


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "wari:app",
        host="0.0.0.0", 
        port=5000,
        workers=1,                    # Processes
        loop="asyncio",               # Use asyncio loop
        timeout_keep_alive=30,        # Keep-alive timeout
    ) 