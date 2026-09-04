from quart import jsonify, Blueprint, request
from security import require_jwt, update_fingerprint_if_changed, login_required, require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from db import get_pool


historique_depots_bp = Blueprint("historique_depots", __name__)

@historique_depots_bp.route("/api/historique_depots", methods=["GET"])
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