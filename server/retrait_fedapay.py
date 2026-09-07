from quart import Blueprint, jsonify, request, g, redirect
from security import require_origin, login_required, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_jwt, require_ip_score, update_fingerprint_if_changed
from db import get_pool
from redis_session import session
from datetime import datetime
import functools
from typing import Callable
import os
import httpx
from datetime import datetime, timedelta,  timezone
from functools import wraps






# décorateur pour vérifier dépôt
def depot_required():

    def decorator(func):

        @wraps(func)
        async def wrapper(*args, **kwargs):

            user_id = session.get("user_id")

            if not user_id:
                return jsonify({"error": "Utilisateur non connecté"}), 403

            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(
                        "SELECT COUNT(*) FROM mobile_money WHERE user_id=%s AND amount>0",
                        (user_id,)
                    )
                    result = await cursor.fetchone()

                    if not result or result[0] == 0:
                        return jsonify({
                            "error": "Vous ne pouvez pas retirer sans avoir deposer"
                        }), 403


            return await func(*args, **kwargs)

        return wrapper

    return decorator


def track_retrait():
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            response = await func(*args, **kwargs)

            status_code = response[1] if isinstance(response, tuple) else 200

            # 200 = payout démarré, 207 = payout créé mais pas démarré
            if status_code in (200, 207):
                try:
                    montant = getattr(g, "retrait_montant", None)
                    if montant:
                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cursor:
                                await cursor.execute(
                                    "INSERT INTO historique_retraits (montant, date_retrait) VALUES (%s, NOW())",
                                    (montant,)
                                )
                            await conn.commit()
                except Exception:
                    pass

            return response
        return wrapper
    return decorator

FEDAPAY_API_KEY = os.environ.get("FEDAPAY_SECRET")
FEDAPAY_API_URL = "https://api.fedapay.com/v1/payouts"

#-------------#
# Route 1 : Création du payout
# --------------------------

# Fonction pour calculer les frais internes selon le montant demandé
def calculate_internal_fee(amount: float) -> int:
    if amount <= 5000:
        return 0
    elif amount <= 10000:
        return 75
    elif amount <= 25000:
        return 100
    elif amount <= 50000:
        return 150
    elif amount <= 100000:
        return 250
    elif amount <= 250000:
        return 400
    else:  # jusqu'à 500 000
        return 600

# Fonction pour calculer les frais Fedapay
def calculate_fedapay_fee(amount: float) -> int:
    if amount <= 10000:
        return 0
    elif amount <= 50000:
        return 300
    elif amount <= 150000:
        return 800
    elif amount <= 500000:
        return 2000
    else:
        return 2500



create_payout_bp = Blueprint("create_payout", __name__)    
OK_STATUSES = ["sent", "pending", "scheduled", "started", "processing"]



