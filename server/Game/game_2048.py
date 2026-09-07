"""
game2048_server.py

Backend Quart (async, WebSocket) pour le jeu 2048.

Porte côté serveur toute la logique qui vivait dans le <canvas> du
client : génération de la grille (tuiles de départ + apparition
aléatoire), simulation des déplacements/fusions, génération et suivi
de l'objectif, détection de victoire/défaite (fin de coups). Le
client ne fait plus que dessiner l'état reçu (y compris les
déplacements de tuiles pour l'animation) et envoyer des intentions
("je joue à gauche/droite/haut/bas").

Sécurité (alignée sur memory_game_server.py / cloud_run_server.py) :
- Auth WS réelle via authenticate_websocket() — le jeu n'accepte plus
  session_id/token via query string (un secret d'accès ne doit jamais
  transiter par une URL, qui finit dans des logs de proxy/serveur) ni
  via un message "auth" non vérifié.
- Ownership check : le client envoie game_session {session_id, token}
  issus de /api/cherif ; le token est validé via get_session_by_token
  (appartenance au user_id authentifié, jeu correspondant, statut
  "pending") AVANT toute création de GameSession — même pattern que
  Memo Pop/Cloud Run, avec timeout si rien n'arrive à temps.
- Anti-replay : start_game et move doivent porter un nonce strictement
  croissant, vérifié et consommé de manière atomique via
  verify_and_consume_nonce. Une session reprise (reused) voit son
  last_nonce remis à 0 côté get_active_session (game_session.py),
  donc aucune coordination supplémentaire n'est nécessaire ici.
- Règlement : win_game / lose_game appellent settle_game_session pour
  créditer le gain (win) ou clôturer la mise (loss) — la mise/solde
  n'est donc plus hors scope, elle est maintenant branchée.
- Limite de taille des messages entrants.

Lancement (dev) :
    hypercorn game2048_server:app --bind 0.0.0.0:5002
"""

from __future__ import annotations

import asyncio
import json
import random
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from security import authenticate_websocket, check_ws_message_rate
from game_session import settle_game_session, verify_and_consume_nonce, get_session_by_token, touch_game_session
from quart import Blueprint, websocket


# =========================================================
# CONFIGURATION
# =========================================================

GRID_SIZE = 4
INITIAL_MOVES = 90
TIME_CHECK_INTERVAL = 1.0

ws_2048_run_bp = Blueprint("ws_2048_bp", __name__)

# Doit correspondre exactement au game_name utilisé côté /api/cherif
# lors de la mise (create_game_session). À CONFIRMER : je suppose
# "2048" ici, à ajuster si l'entrée en base/route utilise un autre nom.
GAME_NAME = "game_2048"

# Types de messages qui modifient l'état de la partie et doivent donc
# être protégés par un nonce (anti-replay).
NONCE_PROTECTED_EVENTS = ("start_game", "move")

# Taille max acceptée pour un message entrant (en octets).
MAX_MESSAGE_SIZE_BYTES = 4096

# Délai maximum laissé au client, après auth_success, pour envoyer un
# game_session valide. Passé ce délai, la connexion est fermée plutôt
# que de rester ouverte indéfiniment sans jamais démarrer de partie.
GAME_SESSION_TIMEOUT_SECONDS = 15


# =========================================================
# OBJECTIFS
# =========================================================

class ObjectiveType(str, Enum):
    SCORE = "score"
    TIME = "time"
    COMBINATIONS = "combinations"


@dataclass
class Objective:
    type: ObjectiveType
    target: int

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "target": self.target}


def generate_objective() -> Objective:
    objective_type = random.choice(list(ObjectiveType))

    if objective_type is ObjectiveType.SCORE:
        target = 200 + (random.randrange(4) * 100)
    elif objective_type is ObjectiveType.TIME:
        target = 15 + (random.randrange(3) * 5)
    else:
        target = 3 + random.randrange(4)

    return Objective(type=objective_type, target=target)


