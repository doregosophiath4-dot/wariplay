"""
memory_game_server.py

Gère uniquement la logique de jeu (grille, paires, timer, objectif).
Après authentification, le client a un délai (GAME_SESSION_TIMEOUT_SECONDS)
pour envoyer game_session {session_id, token} issus de /api/cherif. La
GameSession n'est créée qu'une fois ce token validé — pas d'id
temporaire à remplacer ensuite.
À la fin du jeu → appelle settle_game_session.
Ne crée AUCUNE session de mise (déjà fait ailleurs, cf. /api/cherif
qui débite la mise et appelle create_game_session).

Sécurité :
- Achat du jeu : vérifié via check_game_exists avant même d'accepter
  la connexion (après auth), pour éviter qu'un user non-possesseur du
  jeu puisse initier une session de jeu.
- Ownership check : avant toute création d'état de jeu, on vérifie
  via get_session_by_token que le token fourni appartient bien au
  user_id authentifié sur ce WebSocket, et qu'il correspond à ce jeu.
- Anti-replay : chaque action qui modifie l'état du jeu (start_game,
  flip_card) doit être accompagnée d'un nonce strictement croissant,
  vérifié et consommé de manière atomique via verify_and_consume_nonce.
- Rate limiting : chaque message entrant (y compris pendant l'attente
  de game_session) est soumis à check_ws_message_rate.
- Limite de taille des messages entrants pour éviter les abus basiques.
"""

from __future__ import annotations

import asyncio
import json
import random
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from security import authenticate_websocket, check_ws_message_rate
from game_session import settle_game_session, verify_and_consume_nonce, get_session_by_token
from game_helpers import check_game_exists, decrement_game_life
from quart import websocket, Blueprint

ws_memo_pop_bp = Blueprint("ws_memo_pop", __name__)

# =========================================================
# CONFIGURATION
# =========================================================

TOTAL_CARDS = 24
PAIRS = 12
START_TIME_SECONDS = 90
TICK_INTERVAL_SECONDS = 1.0

MATCH_REVEAL_DELAY = 0.65
MISMATCH_REVEAL_DELAY = 0.80

CARD_VALUES = [f"memo_{i}" for i in range(1, PAIRS + 1)]

GAME_NAME = "Memo Pop"

# Types de messages qui modifient l'état du jeu et doivent donc être
# protégés par un nonce (anti-replay).
NONCE_PROTECTED_EVENTS = ("start_game", "flip_card")

# Taille max acceptée pour un message entrant (en octets).
MAX_MESSAGE_SIZE_BYTES = 4096

# Délai maximum laissé au client, après auth_success, pour envoyer un
# game_session valide. Passé ce délai, la connexion est fermée plutôt
# que de rester ouverte indéfiniment sans jamais démarrer de partie.
GAME_SESSION_TIMEOUT_SECONDS = 15


class ObjectiveType(str, Enum):
    TIME = "time"
    ERRORS = "errors"
    MOVES = "moves"


@dataclass
class Objective:
    type: ObjectiveType
    value: int

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "value": self.value}


def generate_objective() -> Objective:
    objective_type = random.choice(list(ObjectiveType))
    if objective_type is ObjectiveType.TIME:
        value = random.choice([30, 40, 50, 60, 70, 80])
    elif objective_type is ObjectiveType.ERRORS:
        value = random.choice([1, 2, 3, 4, 5])
    else:
        value = random.choice([18, 20, 22, 24, 26, 28])
    return Objective(type=objective_type, value=value)


class GameStatus(str, Enum):
    AWAITING_START = "awaiting_start"
    IN_PROGRESS = "in_progress"
    WON = "won"
    LOST = "lost"


@dataclass
class CardState:
    index: int
    value: str
    flipped: bool = False
    matched: bool = False


@dataclass
class GameSession:
    # session_id = celui de game_session.py dès la création : plus
    # d'id temporaire à remplacer, puisque l'objet n'existe qu'une
    # fois le token validé (cf. _wait_for_game_session).
    session_id: str
    token: str
    user_id: Any
    objective: Objective | None = None
    status: GameStatus = GameStatus.AWAITING_START
    cards: list[CardState] = field(default_factory=list)
    moves: int = 0
    errors: int = 0
    score: int = 0
    matched_pairs: int = 0
    remaining_time: int = START_TIME_SECONDS
    started_at: float | None = None
    first_index: int | None = None
    second_index: int | None = None
    lock_board: bool = True
    event_log: list[dict[str, Any]] = field(default_factory=list)
    settled: bool = False          # pour éviter double settle

    def generate_grid(self) -> None:
        values = CARD_VALUES * 2
        random.shuffle(values)
        self.cards = [CardState(index=i, value=v) for i, v in enumerate(values)]

    def public_grid(self) -> list[dict[str, Any]]:
        return [
            {
                "index": card.index,
                "flipped": card.flipped,
                "matched": card.matched,
                "value": card.value if (card.flipped or card.matched) else None,
            }
            for card in self.cards
        ]

    def stats(self) -> dict[str, Any]:
        return {
            "moves": self.moves,
            "errors": self.errors,
            "score": self.score,
            "matched_pairs": self.matched_pairs,
            "remaining_time": self.remaining_time,
        }

    def log_event(self, direction: str, event_type: str, payload: dict[str, Any]) -> None:
        self.event_log.append({
            "t": time.time(),
            "direction": direction,
            "type": event_type,
            "payload": payload,
        })


