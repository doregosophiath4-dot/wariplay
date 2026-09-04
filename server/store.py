from quart import jsonify, Blueprint
from security import require_jwt, update_fingerprint_if_changed, login_required, require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from db import get_pool

products_bp = Blueprint("products", __name__)

def row_to_dict(columns, row):
    """Convertit une ligne tuple en dictionnaire en utilisant les noms de colonnes"""
    return dict(zip(columns, row))

@products_bp.route('/api/products', methods=['GET'])
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
                # Récupérer les produits disponibles avec leurs catégories
                query = """
                SELECT p.*, c.name as category_name, c.icon as category_icon 
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE p.disponible = 1
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