# =========================================================
# ETAT DE LA PARTIE
# =========================================================

class GameStatus(str, Enum):
    AWAITING_START = "awaiting_start"
    IN_PROGRESS = "in_progress"
    WON = "won"
    LOST = "lost"


Grid = list[list[int]]


def empty_grid() -> Grid:
    return [[0] * GRID_SIZE for _ in range(GRID_SIZE)]


@dataclass
class GameSession:
    # session_id = celui de game_session.py dès la création : l'objet
    # n'existe qu'une fois le token validé (cf. _wait_for_game_session),
    # donc pas d'id temporaire à créer puis remplacer.
    session_id: str
    token: str
    user_id: Any

    objective: Objective | None = None
    status: GameStatus = GameStatus.AWAITING_START
    settled: bool = False  # pour éviter double settle

    grid: Grid = field(default_factory=empty_grid)

    score: int = 0
    combinations: int = 0
    moves_left: int = INITIAL_MOVES

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

async def send_event(
    session: GameSession, event_type: str, payload: dict[str, Any] | None = None
) -> None:
    payload = payload or {}
    session.log_event("out", event_type, payload)
    message = json.dumps({"type": event_type, **payload})
    await websocket.send(message)


async def send_error(session: GameSession, message: str) -> None:
    await send_event(session, "error", {"message": message})


async def _send_raw_error(message: str) -> None:
    """
    Envoie une erreur brute, AVANT qu'une GameSession n'existe (phase
    d'attente de game_session). send_error/send_event ont besoin d'un
    objet session pour logger l'event, donc on ne peut pas les
    utiliser ici.
    """
    try:
        await websocket.send(json.dumps({"type": "error", "message": message}))
    except Exception:
        pass


# =========================================================
# GRILLE — GENERATION
# =========================================================

def get_empty_cells(grid: Grid) -> list[tuple[int, int]]:
    return [(x, y) for y in range(GRID_SIZE) for x in range(GRID_SIZE) if grid[y][x] == 0]


def add_random_tile(grid: Grid) -> dict[str, Any] | None:
    cells = get_empty_cells(grid)
    if not cells:
        return None

    x, y = random.choice(cells)
    value = 2 if random.random() < 0.9 else 4
    grid[y][x] = value
    return {"x": x, "y": y, "value": value}


# =========================================================
# GRILLE — SIMULATION D'UN DEPLACEMENT
# =========================================================

def process_line(line: list[int]) -> tuple[list[int], int, int]:
    values = [v for v in line if v != 0]
    result: list[int] = []
    gained = 0
    merges = 0

    i = 0
    while i < len(values):
        if i + 1 < len(values) and values[i] == values[i + 1]:
            value = values[i] * 2
            result.append(value)
            gained += value
            merges += 1
            i += 2
        else:
            result.append(values[i])
            i += 1

    while len(result) < GRID_SIZE:
        result.append(0)

    return result, gained, merges


def simulate_move(grid: Grid, direction: str) -> tuple[Grid, Grid, int, int] | None:
    old = [row[:] for row in grid]
    next_grid = empty_grid()
    gained = 0
    merges = 0

    if direction == "left":
        for y in range(GRID_SIZE):
            result, g, m = process_line(old[y])
            next_grid[y] = result
            gained += g
            merges += m

    elif direction == "right":
        for y in range(GRID_SIZE):
            result, g, m = process_line(list(reversed(old[y])))
            next_grid[y] = list(reversed(result))
            gained += g
            merges += m

    elif direction == "up":
        for x in range(GRID_SIZE):
            line = [old[y][x] for y in range(GRID_SIZE)]
            result, g, m = process_line(line)
            for y in range(GRID_SIZE):
                next_grid[y][x] = result[y]
            gained += g
            merges += m

    elif direction == "down":
        for x in range(GRID_SIZE):
            line = [old[GRID_SIZE - 1 - y][x] for y in range(GRID_SIZE)]
            result, g, m = process_line(line)
            rev = list(reversed(result))
            for y in range(GRID_SIZE):
                next_grid[y][x] = rev[y]
            gained += g
            merges += m
    else:
        return None

    changed = any(
        old[y][x] != next_grid[y][x]
        for y in range(GRID_SIZE)
        for x in range(GRID_SIZE)
    )

    if not changed:
        return None

    return old, next_grid, gained, merges


