from quart import jsonify, Blueprint, request
from security import require_jwt, update_fingerprint_if_changed, login_required, require_origin, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_ip_score
from redis_session import session
from db import get_pool
from urllib.parse import unquote
import re





# ============================================
# ROUTES DES ELEMENTS DE LA PAGE DE PAIEMENT
# ============================================


get_product_price_bp = Blueprint("get_product_price", __name__)

@get_product_price_bp.route('/api/get_product_price', methods=['GET'])
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



get_level_info_bp = Blueprint("get_level_info", __name__)

@get_level_info_bp.route('/api/get_level_info', methods=['GET'])
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


save_purchase_bp = Blueprint("save_purchase", __name__)


@save_purchase_bp.route('/api/save_purchase', methods=['POST'])
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


async def update_purchase_type_stats(cur, user_id, is_game, is_path):
    """
    Incrémente total_game ou total_path (exclusifs) dans user_stats, today_stats et globale_states.
    N'exécute rien si ni is_game ni is_path (produit "patch générique" non classé).
    """
    game_incr = 1 if is_game else 0
    path_incr = 1 if is_path else 0

    if game_incr == 0 and path_incr == 0:
        return

    # --- user_stats ---
    await cur.execute(
        """
        INSERT INTO user_stats (user_id, total_game, total_path)
        VALUES (%s, %s, %s) AS new
        ON DUPLICATE KEY UPDATE
            user_stats.total_game = COALESCE(user_stats.total_game, 0) + new.total_game,
            user_stats.total_path = COALESCE(user_stats.total_path, 0) + new.total_path
        """,
        (user_id, game_incr, path_incr)
    )

    # --- today_stats (global, pas de user_id) ---
    await cur.execute(
        """
        INSERT INTO today_stats (stat_date, total_game, total_path)
        VALUES (CURDATE(), %s, %s) AS new
        ON DUPLICATE KEY UPDATE
            today_stats.total_game = COALESCE(today_stats.total_game, 0) + new.total_game,
            today_stats.total_path = COALESCE(today_stats.total_path, 0) + new.total_path
        """,
        (game_incr, path_incr)
    )

    # --- globale_states (global, pas de user_id) ---
    await cur.execute(
        """
        UPDATE globale_states
        SET total_game = COALESCE(total_game, 0) + %s,
            total_path = COALESCE(total_path, 0) + %s
        WHERE id = 1
        """,
        (game_incr, path_incr)
    )


save_product_purchase_bp = Blueprint("save_product_purchase", __name__)


@save_product_purchase_bp.route('/api/save_product_purchase', methods=['POST'])
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

                # --- Prix de confiance + category_id : toujours products, jamais l'amount du frontend ---
                await cur.execute("SELECT price, category_id FROM products WHERE title = %s", (produit,))
                price_row = await cur.fetchone()
                if not price_row:
                    return jsonify({'success': False, 'error': 'Produit introuvable'}), 404

                try:
                    amount_clean = parse_price(price_row[0])
                except ValueError:
                    return jsonify({'success': False, 'error': 'Prix invalide en base'}), 500

                category_id = price_row[1]

                # --- Classification game / path (exclusive, priorité à games1) ---
                is_path = (not is_game) and (category_id == 2)

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
                        (100000000000, user_id)
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

                # --- Comptabilisation game / path (indépendante du branchement ci-dessus) ---
                await update_purchase_type_stats(cur, user_id, is_game, is_path)

                await conn.commit()

        return jsonify({
            'success': True,
            'message': 'Achat effectué avec succès',
            'new_balance': new_balance
        })

    except Exception as e:
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500