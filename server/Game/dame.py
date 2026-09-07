"""
dames_server.py

Backend Quart (async, WebSocket) pour le jeu de Dames contre l'IA.

Porte côté serveur toute la logique qui vivait dans le composant React :
génération du plateau, règles de déplacement/capture (y compris les
prises obligatoires et les chaînes de prises), promotion en dame, IA
(minimax + élagage alpha-bêta), détection de victoire/défaite. Le
client ne fait plus que dessiner le plateau reçu, gérer la sélection
visuelle à partir des coups légaux fournis par le serveur, et envoyer
des intentions ("je joue de (r,c) vers (r,c)").

Contrairement au memory game / Cloud Run / 2048, ce jeu n'a pas de
système d'objectifs (score/temps/etc.) — c'est une partie de dames
classique : victoire, défaite, ou blocage. Il n'y a donc rien à
générer de ce côté-là.

Volontairement HORS SCOPE ici : la mise et le solde utilisateur — les
popups et la logique de mise restent group côté client, inchangés, en
attendant d'être branchées sur ce backend dans une itération future.

Lancement (dev) :
    hypercorn dames_server:app --bind 0.0.0.0:5003
"""

from __future__ import annotations

import asyncio
import json
import random
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Literal

from quart import websocket, Blueprint



# =========================================================
# CONFIGURATION
# =========================================================

BOARD_SIZE = 8
AI_DEPTH = 4
AI_STEP_DELAY = 0.38   # délai avant le premier coup de l'IA (identique à l'original)
AI_CHAIN_DELAY = 0.40  # délai entre deux prises enchaînées de l'IA


Color = Literal["light", "dark"]


ws_dame_bp = Blueprint("ws_dame_bp", __name__)

# =========================================================
# TYPES DE PLATEAU
# =========================================================

@dataclass
class Piece:
    color: Color
    king: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {"color": self.color, "king": self.king}


Board = list[list[Piece | None]]


@dataclass(frozen=True)
class Pos:
    r: int
    c: int

    def to_dict(self) -> dict[str, int]:
        return {"r": self.r, "c": self.c}


@dataclass(frozen=True)
class Move:
    frm: Pos
    to: Pos
    capture: Pos | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "from": self.frm.to_dict(),
            "to": self.to.to_dict(),
            "capture": self.capture.to_dict() if self.capture else None,
        }


def clone_board(board: Board) -> Board:
    return [row[:] for row in board]


def in_bounds(r: int, c: int) -> bool:
    return 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE


def fresh_board() -> Board:
    board: Board = [[None] * BOARD_SIZE for _ in range(BOARD_SIZE)]
    for r in range(3):
        for c in range(BOARD_SIZE):
            if (r + c) % 2 == 1:
                board[r][c] = Piece(color="dark")
    for r in range(5, 8):
        for c in range(BOARD_SIZE):
            if (r + c) % 2 == 1:
                board[r][c] = Piece(color="light")
    return board


def serialize_board(board: Board) -> list[list[dict[str, Any] | None]]:
    return [[cell.to_dict() if cell else None for cell in row] for row in board]


# =========================================================
# REGLES DE DEPLACEMENT
# =========================================================

def piece_moves(board: Board, r: int, c: int) -> tuple[list[Move], list[Move]]:
    p = board[r][c]
    if p is None:
        return [], []

    if p.king:
        dirs = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
    else:
        dirs = [(-1, -1), (-1, 1)] if p.color == "light" else [(1, -1), (1, 1)]

    steps: list[Move] = []
    captures: list[Move] = []

    for dr, dc in dirs:
        nr, nc = r + dr, c + dc
        if not in_bounds(nr, nc):
            continue

        occ = board[nr][nc]
        if occ is None:
            steps.append(Move(frm=Pos(r, c), to=Pos(nr, nc), capture=None))
        elif occ.color != p.color:
            jr, jc = nr + dr, nc + dc
            if in_bounds(jr, jc) and board[jr][jc] is None:
                captures.append(Move(frm=Pos(r, c), to=Pos(jr, jc), capture=Pos(nr, nc)))

    return steps, captures


def get_all_moves(board: Board, color: Color) -> list[Move]:
    all_steps: list[Move] = []
    all_captures: list[Move] = []

    for r in range(BOARD_SIZE):
        for c in range(BOARD_SIZE):
            p = board[r][c]
            if p is not None and p.color == color:
                steps, captures = piece_moves(board, r, c)
                all_steps.extend(steps)
                all_captures.extend(captures)

    return all_captures if all_captures else all_steps


def get_forced_continuation(board: Board, r: int, c: int) -> list[Move]:
    return piece_moves(board, r, c)[1]


@dataclass
class ApplyResult:
    board: Board
    captured: bool
    promoted: bool
    landing: Pos