def create_movement_tiles(old_grid: Grid, direction: str) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []

    if direction == "left":
        for y in range(GRID_SIZE):
            items = [
                {"value": old_grid[y][x], "x": x}
                for x in range(GRID_SIZE)
                if old_grid[y][x] != 0
            ]
            target = 0
            i = 0
            while i < len(items):
                item = items[i]
                if i + 1 < len(items) and item["value"] == items[i + 1]["value"]:
                    result.append(
                        {
                            "value": item["value"],
                            "fromX": item["x"],
                            "fromY": y,
                            "toX": target,
                            "toY": y,
                        }
                    )
                    result.append(
                        {
                            "value": items[i + 1]["value"],
                            "fromX": items[i + 1]["x"],
                            "fromY": y,
                            "toX": target,
                            "toY": y,
                        }
                    )
                    target += 1
                    i += 2
                else:
                    result.append(
                        {
                            "value": item["value"],
                            "fromX": item["x"],
                            "fromY": y,
                            "toX": target,
                            "toY": y,
                        }
                    )
                    target += 1
                    i += 1
        return result

    for line in range(GRID_SIZE):
        items = []
        for position in range(GRID_SIZE):
            if direction == "right":
                x, y = GRID_SIZE - 1 - position, line
            elif direction == "up":
                x, y = line, position
            else:
                x, y = line, GRID_SIZE - 1 - position

            value = old_grid[y][x]
            if value != 0:
                items.append({"value": value, "x": x, "y": y})

        target = 0
        i = 0
        while i < len(items):
            item = items[i]

            if direction == "right":
                tx, ty = GRID_SIZE - 1 - target, line
            elif direction == "up":
                tx, ty = line, target
            else:
                tx, ty = line, GRID_SIZE - 1 - target

            if i + 1 < len(items) and item["value"] == items[i + 1]["value"]:
                result.append(
                    {
                        "value": item["value"],
                        "fromX": item["x"],
                        "fromY": item["y"],
                        "toX": tx,
                        "toY": ty,
                    }
                )
                result.append(
                    {
                        "value": items[i + 1]["value"],
                        "fromX": items[i + 1]["x"],
                        "fromY": item["y"],
                        "toX": tx,
                        "toY": ty,
                    }
                )
                target += 1
                i += 2
            else:
                result.append(
                    {
                        "value": item["value"],
                        "fromX": item["x"],
                        "fromY": item["y"],
                        "toX": tx,
                        "toY": ty,
                    }
                )
                target += 1
                i += 1

    return result


# =========================================================
# STATS
# =========================================================

def _stats(session: GameSession) -> dict[str, Any]:
    return {
        "score": session.score,
        "combinations": session.combinations,
        "moves_left": session.moves_left,
    }


# =========================================================
# OBJECTIF
# =========================================================

async def check_objective_progress(session: GameSession) -> None:
    if session.status != GameStatus.IN_PROGRESS:
        return

    objective = session.objective
    if objective is None:
        return

    elapsed = time.time() - (session.started_at or time.time())

    if objective.type is ObjectiveType.SCORE:
        success = session.score >= objective.target
    elif objective.type is ObjectiveType.TIME:
        success = elapsed >= objective.target
    else:
        success = session.combinations >= objective.target

    if success:
        await win_game(session)
        return

    if session.moves_left <= 0:
        await lose_game(session, "moves_exhausted")


# =========================================================
# REGLEMENT (settle_game_session)
# =========================================================

