from quart import Blueprint, jsonify, request, g
from security import require_origin, login_required, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_jwt, require_ip_score, update_fingerprint_if_changed
from db import get_pool
from game_session import create_game_session, get_active_session
from redis_session import session
from datetime import datetime
import functools
from typing import Callable


cherif_bp = Blueprint("cherif", __name__)





def track_mise():
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            response = await func(*args, **kwargs)
            status_code = response[1] if isinstance(response, tuple) else 200

            if status_code == 200:
                try:
                    montant = getattr(g, "mise_montant", None)
                    user_id = getattr(g, "user_id", None)

                    if montant and user_id:
                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cursor:

                                # 1️⃣ Stats par utilisateur
                                await cursor.execute(
                                    """
                                    INSERT INTO user_stats (user_id, nombre_mises, total_mise, derniere_mise)
                                    VALUES (%s, 1, %s, NOW()) AS new
                                    ON DUPLICATE KEY UPDATE
                                        user_stats.nombre_mises = user_stats.nombre_mises + 1,
                                        user_stats.total_mise = user_stats.total_mise + new.total_mise,
                                        user_stats.derniere_mise = NOW()
                                    """,
                                    (user_id, montant)
                                )

                                # 2️⃣ Stats du jour (globales, tous users confondus)
                                await cursor.execute(
                                    """
                                    INSERT INTO today_stats (stat_date, nombre_mises, total_mise)
                                    VALUES (CURDATE(), 1, %s) AS new
                                    ON DUPLICATE KEY UPDATE
                                        today_stats.nombre_mises = today_stats.nombre_mises + 1,
                                        today_stats.total_mise = today_stats.total_mise + new.total_mise
                                    """,
                                    (montant,)
                                )

                                # 3️⃣ Stats globales (all-time, une seule ligne id=1)
                                await cursor.execute(
                                    """
                                    UPDATE globale_states
                                    SET nombre_mises_total = nombre_mises_total + 1,
                                        total_mise_total = total_mise_total + %s
                                    WHERE id = 1
                                    """,
                                    (montant,)
                                )

                            await conn.commit()

                except Exception:
                    pass

            return response
        return wrapper
    return decorator


GAME_NAME_MAX_LEN = 100


@cherif_bp.route('/api/cherif', methods=['POST'])
@require_origin
@login_required
@require_origin
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
@track_mise()
async def cherif(wari_session):
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        g.user_id = user_id

        data = await request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Body invalide"
            }), 400

        bet_raw = data.get("bet")
        game_name = data.get("name")

        if not bet_raw:
            return jsonify({
                "success": False,
                "error": "Mise manquante"
            }), 400

        if not game_name or not isinstance(game_name, str) or len(game_name) > GAME_NAME_MAX_LEN:
            return jsonify({
                "success": False,
                "error": "Nom du jeu manquant ou invalide"
            }), 400

        try:
            bet = round(float(bet_raw), 2)
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Mise invalide"
            }), 400

        if bet <= 0:
            return jsonify({
                "success": False,
                "error": "La mise doit être positive"
            }), 400

        if bet <= 99:
            return jsonify({
                "success": False,
                "error": "La mise doit être supérieure à 99"
            }), 400

        g.mise_montant = bet

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    await cursor.execute(
                        "SELECT solde FROM solde WHERE user_id=%s LIMIT 1 FOR UPDATE",
                        (user_id,)
                    )
                    solde_row = await cursor.fetchone()

                    if not solde_row:
                        return jsonify({
                            "success": False,
                            "error": "Solde introuvable"
                        }), 404

                    solde_avant = float(solde_row[0])

                    if bet > solde_avant:
                        return jsonify({
                            "success": False,
                            "error": "Solde insuffisant"
                        }), 400

                    solde_apres = solde_avant - bet

                    await cursor.execute(
                        "UPDATE solde SET solde=%s WHERE user_id=%s",
                        (solde_apres, user_id)
                    )

                    await cursor.execute(
                        "SELECT name FROM users WHERE id=%s LIMIT 1",
                        (user_id,)
                    )
                    user_row = await cursor.fetchone()
                    user_name = user_row[0] if user_row else f"Utilisateur #{user_id}"

                    now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

                    description = (
                        f"Le joueur {user_name} (ID {user_id}) "
                        f"a misé {bet} XOF le {now_str}. "
                        f"Son solde avant la mise était {solde_avant} XOF "
                        f"et son nouveau solde est de {solde_apres} XOF."
                    )

                    await cursor.execute(
                        """
                        INSERT INTO bets_history
                        (user_id, mise, solde_avant, solde_apres, description, created_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        """,
                        (user_id, bet, solde_avant, solde_apres, description)
                    )

                    existing = await get_active_session(user_id)
                    if existing is not None:
                        # Session déjà en cours (ex: reload de page) → on la renvoie
                        # telle quelle, SANS débiter à nouveau.
                        return {
                            "success": True,
                            "session_id": existing["session_id"],
                            "token": existing["token"],
                             "reused": True,
                        }

                    # Initialisation obligatoire de la session de jeu (game_name fourni par le frontend)
                    game_session = await create_game_session(user_id, bet, game_name)

                    if not game_session.get("success"):
                        await conn.rollback()
                        return jsonify({
                            "success": False,
                            "error": "Impossible d'initialiser la session de jeu"
                        }), 500

                    await conn.commit()

                except Exception as e:
                    await conn.rollback()
                    raise e

        response_data = {
            "success": True,
            "message": "Mise effectuée avec succès",
            "new_solde": solde_apres,
            "session_id": game_session["session_id"],
            "token": game_session["token"],
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Erreur interne"
        }), 500