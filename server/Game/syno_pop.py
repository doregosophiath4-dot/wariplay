from quart import Blueprint, websocket
from security import authenticate_websocket, check_ws_message_rate
import json
from redis_session import get_redis
from datetime import timedelta
from db import get_pool
import uuid
import time
import traceback
from game_helpers import log_game_result
import random
import os
import aiofiles

ws_syno_bp = Blueprint("ws_syno_bp", __name__)
SYNO_SESSION_PREFIX = "syno_session:"
SYNO_SESSION_TTL = 60 * 20  # 20 minutes



WORDS_PATH = os.path.join('html 1', 'lang', 'words.json')

# Charger et mélanger les mots
async def load_words(limit=20):
    if not os.path.exists(WORDS_PATH):
        raise FileNotFoundError(f"Le fichier {WORDS_PATH} n'existe pas.")

    async with aiofiles.open(WORDS_PATH, 'r', encoding='utf-8') as f:
        content = await f.read()
        words = json.loads(content)

    random.shuffle(words)
    return words[:limit]

# Générer l'objectif
def generate_syno_objective():
    total_questions = 20
    questions_to_answer = random.randint(5, total_questions)
    objective_type = random.choice([1, 2])

    obj = {
        "type": objective_type,
        "text": "",
        "total_questions": total_questions,
        "questions_to_answer": questions_to_answer
    }

    if objective_type == 1:
        obj["text"] = f"Réponds à {questions_to_answer} questions sur {total_questions}"
    else:
        allowed_errors = random.randint(2, 4)
        obj["allowed_errors"] = allowed_errors
        obj["text"] = (
            f"Réponds à {questions_to_answer} questions sur {total_questions} "
            f"avec seulement {allowed_errors} erreurs autorisées"
        )

    return obj


async def create_syno_session(game_session_id: str, session_data: dict):
    redis = await get_redis()
    # Les 'set' ne sont pas sérialisables en JSON natif — on convertit en liste
    data_to_store = {**session_data, "answered_questions": list(session_data["answered_questions"])}
    await redis.setex(
        f"{SYNO_SESSION_PREFIX}{game_session_id}",
        timedelta(seconds=SYNO_SESSION_TTL),
        json.dumps(data_to_store),
    )


async def get_syno_session(game_session_id: str) -> dict | None:
    redis = await get_redis()
    raw = await redis.get(f"{SYNO_SESSION_PREFIX}{game_session_id}")
    if not raw:
        return None
    data = json.loads(raw)
    data["answered_questions"] = set(data["answered_questions"])
    return data


async def update_syno_session(game_session_id: str, session_data: dict):
    """Réécrit la session complète et RENOUVELLE le TTL à 20 min —
    tant que le joueur est actif, sa session ne doit pas expirer en plein jeu."""
    await create_syno_session(game_session_id, session_data)


async def delete_syno_session(game_session_id: str):
    redis = await get_redis()
    await redis.delete(f"{SYNO_SESSION_PREFIX}{game_session_id}")



@ws_syno_bp.websocket('/ws/ws_syno')
async def ws_syno():
    game_session_id = None
    try:
        
        user_id = await authenticate_websocket()
        
        if not user_id:
            try:
                await websocket.send(json.dumps({"type": "error", "message": "Authentification requise"}))
            except:
                pass
            return

        init_data = await websocket.receive_json()

        if not isinstance(init_data, dict):
            await websocket.send(json.dumps({"error": "Message initial invalide"}))
            return

        mise = float(init_data.get("mise", 0))

        game_session_id = str(uuid.uuid4())

        words_full = await load_words(20)
        objective = generate_syno_objective()
        errors_remaining = objective.get("allowed_errors", 0)
        questions_to_answer = objective["questions_to_answer"]
        score = 0
        gains_par_question = (mise * 1.5) / questions_to_answer
        gains_actuels = 0.0

        # Stockage de la session dans Redis (TTL 20 min, auto-nettoyage garanti)
        session_data = {
            "user_id": user_id,
            "mise": mise,
            "gains_actuels": gains_actuels,
            "score": score,
            "errors_remaining": errors_remaining,
            "objective": objective,
            "answered_questions": set(),
            "timestamp": time.time()
        }
        await create_syno_session(game_session_id, session_data)

        words_for_client = [
            {"id": idx, "word": w["word"], "options": w["options"]}
            for idx, w in enumerate(words_full)
        ]

        await websocket.send(json.dumps({
            "objective": objective,
            "words": words_for_client,
            "game_session_id": game_session_id
        }))

        # 2️⃣ Boucle pour recevoir les réponses
        for idx, word_data in enumerate(words_full):
            data = await websocket.receive_json()

            if not isinstance(data, dict):
                await websocket.send(json.dumps({"error": "Message invalide"}))
                continue

            if not await check_ws_message_rate(user_id):
                await websocket.send(json.dumps({"error": "Trop d'actions, ralentis un peu."}))
                continue

            client_session_id = data.get("game_session_id")
            if client_session_id != game_session_id:
                await websocket.send(json.dumps({"error": "Session invalide"}))
                return

            word_id = data.get("word_id")
            selection = data.get("selection")

            session_data = await get_syno_session(game_session_id)
            if session_data is None:
                # Session expirée (20 min écoulées) ou déjà supprimée
                await websocket.send(json.dumps({"error": "Session expirée, veuillez recommencer"}))
                return

            if word_id in session_data["answered_questions"]:
                await websocket.send(json.dumps({"error": "Question déjà répondue"}))
                continue

            session_data["answered_questions"].add(word_id)

            correct_word = words_full[word_id]["correct"]
            if selection == correct_word:
                correct = True
                session_data["score"] += 1
                session_data["gains_actuels"] += gains_par_question
            else:
                correct = False
                if objective["type"] == 2:
                    session_data["errors_remaining"] -= 1

            await update_syno_session(game_session_id, session_data)

            await websocket.send(json.dumps({
                "word_id": word_id,
                "correct": correct,
                "score": session_data["score"],
                "gains_actuels": round(session_data["gains_actuels"], 2),
                "errors_remaining": session_data["errors_remaining"]
            }))

            if objective["type"] == 2 and session_data["errors_remaining"] <= 0:
                await websocket.send(json.dumps({"game_over": True, "reason": "Trop d'erreurs", "gains": 0}))
                await log_game_result(user_id, False, mise, "syno_pop")
                await delete_syno_session(game_session_id)
                return

            if session_data["score"] >= questions_to_answer:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                            (round(session_data["gains_actuels"], 2), user_id)
                        )
                        await conn.commit()

                gains_final = round(session_data["gains_actuels"], 2)
                
                await websocket.send(json.dumps({
                    "game_over": True,
                    "reason": "Objectif atteint",
                    "gains": gains_final
                }))
                
                await log_game_result(user_id, True, gains_final, "syno_pop")
                await delete_syno_session(game_session_id)
                return

        await websocket.send(json.dumps({
            "game_over": True,
            "reason": "Toutes les questions terminées mais objectif non rempli",
            "gains": 0
        }))
        
        await log_game_result(user_id, False, 0.0, "syno_pop")
        await delete_syno_session(game_session_id)

    except Exception as e:
        traceback.print_exc()
        try:
            await websocket.send(json.dumps({"error": str(e)}))
        except Exception:
            pass
        if game_session_id:
            await delete_syno_session(game_session_id)