async def _settle(session: GameSession, result: str) -> None:
    """Appelle settle_game_session une seule fois, comme pour Memo Pop/Cloud Run."""
    if session.settled:
        return

    if not session.token or not session.user_id:
        return

    session.settled = True

    try:
        await settle_game_session(
            game_token=session.token,
            user_id=str(session.user_id),
            game_name=GAME_NAME,
            result=result,
        )
    except Exception:
        pass


# =========================================================
# CYCLE DE VIE DE LA PARTIE
# =========================================================

async def start_game(session: GameSession) -> None:
    if session.status == GameStatus.IN_PROGRESS:
        await send_error(session, "La partie est déjà en cours.")
        return

    session.grid = empty_grid()
    session.score = 0
    session.combinations = 0
    session.moves_left = INITIAL_MOVES
    session.status = GameStatus.IN_PROGRESS
    session.started_at = time.time()

    spawned = [
        tile
        for tile in (add_random_tile(session.grid), add_random_tile(session.grid))
        if tile
    ]

    await send_event(
        session,
        "game_started",
        {
            "grid": session.grid,
            "spawned": spawned,
            "objective": session.objective.to_dict() if session.objective else None,
            **_stats(session),
        },
    )


async def handle_move(session: GameSession, direction: str) -> None:
    if session.status != GameStatus.IN_PROGRESS:
        return

    if direction not in ("left", "right", "up", "down"):
        await send_error(session, "Direction invalide.")
        return

    simulation = simulate_move(session.grid, direction)
    if simulation is None:
        return

    old, next_grid, gained, merges = simulation

    moving_tiles = create_movement_tiles(old, direction)

    merged_cells = [
        {"x": x, "y": y, "value": next_grid[y][x]}
        for y in range(GRID_SIZE)
        for x in range(GRID_SIZE)
        if next_grid[y][x] > old[y][x] and next_grid[y][x] >= 4
    ]

    session.grid = next_grid
    session.score += gained
    session.combinations += merges
    session.moves_left = max(0, session.moves_left - 1)

    spawned = add_random_tile(session.grid)

    await send_event(
        session,
        "move_result",
        {
            "direction": direction,
            "moving_tiles": moving_tiles,
            "merged": merged_cells,
            "spawned": spawned,
            "grid": session.grid,
            **_stats(session),
        },
    )

    await check_objective_progress(session)


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
        session, "game_over", {"result": "loss", "reason": reason, **_stats(session)}
    )


# =========================================================
# VERIFICATION PERIODIQUE OBJECTIF "TEMPS"
# =========================================================

async def objective_ticker(session: GameSession) -> None:
    try:
        while True:
            await asyncio.sleep(TIME_CHECK_INTERVAL)

            if session.status != GameStatus.IN_PROGRESS:
                continue

            if session.objective is not None and session.objective.type is ObjectiveType.TIME:
                await check_objective_progress(session)
    except asyncio.CancelledError:
        raise


# =========================================================
# ATTENTE ET VALIDATION DU game_session
# =========================================================