@create_payout_bp.route('/api/create-payout', methods=['POST'])
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
@depot_required()
async def create_payout(wari_session):
    try:

        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        data = await request.get_json()
        print("📥 DATA REÇUE:", data)

        if not data:
            return jsonify({"success": False, "error": "Body invalide"}), 400

        firstname    = data.get("firstname")
        lastname     = data.get("lastname")
        email        = data.get("email")
        phone        = data.get("phone")
        network      = data.get("network")
        amount_raw   = data.get("amount")
        country      = data.get("country")

        if not all([firstname, lastname, email, phone, amount_raw, network, country]):
            print("❌ Champs manquants")
            return jsonify({"success": False, "error": "Champs manquants"}), 400

        try:
            amount_requested = round(float(amount_raw), 2)
        except (TypeError, ValueError):
            print("❌ Montant invalide:", amount_raw)
            return jsonify({"success": False, "error": "Montant invalide"}), 400

        if amount_requested < 100:
            print(f"❌ Montant sous le minimum: {amount_requested} < 100")
            return jsonify({"success": False, "error": "Le montant minimum autorisé est de 100 XOF"}), 400

        if amount_requested > 500000:
            print(f"❌ Montant au-dessus du maximum: {amount_requested} > 500000")
            return jsonify({"success": False, "error": "Le montant maximum autorisé est de 500 000 XOF"}), 400

        internal_fee = calculate_internal_fee(amount_requested)
        fedapay_fee  = calculate_fedapay_fee(amount_requested)
        total_fees   = internal_fee + fedapay_fee
        net_received = amount_requested - total_fees

        print(f"💰 Montant: {amount_requested} | Frais internes: {internal_fee} | Frais Fedapay: {fedapay_fee} | Net reçu: {net_received}")

        if net_received <= 0:
            print(f"❌ Net reçu négatif ou nul: {net_received} (montant={amount_requested}, frais={total_fees})")
            return jsonify({"success": False, "error": "Montant trop faible après application des frais"}), 400

        if country == "BJ":
            if not phone.startswith("+229"):
                phone = "+229" + phone
        elif country == "CI":
            if not phone.startswith("+225"):
                phone = "+225" + phone

        print("📞 Téléphone normalisé:", phone)

        if network not in ["mtn", "moov", "celtiis", "mtn_ci"]:
            print("❌ Réseau invalide:", network)
            return jsonify({"success": False, "error": "Réseau invalide"}), 400

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    await cursor.execute(
                        "SELECT solde FROM solde WHERE user_id=%s LIMIT 1 FOR UPDATE",
                        (user_id,)
                    )
                    row = await cursor.fetchone()
                    if not row:
                        print("❌ Solde introuvable pour user_id:", user_id)
                        return jsonify({"success": False, "error": "Solde introuvable"}), 404

                    current_solde = float(row[0])
                    print(f"🏦 Solde actuel: {current_solde}")

                    if amount_requested > current_solde:
                        print(f"❌ Solde insuffisant. Demandé: {amount_requested} | Disponible: {current_solde}")
                        return jsonify({
                            "success": False,
                            "error": f"Solde insuffisant. Total requis : {amount_requested} XOF"
                        }), 400

                    payload = {
                        "amount": int(amount_requested - internal_fee),
                        "currency": {"iso": "XOF"},
                        "customer": {
                            "firstname": firstname,
                            "lastname": lastname,
                            "email": email,
                            "phone_number": {
                                "country": country,
                                "number": phone
                            }
                        },
                        "mode": network,
                        "description": "Retrait utilisateur"
                    }

                    print("📤 PAYLOAD création payout:", payload)

                    headers = {
                        "Authorization": f"Bearer {FEDAPAY_API_KEY}",
                        "Content-Type": "application/json"
                    }

                    async with httpx.AsyncClient() as client:
                        response = await client.post(FEDAPAY_API_URL, json=payload, headers=headers)

                    print(f"📨 CREATE HTTP {response.status_code} → {response.text[:500]}")

                    if response.content:
                        try:
                            response_data = response.json()
                        except Exception:
                            response_data = {"status": response.status_code, "raw_content": response.text}
                    else:
                        response_data = {"status": response.status_code, "message": "No content returned"}

                    if response.status_code not in [200, 201]:
                        print("❌ Échec création payout:", response_data)
                        return jsonify({"success": False, "error": response_data}), response.status_code

                    payout_id = response_data.get("id")

                    if not payout_id and "payout" in response_data:
                        payout_id = response_data.get("payout", {}).get("id")

                    if not payout_id and "data" in response_data:
                        payout_id = response_data.get("data", {}).get("id")

                    if not payout_id:
                        for key in response_data.keys():
                            if isinstance(response_data[key], dict) and "id" in response_data[key]:
                                payout_id = response_data[key]["id"]
                                break

                    if not payout_id:
                        print("❌ Aucun ID de payout trouvé dans la réponse:", response_data)
                        return jsonify({
                            "success": False,
                            "error": "Impossible de récupérer l'ID du payout depuis la réponse FedaPay",
                        }), 500

                    print("🆔 Payout ID créé:", payout_id)

                    try:
                        payout_id_int = int(payout_id)
                    except (TypeError, ValueError):
                        print("❌ Impossible de convertir payout_id en int:", payout_id)
                        return jsonify({
                            "success": False,
                            "error": "Veillez Réessayer"
                        }), 500

                    # ✅ FIX PRINCIPAL : le payload doit être un OBJET avec une clé "payouts",
                    # PAS un tableau brut. C'est ce que fait le PHP, et c'est ce que demande la doc Fedapay.
                    start_url     = f"{FEDAPAY_API_URL}/start"
                    start_payload = {
                        "payouts": [
                            {
                                "id": payout_id_int,
                                "phone_number": {
                                    "number": phone,
                                    "country": "BJ"
                                }
                            }
                        ]
                    }

                    print("📤 PAYLOAD start:", start_payload)

                    async with httpx.AsyncClient(timeout=30.0) as client:
                        start_response = await client.put(
                            start_url,
                            json=start_payload,
                            headers=headers
                        )

                    print(f"📨 START HTTP {start_response.status_code} → {start_response.text[:500]}")

                    if start_response.content:
                        try:
                            start_data = start_response.json()
                        except Exception:
                            start_data = {
                                "status": start_response.status_code,
                                "raw_content": start_response.text
                            }
                    else:
                        start_data = {
                            "status": start_response.status_code,
                            "message": "Réponse vide"
                        }

                    started = None
                    if isinstance(start_data, dict):
                        v1_payouts = start_data.get("v1/payouts")
                        if isinstance(v1_payouts, list) and len(v1_payouts) > 0:
                            started = v1_payouts[0]

                        if not started:
                            payouts_alt = start_data.get("payouts")
                            if isinstance(payouts_alt, list) and len(payouts_alt) > 0:
                                started = payouts_alt[0]

                        if not started:
                            started = start_data.get("v1/payout") or start_data.get("payout")

                    elif isinstance(start_data, list) and len(start_data) > 0:
                        started = start_data[0]

                    print("🔍 Payout extrait de la réponse start:", started)

                    if not started:
                        print("⚠️ Aucun payout trouvé dans la réponse start — re-fetch en cours")
                        async with httpx.AsyncClient(timeout=30.0) as client:
                            refetch_response = await client.get(
                                f"{FEDAPAY_API_URL}/{payout_id_int}",
                                headers=headers
                            )
                        print(f"📨 RE-FETCH HTTP {refetch_response.status_code} → {refetch_response.text[:500]}")
                        try:
                            refetch_data = refetch_response.json()
                        except Exception:
                            refetch_data = {}
                        print("🔍 Re-fetch réponse:", refetch_data)
                        started = refetch_data.get("v1/payout") or refetch_data.get("payout")

                    fedapay_status   = (started or {}).get("status", "unknown")
                    fedapay_ref      = (started or {}).get("reference")
                    fedapay_err_code = (started or {}).get("last_error_code", "UNKNOWN")

                    print(f"📊 Statut Fedapay: {fedapay_status} | Référence: {fedapay_ref} | Code erreur: {fedapay_err_code}")

                    start_success = fedapay_status in OK_STATUSES
                    print("✅ start_success:", start_success)

                    if not start_success:
                        print(f"❌ Retrait non démarré. Statut: {fedapay_status} | Code: {fedapay_err_code}")
                        return jsonify({
                            "success": False,
                            "error": f"Le retrait n'a pas pu être démarré (statut: {fedapay_status}, code: {fedapay_err_code}). Votre solde n'a pas été débité.",
                            "start_error": start_data
                        }), 400

                    new_solde = current_solde - amount_requested
                    print(f"🏦 Nouveau solde: {new_solde}")

                    await cursor.execute(
                        "UPDATE solde SET solde=%s WHERE user_id=%s",
                        (new_solde, user_id)
                    )

                    contact_str    = f"{firstname} {lastname} - {phone}"
                    statut_retrait = "envoyé" if fedapay_status == "sent" else "en attente"
                    print(f"📝 Insertion retrait: statut={statut_retrait} | référence={fedapay_ref}")

                    await cursor.execute(
                        "INSERT INTO retraits (user_id, methode, montant, contact, statut, created_at, frais, reference) "
                        "VALUES (%s, %s, %s, %s, %s, NOW(), %s, %s)",
                        (user_id, network, net_received, contact_str, statut_retrait, total_fees, fedapay_ref)
                    )

                    await cursor.execute("""
                        INSERT INTO feeds (id, total_payouts_count, total_payouts_amount, last_updated)
                        VALUES (1, 1, %s, NOW()) AS new_vals
                        ON DUPLICATE KEY UPDATE
                            total_payouts_count  = feeds.total_payouts_count + 1,
                            total_payouts_amount = feeds.total_payouts_amount + new_vals.total_payouts_amount,
                            last_updated         = NOW()
                    """, (amount_requested,))

                    g.retrait_montant = amount_requested

                    await conn.commit()
                    print("✅ Transaction commitée avec succès")

                except Exception as e:
                    await conn.rollback()
                    print("💥 EXCEPTION dans la transaction, rollback effectué:", str(e))
                    return jsonify({"success": False, "error": "Erreur interne"}), 500

        result = {
            "success": True,
            "payout_created": True,
            "payout_started": start_success,
            "payout_id": payout_id_int,
            "amount_requested": amount_requested,
            "fees": {
                "internal_fee": internal_fee,
                "fedapay_fee": fedapay_fee,
                "total_fees": total_fees,
                "net_received": net_received
            },
            "balance": {
                "previous": current_solde,
                "new": new_solde
            },
            "create_response": response_data,
            "start_response": start_data
        }

        print("📦 Résultat final:", result)
        return jsonify(result), 200

    except Exception as e:
        print("💥 EXCEPTION globale:", str(e))
        return jsonify({"success": False, "error": "Erreur interne"}), 500

    