SESSIONS: dict[str, GameSession] = {}


async def send_event(session: GameSession, event_type: str, payload: dict[str, Any] | None = None) -> None:
    payload = payload or {}
    session.log_event("out", event_type, payload)
    await websocket.send(json.dumps({"type": event_type, **payload}))


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


def _used_time(session: GameSession) -> int:
    return START_TIME_SECONDS - session.remaining_time


async def start_game(session: GameSession) -> None:
    if session.status == GameStatus.IN_PROGRESS:
        await send_error(session, "La partie est déjà en cours.")
        return

    if session.status != GameStatus.AWAITING_START:
        await send_error(session, "Session non prête.")
        return

    session.generate_grid()
    session.status = GameStatus.IN_PROGRESS
    session.moves = 0
    session.errors = 0
    session.score = 0
    session.matched_pairs = 0
    session.remaining_time = START_TIME_SECONDS
    session.started_at = time.time()
    session.first_index = None
    session.second_index = None
    session.lock_board = False

    await send_event(
        session,
        "game_started",
        {
            "grid": session.public_grid(),
            "objective": session.objective.to_dict(),
            **session.stats(),
        },
    )


async def flip_card(session: GameSession, index: int) -> None:
    if session.status != GameStatus.IN_PROGRESS:
        await send_error(session, "La partie n'est pas en cours.")
        return
    if session.lock_board:
        return
    if not (0 <= index < TOTAL_CARDS):
        await send_error(session, "Index de carte invalide.")
        return

    card = session.cards[index]
    if card.matched or card.flipped or index == session.first_index:
        return

    card.flipped = True

    if session.first_index is None:
        session.first_index = index
        await send_event(session, "card_flipped", {"index": index, "value": card.value})
        return

    session.second_index = index
    session.moves += 1
    session.lock_board = True

    await send_event(session, "card_flipped", {"index": index, "value": card.value})
    await _resolve_pair(session)


async def _resolve_pair(session: GameSession) -> None:
    first = session.cards[session.first_index]  # type: ignore[index]
    second = session.cards[session.second_index]  # type: ignore[index]
    is_match = first.value == second.value

    if is_match:
        first.matched = True
        second.matched = True
        session.matched_pairs += 1
        session.score += 100
        await send_event(
            session,
            "match_result",
            {
                "matched": True,
                "first_index": first.index,
                "second_index": second.index,
                **session.stats(),
            },
        )
        await asyncio.sleep(MATCH_REVEAL_DELAY)
    else:
        session.score = max(0, session.score - 10)
        session.errors += 1
        await send_event(
            session,
            "match_result",
            {
                "matched": False,
                "first_index": first.index,
                "second_index": second.index,
                **session.stats(),
            },
        )
        await asyncio.sleep(MISMATCH_REVEAL_DELAY)
        first.flipped = False
        second.flipped = False

    session.first_index = None
    session.second_index = None
    session.lock_board = False

    if session.status != GameStatus.IN_PROGRESS:
        return
    if await _check_objective_failure(session):
        return
    if session.matched_pairs == PAIRS:
        await finish_game(session)


async def _check_objective_failure(session: GameSession) -> bool:
    objective = session.objective
    if objective is None:
        return False
    if objective.type is ObjectiveType.MOVES and session.moves > objective.value:
        await lose_game(session, "moves_exceeded")
        return True
    if objective.type is ObjectiveType.ERRORS and session.errors >= objective.value:
        await lose_game(session, "errors_exceeded")
        return True
    return False


async def finish_game(session: GameSession) -> None:
    objective = session.objective
    assert objective is not None
    used_time = _used_time(session)

    if objective.type is ObjectiveType.TIME:
        success = used_time <= objective.value
    elif objective.type is ObjectiveType.ERRORS:
        success = session.errors < objective.value
    else:
        success = session.moves <= objective.value

    if success:
        await win_game(session)
    else:
        await lose_game(session, "objective_not_met")


async def _settle(session: GameSession, result: str) -> None:
    """Appelle settle_game_session une seule fois."""
    if session.settled:
        return

    if not session.token or not session.user_id:
        return

    session.settled = True

    try:
        settle_result = await settle_game_session(
            game_token=session.token,
            user_id=str(session.user_id),
            game_name=GAME_NAME,
            result=result,
        )
        print("[MEMO] settle_game_session résultat :", settle_result)
    except Exception as e:
        print("[MEMO] Erreur settle_game_session :", e)


async def win_game(session: GameSession) -> None:
    if session.status != GameStatus.IN_PROGRESS:
        return

    session.status = GameStatus.WON
    await _settle(session, "win")
    await send_event(
        session,
        "game_over",
        {"result": "win", "reason": "all_pairs_matched", **session.stats()},
    )