def apply_move(board: Board, move: Move) -> ApplyResult:
    nb = clone_board(board)
    piece = nb[move.frm.r][move.frm.c]
    assert piece is not None

    nb[move.frm.r][move.frm.c] = None
    if move.capture:
        nb[move.capture.r][move.capture.c] = None

    promoted = False
    if not piece.king:
        if piece.color == "light" and move.to.r == 0:
            piece = Piece(color=piece.color, king=True)
            promoted = True
        elif piece.color == "dark" and move.to.r == 7:
            piece = Piece(color=piece.color, king=True)
            promoted = True

    nb[move.to.r][move.to.c] = piece

    return ApplyResult(board=nb, captured=move.capture is not None, promoted=promoted, landing=move.to)


# =========================================================
# IA — MINIMAX + ELAGAGE ALPHA-BETA
# =========================================================

def evaluate(board: Board) -> float:
    score = 0.0
    for r in range(BOARD_SIZE):
        for c in range(BOARD_SIZE):
            p = board[r][c]
            if p is None:
                continue
            val = 1.7 if p.king else 1.0
            adv = r if p.color == "dark" else (7 - r)
            val += adv * 0.03
            if 2 <= c <= 5:
                val += 0.05
            score += val if p.color == "dark" else -val
    return score


def search(board: Board, color: Color, depth: int, alpha: float, beta: float) -> float:
    moves = get_all_moves(board, color)
    if not moves:
        return -999.0 if color == "dark" else 999.0
    if depth <= 0:
        return evaluate(board)

    is_max = color == "dark"
    best = -float("inf") if is_max else float("inf")

    for move in moves:
        res = apply_move(board, move)

        if res.captured and not res.promoted and get_forced_continuation(res.board, res.landing.r, res.landing.c):
            value = search(res.board, color, depth, alpha, beta)
        else:
            nxt: Color = "light" if color == "dark" else "dark"
            value = search(res.board, nxt, depth - 1, alpha, beta)

        if is_max:
            best = max(best, value)
            alpha = max(alpha, value)
        else:
            best = min(best, value)
            beta = min(beta, value)

        if beta <= alpha:
            break

    return best


def choose_best_move(moves_pool: list[Move], board: Board, depth: int) -> Move:
    best_val = -float("inf")
    best_moves: list[Move] = []

    for move in moves_pool:
        res = apply_move(board, move)

        if res.captured and not res.promoted and get_forced_continuation(res.board, res.landing.r, res.landing.c):
            value = search(res.board, "dark", depth, -float("inf"), float("inf"))
        else:
            value = search(res.board, "light", depth - 1, -float("inf"), float("inf"))

        if value > best_val:
            best_val = value
            best_moves = [move]
        elif value == best_val:
            best_moves.append(move)

    return random.choice(best_moves)


# =========================================================
# ETAT DE LA PARTIE
# =========================================================

class GameStatus(str, Enum):
    AWAITING_START = "awaiting_start"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


