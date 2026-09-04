from quart import jsonify, Blueprint, request
from security import require_jwt, update_fingerprint_if_changed, login_required, require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from db import get_pool



historique_retraits_bp = Blueprint("historique_retraits", __name__)

@historique_retraits_bp.route('/api/historique-retraits')
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