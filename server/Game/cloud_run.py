#cloud_run_server.py

#Backend Quart (async, WebSocket) pour "Cloud Run" (le ballon qui évite
#les nuages).

#Porte côté serveur toute la simulation : physique du ballon, nuages,
#collisions, difficulté, objectif, victoire/défaite.

#Auth WS via authenticate_websocket(). Après auth, le serveur ATTEND
#(avec timeout) le message bind_session {session_id, token} issus de
#/api/cherif AVANT de créer quoi que ce soit côté jeu : pas de
#GameSession, pas de game_loop, pas d'objectif généré tant que le
#token n'a pas été validé (ownership, jeu, statut pending). Ça évite
#l'aller-retour "créer un id temporaire puis le remplacer" et les
#tâches asyncio lancées pour des connexions qui n'aboutissent jamais.

#Sécurité :
#- Ownership check : le token de bind_session est vérifié via
#  get_session_by_token AVANT toute création de session côté jeu —
#  appartenance (user_id), jeu (GAME_NAME) et statut "pending".
#- Timeout sur l'attente du bind : une connexion authentifiée qui
#  n'envoie jamais bind_session est fermée après BIND_TIMEOUT_SECONDS,
#  plutôt que de rester ouverte indéfiniment.
#- Anti-replay : start_game et flap doivent porter un nonce strictement
#  croissant, vérifié et consommé de manière atomique via
#  verify_and_consume_nonce.
#- Règlement : win_game / lose_game appellent settle_game_session pour
#  créditer le gain (win) ou clôturer la mise (loss).
#- Rate limiting (sur la boucle de jeu) + limite de taille des messages.

#Lancement (dev) :
#hypercorn cloud_run_server:app --bind 0.0.0.0:5001

from __future__ import annotations

import asyncio
import json
import math
import random
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from security import authenticate_websocket, check_ws_message_rate
from game_session import settle_game_session, verify_and_consume_nonce, get_session_by_token
from quart import Blueprint, websocket


ws_cloud_run_bp = Blueprint("ws_cloud_run_bp", __name__)

# =========================================================
# CONFIGURATION
# =========================================================

TICK_RATE = 60
DT = 1 / TICK_RATE

GRAVITY = 0.45

SHEET_COLS = 4
SHEET_ROWS = 3

# Doit correspondre exactement au game_name utilisé côté /api/cherif
# lors de la mise (create_game_session).
GAME_NAME = "Cloud Run"

# Types de messages qui modifient l'état de la partie et doivent donc
# être protégés par un nonce (anti-replay).
NONCE_PROTECTED_EVENTS = ("start_game", "flap")

# Taille max acceptée pour un message entrant (en octets).
MAX_MESSAGE_SIZE_BYTES = 4096

# Délai maximum accordé au client, après auth_success, pour envoyer un
# bind_session valide. Passé ce délai, la connexion est fermée.
BIND_TIMEOUT_SECONDS = 15


def js_round(value: float) -> int:
    """Reproduit Math.round() de JS (arrondi vers le haut à .5)."""
    return math.floor(value + 0.5)


def get_balloon_size(canvas_width: float) -> float:
    if canvas_width < 400:
        return 40
    if canvas_width < 600:
        return 50
    if canvas_width < 900:
        return 60
    return 70


def get_jump_force(canvas_width: float) -> float:
    if canvas_width < 400:
        return -6.5
    if canvas_width < 600:
        return -7.0
    if canvas_width < 900:
        return -7.8
    return -8.5


def get_cloud_size(canvas_width: float) -> tuple[float, float]:
    if canvas_width < 400:
        return (110, 85)
    if canvas_width < 600:
        return (140, 105)
    if canvas_width < 900:
        return (170, 125)
    return (190, 140)


# =========================================================
# OBJECTIFS
# =========================================================

class ObjectiveType(str, Enum):
    SCORE = "score"
    TIME = "time"
    AVOID = "avoid"


@dataclass
class Objective:
    type: ObjectiveType
    target: int

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "target": self.target}


def generate_objective() -> Objective:
    objective_type = random.choice(list(ObjectiveType))

    if objective_type is ObjectiveType.SCORE:
        target = (math.floor(random.random() * 5) + 3) * 50
    elif objective_type is ObjectiveType.TIME:
        target = math.floor(random.random() * 5) + 5
    else:
        target = math.floor(random.random() * 5) + 5

    return Objective(type=objective_type, target=target)


