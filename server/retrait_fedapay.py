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
                            "error": "Vous ne pouvez pas retirer sans avoir joué"
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
        return 50
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
        return 150
    elif amount <= 50000:
        return 300
    elif amount <= 150000:
        return 800
    elif amount <= 500000:
        return 2000
    else:
        return 2500



create_payout_bp = Blueprint("create_payout", __name__)    


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

        # Vérification session utilisateur
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        # Récupération des données de la requête
        data = await request.get_json()
        print(data)

        # ✅ Vérification que le body n'est pas vide
        if not data:
            return jsonify({"success": False, "error": "Body invalide"}), 400

        firstname    = data.get("firstname")
        lastname     = data.get("lastname")
        email        = data.get("email")
        phone        = data.get("phone")
        network      = data.get("network")
        amount_raw   = data.get("amount")
        country      = data.get("country")

        # Vérification des champs obligatoires
        if not all([firstname, lastname, email, phone, amount_raw, network, country]):
            return jsonify({"success": False, "error": "Champs manquants"}), 400

        # Conversion sécurisée du montant
        try:
            amount_requested = round(float(amount_raw), 2)  # ✅ Arrondi à 2 décimales
        except (TypeError, ValueError):
            return jsonify({"success": False, "error": "Montant invalide"}), 400

        # ✅ Vérification du montant minimum
        if amount_requested < 1000:
            return jsonify({"success": False, "error": "Le montant minimum autorisé est de 1000 XOF"}), 400

        # Vérification du montant maximum
        if amount_requested > 500000:
            return jsonify({"success": False, "error": "Le montant maximum autorisé est de 500 000 XOF"}), 400

        # Calcul des frais
        internal_fee = calculate_internal_fee(amount_requested)
        fedapay_fee  = calculate_fedapay_fee(amount_requested)
        total_fees   = internal_fee + fedapay_fee
        net_received = amount_requested - total_fees

        if net_received <= 0:
            return jsonify({"success": False, "error": "Montant trop faible après application des frais"}), 400

        # Préfixe international pour Bénin
        if country == "BJ":
            if not phone.startswith("+229"):
                phone = "+229" + phone

        elif country == "CI":
            if not phone.startswith("+225"):
                phone = "+225" + phone

        print(phone)

        # Vérification du réseau
        if network not in ["mtn", "moov", "celtiis", "mtn_ci"]:
            return jsonify({"success": False, "error": "Réseau invalide"}), 400

        pool = await get_pool()

        # ✅ Une seule connexion DB avec FOR UPDATE pour éviter la race condition
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                try:
                    # ✅ FOR UPDATE → lock sur le solde pendant toute la transaction
                    await cursor.execute(
                        "SELECT solde FROM solde WHERE user_id=%s LIMIT 1 FOR UPDATE",
                        (user_id,)
                    )
                    row = await cursor.fetchone()
                    if not row:
                        return jsonify({"success": False, "error": "Solde introuvable"}), 404

                    current_solde = float(row[0])

                    if amount_requested > current_solde:
                        return jsonify({
                            "success": False,
                            "error": f"Solde insuffisant. Total requis : {amount_requested} XOF"
                        }), 400

                    # Heure programmée pour le payout
                    scheduled_time = datetime.now(timezone.utc) + timedelta(minutes=5)
                    scheduled_at   = scheduled_time.isoformat().replace("+00:00", "Z")

                    # Préparation du payload pour Fedapay
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
                        "scheduled_at": scheduled_at,
                        "description": "Retrait utilisateur"
                    }

                    headers = {
                        "Authorization": f"Bearer {FEDAPAY_API_KEY}",
                        "Content-Type": "application/json"
                    }

                    # Envoi de la requête à Fedapay pour créer le payout
                    async with httpx.AsyncClient() as client:
                        response = await client.post(FEDAPAY_API_URL, json=payload, headers=headers)

                    # Lecture sécurisée de la réponse de création
                    if response.content:
                        try:
                            response_data = response.json()
                        except Exception:
                            response_data = {"status": response.status_code, "raw_content": response.text}
                    else:
                        response_data = {"status": response.status_code, "message": "No content returned"}

                    # Vérification du statut HTTP de création
                    if response.status_code not in [200, 201]:
                        return jsonify({"success": False, "error": response_data}), response.status_code
                    

                    # Extraction de l'ID du payout créé
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
                        return jsonify({
                            "success": False,
                            "error": "Impossible de récupérer l'ID du payout depuis la réponse FedaPay",
                        }), 500

                    # Conversion en int pour l'API start
                    try:
                        payout_id_int = int(payout_id)
                    except (TypeError, ValueError):
                        return jsonify({
                            "success": False,
                            "error": "Veillez Réessayer"
                        }), 500

                    # === DÉMARRAGE IMMÉDIAT DU PAYOUT ===
                    start_url     = f"{FEDAPAY_API_URL}/start"
                    start_payload = [
                        {
                            "id": payout_id_int,
                            "phone_number": {
                                "number": phone,
                                "country": "BJ"
                            }
                        }
                    ]

                    async with httpx.AsyncClient(timeout=30.0) as client:
                        start_response = await client.put(
                            start_url,
                            json=start_payload,
                            headers=headers
                        )

                    # Lecture de la réponse de démarrage
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

                    start_success = start_response.status_code in [200, 201]

                    # ✅ On ne débite le solde QUE si Fedapay a bien démarré le payout
                    if not start_success:
                        return jsonify({
                            "success": False,
                            "error": "Le retrait n'a pas pu être démarré, votre solde n'a pas été débité",
                            "start_error": start_data
                        }), 400

                    # Retrait du solde
                    new_solde = current_solde - amount_requested
                    await cursor.execute(
                        "UPDATE solde SET solde=%s WHERE user_id=%s",
                        (new_solde, user_id)
                    )

                    # Historique dans retraits
                    contact_str    = f"{firstname} {lastname} - {phone}"
                    statut_retrait = "envoyé"
                    await cursor.execute(
                        "INSERT INTO retraits (user_id, methode, montant, contact, statut, created_at, frais) "
                        "VALUES (%s, %s, %s, %s, %s, NOW(), %s)",
                        (user_id, network, net_received, contact_str, statut_retrait, total_fees)
                    )

                    # Mise à jour de la table feeds (stats globales)
                    await cursor.execute("""
                        INSERT INTO feeds (id, total_payouts_count, total_payouts_amount, last_updated)
                        VALUES (1, 1, %s, NOW())
                        ON DUPLICATE KEY UPDATE
                            total_payouts_count  = total_payouts_count + 1,
                            total_payouts_amount = total_payouts_amount + VALUES(total_payouts_amount),
                            last_updated         = NOW()
                    """, (amount_requested,))

                    # ✅ Signal succès pour le décorateur track_retrait
                    g.retrait_montant = amount_requested

                    await conn.commit()

                except Exception as e:
                    await conn.rollback()  # ✅ Rollback si n'importe quelle étape plante
                    return jsonify({"success": False, "error": "Erreur interne"}), 500

        # Construction de la réponse finale
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

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"success": False, "error": "Erreur interne"}), 500