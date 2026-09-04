from quart import Quart
from quart_cors import cors
from mise import cherif_bp
from security import is_logged_in_bp, get_jwt_bp, wari_token_init_bp,  validate_wari_token_bp, csfr_token_bp
from connexion import login_bp, login1_bp, register_bp, search_account_bp, verify_coded_bp, update_password_bp, verify_email_code_bp, send_recovery_email_bp, google_callback_bp
from profil import logout_bp, user_info_bp
from parametres import supprimer_code_bp, enregistrer_code_bp, update_phone_bp, verif_activee_bp, check_notifications_bp, check_referral_status_bp, check_verification_status_bp, deactivate_referral_bp, activate_referral_bp, update_notifications_bp, password_bp
from get_solde import get_solde_bp
from game import get_games_bp
from store import products_bp
from achats import get_product_price_bp, get_level_info_bp, save_purchase_bp, save_product_purchase_bp 
from ordre import get_other_products_bp, game_settings_bp, niveaux_utilisateur_bp, temps_restant_bp, renouvellement_temps_bp, ws_wari_level_bp
from depot_fedapay import callbackss_bp, create_transaction_bp
from depot_sebpay import sebpay_bp, webhook_bp
from historique_depots import historique_depots_bp
from retrait_fedapay import create_payout_bp
from retrait_sebpay import payouts_withdraw_bp, webhook_sebpay_bp
from historique_retraits import historique_retraits_bp 
from redis_session import close_redis, open_session, save_session


app = Quart(__name__)

app = cors(
    app,
    allow_origin=[
        "https://wariplay.online",
        "http://127.0.0.1:5000",
        "http://localhost",        # ← celui-là
        "http://localhost:3000",
        "https://distract-swab-culprit.ngrok-free.dev",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    allow_credentials=True,
    max_age=86400
)

@app.after_serving
async def shutdown():
    await close_redis()

@app.before_request
async def load_session():
    await open_session()

@app.after_request
async def persist_session(response):
    return await save_session(response)

app.register_blueprint(historique_retraits_bp)
app.register_blueprint(webhook_sebpay_bp)
app.register_blueprint(payouts_withdraw_bp)
app.register_blueprint(create_payout_bp)
app.register_blueprint(historique_depots_bp)
app.register_blueprint(webhook_bp)
app.register_blueprint(sebpay_bp)
app.register_blueprint(create_transaction_bp)
app.register_blueprint(callbackss_bp)
app.register_blueprint(ws_wari_level_bp)
app.register_blueprint(renouvellement_temps_bp)
app.register_blueprint(temps_restant_bp)
app.register_blueprint(niveaux_utilisateur_bp)
app.register_blueprint(game_settings_bp)
app.register_blueprint(get_other_products_bp)
app.register_blueprint(save_purchase_bp)
app.register_blueprint(save_product_purchase_bp)
app.register_blueprint(get_level_info_bp)
app.register_blueprint(get_product_price_bp)
app.register_blueprint(products_bp)
app.register_blueprint(is_logged_in_bp)
app.register_blueprint(get_jwt_bp)
app.register_blueprint(wari_token_init_bp)
app.register_blueprint(validate_wari_token_bp)
app.register_blueprint(csfr_token_bp)
app.register_blueprint(login_bp)
app.register_blueprint(login1_bp)
app.register_blueprint(register_bp)
app.register_blueprint(search_account_bp)
app.register_blueprint(verify_coded_bp)
app.register_blueprint(update_password_bp)
app.register_blueprint(send_recovery_email_bp)
app.register_blueprint(verify_email_code_bp)
app.register_blueprint(google_callback_bp)
app.register_blueprint(logout_bp)
app.register_blueprint(user_info_bp)
app.register_blueprint(supprimer_code_bp)
app.register_blueprint(enregistrer_code_bp)
app.register_blueprint(update_phone_bp)
app.register_blueprint(verif_activee_bp)
app.register_blueprint(check_notifications_bp)
app.register_blueprint(check_referral_status_bp)
app.register_blueprint(check_verification_status_bp)
app.register_blueprint(deactivate_referral_bp)
app.register_blueprint(activate_referral_bp)
app.register_blueprint(update_notifications_bp)
app.register_blueprint(password_bp)
app.register_blueprint(get_solde_bp)
app.register_blueprint(get_games_bp)
app.register_blueprint(cherif_bp)



if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0", 
        port=5000,
        workers=1,                    # Processes
        loop="asyncio",               # Use asyncio loop
        timeout_keep_alive=30,        # Keep-alive timeout
    ) 