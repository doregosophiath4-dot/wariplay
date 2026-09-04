
import os
from datetime import timedelta
from dotenv import load_dotenv

# 🚫 Debug désactivé en production
DEBUG = False

# 🍪 Cookies sécurisés
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # nécessite HTTPS
REMEMBER_COOKIE_HTTPONLY = True
REMEMBER_COOKIE_SECURE = True
# ⏳ Durée de vie des sessions
PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
# 📜 Logging
LOG_LEVEL = "INFO"

load_dotenv()

# Charger les variables d'environnement
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")
RECAPTCHA_SECRET1 = os.getenv("RECAPTCHA_SECRET1")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")  # Nouvelle variable pour SendGrid
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
SERVER_SECRET = os.environ.get('GAME_SERVER_SECRET', 'default-secret-key')
FRONTEND_URL         = os.getenv("FRONTEND_URL")
BACKEND_URL          = os.getenv("BACKEND_URL")



SECRET_KEY = b"\x9f\x1c\xd3\xab\x8e\x01\xf4\xaa\xcf\x12\x9a\x84\xed\x88\x9b\x02\xad\x0f\x91\xce\x1e\xaa\x8c\xef\x90\x77\x1d\x0b\xaa\x5c\x33\x71"
