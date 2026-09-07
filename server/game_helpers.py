from db import get_pool
from datetime import datetime
import difflib
import re


def normalize_game_name(text: str) -> str:
    """Normalise un nom de jeu : minuscule, underscores/tirets -> espace, espaces multiples réduits."""
    text = text.lower().strip()
    text = re.sub(r"[_\-]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


async def find_and_update_game_players(cursor, game_type: str, similarity_threshold: float = 0.55):
    """
    Recherche approximative du jeu dans games1 (colonne name) à partir de game_type,
    et incrémente sa colonne players de 1 si une correspondance suffisante est trouvée.
    """
    normalized_input = normalize_game_name(game_type)

    await cursor.execute("SELECT id, name, players FROM games1")
    rows = await cursor.fetchall()

    best_id = None
    best_score = 0.0

    for row in rows:
        game_id, name, players = row
        normalized_name = normalize_game_name(name)

        score = difflib.SequenceMatcher(None, normalized_input, normalized_name).ratio()

        # bonus si l'un est inclus dans l'autre (ex: "cloud run" dans "cloud run deluxe")
        if normalized_input in normalized_name or normalized_name in normalized_input:
            score = max(score, 0.85)

        if score > best_score:
            best_score = score
            best_id = game_id

    if best_id is not None and best_score >= similarity_threshold:
        await cursor.execute(
            "UPDATE games1 SET players = players + 1 WHERE id = %s",
            (best_id,)
        )
        return best_id
    else:
        return None


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

                # 5️⃣ Recherche floue du jeu dans games1 et incrémentation de players
                await find_and_update_game_players(cursor, game_type)

                await conn.commit()

            except Exception as e:
                await conn.rollback()
                raise e





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






async def decrement_game_life(user_id, game_name):
    """
    Décrémente une vie pour un utilisateur et un jeu donné.

    Args:
        user_id: ID de l'utilisateur
        game_name: Nom du jeu (product_name)

    Returns:
        dict: Résultat de l'opération
    """

    if not user_id or not game_name:
        return {
            'success': False,
            'error': 'user_id ou game_name manquant',
            'remaining_lives': 0
        }

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # Récupérer les vies avec verrouillage
                await cur.execute(
                    """
                    SELECT vies
                    FROM game_settings
                    WHERE product_name=%s AND user_id=%s
                    FOR UPDATE
                    """,
                    (game_name, user_id)
                )

                result = await cur.fetchone()

                if not result:
                    await conn.rollback()

                    return {
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }

                remaining_lives = result[0]

                # Vérifier s'il reste des vies
                if remaining_lives <= 0:
                    await conn.rollback()

                    return {
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    }

                # Décrémenter une vie
                await cur.execute(
                    """
                    UPDATE game_settings
                    SET vies = vies - 1
                    WHERE product_name=%s AND user_id=%s
                    """,
                    (game_name, user_id)
                )

                await conn.commit()

                return {
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                }

            except Exception as e:
                await conn.rollback()

                return {
                    'success': False,
                    'error': "Erreur serveur",
                    'remaining_lives': 0
                }