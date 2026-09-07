import os
import asyncio
import random
import httpx
import asyncio
import base64
import traceback
import smtplib
import datetime
import aiohttp
from datetime import datetime, timedelta
import bcrypt
from urllib.parse import urlencode
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from quart import  request, jsonify, redirect, Blueprint
from security import require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from typing import  Dict, Any
from email.mime.text import MIMEText
from db import get_pool
from helper import RECAPTCHA_SECRET, FRONTEND_URL














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

send_recovery_email_bp = Blueprint("send_recovery_email", __name__)

@send_recovery_email_bp.route("/api/send-recovery-email", methods=["POST"])
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

verify_email_code_bp = Blueprint("verify_email_code", __name__)

@verify_email_code_bp.route('/api/verify-email-code', methods=['POST'])
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



update_password_bp = Blueprint("update_password", __name__)

@update_password_bp.route('/api/update-password', methods=['POST'])
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



login1_bp = Blueprint("login1", __name__)

@login1_bp.route('/api/login1')
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


google_callback_bp = Blueprint("google_callback", __name__)
@google_callback_bp.route('/api/google-callback')
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

        # Vérifier le token avec Google (tolérance de dérive d'horloge de 10s)
        id_info = await asyncio.to_thread(
            id_token.verify_oauth2_token,
            id_token_str,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
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

                # 1. Chercher d'abord par google_id
                await cur.execute("SELECT id FROM users WHERE google_id=%s", (google_id,))
                user = await cur.fetchone()

                if user is not None:
                    # ANCIEN utilisateur (déjà lié à Google)
                    user_id = user[0]
                    await cur.execute(
                        """UPDATE users SET email=%s, name=%s, picture=%s 
                           WHERE google_id=%s""",
                        (email, name, picture, google_id)
                    )
                    await conn.commit()
                else:
                    # 2. Pas trouvé par google_id -> vérifier si l'email existe déjà
                    await cur.execute("SELECT id, google_id FROM users WHERE email=%s", (email,))
                    existing_by_email = await cur.fetchone()

                    if existing_by_email is not None:
                        # Compte existant (ex: inscrit par email/mdp) -> on le lie à Google
                        user_id = existing_by_email[0]
                        await cur.execute(
                            """UPDATE users SET google_id=%s, name=%s, picture=%s 
                               WHERE id=%s""",
                            (google_id, name, picture, user_id)
                        )
                        await conn.commit()
                    else:
                        # Vraiment nouveau utilisateur
                        await cur.execute(
                            """INSERT INTO users (email, name, google_id, picture, created_at) 
                               VALUES (%s, %s, %s, %s, NOW())""",
                            (email, name, google_id, picture)
                        )
                        await conn.commit()

                        await cur.execute("SELECT id FROM users WHERE google_id=%s", (google_id,))
                        user    = await cur.fetchone()
                        user_id = user[0]

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



register_bp = Blueprint("register", __name__)


@register_bp.route('/api/register', methods=['POST'])
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


verify_coded_bp = Blueprint("verify_coded", __name__)

@verify_coded_bp.route('/api/verify-coded', methods=['POST'])
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


search_account_bp = Blueprint("search_account", __name__)

@search_account_bp.route('/api/search-account', methods=['POST'])
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

login_bp = Blueprint("login", __name__)

@login_bp.route('/api/login', methods=['POST'])
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