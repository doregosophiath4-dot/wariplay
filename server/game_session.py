import json
import os
import secrets
from redis_session import get_redis
from db import get_pool

GAME_SESSION_PREFIX = "game_session:"
GAME_SESSION_TTL = 60 * 10  # 10 minutes
COTE = 2
SESSIONS_DIR = "data/sessions"


async def add_gains(user_id, gains):
    """Mettre à jour le solde d'un utilisateur"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                result = await cur.fetchone()

                if not result:
                    return None

                current_solde = result[0]
                new_solde = current_solde + gains

                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id)
                )

                await conn.commit()
                return new_solde

    except Exception:
        return None


async def create_game_session(user_id: str, bet: int, game_name: str) -> dict:
    """
    Crée une session de jeu, indexée dans Redis directement par le game_token
    (TTL 10 min). bet, cote, gains, user_id, game_name restent en base Redis,
    jamais renvoyés au client.
    """
    game_token = secrets.token_urlsafe(32)
    session_id = secrets.token_hex(16)

    data = {
        "session_id": session_id,
        "user_id": user_id,
        "bet": bet,
        "game_name": game_name,
        "cote": COTE,
        "gains": bet * COTE,
        "status": "pending",  # pending | win | loss
    }

    try:
        redis = await get_redis()
        await redis.setex(
            f"{GAME_SESSION_PREFIX}{game_token}",
            GAME_SESSION_TTL,
            json.dumps(data),
        )
    except Exception:
        return {"success": False}

    return {
        "session_id": session_id,
        "token": game_token,
        "success": True,
    }


async def _get_session_by_token(game_token: str) -> dict | None:
    redis = await get_redis()
    raw = await redis.get(f"{GAME_SESSION_PREFIX}{game_token}")
    return json.loads(raw) if raw else None


async def _delete_session_by_token(game_token: str):
    redis = await get_redis()
    await redis.delete(f"{GAME_SESSION_PREFIX}{game_token}")


def _save_session_to_file(session: dict):
    """Archive la session réglée dans data/sessions/<user_id>.json"""
    os.makedirs(SESSIONS_DIR, exist_ok=True)
    path = os.path.join(SESSIONS_DIR, f"{session['user_id']}.json")

    history = []
    if os.path.exists(path):
        with open(path, "r") as f:
            try:
                history = json.load(f)
            except json.JSONDecodeError:
                history = []

    history.append(session)

    with open(path, "w") as f:
        json.dump(history, f, indent=2)


async def settle_game_session(game_token: str, user_id: str, game_name: str, result: str) -> dict:
    """
    Règle une session (win/loss). Vérifie : existence pour ce token (donc
    non expirée), appartenance au joueur, game_name correspondant, statut
    encore pending. Crédite le solde si win, archive, supprime de Redis.
    Ne renvoie que success + gains.
    """
    if result not in ("win", "loss"):
        return {"success": False}

    session = await _get_session_by_token(game_token)
    if session is None:
        return {"success": False}

    if session["user_id"] != user_id:
        return {"success": False}

    if session["game_name"] != game_name:
        return {"success": False}

    if session["status"] != "pending":
        return {"success": False}

    session["status"] = result
    gains = 0

    if result == "win":
        gains = session["gains"]
        new_solde = await add_gains(user_id, gains)
        if new_solde is None:
            return {"success": False}
        session["new_solde"] = new_solde

    _save_session_to_file(session)
    await _delete_session_by_token(game_token)

    return {"success": True, "gains": gains}