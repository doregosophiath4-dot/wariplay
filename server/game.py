from quart import jsonify, Blueprint
from security import require_jwt, update_fingerprint_if_changed, login_required, require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from db import get_pool


get_games_bp = Blueprint("get_games", __name__)

# =====================================
# ROUTES DE LA PAGE GAME
# =====================================

@get_games_bp.route('/api/get-games', methods=['GET'])
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
    user_id = session.get('user_id')

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                if user_id:
                    await cur.execute("""
                        SELECT g.name, g.description, g.players, g.rating, g.image_url,
                               g.categories, g.disponible, g.vip,
                               IF(pp.id IS NOT NULL, 1, 0) as has_purchased
                        FROM games1 g
                        LEFT JOIN product_purchases pp 
                               ON pp.product_name = g.name AND pp.user_id = %s
                        WHERE g.disponible = 1
                    """, (user_id,))
                else:
                    await cur.execute("""
                        SELECT g.name, g.description, g.players, g.rating, g.image_url,
                               g.categories, g.disponible, g.vip,
                               0 as has_purchased
                        FROM games1 g
                        WHERE g.disponible = 1
                    """)
                rows = await cur.fetchall()

        games = []
        for row in rows:
            is_vip = bool(row[7])
            has_purchased = bool(row[8])
            games.append({
                'name': row[0],
                'description': row[1],
                'players': row[2],
                'rating': row[3],
                'image_url': row[4],
                'categories': row[5],
                'disponible': bool(row[6]),
                'vip': is_vip,
                'has_access': (not is_vip) or has_purchased
            })

        return jsonify(games)

    except Exception:
        return jsonify([])