import hmac
import hashlib
import time

from quart import Blueprint, request, jsonify

fedapay_webhook_bp = Blueprint("fedapay_webhook", __name__)

# ⚠️ À récupérer dans Workbench → Webhooks → sélectionner l'endpoint → "Révéler"
FEDAPAY_WEBHOOK_SECRET = "wh_live_wZGQDbfS0gzzwk-8vZo_Y0IV"  # ou wh_live_xxx en prod

# Statuts qui indiquent que le retrait a réellement abouti / échoué
FINAL_SUCCESS_STATUSES = ["sent"]
FINAL_FAILURE_STATUSES = ["failed", "declined", "deleted"]


def verify_fedapay_signature(payload: bytes, sig_header: str, secret: str) -> bool:
    """
    Vérifie la signature X-FEDAPAY-SIGNATURE.
    Format attendu (à confirmer avec le support Fedapay si besoin) :
    "t=<timestamp>,s=<signature>"
    """
    try:
        parts = dict(p.split("=", 1) for p in sig_header.split(","))
        timestamp = parts.get("t")
        signature = parts.get("s")

        if not timestamp or not signature:
            print("❌ Signature mal formée:", sig_header)
            return False

        # ✅ Protection anti-replay : rejette si le timestamp est trop vieux (> 5 min)
        if abs(time.time() - int(timestamp)) > 300:
            print("❌ Timestamp webhook trop ancien:", timestamp)
            return False

        signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
        expected_signature = hmac.new(
            secret.encode("utf-8"),
            signed_payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature)

    except Exception as e:
        print("💥 Erreur vérification signature:", str(e))
        return False