async def _wait_for_game_session(user_id: Any) -> GameSession:
    """
    Attend un message game_session {session_id, token} valide et
    retourne une GameSession déjà entièrement validée (token vérifié
    via get_session_by_token : appartenance, jeu correspondant,
    statut encore "pending").

    Remplace complètement l'ancien apply_auth() qui acceptait
    session_id/token sans aucune vérification, que ce soit via query
    string ou message "auth" — les deux étaient une porte ouverte
    pour utiliser un token volé ou fabriqué.
    """
    while True:
        raw = await websocket.receive()

        raw_size = len(raw) if isinstance(raw, (bytes, bytearray)) else len(raw.encode("utf-8"))
        if raw_size > MAX_MESSAGE_SIZE_BYTES:
            await _send_raw_error("Message trop volumineux.")
            continue

        try:
            message = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            await _send_raw_error("Message JSON invalide.")
            continue

        if not isinstance(message, dict):
            await _send_raw_error("Format de message invalide.")
            continue

        if not await check_ws_message_rate(user_id):
            await _send_raw_error("Trop d'actions, ralentis un peu.")
            continue

        event_type = message.get("type")

        if event_type != "game_session":
            await _send_raw_error("Message attendu : type 'game_session'.")
            continue

        session_id = message.get("session_id")
        token = message.get("token")

        if not session_id or not token or not isinstance(session_id, str) or not isinstance(token, str):
            await _send_raw_error("session_id et token sont obligatoires.")
            continue

        redis_session = await get_session_by_token(token)
        if redis_session is None:
            await _send_raw_error("Session de jeu introuvable ou expirée.")
            continue

        if redis_session.get("user_id") != str(user_id):
            await _send_raw_error("Ce token ne vous appartient pas.")
            continue

        if redis_session.get("game_name") != GAME_NAME:
            await _send_raw_error("Ce token n'est pas destiné à ce jeu.")
            continue

        if redis_session.get("status") != "pending":
            await _send_raw_error("Cette session n'est plus disponible.")
            continue

        # Rafraîchit le TTL maintenant que le joueur va réellement
        # commencer à jouer : évite qu'une session reprise après un
        # long moment (popups mise/objectif) expire silencieusement
        # en plein milieu de la partie qui vient de démarrer.
        await touch_game_session(token, user_id)

        session = GameSession(
            session_id=session_id,
            token=token,
            user_id=user_id,
            objective=generate_objective(),
        )

        await send_event(
            session,
            "session_started",
            {
                "session_id": session.session_id,
                "objective": session.objective.to_dict(),
            },
        )

        return session


# =========================================================
# DISPATCH DES MESSAGES CLIENT (post-validation uniquement)
# =========================================================

async def handle_client_message(session: GameSession, raw: str | bytes) -> None:
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

    # ── Anti-replay : toute action qui modifie l'état de la partie
    #    doit présenter un nonce strictement croissant, vérifié et
    #    consommé de manière atomique côté Redis. ──
    if event_type in NONCE_PROTECTED_EVENTS:
        nonce = message.get("nonce")
        if nonce is None:
            await send_error(session, "Le champ 'nonce' est obligatoire.")
            return

        nonce_ok = await verify_and_consume_nonce(session.token, nonce)
        if not nonce_ok:
            await send_error(session, "Nonce invalide ou déjà utilisé.")
            return

    if event_type == "start_game":
        await start_game(session)

    elif event_type == "move":
        direction = message.get("direction")
        if not isinstance(direction, str):
            await send_error(session, "Le champ 'direction' doit être une chaîne.")
            return
        await handle_move(session, direction)

    else:
        # Un second "game_session" tombe ici aussi : la validation
        # n'a lieu qu'une fois par connexion (cf. _wait_for_game_session).
        await send_error(session, f"Type de message inconnu : {event_type!r}")


# =========================================================
# ROUTE WEBSOCKET
# =========================================================

@ws_2048_run_bp.websocket("/ws/2048")
async def game2048_ws() -> None:
    # 1) Authentification réelle du joueur (remplace l'ancienne lecture
    #    de session_id/token en query string, jamais vérifiée).
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

    # 2) Attente bornée dans le temps d'un game_session valide. Aucune
    #    GameSession n'existe tant que le token n'a pas été confirmé
    #    légitime (appartenance, jeu, statut).
    try:
        session = await asyncio.wait_for(
            _wait_for_game_session(user_id), timeout=GAME_SESSION_TIMEOUT_SECONDS
        )
    except asyncio.TimeoutError:
        await _send_raw_error("Délai dépassé, session non liée.")
        return

    SESSIONS[session.session_id] = session

    ticker_task = asyncio.create_task(objective_ticker(session))

    try:
        while True:
            raw = await websocket.receive()

            if not await check_ws_message_rate(user_id):
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "Trop d'actions, ralentis un peu.",
                }))
                continue

            await handle_client_message(session, raw)
    except asyncio.CancelledError:
        raise
    finally:
        ticker_task.cancel()
        SESSIONS.pop(session.session_id, None)