# =========================================================
# ETAT DES NUAGES / DE LA PARTIE
# =========================================================

class GameStatus(str, Enum):
    AWAITING_START = "awaiting_start"
    IN_PROGRESS = "in_progress"
    WON = "won"
    LOST = "lost"


@dataclass
class CloudState:
    id: int
    x: float
    y: float
    width: float
    height: float
    cloud_index: int
    speed_offset: float
    was_avoided: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "cloud_index": self.cloud_index,
        }


@dataclass
class GameSession:
    # Un seul et même session_id, dès la création : celui validé par
    # get_session_by_token (issu de /api/cherif). Plus d'UUID
    # temporaire à remplacer après coup.
    session_id: str

    cherif_token: str | None = None
    user_id: Any = None
    settled: bool = False  # pour éviter double settle

    objective: Objective | None = None
    status: GameStatus = GameStatus.AWAITING_START

    canvas_width: float = 800.0
    canvas_height: float = 600.0

    balloon_x: float = 0.0
    balloon_y: float = 300.0
    balloon_radius: float = 25.0
    balloon_size: float = 70.0
    balloon_dy: float = 0.0

    clouds: list[CloudState] = field(default_factory=list)
    next_cloud_id: int = 0

    score: int = 0
    level: int = 1
    game_speed: float = 4.0
    spawn_interval: int = 75
    max_clouds: int = 3
    spawn_timer: int = 0

    clouds_avoided: int = 0
    objective_completed: bool = False

    started_at: float | None = None

    event_log: list[dict[str, Any]] = field(default_factory=list)

    def log_event(self, direction: str, event_type: str, payload: dict[str, Any]) -> None:
        self.event_log.append(
            {
                "t": time.time(),
                "direction": direction,
                "type": event_type,
                "payload": payload,
            }
        )


SESSIONS: dict[str, GameSession] = {}


# =========================================================
# ENVOI D'EVENEMENTS
# =========================================================

async def send_event(session: GameSession, event_type: str, payload: dict[str, Any] | None = None) -> None:
    payload = payload or {}
    session.log_event("out", event_type, payload)
    await websocket.send(json.dumps({"type": event_type, **payload}))


async def send_error(session: GameSession, message: str) -> None:
    await send_event(session, "error", {"message": message})


async def send_raw_error(message: str) -> None:
    """Erreur envoyée AVANT qu'une GameSession existe (pendant l'attente
    du bind_session) — pas de session à journaliser via log_event."""
    try:
        await websocket.send(json.dumps({"type": "error", "message": message}))
    except Exception:
        pass


# =========================================================
# BALLON
# =========================================================

def update_balloon_position(session: GameSession) -> None:
    session.balloon_x = session.canvas_width * 0.12
    if session.balloon_x < session.balloon_size / 2:
        session.balloon_x = session.balloon_size / 2


def update_balloon_size(session: GameSession) -> None:
    session.balloon_size = get_balloon_size(session.canvas_width)
    session.balloon_radius = session.balloon_size / 2
    update_balloon_position(session)


# =========================================================
# NUAGES
# =========================================================

def spawn_cloud(session: GameSession) -> None:
    width, height = get_cloud_size(session.canvas_width)

    margin = height + 30
    span = max(1.0, session.canvas_height - margin * 2)
    y = random.random() * span + margin

    cloud = CloudState(
        id=session.next_cloud_id,
        x=session.canvas_width + 50,
        y=y,
        width=width,
        height=height,
        cloud_index=random.randrange(SHEET_COLS * SHEET_ROWS),
        speed_offset=0.7 + random.random() * 0.6,
    )

    session.next_cloud_id += 1
    session.clouds.append(cloud)


def _check_collision(
    cx: float, cy: float, cr: float,
    rx: float, ry: float, rw: float, rh: float,
) -> bool:
    closest_x = max(rx, min(cx, rx + rw))
    closest_y = max(ry, min(cy, ry + rh))
    dx = cx - closest_x
    dy = cy - closest_y
    return dx * dx + dy * dy < cr * cr


# =========================================================
# DIFFICULTE
# =========================================================

