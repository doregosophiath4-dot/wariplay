from quart import Blueprint, jsonify, request, g, redirect
from security import require_origin, login_required, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_jwt, require_ip_score, update_fingerprint_if_changed
from db import get_pool
from redis_session import session
from datetime import datetime
import functools
from typing import Callable
import os
import hmac
import hashlib
import secrets
import httpx
from datetime import datetime, timedelta,  timezone
from helper import FRONTEND_URL




def track_depot():
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            response = await func(*args, **kwargs)

            if getattr(g, "depot_success", False):
                montant = getattr(g, "depot_montant", None)
                user_id = getattr(g, "depot_user_id", None)

                if montant and user_id:
                    try:
                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cursor:
                                # today_stats (une ligne par jour)
                                await cursor.execute("""
                                    INSERT INTO today_stats (stat_date, nombre_depots, montant_depots)
                                    VALUES (CURDATE(), 1, %s)
                                    ON DUPLICATE KEY UPDATE
                                        nombre_depots  = nombre_depots + 1,
                                        montant_depots = montant_depots + %s
                                """, (montant, montant))

                                # user_stats (une ligne par user_id)
                                await cursor.execute("""
                                    INSERT INTO user_stats (user_id, nombre_depots, montant_depots)
                                    VALUES (%s, 1, %s)
                                    ON DUPLICATE KEY UPDATE
                                        nombre_depots  = nombre_depots + 1,
                                        montant_depots = montant_depots + %s
                                """, (user_id, montant, montant))

                                # globale_states (une seule ligne, id=1)
                                await cursor.execute("""
                                    UPDATE globale_states
                                    SET nombre_depots_total  = nombre_depots_total + 1,
                                        montant_depots_total = montant_depots_total + %s
                                    WHERE id = 1
                                """, (montant,))

                            await conn.commit()
                    except Exception as e:
                        print(f"[TRACK_DEPOT] Erreur enregistrement stats dépôt: {e}")

            return response
        return wrapper
    return decorator


def track_depot1():
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            response = await func(*args, **kwargs)

            # Enregistre seulement si le dépôt a réussi
            if getattr(g, "depot_success", False):
                try:
                    montant = getattr(g, "depot_montant", None)
                    if montant:
                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cursor:
                                await cursor.execute(
                                    "INSERT INTO historique_depots (montant, date_depot) VALUES (%s, NOW())",
                                    (montant,)
                                )
                            await conn.commit()
                except Exception:
                    pass

            return response
        return wrapper
    return decorator

# --- Clés et variables d'environnement ---
HMAC_KEY = os.environ.get("TOKENS_HMAC_KEY")
if HMAC_KEY is None:
    raise RuntimeError("TOKENS_HMAC_KEY non défini dans les env")
HMAC_KEY = HMAC_KEY.encode()  # bytes

FEDAPAY_SECRET = os.environ.get("FEDAPAY_SECRET")
API_URL = os.environ.get("API_URL")


create_transaction_bp = Blueprint("create_transaction", __name__)


