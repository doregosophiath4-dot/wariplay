
from quart import Blueprint, jsonify
import random
import string
import re
from redis_session import session
from security import require_origin, login_required, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_jwt, require_ip_score, update_fingerprint_if_changed
from db import get_pool

logout_bp = Blueprint("logout", __name__)

@logout_bp.route('/api/logout', methods=['POST'])
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


# ==============================
# ELEMENTS DE PROFIL 
# ==============================

async def generate_wari_id(cursor):
    """Génère un wari_id unique au format 'W-XXXXXX' (6 caractères alphanumériques majuscules)."""
    chars = string.ascii_uppercase + string.digits
    for _ in range(20):
        suffix = ''.join(random.choices(chars, k=6))
        candidate = f"W-{suffix}"
        await cursor.execute("SELECT id FROM solde WHERE wari_id = %s", (candidate,))
        if not await cursor.fetchone():
            return candidate

    raise Exception("Impossible de générer un wari_id unique")


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



user_info_bp = Blueprint("user_info", __name__)

@user_info_bp.route('/api/user-info', methods=['GET'])
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
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

                # --- Infos de base ---
                await cur.execute(
                    "SELECT name, picture, created_at FROM users WHERE id = %s", (user_id,)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({'error': 'Utilisateur non trouvé'}), 404

                name, picture, created_at = result

                # --- Stats de jeu ---
                await cur.execute(
                    "SELECT nombre_parties, nombre_gains, montant_gains FROM user_stats WHERE user_id = %s",
                    (user_id,)
                )
                stats_row = await cur.fetchone()

                if stats_row:
                    nombre_parties, nombre_gains, montant_gains = stats_row
                else:
                    nombre_parties, nombre_gains, montant_gains = 0, 0, 0.00

                # --- Solde et wari_id ---
                await cur.execute(
                    "SELECT solde, wari_id FROM solde WHERE user_id = %s",
                    (user_id,)
                )
                solde_row = await cur.fetchone()

                if solde_row:
                    solde, wari_id = solde_row
                    if not wari_id:
                        # La ligne existe mais wari_id est vide -> on le génère et on le sauvegarde
                        wari_id = await generate_wari_id(cur)
                        await cur.execute(
                            "UPDATE solde SET wari_id = %s WHERE user_id = %s",
                            (wari_id, user_id)
                        )
                        await conn.commit()
                else:
                    # Aucune ligne solde pour ce user -> on la crée avec solde=0 et un wari_id généré
                    wari_id = await generate_wari_id(cur)
                    solde = 0
                    await cur.execute(
                        "INSERT INTO solde (user_id, solde, wari_id) VALUES (%s, %s, %s)",
                        (user_id, solde, wari_id)
                    )
                    await conn.commit()

                # --- Code de parrainage (récupération ou génération à la volée) ---
                await cur.execute(
                    "SELECT code FROM bonus WHERE pere_id=%s LIMIT 1",
                    (user_id,)
                )
                ref_row = await cur.fetchone()

                if ref_row:
                    referral_code = ref_row[0]
                else:
                    try:
                        referral_code = await generate_referral_code(cur, name)
                        await cur.execute(
                            "INSERT INTO bonus (code, pere_id) VALUES (%s, %s)",
                            (referral_code, user_id)
                        )
                        await conn.commit()
                    except Exception:
                        referral_code = None

        # --- Statut admin (hors transaction, pas besoin du curseur) ---
        is_admin = 'yes' if (user_id == 11 or str(user_id) == '11') else 'no'

        return jsonify({
            'name': name,
            'picture': picture,
            'created_at': created_at.strftime('%Y-%m-%dT%H:%M:%S'),
            'nombre_parties': nombre_parties,
            'nombre_gains': nombre_gains,
            'montant_gains': float(montant_gains),
            'solde': float(solde),
            'wari_id': wari_id,
            'is_user': is_admin,
            'authenticated': 'yes' if user_id else 'no',
            'referral_code': referral_code
        }), 200

    except Exception as e:
        return jsonify({'error': 'Erreur serveur' }), 500