def update_difficulty(session: GameSession) -> None:
    session.level = session.score // 40 + 1
    session.game_speed = min(16.0, 4.0 + (session.level - 1) * 0.9)
    session.spawn_interval = max(25, 75 - (session.level - 1) * 4)
    session.max_clouds = min(12, js_round(3 + (session.level - 1) * 0.4))


# =========================================================
# OBJECTIF
# =========================================================

def check_objective_progress(session: GameSession) -> bool:
    objective = session.objective

    if objective is None or session.objective_completed:
        return False

    if objective.type is ObjectiveType.SCORE:
        progress = min(session.score, objective.target)
    elif objective.type is ObjectiveType.TIME:
        elapsed = int(time.time() - (session.started_at or time.time()))
        progress = min(elapsed, objective.target)
    else:
        progress = min(session.clouds_avoided, objective.target)

    if progress >= objective.target:
        session.objective_completed = True
        return True

    return False


# =========================================================
# STATS / ETAT ENVOYE AU CLIENT
# =========================================================

def _stats(session: GameSession) -> dict[str, Any]:
    return {
        "score": session.score,
        "level": session.level,
        "max_clouds": session.max_clouds,
    }


async def broadcast_state(session: GameSession) -> None:
    await send_event(
        session,
        "state",
        {
            "balloon": {"x": session.balloon_x, "y": session.balloon_y},
            "clouds": [c.to_dict() for c in session.clouds],
            **_stats(session),
        },
    )


# =========================================================
# ATTENTE DU BIND_SESSION (avant toute création de GameSession)
# =========================================================

async def await_bind_session(user_id: Any) -> GameSession | None:
    """
    Attend le message bind_session du client, avec un timeout, AVANT
    de créer quoi que ce soit côté jeu. Valide le token via
    get_session_by_token (existence, appartenance, jeu, statut
    pending) et ne construit la GameSession — avec son session_id
    définitif — qu'une fois toutes ces vérifications passées.

    Retourne la GameSession prête à jouer, ou None si le bind a
    échoué, un message invalide a été reçu, ou le timeout a expiré
    (dans tous ces cas, un message d'erreur a déjà été envoyé au
    client et l'appelant doit fermer la connexion).
    """
    try:
        raw = await asyncio.wait_for(websocket.receive(), timeout=BIND_TIMEOUT_SECONDS)
    except asyncio.TimeoutError:
        await send_raw_error("Délai dépassé pour lier la session de jeu.")
        return None

    raw_size = len(raw) if isinstance(raw, (bytes, bytearray)) else len(raw.encode("utf-8"))
    if raw_size > MAX_MESSAGE_SIZE_BYTES:
        await send_raw_error("Message trop volumineux.")
        return None

    try:
        message = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        await send_raw_error("Message JSON invalide.")
        return None

    if not isinstance(message, dict) or message.get("type") != "bind_session":
        received = message.get("type") if isinstance(message, dict) else message
        await send_raw_error("Message attendu : type 'bind_session'.")
        return None

    sid = message.get("session_id")
    token = message.get("token")

    if not isinstance(sid, str) or not isinstance(token, str):
        await send_raw_error("bind_session: session_id et token (string) requis.")
        return None

    redis_session = await get_session_by_token(token)
    if redis_session is None:
        await send_raw_error("Session de jeu introuvable ou expirée.")
        return None

    if redis_session.get("user_id") != str(user_id):
        await send_raw_error("Ce token ne vous appartient pas.")
        return None

    if redis_session.get("game_name") != GAME_NAME:
        await send_raw_error("Ce token n'est pas destiné à ce jeu.")
        return None

    if redis_session.get("status") != "pending":
        await send_raw_error("Cette session n'est plus disponible.")
        return None

    # Toutes les vérifications sont passées : on ne crée la
    # GameSession qu'à cet instant, avec son identité définitive.
    session = GameSession(session_id=sid)
    session.cherif_token = token
    session.user_id = user_id
    session.objective = generate_objective()
    SESSIONS[sid] = session

    await send_event(session, "session_bound", {"session_id": sid, "ok": True})
    await send_event(
        session,
        "session_started",
        {"session_id": sid, "objective": session.objective.to_dict()},
    )

    return session