@create_transaction_bp.route("/api/create-transaction", methods=["POST"])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf
@rate_limit
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def create_transaction(wari_session):
    data = await request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "Body invalide"}), 400

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Utilisateur non connecté"}), 401

    amount = data.get("amount")
    try:
        amount = round(float(amount), 2)
    except Exception:
        return jsonify({"status": "error", "message": "Montant invalide"}), 400

    if amount < 1000:
        return jsonify({"status": "error", "message": "Montant minimal = 1000 FCFA"}), 400

    # --- Génération du token ---
    token_plain = secrets.token_urlsafe(32)
    token_hmac = hmac.new(HMAC_KEY, token_plain.encode(), hashlib.sha256).hexdigest()

    # --- Construire le callback_url ---
    callback_url = f"{FRONTEND_URL}/api/callbackss/{token_plain}"

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=5)

    payload = {
        "amount": amount,
        "currency": {"iso": "XOF"},
        "description": f"Dépôt de {amount} FCFA",
        "callback_url": callback_url,
        "metadata": {"user_id": user_id}
    }
    headers = {"Authorization": f"Bearer {FEDAPAY_SECRET}"}

    async with httpx.AsyncClient() as client:
        resp = await client.post(API_URL, json=payload, headers=headers)
        try:
            data_resp = resp.json()
        except Exception:
            return jsonify({"status": "error", "message": "Réponse API invalide"}), resp.status_code

    trx = data_resp.get("v1/transaction") or data_resp.get("transaction") or data_resp
    if not trx:
        return jsonify({"status": "error", "message": "Réponse API inattendue", "detail": resp.text}), resp.status_code

    payment_url = trx.get("payment_url")
    payment_token = trx.get("payment_token")

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO tokens (user_id, amount, token, created_at, expires_at)
                VALUES (%s, %s, %s, %s, %s) AS new_token
                ON DUPLICATE KEY UPDATE
                    amount     = new_token.amount,
                    token      = new_token.token,
                    created_at = new_token.created_at,
                    expires_at = new_token.expires_at
            """, (
                user_id,
                amount,
                token_hmac,
                now.strftime("%Y-%m-%d %H:%M:%S"),
                expires_at.strftime("%Y-%m-%d %H:%M:%S")
            ))
        await conn.commit()

    return jsonify({
        "status": "success",
        "payment_url": payment_url,
        "payment_token": payment_token,
        "transaction_token": token_plain,
        "expires_at": expires_at.isoformat()
    }), 201


#################################################################################################################################
# Deuxième partie du dépôt : gère la vérification quand Fedapay redirige vers /callbackss avec le statut et l'id du transfert. #
#################################################################################################################################

callbackss_bp = Blueprint("callbackss", __name__)


@callbackss_bp.route("/api/callbackss/<transaction_token>", methods=["GET"])
@track_depot()
async def callbackss(transaction_token):
    try:
        token_hmac_calc = hmac.new(HMAC_KEY, transaction_token.encode(), hashlib.sha256).hexdigest()

        status = request.args.get("status")
        feda_id = request.args.get("id")

        if status not in ("success", "approved"):
            return redirect(f'{FRONTEND_URL}/recharger')

        if not feda_id or not feda_id.isdigit():
            return redirect(f'{FRONTEND_URL}/recharger')

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                try:
                    await cur.execute("""
                        SELECT id, user_id, amount, expires_at
                        FROM tokens
                        WHERE token=%s
                        LIMIT 1
                    """, (token_hmac_calc,))
                    row = await cur.fetchone()

                    if not row:
                        return redirect(f'{FRONTEND_URL}/recharger')

                    token_id, user_id, amount_db, expires_at = row

                    if expires_at.tzinfo is None:
                        expires_at = expires_at.replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    if now > expires_at:
                        await cur.execute("DELETE FROM tokens WHERE id=%s", (token_id,))
                        await conn.commit()
                        return redirect(f'{FRONTEND_URL}/recharger')

                    await cur.execute(
                        "SELECT 1 FROM mobile_money WHERE transaction_id=%s",
                        (feda_id,)
                    )
                    exists = await cur.fetchone()
                    if exists:
                        return redirect(f'{FRONTEND_URL}/recharger')

                    # Vérification du vrai statut auprès de FedaPay
                    async with httpx.AsyncClient() as client:
                        verif_resp = await client.get(
                            f"{API_URL}/{feda_id}",
                            headers={"Authorization": f"Bearer {FEDAPAY_SECRET}"}
                        )

                    if verif_resp.status_code != 200:
                        return redirect(f'{FRONTEND_URL}/recharger')

                    try:
                        verif_data = verif_resp.json()
                    except Exception:
                        return redirect(f'{FRONTEND_URL}/recharger')

                    trx_data = verif_data.get("v1/transaction") or verif_data.get("transaction") or verif_data
                    real_status = trx_data.get("status")
                    real_amount = trx_data.get("amount")

                    if real_status != "approved":
                        return redirect(f'{FRONTEND_URL}/recharger')

                    if real_amount != amount_db:
                        return redirect(f'{FRONTEND_URL}/recharger')

                    await cur.execute(
                        "SELECT solde FROM solde WHERE user_id=%s FOR UPDATE",
                        (user_id,)
                    )
                    row_solde = await cur.fetchone()

                    if row_solde:
                        new_solde = row_solde[0] + amount_db
                        await cur.execute(
                            "UPDATE solde SET solde=%s WHERE user_id=%s",
                            (new_solde, user_id)
                        )
                    else:
                        new_solde = amount_db
                        await cur.execute(
                            "INSERT INTO solde (user_id, solde) VALUES (%s, %s)",
                            (user_id, new_solde)
                        )

                    msg = (
                        f"Vous avez effectué un dépôt de {amount_db} FCFA "
                        f"le {now.strftime('%d/%m/%Y %H:%M:%S')}. "
                        f"Votre solde actuel est de {new_solde} FCFA."
                    )
                    await cur.execute("""
                        INSERT INTO mobile_money (user_id, amount, solde, message, transaction_id)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (user_id, amount_db, new_solde, msg, feda_id))

                    await cur.execute("DELETE FROM tokens WHERE id=%s", (token_id,))

                    await cur.execute("""
                        INSERT INTO feeds (id, total_deposits_count, total_deposits_amount, last_updated)
                        VALUES (1, 1, %s, NOW())
                        ON DUPLICATE KEY UPDATE
                            total_deposits_count  = total_deposits_count + 1,
                            total_deposits_amount = total_deposits_amount + %s,
                            last_updated          = NOW()
                    """, (amount_db, amount_db))

                    g.depot_success = True
                    g.depot_montant = amount_db
                    g.depot_user_id = user_id

                    await conn.commit()

                except Exception:
                    await conn.rollback()
                    return redirect(f'{FRONTEND_URL}/recharger')

        return redirect(f'{FRONTEND_URL}/recharger')

    except Exception:
        return redirect(f'{FRONTEND_URL}/recharger')