async def lose_game(session: GameSession, reason: str) -> None:
    if session.status != GameStatus.IN_PROGRESS:
        return

    session.status = GameStatus.LOST
    await _settle(session, "loss")
    await send_event(
        session,
        "game_over",
        {"result": "loss", "reason": reason, **session.stats()},
    )


async def ticker_loop(session: GameSession) -> None:
    try:
        while True:
            await asyncio.sleep(TICK_INTERVAL_SECONDS)
            if session.status != GameStatus.IN_PROGRESS:
                continue

            session.remaining_time -= 1
            objective = session.objective
            used_time = _used_time(session)

            if objective is not None and objective.type is ObjectiveType.TIME and used_time > objective.value:
                await lose_game(session, "time_exceeded")
                continue
            if session.remaining_time <= 0:
                session.remaining_time = 0
                await lose_game(session, "time_up")
                continue

            await send_event(session, "tick", session.stats())
    except asyncio.CancelledError:
        raise


# =========================================================
# ATTENTE ET VALIDATION DU game_session
# =========================================================

async def _wait_for_game_session(user_id: Any) -> GameSession:
    """
    Attend un message game_session valide et retourne une GameSession
    déjà entièrement validée (token vérifié, appartenance confirmée,
    destinée à ce jeu, statut encore pending).

    Aucun objet GameSession n'existe avant que le token soit confirmé
    légitime : plus d'id temporaire à créer puis remplacer, et plus
    besoin de gérer un doublon de game_session après coup (il ne peut
    plus y en avoir puisque cette phase ne se produit qu'une fois).
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

        # Tout est validé : on crée l'unique GameSession de cette
        # connexion, directement avec le bon session_id.
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

    # ── Anti-replay : toute action qui modifie l'état du jeu doit
    #    présenter un nonce strictement croissant, vérifié et consommé
    #    de manière atomique côté Redis (voir game_session.py). ──
    if event_type in NONCE_PROTECTED_EVENTS:
        nonce = message.get("nonce")
        if nonce is None:
            await send_error(session, "Le champ 'nonce' est obligatoire.")
            return

        nonce_ok = await verify_and_consume_nonce(session.token, nonce)
        if not nonce_ok:
            await send_error(session, "Nonce invalide ou déjà utilisé.")
            return

    # ── Messages normaux ──
    if event_type == "start_game":
        await start_game(session)
    elif event_type == "flip_card":
        index = message.get("index")
        if not isinstance(index, int):
            await send_error(session, "Le champ 'index' doit être un entier.")
            return
        await flip_card(session, index)
    else:
        # Un second "game_session" tombe ici aussi : la validation
        # n'a lieu qu'une fois par connexion (cf. _wait_for_game_session).
        await send_error(session, f"Type de message inconnu : {event_type!r}")


@ws_memo_pop_bp.websocket("/ws/memory")
async def memory_ws() -> None:
    # 1. authenticate_websocket consomme le PREMIER message (auth)
    user_id = await authenticate_websocket()

    if not user_id:
        try:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Authentification requise"
            }))
        except Exception:
            pass
        return

    # 1bis. Vérifie que l'utilisateur possède bien le jeu avant de
    # continuer — sinon inutile d'aller plus loin (game_session, etc.)
    game_name = "Memo Pop"
    game_exists = await check_game_exists(user_id, game_name)

    if not game_exists:
        await websocket.send_json({
            "error": f"Veillez Acheter le Jeu '{game_name}' pour y jouer ",
            "action": "game_not_found"
        })
        await websocket.close(code=4000, reason="Veillez Acheter Le Jeu Pour y Jouer ")
        return

    result = await decrement_game_life(user_id, "Memo Pop")

    if not result["success"]:
        await websocket.send_json({
            "type": "ERROR",
            "message": result["error"]
        })
        return

    # On informe le client que l'auth est OK
    await websocket.send(json.dumps({"type": "auth_success"}))

    # 2. Attente bornée dans le temps d'un game_session valide. Aucune
    #    GameSession n'existe tant que le token n'a pas été confirmé.
    try:
        session = await asyncio.wait_for(
            _wait_for_game_session(user_id), timeout=GAME_SESSION_TIMEOUT_SECONDS
        )
    except asyncio.TimeoutError:
        await _send_raw_error("Délai dépassé, session non liée.")
        return

    SESSIONS[session.session_id] = session

    ticker_task = asyncio.create_task(ticker_loop(session))

    try:
        while True:
            raw = await websocket.receive()

            # ── Rate limiting : on borne le nombre d'actions traitées
            #    par unité de temps pour ce user, avant même de parser
            #    ou dispatcher le message. ──
            if not await check_ws_message_rate(user_id):
                await websocket.send_json({
                    "success": False,
                    "message": "Trop d'actions, ralentis un peu."
                })
                continue

            await handle_client_message(session, raw)
    except asyncio.CancelledError:
        raise
    finally:
        ticker_task.cancel()
        SESSIONS.pop(session.session_id, None)