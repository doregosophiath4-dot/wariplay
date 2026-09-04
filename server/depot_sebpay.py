from quart import Blueprint, jsonify, request, g
from security import require_origin, login_required, require_valid_session, require_fingerprint, require_csrf, rate_limit, require_jwt, require_ip_score, update_fingerprint_if_changed
import hmac
import hashlib
import uuid
import requests
from helper import SECRET_KEY
import functools
from db import get_pool
from typing import Callable



def track_depot():
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





SEB_PUBLIC_KEY = "pk_test_EV0RLmri9X1miEIfjtTjZXBVHScy1WaPdjz9iwdR"
SEB_SECRET_KEY = "sk_test_o2N2UAX2LPPjpHTjXvSh4Wod692cq19sbkRvAvdBN3DUs9xp9VjnBeBohvL0"

COUNTRY_CODE_MAP = {
    "Benin": "BJ",
    "Burkina Faso": "BF",
    "Cote d'Ivoire": "CI",
    "Senegal": "SN",
    "Cameroun": "CM",
    "Congo Brazzaville": "CG",
    "Gabon": "GA"
}

OPERATOR_MAP = {
    "BJ": {
        "MTN Money": "mtn",
        "Moov Money": "moov",
        "Celtiis Money": "celtiis",
        "Free Money": "free"
    },
    "BF": {
        "Orange Money": "orange",
        "Moov Money": "moov",
        "Free Money": "free"
    },
    "CI": {
        "Orange Money": "orange",
        "MTN Money": "mtn",
        "Moov Money": "moov",
        "Wave Money": "wave"
    },
    "SN": {
        "Orange Money": "orange",
        "Free Money": "free",
        "Wave Money": "wave",
        "E-money": "emoney"
    },
    "CM": {
        "Orange Money": "orange",
        "MTN Money": "mtn"
    },
    "CG": {
        "MTN Money": "mtn",
        "Airtel Money": "airtel"
    },
    "GA": {
        "Airtel Money": "airtel",
        "Moov Money": "moov"
    }
}


sebpay_bp = Blueprint("sebpay", __name__)


@sebpay_bp.post("/api/sebpay")
@require_origin
@login_required
@require_valid_session
@require_fingerprint
@require_csrf 
@rate_limit 
@require_jwt
@require_ip_score
@update_fingerprint_if_changed
async def subpay(wari_session):
    data = await request.get_json()

    numero = data.get("numero")
    montant = data.get("montant")
    country = data.get("country")
    operator = data.get("operator")

    champs_manquants = []
    if not numero:
        champs_manquants.append("numero")
    if not montant:
        champs_manquants.append("montant")
    if not country:
        champs_manquants.append("country")
    if not operator:
        champs_manquants.append("operator")

    if champs_manquants:
        return jsonify({
            "success": False,
            "message": f"Informations manquantes : {', '.join(champs_manquants)}"
        }), 400

    try:
        montant_float = float(montant)
        if montant_float < 1000:
            return jsonify({
                "success": False,
                "message": "Le montant minimum est de 1000 XOF"
            }), 400
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Le montant doit être un nombre valide"
        }), 400

    country_code = COUNTRY_CODE_MAP.get(country)
    if not country_code:
        return jsonify({
            "success": False,
            "message": f"Pays non supporte : {country}"
        }), 400

    operator_code = operator
    if country_code in OPERATOR_MAP:
        mapped_operator = OPERATOR_MAP[country_code].get(operator)
        if mapped_operator:
            operator_code = mapped_operator

    external_ref = str(uuid.uuid4())

    payload = {
        "amount": montant,
        "currency": "XOF",
        "phone": numero,
        "operator": operator_code,
        "country": country_code,
        "external_reference": external_ref,
        "callback_url": "http://localhost/api/webhook"
    }

    try:
        response = requests.post(
            "https://newapi.sebpay.bj/api/v1/collections",
            json=payload,
            headers={
                "X-Public-Key": SEB_PUBLIC_KEY,
                "X-Secret-Key": SEB_SECRET_KEY,
                "Content-Type": "application/json"
            },
            timeout=30
        )

        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "message": "Le service de paiement ne repond pas. Veuillez reessayer."
        }), 504

    except requests.exceptions.ConnectionError:
        return jsonify({
            "success": False,
            "message": "Impossible de se connecter au service de paiement."
        }), 502

    except requests.exceptions.RequestException:
        return jsonify({
            "success": False,
            "message": "Une erreur est survenue lors de la communication avec SebPay."
        }), 500

    except Exception:
        return jsonify({
            "success": False,
            "message": "Une erreur inattendue est survenue."
        }), 500


webhook_bp = Blueprint("webhook", __name__)

@webhook_bp.post("/api/webhook")
@require_origin
@rate_limit 
@require_ip_score
@track_depot()
async def webhook():
    body = await request.get_data()
    signature = request.headers.get("X-SebPay-Signature")

    expected = hmac.new(
        SECRET_KEY.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if signature != expected:
        return jsonify({
            "success": False,
            "message": "Signature invalide"
        }), 403

    data = await request.get_json()
    status = data.get("status")
    reference = data.get("external_reference")

    return jsonify({
        "success": True
    }), 200