@fedapay_webhook_bp.route('/api/webhooks/fedapay', methods=['POST'])
async def fedapay_webhook():
    try:
        raw_body = await request.get_data()
        sig_header = request.headers.get("X-FEDAPAY-SIGNATURE", "")

        print("📥 WEBHOOK REÇU, signature:", sig_header)

        if not verify_fedapay_signature(raw_body, sig_header, FEDAPAY_WEBHOOK_SECRET):
            print("❌ Signature invalide, webhook rejeté")
            return jsonify({"success": False, "error": "Signature invalide"}), 400

        try:
            event = await request.get_json()
        except Exception:
            print("❌ Body JSON invalide")
            return jsonify({"success": False, "error": "Body invalide"}), 400

        # ✅ Vraie structure Fedapay : {"name": ..., "object": "payout", "entity": {...}}
        event_name = event.get("name")
        entity     = event.get("entity", {}) or {}

        payout_id_evt  = entity.get("id")
        payout_ref     = entity.get("reference")
        payout_status  = entity.get("status")

        print(f"📦 Event: name={event_name} payout_id={payout_id_evt} status={payout_status} ref={payout_ref}")

        if not event_name or not payout_id_evt:
            print("❌ Event mal formé:", event)
            return jsonify({"success": False, "error": "Event invalide"}), 400

        # ✅ ID unique pour la dédup : pas de champ "id" d'event fourni par Fedapay,
        # donc on construit une clé à partir du payout_id + updated_at (change à chaque nouvel event)
        dedup_key = f"{payout_id_evt}:{entity.get('updated_at')}:{event_name}"

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    await cursor.execute(
                        "SELECT id FROM webhook_events WHERE fedapay_event_id=%s LIMIT 1",
                        (dedup_key,)
                    )
                    already_processed = await cursor.fetchone()

                    if already_processed:
                        print(f"⚠️ Event {dedup_key} déjà traité, on ignore")
                        await conn.commit()
                        return jsonify({"received": True}), 200

                    await cursor.execute(
                        "INSERT INTO webhook_events (fedapay_event_id, event_name, created_at) "
                        "VALUES (%s, %s, NOW())",
                        (dedup_key, event_name)
                    )

                    if payout_ref:
                        if payout_status == "sent" or event_name == "payout.transferred":
                            print(f"✅ Retrait {payout_ref} confirmé SENT")
                            await cursor.execute(
                                "UPDATE retraits SET statut='envoyé' WHERE reference=%s",
                                (payout_ref,)
                            )

                        elif payout_status in ["failed", "declined"] or event_name == "payout.failed":
                            print(f"❌ Retrait {payout_ref} confirmé FAILED — recréditation nécessaire")
                            await cursor.execute(
                                "SELECT user_id, montant, frais, statut FROM retraits WHERE reference=%s LIMIT 1 FOR UPDATE",
                                (payout_ref,)
                            )
                            retrait_row = await cursor.fetchone()

                            if retrait_row:
                                r_user_id, r_montant, r_frais, r_statut = retrait_row
                                if r_statut != "échoué":  # ✅ évite de recréditer 2x
                                    montant_total_debite = float(r_montant) + float(r_frais)
                                    await cursor.execute(
                                        "UPDATE solde SET solde = solde + %s WHERE user_id=%s",
                                        (montant_total_debite, r_user_id)
                                    )
                                    await cursor.execute(
                                        "UPDATE retraits SET statut='échoué' WHERE reference=%s",
                                        (payout_ref,)
                                    )
                                    print(f"💰 Solde recrédité: +{montant_total_debite} pour user_id={r_user_id}")
                                else:
                                    print("⚠️ Déjà marqué échoué, pas de double recréditation")
                            else:
                                print(f"⚠️ Aucun retrait trouvé en base pour la référence {payout_ref}")

                        elif event_name == "payout.deleted":
                            # ✅ Un payout supprimé (deleted_at rempli) sans avoir été "sent" = jamais parti
                            # Si son statut en base est encore "en attente", on le traite comme un échec
                            print(f"🗑️ Payout {payout_ref} supprimé (deleted) — vérification du statut en base")
                            await cursor.execute(
                                "SELECT user_id, montant, frais, statut FROM retraits WHERE reference=%s LIMIT 1 FOR UPDATE",
                                (payout_ref,)
                            )
                            retrait_row = await cursor.fetchone()

                            if retrait_row:
                                r_user_id, r_montant, r_frais, r_statut = retrait_row
                                if r_statut == "en attente":
                                    montant_total_debite = float(r_montant) + float(r_frais)
                                    await cursor.execute(
                                        "UPDATE solde SET solde = solde + %s WHERE user_id=%s",
                                        (montant_total_debite, r_user_id)
                                    )
                                    await cursor.execute(
                                        "UPDATE retraits SET statut='échoué' WHERE reference=%s",
                                        (payout_ref,)
                                    )
                                    print(f"💰 Solde recrédité (deleted): +{montant_total_debite} pour user_id={r_user_id}")
                                else:
                                    print(f"ℹ️ Statut déjà '{r_statut}', pas de recréditation")

                        else:
                            print(f"ℹ️ Event {event_name} (statut={payout_status}), aucune action de solde")

                    await conn.commit()
                    print("✅ Webhook traité avec succès")

                except Exception as e:
                    await conn.rollback()
                    print("💥 EXCEPTION traitement webhook, rollback:", str(e))
                    return jsonify({"success": False, "error": "Erreur interne"}), 500

        return jsonify({"received": True}), 200

    except Exception as e:
        print("💥 EXCEPTION globale webhook:", str(e))
        return jsonify({"success": False, "error": "Erreur interne"}), 500