@dataclass
class GameSession:
    session_id: str

    board: Board = field(default_factory=fresh_board)
    turn: Color = "light"
    status: GameStatus = GameStatus.AWAITING_START

    pending_continuation: Pos | None = None
    ai_task: asyncio.Task | None = None

    event_log: list[dict[str, Any]] = field(default_factory=list)

    def log_event(self, direction: str, event_type: str, payload: dict[str, Any]) -> None:
        self.event_log.append(
            {"t": time.time(), "direction": direction, "type": event_type, "payload": payload}
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


# =========================================================
# STATS
# =========================================================

def _counts(board: Board) -> dict[str, int]:
    light = sum(1 for row in board for p in row if p and p.color == "light")
    dark = sum(1 for row in board for p in row if p and p.color == "dark")
    return {"light_count": light, "dark_count": dark}


def _legal_moves_for_human(session: GameSession) -> list[Move]:
    if session.pending_continuation is not None:
        pos = session.pending_continuation
        return get_forced_continuation(session.board, pos.r, pos.c)
    return get_all_moves(session.board, "light")


async def _send_turn_update(session: GameSession) -> None:
    legal = _legal_moves_for_human(session) if session.turn == "light" else []

    await send_event(
        session,
        "turn_update",
        {
            "turn": session.turn,
            "legal_moves": [m.to_dict() for m in legal],
            "forced_continuation": session.pending_continuation.to_dict() if session.pending_continuation else None,
            **_counts(session.board),
        },
    )


# =========================================================
# CYCLE DE VIE DE LA PARTIE
# =========================================================

async def start_game(session: GameSession) -> None:
    if session.ai_task is not None:
        session.ai_task.cancel()
        session.ai_task = None

    session.board = fresh_board()
    session.turn = "light"
    session.status = GameStatus.IN_PROGRESS
    session.pending_continuation = None

    await send_event(
        session,
        "game_started",
        {
            "board": serialize_board(session.board),
            "turn": session.turn,
            "legal_moves": [m.to_dict() for m in _legal_moves_for_human(session)],
            **_counts(session.board),
        },
    )


async def finish_game(session: GameSession, winner: Color) -> None:
    if session.status == GameStatus.FINISHED:
        return

    session.status = GameStatus.FINISHED

    if session.ai_task is not None:
        session.ai_task.cancel()
        session.ai_task = None

    result = "win" if winner == "light" else "lose"
    await send_event(session, "game_over", {"result": result, "winner": winner})


async def handle_move(session: GameSession, frm: Pos, to: Pos) -> None:
    if session.status != GameStatus.IN_PROGRESS or session.turn != "light":
        await send_error(session, "Ce n'est pas votre tour.")
        return

    legal = _legal_moves_for_human(session)
    move = next((m for m in legal if m.frm == frm and m.to == to), None)

    if move is None:
        await send_error(session, "Coup illégal.")
        return

    res = apply_move(session.board, move)
    session.board = res.board

    await send_event(
        session,
        "move_applied",
        {
            "mover": "light",
            "move": move.to_dict(),
            "captured": res.captured,
            "promoted": res.promoted,
            "board": serialize_board(session.board),
        },
    )

    if res.captured and not res.promoted:
        further = get_forced_continuation(session.board, res.landing.r, res.landing.c)
        if further:
            session.pending_continuation = res.landing
            await _send_turn_update(session)
            return

    session.pending_continuation = None

    dark_moves = get_all_moves(session.board, "dark")
    if not dark_moves:
        await finish_game(session, "light")
        return

    session.turn = "dark"
    await _send_turn_update(session)

    session.ai_task = asyncio.create_task(run_ai_turn(session))


async def run_ai_turn(session: GameSession, continuation: Pos | None = None) -> None:
    try:
        if continuation is None:
            await asyncio.sleep(AI_STEP_DELAY)
        else:
            await asyncio.sleep(AI_CHAIN_DELAY)

        if session.status != GameStatus.IN_PROGRESS:
            return

        moves_pool = get_forced_continuation(session.board, continuation.r, continuation.c) if continuation else get_all_moves(session.board, "dark")

        if not moves_pool:
            session.turn = "light"
            await _send_turn_update(session)
            return

        move = await asyncio.to_thread(choose_best_move, moves_pool, session.board, AI_DEPTH)

        res = apply_move(session.board, move)
        session.board = res.board

        await send_event(
            session,
            "move_applied",
            {
                "mover": "dark",
                "move": move.to_dict(),
                "captured": res.captured,
                "promoted": res.promoted,
                "board": serialize_board(session.board),
            },
        )

        if res.captured and not res.promoted:
            further = get_forced_continuation(session.board, res.landing.r, res.landing.c)
            if further:
                session.ai_task = asyncio.create_task(run_ai_turn(session, res.landing))
                return

        light_moves = get_all_moves(session.board, "light")
        if not light_moves:
            await finish_game(session, "dark")
            return

        session.turn = "light"
        session.pending_continuation = None
        await _send_turn_update(session)

    except asyncio.CancelledError:
        raise


# =========================================================
# DISPATCH DES MESSAGES CLIENT
# =========================================================

def _parse_pos(data: Any) -> Pos | None:
    if not isinstance(data, dict):
        return None
    r, c = data.get("r"), data.get("c")
    if not isinstance(r, int) or not isinstance(c, int) or not in_bounds(r, c):
        return None
    return Pos(r, c)


async def handle_client_message(session: GameSession, raw: str | bytes) -> None:
    try:
        message = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        await send_error(session, "Message JSON invalide.")
        return

    event_type = message.get("type")
    session.log_event("in", event_type or "unknown", message)

    if event_type == "start_game":
        await start_game(session)

    elif event_type == "move":
        frm = _parse_pos(message.get("from"))
        to = _parse_pos(message.get("to"))
        if frm is None or to is None:
            await send_error(session, "Coup mal formé (from/to requis, {r,c} valides).")
            return
        await handle_move(session, frm, to)

    else:
        await send_error(session, f"Type de message inconnu : {event_type!r}")


# =========================================================
# ROUTE WEBSOCKET
# =========================================================

@ws_dame_bp.websocket("/ws/dames")
async def dames_ws() -> None:
    session = GameSession(session_id=str(uuid.uuid4()))
    SESSIONS[session.session_id] = session

    await send_event(session, "session_started", {"session_id": session.session_id})

    try:
        while True:
            raw = await websocket.receive()
            await handle_client_message(session, raw)
    except asyncio.CancelledError:
        raise
    finally:
        if session.ai_task is not None:
            session.ai_task.cancel()
        SESSIONS.pop(session.session_id, None)