async def start_game(session: GameSession, canvas_width: float, canvas_height: float) -> None:
    if session.status == GameStatus.IN_PROGRESS:
        await send_error(session, "La partie est déjà en cours.")
        return

    session.canvas_width = float(canvas_width)
    session.canvas_height = float(canvas_height)

    session.status = GameStatus.IN_PROGRESS

    session.score = 0
    session.level = 1
    session.game_speed = 4.0
    session.spawn_interval = 75
    session.max_clouds = 3
    session.spawn_timer = 0

    session.clouds = []
    session.next_cloud_id = 0
    session.clouds_avoided = 0
    session.objective_completed = False

    session.balloon_dy = 0.0
    session.balloon_y = session.canvas_height / 2

    update_balloon_size(session)
    update_balloon_position(session)

    session.started_at = time.time()

    await send_event(
        session,
        "game_started",
        {
            "objective": session.objective.to_dict() if session.objective else None,
            "balloon": {"x": session.balloon_x, "y": session.balloon_y},
            **_stats(session),
        },
    )


async def flap(session: GameSession) -> None:
    if session.status is GameStatus.IN_PROGRESS:
        session.balloon_dy = get_jump_force(session.canvas_width)


async def resize(session: GameSession, canvas_width: float, canvas_height: float) -> None:
    session.canvas_width = float(canvas_width)
    session.canvas_height = float(canvas_height)

    update_balloon_size(session)
    update_balloon_position(session)

    if session.balloon_y + session.balloon_radius > session.canvas_height:
        session.balloon_y = session.canvas_height - session.balloon_radius
    if session.balloon_y - session.balloon_radius < 0:
        session.balloon_y = session.balloon_radius


# =========================================================
# REGLEMENT (settle_game_session)
# =========================================================

async def _settle(session: GameSession, result: str) -> None:
    """Appelle settle_game_session une seule fois, comme pour Memo Pop."""
    if session.settled:
        return

    if not session.cherif_token or not session.user_id:
        return

    session.settled = True

    try:
        settle_result = await settle_game_session(
            game_token=session.cherif_token,
            user_id=str(session.user_id),
            game_name=GAME_NAME,
            result=result,
        )
    except Exception as e:
        pass


async def win_game(session: GameSession) -> None:
    session.status = GameStatus.WON
    await _settle(session, "win")
    await send_event(
        session,
        "game_over",
        {"result": "win", "reason": "objective_completed", **_stats(session)},
    )


async def lose_game(session: GameSession, reason: str) -> None:
    if session.status != GameStatus.IN_PROGRESS:
        return

    session.status = GameStatus.LOST
    await _settle(session, "loss")
    await send_event(
        session,
        "game_over",
        {"result": "loss", "reason": reason, **_stats(session)},
    )


# =========================================================
# UNE ITERATION DE SIMULATION
# =========================================================

async def tick(session: GameSession) -> None:
    session.balloon_dy += GRAVITY
    session.balloon_y += session.balloon_dy

    if (
        session.balloon_y - session.balloon_radius < 0
        or session.balloon_y + session.balloon_radius > session.canvas_height
    ):
        await lose_game(session, "boundary_hit")
        return

    update_difficulty(session)

    session.spawn_timer += 1

    if session.spawn_timer >= session.spawn_interval and len(session.clouds) < session.max_clouds:
        spawn_count = 1
        if session.level >= 8 and random.random() < 0.3:
            spawn_count = 2
        if session.level >= 12 and random.random() < 0.4:
            spawn_count = 3

        for _ in range(spawn_count):
            if len(session.clouds) < session.max_clouds:
                spawn_cloud(session)

        session.spawn_timer = 0

    padding = 8
    remaining: list[CloudState] = []

    for cloud in session.clouds:
        cloud.x -= session.game_speed * cloud.speed_offset

        if not cloud.was_avoided and cloud.x + cloud.width < 0:
            cloud.was_avoided = True
            session.clouds_avoided += 1

        if _check_collision(
            session.balloon_x,
            session.balloon_y,
            session.balloon_radius,
            cloud.x + padding,
            cloud.y + padding,
            cloud.width - padding * 2,
            cloud.height - padding * 2,
        ):
            await lose_game(session, "cloud_collision")
            return

        if cloud.x + cloud.width < -20:
            session.score += 10
            continue

        remaining.append(cloud)

    session.clouds = remaining

    if check_objective_progress(session):
        await win_game(session)
        return

    await broadcast_state(session)


