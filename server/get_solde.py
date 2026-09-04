from quart import jsonify, Blueprint
from security import require_jwt, update_fingerprint_if_changed, login_required, require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from db import get_pool






# =====================================
# ROUTE GENERALE POUR OBTENIR LE SOLDE 
# =====================================

get_solde_bp = Blueprint("get_solde", __name__)

@get_solde_bp.route('/api/get_lettricide_solde', methods=['GET'])
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
