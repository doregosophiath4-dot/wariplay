
from quart import  request, jsonify, Blueprint
from security import require_jwt, update_fingerprint_if_changed, login_required, require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from db import get_pool
from datetime import datetime
import asyncio
import bcrypt


supprimer_code_bp = Blueprint("supprimer_code", __name__)

@supprimer_code_bp.route("/api/supprimer-code", methods=["POST"])
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


enregistrer_code_bp = Blueprint("enregistrer_code", __name__)

@enregistrer_code_bp.route('/api/enregistrer-code', methods=['POST'])
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


update_phone_bp = Blueprint("update_phone", __name__)

@update_phone_bp.route('/api/update-phone', methods=['POST'])
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


verif_activee_bp = Blueprint("verif_activee", __name__)

@verif_activee_bp.route("/api/verif-activee", methods=["GET"])
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


check_notifications_bp = Blueprint("check_notifications", __name__)

@check_notifications_bp.route('/api/check_notifications')
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


check_referral_status_bp = Blueprint("check_referral_status", __name__)

# --- Route async pour vérifier le statut du referral ---
@check_referral_status_bp.route('/api/check-referral-status', methods=['GET'])
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


check_verification_status_bp = Blueprint("check_verification_status", __name__)


@check_verification_status_bp.route('/api/check-verification-status', methods=['GET'])
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


deactivate_referral_bp = Blueprint("desactivate_referral", __name__)

@deactivate_referral_bp.route('/api/deactivate-referral', methods=['POST'])
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



activate_referral_bp = Blueprint("activate_referral", __name__)


# --- Route activate-referral async ---
@activate_referral_bp.route('/api/activate-referral', methods=['POST'])
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


update_notifications_bp = Blueprint("update_notifications", __name__)

@update_notifications_bp.route('/api/update_notifications', methods=['POST'])
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


password_bp = Blueprint("password", __name__)

@password_bp.route('/api/password', methods=['POST'])
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