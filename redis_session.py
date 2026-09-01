import json
import uuid
from datetime import timedelta

import redis.asyncio as aioredis
from quart import request, g, abort
from werkzeug.local import LocalProxy

# ── Config ────────────────────────────────────────────────────────────────────
REDIS_CONFIG = {
    "host": "127.0.0.1",
    "port": 6379,
    #"password": "DouDou@1234",
    "decode_responses": True,
    "socket_timeout": 5,
    "socket_connect_timeout": 5,
    "retry_on_timeout": True,
    "health_check_interval": 30,
    "protocol": 2,   # ← force RESP2, évite la commande HELLO
}

SESSION_COOKIE_NAME = "session_id"
SESSION_TTL         = 60 * 60 * 24 * 7   # 7 jours en secondes
SESSION_PREFIX      = "session:"          # Clé Redis : session:<uuid>


# ── Pool Redis (singleton) ────────────────────────────────────────────────────
_redis_pool: aioredis.Redis | None = None

async def get_redis() -> aioredis.Redis:
    """Retourne le client Redis (connexion partagée via pool)."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.Redis(**REDIS_CONFIG)
    return _redis_pool

async def close_redis():
    """À appeler au shutdown de l'app."""
    global _redis_pool
    if _redis_pool:
        await _redis_pool.aclose()
        _redis_pool = None


# ── Classe Session ────────────────────────────────────────────────────────────
class RedisSession(dict):
    """
    Dict-like object qui représente la session courante.
    S'utilise exactement comme l'ancienne session de Quart.
    """

    def __init__(self, session_id: str, data: dict):
        super().__init__(data)
        self.session_id = session_id
        self._modified  = False

    def __setitem__(self, key, value):
        self._modified = True
        super().__setitem__(key, value)

    def __delitem__(self, key):
        self._modified = True
        super().__delitem__(key)

    def clear(self):
        self._modified = True
        super().clear()

    @property
    def modified(self) -> bool:
        return self._modified


# ── Helpers bas niveau ────────────────────────────────────────────────────────
async def _load_session(session_id: str) -> dict:
    redis = await get_redis()
    raw   = await redis.get(f"{SESSION_PREFIX}{session_id}")
    return json.loads(raw) if raw else {}

async def _save_session(session_id: str, data: dict, ttl: int = SESSION_TTL):
    redis = await get_redis()
    await redis.setex(
        f"{SESSION_PREFIX}{session_id}",
        timedelta(seconds=ttl),
        json.dumps(data),
    )

async def _delete_session(session_id: str):
    redis = await get_redis()
    await redis.delete(f"{SESSION_PREFIX}{session_id}")


# ── API publique ──────────────────────────────────────────────────────────────
async def open_session() -> RedisSession:
    """
    Charge (ou crée) la session depuis Redis.
    À appeler dans un before_request.
    Stocke la session dans g.session.
    """
    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if session_id:
        data = await _load_session(session_id)
    else:
        session_id = str(uuid.uuid4())
        data       = {}

    redis_session = RedisSession(session_id, data)
    g.session     = redis_session
    return redis_session


async def save_session(response):
    """
    Persiste la session dans Redis et pose le cookie.
    À appeler dans un after_request.
    """
    redis_session: RedisSession | None = g.get("session")
    if redis_session is None:
        return response

    if redis_session.modified or not request.cookies.get(SESSION_COOKIE_NAME):
        await _save_session(redis_session.session_id, dict(redis_session))
        response.set_cookie(
            SESSION_COOKIE_NAME,
            redis_session.session_id,
            max_age=SESSION_TTL,
            httponly=True,
            samesite="Lax",
            # secure=True,  # ← active en production (HTTPS)
        )

    return response


async def destroy_session():
    """Supprime la session active (logout)."""
    redis_session: RedisSession | None = g.get("session")
    if redis_session:
        await _delete_session(redis_session.session_id)
        redis_session.clear()


def get_session() -> RedisSession:
    """Accès direct à la session depuis n'importe quelle vue."""
    redis_session = g.get("session")
    if redis_session is None:
        abort(500, "Session non initialisée — open_session() appelé ?")
    return redis_session


# ── Proxy transparent (drop-in replacement de l'ancien `session` Quart) ───────
session = LocalProxy(lambda: g.get("session"))