async def game_loop(session: GameSession) -> None:
    try:
        while True:
            await asyncio.sleep(DT)

            if session.status != GameStatus.IN_PROGRESS:
                continue

            await tick(session)
    except asyncio.CancelledError:
        raise


# =========================================================
# DISPATCH DES MESSAGES CLIENT (post-bind uniquement)
# =========================================================

async def handle_client_message(session: GameSession, raw: str | bytes) -> None:
    # ── Limite de taille avant même de tenter de parser le JSON ──
    raw_size = len(raw) if isinstance(raw, (bytes, bytearray)) else len(raw.encode("utf-8"))
    if raw_size > MAX_MESSAGE_SIZE_BYTES:
        await send_error(session, "Message trop volumineux.")
        return

    try:
        message = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        await send_error(session, "Message JSON invalide.")
        return

    if not isinstance(message, dict):
        await send_error(session, "Format de message invalide.")
        return

    event_type = message.get("type")
    session.log_event("in", event_type or "unknown", message)

    # flap est très fréquent (à chaque tap) : pas de print ici pour ne
    # pas noyer les logs, contrairement aux autres types de messages.
    if event_type != "flap":
        pass

    # La session est déjà liée avant d'arriver ici (await_bind_session
    # a tourné avant la boucle principale). Un bind_session reçu à ce
    # stade est un doublon inoffensif — ignoré silencieusement.
    if event_type == "bind_session":
        await send_event(
            session,
            "session_bound",
            {"session_id": session.session_id, "ok": True, "reused": True},
        )
        return

    # ── Anti-replay : toute action qui modifie l'état de la partie
    #    doit présenter un nonce strictement croissant, vérifié et
    #    consommé de manière atomique côté Redis. ──
    if event_type in NONCE_PROTECTED_EVENTS:
        nonce = message.get("nonce")
        if nonce is None:
            await send_error(session, "Le champ 'nonce' est obligatoire.")
            return

        nonce_ok = await verify_and_consume_nonce(session.cherif_token, nonce)
        if not nonce_ok:
            await send_error(session, "Nonce invalide ou déjà utilisé.")
            return

    if event_type == "start_game":
        width = message.get("canvas_width")
        height = message.get("canvas_height")

        if not isinstance(width, (int, float)) or not isinstance(height, (int, float)):
            await send_error(session, "canvas_width/canvas_height requis et numériques.")
            return

        await start_game(session, width, height)

    elif event_type == "flap":
        await flap(session)

    elif event_type == "resize":
        width = message.get("canvas_width")
        height = message.get("canvas_height")

        if isinstance(width, (int, float)) and isinstance(height, (int, float)):
            await resize(session, width, height)

    else:
        await send_error(session, f"Type de message inconnu : {event_type!r}")


# =========================================================
# ROUTE WEBSOCKET
# =========================================================

@ws_cloud_run_bp.websocket("/ws/cloud-run")
async def cloud_run_ws() -> None:
    user_id = await authenticate_websocket()

    if not user_id:
        try:
            await websocket.send(
                json.dumps({"type": "error", "message": "Authentification requise"})
            )
        except Exception:
            pass
        return

    try:
        await websocket.send(json.dumps({"type": "auth_success"}))
    except Exception:
        return

    # Attente (avec timeout) du bind_session validé — aucune
    # GameSession, aucun game_loop, aucun objectif généré avant ça.
    session = await await_bind_session(user_id)
    if session is None:
        try:
            await websocket.close(code=4001, reason="bind_session requis")
        except Exception:
            pass
        return

    loop_task = asyncio.create_task(game_loop(session))

    try:
        while True:
            raw = await websocket.receive()

            if not await check_ws_message_rate(user_id):
                await websocket.send(
                    json.dumps(
                        {
                            "type": "error",
                            "message": "Trop d'actions, ralentis un peu.",
                        }
                    )
                )
                continue

            await handle_client_message(session, raw)
    except asyncio.CancelledError:
        raise
    finally:
        loop_task.cancel()
        SESSIONS.pop(session.session_id, None)