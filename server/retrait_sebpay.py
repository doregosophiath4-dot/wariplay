import os
import uuid
import httpx
from quart import Blueprint, request, jsonify



"""
Intégration SebPay Payouts
-----------------------------
- POST /payouts/withdraw -> le frontend appelle cette route pour retirer de l'argent
- POST /webhook/sebpay    -> SebPay appelle cette route quand le statut final est connu

"""



SEBPAY_BASE_URL = "https://newapi.sebpay.bj/api/v1"
SEBPAY_PUBLIC_KEY = os.environ["SEBPAY_PUBLIC_KEY"]
SEBPAY_SECRET_KEY = os.environ["SEBPAY_SECRET_KEY"]


async def sebpay_create_payout(recipient_name, phone, operator, country, amount, currency,
                                external_reference, callback_url=None, description=None):
    payload = {
        "recipient_name": recipient_name,
        "phone": phone,
        "operator": operator,
        "country": country,
        "amount": amount,
        "currency": currency,
        "external_reference": external_reference,
    }
    if callback_url:
        payload["callback_url"] = callback_url
    if description:
        payload["description"] = description

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{SEBPAY_BASE_URL}/payouts",
            json=payload,
            headers={
                "X-Public-Key": SEBPAY_PUBLIC_KEY,
                "X-Secret-Key": SEBPAY_SECRET_KEY,
                "Content-Type": "application/json",
            },
        )

    print(f"[SebPay] POST /payouts -> {resp.status_code} {resp.text}")

    data = resp.json()
    if resp.status_code >= 400:
        raise Exception(data.get("message", "Erreur SebPay"))
    return data



payouts_withdraw_bp = Blueprint("payouts_withdraw", __name__)

@payouts_withdraw_bp.route("/api/payouts/withdraw", methods=["POST"])
async def withdraw():
    body = await request.get_json()

    required = ["recipient_name", "phone", "operator", "country", "amount", "currency"]
    missing = [f for f in required if f not in body]
    if missing:
        return jsonify({"success": False, "error": f"Champs manquants: {', '.join(missing)}"}), 400

    external_reference = f"WD-{uuid.uuid4().hex[:12]}"

    try:
        result = await sebpay_create_payout(
            recipient_name=body["recipient_name"],
            phone=body["phone"],
            operator=body["operator"],
            country=body["country"],
            amount=body["amount"],
            currency=body["currency"],
            external_reference=external_reference,
            callback_url=body.get("callback_url", "https://wariplay.online/api/webhook/sebpay"),
            description=body.get("description"),
        )
    except Exception as e:
        print(f"[SebPay] Echec payout: {e}")
        return jsonify({"success": False, "error": str(e)}), 502

    return jsonify({
        "success": True,
        "message": "Retrait en cours de traitement",
        "transaction_id": result["transaction_id"],
        "status": result["status"],
        "external_reference": result["external_reference"],
        "total_deducted": result.get("total_deducted"),
    }), 202



webhook_sebpay_bp = Blueprint("webhook_sebpay", __name__)

@webhook_sebpay_bp.route("/api/webhook/sebpay", methods=["POST"])
async def sebpay_webhook():
    payload = await request.get_json(silent=True)
    print(f"[SebPay] Webhook reçu: {payload}")

    if not payload or "external_reference" not in payload or "status" not in payload:
        return jsonify({"error": "payload invalide"}), 400

    # TODO: mettre à jour ta base de données ici
    # ex: UPDATE payouts SET status = payload["status"] WHERE external_reference = payload["external_reference"]

    if payload["status"] == "rejected":
        print(f"[SebPay] Payout rejeté, solde remboursé: {payload['external_reference']}")

    return jsonify({"received": True}), 200