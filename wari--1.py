import os
import asyncio
import random
import string
import aiobcrypt
import aiofiles
import uuid
import hmac
import hashlib
import json
import httpx
import time
import io
import asyncio
import base64
import secrets
import subprocess
import socket
import sys
import traceback
import math
import smtplib
import re
from datetime import datetime, timedelta,  timezone
from functools import wraps
from decimal import Decimal
from difflib import SequenceMatcher
from urllib.parse import unquote, quote
import bcrypt
import unicodedata
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from google_auth_oauthlib.flow import Flow
from google.auth import exceptions as google_exceptions
from dateutil.parser import parse
from quart import Quart, Blueprint, request, jsonify, send_from_directory, session, redirect, make_response, url_for, abort, send_file,  websocket, Response
from quart_cors import cors
import aiomysql
import asyncmy
import requests
import aiohttp
from asyncmy.cursors import DictCursor
from dotenv import load_dotenv
from typing import Optional, Tuple, Dict, Any
from asyncmy import errors
from async_timeout import timeout
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from decimal import Decimal, ROUND_HALF_UP
from contextlib import asynccontextmanager
from typing import Dict, List, Set, Optional, Tuple



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
SECRET_KEY = bytes.fromhex(
    "9f6a2d4c3bcbf9c5d7cda8b29e4e6c19aee2f1b9a9a1b7e6e4caa1a12d45e8ab"
)
# -------------------
# Configuration Quart
# -------------------
app = Quart(__name__)
app = cors(app)  # si nécessaire pour CORS

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Pool MySQL global
async def get_pool():
    if not hasattr(app, "db_pool"):
        app.db_pool = await asyncmy.create_pool(
            host="localhost",
            port=3306,  # ← Ajoutez cette ligne
            user="root",
            password="Dev1234",
            db="wariplay",
            autocommit=True,
            minsize=1,  # IMPORTANT
            maxsize=30, # IMPORTANT
            pool_recycle=300  # RECYCLE après 5 minutes
        )
    return app.db_pool



def track_mise():

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    try:
                        # Vérifier si la colonne total_mises_count existe
                        await cursor.execute("""
                            SHOW COLUMNS FROM feeds LIKE 'total_mises_count'
                        """)
                        column_exists = await cursor.fetchone()

                        if not column_exists:
                            # ajouter la colonne si elle n'existe pas
                            await cursor.execute("""
                                ALTER TABLE feeds
                                ADD COLUMN total_mises_count INT NOT NULL DEFAULT 0
                            """)

                        # Vérifier si la ligne id=1 existe
                        await cursor.execute("SELECT id FROM feeds WHERE id = 1")
                        result = await cursor.fetchone()
                        if not result:
                            # créer la ligne si elle n'existe pas
                            await cursor.execute("""
                                INSERT INTO feeds (id, total_mises_count, last_updated)
                                VALUES (1, 0, NOW())
                            """)

                        # Incrémenter total_mises_count
                        await cursor.execute("""
                            UPDATE feeds
                            SET total_mises_count = total_mises_count + 1,
                                last_updated = NOW()
                            WHERE id = 1
                        """)
                    except Exception as e:
                        pass

            # exécuter la fonction décorée
            return await func(*args, **kwargs)

        return wrapper
    return decorator

# -------------------
# Routes statiques
# -------------------
@app.route('/')
@app.route('/screen')
async def chargement():
    return await send_from_directory('html 1', 'Screen.html')

@app.route('/3x')
async def Acceuil():
    return await send_from_directory('html 1', 'Acceuil.html')

@app.route('/offre')
async def offre():
    return await send_from_directory('html 1', 'offre.html')

@app.route('/Stratégie')
async def strategie():
    return await send_from_directory('html 1', 'Stratégie.html')

@app.route('/équipe')
async def equipe():
    return await send_from_directory('html 1', 'équipe.html')

@app.route('/jeux')
async def jeux():
    return await send_from_directory('html 1', 'jeux.html')

@app.route('/connexion & inscription')
async def connexion_inscription():
    return await send_from_directory('html 1', 'connexion & inscription.html')

@app.route('/home')
async def home():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'home.html')

@app.route('/target')
async def target():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'target.html')

@app.route('/ordre')
async def ordre():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'ordre.html')

@app.route('/desktop')
async def desktop():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'rot-blade-desktop.html')

@app.route('/mobile')
async def mobile():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'rot-blade-mobile.html')

@app.route('/callbacks')
async def call():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'dépot.html')

@app.route('/profil')
async def profil():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'profil.html')

@app.route('/store')
async def store():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'store.html')

@app.route('/Game')
async def game():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'Game.html')

@app.route('/admin')
async def admin():
    user_id = session.get('user_id')
    if not user_id:
        return redirect('/connexion & inscription')
    if user_id != 11:
        return redirect('/home')
    return await send_from_directory('html 1', 'Admin.html')

@app.route('/paramètre')
async def parametre():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'paramètre.html')

@app.route('/chat')
async def chat():
    return await send_from_directory('html 1', 'chat.html')

@app.route('/recharger')
async def recharger():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'dépot.html')

@app.route('/historique')
async def historiqueD():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'historiqueD.html')

@app.route('/historique1')
async def historiqueR():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'historiqueR.html')

@app.route('/retirer')
async def retirer():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'retrait.html')

@app.route('/achat')
async def achat():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('html 1', 'achat.html')

@app.route('/stats')
async def stats():
    if 'user_id' not in session:
        return redirect('/connexion-inscription')

    user_id = session['user_id']
    pool = await get_pool()

    query = """
        SELECT COUNT(*) AS total
        FROM product_purchases
        WHERE user_id = %s
        AND product_name IN ('Badge Or Exclusif', 'Pass VIP 7 jours')
    """

    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(query, (user_id,))
            result = await cur.fetchone()

    count = result['total'] if result else 0

    if count > 0:
        return await send_from_directory('html 1', 'stats.html')
    else:
        return redirect('/home')

# -------------------
# Routes Jeux
# -------------------
@app.route('/cloud_run')
async def cloud_run():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Cloud Run.html')

@app.route('/cloud_run1')
async def cloud_run1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Cloud Run1.html')

@app.route('/memo_pop')
async def memo_pop():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'MemoPop.html')

@app.route('/memo_pop1')
async def memo_pop2():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'MemoPop1.html')

@app.route('/syno_pop')
async def syno_pop():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'SynoPop.html')

@app.route('/syno_pop1')
async def syno_pop1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'SynoPop1.html')

@app.route('/avoid')
async def avoid():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Avoid.html')

@app.route('/avoid1')
async def avoid1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Avoid1.html')

@app.route('/tropi_twist')
async def tropi_twist():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TropiTwist.html')

@app.route('/tropi_twist1')
async def tropi_twist1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TropiTwist1.html')

@app.route('/tapline')
async def tapline():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TapLine.html')

@app.route('/tapline1')
async def tapline1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TapLine1.html')

@app.route('/lettricide')
async def lettricide():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Lettricide.html')

@app.route('/lettricide1')
async def lettricide1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Lettricide1.html')

@app.route('/block_break')
async def block():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'BlockBreak.html')

@app.route('/block_breack1')
async def bloock():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'BlockBreak1.html')

@app.route('/block_breack')
async def blàock():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'BlockBreak.html')

@app.route('/block_break1')
async def block1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'BlockBreak1.html')

@app.route('/api/is_logged_in')
async def is_logged_in():
    return jsonify({'logged_in': 'user_id' in session})

@app.route('/tap_line')
async def tline():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TapLine.html')

@app.route('/tap_line1')
async def tline1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TapLine1.html')

@app.route('/2048')
async def l2048():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', '2048.html')

@app.route('/20481')
async def l20481():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', '20481.html')

@app.route('/neuro_dame')
async def dame():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'NeuroDame.html')

@app.route('/neuro_dame1')
async def dame1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'NeuroDame1.html')

@app.route('/xo_clash')
async def xo():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'XO Clash.html')

@app.route('/xo_clash1')
async def xo1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'XO Clash1.html')

@app.route('/neuro_quiz')
async def neuro():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'NeuroQuiz.html')

@app.route('/neuro_quiz1')
async def neuro1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'NeuroQuiz1.html')

@app.route('/trend_up')
async def trend():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TrendUp.html')

@app.route('/trend_up1')
async def trend1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TrendUp1.html')

@app.route('/world_cap')
async def world():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'WorldCap.html')

@app.route('/world_cap1')
async def world1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'WorldCap1.html')

@app.route('/grid_pop')
async def grid():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'GridPop.html')

@app.route('/grid_pop1')
async def grid1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'GridPop1.html')

@app.route('/lecttricide')
async def lecttriicide1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Lettricide.html')

@app.route('/lecttricide1')
async def lecttriicide():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Lettricide1.html')

@app.route('/falling_tiles')
async def falling():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Falling Tiles.html')

@app.route('/falling_tiles1')
async def falling1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Falling Tiles1.html')

@app.route('/flappy_jump')
async def flappy():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'FlappyJump.html')

@app.route('/flappy_jump1')
async def flappy1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'FlappyJump1.html')

@app.route('/galaxy_shooter')
async def galaxy():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Galaxy Shooter.html')

@app.route('/galaxy_shooter1')
async def galaxy1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Galaxy Shooter1.html')

@app.route('/top_mind')
async def top():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TopMind.html')

@app.route('/top_mind1')
async def top1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'TopMind1.html')


@app.route('/w-risk')
async def w_risk():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-risk.html')

@app.route('/w-risk1')
async def w_risk1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-risk1.html')

@app.route('/w-drive1')
async def w_drive1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-drive1.html')

@app.route('/w-drive')
async def w_drive():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-drive.html')

@app.route('/wdrive1')
async def w_driive():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-drive1.html')


@app.route('/w-cloud1')
async def w_cloud1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-cloud1.html')

@app.route('/wcloud1')
async def w_cCloud1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-cloud1.html')

@app.route('/w-cloud')
async def w_cloud():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'w-cloud.html')


@app.route('/dino_run')
async def dino():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Dino Run.html')

@app.route('/dino_run1')
async def dino1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Dino Run1.html')

@app.route('/snake')
async def snake():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Snake.html')

@app.route('/snake1')
async def snake1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Snake1.html')

@app.route('/flash_math')
async def flash():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Flash Math.html')

@app.route('/flash_math1')
async def flash1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Flash Math1.html')

@app.route('/labyrinthe')
async def labyrinthe():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'labyrinthe.html')

@app.route('/labyrinthe1')
async def labyrinthe1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'labyrinthe1.html')

@app.route('/mine')
async def mine():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Mine.html')

@app.route('/mine1')
async def mine1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Mine1.html')

@app.route('/ana_mind')
async def ana():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Ana Mind.html')

@app.route('/ana_mind1')
async def ana1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Ana Mind1.html')

@app.route('/speed_mind')
async def speed():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Speed Mind.html')

@app.route('/speed_mind1')
async def speed1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Speed Mind1.html')

@app.route('/smart_battle')
async def smart():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Smart Battle.html')

@app.route('/smart_battle1')
async def smart1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Smart Battle1.html')

@app.route('/dash_jump')
async def dash():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Dash Jump.html')

@app.route('/dash_jump1')
async def dash1():
    if 'user_id' not in session:
        return redirect('/connexion & inscription')
    return await send_from_directory('Jeux', 'Dash Jump1.html')

# -------------------
# Pages statiques
# -------------------
@app.route('/offline')
async def offline():
    return await send_from_directory('html 1', 'noconnect.html')

@app.route('/condition')
async def condition():
    return await send_from_directory('html 1', 'condition.html')

@app.route('/acces_refuser')
async def acces_refuser():
    return await send_from_directory('html 1', '403.html')

@app.errorhandler(404)
async def not_found(e):
    return await send_from_directory('html 1', '404.html'), 404

@app.errorhandler(405)
async def method_not_allowed(e):
    return await send_from_directory('html 1', '405.html'), 405

@app.route("/manifest.json")
async def manifest():
    dir_path = os.path.join(app.root_path, "html 1", "lang")
    return await send_from_directory(dir_path, "manifest.json")

@app.route("/service-worker.js")
async def sw():
    dire_path = os.path.join(app.root_path, "html 1", "js")
    return await send_from_directory(dire_path, "service-worker.js")

@app.route('/template.json')
async def serve_template():
    return await send_from_directory('html 1', 'template.json', mimetype='application/json')

# -------------------
# Routes static files avec fallback
# -------------------
@app.route('/img/<path:filename>')
async def serv_image(filename):
    path1 = os.path.join('Jeux/img', filename)
    if os.path.exists(path1):
        return await send_from_directory('Jeux/img', filename)
    path2 = os.path.join('html 1/img', filename)
    if os.path.exists(path2):
        return await send_from_directory('html 1/img', filename)
    abort(404)

@app.route('/js/<path:filename>')
async def serv_js(filename):
    path1 = os.path.join('Jeux/js', filename)
    if os.path.exists(path1):
        return await send_from_directory('Jeux/js', filename)
    path2 = os.path.join('html 1/js', filename)
    if os.path.exists(path2):
        return await send_from_directory('html 1/js', filename)
    abort(404)

@app.route('/css/<path:filename>')
async def serv_css(filename):
    path1 = os.path.join('Jeux/css', filename)
    if os.path.exists(path1):
        return await send_from_directory('Jeux/css', filename)
    path2 = os.path.join('html 1/CSS', filename)
    if os.path.exists(path2):
        return await send_from_directory('html 1/CSS', filename)
    abort(404)

@app.route('/check-verification-status', methods=['GET'])
async def check_verification_status():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"verify": False, "error": "Non connecté"}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT verify FROM users WHERE id = %s", (user_id,))
            result = await cursor.fetchone()
            verify = result[0] if result else 0

    return jsonify({"verify": verify})

@app.route('/deactivate-referral', methods=['POST'])
async def deactivate_referral():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Non connecté"}), 401

    try:
        db_pool = await get_pool()
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE users SET email_notifications = 0 WHERE id = %s",
                    (user_id,)
                )
                await conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


SMTP_USERNAME = os.getenv("EMAIL_ADDRESS")
SMTP_PASSWORD = os.getenv("EMAIL_PASSWORD")

recovery_codes = {}

def send_email_sync(to_email, body, subject="Code de vérification"):
    msg = MIMEText(body, "html", "utf-8")
    msg["From"] = SMTP_USERNAME
    msg["To"] = to_email
    msg["Subject"] = subject

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(msg)

@app.route("/send-recovery-email", methods=["POST"])
async def send_recovery_email():
    try:
        data = await request.get_json()
        email_to = data.get("value")
        if not email_to:
            return jsonify({"success": False, "message": "Aucune valeur fournie"}), 400

        # Récupérer le user_id depuis la table users
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT id FROM users WHERE email=%s", (email_to,))
                user = await cur.fetchone()
                if not user:
                    return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
                user_id = user[0]

        # Génération du code et expiration
        code = str(random.randint(100000, 999999))
        expire_time = datetime.now() + timedelta(minutes=15)
        recovery_codes[email_to] = code

        # Corps HTML de l'email
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2d3748;">Bonjour,</h2>
                    <p>Nous avons reçu une demande de vérification pour votre compte. Voici votre code de sécurité :</p>
                    <div style="background: #f8f9fa; border: 1px dashed #e2e8f0; 
                             padding: 15px; text-align: center; margin: 20px 0; 
                             font-size: 24px; font-weight: bold; color: #4f46e5;">
                        {code}
                    </div>
                    <p>Ce code est valable pendant 15 minutes. Ne le partagez avec personne.</p>
                    <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email ou 
                       <a href="mailto:support@votresite.com" style="color: #4f46e5;">nous contacter</a>.</p>
                    <p style="margin-top: 30px;">Cordialement,<br>
                    <strong>L'équipe de [LalmaTech]</strong></p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #718096;">
                        Pour des raisons de sécurité, ne répondez pas à cet email. 
                        © {datetime.now().year} [WariPlay]. Tous droits réservés.
                    </p>
                </div>
            </body>
        </html>
        """

        # Envoi de l'email dans un thread séparé
        await asyncio.to_thread(send_email_sync, email_to, body)

        # Insertion du code dans la base avec asyncmy
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO verification_gmail (user_id, code, expires_at)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE code=%s, expires_at=%s
                    """,
                    (user_id, code, expire_time, code, expire_time)
                )

        return jsonify({"success": True, "message": "Email envoyé et code enregistré avec succès"})

    except Exception as e:
        return jsonify({"success": False, "message": f"Erreur: {e}"})

recovery_codes = {}

@app.route('/verify-email-code', methods=['POST'])
async def verify_email_codes():
    try:
        data = await request.get_json()
        email_to = data.get('value')
        code_client = data.get('code')
        
        if not email_to or not code_client:
            return jsonify({"success": False, "message": "Données manquantes"}), 400

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM users WHERE email=%s", (email_to,))
                user = await cursor.fetchone()
                if not user:
                    return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
                user_id = user[0]

                await cursor.execute(
                    "SELECT code, expires_at FROM verification_gmail WHERE user_id=%s",
                    (user_id,)
                )
                result = await cursor.fetchone()
                if not result:
                    return jsonify({"success": False, "message": "Code inexistant ou déjà utilisé"}), 404

                code_db, expires_at = result
                if code_db != code_client:
                    return jsonify({"success": False, "message": "Code invalide"}), 400
                if expires_at < datetime.now():
                    return jsonify({"success": False, "message": "Code expiré"}), 400

                await cursor.execute(
                    "UPDATE users SET verify=1 WHERE id=%s",
                    (user_id,)
                )

        if email_to in recovery_codes:
            del recovery_codes[email_to]

        popup_html = f"""
<div id="resetPasswordOverlay" class="reset-password-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 1004; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(10px);">
    <div class="reset-password-content" style="background: rgba(0, 0, 0, 0.25); border-radius: 20px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4); backdrop-filter: blur(15px); padding: 40px; width: 90%; max-width: 450px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); animation: fadeIn 0.3s ease;">
        <h2 style="color: white; margin-bottom: 10px;"><i class="fas fa-key" style="color: #00ff99;"></i> Nouveau mot de passe</h2>
        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 25px;">Créez un nouveau mot de passe sécurisé</p>
        
        <form method="POST" action="/update-password" onsubmit="return validateAndSubmitForm(this)">
            <input type="hidden" name="email" value="{email_to}">
            
            <div class="input-group" style="margin-bottom: 25px; text-align: left; position: relative;">
                <input type="text" name="new_password" id="newPassword" placeholder="Nouveau mot de passe" required style="width: 100%; padding: 15px 20px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; background: rgba(255, 255, 255, 0.1); color: white; outline: none; transition: 0.3s; font-size: 16px; box-sizing: border-box;" onfocus="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.boxShadow='0 0 0 2px #00ff99'; this.style.borderColor='#00ff99'" onblur="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.boxShadow='none'; this.style.borderColor='rgba(255, 255, 255, 0.1)'" onkeyup="if(window.checkPasswordStrength) window.checkPasswordStrength()" />
            </div>
            
            <div class="input-group" style="margin-bottom: 25px; text-align: left; position: relative;">
                <input type="text" name="confirm_password" id="confirmPassword" placeholder="Confirmer le mot de passe" required style="width: 100%; padding: 15px 20px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; background: rgba(255, 255, 255, 0.1); color: white; outline: none; transition: 0.3s; font-size: 16px; box-sizing: border-box;" onfocus="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.boxShadow='0 0 0 2px #00ff99'; this.style.borderColor='#00ff99'" onblur="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.boxShadow='none'; this.style.borderColor='rgba(255, 255, 255, 0.1)'" />
            </div>

            <div class="password-strength" id="passwordStrength" style="margin: 10px 0; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.1); overflow: hidden;">
                <div class="password-strength-bar" id="passwordStrengthBar" style="height: 100%; width: 0%; transition: all 0.3s ease; border-radius: 3px; background: #ff4757;"></div>
            </div>

            <div class="password-requirements" style="text-align: left; margin: 15px 0; font-size: 12px;">
                <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li id="reqLength" class="invalid" style="margin: 5px 0; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.5);">
                        <i class="fas fa-circle" style="font-size: 14px; color: currentColor;"></i>
                        <span>Au moins 8 caractères</span>
                    </li>
                    <li id="reqUppercase" class="invalid" style="margin: 5px 0; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.5);">
                        <i class="fas fa-circle" style="font-size: 14px; color: currentColor;"></i>
                        <span>Une lettre majuscule</span>
                    </li>
                    <li id="reqLowercase" class="invalid" style="margin: 5px 0; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.5);">
                        <i class="fas fa-circle" style="font-size: 14px; color: currentColor;"></i>
                        <span>Une lettre minuscule</span>
                    </li>
                    <li id="reqNumber" class="invalid" style="margin: 5px 0; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.5);">
                        <i class="fas fa-circle" style="font-size: 14px; color: currentColor;"></i>
                        <span>Un chiffre</span>
                    </li>
                    <li id="reqSpecial" class="invalid" style="margin: 5px 0; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.5);">
                        <i class="fas fa-circle" style="font-size: 14px; color: currentColor;"></i>
                        <span>Un caractère spécial</span>
                    </li>
                </ul>
            </div>

            <div id="resetPasswordResult" class="recovery-result" style="margin: 15px 0; font-size: 14px; color: #ff4757;"></div>

            <div class="recovery-buttons" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button id="resetPasswordButton" type="submit" style="position: relative; width: 100%; padding: 15px; border: none; border-radius: 12px; background: #00ff99; color: #001f3f; font-weight: 600; font-size: 16px; cursor: pointer; transition: 0.3s; overflow: hidden; box-shadow: 0 5px 15px rgba(0, 255, 153, 0.3);" onmouseover="if(!this.classList.contains('loading')){{this.style.background='#00e187'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0, 255, 153, 0.4)';}}" onmouseout="if(!this.classList.contains('loading')){{this.style.background='#00ff99'; this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 15px rgba(0, 255, 153, 0.3)';}}">
                    <span class="btn-text">Réinitialiser</span>
                    <div class="advanced-loader" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px;">
                        <div class="orbit" style="position: absolute; width: 100%; height: 100%; border: 2px solid transparent; border-radius: 50%; animation: orbitSpin 1.5s linear infinite; border-top: 2px solid #001f3f;"></div>
                        <div class="orbit" style="position: absolute; width: 100%; height: 100%; border: 2px solid transparent; border-radius: 50%; animation: orbitSpin 1.5s linear infinite; border-right: 2px solid #001f3f; animation-delay: 0.1s;"></div>
                        <div class="orbit" style="position: absolute; width: 100%; height: 100%; border: 2px solid transparent; border-radius: 50%; animation: orbitSpin 1.5s linear infinite; border-bottom: 2px solid #001f3f; animation-delay: 0.2s;"></div>
                        <div class="core" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #001f3f; border-radius: 50%; animation: corePulse 1.5s ease-in-out infinite;"></div>
                    </div>
                </button>
                <button type="button" onclick="window.location.href='/connexion & inscription'" style="padding: 15px 25px; border: none; border-radius: 12px; background: rgba(255, 255, 255, 0.1); color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: 0.3s; border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">Annuler</button>
            </div>
        </form>
    </div>
</div>

<style>
@keyframes fadeIn {{
    from {{ opacity: 0; transform: scale(0.95); }}
    to {{ opacity: 1; transform: scale(1); }}
}}

@keyframes orbitSpin {{
    0% {{ transform: rotate(0deg); }}
    100% {{ transform: rotate(360deg); }}
}}

@keyframes corePulse {{
    0%, 100% {{ transform: translate(-50%, -50%) scale(1); opacity: 1; }}
    50% {{ transform: translate(-50%, -50%) scale(1.3); opacity: 0.7; }}
}}

@media (max-width: 480px) {{
    .reset-password-content {{ padding: 25px !important; }}
    .recovery-buttons {{ flex-direction: column !important; }}
}}
</style>

<script>
// Définir les fonctions globalement AVANT de les utiliser
window.checkPasswordStrength = function() {{
    const password = document.getElementById('newPassword')?.value || '';
    const bar = document.getElementById('passwordStrengthBar');
    if(!bar) return;
    
    let strength = 0;
    if(password.length >= 8) strength++;
    if(/[A-Z]/.test(password)) strength++;
    if(/[a-z]/.test(password)) strength++;
    if(/[0-9]/.test(password)) strength++;
    if(/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Mettre à jour la barre
    bar.style.width = (strength * 20) + '%';
    if(strength <= 2) {{
        bar.style.background = '#ff4757';
    }} else if(strength <= 4) {{
        bar.style.background = '#ffa500';
    }} else {{
        bar.style.background = '#2ed573';
    }}
    
    // Mettre à jour les critères
    const updateRequirement = function(id, condition) {{
        const el = document.getElementById(id);
        if(el) {{
            el.style.color = condition ? '#2ed573' : 'rgba(255, 255, 255, 0.5)';
        }}
    }};
    
    updateRequirement('reqLength', password.length >= 8);
    updateRequirement('reqUppercase', /[A-Z]/.test(password));
    updateRequirement('reqLowercase', /[a-z]/.test(password));
    updateRequirement('reqNumber', /[0-9]/.test(password));
    updateRequirement('reqSpecial', /[^A-Za-z0-9]/.test(password));
}};

window.validateAndSubmitForm = function(form) {{
    const password = document.getElementById('newPassword')?.value || '';
    const confirm = document.getElementById('confirmPassword')?.value || '';
    const resultDiv = document.getElementById('resetPasswordResult');
    const btn = document.getElementById('resetPasswordButton');
    
    if(password !== confirm) {{
        if(resultDiv) resultDiv.innerHTML = 'Les mots de passe ne correspondent pas';
        return false;
    }}
    
    if(password.length < 8) {{
        if(resultDiv) resultDiv.innerHTML = 'Le mot de passe doit contenir au moins 8 caractères';
        return false;
    }}
    
    // Ajouter le loader
    if(btn) {{
        btn.classList.add('loading');
        btn.style.pointerEvents = 'none';
        btn.style.background = '#00e187';
        
        const btnText = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.advanced-loader');
        if(btnText) btnText.style.opacity = '0';
        if(loader) loader.style.display = 'block';
    }}
    
    // Soumettre le formulaire
    setTimeout(() => {{
        form.submit();
    }}, 100);
    
    return false;
}};

// Appliquer le style initial après un court délai pour être sûr que le DOM est chargé
setTimeout(function() {{
    if(window.checkPasswordStrength) {{
        window.checkPasswordStrength();
    }}
}}, 100);
</script>
"""

        return jsonify({
            "success": True,
            "message": "Code vérifié avec succès",
            "popup_html": popup_html
        })

    except Exception as e:
        return jsonify({"success": False, "message": f"Erreur: {str(e)}"}), 500


@app.route('/update-password', methods=['POST'])
async def update_passwords():
    try:
        form = await request.form
        email = form.get('email')
        new_password = form.get('new_password')
        confirm_password = form.get('confirm_password')

        if not email or not new_password or not confirm_password:
            return "Données manquantes", 400
        if new_password != confirm_password:
            return "Les mots de passe ne correspondent pas", 400

        # --- Hashage du mot de passe avec bcrypt ---
        loop = asyncio.get_event_loop()
        hashed_password = await loop.run_in_executor(
            None,
            lambda: bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
        )

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
                user = await cursor.fetchone()
                if not user:
                    return "Utilisateur introuvable", 404
                user_id = user[0]

                await cursor.execute(
                    "UPDATE users SET password=%s WHERE id=%s",
                    (hashed_password, user_id)
                )

        # --- Mettre l'utilisateur en session et rediriger ---
        session['user_id'] = user_id
        return redirect('/home')

    except Exception as e:
        return f"<p style='color:red;'>Erreur: {str(e)}</p>", 500


# Config Google OAuth2
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://127.0.0.1:5000/google-callback"

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

flow = Flow.from_client_config(
    {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [GOOGLE_REDIRECT_URI],
            "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
        }
    },
    scopes=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_uri=GOOGLE_REDIRECT_URI
)

# ----- Helpers async Google OAuth -----
async def async_fetch_token(authorization_response: str):
    # Passer l'argument nommé pour éviter le TypeError
    await asyncio.to_thread(flow.fetch_token, authorization_response=authorization_response)

async def async_verify_token(id_token_str: str, client_id: str):
    request_session = grequests.Request()
    return await asyncio.to_thread(id_token.verify_oauth2_token, id_token_str, request_session, client_id)

# ----- Route login -----
@app.route("/login1")
async def login1():
    try:
        authorization_url, state = flow.authorization_url(
            prompt="consent",
            access_type="offline",
            include_granted_scopes="true"
        )
        session["state"] = state
        return redirect(authorization_url)
    except Exception as e:
        tb = traceback.format_exc()
        error_msg = quote(f"Erreur login : {str(e)}")
        return redirect(f"/connexion & inscription")

# ----- Route callback Google -----
@app.route("/google-callback")
async def callback():
    try:
        # 1️⃣ Fetch token Google
        try:
            await async_fetch_token(str(request.url))
        except Exception as e:
            tb = traceback.format_exc()
            error_msg = quote(f"Erreur fetch_token : {str(e)}")
            return redirect(f"/connexion & inscription?error={error_msg}")

        # 2️⃣ Vérification de l'état de session
        try:
            if session.get("state") != request.args.get("state"):
                error_msg = quote("Erreur de sécurité : état invalide.")
                return redirect(f"/connexion & inscription?error={error_msg}")
        except Exception as e:
            tb = traceback.format_exc()
            error_msg = quote(f"Erreur session/state : {str(e)}")
            return redirect(f"/connexion & inscription?error={error_msg}")

        # 3️⃣ Vérification du token Google
        try:
            id_info = await async_verify_token(flow.credentials._id_token, GOOGLE_CLIENT_ID)
        except google_exceptions.InvalidValue:
            error_msg = quote("Erreur de connexion : horloge de votre appareil incorrecte.")
            return redirect(f"/connexion & inscription?error={error_msg}")
        except Exception as e:
            tb = traceback.format_exc()
            error_msg = quote(f"Erreur verify_token : {str(e)}")
            return redirect(f"/connexion & inscription?error={error_msg}")

        # 4️⃣ Extraction infos utilisateur
        try:
            google_id = id_info.get("sub")
            email = id_info.get("email")
            name = id_info.get("name")
            picture = id_info.get("picture")
        except Exception as e:
            tb = traceback.format_exc()
            error_msg = quote(f"Erreur extraction infos utilisateur : {str(e)}")
            return redirect(f"/connexion & inscription?error={error_msg}")

        # 5️⃣ DB async
        try:
            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SELECT id FROM users WHERE google_id=%s", (google_id,))
                    user = await cur.fetchone()

                    if user is None:
                        await cur.execute(
                            "INSERT INTO users (email, name, google_id, picture, created_at) VALUES (%s, %s, %s, %s, NOW())",
                            (email, name, google_id, picture)
                        )
                        user_id = cur.lastrowid
                    else:
                        user_id = user[0]
                        await cur.execute(
                            "UPDATE users SET email=%s, name=%s, picture=%s WHERE google_id=%s",
                            (email, name, picture, google_id)
                        )
        except Exception as e:
            tb = traceback.format_exc()
            error_msg = quote(f"Erreur base de données : {str(e)}")
            return redirect(f"/connexion & inscription?error={error_msg}")

        # 6️⃣ Stockage en session
        try:
            session["user_id"] = user_id
            session["user_name"] = name
            session["user_email"] = email
        except Exception as e:
            tb = traceback.format_exc()
            error_msg = quote(f"Erreur session : {str(e)}")
            return redirect(f"/connexion & inscription?error={error_msg}")

        return redirect(url_for("home"))

    except Exception as e:
        # Erreur globale
        tb = traceback.format_exc()
        error_msg = quote(f"Erreur inattendue : {str(e)}")
        return redirect(f"/connexion & inscription?error={error_msg}")


# --- Vérification reCAPTCHA async ---
async def verify_recaptcha_async(token: str) -> Dict[str, Any]:

    if not token:
        return {'success': False, 'error': 'Token manquant'}

    async with aiohttp.ClientSession() as session_http:
        try:
            async with session_http.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": RECAPTCHA_SECRET,
                    "response": token
                },
                headers={
                    "User-Agent": "Python/Quart"
                }
            ) as response:
                
                text = await response.text()
                
                return await response.json()
        except Exception as e:

            traceback.print_exc()
            return {'success': False, 'error': str(e)}


# --- Hash mot de passe async ---
async def hash_password_async(raw_password: str) -> str:
    loop = asyncio.get_event_loop()
    salt = await loop.run_in_executor(None, bcrypt.gensalt)
    hashed = await loop.run_in_executor(None, lambda: bcrypt.hashpw(raw_password.encode(), salt))
    return base64.b64encode(hashed).decode("utf-8")  # stockable en VARCHAR


#CREATE TABLE codes (
#    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
#    email VARCHAR(255) NOT NULL,                        -- Email du destinataire
#    password VARCHAR(255) NOT NULL,                     -- Mot de passe (hashé)
#    code CHAR(6) NOT NULL,                              -- Code à 6 chiffres
#    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Date de création
#    expires_at DATETIME NOT NULL,                       -- Date d'expiration
#    used TINYINT(1) NOT NULL DEFAULT 0,                -- 0 = non utilisé, 1 = utilisé
#    INDEX idx_email (email),
#    INDEX idx_expires_at (expires_at)
#) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# --- Fonction interne pour envoyer le code de récupération ---

async def send_recovery_code_session(email_to, raw_password):
    try:
        # Génération du code et expiration
        code = str(random.randint(100000, 999999))
        expire_time = datetime.now() + timedelta(minutes=15)

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """
                    INSERT INTO codes (email, password, code, expires_at)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        password = VALUES(password),
                        code = VALUES(code),
                        expires_at = VALUES(expires_at),
                        used = 0
                    """,
                    (email_to, raw_password, code, expire_time)
                )
                await conn.commit()

        # Corps HTML de l'email
        body = f"""
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color:#f4f6f8; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="text-align:center; padding-bottom:20px;">
              <h1 style="margin:0; font-size:24px; color:#1f2937;">Bonjour !</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 20px 20px 20px; text-align:center;">
              <p style="margin:0; font-size:16px; line-height:1.6; color:#4b5563;">
                Voici votre code de sécurité pour confirmer votre identité :
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:10px 0;">
              <div style="display:inline-block; background-color:#eef2ff; color:#4f46e5; font-size:28px; font-weight:bold; padding:15px 25px; border-radius:8px; letter-spacing:4px;">
                {code}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 20px 10px 20px; text-align:center;">
              <p style="margin:0; font-size:14px; color:#6b7280;">
                Ce code est valable pendant 15 minutes. Ne le partagez avec personne.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px; text-align:center;">
              <p style="margin:0; font-size:14px; color:#6b7280;">
                Cordialement,<br>
                <strong>L'équipe de [LalmaTech]</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:30px; text-align:center; font-size:12px; color:#9ca3af;">
              <p style="margin:0;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

        # Envoi de l'email dans un thread séparé
        await asyncio.to_thread(send_email_sync, email_to, body)

        return {"success": True, "message": "Email envoyé et code stocké en base."}

    except Exception as e:
        traceback.print_exc()
        return {"success": False, "message": f"Erreur interne: {e}"}


# --- Route register ---
@app.route('/register', methods=['POST'])
async def register():
    try:
        data = await request.get_json()
        email = data.get('email')
        raw_password = data.get('password')
        recaptcha_token = data.get('recaptcha')

        if not email or not raw_password:
            return jsonify({'success': False, 'message': 'Email ou mot de passe manquant.'})

        # --- Vérification reCAPTCHA ---
        recaptcha_result = await verify_recaptcha_async(recaptcha_token)
        if not recaptcha_result.get('success'):
            return jsonify({'success': False, 'message': 'Échec de la vérification reCAPTCHA.'})

        # --- Vérification complexité mot de passe ---
        if not any(c.isalpha() for c in raw_password) or not any(c.isdigit() for c in raw_password):
            return jsonify({'success': False, 'message': 'Le mot de passe doit contenir au moins une lettre et un chiffre.'})

        # --- Vérification si l'utilisateur existe déjà ---
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1 FROM users WHERE email=%s LIMIT 1", (email,))
                exists = await cur.fetchone()

        if exists:
            return jsonify({'success': False, 'message': 'Cet utilisateur existe déjà.'})

        # --- Génération + stockage code en session ---
        send_result = await send_recovery_code_session(email, raw_password)
        if not send_result['success']:
            return jsonify(send_result)

        # --- Retourne le popup avec formulaire vers /verify-coded ---
        popup_html = f"""
        <div id="popup-overlay" role="dialog" aria-modal="true" style="
          position:fixed;top:0;left:0;width:100%;height:100%;
          background:rgba(0,0,0,0.65);display:flex;align-items:center;
          justify-content:center;z-index:9999;">
          
          <div style="
            background:#ffffff;padding:26px;border-radius:16px;
            width:92%;max-width:420px;text-align:center;
            box-shadow:0 12px 36px rgba(15,23,42,0.18);
            font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
            
            <h2 style="margin:0 0 12px 0;font-size:1.25rem;color:#121212;font-weight:600;">
              Vérification du code
            </h2>
            
            <p style="margin:0 0 18px 0;font-size:0.98rem;color:#444;">
              Entrez le code reçu par email pour confirmer votre identité.
            </p>

            <form method="POST" action="/verify-coded">
              <input type="text" name="code" maxlength="6" inputmode="numeric" placeholder="Ex: 458921"
                style="width:100%;padding:12px 14px;font-size:1rem;margin:12px 0 18px 0;
                       border:1px solid rgba(15,23,42,0.08);border-radius:12px;outline:none;
                       text-align:center;letter-spacing:4px;font-weight:600;color:#111;background:#fbfbfd;" />

              <div style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;">
                <button type="submit" style="flex:1 1 48%;min-width:120px;padding:12px 16px;
                  border:0;border-radius:10px;background:#0b5fff;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;">
                  Vérifier
                </button>
                <button type="button" onclick="document.getElementById('popup-overlay').remove()" style="flex:1 1 48%;min-width:120px;padding:12px 16px;
                  border:1px solid rgba(15,23,42,0.06);border-radius:10px;background:#fff;
                  color:#222;font-weight:700;font-size:1rem;cursor:pointer;">
                  Annuler
                </button>
              </div>
            </form>

          </div>
        </div>
        """
        return Response(popup_html, mimetype="text/html")

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Erreur générale: {str(e)}'})


# --- Route pour vérifier le code stocké en session ---

@app.route('/verify-coded', methods=['POST'])
async def verify_coded():
    try:
        data = await request.form
        code = data.get('code')

        if not code:
            print("Erreur: aucun code fourni")
            return redirect('/connexion')  # <-- redirection sur erreur

        pool = await get_pool()

        # --- Vérifier le code dans la table `codes` ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT email, password, expires_at, used FROM codes WHERE code=%s LIMIT 1",
                    (code,)
                )
                row = await cursor.fetchone()

        if not row:
            print(f"Erreur: code incorrect -> {code}")
            return redirect('/connexion & inscription')

        email, raw_password, expires_at, used = row
        expires_at = expires_at if isinstance(expires_at, datetime) else datetime.fromisoformat(str(expires_at))

        if used:
            print(f"Erreur: code déjà utilisé -> {code}")
            return redirect('/connexion & inscription')

        if datetime.now() > expires_at:
            print(f"Erreur: code expiré -> {code}")
            return redirect('/connexion & inscription')

        # --- Vérification si l'utilisateur existe déjà ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
                existing_user = await cursor.fetchone()
                if existing_user:
                    print(f"Erreur: utilisateur déjà existant -> {email}")
                    return redirect('/connexion & inscription')

        # --- Hash du mot de passe ---
        hashed_password_bytes = await asyncio.to_thread(
            bcrypt.hashpw,
            raw_password.encode(),
            bcrypt.gensalt()
        )
        hashed_password = hashed_password_bytes.decode('utf-8')

        # --- Préparer infos utilisateur ---
        local_part = email.split('@')[0]
        name = local_part.replace('.', ' ').replace('_', ' ').title()
        picture_path = 'img/warii.png'

        # --- Insertion dans la table `users` ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO users (email, password, picture, name) VALUES (%s, %s, %s, %s)",
                    (email, hashed_password, picture_path, name)
                )
                user_id = cursor.lastrowid
                await conn.commit()

        # --- Marquer le code comme utilisé ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("UPDATE codes SET used=1 WHERE code=%s", (code,))
                await conn.commit()

        # --- Stocker l'ID utilisateur dans la session ---
        session['user_id'] = user_id

        # --- Redirection vers /home ---
        return redirect('/home')

    except Exception as e:
        traceback.print_exc()
        return redirect('/connexion & inscription')  # <-- redirection en cas d'erreur serveur


# ==============================
# Vérification reCAPTCHA
# ==============================
async def verify_recaptcha(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": RECAPTCHA_SECRET,
                "response": token
            }
        )
        return response.json()


# ==============================
# Vérification mot de passe
# ==============================

async def verify_password(raw_password: str, stored_password: str) -> bool:
    loop = asyncio.get_event_loop()

    def check():
        # Premièrement : essayer le base64
        try:
            decoded = base64.b64decode(stored_password).decode('utf-8')
            if raw_password == decoded:
                return True
        except Exception:
            pass

        # Ensuite : vérifier le hash bcrypt
        try:
            return bcrypt.checkpw(raw_password.encode(), stored_password.encode())
        except Exception:
            return False

    return await loop.run_in_executor(None, check)


# ==============================
# Route /login
# ==============================
@app.route('/login', methods=['POST'])
async def login():
    try:
        data = await request.get_json()
        email = data.get("email")
        raw_password = data.get("password")
        recaptcha_token = data.get("recaptcha_token")

        if not email or not raw_password:
            return jsonify({"error": "Email et mot de passe requis"}), 400
        if not recaptcha_token:
            return jsonify({"error": "Captcha manquant"}), 400

        # Vérification reCAPTCHA
        verification_result = await verify_recaptcha(recaptcha_token)
        print("Résultat reCAPTCHA:", verification_result)  # debug console

        if not verification_result.get("success") or verification_result.get("score", 0) < 0.5:
            return jsonify({"error": "Échec vérification reCAPTCHA"}), 403

        # Connexion à la base de données
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Vérifier utilisateur
                await cursor.execute(
                    "SELECT id, password FROM users WHERE email = %s",
                    (email,)
                )
                user = await cursor.fetchone()

                if user:
                    user_id, hashed_password = user
                    if await verify_password(raw_password, hashed_password):
                        # --- Connexion réussie, mettre user en session ---
                        session["user_id"] = user_id
                        session["email"] = email
                        return jsonify({"success": True})
        
        return jsonify({"error": "Identifiants incorrects"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# Vérification du code 2FA
# ==============================
@app.route('/verify-code', methods=['POST'])
async def verify_code():
    data = await request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({'success': False, 'message': "Code manquant"}), 400

    # Utiliser temp_user_id au lieu de user_id
    user_id = session.get('temp_user_id')
    if not user_id:
        return jsonify({'success': False, 'message': "Utilisateur non connecté (temp)"}), 401

    # Connexion asynchrone via pool
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT code FROM verification_codes WHERE user_id = %s", (user_id,))
            db_code = await cursor.fetchone()

    if db_code and db_code[0] == code:
        # Marquer utilisateur comme vérifié
        session['verified'] = True

        # Passer user_id et email de temp vers session principale
        session['user_id'] = session.pop('temp_user_id')
        session['email'] = session.pop('temp_email')

        # On ne supprime pas le code ici (selon ta demande)

        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': "Code incorrect"}), 401


# ==============================
# Vérification code / mot de passe
# ==============================
@app.route('/verifi-code', methods=['POST'])
async def verifi_code():
    data = await request.get_json()
    value = data.get('value')
    code_entered = data.get('code')

    if not value or not code_entered:
        return jsonify(success=False, message="Données incomplètes.")

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Rechercher l'utilisateur par email, nom ou téléphone
            await cur.execute(
                "SELECT id, password FROM users WHERE email = %s OR name = %s OR phone = %s",
                (value, value, value)
            )
            user = await cur.fetchone()

            if not user:
                return jsonify(success=False, message="Utilisateur introuvable.")

            user_id, hashed_password = user

            # Si code contient au moins une lettre → c'est un mot de passe
            if any(c.isalpha() for c in code_entered):
                loop = asyncio.get_event_loop()
                password_ok = await loop.run_in_executor(
                    None,
                    lambda: bcrypt.checkpw(
                        code_entered.encode("utf-8"),
                        hashed_password.encode("utf-8")
                    )
                )

                if password_ok:
                    return jsonify(success=True, message="Mot de passe correct.")
                else:
                    return jsonify(success=False, message="Mot de passe incorrect.")

            # Sinon, traiter comme un code 2FA
            await cur.execute("SELECT code FROM verification_codes WHERE user_id = %s", (user_id,))
            code_row = await cur.fetchone()

            if code_row and code_entered == code_row[0]:
                # Générer un nouveau mot de passe aléatoire
                new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

                # Hash async via threadpool
                loop = asyncio.get_event_loop()
                hashed_new_password = await loop.run_in_executor(
                    None,
                    lambda: bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
                )

                # Mettre à jour la base
                await cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_new_password, user_id))
                await conn.commit()

                return jsonify(success=True, message="Code 2FA valide.", new_password=new_password)

    return jsonify(success=False, message="Code ou mot de passe invalide.")


@app.route('/logout', methods=['POST'])
async def logout():
    session.clear()
    return jsonify({'success': True})


@app.route('/api/check_notifications')
async def check_notifications():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT email_notifications FROM users WHERE id = %s", (user_id,))
            result = await cur.fetchone()

    return jsonify({
        'email_notifications': bool(result[0]) if result else False
    })


# =====================================================
# SESSION DU CHAT LALMA
# =====================================================
LALMA_PATH = os.path.join("html 1", "lang", "question.json")
LALMA_CACHE = []


@app.before_serving
async def load_questions():
    global LALMA_CACHE
    try:
        async with aiofiles.open(LALMA_PATH, mode='r', encoding='utf-8') as f:
            content = await f.read()
            LALMA_CACHE = json.loads(content)

        app.logger.info(f"{len(LALMA_CACHE)} questions chargées en mémoire")

    except Exception as e:
        app.logger.error(f"Erreur chargement questions: {e}")
        LALMA_CACHE = []


@app.route('/question', methods=['GET'])
async def get_random_question():
    if not LALMA_CACHE:
        return jsonify({
            'error': 'Aucune question disponible'
        }), 500

    question = random.choice(LALMA_CACHE)

    return jsonify({
        'question': question
    })


    

# Variable globale pour stocker les données en mémoire
knowledge_base = {}

@app.before_serving
async def load_knowledge():
    """Charge le JSON en mémoire au démarrage de manière async"""
    global knowledge_base
    try:
        async with aiofiles.open('wariplay.json', 'r', encoding='utf-8') as f:
            content = await f.read()
            knowledge_base = json.loads(content)
    except FileNotFoundError:
        pass
        knowledge_base = {}
    except Exception as e:
        pass
        knowledge_base = {}

@app.route('/lalma', methods=['POST'])
async def ask_lalma():
    """
    Route unique /lalma
    Body JSON: {"question": "texte de la question"}
    """
    try:
        data = await request.get_json() or {}
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({
                "error": "Question requise",
                "usage": "POST /lalma avec body: {'question': 'texte'}"
            }), 400
        
        # Recherche exacte (insensible à la casse)
        for key in knowledge_base:
            if key.lower() == question.lower():
                return jsonify({
                    "found": True,
                    "question": key,
                    "answer": knowledge_base[key]
                })
        
        # Recherche partielle (fallback)
        for key in knowledge_base:
            if question.lower() in key.lower() or key.lower() in question.lower():
                return jsonify({
                    "found": True,
                    "question": key,
                    "answer": knowledge_base[key],
                    "note": "Correspondance partielle"
                })
        
        return jsonify({
            "found": False,
            "error": "Question non trouvée dans la base de connaissances"
        }), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
async def health():
    """Simple Check (optionnel)"""
    return jsonify({
        "status": "ok",
        "questions_loaded": len(knowledge_base)
    })




@app.route('/api/update_notifications', methods=['POST'])
async def update_notifications():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = await request.get_json()
    new_state = data.get('email_notifications')
    if new_state is None:
        return jsonify({'error': 'Missing data'}), 400

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE users SET email_notifications = %s WHERE id = %s",
                (new_state, user_id)
            )
        await conn.commit()

    return jsonify({'success': True, 'email_notifications': new_state})



# ----------------------------------------------
# SYSTEME DE JEU DE WARI LEVEL (LES NIVEAUX)
# -----------------------------------------------

# Configuration
QUESTIONS_JSON = "html 1/lang/cherif.json"
TEMPS_PAR_QUESTION = 13
MAX_QUESTIONS = 3
WERI_TOKEN_VALIDITY = 600  # 10 minutes
QUESTIONS_PAR_RECHARGEMENT = 200

# Stockage en mémoire
questions_en_cours = {}
questions_memoire = {}  # {"categorie": [{"id": x, "question": "...", "reponse": y}, ...]}


def weri_generate_token(user_id, niveau):
    timestamp = int(time.time())
    payload = f"weri:{user_id}:{niveau}:{timestamp}"
    token = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return token, timestamp

def weri_verify_token(user_id, niveau, token, timestamp):
    if not token or not timestamp:
        return False
    if abs(time.time() - timestamp) > WERI_TOKEN_VALIDITY:
        return False
    payload = f"weri:{user_id}:{niveau}:{timestamp}"
    expected = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, token)

def charger_questions_json():
    """Charge toutes les questions depuis le fichier JSON au démarrage"""
    if not os.path.exists(QUESTIONS_JSON):
        return {}
    with open(QUESTIONS_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

def recharger_categorie(categorie, toutes_questions):
    """Recharge 200 questions aléatoires pour une catégorie donnée en mémoire"""
    global questions_memoire
    
    if categorie not in toutes_questions or not toutes_questions[categorie]:
        questions_memoire[categorie] = []
        return
    
    # Sélection aléatoire de 200 questions (ou moins si pas assez)
    import random
    questions_disponibles = toutes_questions[categorie][:]
    if len(questions_disponibles) > QUESTIONS_PAR_RECHARGEMENT:
        questions_selectionnees = random.sample(questions_disponibles, QUESTIONS_PAR_RECHARGEMENT)
    else:
        questions_selectionnees = questions_disponibles[:]
    
    questions_memoire[categorie] = questions_selectionnees

def obtenir_question_memoire(categorie, toutes_questions):
    """Obtient une question de la mémoire, recharge si nécessaire"""
    global questions_memoire
    
    # Si la catégorie n'existe pas en mémoire ou est vide, recharger
    if categorie not in questions_memoire or not questions_memoire[categorie]:
        recharger_categorie(categorie, toutes_questions)
    
    if not questions_memoire.get(categorie):
        return None
    
    # Retirer et retourner la dernière question (pour éviter les doublons immédiats)
    return questions_memoire[categorie].pop()

# Chargement initial au démarrage du serveur
toutes_questions_source = charger_questions_json()
CATEGORIES = ["sport", "art", "histoire", "musique", "litterature", "science", "geographie", "cinema", "cuisine", "politique", "monde"]

# Préchargement initial de 200 questions par catégorie
for cat in CATEGORIES:
    recharger_categorie(cat, toutes_questions_source)

@app.websocket("/ws/wari-level")
async def ws_wari_level():
    pool = await get_pool()

    try:
        while True:
            msg = await websocket.receive_json()
            action = msg.get("action")
            user_id = session.get("user_id")

            if not user_id:
                await websocket.send_json({"success": False, "message": "Utilisateur non connecté"})
                continue

            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:

                    if action == "start_game":
                        niveau = msg.get("niveau")
                        await cursor.execute(
                            "SELECT vies FROM achats WHERE user_id=%s AND produit=%s",
                            (user_id, niveau)
                        )
                        row = await cursor.fetchone()
                        if not row or int(row[0]) <= 0:
                            await websocket.send_json({"success": False, "message": "Jeu impossible"})
                            continue

                        vies = int(row[0])
                        await cursor.execute(
                            "SELECT benefice FROM benef WHERE niveau=%s",
                            (niveau,)
                        )
                        benefice = await cursor.fetchone()
                        if not benefice:
                            await websocket.send_json({"success": False, "message": "Bénéfice introuvable"})
                            continue
                        benefice = int(benefice[0])
                        gain_unitaire = benefice // (vies if vies >= 3 else 3)

                        token, timestamp = weri_generate_token(user_id, niveau)

                        questions_en_cours[user_id] = {
                            "niveau": niveau,
                            "gain_unitaire": gain_unitaire,
                            "gain_total": 0,
                            "question_count": 0,
                            "token": token,
                            "timestamp": timestamp
                        }

                        await websocket.send_json({
                            "success": True,
                            "gainUnitaire": gain_unitaire,
                            "temps": TEMPS_PAR_QUESTION,
                            "vies": vies,
                            "token": token,
                            "timestamp": timestamp
                        })

                    elif action == "get_question":
                        categorie = msg.get("categorie")
                        token = msg.get("token")
                        timestamp = msg.get("timestamp")
                        state = questions_en_cours.get(user_id)

                        if not state or not weri_verify_token(user_id, state["niveau"], token, timestamp):
                            await websocket.send_json({"success": False, "message": "Token invalide"})
                            continue

                        if state["question_count"] >= MAX_QUESTIONS:
                            await websocket.send_json({"fin": True, "gainTotal": state["gain_total"]})
                            del questions_en_cours[user_id]
                            continue

                        # Obtenir question depuis la mémoire (recharge automatiquement si vide)
                        global toutes_questions_source
                        question_data = obtenir_question_memoire(categorie, toutes_questions_source)
                        
                        if not question_data:
                            await websocket.send_json({"success": False, "message": "Aucune question disponible"})
                            continue

                        q_id = question_data["id"]
                        question = question_data["question"]
                        reponse = question_data["reponse"]

                        state["question_count"] += 1
                        state["reponse"] = bool(reponse)
                        state["deadline"] = asyncio.get_event_loop().time() + TEMPS_PAR_QUESTION

                        await websocket.send_json({"question": question, "numero": state["question_count"]})

                    elif action == "answer":
                        token = msg.get("token")
                        timestamp = msg.get("timestamp")
                        state = questions_en_cours.get(user_id)

                        if not state or "deadline" not in state or not weri_verify_token(user_id, state["niveau"], token, timestamp):
                            await websocket.send_json({"success": False, "message": "Token invalide"})
                            continue

                        now = asyncio.get_event_loop().time()
                        correct = msg.get("reponse") == state["reponse"] and now <= state["deadline"]

                        if correct:
                            state["gain_total"] += state["gain_unitaire"]
                            await cursor.execute(
                                "UPDATE solde SET solde = solde + %s WHERE user_id=%s",
                                (state["gain_unitaire"], user_id)
                            )

                        # Décrément vie
                        await cursor.execute(
                            "UPDATE achats SET vies=vies-1 WHERE user_id=%s AND produit=%s AND vies>0",
                            (user_id, state["niveau"])
                        )

                        await cursor.execute(
                            "SELECT vies FROM achats WHERE user_id=%s AND produit=%s",
                            (user_id, state["niveau"])
                        )
                        vies_restantes = int((await cursor.fetchone())[0])

                        # Stats
                        bonnes = 1 if correct else 0
                        mauvaises = 0 if not correct else 0
                        total = 1

                        await cursor.execute("""
                            INSERT INTO stats_niveau (user_id, niveau, bonnes, mauvaises, total)
                            VALUES (%s,%s,%s,%s,%s)
                        """, (user_id, state["niveau"], bonnes, mauvaises, total))

                        await cursor.execute("""
                            INSERT INTO stats_globales (user_id, bonnes, mauvaises, total)
                            VALUES (%s,%s,%s,%s)
                            ON DUPLICATE KEY UPDATE
                                bonnes = bonnes + VALUES(bonnes),
                                mauvaises = mauvaises + VALUES(mauvaises),
                                total = total + VALUES(total)
                        """, (user_id, bonnes, mauvaises, total))

                        await conn.commit()

                        fin = vies_restantes <= 0 or state["question_count"] >= MAX_QUESTIONS

                        await websocket.send_json({
                            "correct": correct,
                            "gainUnitaire": state["gain_unitaire"] if correct else 0,
                            "gainTotal": state["gain_total"],
                            "vies": vies_restantes,
                            "fin": fin
                        })

                        if fin:
                            del questions_en_cours[user_id]

    except Exception as e:
        await websocket.send_json({"success": False, "error": str(e)})



####################################################*
################################A utiliser#########
#############################################"####"
@app.route('/enregistrer-gain-total', methods=['POST'])
async def enregistrer_gain_total():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Utilisateur non connecté"}), 401

    data = await request.get_json()
    gain = int(data.get("gain", 0))
    user_id = session["user_id"]

    if gain <= 0:
        return jsonify({"success": False, "message": "Gain invalide"}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                sql = """
                INSERT INTO gains_totaux (user_id, gain)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE
                    gain = gain + VALUES(gain),
                    date_maj = CURRENT_TIMESTAMP
                """
                await cursor.execute(sql, (user_id, gain))

        return jsonify({"success": True, "message": "Gain enregistré et total mis à jour"})

    except Exception as e:
        return jsonify({"success": False, "message": f"Erreur base de données : {str(e)}"}), 500



# Génération d'un wallet ID unique
def generate_wallet_id():
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"W-{suffix}"


# 🔹 Route 100% async
@app.route('/api/get_solde', methods=['GET'])
async def get_solde():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Utilisateur non connecté"}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:

                # Vérifier si un solde existe déjà
                await cursor.execute(
                    "SELECT solde, wari_id FROM solde WHERE user_id = %s",
                    (user_id,)
                )
                result = await cursor.fetchone()

                if result:
                    solde, wari_id = result
                else:
                    # Générer un nouveau wallet
                    wari_id = generate_wallet_id()
                    solde = 00  # Solde initial en XOF

                    await cursor.execute(
                        "INSERT INTO solde (user_id, solde, wari_id) VALUES (%s, %s, %s)",
                        (user_id, solde, wari_id)
                    )

        return jsonify({"solde": solde, "wari_id": wari_id})

    except Exception as e:
        print("Erreur get_solde:", e)
        return jsonify({"error": f"Erreur serveur : {str(e)}"}), 500


# --- Endpoint async pour récupérer les niveaux utilisateur ---
@app.route('/api/niveaux-utilisateur', methods=['GET'])
async def get_niveaux_achetes():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT b.niveau, b.benefice, b.taux, a.vies, a.duree, a.renouvellement
                    FROM achats a
                    JOIN benef b ON a.produit = b.niveau
                    WHERE a.user_id = %s
                """, (user_id,))
                
                data = await cursor.fetchall()

        # --- Préparer le résultat ---
        result = []
        for row in data:
            niveau, benefice, taux, vies, duree, renouvellement = row

            # Formater renouvellement
            if isinstance(renouvellement, datetime):
                renouvellement = renouvellement.strftime("%Y-%m-%d %H:%M:%S")

            # Nettoyer durée (ex: "10jours" -> "10")
            duree_clean = ''.join([c for c in str(duree) if c.isdigit()])

            result.append({
                'niveau': niveau,
                'benefice': benefice,
                'taux': taux,
                'vies': vies,
                'duree': duree_clean,
                'renouvellement': renouvellement
            })

        return jsonify({'success': True, 'data': result}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Erreur serveur'}), 500


@app.route('/api/game-settings', methods=['GET'])
async def get_game_settings():
    try:
        pool = await get_pool()
        current_time = datetime.now()

        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # 0. Initialiser le renewal si vies = 0 et renewal_start est NULL
                await cur.execute("""
                    SELECT id, product_name, renewal
                    FROM game_settings
                    WHERE vies = 0
                    AND renewal IS NOT NULL
                    AND renewal_start IS NULL
                """)
                needs_renewal = await cur.fetchall()

                for (game_id, product_name, renewal) in needs_renewal:
                    try:
                        await cur.execute("""
                            UPDATE game_settings
                            SET renewal_start = NOW()
                            WHERE id = %s
                        """, (game_id,))
                        await conn.commit()
                    except Exception as renewal_error:
                        await conn.rollback()

                # 1. Gestion des renewals expirés
                await cur.execute("""
                    SELECT gs.id, gs.product_name, gs.renewal, gs.renewal_start
                    FROM game_settings gs
                    WHERE gs.vies = 0 
                    AND gs.renewal IS NOT NULL
                    AND gs.renewal_start IS NOT NULL
                    AND gs.renewal_start + INTERVAL CAST(SUBSTRING_INDEX(gs.renewal, 'h', 1) AS SIGNED) HOUR <= NOW()
                """)
                expired_renewals = await cur.fetchall()

                for (game_id, product_name, renewal, renewal_start) in expired_renewals:
                    try:
                        await cur.execute("""
                            UPDATE game_settings 
                            SET vies = 3, 
                                renewal_start = NULL,
                                created_at = NOW()
                            WHERE id = %s
                        """, (game_id,))
                        await conn.commit()
                        print(f"Vies réinitialisées pour {product_name}")
                    except Exception as update_error:
                        await conn.rollback()
                        print(f"Erreur reset vies pour {product_name}: {str(update_error)}")

                # 2. Suppression des jeux expirés et leurs achats
                await cur.execute("""
                    SELECT id, product_name 
                    FROM game_settings 
                    WHERE created_at + INTERVAL duree_jours DAY <= NOW()
                """)
                expired_games = await cur.fetchall()

                for (game_id, product_name) in expired_games:
                    try:
                        await cur.execute("DELETE FROM product_purchases WHERE product_name = %s", (product_name,))
                        await cur.execute("DELETE FROM game_settings WHERE id = %s", (game_id,))
                        await conn.commit()
                    except Exception as delete_error:
                        await conn.rollback()

                # 3. Récupération des jeux actifs
                await cur.execute("""
                    SELECT id, product_name, image_url, vies, duree_jours, renewal, renewal_start, created_at 
                    FROM game_settings
                    WHERE user_id = %s
                """, (session.get('user_id'),))
                result = await cur.fetchall()

        # --- Construction des jeux ---
        games = []
        for (id, product_name, image_url, vies, duree_jours, renewal, renewal_start, created_at) in result:
            try:
                created_at = created_at if isinstance(created_at, datetime) else datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
                end_time = created_at + timedelta(days=duree_jours)
                remaining_seconds = int((end_time - current_time).total_seconds())

                renewal_timestamp = None
                renewal_remaining = 0

                if vies == 0 and renewal and renewal_start:
                    renewal_hours = int(renewal.replace('h', ''))
                    if not isinstance(renewal_start, datetime):
                        renewal_start = datetime.strptime(renewal_start, '%Y-%m-%d %H:%M:%S')
                    renewal_end = renewal_start + timedelta(hours=renewal_hours)
                    renewal_timestamp = int(renewal_end.timestamp())
                    renewal_remaining = max(0, int((renewal_end - current_time).total_seconds()))

                games.append({
                    'id': id,
                    'product_name': product_name,
                    'image_url': image_url or 'default-icon.jpg',
                    'vies': vies,
                    'renewal': renewal,
                    'end_timestamp': int(end_time.timestamp()),
                    'remaining_seconds': max(0, remaining_seconds),
                    'renewal_timestamp': renewal_timestamp,
                    'renewal_remaining': renewal_remaining,
                    'renewal_started': renewal_start is not None if vies == 0 else None
                })
            except Exception as game_error:
                continue

        return jsonify({
            'success': True,
            'games': games,
            'server_time': current_time.isoformat(),
            'refresh_interval': 30
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur lors de la récupération des jeux'
        }), 500


# --- Route complètement async ---
@app.route('/get-other-products', methods=["GET", "POST"])
async def get_other_products():
    try:
        pool = await get_pool()
        now = datetime.now()
        user_id = session.get("user_id")

        if not user_id:
            return jsonify({"error": "Utilisateur non connecté"}), 401

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:

                # --- POST : achat pack 10 vies ---
                if request.method == "POST":
                    data = await request.get_json()
                    product_name = data.get("product_name")

                    if product_name == "Pack de 10 vies":
                        await cursor.execute("""
                            SELECT id FROM product_purchases
                            WHERE product_name = %s AND user_id = %s LIMIT 1
                        """, (product_name, user_id))
                        pack = await cursor.fetchone()

                        if not pack:
                            return jsonify({'error': 'Aucun pack trouvé pour cet utilisateur'}), 400

                        purchase_id = pack[0]

                        await cursor.execute(
                            "UPDATE game_settings SET vies = vies + 10 WHERE user_id = %s",
                            (user_id,)
                        )
                        await conn.commit()

                        await cursor.execute(
                            "DELETE FROM product_purchases WHERE id = %s AND user_id = %s",
                            (purchase_id, user_id)
                        )
                        await conn.commit()

                        return jsonify({'success': True})

                    return jsonify({'error': 'Produit non reconnu'}), 400

                # --- GET : liste produits + gestion expirations ---
                result = []
                seen_products = set()

                # Vérifier et nettoyer Wari Wallet (plus vieux que 31 jours)
                date_31_days_ago = now - timedelta(days=31)
                await cursor.execute("""
                    SELECT purchase_date FROM product_purchases
                    WHERE user_id = %s AND product_name = %s
                    ORDER BY purchase_date DESC LIMIT 1
                """, (user_id, "Wari Wallet"))
                wari_wallet = await cursor.fetchone()

                if wari_wallet:
                    purchase_date = wari_wallet[0]
                    if purchase_date <= date_31_days_ago:
                        await cursor.execute("""
                            DELETE FROM game_settings
                            WHERE user_id = %s AND product_name = %s
                        """, (user_id, "Wari Wallet"))
                        await conn.commit()

                # Récupérer uniquement les achats de l'utilisateur
                await cursor.execute("""
                    SELECT id, user_id, product_name, purchase_date 
                    FROM product_purchases
                    WHERE user_id = %s
                """, (user_id,))
                purchases = await cursor.fetchall()

                for purchase_id, uid, product_name, purchase_date in purchases:

                    if product_name in seen_products:
                        continue
                    seen_products.add(product_name)

                    # --- Pass VIP 7 jours ---
                    if product_name == "Pass VIP 7 jours":
                        expiration_time = purchase_date + timedelta(days=7)

                        if now >= expiration_time:
                            await cursor.execute(
                                "DELETE FROM product_purchases WHERE id = %s AND user_id = %s",
                                (purchase_id, user_id)
                            )
                            await cursor.execute("""
                                UPDATE game_settings 
                                SET product_name = 'Dino Run', vies = 0, duree_jours = 0, renewal = NULL
                                WHERE user_id = %s AND product_name = 'Dino Run'
                            """, (user_id,))
                            await conn.commit()
                            continue

                        # Vérifications + insert si manquant
                        await cursor.execute(
                            "SELECT 1 FROM achats WHERE user_id = %s AND produit = %s",
                            (user_id, "Niveau 3")
                        )
                        if not await cursor.fetchone():
                            await cursor.execute("""
                                INSERT INTO achats (user_id, produit, duree, renouvellement, created_at, start_time)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (user_id, "Niveau 3", "20 jours", "24h", now, None))

                        await cursor.execute(
                            "SELECT 1 FROM game_settings WHERE user_id = %s AND product_name = %s",
                            (user_id, "Dino Run")
                        )
                        if not await cursor.fetchone():
                            await cursor.execute("""
                                INSERT INTO game_settings (product_name, image_url, vies, duree_jours, renewal, user_id, created_at, renewal_start)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """, ("Dino Run", "/img/Dino Run.png", 3, 35, "24h", user_id, now, None))
                        await conn.commit()

                        await cursor.execute(
                            "SELECT image_path FROM products WHERE title = %s",
                            ("Pass VIP 7 jours",)
                        )
                        image_data = await cursor.fetchone()
                        image_url = image_data[0] if image_data else ""

                        result.append({
                            'product_name': product_name,
                            'image_url': image_url,
                            'id': product_name.replace(" ", "_").lower(),
                            'expires_at': expiration_time.isoformat()
                        })
                        continue

                    # --- Vies illimitées 24h ---
                    if product_name == "Vies illimitées 24h":
                        expiration_time = purchase_date + timedelta(hours=24)

                        if now >= expiration_time:
                            await cursor.execute(
                                "DELETE FROM product_purchases WHERE id = %s AND user_id = %s",
                                (purchase_id, user_id)
                            )
                            await conn.commit()

                            await cursor.execute(
                                "SELECT id, renewal_start FROM game_settings WHERE user_id = %s",
                                (user_id,)
                            )
                            settings = await cursor.fetchall()
                            for setting_id, renewal_start in settings:
                                new_vies = 0 if renewal_start else 3
                                await cursor.execute(
                                    "UPDATE game_settings SET vies = %s WHERE id = %s AND user_id = %s",
                                    (new_vies, setting_id, user_id)
                                )
                            await conn.commit()
                            continue
                        else:
                            await cursor.execute(
                                "UPDATE game_settings SET vies = 1000000 WHERE user_id = %s",
                                (user_id,)
                            )
                            await conn.commit()

                    elif product_name == "Pack de 10 vies":
                        pass  # Géré en POST

                    # --- Vérif si produit pas déjà en games_pro ---
                    await cursor.execute(
                        "SELECT 1 FROM games_pro WHERE name = %s",
                        (product_name,)
                    )
                    if not await cursor.fetchone():
                        await cursor.execute(
                            "SELECT image_path FROM products WHERE title = %s",
                            (product_name,)
                        )
                        image_data = await cursor.fetchone()
                        if image_data:
                            product = {
                                'product_name': product_name,
                                'image_url': image_data[0],
                                'id': product_name.replace(" ", "_").lower()
                            }
                            if product_name == "Vies illimitées 24h":
                                product['expires_at'] = expiration_time.isoformat()
                            result.append(product)

        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/save_purchase', methods=['POST'])
async def save_purchase():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    data = await request.get_json()

    product_name = data.get('name')
    duration = data.get('duration')
    amount = data.get('amount')
    operation = data.get('operation')  # 'debit' attendu

    user_id = session['user_id']

    # Vérifications des données
    if not product_name or not duration or amount is None or operation not in ['debit', 'credit']:
        return jsonify({'error': 'Données incomplètes ou invalides'}), 400

    try:
        lives = 3
        renewal_time = "24h"

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # 1️⃣ Récupérer le solde actuel
                await cur.execute(
                    "SELECT solde FROM solde WHERE user_id = %s",
                    (user_id,)
                )
                row = await cur.fetchone()

                if not row:
                    return jsonify({'error': 'Compte introuvable'}), 404

                current_balance = row[0]

                # 2️⃣ Calcul du nouveau solde
                if operation == 'debit':
                    new_balance = current_balance - amount
                    if new_balance < 0:
                        return jsonify({'error': 'Solde insuffisant'}), 400
                else:
                    new_balance = current_balance + amount

                # 3️⃣ Mise à jour du solde
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_balance, user_id)
                )

                # 4️⃣ Enregistrement de l'achat
                await cur.execute("""
                    INSERT INTO achats (user_id, produit, duree, vies, renouvellement)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, product_name, duration, lives, renewal_time))

                # 5️⃣ Commit final (solde + achat)
                await conn.commit()

        return jsonify({
            'success': True,
            'new_balance': new_balance
        }), 200

    except Exception as e:
        app.logger.error(f"Erreur save_purchase: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500


@app.route('/api/save_product_purchase', methods=['POST'])
async def save_product_purchase():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Non connecté'}), 401

    try:
        data = await request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        produit = data.get('name')
        amount = data.get('amount')
        operation = data.get('operation')  # 'debit' obligatoire ici
        user_id = session['user_id']

        if not all([produit, amount, operation]):
            return jsonify({'success': False, 'error': 'Paramètres manquants'}), 400

        if operation != 'debit':
            return jsonify({'success': False, 'error': 'Opération invalide'}), 400

        # Nettoyage / conversion du montant
        try:
            amount_clean = int(str(amount).replace(',', '').strip())
            if amount_clean <= 0:
                raise ValueError
        except ValueError:
            return jsonify({'success': False, 'error': 'Montant invalide'}), 400

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # 🔒 Verrouille le solde utilisateur
                await cur.execute(
                    "SELECT solde FROM solde WHERE user_id = %s FOR UPDATE",
                    (user_id,)
                )
                row = await cur.fetchone()

                if not row:
                    return jsonify({'success': False, 'error': 'Compte introuvable'}), 404

                current_balance = row[0]
                new_balance = current_balance - amount_clean

                if new_balance < 0:
                    return jsonify({'success': False, 'error': 'Solde insuffisant'}), 400

                # 💰 Mise à jour du solde
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_balance, user_id)
                )

                # 🛒 Enregistrement de l’achat
                await cur.execute("""
                    INSERT INTO product_purchases
                    (user_id, product_name, amount, purchase_date)
                    VALUES (%s, %s, %s, NOW())
                """, (user_id, produit, amount_clean))

                await conn.commit()

        return jsonify({
            'success': True,
            'message': 'Achat effectué avec succès',
            'new_balance': new_balance
        })

    except Exception as e:
        app.logger.error(f"Erreur save_product_purchase: {e}")
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500


# 🔹 Route 100% async
@app.route('/api/get_level_info', methods=['GET'])
async def get_level_info():
    niveau_id = request.args.get('niveau')

    if not niveau_id:
        return jsonify({'error': 'Niveau non fourni'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer le nom depuis la table levels
                await cur.execute("SELECT name FROM levels WHERE id = %s", (niveau_id,))
                level_row = await cur.fetchone()

                # Récupérer prix et durée depuis wari_levels
                await cur.execute("SELECT prix, duree FROM wari_levels WHERE id = %s", (niveau_id,))
                wari_row = await cur.fetchone()

        if not level_row or not wari_row:
            return jsonify({'error': 'Données introuvables'}), 404

        # Extraire le prix numérique (ex : 1000) depuis "Prix de vente : 1000 FCFA"
        prix_text = wari_row[0]
        prix_match = re.search(r'(\d+)', prix_text)
        prix = int(prix_match.group(1)) if prix_match else 0

        # Extraire la durée (texte complet ou chiffre)
        duree_text = wari_row[1]  # ex : "Durée : 10 jours"
        # Si tu veux juste le chiffre :
        duree_match = re.search(r'(\d+)', duree_text)
        duree = int(duree_match.group(1)) if duree_match else 0
        duree = duree_text

        return jsonify({
            'name': level_row[0],
            'prix': prix,
            'duree': duree
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/update-password', methods=['POST'])
async def update_password():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Utilisateur non connecté'}), 401

    data = await request.get_json()
    new_password = data.get('password') if data else None
    if not new_password:
        return jsonify({'status': 'error', 'message': 'Mot de passe requis'}), 400

    try:
        # 🔑 Hash du mot de passe en full async
        hashed_password = await aiobcrypt.hashpw(
            new_password.encode("utf-8"),
            await aiobcrypt.gensalt()
        )
        hashed_password = hashed_password.decode("utf-8")

        # 🔑 Connexion DB async
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE users SET password = %s WHERE id = %s",
                    (hashed_password, session["user_id"])
                )
                await conn.commit()

        return jsonify({'status': 'success', 'message': 'Mot de passe mis à jour avec succès'}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/update-phone', methods=['POST'])
async def update_phone():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Utilisateur non connecté'}), 401

    # 🔑 récupération JSON async
    data = await request.get_json()
    phone = data.get('phone', '').strip() if data else ""

    # 🔑 validation
    digits_only = ''.join(filter(str.isdigit, phone))
    if len(digits_only) < 8:
        return jsonify({'status': 'error', 'message': 'Numéro invalide'}), 400

    user_id = session['user_id']

    try:
        # 🔑 Connexion DB async
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE users SET phone = %s WHERE id = %s",
                    (phone, user_id)
                )
                await conn.commit()

        return jsonify({'status': 'success'}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/search-account', methods=['POST'])
async def search_account():
    # 🔑 récupération JSON async
    data = await request.get_json()
    input_value = data.get('query', '').strip() if data else ""

    if not input_value:
        return jsonify({'found': False, 'message': 'Champ vide'}), 400

    # 🔑 Déterminer type d’entrée
    if '@' in input_value:
        query = "SELECT email FROM users WHERE email = %s"
        result_type = "email"
    elif input_value.replace(' ', '').isdigit():
        query = "SELECT phone FROM users WHERE phone = %s"
        result_type = "phone"
    else:
        query = "SELECT name FROM users WHERE name = %s"
        result_type = "name"

    try:
        # 🔑 Connexion DB async
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, (input_value,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'found': True,
                'value': result[0],
                'type': result_type
            }), 200
        else:
            return jsonify({'found': False}), 200

    except Exception as e:
        return jsonify({'found': False, 'message': str(e)}), 500


@app.route('/enregistrer-code', methods=['POST'])
async def enregistrer_code():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Utilisateur non connecté'}), 401

    data = await request.get_json()
    code = data.get('code') if data else None

    if not code:
        return jsonify({'status': 'error', 'message': 'Code manquant'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # REPLACE INTO pour insérer ou mettre à jour
                await cur.execute(
                    "REPLACE INTO verification_codes (user_id, code) VALUES (%s, %s)",
                    (user_id, code)
                )
                await conn.commit()

        return jsonify({'status': 'success', 'message': 'Code enregistré avec succès'}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500



@app.route("/supprimer-code", methods=["POST"])
async def supprimer_code():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Utilisateur non connecté"}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "DELETE FROM verification_codes WHERE user_id = %s",
                    (user_id,)
                )
                await conn.commit()

        return jsonify({"status": "success"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/verif-activee", methods=["GET"])
async def verif_activee():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"active": False}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT 1 FROM verification_codes WHERE user_id = %s",
                    (user_id,)
                )
                result = await cur.fetchone()

        return jsonify({"active": bool(result)}), 200

    except Exception as e:
        return jsonify({"active": False, "error": str(e)}), 500


@app.route('/api/wari_games', methods=['GET'])
async def get_wari_games():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT name, title_prefix, description, demo_btn, play_btn, img FROM wari_games")
                rows = await cur.fetchall()

        games = [
            {
                'name': row[0],
                'titlePrefix': row[1],
                'description': row[2],
                'demoBtn': row[3],
                'playBtn': row[4],
                'img': row[5]
            }
            for row in rows
        ]

        return jsonify(games), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/wari_paths', methods=['GET'])
async def get_wari_paths():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT name, title_prefix, description, button_text, img FROM wari_paths")
                rows = await cur.fetchall()

        paths = [
            {
                'name': row[0],
                'titlePrefix': row[1],
                'description': row[2],
                'buttonText': row[3],
                'img': row[4]
            }
            for row in rows
        ]

        return jsonify(paths), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/wari_levels', methods=['GET'])
async def get_wari_levels():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, title_prefix, niveau_text, prix, duree, button_text, img "
                    "FROM wari_levels ORDER BY id ASC"
                )
                rows = await cur.fetchall()

        levels = [
            {
                'id': row[0],
                'titlePrefix': row[1],
                'niveauText': row[2],
                'prix': row[3],
                'duree': row[4],
                'buttonText': row[5],
                'img': row[6]
            }
            for row in rows
        ]

        return jsonify(levels), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/user-info', methods=['GET'])
async def user_info():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT name, picture, created_at FROM users WHERE id = %s", (user_id,)
                )
                result = await cur.fetchone()

        if not result:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        name, picture, created_at = result
        return jsonify({
            'name': name,
            'picture': picture,
            'created_at': created_at.strftime('%Y-%m-%dT%H:%M:%S')
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/temps-restant', methods=['GET'])
async def temps_restant():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT id, produit, duree, created_at
                    FROM achats
                    WHERE user_id = %s
                """, (user_id,))
                achats = await cur.fetchall()

                result = []
                now = datetime.now()

                for achat_id, produit, duree, created_at in achats:
                    # Extraction de la durée en jours (par défaut 10)
                    jours = 10
                    if duree:
                        try:
                            jours = int(''.join(filter(str.isdigit, duree)))
                        except ValueError:
                            jours = 10

                    # Conversion de la date si nécessaire
                    if isinstance(created_at, str):
                        created_at = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')

                    # Calcul de la fin et du temps restant
                    end_time = created_at + timedelta(days=jours)
                    remaining = end_time - now

                    if remaining.total_seconds() <= 0:
                        # Suppression des achats expirés
                        await cur.execute("DELETE FROM achats WHERE id = %s", (achat_id,))
                        continue

                    # Formatage du temps restant
                    j = remaining.days
                    h, rem = divmod(remaining.seconds, 3600)
                    m = rem // 60
                    temps_restant_str = f"{j}j {h}h {m}min" if j > 0 else f"{h}h {m}min"

                    result.append({
                        'niveau': produit,
                        'temps_restant': temps_restant_str,
                        'expire_le': end_time.strftime('%Y-%m-%d %H:%M:%S')
                    })

                await conn.commit()  # commit suppression si nécessaire
                return jsonify(result)

    except Exception as e:
        return jsonify({'error': f"Erreur de calcul du temps restant: {str(e)}"}), 500


@app.route('/api/renouvellement-temps', methods=['GET'])
async def get_renouvellement_time():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # 1. Sélectionner les achats où vies = 0
                await cur.execute("""
                    SELECT id, produit, start_time, renouvellement, vies
                    FROM achats 
                    WHERE user_id = %s AND vies = 0
                """, (user_id,))
                rows = await cur.fetchall()

                results = []
                now = datetime.now()

                for achat_id, produit, start_time, renouvellement, vies in rows:
                    # Extraction du nombre d'heures
                    try:
                        nb_heures = int(renouvellement.replace('h', ''))
                    except Exception:
                        nb_heures = 24  # valeur par défaut

                    total_seconds = nb_heures * 3600

                    # 2. Si start_time est NULL, on l'initialise à maintenant
                    if start_time is None:
                        start_time = now
                        await cur.execute("""
                            UPDATE achats
                            SET start_time = %s
                            WHERE id = %s
                        """, (start_time, achat_id))

                    # 3. Calcul du temps restant
                    next_time = start_time + timedelta(hours=nb_heures)
                    remaining = next_time - now

                    # 4. Si le temps est écoulé, remettre vies à 3 et start_time à NULL
                    if remaining.total_seconds() <= 0:
                        await cur.execute("""
                            UPDATE achats
                            SET vies = 3, start_time = NULL
                            WHERE id = %s
                        """, (achat_id,))
                        remaining = timedelta(seconds=0)

                    results.append({
                        'niveau': produit,
                        'remaining_seconds': int(remaining.total_seconds()),
                        'total_seconds': total_seconds
                    })

                await conn.commit()  # commit pour toutes les mises à jour
                return jsonify(results)

    except Exception as e:
        return jsonify({'error': f"Erreur serveur: {str(e)}"}), 500


@app.route('/enregistrer-message', methods=['POST'])
async def enregistrer_message():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Utilisateur non connecté"}), 401

    data = await request.get_json()
    message = (data.get('message') or '').strip()

    if not message:
        return jsonify({"success": False, "message": "Message vide"}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "INSERT INTO messages (user_id, message) VALUES (%s, %s)",
                    (user_id, message)
                )
            await conn.commit()

        return jsonify({"success": True, "message": "Message enregistré avec succès"})

    except Exception as e:
        return jsonify({"success": False, "message": f"Erreur serveur: {str(e)}"}), 500



@app.route('/api/get_receiver_data', methods=['GET'])
async def get_receiver_data():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT method, name, number FROM receivers")
                rows = await cur.fetchall()

        data = {method.lower(): {'name': name, 'number': number} for method, name, number in rows}
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500



@app.route('/api/deposits', methods=['GET'])
async def get_deposits():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Non autorisé'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                    SELECT transfer_id, amount, method, text_extrait, image
                    FROM transactions_ocr 
                    WHERE user_id = %s
                """
                await cur.execute(query, (user_id,))
                deposits = await cur.fetchall()

        deposits_list = [
            {
                'transfer_id': d[0],
                'amount': str(d[1]),
                'method': d[2],
                'text_extrait': d[3],
                'image_id': f"img_{d[0]}"  # Utilisation de l'ID comme référence
            }
            for d in deposits
        ]

        return jsonify({'success': True, 'deposits': deposits_list})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur serveur: {str(e)}'}), 500


@app.route('/api/image/<image_id>')
async def get_image(image_id):
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = "SELECT image FROM transactions_ocr WHERE transfer_id = %s"
                transfer_id = image_id.replace('img_', '')
                await cur.execute(query, (transfer_id,))
                row = await cur.fetchone()

        if not row or not row[0]:
            return jsonify({'success': False, 'message': 'Image non trouvée'}), 404

        image_data = row[0]

        return await send_file(
            io.BytesIO(image_data),
            mimetype='image/jpeg',
            as_attachment=False
        )

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur serveur: {str(e)}'}), 500


def row_to_dict(columns, row):
    """Convertit une ligne tuple en dictionnaire en utilisant les noms de colonnes"""
    return dict(zip(columns, row))

@app.route('/api/categories', methods=['GET'])
async def get_categories():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT * FROM categories")
                
                columns = [desc[0] for desc in cur.description]
                rows = await cur.fetchall()
                categories = [row_to_dict(columns, row) for row in rows]

        return jsonify(categories)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/products', methods=['GET'])
async def get_products():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer les produits avec leurs catégories
                query = """
                SELECT p.*, c.name as category_name, c.icon as category_icon 
                FROM products p
                JOIN categories c ON p.category_id = c.id
                """
                await cur.execute(query)
                
                columns = [desc[0] for desc in cur.description]
                rows = await cur.fetchall()
                products = [row_to_dict(columns, row) for row in rows]

                # Récupérer les avantages pour chaque produit
                for product in products:
                    await cur.execute(
                        "SELECT advantage FROM product_advantages WHERE product_id = %s",
                        (product['id'],)
                    )
                    adv_rows = await cur.fetchall()
                    product['advantages'] = [r[0] for r in adv_rows]

        return jsonify(products)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/get_product_price', methods=['GET'])
async def get_product_price():
    try:
        produit = request.args.get('produit')
        if not produit:
            return jsonify({'error': 'Paramètre produit manquant'}), 400

        produit_clean = unquote(produit).strip()

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT price FROM products WHERE title = %s LIMIT 1",
                    (produit_clean,)
                )
                row = await cur.fetchone()

        if not row:
            return jsonify({'error': 'Produit non trouvé'}), 404

        # Conversion robuste du prix (supprime tout sauf chiffres)
        price_str = re.sub(r'[^\d]', '', str(row[0]))
        if not price_str:
            return jsonify({'error': 'Format de prix invalide'}), 500

        return jsonify({
            'prix': int(price_str),
            'produit': produit_clean
        })

    except Exception as e:
        app.logger.error(f"Erreur get_product_price: {str(e)}")
        return jsonify({'error': 'Erreur interne du serveur'}), 500




@app.route('/get-games', methods=['GET'])
async def get_games():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT g.name, g.description, g.players, g.rating, g.image_url, 
                           IFNULL(gp.is_paid, 0) as is_paid
                    FROM games1 g
                    LEFT JOIN games_pro gp ON g.name = gp.name
                """)
                rows = await cur.fetchall()

        games = []
        for row in rows:
            games.append({
                'name': row[0],
                'description': row[1],
                'players': row[2],
                'rating': row[3],
                'image_url': row[4],
                'is_paid': bool(row[5])
            })

        return jsonify(games)

    except Exception as e:
        app.logger.error(f"Erreur get_games: {str(e)}")
        return jsonify([])



@app.route('/check-pro-access', methods=['POST'])
async def check_pro_access():
    if 'user_id' not in session:
        return jsonify({
            'has_access': False,
            'message': 'Veuillez vous connecter',
            'requires_login': True
        })

    data = await request.get_json()
    game_name = data.get('game_name')
    user_id = session['user_id']

    if not game_name:
        return jsonify({'has_access': False, 'message': 'Nom du jeu manquant'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT gp.is_paid, 
                           (SELECT COUNT(*) FROM product_purchases 
                            WHERE user_id = %s AND product_name = %s) as has_purchased
                    FROM games1 g
                    LEFT JOIN games_pro gp ON g.name = gp.name
                    WHERE g.name = %s
                """, (user_id, game_name, game_name))
                
                result = await cur.fetchone()

        if not result:
            return jsonify({'has_access': False, 'message': 'Jeu non trouvé'})

        is_paid = bool(result[0]) if result[0] is not None else False
        has_purchased = result[1] > 0

        if not is_paid or has_purchased:
            return jsonify({'has_access': True})
        else:
            return jsonify({
                'has_access': False,
                'message': 'Version pro requise',
                'game_name': game_name
            })

    except Exception as e:
        app.logger.error(f"Erreur check_pro_access: {str(e)}")
        return jsonify({'has_access': False, 'message': 'Erreur serveur'}), 500



@app.route('/api/check-access', methods=['POST'])
async def check_access():
    if 'user_id' not in session:
        return jsonify({
            'has_access': False, 
            'message': 'Veuillez vous connecter', 
            'requires_login': True
        })

    data = await request.get_json()
    game_name = data.get('game_name')
    user_id = session['user_id']

    if not game_name:
        return jsonify({'has_access': False, 'message': 'Nom du jeu manquant'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Étape 1 : vérifier si le jeu est payant
                await cur.execute("SELECT is_paid FROM games_pro WHERE name = %s", (game_name,))
                game = await cur.fetchone()

                if not game or game[0] == 0:
                    # Jeu non payant ou gratuit
                    return jsonify({'has_access': True})

                # Étape 2 : jeu payant → vérifier si l'utilisateur a acheté
                await cur.execute("""
                    SELECT id FROM product_purchases 
                    WHERE user_id = %s AND product_name = %s
                """, (user_id, game_name))
                purchase = await cur.fetchone()

        if purchase:
            return jsonify({'has_access': True})
        else:
            return jsonify({
                'has_access': False,
                'message': 'Version pro requise. Achetez ce jeu pour y accéder.',
                'game_name': game_name
            })

    except Exception as e:
        app.logger.error(f"Erreur /api/check-access: {str(e)}")
        return jsonify({'has_access': False, 'message': 'Erreur serveur'}), 500



# Flag pour vérifier l'initialisation
db_initialized = False
notification_task_started = False

async def setup_database():
    """Crée les structures nécessaires dans la base de données"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS purchase_notifications (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        product_name VARCHAR(255) NOT NULL,
                        user_id INT NOT NULL,
                        processed BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX (processed, created_at)
                    )
                """)
                await conn.commit()
                
        return True
    except Exception as e:
        return False

async def process_purchase(product_name, user_id):
    """Traite immédiatement un nouvel achat"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupération image du jeu
                await cur.execute("SELECT image_url FROM games1 WHERE name = %s", (product_name,))
                game_data = await cur.fetchone()
                
                if game_data:
                    image_url = game_data[0]
                    # Vérification si l'utilisateur n'a pas déjà la configuration
                    await cur.execute("""
                        SELECT COUNT(*) FROM game_settings 
                        WHERE product_name = %s AND user_id = %s
                    """, (product_name, user_id))
                    count = (await cur.fetchone())[0]
                    
                    if count == 0:
                        await cur.execute("""
                            INSERT INTO game_settings 
                            (product_name, image_url, vies, duree_jours, renewal, user_id)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (product_name, image_url, 3, 35, "24h", user_id))
                
                await conn.commit()
    except Exception as e:
        pass

async def check_notifications_loop():
    """Vérifie en continu les nouvelles notifications"""
    pool = await get_pool()
    while True:
        try:
            async with pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("""
                        SELECT id, product_name, user_id 
                        FROM purchase_notifications
                        WHERE processed = FALSE
                        ORDER BY created_at ASC
                        LIMIT 10
                        FOR UPDATE
                    """)
                    notifications = await cur.fetchall()
                    
                    if notifications:
                        print(f"{len(notifications)} nouvelles notifications à traiter")
                    
                    for notif_id, product_name, user_id in notifications:
                        await process_purchase(product_name, user_id)
                        await cur.execute("""
                            UPDATE purchase_notifications
                            SET processed = TRUE
                            WHERE id = %s
                        """, (notif_id,))
                    
                    await conn.commit()
        except Exception as e:
            pass
        
        await asyncio.sleep(0.1)  # Remplace time.sleep par sleep async

@app.before_serving
async def initialize():
    """Initialisation asynchrone au démarrage du serveur"""
    global db_initialized, notification_task_started
    
    if not db_initialized:
        db_initialized = await setup_database()
    
    if db_initialized and not notification_task_started:
        # Lancer la boucle de notifications en tâche asynchrone
        asyncio.create_task(check_notifications_loop())
        notification_task_started = True


@app.route('/get_balance', methods=['GET'])
async def get_balance():
    try:
        # Vérification de session
        if 'user_id' not in session:
            return jsonify({'error': 'Non authentifié'}), 401

        user_id = session['user_id']

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute('SELECT solde FROM solde WHERE user_id = %s', (user_id,))
                solde_row = await cur.fetchone()

        if not solde_row:
            return jsonify({'error': 'Compte introuvable'}), 404

        # Accès numérique au tuple (index 0)
        return jsonify({'balance': solde_row[0]})

    except Exception as e:
        app.logger.error(f"ERREUR GET_BALANCE: {str(e)}")
        return jsonify({'error': 'Erreur technique'}), 500

@app.route('/update_balance', methods=['POST'])
async def update_balance():
    try:
        # Vérification session
        if 'user_id' not in session:
            return jsonify({'error': 'Non authentifié'}), 401

        user_id = session['user_id']
        data = await request.get_json()
        amount = data.get('amount')

        # Validation du montant
        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return jsonify({'error': 'Montant invalide'}), 400

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # 1. Vérifie l'existence du compte
                await cur.execute('SELECT 1 FROM solde WHERE user_id = %s', (user_id,))
                if not await cur.fetchone():
                    return jsonify({'error': 'Compte introuvable'}), 404

                # 2. Met à jour le solde
                await cur.execute(
                    'UPDATE solde SET solde = solde + %s WHERE user_id = %s',
                    (amount, user_id)
                )

                # 3. Récupère le nouveau solde
                await cur.execute('SELECT solde FROM solde WHERE user_id = %s', (user_id,))
                new_balance_row = await cur.fetchone()

            await conn.commit()

        return jsonify({'success': True, 'new_balance': new_balance_row[0]})

    except Exception as e:
        app.logger.error(f"ERREUR UPDATE_BALANCE: {str(e)}")
        return jsonify({'error': 'Erreur transaction'}), 500

@app.route('/get_solde', methods=['GET'])
async def get_soslde():
    if 'user_id' not in session:
        return jsonify({'error': 'Non connecté'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                row = await cur.fetchone()

                if row:
                    return jsonify({'solde': row[0]})
                else:
                    return jsonify({'solde': 0})

    except Exception as e:
        print(f"Erreur get_solde: {str(e)}")
        return jsonify({'error': 'Erreur serveur'}), 500


@app.route('/update_solde', methods=['POST'])
async def updaate_solde():
    if 'user_id' not in session:
        return jsonify({'error': 'Non connecté'}), 401

    try:
        data = await request.get_json()
        gain = float(data.get('gain', 0))
        user_id = session['user_id']

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérification du solde actuel
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s FOR UPDATE", (user_id,))
                row = await cur.fetchone()

                if not row:
                    return jsonify({'error': 'Aucun solde existant', 'success': False}), 400

                current_solde = row[0]
                new_solde = current_solde + gain

                if new_solde < 0:
                    return jsonify({
                        'error': 'Solde insuffisant',
                        'current_solde': current_solde,
                        'required': abs(gain),
                        'success': False
                    }), 400

                # Mise à jour du solde
                await cur.execute("UPDATE solde SET solde = %s WHERE user_id = %s", (new_solde, user_id))

                return jsonify({
                    'success': True,
                    'new_solde': new_solde,
                    'previous_solde': current_solde,
                    'difference': gain
                })

    except ValueError:
        return jsonify({'error': 'Valeur de gain invalide', 'success': False}), 400
    except Exception as e:
        return jsonify({'error': 'Erreur serveur', 'details': str(e), 'success': False}), 500





# Route pour récupérer le solde
@app.route('/get_solde')
async def geet_solde():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401

    user_id = session['user_id']
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
            row = await cur.fetchone()
            
            if row:
                return jsonify({'solde': row[0]})
            return jsonify({'error': 'Solde non trouvé'}), 404

# Route pour mettre à jour le solde
@app.route('/update_solde', methods=['POST'])
async def updattte_solde():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401

    data = await request.get_json()
    try:
        nouveau_solde = float(data['solde'])
    except (KeyError, ValueError):
        return jsonify({'error': 'Solde invalide'}), 400

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE solde SET solde = %s WHERE user_id = %s", 
                              (nouveau_solde, user_id))
    
    return jsonify({'success': True, 'nouveau_solde': nouveau_solde})


@app.route('/get_balance', methods=['GET'])
async def get_balannce():
    """Récupère le solde de l'utilisateur connecté de façon asynchrone"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non connecté'}), 401

    user_id = session['user_id']
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                row = await cur.fetchone()
                
                if row:
                    return jsonify({'balance': row[0]})
                else:
                    return jsonify({'error': 'Solde non trouvé'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/update_balance', methods=['POST'])
async def updaate_balance():
    """Met à jour le solde de l'utilisateur connecté"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non connecté'}), 401
    
    data = await request.get_json()
    amount = data.get('amount', 0)
    user_id = session['user_id']
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer le solde actuel avec verrou
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s FOR UPDATE", (user_id,))
                result = await cur.fetchone()
                
                if not result:
                    return jsonify({'error': 'Solde non trouvé'}), 404
                
                current_balance = result[0]
                new_balance = current_balance + amount
                
                # Mettre à jour le solde
                await cur.execute("UPDATE solde SET solde = %s WHERE user_id = %s", 
                                  (new_balance, user_id))
                
                return jsonify({
                    'success': True,
                    'new_balance': new_balance
                })
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Décorateur d'authentification async
def auth_required(f):
    @wraps(f)
    async def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentification requise'}), 401
        return await f(*args, **kwargs)
    return decorated

@app.route('/api/historique-retraits')
@auth_required
async def historique_retraits():
    user_id = session['user_id']
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                    SELECT id, methode, montant, contact, statut, created_at, frais 
                    FROM retraits 
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    LIMIT 100
                """
                await cur.execute(query, (user_id,))
                rows = await cur.fetchall()

                # Récupération des colonnes depuis description
                columns = [col[0] for col in cur.description]

                retraits = [dict(zip(columns, row)) for row in rows]

                # Formatage des résultats
                result = []
                for retrait in retraits:
                    result.append({
                        'id': retrait['id'],
                        'methode': retrait['methode'],
                        'montant': float(retrait['montant']),
                        'contact': retrait['contact'],
                        'statut': retrait['statut'].lower(),
                        'created_at': retrait['created_at'].strftime('%Y-%m-%d %H:%M:%S'),
                        'frais': float(retrait['frais'])
                    })

        return jsonify({'data': result})

    except Exception as e:
        app.logger.error(f"Erreur historique retraits user {user_id}: {str(e)}")
        return jsonify({'error': 'Erreur serveur'}), 500





####################################################################
##################################################################"###########
########################XOF Trader systeme#############################
##############################################################"


# Données partagées
current_value = 1000
data_points = [current_value]
clients = set()
last_fx_result = None
last_fx_check = None



async def get_current_fx_result():
    """Récupère le dernier résultat de la table calcul_fx"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT result FROM calcul_fx ORDER BY timestamp DESC LIMIT 1"
                )
                result = await cursor.fetchone()
                return result[0] if result else None
    except Exception as e:
        return None

def generate_variation(current_value, fx_result):
    """
    Génère une variation basée sur le résultat FX
    fx_result = 0 → variations négatives
    fx_result = 1 → variations positives
    """
    # Paramètres de base
    base_sigma = 0.008
    
    if fx_result == 0:  # Tendance négative
        mu = -0.0005  # Dérive légèrement négative
        sigma = base_sigma * 1.2  # Volatility légèrement plus élevée
    elif fx_result == 1:  # Tendance positive
        mu = 0.0005   # Dérive légèrement positive
        sigma = base_sigma * 1.9
    else:  # Cas par défaut (aléatoire)
        mu = 0.0001
        sigma = base_sigma
    
    # Génération de la variation avec distribution normale
    u1, u2 = random.random(), random.random()
    standard_normal = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
    change_ratio = mu + sigma * standard_normal
    
    # Appliquer la variation
    new_value = current_value * (1 + change_ratio)
    
    # Limites de sécurité
    return max(500, min(1500, new_value))

async def broadcast_data():
    global current_value, data_points, last_fx_result, last_fx_check
    
    while True:
        await asyncio.sleep(1)
        
        # Vérifier le résultat FX toutes les 10 secondes (au lieu de chaque seconde)
        current_time = datetime.now()
        if last_fx_check is None or (current_time - last_fx_check).total_seconds() > 10:
            fx_result = await get_current_fx_result()
            if fx_result is not None:
                last_fx_result = fx_result
                last_fx_check = current_time
        
        # Utiliser le dernier résultat FX connu
        fx_result_to_use = last_fx_result if last_fx_result is not None else 1
        
        # Générer la nouvelle valeur
        current_value = generate_variation(current_value, fx_result_to_use)
        data_points.append(current_value)
        
        if len(data_points) > 100:
            data_points = data_points[-100:]
        
        # Broadcast aux clients
        to_remove = set()
        for ws in clients:
            try:
                await ws.send_json({
                    'type': 'update_data',
                    'value': round(current_value, 2),
                    'history': [round(v, 2) for v in data_points],
                    'fx_trend': 'bearish' if fx_result_to_use == 0 else 'bullish'
                })
            except Exception as e:
                pass
                to_remove.add(ws)
        
        clients.difference_update(to_remove)

@app.before_serving
async def startup():
    # Initialiser le résultat FX au démarrage
    global last_fx_result, last_fx_check
    last_fx_result = await get_current_fx_result()
    last_fx_check = datetime.now()
    
    # Démarrer la tâche de broadcast
    app.add_background_task(broadcast_data)

@app.websocket('/ws')
async def ws():
    clients.add(websocket._get_current_object())
    try:
        # Récupérer le résultat FX actuel
        current_fx_result = await get_current_fx_result()
        if current_fx_result is None:
            current_fx_result = 1  # Valeur par défaut
        
        # Envoyer les données initiales
        await websocket.send_json({
            'type': 'init_data',
            'value': round(current_value, 2),
            'history': [round(v, 2) for v in data_points],
            'fx_trend': 'bearish' if current_fx_result == 0 else 'bullish'
        })
        
        # Garder la connexion ouverte
        while True:
            await websocket.receive()
            
    except Exception as e:
        pass
    finally:
        clients.discard(websocket._get_current_object())

##########################################################################
##########################################################################
###########################################################################
###########################################################################

# --- Route /info async ---
@app.route('/info')
async def info():
    if 'user_id' not in session:
        return jsonify({'error': 'Non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute("SELECT name, picture FROM users WHERE id = %s", (user_id,))
                user_data = await cur.fetchone()

                if user_data:
                    name, picture = user_data

                    # Génération des initiales si l'image n'est pas disponible
                    if not picture:
                        initials = ''.join([n[0].upper() for n in name.split()[:2]])
                        picture = initials

                    return jsonify({
                        'id': user_id,
                        'name': name,
                        'avatar': picture
                    })
                else:
                    return jsonify({'error': 'Utilisateur non trouvé'}), 404

            except Exception as e:
                return jsonify({'error': str(e)}), 500

# --- Route /balance async ---
@app.route('/balance')
async def balance():
    if 'user_id' not in session:
        return jsonify({'error': 'Non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
            result = await cur.fetchone()

            if result:
                return jsonify({'balance': result[0]})
            else:
                # Laisser gérer ailleurs le cas où l'utilisateur n'a pas de solde
                return jsonify({'error': 'Solde non trouvé'}), 404

# --- Route async place_bet ---
@app.route('/place_bet', methods=['POST'])
async def place_bet():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    data = await request.get_json(force=True)
    amount = data.get('amount')
    entry_value = data.get('entry_value')

    # Validation des données
    if amount is None or entry_value is None:
        return jsonify({'error': 'Données manquantes'}), 400
    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({'error': 'Le montant doit être positif'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Montant invalide'}), 400

    user_id = session['user_id']
    bet_id = str(uuid.uuid4())  # ID unique du pari

    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            async with conn.cursor() as cur:
                # --- Début transaction ---
                await conn.begin()

                # Vérifier solde avec verrouillage
                await cur.execute(
                    "SELECT solde FROM solde WHERE user_id = %s FOR UPDATE", (user_id,)
                )
                row = await cur.fetchone()
                if not row:
                    await conn.rollback()
                    return jsonify({'error': 'Solde utilisateur non trouvé'}), 404

                current_solde = float(row[0])
                if current_solde < amount:
                    await conn.rollback()
                    return jsonify({'error': 'Solde insuffisant'}), 400

                # Récupérer infos utilisateur
                await cur.execute(
                    "SELECT name, picture FROM users WHERE id = %s", (user_id,)
                )
                user_data = await cur.fetchone()
                if not user_data:
                    await conn.rollback()
                    return jsonify({'error': 'Utilisateur non trouvé'}), 404

                user_name, user_avatar = user_data

                # Décrémenter le solde
                new_solde = current_solde - amount
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id),
                )

                # Insérer le pari
                await cur.execute(
                    """
                    INSERT INTO bets 
                    (id, user_id, user_name, user_avatar, amount, entry_value, start_time, completed)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW(), FALSE)
                    """,
                    (bet_id, user_id, user_name, user_avatar, amount, entry_value),
                )

                # Commit transaction
                await conn.commit()

                return jsonify({
                    'success': True,
                    'new_solde': new_solde,
                    'bet_id': bet_id
                })

        except Exception as e:
            await conn.rollback()
            return jsonify({'error': str(e)}), 500


# --- Route Collect Bet (100% async) ---
@app.route('/collect_bet', methods=['POST'])
async def collect_bet():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    data = await request.get_json()
    bet_id = data.get('bet_id')
    end_value = float(data.get('end_value'))
    user_id = session['user_id']

    pool = await get_pool()
    conn = await pool.acquire()
    try:
        async with conn.cursor() as cur:
            # 1. Vérifier si booster "+20% gains" est actif
            await cur.execute("""
                SELECT 1 FROM product_purchases
                WHERE user_id = %s AND product_name = 'Booster +20%% gains'
                LIMIT 1
            """, (user_id,))
            has_booster = await cur.fetchone() is not None

            # 2. Récupérer les détails de la mise
            await cur.execute("""
                SELECT amount, entry_value, user_id
                FROM bets
                WHERE id = %s AND completed = FALSE
                FOR UPDATE
            """, (bet_id,))
            bet = await cur.fetchone()

            if not bet:
                return jsonify({'error': 'Mise introuvable ou déjà terminée'}), 404

            amount, entry_value, bet_user_id = float(bet[0]), float(bet[1]), bet[2]

            if bet_user_id != user_id:
                return jsonify({'error': 'Non autorisé'}), 403

            # 3. Appliquer booster si actif
            if has_booster:
                amount *= 1.2

            # 4. Calcul du pourcentage
            percentage_change = ((end_value - entry_value) / entry_value) * 100

            # 5. Déterminer gains ou pertes
            if percentage_change < 0:
                profit = -amount
                loss_type = "total"
            elif percentage_change == 0:
                loss = amount * 0.25
                profit = -loss
                loss_type = "25percent"
            elif 0 < percentage_change < 30:
                loss = amount * 0.5
                profit = -loss
                loss_type = "50percent"
            else:
                profit = amount * (percentage_change / 100)
                loss_type = "gain"

            # --- Début transaction ---
            await cur.execute("START TRANSACTION")

            # 6.1 Marquer le pari comme complété
            await cur.execute("""
                UPDATE bets
                SET end_time = NOW(),
                    end_value = %s,
                    profit = %s,
                    completed = TRUE
                WHERE id = %s
            """, (end_value, profit, bet_id))

            # 6.2 Mettre à jour le solde
            if loss_type == "total":
                pass
            elif loss_type == "25percent":
                await cur.execute("""
                    UPDATE solde
                    SET solde = solde + %s
                    WHERE user_id = %s
                """, (amount * 0.75, user_id))
            elif loss_type == "50percent":
                await cur.execute("""
                    UPDATE solde
                    SET solde = solde + %s
                    WHERE user_id = %s
                """, (amount * 0.5, user_id))
            else:
                await cur.execute("""
                    UPDATE solde
                    SET solde = solde + %s
                    WHERE user_id = %s
                """, (amount + profit, user_id))

            await conn.commit()

        return jsonify({
            'success': True,
            'profit': profit,
            'percentage_change': percentage_change,
            'loss_type': loss_type,
            'booster_applied': has_booster
        })

    except Exception as e:
        await conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        pool.release(conn)


# --- Route 100% async ---
@app.route('/get_bets')
async def get_bets():
    pool = await get_pool()
    conn = await pool.acquire()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT id, user_id, user_name, user_avatar, amount, entry_value,
                       start_time, end_time, end_value, profit, completed
                FROM bets
                ORDER BY start_time DESC
            """)
            bets = await cur.fetchall()

            bets_list = []
            for bet in bets:
                bets_list.append({
                    'id': bet[0],
                    'user_id': bet[1],
                    'user_name': bet[2],
                    'user_avatar': bet[3],
                    'amount': float(bet[4]),
                    'entry_value': float(bet[5]),
                    'start_time': bet[6].strftime('%Y-%m-%d %H:%M:%S') if bet[6] else None,
                    'end_time': bet[7].strftime('%Y-%m-%d %H:%M:%S') if bet[7] else None,
                    'end_value': float(bet[8]) if bet[8] is not None else None,
                    'profit': float(bet[9]) if bet[9] is not None else None,
                    'completed': bool(bet[10])
                })

        return jsonify({'bets': bets_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        pool.release(conn)


# --- Route 100% async ---
@app.route('/update6balance', methods=['POST'])
async def update6balance():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    data = await request.get_json()
    new_balance = data.get('new_balance')

    if new_balance is None:
        return jsonify({'error': 'Nouveau solde manquant'}), 400

    try:
        new_balance = float(new_balance)
    except (ValueError, TypeError):
        return jsonify({'error': 'Solde invalide'}), 400

    pool = await get_pool()
    conn = await pool.acquire()
    try:
        async with conn.cursor() as cur:
            await cur.execute("""
                UPDATE solde
                SET solde = %s
                WHERE user_id = %s
            """, (new_balance, session['user_id']))

            await conn.commit()

            # Si aucune ligne mise à jour, on ne fait rien (logique demandée)
            return jsonify({'success': True})

    except Exception as e:
        await conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        pool.release(conn)


# --- Route 100% async ---
@app.route('/get_user_history', methods=['GET'])
async def get_user_history():
    # Vérifiez si l'utilisateur est connecté
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401
    
    user_id = session['user_id']
    pool = await get_pool()
    conn = await pool.acquire()

    try:
        async with conn.cursor() as cur:
            # Requête pour récupérer l'historique des paris (terminés uniquement)
            query = """
            SELECT 
                b.id, 
                b.amount, 
                b.entry_value, 
                b.start_time, 
                b.end_time, 
                b.end_value, 
                b.profit,
                b.completed
            FROM bets b
            WHERE b.user_id = %s AND b.completed = TRUE
            ORDER BY b.end_time DESC
            """
            await cur.execute(query, (user_id,))
            bets = await cur.fetchall()

        # Transformation des résultats pour le frontend
        bets_history = []
        for bet in bets:
            bets_history.append({
                'id': bet[0],
                'amount': float(bet[1]),
                'entry_value': float(bet[2]),
                'start_time': bet[3].strftime('%Y-%m-%d %H:%M:%S') if bet[3] else None,
                'end_time': bet[4].strftime('%Y-%m-%d %H:%M:%S') if bet[4] else None,
                'end_value': float(bet[5]) if bet[5] is not None else None,
                'profit': float(bet[6]) if bet[6] is not None else None,
                'completed': bool(bet[7])
            })

        return jsonify({
            'success': True,
            'bets': bets_history
        })

    except Exception as e:
        app.logger.error(f"Erreur lors de la récupération de l'historique: {str(e)}")
        return jsonify({'error': 'Erreur serveur lors de la récupération de l\'historique'}), 500

    finally:
        pool.release(conn)

# --- Route Async ---
@app.route('/check-wallet-purchase', methods=['GET'])
async def check_wallet_purchase():
    # Vérifier session
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Utilisateur non connecté"}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT COUNT(*)
                    FROM product_purchases
                    WHERE user_id = %s AND product_name = 'Wari Wallet'
                """, (user_id,))
                result = await cur.fetchone()

        return jsonify({"has_wallet": result[0] > 0})

    except Exception as e:
        pass
        return jsonify({"error": "Erreur serveur"}), 500


# --- Générateur de wallet ID ---
def generate_wallet_id():
    suffix = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    return f'W-JR{suffix}'


# --- Route Async pour gérer wallet ---
@app.route('/api/wallet/id', methods=['GET'])
async def ensure_wallet_exists():
    if "user_id" not in session:
        return jsonify({"error": "Non authentifié"}), 401

    user_id = session["user_id"]

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # Vérifier si un wallet existe déjà
                await cur.execute(
                    "SELECT id, wallet_id, created_at FROM wallets WHERE user_id = %s",
                    (user_id,)
                )
                wallet = await cur.fetchone()

                if wallet:
                    wallet_db_id, wallet_id, created_at = wallet

                    # Vérifier expiration (31 jours)
                    if created_at and (datetime.now() - created_at) > timedelta(days=31):
                        # Supprimer le wallet expiré
                        await cur.execute("DELETE FROM wallets WHERE id = %s", (wallet_db_id,))

                        # Supprimer aussi l’achat correspondant
                        await cur.execute("""
                            DELETE FROM product_purchases
                            WHERE user_id = %s AND product_name = 'Wari Wallet'
                        """, (user_id,))

                        await conn.commit()
                        return "", 204  # Pas de contenu

                # Si aucun wallet → créer un nouveau
                if not wallet:
                    await cur.execute("SELECT name, picture FROM users WHERE id = %s", (user_id,))
                    user_data = await cur.fetchone()

                    if not user_data:
                        return jsonify({"error": "Utilisateur introuvable"}), 404

                    user_name, user_file = user_data

                    # Générer un wallet_id unique
                    wallet_id = generate_wallet_id()
                    while True:
                        await cur.execute("SELECT id FROM wallets WHERE wallet_id = %s", (wallet_id,))
                        exists = await cur.fetchone()
                        if not exists:
                            break
                        wallet_id = generate_wallet_id()

                    # Insérer le nouveau wallet
                    await cur.execute("""
                        INSERT INTO wallets (wallet_id, user_id, user_name, user_file)
                        VALUES (%s, %s, %s, %s)
                    """, (wallet_id, user_id, user_name, user_file))

                    await conn.commit()

        return jsonify({"walletId": wallet_id})

    except Exception as e:
        pass
        return jsonify({"error": "Erreur serveur"}), 500
    

# --- Route async Internal Transfer ---
@app.route("/api/wallet/internal-transfer", methods=["POST"])
async def internal_transfer():
    print("📥 Requête reçue pour /internal-transfer")

    try:
        data = await request.get_json()
    except Exception:
        return jsonify({"error": "Requête invalide"}), 400

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Utilisateur non authentifié"}), 401

    if not data or not all(k in data for k in ["amount", "from", "to"]):
        return jsonify({"error": "Données manquantes"}), 400

    try:
        amount = Decimal(str(data["amount"]))
        from_acc = data["from"]
        to_acc = data["to"]

        if from_acc not in ["main", "savings"] or to_acc not in ["main", "savings"]:
            return jsonify({"error": "Compte invalide"}), 400
        if amount <= 0:
            return jsonify({"error": "Montant invalide"}), 400
        if from_acc == to_acc:
            return jsonify({"error": "Transfert entre même compte impossible"}), 400

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # --- Récupérer le solde principal ---
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                solde_main = await cur.fetchone()
                if not solde_main:
                    return jsonify({"error": "Compte principal introuvable"}), 404
                solde_main = Decimal(str(solde_main[0]))

                # --- Récupérer ou créer le compte épargne ---
                await cur.execute("SELECT solde FROM epargne WHERE user_id = %s", (user_id,))
                res = await cur.fetchone()
                if res:
                    solde_savings = Decimal(str(res[0]))
                else:
                    await cur.execute("INSERT INTO epargne (user_id, solde) VALUES (%s, 0)", (user_id,))
                    await conn.commit()
                    solde_savings = Decimal("0")

                # --- Effectuer le transfert ---
                if from_acc == "main" and to_acc == "savings":
                    if solde_main < amount:
                        return jsonify({"error": "Solde principal insuffisant"}), 400

                    new_solde_main = solde_main - amount
                    new_solde_savings = solde_savings + amount

                    await cur.execute("UPDATE solde SET solde = %s WHERE user_id = %s", (new_solde_main, user_id))
                    await cur.execute("UPDATE epargne SET solde = %s WHERE user_id = %s", (new_solde_savings, user_id))

                elif from_acc == "savings" and to_acc == "main":
                    if solde_savings < amount:
                        return jsonify({"error": "Solde épargne insuffisant"}), 400

                    new_solde_savings = solde_savings - amount
                    new_solde_main = solde_main + amount

                    await cur.execute("UPDATE epargne SET solde = %s WHERE user_id = %s", (new_solde_savings, user_id))
                    await cur.execute("UPDATE solde SET solde = %s WHERE user_id = %s", (new_solde_main, user_id))

                else:
                    return jsonify({"error": "Cas non pris en charge"}), 400

                # Commit après toutes les opérations
                await conn.commit()

        return jsonify({
            "success": True,
            "main_balance": float(new_solde_main),
            "savings_balance": float(new_solde_savings),
            "available_balance": float(new_solde_main),
            "message": "Transfert effectué avec succès"
        })

    except ValueError:
        return jsonify({
            "success": False,
            "error": "Montant invalide - veuillez entrer un nombre valide"
        }), 400
    except Exception as e:
        pass
        return jsonify({
            "success": False,
            "error": "Une erreur technique est survenue"
        }), 500


# --- Route async balances ---
@app.route('/api/wallet/balances', methods=['GET'])
async def get_balances():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Utilisateur non authentifié"}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Solde principal
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                solde_main = await cur.fetchone()
                solde_main = solde_main[0] if solde_main else 0

                # Solde épargne
                await cur.execute("SELECT solde FROM epargne WHERE user_id = %s", (user_id,))
                solde_savings = await cur.fetchone()
                solde_savings = solde_savings[0] if solde_savings else 0

        return jsonify({
            "main_balance": float(solde_main),
            "savings_balance": float(solde_savings)
        })

    except Exception as e:
        pass
        return jsonify({"error": "Erreur serveur"}), 500
    

# --- Route 100% Async ---
@app.route('/api/wallet/interest-rate', methods=['GET'])
async def get_interest_rate():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # Vérifier booster
                await cur.execute("""
                    SELECT id, purchase_date 
                    FROM product_purchases 
                    WHERE user_id = %s AND product_name = 'Booster +20%% gains'
                    LIMIT 1
                """, (user_id,))
                booster_data = await cur.fetchone()

                has_valid_boost = False

                if booster_data:
                    booster_id, purchase_date = booster_data
                    if isinstance(purchase_date, str):
                        purchase_date = datetime.strptime(purchase_date, "%Y-%m-%d")
                    if (datetime.now() - purchase_date).days <= 25:
                        has_valid_boost = True
                    else:
                        # Supprimer booster expiré
                        await cur.execute("DELETE FROM product_purchases WHERE id = %s", (booster_id,))

                # Déterminer taux
                taux = 20.0 if has_valid_boost else 2.4

                # Vérifier ligne epargne
                await cur.execute("SELECT id FROM epargne WHERE user_id = %s", (user_id,))
                epargne_data = await cur.fetchone()

                if epargne_data:
                    await cur.execute("UPDATE epargne SET taux = %s WHERE user_id = %s", (taux, user_id))
                else:
                    await cur.execute("INSERT INTO epargne (user_id, taux) VALUES (%s, %s)", (user_id, taux))

        return jsonify({'interest_rate': taux})

    except Exception as e:
        pass
        return jsonify({'error': 'Server error'}), 500


# --- Route 100% async ---
@app.route('/api/wallet/balances', methods=['GET'])
async def get_balannces():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # Solde principal
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                solde_main_row = await cur.fetchone()
                solde_main = float(solde_main_row[0]) if solde_main_row else 0.0

                # Solde épargne
                await cur.execute("SELECT solde FROM epargne WHERE user_id = %s", (user_id,))
                solde_savings_row = await cur.fetchone()
                solde_savings = float(solde_savings_row[0]) if solde_savings_row else 0.0

        return jsonify({
            'main_balance': solde_main,
            'savings_balance': solde_savings
        })

    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500


# --- Route 100% async ---
@app.route('/api/wallet/calculate-interest', methods=['POST'])
async def calculate_interest_if_due():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']
    today = datetime.now().date()

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer solde, taux et date du prochain intérêt
                await cur.execute(
                    "SELECT solde, taux, interet FROM epargne WHERE user_id = %s",
                    (user_id,)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({'message': 'Aucune donnée epargne'}), 404

                epargne_solde, taux_annuel, next_interest_date = result

                # Conversion Decimal -> float si nécessaire
                epargne_solde = float(epargne_solde) if isinstance(epargne_solde, Decimal) else epargne_solde
                taux_annuel = float(taux_annuel) if isinstance(taux_annuel, Decimal) else taux_annuel

                # Initialisation de la date si None
                if not next_interest_date:
                    next_interest_date = today

                # Si la prochaine date d'intérêt est dans le futur, on ne calcule pas encore
                if next_interest_date > today:
                    return jsonify({'message': 'Pas encore la date du prochain intérêt'}), 200

                # Nombre de jours cumulés
                jours_ecoules = (today - next_interest_date).days + 1

                # Taux journalier
                taux_journalier = taux_annuel / 100 / 365

                # Gain cumulé
                gain_total = epargne_solde * taux_journalier * jours_ecoules
                nouveau_solde = epargne_solde + gain_total

                # Mise à jour de la date d'intérêt
                prochaine_date = today + timedelta(days=1)

                # Mise à jour dans la DB
                await cur.execute(
                    "UPDATE epargne SET solde = %s, interet = %s WHERE user_id = %s",
                    (nouveau_solde, prochaine_date, user_id)
                )

        return jsonify({
            'message': 'Intérêt journalier cumulé ajouté avec succès',
            'jours_ecoules': jours_ecoules,
            'ajoute': round(gain_total, 4),
            'nouveau_solde': round(nouveau_solde, 2),
            'prochaine_date': prochaine_date.strftime('%Y-%m-%d')
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Route async ---
@app.route('/api/wallet/get-interest-date', methods=['GET'])
async def get_interest_date():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT interet FROM epargne WHERE user_id = %s",
                    (user_id,)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({'error': 'Aucune donnée epargne'}), 404

                next_interest_date = result[0].strftime('%Y-%m-%d') if result[0] else None

        return jsonify({'next_interest_date': next_interest_date})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Route async ---
@app.route('/api/wallet/transfer', methods=['POST'])
async def transfer():
    data = await request.get_json()

    amount = data.get('amount')
    recipient_wallet_id = data.get('recipient_wallet_id')
    confirmed = data.get('confirmed', False)
    sender_user_id = session.get('user_id')

    if not sender_user_id:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401
    if not amount or not recipient_wallet_id:
        return jsonify({'error': 'Données manquantes'}), 400

    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            return jsonify({'error': 'Le montant doit être positif'}), 400
    except Exception:
        return jsonify({'error': 'Montant invalide'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier existence du wallet destinataire
                await cur.execute(
                    "SELECT user_id FROM wallets WHERE wallet_id = %s",
                    (recipient_wallet_id,)
                )
                result = await cur.fetchone()
                if not result:
                    return jsonify({'error': 'Wallet destinataire introuvable'}), 404

                recipient_user_id = result[0]
                if sender_user_id == recipient_user_id:
                    return jsonify({'error': 'Vous ne pouvez pas transférer à vous-même'}), 400

                # Étape 1 : renvoyer infos destinataire pour confirmation
                if not confirmed:
                    await cur.execute(
                        "SELECT wallet_id, user_name, user_file FROM wallets WHERE wallet_id = %s",
                        (recipient_wallet_id,)
                    )
                    info = await cur.fetchone()
                    if not info:
                        return jsonify({'error': 'Destinataire introuvable'}), 404

                    recipient_info = {
                        'wallet_id': info[0],
                        'user_name': info[1],
                        'user_file': info[2]
                    }
                    return jsonify({
                        'recipient': recipient_info,
                        'amount': float(amount),
                        'confirmation_required': True
                    })

                # Étape 2 : exécuter le transfert
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s FOR UPDATE", (sender_user_id,))
                result = await cur.fetchone()
                if not result or Decimal(str(result[0])) < amount:
                    return jsonify({'error': 'Solde insuffisant'}), 400

                # Débiter l'expéditeur
                await cur.execute(
                    "UPDATE solde SET solde = solde - %s WHERE user_id = %s",
                    (amount, sender_user_id)
                )

                # Créditer le destinataire
                await cur.execute(
                    "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                    (amount, recipient_user_id)
                )

                # Enregistrer la transaction
                await cur.execute(
                    "INSERT INTO jeicke (sender_id, recipient_id, amount, transaction_type, status) "
                    "VALUES (%s, %s, %s, 'transfer', 'completed')",
                    (sender_user_id, recipient_user_id, amount)
                )

                # Récupérer le nouveau solde
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (sender_user_id,))
                new_balance = float((await cur.fetchone())[0])

        return jsonify({
            'message': 'Transfert effectué avec succès',
            'new_balance': new_balance
        })

    except Exception as e:
        return jsonify({'error': f'Erreur lors du transfert: {str(e)}'}), 500



# --- Route async ---
@app.route('/api/messages', methods=['GET'])
async def get_messages():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT 
                    t.id,
                    t.sender_id,
                    t.recipient_id,
                    t.amount,
                    t.created_at,
                    u1.name AS sender_name,
                    u1.picture AS sender_picture,
                    u2.name AS recipient_name,
                    u2.picture AS recipient_picture
                FROM jeicke t
                JOIN users u1 ON t.sender_id = u1.id
                JOIN users u2 ON t.recipient_id = u2.id
                WHERE t.sender_id = %s OR t.recipient_id = %s
                ORDER BY t.created_at DESC
            """, (user_id, user_id))

            rows = await cur.fetchall()

    messages = []
    for row in rows:
        (
            tx_id,
            sender_id,
            recipient_id,
            amount,
            created_at,
            sender_name,
            sender_picture,
            recipient_name,
            recipient_picture
        ) = row

        is_received = (recipient_id == user_id)
        is_sent = (sender_id == user_id)

        if is_received:
            message_text = f"Vous avez reçu {amount:.2f} F de {sender_name}."
            avatar = sender_picture or "https://via.placeholder.com/40"
            other_name = sender_name
        elif is_sent:
            message_text = f"Vous avez envoyé {amount:.2f} F à {recipient_name}."
            avatar = recipient_picture or "https://via.placeholder.com/40"
            other_name = recipient_name
        else:
            continue

        messages.append({
            "senderName": other_name,
            "senderAvatarUrl": avatar,
            "messageTime": created_at.strftime("%Y-%m-%d %H:%M"),
            "messageText": message_text,
            "transactionAmount": f"+{amount:.2f} F" if is_received else f"-{amount:.2f} F",
            "transactionPositive": is_received,
            "transactionId": f"TX{tx_id:08}"
        })

    return jsonify(messages)


# --- Route 100% async ---
@app.route('/api/user/info', methods=['GET'])
async def get_user_info():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT name, picture FROM users WHERE id = %s", (user_id,))
                result = await cur.fetchone()

        if result:
            name, picture = result
            return jsonify({'name': name, 'picture': picture})
        else:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

    except Exception as e:
        return jsonify({'error': f'Erreur serveur : {str(e)}'}), 500


# --- Route 100% async ---
@app.route('/update_solde', methods=['POST'])
async def update_ssolde():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401
    
    user_id = session['user_id']
    data = await request.get_json()
    new_solde = data.get('solde')
    
    if new_solde is None:
        return jsonify({'error': 'Solde manquant'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id)
                )

        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Route 100% async ---
@app.route('/add_winnings', methods=['POST'])
async def add_winnings():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    data = await request.get_json()
    amount = data.get('amount', 0)

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Incrémente le solde
                await cur.execute(
                    "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                    (amount, user_id)
                )
                # Récupère le nouveau solde
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                row = await cur.fetchone()
                new_balance = row[0] if row else 0

        return jsonify({
            'success': True,
            'new_balance': new_balance,
            'amount_added': amount
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500



# --- Route 100% async ---
@app.route('/bet', methods=['POST'])
async def bet():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    data = await request.get_json()
    bet_amount = data.get('bet_amount')

    if not bet_amount or bet_amount <= 0:
        return jsonify({'error': 'Mise invalide'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # 1. Vérifier le solde actuel
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                row = await cur.fetchone()
                
                if not row:
                    return jsonify({'error': 'Utilisateur non trouvé'}), 404

                current_balance = float(row[0])

                # 2. Vérifier si le solde est suffisant
                if current_balance < bet_amount:
                    return jsonify({'error': 'Solde insuffisant'}), 400

                # 3. Mettre à jour le solde
                new_balance = current_balance - bet_amount
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_balance, user_id)
                )

                # 4. Optionnel : enregistrer la mise dans la table bets
                # await cur.execute(
                #     "INSERT INTO bets (user_id, amount, date) VALUES (%s, %s, NOW())",
                #     (user_id, bet_amount)
                # )

        return jsonify({
            'success': True,
            'new_balance': new_balance,
            'bet_amount': bet_amount
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Route 100% async ---
@app.route('/get_solde', methods=['POST'])
async def gettt_solde():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({'solde': float(result[0])})
        else:
            return jsonify({'error': 'Aucun solde trouvé pour cet utilisateur'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


##########################################################################
##################################################################################
##########################################################################"#####"
##################################################################################
#####################Systeme du cycle de calcule toute les 2min (70) Utiliser par XOF trader et Trend Up  


import logging 

# --- Config logging ---
logging.basicConfig(
    filename='f_x_calls.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

CYCLE_DURATION = 70  # Durée du cycle en secondes



# --- Factorial sécurisée ---
def safe_factorial(n: int) -> int:
    MAX_FACTORIAL = 20
    if n > MAX_FACTORIAL:
        n = MAX_FACTORIAL
    if n < 0:
        raise ValueError("Factorial non défini pour négatif")
    return math.factorial(n)

def calcul_fx(x: float) -> int:
    ceil_x = math.ceil(x)
    floor_x = math.floor(x)
    mod_base = floor_x + 1
    fact = safe_factorial(ceil_x)
    val_mod = fact % mod_base
    cos_val = math.cos(math.pi * val_mod)
    rounded = round(cos_val)
    result = (rounded ** 2) % 2
    return result

# --- Calcul et upsert async ---
async def calculate_and_store_fx():
    x = random.uniform(0, 30)
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Lire la valeur actuelle
                await cur.execute("SELECT result FROM calcul_fx WHERE id = 1")
                row = await cur.fetchone()

                if row:
                    current_result = row[0]
                    new_result = 0 if current_result == 1 else 1
                else:
                    new_result = 1

                timestamp = datetime.now(timezone.utc).replace(tzinfo=None)

                logging.info(f"[CALC] Tentative upsert : timestamp={timestamp}, x={x:.5f}, new_result={new_result}")

                upsert_query = """
                    INSERT INTO calcul_fx (id, timestamp, x, result)
                    VALUES (1, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        timestamp = VALUES(timestamp),
                        x = VALUES(x),
                        result = VALUES(result)
                """
                await cur.execute(upsert_query, (timestamp, x, new_result))
                logging.info(f"[CALC] Ligne upsertée avec new_result={new_result} et x={x:.5f}")
        return '', 204
    except Exception as e:
        logging.error(f"Erreur calcul/upsert : {e}")
        return jsonify({'error': str(e)}), 500

# --- Tâche asynchrone pour cycles réguliers ---
async def fx_cycle_loop():
    while True:
        fin_cycle = datetime.now(timezone.utc) + timedelta(seconds=CYCLE_DURATION)
        await asyncio.sleep(CYCLE_DURATION)
        try:
            
            await calculate_and_store_fx()
        except Exception as e:
            pass

# --- Démarrage de la boucle de fond ---
@app.before_serving
async def startup():
    asyncio.create_task(fx_cycle_loop())

##############################################################################
##############################################################################
##############################################################################
##############################################################################


@app.route('/get_lettricide_solde', methods=['GET'])
async def get_lettricide_solde():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({'solde': result[0]})
        else:
            return jsonify({'error': 'Aucun solde trouvé pour cet utilisateur'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_lettricide_solde', methods=['POST'])
async def update_lettricide_solde():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401

    data = await request.get_json()
    new_solde = data.get('solde')
    if new_solde is None:
        return jsonify({'error': 'Solde manquant'}), 400

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier si l'utilisateur a déjà un solde
                await cur.execute("SELECT 1 FROM solde WHERE user_id = %s", (user_id,))
                exists = await cur.fetchone()
                if not exists:
                    return jsonify({'error': 'Aucun solde existant à mettre à jour'}), 404

                # Mettre à jour le solde
                await cur.execute("UPDATE solde SET solde = %s WHERE user_id = %s", (new_solde, user_id))

        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


#######################3###################################################
####################################A utiliser apres ou W-Drive#######################
############################################################################
@app.route('/get_game_parameters', methods=['POST'])
async def get_game_parameters():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    # Générer les paramètres sécurisés
    game_params = {
        'max_speed': 0.8,
        'acceleration': 0.002,
        'max_score_per_second': 50,
        'timestamp': datetime.utcnow().isoformat(),
    }
    
    return jsonify({'params': game_params})

@app.route('/validate_game_state', methods=['POST'])
async def validate_game_state():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    data = await request.get_json()
    
    # Vérifications de sécurité
    if data['distance'] / max(data['game_time'], 1) > 10:  # 10m/s max
        return jsonify({'valid': False, 'reason': 'Vitesse anormale'})
    
    if data['score'] > data['distance'] * 2:  # Score réaliste
        return jsonify({'valid': False, 'reason': 'Score anormal'})
    
    if data['speed'] > 1.5:  # Vitesse max réaliste
        return jsonify({'valid': False, 'reason': 'Vitesse excessive'})
    
    return jsonify({'valid': True})


# --- Route activate-referral async ---
@app.route('/activate-referral', methods=['POST'])
async def activate_referral():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

    data = await request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({"success": False, "error": "Code manquant"}), 400

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # Vérifier si l'utilisateur a déjà été parrainé
                await cur.execute(
                    "SELECT id FROM bonus_usage WHERE user_id=%s LIMIT 1", 
                    (user_id,)
                )
                if await cur.fetchone():
                    return jsonify({"success": False, "error": "Vous avez déjà été parrainé"}), 400

                # Vérifier si le code existe
                await cur.execute(
                    "SELECT id, pere_id FROM bonus WHERE code=%s", 
                    (code,)
                )
                bonus = await cur.fetchone()
                if not bonus:
                    return jsonify({"success": False, "error": "Code invalide"}), 400

                bonus_id, pere_id = bonus

                # Empêcher l'utilisateur de se parrainer lui-même
                if pere_id == user_id:
                    return jsonify({"success": False, "error": "Vous ne pouvez pas utiliser votre propre code"}), 400

                # Ajouter 200F à l'utilisateur
                await cur.execute(
                    "UPDATE solde SET solde = solde + 200 WHERE user_id=%s", 
                    (user_id,)
                )
                # Ajouter 100F au propriétaire du code
                await cur.execute(
                    "UPDATE solde SET solde = solde + 100 WHERE user_id=%s", 
                    (pere_id,)
                )
                # Enregistrer l'utilisation du code
                await cur.execute(
                    "INSERT INTO bonus_usage (bonus_id, user_id, used_at) VALUES (%s, %s, %s)",
                    (bonus_id, user_id, datetime.now())
                )

                return jsonify({
                    "success": True,
                    "message": "Code utilisé avec succès ! +200F ajouté à votre solde"
                })

            except Exception as e:
                # rollback automatique impossible avec autocommit=True, sinon gérer manuellement
                return jsonify({"success": False, "error": str(e)}), 500


# --- Route async pour vérifier le statut du referral ---
@app.route('/check-referral-status', methods=['GET'])
async def check_referral_status():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"activated": False}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id FROM bonus_usage WHERE user_id=%s LIMIT 1",
                (user_id,)
            )
            result = await cur.fetchone()

    activated = bool(result)
    return jsonify({"activated": activated})



async def generate_referral_code(cursor, username):
    # Nettoyer le pseudo
    base = re.sub(r'[^a-zA-Z0-9]', '', username.lower())
    base = base[:12]  # limite raisonnable

    # Tous les codes ont un chiffre obligatoire
    candidates = [f"@{base}{i}" for i in range(1, 100)]  # @username1 → @username99

    # Vérifier en base les codes déjà utilisés
    await cursor.execute(
        "SELECT code FROM bonus WHERE code IN %s",
        (tuple(candidates),)
    )
    rows = await cursor.fetchall()
    used = {row[0] for row in rows}

    # Retourner le premier code libre
    for code in candidates:
        if code not in used:
            return code

    raise Exception("Impossible de générer un code de parrainage unique")

@app.route('/get-user-referral', methods=['GET'])
async def get_user_referral():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:

            # Vérifier si l'utilisateur a déjà un code
            await cursor.execute(
                "SELECT code FROM bonus WHERE pere_id=%s LIMIT 1",
                (user_id,)
            )
            result = await cursor.fetchone()
            if result:
                return jsonify({"success": True, "code": result[0]})

            # Récupérer le username
            await cursor.execute(
                "SELECT name FROM users WHERE id=%s LIMIT 1",
                (user_id,)
            )
            user = await cursor.fetchone()
            if not user:
                return jsonify({"success": False, "error": "Utilisateur introuvable"}), 404

            username = user[0]

            # Générer un code unique avec chiffre obligatoire
            new_code = await generate_referral_code(cursor, username)

            # Sauvegarder le code
            try:
                await cursor.execute(
                    "INSERT INTO bonus (code, pere_id) VALUES (%s, %s)",
                    (new_code, user_id)
                )
                await conn.commit()
            except Exception:
                return jsonify({"success": False, "error": "/"}), 500

            return jsonify({"success": True, "code": new_code})


@app.route('/calcul_gainss', methods=['POST'])
async def calcul_gainss():
    await asyncio.sleep(0)  # placeholder pour rester 100% async

    # Vérifier que l'utilisateur est connecté
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Utilisateur non connecté"}), 401

    data = await request.get_json()
    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400

    try:
        score = float(data['score'])
        mise = float(data['mise'])
    except (KeyError, ValueError):
        return jsonify({"error": "Données invalides"}), 400


    # Calcul du gain final : mise/2 + score_adjusted + mise
    gain_final = mise * 2

    return jsonify({"gain_final": gain_final})



# ======================================================
# SESSIONS EN MÉMOIRE DE CASSE BRIQUE (BLOCK BREACK)
# ======================================================
brique_sessions = {}     # session_id -> data
ws_links = {}            # websocket -> session_id

def validate_brique_game_state(session_data, new_state):
    required = ["score", "lives"]
    for f in required:
        if f not in new_state:
            return False

    if new_state["score"] < 0 or new_state["lives"] < 0:
        return False

    old = session_data.get("game_state", {})
    if old and new_state["score"] < old.get("score", 0) - 100:
        return False

    return True


def validate_brique_state_transition(old, new):
    if "score" in old and "score" in new:
        if new["score"] < old["score"] - 50:
            return False
    return True


async def validate_objective_backend(objective_id, objective_value, game_data, game_state):
    objective_id = int(objective_id)
    

    # 1️⃣ Finir en MOINS de X secondes (strictement moins)
    if objective_id == 1:
        end_time = game_data.get("end_time")
        start_time = game_data.get("start_time")
        
        if not end_time or not start_time:
            return False
        
        try:
            # Calculer le temps écoulé en secondes
            if isinstance(end_time, (int, float)) and isinstance(start_time, (int, float)):
                time_taken = (end_time - start_time) / 1000  # millisecondes → secondes
            else:
                end_dt = datetime.fromisoformat(str(end_time).replace('Z', '+00:00'))
                start_dt = datetime.fromisoformat(str(start_time).replace('Z', '+00:00'))
                time_taken = (end_dt - start_dt).total_seconds()
            
            # STRICT: temps_écoulé < valeur_objective (strictement moins)
            is_valid = time_taken < objective_value
            return is_valid
            
        except Exception as e:
            return False

    # 2️⃣ NE PERDRE AUCUNE vie (strictement 0 pertes)
    if objective_id == 2:
        # Vies finales = 3 - pertes
        final_lives = game_state.get("lives", 0)
        
        # Pour savoir combien de vies perdues, on regarde:
        # - Soit le jeu nous donne "lives_lost" dans game_state
        # - Soit on calcule: 3 - lives_finales
        lives_lost = game_state.get("lives_lost", 3 - final_lives)
        
        
        # STRICT: pas de vie perdue (lives_lost == 0)
        is_valid = lives_lost == 0
        return is_valid

    # 3️⃣ Atteindre EXACTEMENT le score X (>= pour victoire)
    if objective_id == 3:
        final_score = game_state.get("score", 0)
        
        
        # Pour un objectif de score, le joueur doit avoir AU MOINS le score demandé
        # Mais si le jeu se termine avant (Game Over), il faut vérifier qu'il a atteint le score
        is_valid = final_score >= objective_value
        return is_valid

    # 4️⃣ Terminer avec EXACTEMENT X rebonds (pas plus, pas moins)
    if objective_id == 4:
        bounce_count = game_data.get("bounce_count", 0)
        # Vérifier aussi que toutes les briques sont cassées
        bricks_remaining = game_state.get("bricks_remaining", 999)
        all_bricks_destroyed = bricks_remaining == 0
        
        
        # STRICT: bounce_count <= objective_value ET toutes briques cassées
        is_valid = bounce_count <= objective_value and all_bricks_destroyed
        return is_valid

    return False

@app.websocket("/ws/casse-briques")
async def ws_casse_briques():
    user_id = session.get("user_id")
    if not user_id:
        await websocket.send_json({"event": "error", "error": "Non connecté"})
        return

    try:
        while True:
            msg = await websocket.receive_json()
            event = msg.get("event")

            if event == "create_session":
                session_id = (
                    f"brique_{user_id}_"
                    f"{int(datetime.utcnow().timestamp())}_"
                    f"{hashlib.md5(str(datetime.utcnow()).encode()).hexdigest()[:6]}"
                )

                brique_sessions[session_id] = {
                    "user_id": user_id,
                    "created_at": datetime.utcnow(),
                    "last_activity": datetime.utcnow(),
                    "game_state": {},
                    "objective": msg.get("objective"),
                    "objective_completed": False,
                    "is_active": True
                }

                ws_links[websocket] = session_id

                await websocket.send_json({
                    "event": "session_created",
                    "session_id": session_id
                })

            elif event == "update_state":
                session_id = ws_links.get(websocket)
                session_data = brique_sessions.get(session_id)

                if not session_data:
                    await websocket.send_json({"event": "error", "error": "Session invalide"})
                    continue

                new_state = msg.get("game_state")
                if not validate_brique_game_state(session_data, new_state):
                    session_data.setdefault("flags", {})["state_tampering"] = True
                    await websocket.send_json({"event": "cheat_detected"})
                    continue

                if not validate_brique_state_transition(session_data["game_state"], new_state):
                    await websocket.send_json({"event": "invalid_transition"})
                    continue

                session_data["game_state"] = new_state
                session_data["last_activity"] = datetime.utcnow()

                await websocket.send_json({"event": "state_updated"})

            elif event == "complete_objective":
                session_id = ws_links.get(websocket)
                session_data = brique_sessions.get(session_id)

                if not session_data or session_data["objective_completed"]:
                    await websocket.send_json({
                        "event": "error",
                        "error": "Objectif déjà validé"
                    })
                    continue

                ok = await validate_objective_backend(
                    msg.get("objective_id"),
                    msg.get("objective_value"),
                    msg.get("game_data", {}),
                    session_data["game_state"]
                )

                if not ok:
                    await websocket.send_json({"event": "objective_failed"})
                    continue

                # 💰 GAINS
                current_bet = float(msg.get("current_bet", 0))
                multiplier = 3 if int(msg["objective_id"]) == 2 else 2
                gains = current_bet * multiplier

                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cursor:
                        await cursor.execute(
                            "SELECT solde FROM solde WHERE user_id=%s FOR UPDATE",
                            (user_id,)
                        )
                        row = await cursor.fetchone()
                        if not row:
                            await websocket.send_json({
                                "event": "error",
                                "error": "Solde introuvable"
                            })
                            continue

                        solde_avant = float(row[0])
                        solde_apres = solde_avant + gains

                        await cursor.execute(
                            "UPDATE solde SET solde=%s WHERE user_id=%s",
                            (solde_apres, user_id)
                        )

                        await conn.commit()

                session_data["objective_completed"] = True
                session_data["gains"] = gains

                await websocket.send_json({
                    "event": "objective_completed",
                    "gains": gains,
                    "new_solde": solde_apres
                })

            elif event == "end_session":
                session_id = ws_links.pop(websocket, None)
                if session_id:
                    brique_sessions.pop(session_id, None)

                await websocket.send_json({"event": "session_ended"})
                break

    except asyncio.CancelledError:
        pass
    except Exception as e:
        print("❌ WS ERROR:", e)


# --- Décrémenter les vies du jeu "Block Breack" ---
@app.route('/decrement_breack', methods=['POST'])
async def decrement_breack():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # Vérifier les vies existantes
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s FOR UPDATE",
                    ('Block Breack', user_id)
                )
                row = await cur.fetchone()

                if not row:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = row[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name = %s AND user_id = %s",
                    ('Block Breack', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'error': str(e), 'success': False}), 500


# --- Récupérer les vies du jeu "World Cap" ---
@app.route('/get_breack', methods=['GET'])
async def get_breack():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('Block Breack', user_id)
                )
                row = await cur.fetchone()

                if row:
                    return jsonify({
                        'lives': row[0],
                        'product': 'Block Breack'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Block Breack',
                        'message': 'Configuration par défaut appliquée'
                    })

            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Block Breack'
                }), 500


objectives_templates = [
    {"id": 1, "text": "Terminer un niveau en moins de {X} secondes", "min": 10, "max": 60},
    {"id": 2, "text": "Ne perdre aucune vie", "min": None, "max": None},
    {"id": 3, "text": "Obtenir un score de {X} points ou plus", "min": 500, "max": 5000},
    {"id": 4, "text": "Casser toutes les briques avec moins de {X} rebonds", "min": 5, "max": 30}
]

@app.route('/get-objectives', methods=['GET'])
async def get_objectives():
    # Sélectionner un seul objectif aléatoire
    obj = random.choice(objectives_templates)

    # Générer la valeur {X} si nécessaire
    if obj["min"] is not None and obj["max"] is not None:
        x_value = random.randint(obj["min"], obj["max"])
        text = obj["text"].replace("{X}", str(x_value))
    else:
        x_value = None
        text = obj["text"]

    # Retourner la réponse JSON
    return jsonify({
        "id": obj["id"],
        "objective": text,
        "value": x_value
    })


@app.route('/rendom-target', methods=['GET'])
async def rendom_target() -> Dict:
    """
    Route async qui retourne un entier aléatoire entre 50 et 200 inclus.
    Exemple de réponse: { "target": 123 }
    """
    target = random.randint(70, 150)  # génère un entier entre 50 et 200 inclus
    return jsonify({"target": target})

# =============================================
# SÉCURITÉ SPÉCIFIQUE AU JEU DINO RUN
# =============================================

class DinoRunSecurity:
    def __init__(self, user_id, bet_amount, target_score, existing_session=False):
        # Initialiser tous les attributs dans tous les cas
        self.max_score_per_second = 3
        self.min_score_per_second = 0.1
        self.max_total_score = 10000
        self.max_game_duration = 600
        self.min_game_duration = 5
        
        if not existing_session:
            self.session_id = secrets.token_urlsafe(32)
            self.user_id = user_id
            self.start_time = datetime.utcnow()
            self.bet_amount = bet_amount
            self.target_score = target_score
            self.expiration = self.start_time + timedelta(minutes=30)
            self.session_token = self._generate_token()
        else:
            # Pour les sessions existantes, ces valeurs seront écrasées par load_from_db
            self.session_id = None
            self.user_id = None
            self.start_time = None
            self.bet_amount = None
            self.target_score = None
            self.expiration = None
            self.session_token = None

    def _generate_token(self):
        token_data = f"{self.user_id}:{self.session_id}:{self.start_time.timestamp()}:{self.target_score}"
        token_hash = hashlib.sha256(token_data.encode()).hexdigest()
        return f"{self.session_id}.{token_hash}"

    def validate_token(self, token):
        return token == self.session_token

    def validate_game_result(self, final_score, game_time_seconds, obstacles_passed):
        """Valide les résultats du jeu Dino Run"""
        
        # Vérification expiration session
        if datetime.utcnow() > self.expiration:
            return False, "Session expirée", 0

        # Validation score total
        if final_score > self.max_total_score:
            return False, f"Score total dépassé (max: {self.max_total_score})", self.max_total_score

        # Validation durée de jeu
        if game_time_seconds > self.max_game_duration:
            return False, f"Durée de jeu trop longue (max: {self.max_game_duration}s)", final_score
            
        if game_time_seconds < self.min_game_duration:
            return False, f"Durée de jeu trop courte (min: {self.min_game_duration}s)", final_score

        # Validation score par seconde
        if game_time_seconds > 0:
            score_per_second = final_score / game_time_seconds
            if score_per_second > self.max_score_per_second:
                adjusted_score = int(game_time_seconds * 2)
                return False, f"Score par seconde trop élevé (max: {self.max_score_per_second})", adjusted_score
                
            if score_per_second < self.min_score_per_second:
                return False, f"Score par seconde trop bas (min: {self.min_score_per_second})", final_score

        # Validation cohérence score/obstacles
        if obstacles_passed > 0:
            score_per_obstacle = final_score / obstacles_passed
            if score_per_obstacle > 2:
                adjusted_score = obstacles_passed
                return False, "Ratio score/obstacles anormal", adjusted_score

        # Validation progression réaliste
        if final_score > game_time_seconds * 3:
            adjusted_score = min(final_score, game_time_seconds * 2)
            return False, "Progression du score non réaliste", adjusted_score

        # Validation objectif
        if final_score < self.target_score:
            return False, "Objectif non atteint", final_score

        # Calcul crédibilité
        credibility = self._calculate_credibility(final_score, game_time_seconds, obstacles_passed)
        
        if credibility < 0.4:
            return False, "Partie non crédible", int(final_score * 0.7)
            
        return True, f"Partie validée (crédibilité: {credibility:.2f})", final_score

    def _calculate_credibility(self, score, game_time, obstacles):
        """Calcule un indice de crédibilité entre 0 et 1"""
        if game_time == 0:
            return 0.0
            
        time_ratio = min(score / game_time / 1.5, 2.0)
        obstacle_ratio = 1.0
        if obstacles > 0:
            obstacle_ratio = min(score / obstacles, 2.0)
        objective_ratio = min(score / self.target_score, 1.5)
        
        credibility = (time_ratio * 0.4) + (obstacle_ratio * 0.3) + (objective_ratio * 0.3)
        return min(credibility, 1.0)

# ROUTES SPÉCIFIQUES DINO RUN

@app.route('/start_dino_run_session', methods=['POST'])
async def start_dino_run_session():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401

    data = await request.get_json()
    target_score = data.get('target_score')
    bet_amount = data.get('bet_amount')

    # Validation des paramètres
    if not target_score or target_score > 5000:
        return jsonify({'error': 'Score cible invalide'}), 400
        
    if not bet_amount or bet_amount <= 0:
        return jsonify({'error': 'Mise invalide'}), 400

    game_session = DinoRunSecurity(user_id, bet_amount, target_score)
    await save_dino_run_session_to_db(game_session)

    return jsonify({
        'session_token': game_session.session_token,
        'max_score_per_second': game_session.max_score_per_second,
        'max_total_score': game_session.max_total_score,
        'max_game_duration': game_session.max_game_duration,
        'expires_at': game_session.expiration.isoformat()
    })

@app.route('/validate_dino_run_score', methods=['POST'])
async def validate_dino_run_score():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'valid': False, 'reason': 'Non connecté'}), 401

    data = await request.get_json()
    session_token = data.get('session_token')
    
    if not session_token:
        return jsonify({'valid': False, 'reason': 'Token manquant'}), 400

    game_session = await load_dino_run_session_from_db(user_id)

    if not game_session:
        return jsonify({'valid': False, 'reason': 'Session non trouvée'}), 404

    if not game_session.validate_token(session_token):
        return jsonify({'valid': False, 'reason': 'Token invalide'}), 401

    final_score = data.get('final_score', 0)
    game_time = data.get('game_time', 0)
    obstacles_passed = data.get('obstacles_passed', 0)

    is_valid, reason, adjusted_score = game_session.validate_game_result(
        final_score, game_time, obstacles_passed
    )

    if is_valid:
        try:
            # Calcul des gains basé sur la performance
            bet_amount_dec = Decimal(str(game_session.bet_amount))
            score_dec = Decimal(str(final_score))
            target_dec = Decimal(str(game_session.target_score))
            
            # Ratio performance (score / objectif)
            performance_ratio = score_dec / target_dec
            
            # Base du gain
            if performance_ratio >= Decimal('2.0'):  # 200% de l'objectif
                base_multiplier = Decimal('3.0')
            elif performance_ratio >= Decimal('1.5'):  # 150% de l'objectif
                base_multiplier = Decimal('2.5')
            elif performance_ratio >= Decimal('1.2'):  # 120% de l'objectif
                base_multiplier = Decimal('2.0')
            else:  # Objectif juste atteint
                base_multiplier = Decimal('1.5')
            
            # Bonus de performance
            performance_bonus = (score_dec - target_dec) / Decimal('100')
            
            # Calcul gain final
            gain_final = (bet_amount_dec * base_multiplier) + performance_bonus
            gain_final = gain_final.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

            # Mise à jour du solde
            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SELECT solde FROM solde WHERE user_id=%s", (user_id,))
                    result = await cur.fetchone()

                    if not result:
                        return jsonify({'valid': False, 'reason': 'Utilisateur non trouvé dans solde'}), 404

                    current_balance = Decimal(result[0])
                    new_balance = current_balance + gain_final

                    await cur.execute(
                        "UPDATE solde SET solde=%s WHERE user_id=%s",
                        (str(new_balance), user_id)
                    )

            # Nettoyage session
            await delete_dino_run_session_from_db(game_session.session_id)

            return jsonify({
                'valid': True,
                'final_score': final_score,
                'winnings': float(gain_final),
                'new_balance': float(new_balance),
                'multiplier': float(base_multiplier),
                'performance_bonus': float(performance_bonus),
                'reason': reason
            })

        except Exception as e:
            print(f"Erreur mise à jour solde: {e}")
            return jsonify({'valid': False, 'reason': 'Erreur mise à jour solde'}), 500

    else:
        # En cas d'échec, on ne rend pas la mise
        await delete_dino_run_session_from_db(game_session.session_id)
        return jsonify({
            'valid': False,
            'reason': reason,
            'adjusted_score': adjusted_score,
            'winnings': 0
        })

# FONCTIONS DATABASE DINO RUN

async def save_dino_run_session_to_db(session):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Supprimer les anciennes sessions
            await cur.execute("DELETE FROM dino_run_sessions WHERE user_id=%s", (session.user_id,))
            await cur.execute(
                """
                INSERT INTO dino_run_sessions 
                (session_id, user_id, start_time, bet_amount, target_score, max_score_per_second, 
                 max_total_score, max_game_duration, expiration, session_token)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    session.session_id,
                    session.user_id,
                    session.start_time,
                    session.bet_amount,
                    session.target_score,
                    session.max_score_per_second,
                    session.max_total_score,
                    session.max_game_duration,
                    session.expiration,
                    session.session_token
                )
            )

async def load_dino_run_session_from_db(user_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT session_id, user_id, start_time, bet_amount, target_score, 
                       max_score_per_second, max_total_score, max_game_duration, 
                       expiration, session_token
                FROM dino_run_sessions 
                WHERE user_id=%s 
                ORDER BY start_time DESC 
                LIMIT 1
                """,
                (user_id,)
            )
            row = await cur.fetchone()
            if not row:
                return None

            # Créer une session existante avec tous les attributs
            session = DinoRunSecurity(None, None, None, existing_session=True)
            session.session_id = row[0]
            session.user_id = row[1]
            session.start_time = row[2]
            session.bet_amount = row[3]
            session.target_score = row[4]
            # Les valeurs constantes sont déjà initialisées dans __init__
            session.expiration = row[8]
            session.session_token = row[9]
            return session

async def delete_dino_run_session_from_db(session_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM dino_run_sessions WHERE session_id=%s",
                (session_id,)
            )

# TABLE DATABASE
"""
CREATE TABLE dino_run_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    bet_amount DECIMAL(10,2) NOT NULL,
    target_score INT NOT NULL,
    max_score_per_second DECIMAL(5,2) NOT NULL,
    max_total_score INT NOT NULL,
    max_game_duration INT NOT NULL,
    expiration DATETIME NOT NULL,
    session_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_expiration (expiration)
);
"""

# --- Route async ---
@app.route('/get_dino_lives', methods=['GET'])
async def get_dino_lives():
    # Vérification de la session utilisateur
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Requête pour récupérer les vies spécifiques à Dino Run
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Dino Run' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'lives': result[0],
                'product': 'Dino Run'
            })
        else:
            # Valeur par défaut si aucune entrée n'existe
            return jsonify({
                'lives': 0,
                'product': 'Dino Run',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Dino Run'
        }), 500


# --- Route async ---
@app.route('/decrement_dino_lives', methods=['POST'])
async def decrement_dino_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer le nombre de vies avec verrouillage
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Dino Run' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]

                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'Dino Run' AND user_id = %s
                """, (user_id,))

        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =============================================
# SÉCURITÉ SPÉCIFIQUE AU JEU GALAXY SHOOTER
# =============================================

class GalaxyShooterSecurity:
    def __init__(self, user_id, bet_amount, target_enemies, existing_session=False):
        if not existing_session:
            self.session_id = secrets.token_urlsafe(32)
            self.user_id = user_id
            self.start_time = datetime.utcnow()
            self.bet_amount = bet_amount
            self.target_enemies = target_enemies
            self.max_score_per_enemy = 15  # Score max par ennemi
            self.max_enemies_per_minute = 600  # 10 ennemis/sec × 60 sec = 600/min
            self.min_enemies_per_minute = 50   # Minimum réaliste
            self.max_total_score = 5000000
            self.expiration = self.start_time + timedelta(minutes=30)
            self.session_token = self._generate_token()

    def _generate_token(self):
        token_data = f"{self.user_id}:{self.session_id}:{self.start_time.timestamp()}"
        token_hash = hashlib.sha256(token_data.encode()).hexdigest()
        return f"{self.session_id}.{token_hash}"

    def validate_token(self, token):
        return token == self.session_token

    def validate_game_result(self, final_score, enemies_killed, game_time_seconds):
        """Valide les résultats du jeu Galaxy Shooter"""
        
        if datetime.utcnow() > self.expiration:
            return False, "Session expirée", 0

        # Validation du score total
        if final_score > self.max_total_score:
            adjusted_score = self.max_total_score
            return False, "Score total dépassé", adjusted_score

        # Validation du nombre d'ennemis
        if enemies_killed > self.target_enemies * 2:
            return False, "Nombre d'ennemis éliminés anormal", 0

        # Validation du score par ennemi
        if enemies_killed > 0:
            score_per_enemy = final_score / enemies_killed
            if score_per_enemy > self.max_score_per_enemy:
                adjusted_score = enemies_killed * 10  # Score ajusté
                return False, f"Score par ennemi trop élevé", adjusted_score

        # Validation du taux d'élimination
        if game_time_seconds > 0:
            enemies_per_minute = (enemies_killed / game_time_seconds) * 60
            if enemies_per_minute > self.max_enemies_per_minute:
                adjusted_score = min(final_score, enemies_killed * 8)
                return False, "Taux d'élimination trop élevé", adjusted_score

        # Validation de la cohérence score/ennemis
        expected_min_score = enemies_killed * 5   # Minimum 5 points par ennemi
        expected_max_score = enemies_killed * 15  # Maximum 15 points par ennemi
        
        if final_score < expected_min_score:
            return False, "Score trop bas pour le nombre d'ennemis", expected_min_score
            
        if final_score > expected_max_score:
            adjusted_score = expected_max_score
            return False, "Score dépassant les limites", adjusted_score

        # Validation de l'objectif
        if enemies_killed < self.target_enemies:
            return False, "Objectif non atteint", final_score

        # Calcul de l'indice de crédibilité
        credibility = self._calculate_credibility(final_score, enemies_killed, game_time_seconds)
        
        if credibility < 0.3:
            return False, "Partie non crédible", enemies_killed * 8
            
        return True, f"Partie validée (crédibilité: {credibility:.2f})", final_score

    def _calculate_credibility(self, score, enemies, game_time):
        """Calcule un indice de crédibilité entre 0 et 1"""
        if enemies == 0 or game_time == 0:
            return 0.0
            
        # Ratio score/enemi (idéal = 10)
        score_ratio = min(score / enemies / 10, 1.5)
        
        # Ratio ennemis/temps (idéal = 12 ennemis/minute)
        time_ratio = min((enemies / game_time) * 5, 1.5)
        
        # Ratio objectif atteint
        objective_ratio = min(enemies / self.target_enemies, 1.0)
        
        # Moyenne pondérée
        credibility = (score_ratio * 0.4) + (time_ratio * 0.3) + (objective_ratio * 0.3)
        
        return min(credibility, 1.0)

# ROUTES SPÉCIFIQUES GALAXY SHOOTER

@app.route('/start_galaxy_shooter_session', methods=['POST'])
async def start_galaxy_shooter_session():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401

    data = await request.get_json()
    target_enemies = data.get('target_enemies')
    bet_amount = data.get('bet_amount')

    # Validation des paramètres
    if not target_enemies or target_enemies > 500:
        return jsonify({'error': 'Nombre d\'ennemis cible invalide'}), 400
        
    if not bet_amount or bet_amount <= 0:
        return jsonify({'error': 'Mise invalide'}), 400

    game_session = GalaxyShooterSecurity(user_id, bet_amount, target_enemies)
    await save_galaxy_shooter_session_to_db(game_session)

    return jsonify({
        'session_token': game_session.session_token,
        'max_score_per_enemy': game_session.max_score_per_enemy,
        'max_enemies_per_minute': game_session.max_enemies_per_minute,
        'max_total_score': game_session.max_total_score,
        'expires_at': game_session.expiration.isoformat()
    })

@app.route('/validate_galaxy_shooter_score', methods=['POST'])
async def validate_galaxy_shooter_score():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'valid': False, 'reason': 'Non connecté'}), 401

    data = await request.get_json()
    session_token = data.get('session_token')
    
    if not session_token:
        return jsonify({'valid': False, 'reason': 'Token manquant'}), 400

    game_session = await load_galaxy_shooter_session_from_db(user_id)

    if not game_session:
        return jsonify({'valid': False, 'reason': 'Session non trouvée'}), 404

    if not game_session.validate_token(session_token):
        return jsonify({'valid': False, 'reason': 'Token invalide'}), 401

    final_score = data.get('final_score', 0)
    enemies_killed = data.get('enemies_killed', 0)
    game_time = data.get('game_time', 0)

    is_valid, reason, adjusted_score = game_session.validate_game_result(
        final_score, enemies_killed, game_time
    )

    if is_valid:
        try:
            final_score_dec = Decimal(str(final_score))
            bet_amount_dec = Decimal(str(game_session.bet_amount))

            if final_score > 15000:
                score_adjusted = final_score_dec / Decimal('100')
            elif final_score > 10000:
                score_adjusted = final_score_dec / Decimal('50')
            elif final_score > 7000:
                score_adjusted = final_score_dec / Decimal('35')
            elif final_score > 5000:
                score_adjusted = final_score_dec / Decimal('30')
            elif final_score > 3000:
                score_adjusted = final_score_dec / Decimal('25')
            elif final_score > 1000:
                score_adjusted = final_score_dec / Decimal('10')
            elif final_score > 500:
                score_adjusted = final_score_dec / Decimal('6')
            elif final_score > 400:
                score_adjusted = final_score_dec / Decimal('4')
            elif final_score > 200:
                score_adjusted = final_score_dec / Decimal('3')
            else:
                score_adjusted = final_score_dec / Decimal('2')

            gain_final = (bet_amount_dec / Decimal('2')) + score_adjusted + Decimal('100')
            gain_final = gain_final.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SELECT solde FROM solde WHERE user_id=%s", (user_id,))
                    result = await cur.fetchone()

                    if not result:
                        return jsonify({'valid': False, 'reason': 'Utilisateur non trouvé dans solde'}), 404

                    current_balance = Decimal(result[0])
                    new_balance = current_balance + gain_final

                    await cur.execute(
                        "UPDATE solde SET solde=%s WHERE user_id=%s",
                        (str(new_balance), user_id)
                    )

            await delete_galaxy_shooter_session_from_db(game_session.session_id)

            return jsonify({
                'valid': True,
                'final_score': final_score,
                'winnings': float(gain_final),
                'new_balance': float(new_balance),
                'reason': reason
            })

        except Exception:
            return jsonify({'valid': False, 'reason': 'Erreur mise à jour solde'}), 500

    else:
        await delete_galaxy_shooter_session_from_db(game_session.session_id)
        return jsonify({
            'valid': False,
            'reason': reason,
            'adjusted_score': adjusted_score
        })



# FONCTIONS DATABASE GALAXY SHOOTER

async def save_galaxy_shooter_session_to_db(session):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM galaxy_shooter_sessions WHERE user_id=%s", (session.user_id,))
            await cur.execute(
                """
                INSERT INTO galaxy_shooter_sessions 
                (session_id, user_id, start_time, bet_amount, target_enemies, max_score_per_enemy, 
                 max_enemies_per_minute, max_total_score, expiration, session_token)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    session.session_id,
                    session.user_id,
                    session.start_time,
                    session.bet_amount,
                    session.target_enemies,
                    session.max_score_per_enemy,
                    session.max_enemies_per_minute,
                    session.max_total_score,
                    session.expiration,
                    session.session_token
                )
            )

async def load_galaxy_shooter_session_from_db(user_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT session_id, user_id, start_time, bet_amount, target_enemies, 
                       max_score_per_enemy, max_enemies_per_minute, max_total_score, 
                       expiration, session_token
                FROM galaxy_shooter_sessions 
                WHERE user_id=%s 
                ORDER BY start_time DESC 
                LIMIT 1
                """,
                (user_id,)
            )
            row = await cur.fetchone()
            if not row:
                return None

            session = GalaxyShooterSecurity(None, None, None, existing_session=True)
            session.session_id = row[0]
            session.user_id = row[1]
            session.start_time = row[2]
            session.bet_amount = row[3]
            session.target_enemies = row[4]
            session.max_score_per_enemy = row[5]
            session.max_enemies_per_minute = row[6]
            session.max_total_score = row[7]
            session.expiration = row[8]
            session.session_token = row[9]
            return session

async def delete_galaxy_shooter_session_from_db(session_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM galaxy_shooter_sessions WHERE session_id=%s",
                (session_id,)
            )

# --- Décrémenter une vie pour Galaxy Shooter ---
@app.route('/decrement_shooter', methods=['POST'])
async def decrement_shooter():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401
    
    user_id = session['user_id']
    pool = await get_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # On bloque la ligne pour éviter les conflits concurrents
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Galaxy Shooter' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    await conn.rollback()
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    await conn.rollback()
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'Galaxy Shooter' AND user_id = %s
                """, (user_id,))
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

    except Exception as e:
        async with pool.acquire() as conn:
            await conn.rollback()
        return jsonify({'error': str(e), 'success': False}), 500


# --- Récupérer le nombre de vies ---
@app.route('/get_shooter', methods=['GET'])
async def get_shooter():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Galaxy Shooter' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'lives': result[0],
                'product': 'Galaxy Shooter'
            })
        else:
            return jsonify({
                'lives': 0,
                'product': 'Galaxy Shooter',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({'error': str(e), 'product': 'Galaxy Shooter'}), 500

# =============================================
# SÉCURITÉ SPÉCIFIQUE AU JEU W-risk
# =============================================





# Deux cases négatives consécutives - RÈGLE RETIRÉE
# if len(game['revealed_cells']) >= 2:
#     last_two = game['revealed_cells'][-2:]
#     last_two_values = [game['grid'][i] for i in last_two]
#     print(f"[w_risk_GameManager.w_risk_reveal_cell] Dernières 2 valeurs: {last_two_values}")
#     
#     if all(v < 0 for v in last_two_values):
#         game_ended = True
#         end_reason = "two_negative_cells"
#         print(f"[w_risk_GameManager.w_risk_reveal_cell] ⚠️  Deux négatifs consécutifs!")



# =============================================
# SÉCURITÉ SPÉCIFIQUE AU JEU W-Drive et Autres
# =============================================

# ------------------- GAME SESSION -------------------
class wariSession:
    def __init__(self, user_id, target_distance, initial_bet, existing_session=False):
        if not existing_session:
            self.session_id = secrets.token_urlsafe(32)
            self.user_id = user_id
            self.start_time = datetime.utcnow()
            self.target_distance = target_distance
            self.initial_bet = initial_bet
            self.max_score_per_second = 50
            self.max_speed = 0.8
            self.expiration = self.start_time + timedelta(minutes=10)
            self.session_token = self._generate_token()

    def _generate_token(self):
        # Génère simplement un token unique
        token_data = f"{self.user_id}:{self.session_id}:{self.start_time.timestamp()}"
        token_hash = hashlib.sha256(token_data.encode()).hexdigest()
        return f"{self.session_id}.{token_hash}"

    def validate_token(self, token):
        # Compare simplement avec le token stocké en base
        return token == self.session_token

    def validate_game_parameters(self, client_data, game_time):
        if datetime.utcnow() > self.expiration:
            return False, "Session expirée"

        speed = client_data.get('speed', 0)
        if speed > self.max_speed * 1.6:
            return False, f"Vitesse excessive détectée ({speed:.2f} m/s)"

        score = client_data.get('score', 0)
        max_possible_score = game_time * self.max_score_per_second + 500
        if score > max_possible_score:
            return False, "Score anormalement élevé"

        distance = client_data.get('distance', 0)
        if distance > self.target_distance * 1.1:
            return False, "Distance parcourue anormale"

        min_expected_time = self.target_distance / 40
        max_expected_time = self.target_distance / 2
        if game_time < min_expected_time:
            return False, "Temps de jeu trop court"
        if game_time > max_expected_time:
            return False, "Temps de jeu trop long"


        return True, "Paramètres valides"


# ------------------- DATABASE INTERACTIONS -------------------
async def save_session_to_db(session: wariSession):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM game_sessions WHERE user_id=%s", (session.user_id,))
            await cur.execute(
                """
                INSERT INTO game_sessions
                (session_id, user_id, start_time, target_distance, initial_bet, max_score_per_second, max_speed, expiration, session_token)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    session.session_id,
                    session.user_id,
                    session.start_time,
                    session.target_distance,
                    session.initial_bet,
                    session.max_score_per_second,
                    session.max_speed,
                    session.expiration,
                    session.session_token  # Stocke le token généré
                )
            )


async def load_session_from_db(user_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT session_id, user_id, start_time, target_distance, initial_bet, max_score_per_second, max_speed, expiration, session_token
                FROM game_sessions
                WHERE user_id=%s
                ORDER BY start_time DESC
                LIMIT 1
                """,
                (user_id,)
            )
            row = await cur.fetchone()
            if not row:
                return None

            session = wariSession(None, None, None, existing_session=True)
            session.session_id = row[0]
            session.user_id = row[1]
            session.start_time = row[2]
            session.target_distance = row[3]
            session.initial_bet = row[4]
            session.max_score_per_second = row[5]
            session.max_speed = row[6]
            session.expiration = row[7]
            session.session_token = row[8]  # Token original préservé
            return session


async def delete_session_from_db(session_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM game_sessions WHERE session_id=%s",
                (session_id,)
            )


# ------------------- ROUTES -------------------
@app.route('/start_secure_session', methods=['POST'])
async def start_secure_session():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401

    data = await request.get_json()
    target_distance = data.get('target_distance')
    initial_bet = data.get('initial_bet')

    game_session = wariSession(user_id, target_distance, initial_bet)
    await save_session_to_db(game_session)

    return jsonify({
        'session_hash': game_session.session_token,
        'max_score_per_second': game_session.max_score_per_second,
        'expires_at': game_session.expiration.isoformat()
    })


@app.route('/validate_final_score', methods=['POST'])
async def validate_final_score():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401
    data = await request.get_json()
    session_token = data.get('session_token')
   
    if not session_token:
        return jsonify({'valid': False, 'reason': 'Aucun token fourni'}), 400
    game_session = await load_session_from_db(user_id)
    if not game_session:
        return jsonify({'valid': False, 'reason': 'Session non trouvée'}), 404
    # SIMPLE COMPARAISON - plus de problème de signature !
    if not game_session.validate_token(session_token):
        return jsonify({'valid': False, 'reason': 'Token de session invalide'}), 401
    # Continuer avec le reste de la validation...
    score = data.get('score')
    distance = data.get('distance')
    target_distance = data.get('target_distance')
    game_time = data.get('game_time')
    speed = data.get('speed')
    client_data = {
        'score': score,
        'distance': distance,
        'speed': speed
    }
    is_valid, reason = game_session.validate_game_parameters(client_data, game_time)
    if not is_valid:
        adjusted_score = min(score, int(game_time * game_session.max_score_per_second))
        return jsonify({
            'valid': False,
            'reason': reason,
            'adjusted_score': adjusted_score
        })
    credibility_index = min(1.0, score / (game_time * game_session.max_score_per_second))
    
    # Calcul des gains si validation OK
    try:
        score = float(score)
        mise = float(data.get('mise'))
    except (KeyError, ValueError, TypeError):
        return jsonify({"error": "Données invalides pour le calcul des gains"}), 400
    
    
    # Calcul du gain final
    gain_final = mise * 2
    
    # Crédit au solde de l'utilisateur en utilisant asyncmy avec get_pool
    pool = await get_pool()  # AJOUTER "await" ici
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE solde SET solde = solde + %s WHERE user_id = %s", (gain_final, user_id))
            await conn.commit()
    
    # Supprimer la session après succès
    await delete_session_from_db(game_session.session_id)
    
    return jsonify({
        'valid': True,
        'final_score': score,
        'credibility_index': round(credibility_index, 2),
        'gain_final': gain_final
    })

@app.route('/decrement_w-drive_lives', methods=['POST'])
async def decrement_w_drive_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = %s AND user_id = %s
                    FOR UPDATE
                """, ('W-Drive', user_id))
                row = await cur.fetchone()

                if not row:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = row[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings
                    SET vies = vies - 1
                    WHERE product_name = %s AND user_id = %s
                """, ('W-Drive', user_id))

        # Le pool est en autocommit, donc pas besoin de commit explicite
        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


@app.route('/get_w-drive_lives', methods=['GET'])
async def get_w_drive_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('W-Drive', user_id)
                )
                row = await cur.fetchone()

        if row:
            return jsonify({
                'lives': row[0],
                'product': 'W-Drive'
            })
        else:
            # Valeur par défaut si aucune entrée n'existe
            return jsonify({
                'lives': 0,
                'product': 'W-Drive',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'W-Drive'
        }), 500



@app.route("/random-drive")
async def random_drive_number():
    await asyncio.sleep(0.1)  # Simule un traitement asynchrone

    # Probabilités :
    # 70% → petite valeur
    # 25% → moyenne valeur
    # 5%  → grosse valeur
    roll = random.random()

    if roll < 0.7:
        value = random.randint(500, 800)        # petites valeurs
    elif roll < 0.95:
        value = random.randint(900, 2000)      # valeurs moyennes
    else:
        value = random.randint(5000, 10000)     # grosses valeurs rares

    return jsonify({"random_value": value})


# -----------------------------------
# Systeme de securiter de cloud run
# -----------------------------------
user_sessions = {}  # websocket -> user_id

@app.websocket("/ws/game")
async def ws_game():
    user_id = session.get("user_id")
    if not user_id:
        await websocket.send_json({"event": "error", "error": "Utilisateur non connecté"})
        return

    user_sessions[websocket] = user_id

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "get_honor":
                conditions = [
                    {"type": "time", "name": "Durée de survie", "description": "Survivez pendant X secondes", "target": random.randint(10, 20)},
                    {"type": "score", "name": "Score à atteindre", "description": "Atteignez un score de X points", "target": random.randint(100, 1000)},
                    {"type": "clouds", "name": "Nuages évités", "description": "Évitez X nuages", "target": random.randint(10, 50)},
                    {"type": "jumps", "name": "Sauts consécutifs", "description": "Effectuez X sauts sans toucher le sol", "target": random.randint(3, 10)},
                    {"type": "speed", "name": "Vitesse maximale", "description": "Atteignez une vitesse de X", "target": round(random.uniform(4.0, 7.0), 2)}
                ]
                selected_condition = random.choice(conditions)
                selected_condition["description"] = selected_condition["description"].replace("X", str(selected_condition["target"]))
                await websocket.send_json({"event": "honor", "condition": selected_condition})

            elif action == "check_mindset":
                payload = data.get("payload", {})

                score = float(payload.get("score", 0))
                remaining_time = float(payload.get("remainingTime", 0))
                clouds_avoided = float(payload.get("cloudsAvoided", 0))
                cloud_speed = float(payload.get("cloudSpeed", 0))
                consecutive_jumps = float(payload.get("consecutiveJumps", 0))
                win_condition_type = payload.get("winConditionType", "")
                win_condition_target = float(payload.get("winConditionTarget", 0))
                mise = float(payload.get("mise", 0))

                has_won = False
                if win_condition_type == "time":
                    has_won = remaining_time <= 0
                elif win_condition_type == "score":
                    has_won = score >= win_condition_target
                elif win_condition_type == "clouds":
                    has_won = clouds_avoided >= win_condition_target
                elif win_condition_type == "speed":
                    has_won = cloud_speed >= win_condition_target
                elif win_condition_type == "jumps":
                    has_won = consecutive_jumps >= win_condition_target

                gain_final = 0
                new_solde = 0

                if has_won:
                    # ======= Anti-triche strict =======
                    cheat_detected = False

                    # Limites maximales (exemple)
                    MAX_SCORE = 50000000
                    MAX_SCORE_PER_SEC = 200
                    MAX_CLOUD_SPEED = 10.0
                    MAX_CLOUDS = 50
                    MAX_JUMPS = 10

                    # Vérification
                    if score > MAX_SCORE:
                        cheat_detected = True
                        score = MAX_SCORE
                    if score / max(remaining_time, 1) > MAX_SCORE_PER_SEC:
                        cheat_detected = True
                    if cloud_speed > MAX_CLOUD_SPEED:
                        cheat_detected = True
                        cloud_speed = MAX_CLOUD_SPEED
                    if clouds_avoided > MAX_CLOUDS:
                        cheat_detected = True
                        clouds_avoided = MAX_CLOUDS
                    if consecutive_jumps > MAX_JUMPS:
                        cheat_detected = True
                        consecutive_jumps = MAX_JUMPS

                    gain_final = mise * 2

                    # Si triche détectée → réduire le gain
                    if cheat_detected:
                        gain_final = round(gain_final * 1.5)  # On divise le gain par 2

                    # Mise à jour DB
                    pool = await get_pool()
                    async with pool.acquire() as conn:
                        async with conn.cursor() as cursor:
                            await cursor.execute("SELECT solde FROM solde WHERE user_id=%s", (user_id,))
                            result = await cursor.fetchone()
                            if result:
                                nouveau_solde = float(result[0]) + gain_final
                                await cursor.execute("UPDATE solde SET solde=%s WHERE user_id=%s", (nouveau_solde, user_id))
                            else:
                                nouveau_solde = gain_final
                                await cursor.execute("INSERT INTO solde (user_id, solde) VALUES (%s, %s)", (user_id, gain_final))
                            new_solde = nouveau_solde

                await websocket.send_json({
                    "event": "mindset_result",
                    "success": True,
                    "has_won": has_won,
                    "gain_final": gain_final,
                    "new_solde": new_solde,
                    "cheat_detected": cheat_detected,
                    "message": f"Victoire! +{gain_final} XOF" if has_won else "Défaite"
                })

    except Exception as e:
        await websocket.send_json({"event": "error", "error": str(e)})
    finally:
        user_sessions.pop(websocket, None)


# -----------------------------------
# Systeme de securiter de w-cloud
# -----------------------------------

class SecurityMonitor:
    def __init__(self):
        self.suspicious_sessions = set()
        self.security_logs = []
    
    def validate_heartbeat(self, data):
        """Valide les données de heartbeat"""
        required_fields = ['sessionId', 'timestamp', 'score', 'balance', 'level', 'checksum']
        
        if not all(field in data for field in required_fields):
            return False, "Missing required fields"
        
        # Vérifier le timestamp (pas plus de 2 minutes de différence)
        time_diff = abs(time.time() * 1000 - data['timestamp'])
        if time_diff > 120000:
            return False, "Invalid timestamp"
        
        return True, "Valid"

    def detect_anomalies(self, heartbeat_data):
        """Détecte les anomalies dans les données de jeu"""
        anomalies = []
        
        # Vérifier la progression du score
        if heartbeat_data.get('score', 0) > 25000:  # Score maximum raisonnable
            anomalies.append("SCORE_TOO_HIGH")
        
        # Vérifier la vitesse de progression
        # Implémentez votre propre logique basée sur le temps de session
        
        return anomalies

security_monitor = SecurityMonitor()

@app.route('/game_heartbeat', methods=['POST'])
async def game_heartbeat():
    """Endpoint pour les heartbeats de sécurité"""
    try:
        data = await request.get_json()
        
        # Validation basique
        is_valid, message = security_monitor.validate_heartbeat(data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Détection d'anomalies
        anomalies = security_monitor.detect_anomalies(data)
        if anomalies:
            # Logger l'événement suspect
            security_monitor.security_logs.append({
                'session_id': data['sessionId'],
                'timestamp': datetime.utcnow(),
                'anomalies': anomalies,
                'data': data
            })
            
            return jsonify({
                'status': 'warning',
                'anomalies': anomalies,
                'message': 'Suspicious activity detected'
            }), 200
        
        return jsonify({'status': 'healthy'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/report_security_event', methods=['POST'])
async def report_security_event():
    """Endpoint pour rapporter les événements de sécurité"""
    try:
        event_data = await request.get_json()
        
        # Stocker l'événement de sécurité
        security_monitor.security_logs.append({
            'type': 'CLIENT_SECURITY_EVENT',
            'timestamp': datetime.utcnow(),
            'data': event_data
        })
        
        return jsonify({'status': 'reported'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/security_status', methods=['GET'])
async def security_status():
    """Endpoint pour vérifier le statut de sécurité"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Non connecté'}), 401
    
    return jsonify({
        'security_enabled': True,
        'active_sessions': len(security_monitor.security_logs),
        'suspicious_activities': len(security_monitor.suspicious_sessions)
    })

@app.route('/decrement_w-cloud_lives', methods=['POST'])
async def decrement_W_cloud_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = %s AND user_id = %s
                    FOR UPDATE
                """, ('W-cloud', user_id))
                row = await cur.fetchone()

                if not row:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = row[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings
                    SET vies = vies - 1
                    WHERE product_name = %s AND user_id = %s
                """, ('W-cloud', user_id))

        # Le pool est en autocommit, donc pas besoin de commit explicite
        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/get_w-cloud_lives', methods=['GET'])
async def get_W_cloud_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('W-cloud', user_id)
                )
                row = await cur.fetchone()

        if row:
            return jsonify({
                'lives': row[0],
                'product': 'W-cloud'
            })
        else:
            # Valeur par défaut si aucune entrée n'existe
            return jsonify({
                'lives': 0,
                'product': 'W-cloud',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'W-cloud'
        }), 500

# -----------------------------------
# SYSTEME DE FAPPY BIRD
# -----------------------------------

@app.route('/get_bird_lives', methods=['GET'])
async def get_bird_lives():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('Flappy Jump', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({'error': 'Aucune entrée trouvée'}), 404

                return jsonify({'lives': result[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_bird_lives', methods=['POST'])
async def update_bird_lives():
    """Met à jour les vies de l'utilisateur pour Flappy Jump"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non connecté'}), 401

    data = await request.get_json()
    change = data.get('change', 0)
    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Récupérer les vies actuelles avec verrou
                await cur.execute("""
                    SELECT vies FROM game_settings 
                    WHERE product_name = 'Flappy Jump' AND user_id = %s FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    return jsonify({'error': 'Aucune entrée trouvée pour ce jeu'}), 404

                new_lives = max(0, result[0] + change)

                # Mettre à jour les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = %s 
                    WHERE product_name = 'Flappy Jump' AND user_id = %s
                """, (new_lives, user_id))

                return jsonify({
                    'success': True,
                    'new_lives': new_lives
                })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

active_game_sessions = {}

class BirdSession:
    def __init__(self, user_id, bet_amount):
        self.session_id = secrets.token_hex(16)
        self.user_id = user_id
        self.bet_amount = bet_amount
        self.start_time = datetime.now()
        self.end_time = None
        self.score = 0
        self.objective_completed = False
        self.objective_failed = False
        self.is_active = True
        self.game_data = {
            'bird_position': None,
            'pipes_passed': 0,
            'game_time': 0,
            'difficulty_level': 1
        }
        self.anti_cheat = {
            'last_update': time.time(),
            'update_count': 0,
            'suspicious_activity': False
        }

    def update_game_state(self, score, game_data):
        current_time = time.time()

        if current_time - self.anti_cheat['last_update'] < 0.01:
            self.anti_cheat['suspicious_activity'] = True

        if score > self.score + 10:
            self.anti_cheat['suspicious_activity'] = True

        self.score = score
        self.game_data.update(game_data)
        self.anti_cheat['last_update'] = current_time
        self.anti_cheat['update_count'] += 1

        return not self.anti_cheat['suspicious_activity']

    def complete_objective(self):
        self.objective_completed = True
        self.end_time = datetime.now()
        self.is_active = False

    def fail_objective(self):
        self.objective_failed = True
        self.end_time = datetime.now()
        self.is_active = False

    def end_game(self):
        self.end_time = datetime.now()
        self.is_active = False


def validate_session_access(session_id, user_id):
    if session_id not in active_game_sessions:
        return False, "Session introuvable"

    gs = active_game_sessions[session_id]

    if gs.user_id != user_id:
        return False, "Accès refusé"

    if not gs.is_active:
        return False, "Session terminée"

    if datetime.now() - gs.start_time > timedelta(minutes=30):
        gs.is_active = False
        return False, "Session expirée"

    return True, gs


@app.route('/create_bird_session', methods=['POST'])
async def create_game_session():
    
    user_id = session.get("user_id")
    
    if not user_id:
        return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

    try:
        data = await request.get_json()
    except Exception as e:
        return jsonify({"success": False, "error": "Format JSON invalide"}), 400

    bet_amount = data.get("bet_amount")
    
    if not bet_amount or bet_amount <= 0:
        return jsonify({"success": False, "error": "Mise invalide"}), 400
    
    # Supprimer la session existante si elle existe
    sessions_to_delete = []
    for session_id, gs in list(active_game_sessions.items()):
        if gs.user_id == user_id and gs.is_active:
            sessions_to_delete.append(session_id)
    
    # Supprimer toutes les sessions trouvées
    for session_id in sessions_to_delete:
        del active_game_sessions[session_id]
    
    # Créer la nouvelle session
    gs = BirdSession(user_id, bet_amount)
    active_game_sessions[gs.session_id] = gs

    response_data = {
        "success": True,
        "session_id": gs.session_id,
        "created_at": gs.start_time.isoformat()
    }

    return jsonify(response_data)


@app.route('/update_bird_state', methods=['POST'])
async def update_game_state():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Non connecté"}), 401

    data = await request.get_json()
    session_id = data.get("session_id")

    valid, result = validate_session_access(session_id, user_id)
    if not valid:
        return jsonify({"error": result}), 403

    gs = result
    if not gs.update_game_state(data.get("score", 0), data.get("game_data", {})):
        gs.is_active = False
        return jsonify({"error": "Triche détectée"}), 403

    return jsonify({"success": True, "score": gs.score})


@app.route('/complete_bird', methods=['POST'])
async def complete_objective():
    
    user_id = session.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Non connecté"}), 401

    try:
        data = await request.get_json()
        
        session_id = data.get("session_id")
        
        valid, result = validate_session_access(session_id, user_id)
        
        if not valid:
            return jsonify({"error": result}), 403

        gs = result
        
        gs.complete_objective()
        
        gain = gs.bet_amount * 2

        pool = await get_pool()
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                    (gain, user_id)
                )
                await conn.commit()

        cleanup_bird_sessions()

        response_data = {
            "success": True,
            "gain": gain,
            "final_score": gs.score
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({"error": "Erreur serveur", "details": str(e)}), 500


# ==============================
# CLEANUP CORRIGÉ
# ==============================
def cleanup_bird_sessions():
    now = datetime.now()
    to_delete = []

    for sid, gs in active_game_sessions.items():
        # CORRECTION : Utiliser gs.end_time (attribut de l'objet) au lieu de gs['last_activity']
        if gs.end_time and now - gs.end_time > timedelta(hours=24):
            to_delete.append(sid)

    for sid in to_delete:
        del active_game_sessions[sid]


@app.route('/get_bird', methods=['GET'])
async def get_bird():
    try:
        # Types d'objectifs disponibles
        objectif_types = ['TIME', 'SCORE', 'PIPES']
        
        # Sélection aléatoire du type d'objectif
        type_obj = random.choice(objectif_types)
        
        # Génération de la valeur cible selon le type
        if type_obj == 'TIME':
            # Durée en secondes : entre 10 et 220 secondes (par multiples de 5)
            target_value = random.randint(2, 20) * 5  # 10 à 220 secondes
            description = f"Survivez pendant {target_value} secondes"
            reward = random.randint(20, 100)  # Récompense fixe
            
        elif type_obj == 'SCORE':
            # Score : entre 195 et 267 points (par multiples de 3)
            target_value = random.randint(10, 30) * 3  # 195 à 267 points
            description = f"Atteignez un score de {target_value} points"
            reward = random.randint(30, 120)  # Récompense fixe
            
        else:  # PIPES
            # Nombre de tuyaux : entre 80 et 100 (par multiples de 2)
            target_value = random.randint(20, 50) * 2  # 80 à 100 tuyaux
            description = f"Franchissez {target_value} tuyaux"
            reward = random.randint(25, 110)  # Récompense fixe
        
        # Structure de l'objectif
        objectif = {
            "id": f"obj_{datetime.now().timestamp()}",
            "type": type_obj,
            "targetValue": target_value,
            "description": description,
            "reward": reward
        }
        
        return jsonify(objectif), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500



# -----------------------------------
# SYSTEME DE JEUX DE DASH JUMP 
# -----------------------------------




# --- Décrémenter une vie pour Dash Jump ---
@app.route('/decrement_dash', methods=['POST'])
async def decrement_dash():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Verrouiller la ligne pour éviter des conflits concurrents
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = 'Dash Jump' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    await conn.rollback()
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    await conn.rollback()
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings
                    SET vies = vies - 1
                    WHERE product_name = 'Dash Jump' AND user_id = %s
                """, (user_id,))
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

    except Exception as e:
        async with pool.acquire() as conn:
            await conn.rollback()
        return jsonify({'error': str(e), 'success': False}), 500


# --- Récupérer le nombre de vies pour Dash Jump ---
@app.route('/get_dash', methods=['GET'])
async def get_dash():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = 'Dash Jump' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'lives': result[0],
                'product': 'Dash Jump'
            })
        else:
            return jsonify({
                'lives': 0,
                'product': 'Dash Jump',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({'error': str(e), 'product': 'Dash Jump'}), 500



# -----------------------------------
# SYSTEME DE JEUX DE SNAKE
# -----------------------------------

@app.route('/get_snake_objective', methods=['GET'])
async def get_snake_objective():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401

        mission_types = [
            {
                'id': 'survive',
                'name': 'Survie',
                'icon': '⏱️',
                'objectives': [
                    {'target': 30, 'description': 'Survivez 30 secondes', 'rewardMultiplier': 1.5},
                    {'target': 45, 'description': 'Survivez 45 secondes', 'rewardMultiplier': 2.0},
                    {'target': 60, 'description': 'Survivez 60 secondes', 'rewardMultiplier': 2.5},
                    {'target': 80, 'description': 'Survivez 80 secondes', 'rewardMultiplier': 2.7},
                    {'target': 90, 'description': 'Survivez 90 secondes', 'rewardMultiplier': 2.7},
                    {'target': 100, 'description': 'Survivez 110 secondes', 'rewardMultiplier': 3.0},
                    {'target': 120, 'description': 'Survivez 120 secondes', 'rewardMultiplier': 3.5}
                ]
            },
            {
                'id': 'score',
                'name': 'Score',
                'icon': '⭐',
                'objectives': [
                    {'target': 20, 'description': 'Atteignez 10 points', 'rewardMultiplier': 1.5},
                    {'target': 35, 'description': 'Atteignez 35 points', 'rewardMultiplier': 1.7},
                    {'target': 45, 'description': 'Atteignez 45 points', 'rewardMultiplier': 1.9},
                    {'target': 60, 'description': 'Atteignez 60 points', 'rewardMultiplier': 2.0},
                    {'target': 75, 'description': 'Atteignez 75 points', 'rewardMultiplier': 2.5},
                    {'target': 90, 'description': 'Atteignez 90 points', 'rewardMultiplier': 2.7},
                    {'target': 120, 'description': 'Atteignez 120 points', 'rewardMultiplier': 2.7},
                    {'target': 130, 'description': 'Atteignez 130 points', 'rewardMultiplier': 2.9},
                    {'target': 150, 'description': 'Atteignez 150 points', 'rewardMultiplier': 3.0}
                ]
            },
            {
                'id': 'speed',
                'name': 'Vitesse',
                'icon': '⚡',
                'objectives': [
                    {'target': {'score': 10, 'time': 15}, 'description': '10 points en 15 secondes', 'rewardMultiplier': 1.5},
                    {'target': {'score': 20, 'time': 25}, 'description': '20 points en 25 secondes', 'rewardMultiplier': 1.7},
                    {'target': {'score': 30, 'time': 35}, 'description': '30 points en 35 secondes', 'rewardMultiplier': 1.7},
                    {'target': {'score': 40, 'time': 40}, 'description': '40 points en 40 secondes', 'rewardMultiplier': 2.0},
                    {'target': {'score': 50, 'time': 45}, 'description': '50 points en 45 secondes', 'rewardMultiplier': 2.5},
                    {'target': {'score': 70, 'time': 50}, 'description': '70 points en 50 secondes', 'rewardMultiplier': 2.7},
                    {'target': {'score': 90, 'time': 60}, 'description': '90 points en 60 secondes', 'rewardMultiplier': 2.7},
                    {'target': {'score': 100, 'time': 65}, 'description': '100 points en 65 secondes', 'rewardMultiplier': 3.0}
                ]
            }
        ]

        # Sélection aléatoire du type de mission et de l'objectif
        import random
        mission_type = random.choice(mission_types)
        objective = random.choice(mission_type['objectives'])
        
        # Construction de la réponse
        mission_data = {
            'type': mission_type['id'],
            'name': mission_type['name'],
            'icon': mission_type['icon'],
            'objective': objective['target'],
            'description': objective['description'],
            'rewardMultiplier': objective['rewardMultiplier'],
            'timeLimit': mission_type['id'] == 'speed' and objective['target']['time'] + 10 or 60
        }

        return jsonify(mission_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/start_snake_session', methods=['POST'])
async def start_snake_session():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401
        
        data = await request.get_json()
        bet = data.get('bet')
        mission_data = data.get('mission')
        
        if not bet or not mission_data:
            return jsonify({'error': 'Données de jeu manquantes'}), 400
        
        # Générer un ID de session unique pour ce jeu
        import uuid
        session_id = str(uuid.uuid4())
        
        # Stocker les données de jeu dans la session Flask
        game_data = {
            'session_id': session_id,
            'user_id': user_id,
            'bet': float(bet),
            'mission': mission_data,
            'start_time': datetime.now().isoformat(),
            'score': 0,
            'mission_completed': False,
            'mission_failed': False,
            'time_elapsed': 0
        }
        
        # Stocker dans la session Flask
        session['current_game'] = game_data
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Session de jeu démarrée'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_snake_session', methods=['POST'])
async def update_snake_session():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401
        
        data = await request.get_json()
        score = data.get('score', 0)
        time_elapsed = data.get('time_elapsed', 0)
        game_state = data.get('game_state', 'playing')  # playing, completed, failed
        
        # Récupérer les données de jeu depuis la session
        game_data = session.get('current_game')
        if not game_data:
            return jsonify({'error': 'Aucune session de jeu active'}), 400
        
        # Vérifier que c'est bien la session de l'utilisateur
        if game_data.get('user_id') != user_id:
            return jsonify({'error': 'Session de jeu invalide'}), 403
        
        # Mettre à jour les données
        game_data['score'] = score
        game_data['time_elapsed'] = time_elapsed
        
        if game_state == 'completed':
            game_data['mission_completed'] = True
        elif game_state == 'failed':
            game_data['mission_failed'] = True
        
        # Sauvegarder dans la session
        session['current_game'] = game_data
        
        return jsonify({
            'success': True,
            'message': 'Session mise à jour'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/verify_snake_completion', methods=['POST'])
async def verify_snake_completion():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401
        
        data = await request.get_json()
        final_score = data.get('final_score', 0)
        final_time = data.get('final_time', 0)
        
        # Récupérer les données de jeu depuis la session
        game_data = session.get('current_game')
        if not game_data:
            return jsonify({'error': 'Aucune session de jeu active'}), 400
        
        # Vérifier que c'est bien la session de l'utilisateur
        if game_data.get('user_id') != user_id:
            return jsonify({'error': 'Session de jeu invalide'}), 403
        
        mission = game_data.get('mission', {})
        bet = game_data.get('bet', 0)
        
        # Vérifier la mission
        mission_type = mission.get('type')
        mission_objective = mission.get('objective')
        reward_multiplier = mission.get('rewardMultiplier', 1)
        
        mission_completed = False
        reward = 0
        
        if mission_type == 'survive':
            if final_time >= mission_objective:
                mission_completed = True
                reward = calcul_gainss(final_time * 100, bet)  # Convertir le temps en score équivalent
                
        elif mission_type == 'score':
            if final_score >= mission_objective:
                mission_completed = True
                reward = calcul_gainss(final_score, bet)
                
        elif mission_type == 'speed':
            if (final_score >= mission_objective.get('score', 0) and 
                final_time <= mission_objective.get('time', 0)):
                mission_completed = True
                reward = calcul_gainss(final_score, bet)
        
        # Mettre à jour l'état final dans la session
        game_data['final_score'] = final_score
        game_data['final_time'] = final_time
        game_data['mission_completed'] = mission_completed
        game_data['calculated_reward'] = reward
        
        # Si la mission est réussie, créditer le solde
        if mission_completed:
            pool = await get_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    # Récupérer le solde actuel
                    await cursor.execute(
                        "SELECT solde FROM solde WHERE user_id=%s LIMIT 1",
                        (user_id,)
                    )
                    solde_row = await cursor.fetchone()
                    
                    if solde_row:
                        solde_actuel = float(solde_row[0])
                        nouveau_solde = solde_actuel + reward
                        
                        # Mettre à jour le solde
                        await cursor.execute(
                            "UPDATE solde SET solde=%s WHERE user_id=%s",
                            (nouveau_solde, user_id)
                        )
                        
                        # Enregistrer dans l'historique des gains
                        
                        await conn.commit()
        
        session['current_game'] = game_data
        
        return jsonify({
            'success': True,
            'mission_completed': mission_completed,
            'reward': reward,
            'verification_data': {
                'type': mission_type,
                'objective': mission_objective,
                'achieved_score': final_score,
                'achieved_time': final_time
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/end_snake_session', methods=['POST'])
async def end_snake_session():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Non connecté'}), 401
        
        # Récupérer les données finales
        game_data = session.get('current_game')
        if not game_data:
            return jsonify({'error': 'Aucune session de jeu active'}), 400
        
        # Vérifier que c'est bien la session de l'utilisateur
        if game_data.get('user_id') != user_id:
            return jsonify({'error': 'Session de jeu invalide'}), 403
        
        # Récupérer les infos finales pour la réponse
        mission_completed = game_data.get('mission_completed', False)
        reward = game_data.get('calculated_reward', 0) if mission_completed else 0
        
        # Nettoyer la session
        session.pop('current_game', None)
        
        return jsonify({
            'success': True,
            'message': 'Session terminée',
            'mission_completed': mission_completed,
            'reward': reward
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calcul_gainss(score: float, mise: float) -> int:
    """Le gain est simplement le double de la mise"""
    gain_final = mise * 2
    return int(round(gain_final, 0))


# -----------------------------------
# SYSTEME DE JEUX DE TROPI TWIST
# -----------------------------------

@app.route('/generate_tropi_objectif', methods=['POST'])
async def generate_tropi_objectif():
    """
    Route dédiée uniquement à la génération d'objectifs.
    Ne gère PAS les mises, seulement la génération d'objectifs.
    """
    try:
        # 1️⃣ Vérification utilisateur connecté
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        # 2️⃣ Récupération de la mise depuis la requête
        data = await request.get_json()
        bet_amount = data.get("bet_amount")
        
        if not bet_amount:
            return jsonify({
                "success": False,
                "error": "Mise manquante pour générer l'objectif"
            }), 400

        try:
            bet_amount = float(bet_amount)
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Mise invalide"
            }), 400

        # 3️⃣ Définition des constantes (identique au JS)
        OBJECTIF_TYPES = {
            "SCORE": 1,
            "TIME_SCORE": 2
        }

        DIFFICULTY_LEVELS = {
            "EASY": {"multiplier": 1, "timeMultiplier": 1.5, "bonus": 1.2},
            "MEDIUM": {"multiplier": 1.5, "timeMultiplier": 1.2, "bonus": 1.5},
            "HARD": {"multiplier": 2, "timeMultiplier": 1, "bonus": 2}
        }

        # 4️⃣ Détermination de la difficulté
        if bet_amount < 500:
            difficulty = "EASY"
            difficulty_config = DIFFICULTY_LEVELS["EASY"]
        elif bet_amount < 1000:
            difficulty = "MEDIUM"
            difficulty_config = DIFFICULTY_LEVELS["MEDIUM"]
        else:
            difficulty = "HARD"
            difficulty_config = DIFFICULTY_LEVELS["HARD"]

        # 5️⃣ Sélection aléatoire du type d'objectif
        import random
        type_keys = list(OBJECTIF_TYPES.keys())
        selected_type_key = random.choice(type_keys)
        selected_type = OBJECTIF_TYPES[selected_type_key]

        # 6️⃣ Calcul du score cible
        base_score = int(bet_amount * 2 * difficulty_config["multiplier"])
        target_score = int(base_score * (1 + random.random() * 0.5))

        # 7️⃣ Construction de l'objectif selon le type
        objectif = {
            "type": selected_type,
            "type_name": selected_type_key,
            "target_score": target_score,
            "difficulty": difficulty,
            "difficulty_config": difficulty_config
        }

        if selected_type == OBJECTIF_TYPES["SCORE"]:
            objectif["description"] = f"Atteignez un score de {target_score} points"
            objectif["time_limit"] = None
            objectif["time_limit_display"] = None
        else:  # TIME_SCORE
            time_limit = int(60 + (target_score / 100) * 30 * difficulty_config["timeMultiplier"])
            objectif["description"] = f"Atteignez {target_score} points en {time_limit} secondes"
            objectif["time_limit"] = time_limit
            objectif["time_limit_display"] = f"{time_limit}s"

        # 8️⃣ Réponse avec l'objectif généré
        return jsonify({
            "success": True,
            "objectif": objectif,
            "bet_amount": bet_amount,
            "generated_at": datetime.now().isoformat()
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erreur lors de la génération de l'objectif: {str(e)}"
        }), 500



# Routes pour la sécurité de session de jeu

@app.route('/start_tropi_session', methods=['POST'])
async def start_tropi_session():
    """
    Démarre une session de jeu sécurisée
    Stocke toutes les infos nécessaires dans la session Flask
    """
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        data = await request.get_json()
        bet_amount = data.get("bet_amount")
        objectif_data = data.get("objectif")
        
        if not bet_amount or not objectif_data:
            return jsonify({
                "success": False,
                "error": "Données manquantes"
            }), 400

        # CORRECTION: Normaliser les clés de l'objectif
        # S'assurer que targetScore existe
        if 'targetScore' not in objectif_data and 'target_score' in objectif_data:
            objectif_data['targetScore'] = objectif_data['target_score']
        
        # Stocker les infos de la partie dans la session
        session['game_session'] = {
            'user_id': user_id,
            'bet_amount': float(bet_amount),
            'objectif': objectif_data,
            'start_time': datetime.now().isoformat(),
            'score': 0,
            'elapsed_time': 0,
            'combinations': 0,
            'is_active': True,
            'objectif_completed': False,
            'objectif_time_left': objectif_data.get('timeLimit') or objectif_data.get('time_limit'),
            'session_id': str(random.randint(100000, 999999)) + str(int(datetime.now().timestamp()))
        }

        return jsonify({
            "success": True,
            "message": "Session de jeu démarrée",
            "session_id": session['game_session']['session_id']
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erreur lors du démarrage de la session: {str(e)}"
        }), 500

@app.route('/update_tropi_score', methods=['POST'])
async def update_tropi_score():
    """
    Met à jour le score pendant la partie
    """
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        if 'game_session' not in session:
            return jsonify({
                "success": False,
                "error": "Aucune session de jeu active"
            }), 400

        game_session = session['game_session']
        
        # Vérifier que l'utilisateur correspond
        if game_session['user_id'] != user_id:
            return jsonify({
                "success": False,
                "error": "Session utilisateur non correspondante"
            }), 403

        data = await request.get_json()
        new_score = data.get("score")
        elapsed_time = data.get("elapsed_time")
        combinations = data.get("combinations")
        
        if new_score is None:
            return jsonify({
                "success": False,
                "error": "Score manquant"
            }), 400

        # Mettre à jour les informations
        game_session['score'] = int(new_score)
        if elapsed_time is not None:
            game_session['elapsed_time'] = int(elapsed_time)
        if combinations is not None:
            game_session['combinations'] = int(combinations)
        
        # Vérifier si l'objectif est atteint
        # CORRECTION: Utiliser 'targetScore' au lieu de 'target_score'
        objectif_target = game_session['objectif'].get('targetScore')
        
        # Vérification de sécurité
        if objectif_target is None:
            # Si 'targetScore' n'existe pas, essayer 'target_score' comme fallback
            objectif_target = game_session['objectif'].get('target_score')
        
        # Vérifier que objectif_target n'est pas None
        if objectif_target is not None and new_score >= objectif_target:
            game_session['objectif_completed'] = True
        else:
            game_session['objectif_completed'] = False
        
        # Sauvegarder la session
        session['game_session'] = game_session
        
        return jsonify({
            "success": True,
            "message": "Score mis à jour",
            "current_score": game_session['score'],
            "objectif_completed": game_session['objectif_completed']
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erreur lors de la mise à jour du score: {str(e)}"
        }), 500
    
def calcul_tropi_gains(score: float, mise: float) -> int:
    """Le gain est simplement le double de la mise"""
    gain_final = mise * 2
    return int(round(gain_final, 0))

@app.route('/verify_tropi_completion', methods=['POST'])
async def verify_tropi_completion():
    """
    Vérifie la complétion de l'objectif côté backend
    et calcule les gains selon l'échelle fournie
    """
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        if 'game_session' not in session:
            return jsonify({
                "success": False,
                "error": "Aucune session de jeu active"
            }), 400

        game_session = session['game_session']
        
        # Vérifier que l'utilisateur correspond
        if game_session['user_id'] != user_id:
            return jsonify({
                "success": False,
                "error": "Session utilisateur non correspondante"
            }), 403

        data = await request.get_json()
        final_score = data.get("final_score")
        final_time = data.get("elapsed_time")
        
        if final_score is None:
            return jsonify({
                "success": False,
                "error": "Score final manquant"
            }), 400

        # CORRECTION: Récupérer les données de l'objectif avec fallback
        objectif_target = game_session['objectif'].get('targetScore')
        if objectif_target is None:
            objectif_target = game_session['objectif'].get('target_score')
        
        objectif_time_limit = game_session['objectif'].get('timeLimit')
        if objectif_time_limit is None:
            objectif_time_limit = game_session['objectif'].get('time_limit')
        
        bet_amount = game_session['bet_amount']
        
        # Vérifier que les valeurs ne sont pas None avant de comparer
        if objectif_target is None:
            return jsonify({
                "success": False,
                "error": "Objectif target non défini"
            }), 400
        
        # Vérifier si l'objectif est atteint
        success = final_score >= objectif_target
        
        # Vérifier le temps si c'est un objectif TIME_SCORE
        time_valid = True
        if objectif_time_limit is not None and final_time is not None:
            time_valid = final_time <= objectif_time_limit
        
        # Calculer le gain selon l'échelle fournie
        if success:
            if objectif_time_limit is not None and not time_valid:
                # Objectif score atteint mais temps dépassé
                # On applique un malus de 50% sur les gains calculés
                base_gain = calcul_tropi_gains(final_score, bet_amount)
                gain = int(base_gain * 0.5)  # 50% de malus
            else:
                # Objectif complètement réussi
                gain = int(calcul_tropi_gains(final_score, bet_amount))
        else:
            gain = 0
        
        # Récupération du pool pour mettre à jour le solde si succès
        if success and gain > 0:
            try:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cursor:
                        # Récupérer le solde actuel
                        await cursor.execute(
                            "SELECT solde FROM solde WHERE user_id=%s LIMIT 1",
                            (user_id,)
                        )
                        solde_row = await cursor.fetchone()
                        
                        if solde_row:
                            solde_avant = float(solde_row[0])
                            solde_apres = solde_avant + gain
                            
                            # Mettre à jour le solde
                            await cursor.execute(
                                "UPDATE solde SET solde=%s WHERE user_id=%s",
                                (solde_apres, user_id)
                            )
                            
                            await conn.commit()
            except Exception as db_error:
                print(f"Erreur lors de la mise à jour du solde: {db_error}")
                # On continue même si l'update du solde échue
        
        # Nettoyer la session de jeu
        session.pop('game_session', None)
        
        return jsonify({
            "success": True,
            "objectif_completed": success,
            "time_valid": time_valid,
            "target_score": objectif_target,
            "final_score": final_score,
            "gain": gain,
            "message": "Objectif vérifié avec succès"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erreur lors de la vérification: {str(e)}"
        }), 500

@app.route('/get_tropi_session', methods=['GET'])
async def get_tropi_session():
    """
    Récupère les informations de la session de jeu en cours
    """
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        if 'game_session' not in session:
            return jsonify({
                "success": False,
                "error": "Aucune session de jeu active"
            }), 404

        game_session = session['game_session']
        
        # Vérifier que l'utilisateur correspond
        if game_session['user_id'] != user_id:
            return jsonify({
                "success": False,
                "error": "Session utilisateur non correspondante"
            }), 403

        return jsonify({
            "success": True,
            "game_session": game_session
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erreur lors de la récupération: {str(e)}"
        }), 500

@app.route('/end_tropi_session', methods=['POST'])
async def end_tropi_session():
    """
    Termine proprement une session de jeu
    """
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        if 'game_session' in session:
            session.pop('game_session', None)
        
        return jsonify({
            "success": True,
            "message": "Session de jeu terminée"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erreur lors de la fin de session: {str(e)}"
        }), 500




@app.route('/get_tropi_lifes', methods=['GET'])
async def get_tropi_lifes():
    """Récupère le nombre de vies pour Tropi Twist"""
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401
    
    user_id = session['user_id']
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Tropi Twist' AND user_id = %s
                """, (user_id,))
                row = await cur.fetchone()
                
                if row:
                    return jsonify({
                        'lives': row[0],
                        'product': 'Tropi Twist'
                    })
                else:
                    return jsonify({'error': 'Aucun jeu trouvé pour cet utilisateur'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/use_tropi_life', methods=['POST'])
async def use_tropi_life():
    """Décrémente une vie pour Tropi Twist"""
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401
    
    user_id = session['user_id']
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Verrou pour éviter les conflits sur les vies
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Tropi Twist' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                row = await cur.fetchone()
                
                if not row or row[0] <= 0:
                    return jsonify({'error': 'Plus de vies disponibles'}), 400
                
                remaining_lives = row[0] - 1
                
                # Décrémenter la vie
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = %s
                    WHERE product_name = 'Tropi Twist' AND user_id = %s
                """, (remaining_lives, user_id))
                
                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives
                })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -----------------------------------------
# SYSTEME DE JEUX DE XO CLASH - LOGIQUE IA
# ------------------------------------------

# Dictionnaire pour stocker les sessions de jeu actives
active_game_sessions = {}
# Dictionnaire pour les verrous de sessions
session_locks = {}
# Dictionnaire pour stocker les nonces utilisés (prévention replay)
used_nonces = set()

# Fonctions de base pour le jeu - REPRODUCTION EXACTE DU JAVASCRIPT
def get_empty_cells(board):
    """Reproduction EXACTE de xGetEmptyCells()"""
    return [index for index, cell in enumerate(board) if cell == '']

def check_winner_for_player(board, player):
    """Reproduction EXACTE de xCheckWinnerForPlayer()"""
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    
    for combination in winning_combinations:
        if all(board[index] == player for index in combination):
            return True
    return False

def get_winning_combination(board):
    """Reproduction EXACTE de xGetWinningCombination()"""
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    
    for combination in winning_combinations:
        a, b, c = combination
        if board[a] and board[a] == board[b] and board[a] == board[c]:
            return combination
    return None

def is_board_full(board):
    """Reproduction EXACTE de xIsBoardFull()"""
    return all(cell != '' for cell in board)

# CORRECTION ICI : Fonction calcul de gains modifiée
def calculate_prize_for_session(session_data):
    """Calcul des gains basé sur les données de session"""
    result = session_data.get('result', 'draw')
    bet_amount = session_data.get('bet_amount', 0)
    difficulty = session_data.get('difficulty', 'medium')
    
    if result == 'player':
        if difficulty == 'hard':
            return int(bet_amount * 2.0)  # Gain 2x sur difficulté hard
        else:  # medium
            return int(bet_amount * 1.5)  # Gain 1.5x sur medium
    elif result == 'computer':
        return 0  # Pas de gain si l'IA gagne
    elif result == 'draw':
        return bet_amount  # Remboursement
    return 0

# Classe IA avec TOUTE la logique de l'ancien JavaScript
class GameAI:
    def __init__(self):
        self.difficulty = 'medium'
        
    def set_difficulty(self, difficulty):
        self.difficulty = difficulty
    
    def random_move(self, board):
        """Reproduction EXACTE de xRandomMove()"""
        available_moves = get_empty_cells(board)
        if available_moves:
            return random.choice(available_moves)
        return None
    
    def advanced_ai(self, board, player):
        """Reproduction EXACTE de xAdvancedAI() - algorithme MinMax"""
        available_moves = get_empty_cells(board)
        
        # Évaluation terminale
        if check_winner_for_player(board, 'O'):
            return {'score': 10}
        if check_winner_for_player(board, 'X'):
            return {'score': -10}
        if not available_moves:
            return {'score': 0}
        
        moves = []
        
        for move_index in available_moves:
            move = {'index': move_index}
            
            # Faire le mouvement
            board[move_index] = player
            
            # Récursivité
            if player == 'O':
                result = self.advanced_ai(board, 'X')
                move['score'] = result['score']
            else:
                result = self.advanced_ai(board, 'O')
                move['score'] = result['score']
            
            # Annuler le mouvement
            board[move_index] = ''
            moves.append(move)
        
        # Choisir le meilleur mouvement
        if player == 'O':
            best_score = -float('inf')
            best_move_index = 0
            for i, move in enumerate(moves):
                if move['score'] > best_score:
                    best_score = move['score']
                    best_move_index = i
        else:
            best_score = float('inf')
            best_move_index = 0
            for i, move in enumerate(moves):
                if move['score'] < best_score:
                    best_score = move['score']
                    best_move_index = i
        
        return moves[best_move_index]
    
    def computer_move(self, board):
        """Reproduction EXACTE de xComputerMove()"""
        if self.difficulty == 'medium':
            # 50% chance de mouvement aléatoire, 50% chance d'IA avancée
            if random.random() < 0.5:
                return self.random_move(board)
            else:
                return self.advanced_ai(board, 'O')['index']
        elif self.difficulty == 'hard':
            return self.advanced_ai(board, 'O')['index']
        else:
            return self.advanced_ai(board, 'O')['index']
    
    def check_game_state(self, board, current_player):
        """Vérifier l'état COMPLET du jeu avec TOUTE la logique"""
        # Vérifier les gagnants
        x_wins = check_winner_for_player(board, 'X')
        o_wins = check_winner_for_player(board, 'O')
        
        # Vérifier si le plateau est plein
        draw = is_board_full(board)
        
        # Obtenir la combinaison gagnante
        winning_line = get_winning_combination(board)
        
        # Déterminer le résultat
        game_result = 'ongoing'
        if x_wins:
            game_result = 'player'
        elif o_wins:
            game_result = 'computer'
        elif draw:
            game_result = 'draw'
        
        return {
            'game_result': game_result,
            'x_wins': x_wins,
            'o_wins': o_wins,
            'draw': draw,
            'winning_line': winning_line,
            'empty_cells': get_empty_cells(board),
            'current_player': current_player
        }

# Instance globale de l'IA
game_ai = GameAI()

# NOUVEAU : Fonction de validation anti-replay
def validate_nonce(nonce, user_id, timestamp=None, max_age=300):
    """Valider un nonce pour éviter les attaques par rejeu"""
    # Vérifier que le nonce n'a pas déjà été utilisé
    nonce_key = f"{user_id}:{nonce}"
    if nonce_key in used_nonces:
        return False, "Nonce déjà utilisé"
    
    # Vérifier le timestamp si fourni
    if timestamp:
        current_time = int(time.time())
        if abs(current_time - timestamp) > max_age:
            return False, "Timestamp expiré"
    
    # Marquer le nonce comme utilisé
    used_nonces.add(nonce_key)
    
    # Nettoyer les anciens nonces (plus vieux que 1 heure)
    cleanup_old_nonces()
    
    return True, "Nonce valide"

def cleanup_old_nonces():
    """Nettoyer les anciens nonces (simplifié - en production utiliser Redis avec TTL)"""
    global used_nonces
    # Pour simplifier, on limite la taille du set
    if len(used_nonces) > 10000:
        # Garder seulement les 5000 plus récents
        used_nonces = set(list(used_nonces)[-5000:])

def generate_nonce():
    """Générer un nonce unique"""
    return hashlib.sha256(f"{random.getrandbits(256)}:{time.time()}".encode()).hexdigest()[:32]

# NOUVEAU : Gestionnaire de verrous pour sessions
@asynccontextmanager
async def session_lock(session_id, timeout=5):
    """Verrou asynchrone pour une session"""
    if session_id not in session_locks:
        session_locks[session_id] = asyncio.Lock()
    
    lock = session_locks[session_id]
    
    try:
        # Acquérir le verrou avec timeout
        await asyncio.wait_for(lock.acquire(), timeout=timeout)
        yield
    except asyncio.TimeoutError:
        raise Exception(f"Timeout sur le verrou de session {session_id}")
    finally:
        if lock.locked():
            lock.release()
            # Nettoyer les verrous inutilisés
            if session_id in session_locks:
                del session_locks[session_id]

# Fonctions de gestion des sessions
def generate_game_session_id(user_id, bet_amount):
    """Générer un ID de session de jeu unique avec timestamp"""
    timestamp = int(time.time())
    unique_string = f"{user_id}_{bet_amount}_{timestamp}_{random.randint(1000, 9999)}"
    session_hash = hashlib.sha256(unique_string.encode()).hexdigest()[:16]
    return f"game_{session_hash}"

def create_game_session(user_id, bet_amount, difficulty):
    """Créer une nouvelle session de jeu avec nonce initial"""
    session_id = generate_game_session_id(user_id, bet_amount)
    
    # Générer un nonce initial pour la session
    initial_nonce = generate_nonce()
    
    game_session = {
        'session_id': session_id,
        'user_id': user_id,
        'bet_amount': bet_amount,
        'difficulty': difficulty,
        'board': [''] * 9,
        'current_player': 'X',
        'game_over': False,
        'created_at': datetime.now(),
        'last_activity': datetime.now(),
        'moves_history': [],
        'initial_nonce': initial_nonce,
        'last_nonce': initial_nonce,
        'ws_connection': None,
        'result': None,
        'prize': 0
    }
    
    active_game_sessions[session_id] = game_session
    return session_id

def get_game_session(session_id):
    """Récupérer une session de jeu"""
    if session_id in active_game_sessions:
        active_game_sessions[session_id]['last_activity'] = datetime.now()
        return active_game_sessions[session_id]
    return None

def update_game_session(session_id, board, current_player, game_over=False, move=None, result=None, prize=None):
    """Mettre à jour une session de jeu"""
    if session_id in active_game_sessions:
        session_data = active_game_sessions[session_id]
        session_data['board'] = board.copy()
        session_data['current_player'] = current_player
        session_data['game_over'] = game_over
        session_data['last_activity'] = datetime.now()
        
        if result is not None:
            session_data['result'] = result
            # CORRECTION ICI : Calcul du prix basé sur les données session
            session_data['prize'] = calculate_prize_for_session(session_data)
        
        if move is not None:
            session_data['moves_history'].append({
                'player': current_player,
                'move': move,
                'timestamp': datetime.now().isoformat()
            })
        
        return True
    return False

def cleanup_old_sessions():
    """Nettoyer les anciennes sessions"""
    now = datetime.now()
    sessions_to_remove = []
    
    for session_id, session_data in active_game_sessions.items():
        if (now - session_data['last_activity']) > timedelta(hours=1):
            sessions_to_remove.append(session_id)
    
    for session_id in sessions_to_remove:
        del active_game_sessions[session_id]
        # Nettoyer aussi le verrou si existe
        if session_id in session_locks:
            del session_locks[session_id]



async def update_user_solde(user_id, amount_change):
    """Mettre à jour le solde d'un utilisateur"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT solde FROM solde WHERE user_id = %s", (user_id,))
                result = await cur.fetchone()
                
                if not result:
                    return None
                
                current_solde = result[0]
                new_solde = current_solde + amount_change
                
                await cur.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id)
                )
                
                await conn.commit()
                return new_solde
                
    except Exception as e:
        return None

def validate_game_session(session_id, expected_user_id, require_nonce=False, nonce=None):
    """Valider une session de jeu avec option anti-replay"""
    session_data = get_game_session(session_id)
    
    if not session_data:
        return False, "Session de jeu introuvable"
    
    if session_data['user_id'] != expected_user_id:
        return False, "Session de jeu non autorisée"
    
    if session_data['game_over']:
        return False, "La partie est déjà terminée"
    
    if (datetime.now() - session_data['created_at']) > timedelta(hours=2):
        return False, "Session de jeu expirée"
    
    # NOUVEAU : Validation anti-replay
    if require_nonce and nonce:
        if nonce == session_data.get('last_nonce'):
            return False, "Nonce réutilisé"
        
        # Mettre à jour le dernier nonce
        session_data['last_nonce'] = nonce
    
    return True, session_data

# NOUVEAU : Fonction wrapper pour messages WebSocket
async def handle_websocket_message(websocket, data, user_id):
    """Gestionnaire principal pour messages WebSocket avec sécurité"""
    try:
        message_type = data.get('type')
        
        # NOUVEAU : Vérification de base des messages
        if not message_type:
            return {'type': 'error', 'message': 'Type de message manquant'}
        
        # NOUVEAU : Validation du timestamp et nonce pour les messages critiques
        if message_type in ['player_move', 'get_ai_move', 'game_result']:
            nonce = data.get('nonce')
            timestamp = data.get('timestamp')
            
            if not nonce or not timestamp:
                return {'type': 'error', 'message': 'Nonce ou timestamp manquant'}
            
            # Valider le nonce et timestamp
            valid, msg = validate_nonce(nonce, user_id, timestamp)
            if not valid:
                return {'type': 'error', 'message': msg}
        
        # NOUVEAU : Vérification du timestamp (pas trop vieux)
        if 'timestamp' in data:
            current_time = int(time.time())
            message_time = data.get('timestamp', 0)
            
            # Rejeter les messages de plus de 5 minutes
            if abs(current_time - message_time) > 300:
                return {'type': 'error', 'message': 'Message trop vieux'}
        
        # Routeur de messages
        if message_type == 'create_session':
            return await handle_create_session(data, user_id)
        
        elif message_type == 'set_difficulty':
            return await handle_set_difficulty(data, user_id)
        
        elif message_type == 'player_move':
            return await handle_player_move(data, user_id)
        
        elif message_type == 'get_ai_move':
            return await handle_get_ai_move(data, user_id)
        
        elif message_type == 'calculate_prize':
            return await handle_calculate_prize(data, user_id)
        
        elif message_type == 'game_result':
            return await handle_game_result(data, user_id)
        
        elif message_type == 'get_session_status':
            return await handle_get_session_status(data, user_id)
        
        elif message_type == 'cancel_session':
            return await handle_cancel_session(data, user_id)
        
        else:
            return {'type': 'error', 'message': f'Type de message inconnu: {message_type}'}
            
    except Exception as e:
        return {'type': 'error', 'message': f'Erreur interne: {str(e)}'}

# NOUVEAU : Handlers spécifiques avec verrous
async def handle_create_session(data, user_id):
    """Créer une nouvelle session de jeu"""
    bet_amount = data.get('bet', 0)
    difficulty = data.get('difficulty', 'medium')
    
    if bet_amount <= 0:
        return {'type': 'error', 'message': 'Mise invalide'}
    
    session_id = create_game_session(user_id, bet_amount, difficulty)
    game_ai.set_difficulty(difficulty)
    
    return {
        'type': 'session_created',
        'session_id': session_id,
        'difficulty': difficulty,
        'bet': bet_amount,
        'nonce': generate_nonce()  # NOUVEAU : Retourner un nonce
    }

async def handle_set_difficulty(data, user_id):
    """Définir la difficulté pour la session"""
    session_id = data.get('session_id')
    difficulty = data.get('difficulty', 'medium')
    
    async with session_lock(session_id):
        valid, result = validate_game_session(session_id, user_id)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        session_data['difficulty'] = difficulty
        game_ai.set_difficulty(difficulty)
        
        return {
            'type': 'difficulty_set',
            'difficulty': difficulty,
            'session_id': session_id
        }

async def handle_player_move(data, user_id):
    """Traiter le mouvement du joueur avec verrou"""
    session_id = data.get('session_id')
    move = data.get('move')
    
    async with session_lock(session_id):
        # NOUVEAU : Validation anti-replay supplémentaire
        nonce = data.get('nonce')
        valid, result = validate_game_session(session_id, user_id, require_nonce=True, nonce=nonce)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        board = session_data.get('board', [''] * 9)
        current_player = session_data.get('current_player', 'X')
        
        if current_player != 'X':
            return {'type': 'error', 'message': "Ce n'est pas votre tour"}
        
        if move < 0 or move >= 9 or board[move] != '':
            return {'type': 'error', 'message': 'Mouvement invalide'}
        
        # Enregistrer le mouvement du joueur
        board[move] = 'X'
        update_game_session(session_id, board, 'O', move=move)
        
        # Vérifier l'état du jeu
        game_state = game_ai.check_game_state(board, 'O')
        
        response = {
            'type': 'move_processed',
            'move': move,
            'player': 'X',
            'session_id': session_id,
            'board': board,
            'game_state': game_state,
            'nonce': generate_nonce()  # NOUVEAU : Nouveau nonce pour la réponse
        }
        
        # Si le jeu continue, mouvement de l'IA
        if game_state['game_result'] == 'ongoing':
            ai_move = game_ai.computer_move(board.copy())
            if ai_move is not None:
                board[ai_move] = 'O'
                update_game_session(session_id, board, 'X', move=ai_move)
                
                ai_game_state = game_ai.check_game_state(board, 'X')
                
                response['ai_move'] = ai_move
                response['board'] = board
                response['game_state'] = ai_game_state
                response['nonce'] = generate_nonce()  # NOUVEAU : Nouveau nonce
        
        return response

async def handle_get_ai_move(data, user_id):
    """Obtenir uniquement le mouvement de l'IA"""
    session_id = data.get('session_id')
    
    async with session_lock(session_id):
        valid, result = validate_game_session(session_id, user_id)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        board = session_data.get('board', [''] * 9)
        current_player = session_data.get('current_player', 'O')
        difficulty = session_data.get('difficulty', 'medium')
        
        if current_player != 'O':
            return {'type': 'error', 'message': "Ce n'est pas le tour de l'IA"}
        
        game_ai.set_difficulty(difficulty)
        move = game_ai.computer_move(board.copy())
        
        if move is not None:
            board[move] = 'O'
            update_game_session(session_id, board, 'X', move=move)
            
            game_state = game_ai.check_game_state(board, 'X')
            
            return {
                'type': 'ai_move',
                'move': move,
                'player': 'O',
                'difficulty': difficulty,
                'session_id': session_id,
                'board': board,
                'game_state': game_state,
                'nonce': generate_nonce()  # NOUVEAU : Nonce pour la réponse
            }
        else:
            return {'type': 'error', 'message': 'Aucun mouvement possible'}

async def handle_calculate_prize(data, user_id):
    """Calculer le prix selon le résultat et la difficulté"""
    result = data.get('result')
    bet = data.get('bet', 0)
    difficulty = data.get('difficulty', 'medium')
    
    # Simulation du calcul - en réalité utilise les données session
    if result == 'player':
        if difficulty == 'hard':
            prize = int(bet * 2.0)
        else:  # medium
            prize = int(bet * 1.5)
    elif result == 'computer':
        prize = 0
    elif result == 'draw':
        prize = bet
    else:
        prize = 0
    
    return {
        'type': 'prize_calculated',
        'result': result,
        'bet': bet,
        'difficulty': difficulty,
        'prize': prize
    }

async def handle_game_result(data, user_id):
    """Traiter le résultat final du jeu"""
    session_id = data.get('session_id')
    
    async with session_lock(session_id):
        valid, result = validate_game_session(session_id, user_id)
        if not valid:
            return {'type': 'error', 'message': result}
        
        session_data = result
        result_type = data.get('result')
        
        if session_data['game_over']:
            return {'type': 'error', 'message': 'La partie est déjà terminée'}
        
        # CORRECTION ICI : Stocker le résultat et calculer le prix
        session_data['result'] = result_type
        session_data['game_over'] = True
        
        # NOUVEAU : Calcul du prix basé sur les données session
        prize = calculate_prize_for_session(session_data)
        session_data['prize'] = prize
        
        # Calculer le changement de solde
        amount_change = 0
        if result_type == 'player':
            amount_change = prize
        elif result_type == 'computer':
            amount_change = 0  # Pas de gain si IA gagne
        elif result_type == 'draw':
            amount_change = session_data.get('bet_amount', 0)  # Remboursement
        
        # Mettre à jour le solde
        new_solde = await update_user_solde(user_id, amount_change)
        
        if new_solde is not None:
            update_game_session(session_id, session_data['board'], 
                              session_data['current_player'], 
                              game_over=True, result=result_type, prize=prize)
            
            return {
                'type': 'game_result_processed',
                'result': result_type,
                'prize': prize,
                'new_solde': new_solde,
                'session_id': session_id,
                'message': 'Résultat traité avec succès'
            }
        else:
            return {'type': 'error', 'message': 'Utilisateur sans solde ou erreur de traitement'}

async def handle_get_session_status(data, user_id):
    """Obtenir le statut d'une session"""
    session_id = data.get('session_id')
    
    valid, result = validate_game_session(session_id, user_id)
    if not valid:
        return {'type': 'error', 'message': result}
    
    session_data = result
    
    return {
        'type': 'session_status',
        'session_id': session_id,
        'board': session_data['board'],
        'current_player': session_data['current_player'],
        'game_over': session_data['game_over'],
        'difficulty': session_data['difficulty'],
        'bet_amount': session_data['bet_amount'],
        'created_at': session_data['created_at'].isoformat(),
        'moves_count': len(session_data['moves_history']),
        'result': session_data.get('result'),
        'prize': session_data.get('prize', 0)
    }

async def handle_cancel_session(data, user_id):
    """Annuler une session"""
    session_id = data.get('session_id')
    
    async with session_lock(session_id):
        if session_id in active_game_sessions:
            session_data = active_game_sessions[session_id]
            
            if session_data['user_id'] == user_id and not session_data['game_over']:
                bet_amount = session_data['bet_amount']
                await update_user_solde(user_id, bet_amount)
                
                del active_game_sessions[session_id]
                
                return {
                    'type': 'session_cancelled',
                    'session_id': session_id,
                    'message': 'Session annulée et mise remboursée'
                }
            else:
                return {'type': 'error', 'message': 'Impossible d\'annuler cette session'}
        else:
            return {'type': 'error', 'message': 'Session introuvable'}

# WebSocket pour communiquer avec le frontend
@app.websocket('/ws/ai')
async def ai_websocket():
    """
    WebSocket avec TOUTE la logique de jeu déportée côté serveur
    """
    try:
        while True:
            message = await websocket.receive()
            if message is None:
                break
                
            data = json.loads(message)
            
            # Récupérer l'ID utilisateur depuis la session
            user_id = session.get('user_id')
            if not user_id:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': 'Utilisateur non connecté'
                }))
                continue
            
            # NOUVEAU : Gestion sécurisée des messages
            response = await handle_websocket_message(websocket, data, user_id)
            await websocket.send(json.dumps(response))
            
            # NOUVEAU : Si c'est un résultat de jeu, nettoyer après délai
            if data.get('type') == 'game_result':
                await asyncio.sleep(10)
                if data.get('session_id') in active_game_sessions:
                    del active_game_sessions[data.get('session_id')]
    
    except asyncio.CancelledError:
        pass
    except Exception as e:
        # NOUVEAU : Log des erreurs
        pass
    
    finally:
        cleanup_old_sessions()

# Tâche de nettoyage périodique
async def periodic_cleanup():
    while True:
        await asyncio.sleep(3600)  # Toutes les heures
        cleanup_old_sessions()
        
        # NOUVEAU : Nettoyage des nonces
        global used_nonces
        used_nonces = set(list(used_nonces)[-5000:])  # Garder les 5000 plus récents

@app.before_serving
async def startup():
    asyncio.create_task(periodic_cleanup())

@app.route('/get_XO_lives', methods=['GET'])
async def get_XO_lives():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('XO Clash', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({'error': 'Aucune entrée trouvée'}), 404

                return jsonify({'lives': result[0]})

    except Exception as e:
        print(f"Erreur: {str(e)}")
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/decrement_XO_lives', methods=['POST'])
async def decrement_XO_lives():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Décrémenter les vies (minimum 0)
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = GREATEST(0, vies - 1) 
                    WHERE product_name = %s AND user_id = %s
                """, ('XO Clash', user_id))

                # Récupérer le nouveau nombre de vies
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = %s AND user_id = %s
                """, ('XO Clash', user_id))

                result = await cur.fetchone()
                if not result:
                    return jsonify({'error': 'Aucune entrée trouvée'}), 404

                return jsonify({'new_lives': result[0]})

    except Exception as e:
        print(f"Erreur: {str(e)}")
        return jsonify({'error': 'Erreur serveur'}), 500

# -----------------------------------
# SYSTEME DE JEU DE NEURO DAME 
# -----------------------------------

# Configuration de sécurité
MAX_GAMES_PER_SESSION = 5
MAX_MOVES_PER_GAME = 200
SESSION_TIMEOUT = timedelta(hours=2)

class DameSession:
    """Classe pour gérer la sécurité des sessions de jeu"""
    
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}
        self.session_games: Dict[str, set] = {}
        self.game_sessions: Dict[str, str] = {}
    
    def create_session(self, session_token: str) -> Dict:
        """Créer une nouvelle session"""
        session_data = {
            'created_at': datetime.now(),
            'last_activity': datetime.now(),
            'active_games': 0,
            'total_moves': 0,
            'ip_address': self._get_client_ip(),
            'user_agent': self._get_user_agent()
        }
        self.sessions[session_token] = session_data
        self.session_games[session_token] = set()
        return session_data
    
    def validate_session(self, session_token: str) -> bool:
        """Valider une session"""
        if session_token not in self.sessions:
            return False
        
        session_data = self.sessions[session_token]
        
        # Vérifier le timeout
        if datetime.now() - session_data['last_activity'] > SESSION_TIMEOUT:
            self.cleanup_session(session_token)
            return False
        
        # Mettre à jour la dernière activité
        session_data['last_activity'] = datetime.now()
        
        return True
    
    def can_create_game(self, session_token: str) -> bool:
        """Vérifier si la session peut créer une nouvelle partie"""
        if session_token not in self.sessions:
            return False
        
        session_data = self.sessions[session_token]
        return session_data['active_games'] < MAX_GAMES_PER_SESSION
    
    def register_game(self, session_token: str, game_id: str):
        """Enregistrer une nouvelle partie pour une session"""
        if session_token in self.session_games:
            self.session_games[session_token].add(game_id)
            self.game_sessions[game_id] = session_token
        
        if session_token in self.sessions:
            self.sessions[session_token]['active_games'] += 1
    
    def unregister_game(self, game_id: str):
        """Supprimer l'enregistrement d'une partie"""
        if game_id in self.game_sessions:
            session_token = self.game_sessions[game_id]
            if session_token in self.session_games:
                self.session_games[session_token].discard(game_id)
            
            if session_token in self.sessions:
                self.sessions[session_token]['active_games'] = max(0, 
                    self.sessions[session_token]['active_games'] - 1)
            
            del self.game_sessions[game_id]
    
    def increment_moves(self, session_token: str):
        """Incrémenter le compteur de mouvements"""
        if session_token in self.sessions:
            self.sessions[session_token]['total_moves'] += 1
    
    def cleanup_session(self, session_token: str):
        """Nettoyer une session expirée"""
        if session_token in self.sessions:
            # Nettoyer les jeux associés
            if session_token in self.session_games:
                for game_id in list(self.session_games[session_token]):
                    self.unregister_game(game_id)
                del self.session_games[session_token]
            
            del self.sessions[session_token]
    
    def cleanup_expired_sessions(self):
        """Nettoyer toutes les sessions expirées"""
        expired = []
        for token, data in self.sessions.items():
            if datetime.now() - data['last_activity'] > SESSION_TIMEOUT:
                expired.append(token)
        
        for token in expired:
            self.cleanup_session(token)
    
    def _get_client_ip(self) -> str:
        """Obtenir l'adresse IP du client"""
        try:
            return websocket.remote_addr if websocket else 'unknown'
        except:
            return 'unknown'
    
    def _get_user_agent(self) -> str:
        """Obtenir le user-agent"""
        try:
            return request.headers.get('User-Agent', 'unknown')
        except:
            return 'unknown'

# Initialiser le gestionnaire de sessions
session_manager = DameSession()

class CheckersAI:
    def __init__(self, board_size: int = 10):
        self.BOARD_SIZE = board_size
        self.AI_PLAYER = 'black'
        self.HUMAN_PLAYER = 'white'
        
    def create_empty_board(self):
        return [[None for _ in range(self.BOARD_SIZE)] for _ in range(self.BOARD_SIZE)]
    
    def setup_board(self):
        board = self.create_empty_board()
        
        # Pions noirs (AI) en haut
        for row in range(4):
            for col in range(self.BOARD_SIZE):
                if (row + col) % 2 == 1:
                    board[row][col] = {'type': 'pawn', 'color': self.AI_PLAYER}
        
        # Pions blancs (humain) en bas
        for row in range(self.BOARD_SIZE - 4, self.BOARD_SIZE):
            for col in range(self.BOARD_SIZE):
                if (row + col) % 2 == 1:
                    board[row][col] = {'type': 'pawn', 'color': self.HUMAN_PLAYER}
        
        return board
    
    def clone_board(self, board):
        return [[cell.copy() if cell else None for cell in row] for row in board]
    
    def is_valid_position(self, row: int, col: int) -> bool:
        return 0 <= row < self.BOARD_SIZE and 0 <= col < self.BOARD_SIZE
    
    def get_all_capture_moves_for_piece(self, board, row: int, col: int, visited: set = None):
        if visited is None:
            visited = set()
        
        piece = board[row][col]
        if not piece:
            return []
        
        key = f"{row},{col}"
        if key in visited:
            return []
        visited.add(key)
        
        moves = []
        max_capture_length = 1 if piece['type'] == 'pawn' else self.BOARD_SIZE - 1
        
        directions = []
        if piece['type'] == 'pawn':
            if piece['color'] == self.HUMAN_PLAYER:
                directions = [(-1, -1), (-1, 1)]
            else:
                directions = [(1, -1), (1, 1)]
        else:  # king
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
        
        for dx, dy in directions:
            for dist in range(1, max_capture_length + 1):
                adj_row = row + (dx * dist)
                adj_col = col + (dy * dist)
                
                if not self.is_valid_position(adj_row, adj_col):
                    break
                
                adj_piece = board[adj_row][adj_col]
                if not adj_piece:
                    continue
                
                if adj_piece['color'] != piece['color']:
                    land_row = adj_row + dx
                    land_col = adj_col + dy
                    
                    if (self.is_valid_position(land_row, land_col) and 
                        not board[land_row][land_col]):
                        capture = {'row': adj_row, 'col': adj_col}
                        
                        original_board = self.clone_board(board)
                        board[land_row][land_col] = piece.copy()
                        board[row][col] = None
                        board[adj_row][adj_col] = None
                        
                        additional_captures = self.get_all_capture_moves_for_piece(
                            board, land_row, land_col, visited.copy()
                        )
                        
                        board[:] = original_board
                        
                        if additional_captures:
                            for additional_move in additional_captures:
                                moves.append({
                                    'row': additional_move['row'],
                                    'col': additional_move['col'],
                                    'captures': [capture] + additional_move['captures']
                                })
                        else:
                            moves.append({
                                'row': land_row,
                                'col': land_col,
                                'captures': [capture]
                            })
                    break
                else:
                    break
        
        return moves
    
    def get_valid_moves_for_piece(self, board, row: int, col: int):
        piece = board[row][col]
        if not piece:
            return []
        
        capture_moves = self.get_all_capture_moves_for_piece(board, row, col)
        if capture_moves:
            return capture_moves
        
        moves = []
        
        if piece['type'] == 'pawn':
            if piece['color'] == self.HUMAN_PLAYER:
                directions = [(-1, -1), (-1, 1)]
            else:
                directions = [(1, -1), (1, 1)]
            
            for dx, dy in directions:
                new_row = row + dx
                new_col = col + dy
                
                if (self.is_valid_position(new_row, new_col) and 
                    not board[new_row][new_col]):
                    moves.append({
                        'row': new_row,
                        'col': new_col,
                        'captures': []
                    })
        else:  # king
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
            
            for dx, dy in directions:
                current_row = row + dx
                current_col = col + dy
                
                while self.is_valid_position(current_row, current_col):
                    if not board[current_row][current_col]:
                        moves.append({
                            'row': current_row,
                            'col': current_col,
                            'captures': []
                        })
                        current_row += dx
                        current_col += dy
                    else:
                        break
        
        return moves
    
    def get_all_moves_for_player(self, board, player: str):
        moves = []
        
        for row in range(self.BOARD_SIZE):
            for col in range(self.BOARD_SIZE):
                piece = board[row][col]
                if piece and piece['color'] == player:
                    piece_moves = self.get_valid_moves_for_piece(board, row, col)
                    for move in piece_moves:
                        moves.append({
                            'from': {'row': row, 'col': col},
                            'to': {'row': move['row'], 'col': move['col']},
                            'captures': move['captures'],
                            'piece': piece.copy()
                        })
        
        return moves
    
    def evaluate_move(self, board, move, player: str) -> int:
        score = 0
        
        # Bonus pour les captures
        score += len(move['captures']) * 100
        
        # Bonus pour la promotion
        piece = move['piece']
        if piece['type'] == 'pawn':
            promotion_row = 0 if player == self.HUMAN_PLAYER else self.BOARD_SIZE - 1
            if move['to']['row'] == promotion_row:
                score += 150
        
        # Bonus pour le centre
        center_rows = [4, 5]
        center_cols = [4, 5]
        if (move['to']['row'] in center_rows and 
            move['to']['col'] in center_cols):
            score += 30
        
        # Simuler le mouvement pour évaluer les risques
        original_board = self.clone_board(board)
        self.simulate_move(board, move)
        
        # Pénalité si le mouvement expose la pièce à une capture
        for r in range(self.BOARD_SIZE):
            for c in range(self.BOARD_SIZE):
                p = board[r][c]
                if p and p['color'] != player:
                    captures = self.get_all_capture_moves_for_piece(board, r, c)
                    for capture in captures:
                        if any(cap['row'] == move['to']['row'] and 
                               cap['col'] == move['to']['col'] 
                               for cap in capture['captures']):
                            score -= 80
        
        board[:] = original_board
        return score
    
    def simulate_move(self, board, move):
        piece = board[move['from']['row']][move['from']['col']]
        board[move['to']['row']][move['to']['col']] = piece.copy()
        board[move['from']['row']][move['from']['col']] = None
        
        for capture in move['captures']:
            board[capture['row']][capture['col']] = None
        
        # Promotion en dame
        if piece['type'] == 'pawn':
            promotion_row = 0 if piece['color'] == self.HUMAN_PLAYER else self.BOARD_SIZE - 1
            if move['to']['row'] == promotion_row:
                board[move['to']['row']][move['to']['col']]['type'] = 'king'
    
    def get_best_move(self, board, max_time: int = 2000):
        start_time = datetime.now()
        
        all_moves = self.get_all_moves_for_player(board, self.AI_PLAYER)
        
        if not all_moves:
            return None
        
        # Trier les mouvements par qualité
        all_moves.sort(key=lambda m: (
            -len(m['captures']),  # Plus de captures d'abord
            -self.evaluate_move(board, m, self.AI_PLAYER)  # Meilleure évaluation ensuite
        ))
        
        # Si on a assez de temps, on peut faire une recherche plus approfondie
        elapsed = (datetime.now() - start_time).total_seconds() * 1000
        
        if elapsed > max_time:
            # Sélectionner parmi les 3 meilleurs mouvements
            top_moves = all_moves[:min(3, len(all_moves))]
            return random.choice(top_moves)
        
        # Retourner le meilleur mouvement
        return all_moves[0] if all_moves else None
    
    def check_game_state(self, board):
        human_pieces = 0
        ai_pieces = 0
        human_moves = 0
        ai_moves = 0
        
        for row in range(self.BOARD_SIZE):
            for col in range(self.BOARD_SIZE):
                piece = board[row][col]
                if piece:
                    moves = self.get_valid_moves_for_piece(board, row, col)
                    if piece['color'] == self.HUMAN_PLAYER:
                        human_pieces += 1
                        human_moves += len(moves)
                    else:
                        ai_pieces += 1
                        ai_moves += len(moves)
        
        if human_pieces == 0 or human_moves == 0:
            return {'winner': self.AI_PLAYER, 'reason': 'human_no_pieces_or_moves'}
        elif ai_pieces == 0 or ai_moves == 0:
            return {'winner': self.HUMAN_PLAYER, 'reason': 'ai_no_pieces_or_moves'}
        
        return {'winner': None, 'reason': 'game_continues'}


class CheckersGame:
    def __init__(self):
        self.ai = CheckersAI()
        self.active_games: Dict[str, Dict] = {}
    
    def create_game(self, game_id: str, bet_amount: int, user_id: str, session_token: str):
        board = self.ai.setup_board()
        self.active_games[game_id] = {
            'board': board,
            'current_player': 'white',
            'turn_count': 1,
            'bet_amount': bet_amount,
            'user_id': user_id,
            'session_token': session_token,
            'move_history': [],
            'created_at': datetime.now(),
            'move_count': 0
        }
        return board
    
    def get_game_state(self, game_id: str):
        if game_id not in self.active_games:
            return None
        
        game = self.active_games[game_id]
        
        # Vérifier l'état du jeu
        game_state = self.ai.check_game_state(game['board'])
        
        return {
            'board': game['board'],
            'current_player': game['current_player'],
            'turn_count': game['turn_count'],
            'bet_amount': game['bet_amount'],
            'game_state': game_state,
            'move_history': game['move_history'][-10:],
            'move_count': game['move_count']
        }
    
    def make_move(self, game_id: str, from_pos: Dict, to_pos: Dict):
        if game_id not in self.active_games:
            return {'success': False, 'error': 'Game not found'}
        
        game = self.active_games[game_id]
        
        # Vérifier le nombre maximum de mouvements
        if game['move_count'] >= MAX_MOVES_PER_GAME:
            return {'success': False, 'error': 'Maximum moves reached'}
        
        board = game['board']
        
        from_row = from_pos['row']
        from_col = from_pos['col']
        to_row = to_pos['row']
        to_col = to_pos['col']
        
        piece = board[from_row][from_col]
        if not piece or piece['color'] != game['current_player']:
            return {'success': False, 'error': 'Invalid move'}
        
        # Vérifier si le mouvement est valide
        valid_moves = self.ai.get_valid_moves_for_piece(board, from_row, from_col)
        move = None
        for valid_move in valid_moves:
            if (valid_move['row'] == to_row and 
                valid_move['col'] == to_col):
                move = valid_move
                break
        
        if not move:
            return {'success': False, 'error': 'Invalid move'}
        
        # Exécuter le mouvement
        self.ai.simulate_move(board, {
            'from': from_pos,
            'to': to_pos,
            'captures': move['captures'],
            'piece': piece
        })
        
        # Ajouter à l'historique
        game['move_history'].append({
            'from': from_pos.copy(),
            'to': to_pos.copy(),
            'piece': piece.copy(),
            'captures': [c.copy() for c in move['captures']]
        })
        
        # Incrémenter le compteur de mouvements
        game['move_count'] += 1
        
        # Changer de joueur
        game['current_player'] = 'white' if game['current_player'] == 'black' else 'black'
        
        if game['current_player'] == 'white':
            game['turn_count'] += 1
        
        # Vérifier l'état du jeu
        game_state = self.ai.check_game_state(board)
        
        return {
            'success': True,
            'new_board': board,
            'current_player': game['current_player'],
            'turn_count': game['turn_count'],
            'game_state': game_state,
            'move': move,
            'move_count': game['move_count']
        }
    
    def get_ai_move(self, game_id: str):
        if game_id not in self.active_games:
            return {'success': False, 'error': 'Game not found'}
        
        game = self.active_games[game_id]
        
        if game['current_player'] != 'black':
            return {'success': False, 'error': 'Not AI turn'}
        
        # Vérifier le nombre maximum de mouvements
        if game['move_count'] >= MAX_MOVES_PER_GAME:
            return {'success': False, 'error': 'Maximum moves reached'}
        
        best_move = self.ai.get_best_move(game['board'])
        
        if not best_move:
            return {'success': False, 'error': 'No moves available'}
        
        # Exécuter le mouvement de l'IA
        result = self.make_move(game_id, best_move['from'], best_move['to'])
        
        if result['success']:
            result['ai_move'] = best_move
        
        return result
    
    def cleanup_old_games(self, hours_old: int = 24):
        """Nettoyer les vieilles parties"""
        cutoff = datetime.now() - timedelta(hours=hours_old)
        to_remove = []
        
        for game_id, game in self.active_games.items():
            if game['created_at'] < cutoff:
                to_remove.append(game_id)
        
        for game_id in to_remove:
            if game_id in self.active_games:
                # Libérer la session
                session_token = self.active_games[game_id].get('session_token')
                if session_token:
                    session_manager.unregister_game(game_id)
                del self.active_games[game_id]


game_manager = CheckersGame()

# Fonction pour mettre à jour le solde dans la base de données
async def update_user_balance(user_id: str, amount: int, is_win: bool = True):
    """
    Met à jour le solde de l'utilisateur
    is_win: True pour gain, False pour remboursement
    """
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            if is_win:
                # Ajouter les gains (montant x 1.95)
                await conn.execute(
                    "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                    amount, user_id
                )
                return {'success': True, 'amount': amount, 'type': 'win'}
            else:
                # Rembourser la mise (égalité)
                await conn.execute(
                    "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                    amount, user_id
                )
                return {'success': True, 'amount': amount, 'type': 'refund'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


@app.websocket('/ws/dame')
async def dame_websocket():
    """
    WebSocket pour le jeu de dame
    """
    game_id = None
    user_id = session.get('user_id')
    session_token = None
    
    # Nettoyer les sessions expirées périodiquement
    session_manager.cleanup_expired_sessions()
    
    try:
        while True:
            message = await websocket.receive()
            try:
                data = json.loads(message)
                event_type = data.get('type')
                
                # Authentification requise pour tous les événements sauf auth
                if event_type != 'auth':
                    session_token = data.get('session_token')
                    if not session_token:
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session token required'
                        }))
                        continue
                    
                    # Valider la session
                    if not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'auth_failed',
                            'message': 'Session invalide ou expirée'
                        }))
                        continue
                
                if event_type == 'auth':
                    # Authentification initiale
                    session_token = data.get('session_token')
                    if not session_token:
                        session_token = str(uuid.uuid4())
                    
                    if not session_manager.validate_session(session_token):
                        session_manager.create_session(session_token)
                    
                    await websocket.send(json.dumps({
                        'type': 'auth_success',
                        'session_token': session_token,
                        'message': 'Session sécurisée établie'
                    }))
                
                elif event_type == 'new_game':
                    # Créer une nouvelle partie
                    bet_amount = data.get('bet_amount', 100)
                    session_token = data.get('session_token')
                    
                    # Vérifier la session
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    # Vérifier la mise
                    if bet_amount < 10 or bet_amount > 1000:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Mise invalide (10-1000 coins)'
                        }))
                        continue
                    
                    # Vérifier si la session peut créer une nouvelle partie
                    if not session_manager.can_create_game(session_token):
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Nombre maximum de parties atteint pour cette session'
                        }))
                        continue
                    
                    game_id = f"game_{datetime.now().timestamp()}_{random.randint(1000, 9999)}"
                    board = game_manager.create_game(game_id, bet_amount, user_id, session_token)
                    
                    # Enregistrer la partie dans la session
                    session_manager.register_game(session_token, game_id)
                    
                    await websocket.send(json.dumps({
                        'type': 'game_created',
                        'game_id': game_id,
                        'board': board,
                        'current_player': 'white',
                        'turn_count': 1
                    }))
                
                elif event_type == 'get_state':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    state = game_manager.get_game_state(game_id)
                    if state:
                        await websocket.send(json.dumps({
                            'type': 'game_state',
                            'state': state
                        }))
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Game not found'
                        }))
                
                elif event_type == 'make_move':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    from_pos = data.get('from')
                    to_pos = data.get('to')
                    
                    if not from_pos or not to_pos:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Missing move data'
                        }))
                        continue
                    
                    # Incrémenter le compteur de mouvements pour la session
                    session_manager.increment_moves(session_token)
                    
                    result = game_manager.make_move(game_id, from_pos, to_pos)
                    
                    if result['success']:
                        await websocket.send(json.dumps({
                            'type': 'move_made',
                            'result': result
                        }))
                        
                        # Vérifier si la partie est terminée
                        if result['game_state']['winner']:
                            game_info = game_manager.active_games[game_id]
                            bet_amount = game_info['bet_amount']
                            
                            if result['game_state']['winner'] == 'white':  # Victoire du joueur
                                win_amount = int(bet_amount * 1.95)
                                balance_result = await update_user_balance(user_id, win_amount, True)
                                
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'victory',
                                    'message': 'Victoire !',
                                    'win_amount': win_amount,
                                    'balance_update': balance_result
                                }))
                                
                            elif result['game_state']['winner'] == 'black':  # Défaite
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'defeat',
                                    'message': 'Défaite',
                                    'loss_amount': bet_amount
                                }))
                            
                            # Nettoyer la partie
                            if game_id in game_manager.active_games:
                                session_manager.unregister_game(game_id)
                                del game_manager.active_games[game_id]
                            
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': result.get('error', 'Invalid move')
                        }))
                
                elif event_type == 'ai_move':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    # Vérifier que c'est bien le tour de l'IA
                    state = game_manager.get_game_state(game_id)
                    if not state or state['current_player'] != 'black':
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Not AI turn'
                        }))
                        continue
                    
                    # Faire réfléchir l'IA
                    await websocket.send(json.dumps({
                        'type': 'ai_thinking',
                        'message': 'WARI réfléchit...'
                    }))
                    
                    # Simuler un temps de réflexion
                    await asyncio.sleep(0.5)
                    
                    # Incrémenter le compteur de mouvements pour la session
                    session_manager.increment_moves(session_token)
                    
                    # Obtenir le mouvement de l'IA
                    result = game_manager.get_ai_move(game_id)
                    
                    if result['success']:
                        await websocket.send(json.dumps({
                            'type': 'ai_move_made',
                            'result': result
                        }))
                        
                        # Vérifier si la partie est terminée
                        if result['game_state']['winner']:
                            game_info = game_manager.active_games[game_id]
                            bet_amount = game_info['bet_amount']
                            
                            if result['game_state']['winner'] == 'white':  # Victoire du joueur
                                win_amount = int(bet_amount * 1.95)
                                balance_result = await update_user_balance(user_id, win_amount, True)
                                
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'victory',
                                    'message': 'Victoire !',
                                    'win_amount': win_amount,
                                    'balance_update': balance_result
                                }))
                                
                            elif result['game_state']['winner'] == 'black':  # Défaite
                                await websocket.send(json.dumps({
                                    'type': 'game_result',
                                    'result': 'defeat',
                                    'message': 'Défaite',
                                    'loss_amount': bet_amount
                                }))
                            
                            # Nettoyer la partie
                            if game_id in game_manager.active_games:
                                session_manager.unregister_game(game_id)
                                del game_manager.active_games[game_id]
                            
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': result.get('error', 'AI failed to move')
                        }))
                
                elif event_type == 'check_draw':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if not game_id:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'No active game'
                        }))
                        continue
                    
                    # Vérifier que la partie appartient à cette session
                    if game_id in session_manager.game_sessions:
                        if session_manager.game_sessions[game_id] != session_token:
                            await websocket.send(json.dumps({
                                'type': 'session_error',
                                'message': 'Cette partie ne vous appartient pas'
                            }))
                            continue
                    
                    state = game_manager.get_game_state(game_id)
                    if state and state['turn_count'] > 60:
                        game_info = game_manager.active_games[game_id]
                        bet_amount = game_info['bet_amount']
                        
                        # Rembourser la mise
                        balance_result = await update_user_balance(user_id, bet_amount, False)
                        
                        await websocket.send(json.dumps({
                            'type': 'game_result',
                            'result': 'draw',
                            'message': 'Match nul ! Remboursement de la mise.',
                            'refund_amount': bet_amount,
                            'balance_update': balance_result
                        }))
                        
                        # Nettoyer la partie
                        if game_id in game_manager.active_games:
                            session_manager.unregister_game(game_id)
                            del game_manager.active_games[game_id]
                
                elif event_type == 'reset':
                    session_token = data.get('session_token')
                    game_id = data.get('game_id')
                    
                    if not session_token or not session_manager.validate_session(session_token):
                        await websocket.send(json.dumps({
                            'type': 'session_error',
                            'message': 'Session invalide'
                        }))
                        continue
                    
                    if game_id and game_id in game_manager.active_games:
                        # Vérifier que la partie appartient à cette session
                        if game_id in session_manager.game_sessions:
                            if session_manager.game_sessions[game_id] != session_token:
                                await websocket.send(json.dumps({
                                    'type': 'session_error',
                                    'message': 'Cette partie ne vous appartient pas'
                                }))
                                continue
                        
                        session_manager.unregister_game(game_id)
                        del game_manager.active_games[game_id]
                    
                    await websocket.send(json.dumps({
                        'type': 'game_reset',
                        'message': 'Game reset successfully'
                    }))
                
                else:
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'message': f'Unknown event type: {event_type}'
                    }))
            
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON'
                }))
            except Exception as e:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': f'Server error: {str(e)}'
                }))
    
    except Exception as e:
        # Gérer la déconnexion
        print(f"WebSocket error: {e}")
        # Nettoyer la partie si elle existe
        if game_id and game_id in game_manager.active_games:
            session_manager.unregister_game(game_id)

# Tâche périodique pour nettoyer les vieilles parties
async def cleanup_old_games_periodically():
    while True:
        await asyncio.sleep(3600)  # Toutes les heures
        game_manager.cleanup_old_games()
        session_manager.cleanup_expired_sessions()

# Démarrer la tâche de nettoyage
@app.before_serving
async def startup():
    asyncio.create_task(cleanup_old_games_periodically())


# --- Décrémenter les vies Neuro Dame ---
@app.route('/decrement_Ndame', methods=['POST'])
async def decrement_Ndame():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # SELECT ... FOR UPDATE
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s FOR UPDATE",
                    ('Neuro Dame', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name=%s AND user_id=%s",
                    ('Neuro Dame', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500

# --- Récupérer les vies Neuro Dame ---
@app.route('/get_Ndame', methods=['GET'])
async def get_Ndame():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s",
                    ('Neuro Dame', user_id)
                )
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Neuro Dame'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Neuro Dame',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Neuro Dame'
                }), 500

# -----------------------------------
# SYSTEME DE JEU DE SYNOPOP
# -----------------------------------


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
def generate_objective():
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

# Dictionnaire en mémoire pour stocker les game sessions actives
active_syno_sessions = {}

@app.websocket('/ws_syno')
async def ws_syno():
    try:
        # 1️⃣ Réception de la mise initiale et création de la session
        message_init = await websocket.receive()
        init_data = json.loads(message_init)
        mise = float(init_data.get("mise", 0))
        user_id = session.get("user_id")

        if not user_id:
            await websocket.send(json.dumps({"error": "Utilisateur non authentifié"}))
            return

        # Création d'une session unique
        game_session_id = str(uuid.uuid4())
        words_full = await load_words(20)
        objective = generate_objective()
        errors_remaining = objective.get("allowed_errors", 0)
        questions_to_answer = objective["questions_to_answer"]
        score = 0
        gains_par_question = (mise * 1.5) / questions_to_answer
        gains_actuels = 0.0

        # Stockage de la session côté serveur
        active_syno_sessions[game_session_id] = {
            "user_id": user_id,
            "mise": mise,
            "gains_actuels": gains_actuels,
            "score": score,
            "errors_remaining": errors_remaining,
            "objective": objective,
            "answered_questions": set(),
            "timestamp": time.time()
        }

        # Envoi des mots + objectif + game_session_id au client
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
            message = await websocket.receive()
            data = json.loads(message)

            # Vérifier la session
            client_session_id = data.get("game_session_id")
            if client_session_id != game_session_id:
                await websocket.send(json.dumps({"error": "Session invalide"}))
                return

            word_id = data.get("word_id")
            selection = data.get("selection")

            session_data = active_syno_sessions[game_session_id]

            # Empêcher double réponse pour la même question
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

            # Envoyer le feedback
            await websocket.send(json.dumps({
                "word_id": word_id,
                "correct": correct,
                "score": session_data["score"],
                "gains_actuels": round(session_data["gains_actuels"], 2),
                "errors_remaining": session_data["errors_remaining"]
            }))

            # Fin de partie
            if objective["type"] == 2 and session_data["errors_remaining"] <= 0:
                await websocket.send(json.dumps({"game_over": True, "reason": "Trop d'erreurs", "gains": 0}))
                del active_syno_sessions[game_session_id]
                return

            if session_data["score"] >= questions_to_answer:
                # Mise à jour DB car objectif rempli
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                            (round(session_data["gains_actuels"], 2), user_id)
                        )
                        await conn.commit()

                await websocket.send(json.dumps({
                    "game_over": True,
                    "reason": "Objectif atteint",
                    "gains": round(session_data["gains_actuels"], 2)
                }))
                del active_syno_sessions[game_session_id]
                return

        # Si boucle terminée sans atteindre l’objectif
        await websocket.send(json.dumps({
            "game_over": True,
            "reason": "Toutes les questions terminées mais objectif non rempli",
            "gains": 0
        }))
        del active_syno_sessions[game_session_id]

    except Exception as e:
        await websocket.send(json.dumps({"error": str(e)}))
        if 'game_session_id' in locals() and game_session_id in active_syno_sessions:
            del active_syno_sessions[game_session_id]


# -----------------------------------
# SYSTEME DE JEUX DE 2048
# -----------------------------------

# Stockage sessions
active_sessions: Dict[str, Dict] = {}
connected_clients: Dict[str, Set] = {}
pending_credits: Set[str] = set()

class Game2048:
    """Implémentation complète du jeu 2048 côté serveur"""
    
    def __init__(self):
        self.grid = [0] * 16
        self.score = 0
        self.add_random_tile()
        self.add_random_tile()
    
    def add_random_tile(self):
        """Ajoute une tuile aléatoire (2 ou 4)"""
        empty_cells = [i for i, val in enumerate(self.grid) if val == 0]
        if empty_cells:
            random_index = random.choice(empty_cells)
            self.grid[random_index] = 2 if random.random() < 0.9 else 4
            return True
        return False
    
    def move(self, direction: str) -> bool:
        """Effectue un mouvement et retourne True si mouvement effectué"""
        moved = False
        
        if direction == 'left':
            moved = self._move_left()
        elif direction == 'right':
            moved = self._move_right()
        elif direction == 'up':
            moved = self._move_up()
        elif direction == 'down':
            moved = self._move_down()
        
        if moved:
            self.add_random_tile()
        
        return moved
    
    def _move_left(self) -> bool:
        moved = False
        for row in range(4):
            start = row * 4
            row_cells = self.grid[start:start+4]
            new_row = self._process_row(row_cells)
            
            for col in range(4):
                idx = start + col
                if self.grid[idx] != new_row[col]:
                    moved = True
                self.grid[idx] = new_row[col]
        
        return moved
    
    def _move_right(self) -> bool:
        moved = False
        for row in range(4):
            start = row * 4
            row_cells = self.grid[start:start+4][::-1]
            new_row = self._process_row(row_cells)[::-1]
            
            for col in range(4):
                idx = start + col
                if self.grid[idx] != new_row[col]:
                    moved = True
                self.grid[idx] = new_row[col]
        
        return moved
    
    def _move_up(self) -> bool:
        moved = False
        for col in range(4):
            col_cells = [self.grid[row*4 + col] for row in range(4)]
            new_col = self._process_row(col_cells)
            
            for row in range(4):
                idx = row*4 + col
                if self.grid[idx] != new_col[row]:
                    moved = True
                self.grid[idx] = new_col[row]
        
        return moved
    
    def _move_down(self) -> bool:
        moved = False
        for col in range(4):
            col_cells = [self.grid[row*4 + col] for row in range(3, -1, -1)]
            new_col = self._process_row(col_cells)
            
            for row in range(3, -1, -1):
                idx = row*4 + col
                if self.grid[idx] != new_col[3-row]:
                    moved = True
                self.grid[idx] = new_col[3-row]
        
        return moved
    
    def _process_row(self, row: List[int]) -> List[int]:
        """Fusionne une rangée comme dans 2048"""
        filtered = [cell for cell in row if cell != 0]
        
        i = 0
        while i < len(filtered) - 1:
            if filtered[i] == filtered[i + 1]:
                filtered[i] *= 2
                self.score += filtered[i]
                del filtered[i + 1]
            i += 1
        
        while len(filtered) < 4:
            filtered.append(0)
        
        return filtered
    
    def can_move(self) -> bool:
        """Vérifie si des mouvements sont encore possibles"""
        if any(cell == 0 for cell in self.grid):
            return True
        
        for i in range(16):
            row, col = divmod(i, 4)
            
            if col < 3 and self.grid[i] == self.grid[i + 1]:
                return True
            
            if row < 3 and self.grid[i] == self.grid[i + 4]:
                return True
        
        return False
    
    def get_state(self) -> Dict:
        """Retourne l'état actuel du jeu"""
        return {
            'grid': self.grid.copy(),
            'score': self.score,
            'can_move': self.can_move()
        }

def generate_objectif() -> Dict:
    """Génère un objectif aléatoire"""
    objectifs = [
        {
            "type": "score_time",
            "name": "Score en temps limité",
            "target": random.choice([500, 1000, 1500]),
            "time": random.choice([30, 45, 60]),
            "description": "Atteindre X points en X secondes"
        },
        {
            "type": "tile_2048",
            "name": "Atteindre 2048",
            "target": 2048,
            "time": None,
            "description": "Atteindre la tuile 2048"
        }
    ]
    
    return random.choice(objectifs)

def calcul_2048(score: float, mise: float) -> int:
    """Le gain est simplement le double de la mise"""
    gain_final = mise * 2
    return int(round(gain_final, 0))

@app.websocket("/ws/game-session")
async def game_session_ws():
    # Récupérer l'objet WebSocket
    ws_connection = websocket._get_current_object()
    session_id = None
    user_id = None
    
    try:
        # Étape 1: Initialisation
        init_data = await ws_connection.receive()
        init_message = json.loads(init_data)

        if init_message.get("type") != "init":
            await ws_connection.send(json.dumps({
                "type": "error",
                "reason": "message_init_manquant"
            }))
            return

        # Récupération des données de session Quart
        # IMPORTANT: C'est ici qu'on utilise session.get() comme dans ton code original
        user_id = session.get("user_id", "default_user")
        
        # Générer un ID de session pour le jeu
        session_id = init_message.get("session_id") or f"game_{int(time.time())}_{secrets.token_hex(8)}"
        bet_amount = float(init_message.get("bet_amount", 0))

        # Créer le jeu 2048
        game = Game2048()
        
        # Création de la session de jeu (DIFFÉRENTE de la session Quart)
        session_data = {
            "user_id": user_id,
            "game": game,
            "bet_amount": bet_amount,
            "objectif": None,
            "game_active": False,
            "already_won": False,
            "ws": ws_connection,
            "last_activity": time.time()
        }
        
        # Stocker dans active_sessions
        active_sessions[session_id] = session_data
        
        # Enregistrer dans connected_clients
        if user_id not in connected_clients:
            connected_clients[user_id] = set()
        connected_clients[user_id].add(ws_connection)

        # Accusé de réception
        await ws_connection.send(json.dumps({
            "type": "init_ok",
            "session_id": session_id,
            "timestamp": int(time.time())
        }))

        # Étape 2: Générer et envoyer l'objectif
        objectif = generate_objectif()
        session_data["objectif"] = objectif
        
        await ws_connection.send(json.dumps({
            "type": "objectif",
            "objectif": objectif,
            "timestamp": int(time.time())
        }))
        
        # Étape 3: Boucle principale de communication
        while True:
            try:
                data = await asyncio.wait_for(ws_connection.receive(), timeout=30)
                message = json.loads(data)

                # RÉCUPÉRER LES DONNÉES DE SESSION
                # C'est ici qu'il faut récupérer session_data à chaque fois
                session_data = active_sessions.get(session_id)
                if not session_data:
                    print(f"Session {session_id} introuvable")
                    break

                # Mettre à jour le timestamp d'activité
                session_data["last_activity"] = time.time()
                
                msg_type = message.get("type")

                if msg_type == "heartbeat":
                    await ws_connection.send(json.dumps({
                        "type": "heartbeat_ok",
                        "timestamp": int(time.time())
                    }))

                elif msg_type == "objectif_ack":
                    # Accusé de réception de l'objectif
                    print(f"Objectif confirmé pour session {session_id}")
                    session_data["game_active"] = True
                    
                    # Envoyer l'état initial du jeu
                    game_state = session_data["game"].get_state()
                    await ws_connection.send(json.dumps({
                        "type": "game_started",
                        "grid": game_state["grid"],
                        "score": game_state["score"],
                        "timestamp": int(time.time())
                    }))

                elif msg_type == "move":
                    if not session_data.get("game_active"):
                        continue

                    direction = message.get("direction")
                    game = session_data["game"]
                    
                    # Effectuer le mouvement côté serveur
                    moved = game.move(direction)
                    
                    if moved:
                        # Mouvement réussi
                        new_state = game.get_state()
                        
                        await ws_connection.send(json.dumps({
                            "type": "move_result",
                            "valid": True,
                            "grid": new_state["grid"],
                            "score": new_state["score"],
                            "timestamp": int(time.time())
                        }))
                        
                        # Vérifier si objectif atteint
                        await check_objectif(session_id)
                        
                    else:
                        # Mouvement invalide
                        await ws_connection.send(json.dumps({
                            "type": "move_result",
                            "valid": False,
                            "reason": "mouvement_impossible",
                            "timestamp": int(time.time())
                        }))

                elif msg_type == "no_moves":
                    game = session_data["game"]
                    if not game.can_move():
                        session_data["game_active"] = False
                        
                        # Vérifier objectif final
                        await check_objectif(session_id, no_moves=True)

                elif msg_type == "timeout":
                    session_data["game_active"] = False
                    
                    # Vérifier objectif avec timeout
                    await check_objectif(session_id, timeout=True)

                elif msg_type == "crediter_solde":
                    # VÉRIFIER SI DÉJÀ CRÉDITÉ
                    if session_id in pending_credits:
                        await ws_connection.send(json.dumps({
                            "type": "crediter_solde_result",
                            "success": False,
                            "error": "Crédit déjà en cours",
                            "timestamp": int(time.time())
                        }))
                        continue
                    
                    # Ajouter aux crédits en cours
                    pending_credits.add(session_id)
                    
                    try:
                        gains = message.get("gains", 0)
                        
                        # ICI TU METS TA FONCTION MySQL ORIGINALE
                        # credit_result = await crediter_solde_mysql(user_id, gains)
                        
                        # Pour l'instant, simulation
                        credit_result = {
                            "success": True,
                            "new_solde": 1000 + gains,
                            "amount": gains
                        }
                        
                        await ws_connection.send(json.dumps({
                            "type": "crediter_solde_result",
                            "success": credit_result["success"],
                            "amount": gains,
                            "new_solde": credit_result["new_solde"],
                            "timestamp": int(time.time())
                        }))
                        
                    finally:
                        # Retirer des crédits en cours
                        pending_credits.discard(session_id)

                elif msg_type == "close":
                    print(f"🔌 Fermeture demandée pour session {session_id}")
                    break

            except asyncio.TimeoutError:
                # Envoyer un heartbeat pour vérifier la connexion
                try:
                    await ws_connection.send(json.dumps({
                        "type": "heartbeat_check",
                        "timestamp": int(time.time())
                    }))
                except:
                    break
            except json.JSONDecodeError:
                print(f"❌ Message JSON invalide pour session {session_id}")
            except Exception as e:
                print(f"❌ Erreur traitement message session {session_id}: {e}")
                break

    except json.JSONDecodeError:
        print("❌ Message d'initialisation JSON invalide")
    except Exception as e:
        print(f"❌ Erreur WebSocket: {e}")
    finally:
        # NETTOYAGE - IMPORTANT
        print(f"🧹 Nettoyage session {session_id}")
        
        if session_id:
            # Retirer de active_sessions
            if session_id in active_sessions:
                del active_sessions[session_id]
            
            # Retirer de pending_credits
            pending_credits.discard(session_id)

        if user_id and user_id in connected_clients:
            connected_clients[user_id].discard(ws_connection)
            if not connected_clients[user_id]:
                del connected_clients[user_id]

async def check_objectif(session_id: str, **kwargs):
    """Vérifie si l'objectif est atteint"""
    session_data = active_sessions.get(session_id)
    if not session_data or session_data.get("already_won"):
        return
    
    objectif = session_data.get("objectif")
    game = session_data.get("game")
    
    if not objectif or not game:
        return
    
    state = game.get_state()
    score = state["score"]
    grid = state["grid"]
    
    result = {
        "status": "pending",
        "reason": "En cours"
    }
    
    if objectif["type"] == "score_time":
        target = objectif["target"]
        
        if kwargs.get("timeout"):
            if score >= target:
                result = {
                    "status": "success",
                    "reason": f"Score atteint à temps: {score}/{target}"
                }
            else:
                result = {
                    "status": "fail",
                    "reason": f"Temps écoulé! Score: {score}/{target}"
                }
        elif score >= target:
            result = {
                "status": "success",
                "reason": f"Objectif atteint: {score}/{target}"
            }
        elif kwargs.get("no_moves"):
            result = {
                "status": "fail",
                "reason": f"Plus de mouvements! Score: {score}/{target}"
            }
    
    elif objectif["type"] == "tile_2048":
        if 2048 in grid:
            result = {
                "status": "success",
                "reason": "Tuile 2048 atteinte!"
            }
        elif kwargs.get("no_moves"):
            result = {
                "status": "fail",
                "reason": f"Plus de mouvements! Tuile 2048 non atteinte"
            }
    
    # Envoyer résultat
    if result["status"] in ["success", "fail"]:
        session_data["game_active"] = False
        
        if result["status"] == "success":
            session_data["already_won"] = True
            bet_amount = session_data.get("bet_amount", 0)
            gains = calcul_2048(score, bet_amount)
            
            try:
                await session_data["ws"].send(json.dumps({
                    "type": "objectif_result",
                    "result": "success",
                    "reason": result["reason"],
                    "gains": gains,
                    "timestamp": int(time.time())
                }))
            except:
                pass
        else:
            try:
                await session_data["ws"].send(json.dumps({
                    "type": "objectif_result",
                    "result": "fail",
                    "reason": result["reason"],
                    "timestamp": int(time.time())
                }))
                
                await session_data["ws"].send(json.dumps({
                    "type": "game_over",
                    "reason": result["reason"],
                    "timestamp": int(time.time())
                }))
            except:
                pass

async def cleanup_inactive_sessions():
    """Nettoie les sessions inactives toutes les minutes"""
    while True:
        await asyncio.sleep(60)
        now = time.time()

        for session_id in list(active_sessions.keys()):
            session_data = active_sessions[session_id]
            
            # Session inactive depuis plus de 5 minutes
            if now - session_data["last_activity"] > 300:
                try:
                    ws = session_data["ws"]
                    await ws.send(json.dumps({
                        "type": "session_timeout",
                        "reason": "inactivite"
                    }))
                    print(f"⏰ Session expirée: {session_id}")
                except:
                    pass
                finally:
                    del active_sessions[session_id]
                    pending_credits.discard(session_id)

@app.before_serving
async def startup():
    asyncio.create_task(cleanup_inactive_sessions())

# -----------------------------------
# SYSTEME DE JEUX DE MEMOPOP
# -----------------------------------

SYMBOLS = ['🍎', '🍌', '🍒', '🍇', '🥝', '🍉', '🍓', '🍍', '🥭', '🍊']
SYMBOLS_COUNT = 8
active_games = {}

win_conditions = [
    {"id": 1, "name": "Vitesse Éclair", "timeLimit": 50, "maxErrors": None, "requirePerfectMatch": True, "multiplier": 1.5},
    {"id": 2, "name": "Expert en Mémoire", "timeLimit": 60, "maxErrors": 4, "requirePerfectMatch": True, "multiplier": 1.8},
    {"id": 4, "name": "Perfectionniste", "timeLimit": None, "maxErrors": 0, "requirePerfectMatch": True, "multiplier": 2.0},
    {"id": 5, "name": "Débutant Chanceux", "timeLimit": None, "maxErrors": None, "requirePerfectMatch": True, "multiplier": 1.2}
]

def create_game(user_id, bet, objective):
    deck = random.sample(SYMBOLS, SYMBOLS_COUNT) * 2
    random.shuffle(deck)
    game_token = secrets.token_hex(16)  # Token unique pour la partie
    active_games[user_id] = {
        "token": game_token,
        "start_time": time.time(),
        "deck": deck,
        "revealed": [],
        "matched": set(),
        "errors": 0,
        "matches": 0,
        "bet": bet,
        "objective": objective,
        "finished": False
    }
    return deck, game_token

def get_elapsed(game):
    return int(time.time() - game["start_time"])

async def check_objective(game, user_id):
    elapsed = get_elapsed(game)
    errors = game["errors"]
    matches = game["matches"]
    total_pairs = len(game["deck"]) // 2

    for cond in win_conditions:
        if cond["name"] != game["objective"]:
            continue

        if cond["maxErrors"] is not None and errors > cond["maxErrors"]:
            game["finished"] = True
            return {"success": False, "condition": cond, "reason": f"Erreur(s) dépassant la limite ({errors}/{cond['maxErrors']})"}

        if cond["timeLimit"] is not None and elapsed > cond["timeLimit"]:
            game["finished"] = True
            return {"success": False, "condition": cond, "reason": f"Temps dépassé ({elapsed}s > {cond['timeLimit']}s)"}

        if cond["requirePerfectMatch"] and matches == total_pairs:
            game["finished"] = True
            win_amount = game["bet"] * cond["multiplier"]
            try:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                            (win_amount, user_id)
                        )
            except Exception as e:
                print(f"Erreur mise à jour solde: {e}")

            return {"success": True, "win": win_amount, "condition": cond}

    return None

async def handle_click(user_id, index, token):
    game = active_games.get(user_id)
    if not game or game["finished"]:
        return {"error": "Partie invalide"}
    
    # Vérification du token
    if token != game.get("token"):
        return {"error": "Token invalide – tentative de triche détectée"}

    if index in game["matched"] or index in game["revealed"]:
        return {"ignore": True}

    game["revealed"].append(index)
    result = {"flip": index, "symbol": game["deck"][index]}

    if len(game["revealed"]) == 2:
        i1, i2 = game["revealed"]
        if game["deck"][i1] == game["deck"][i2]:
            game["matched"].update([i1, i2])
            game["matches"] += 1
            result["match"] = True
        else:
            game["errors"] += 1
            result["match"] = False
        game["revealed"] = []

    result["errors"] = game["errors"]
    result["matches"] = game["matches"]

    check = await check_objective(game, user_id)
    if check:
        result["auto_finish"] = True
        result.update(check)

    return result

def finish_game(user_id, token):
    game = active_games.get(user_id)
    if not game:
        return {"success": False}

    if token != game.get("token"):
        return {"success": False, "error": "Token invalide – tentative de triche détectée"}

    game["finished"] = True
    elapsed = get_elapsed(game)
    errors = game["errors"]
    matches = game["matches"]
    total_pairs = len(game["deck"]) // 2

    for cond in win_conditions:
        if cond["name"] != game["objective"]:
            continue
        if cond["requirePerfectMatch"] and matches != total_pairs:
            return {"success": False}
        if cond["timeLimit"] is not None and elapsed > cond["timeLimit"]:
            return {"success": False}
        if cond["maxErrors"] is not None and errors > cond["maxErrors"]:
            return {"success": False}

        win = game["bet"] * cond["multiplier"]
        return {"success": True, "win": win, "condition": cond}

    return {"success": False}

@app.websocket("/ws/memo")
async def memo_ws():
    user_id = session.get("user_id")
    if not user_id:
        await websocket.send(json.dumps({"type": "error", "message": "Non authentifié"}))
        await websocket.close()
        return

    await websocket.send(json.dumps({"type": "win_conditions", "conditions": win_conditions}))

    while True:
        try:
            payload = json.loads(await websocket.receive())

            if payload["type"] == "start_game":
                deck, token = create_game(user_id, payload["bet"], payload["objective"])
                await websocket.send(json.dumps({"type": "game_started", "deck": deck, "token": token}))

            elif payload["type"] == "click":
                token = payload.get("token")
                result = await handle_click(user_id, payload["index"], token)
                await websocket.send(json.dumps({"type": "state", **result}))
                if result.get("auto_finish"):
                    active_games.pop(user_id, None)

            elif payload["type"] == "end_game":
                token = payload.get("token")
                result = finish_game(user_id, token)
                await websocket.send(json.dumps({"type": "win_result", **result}))
                active_games.pop(user_id, None)

        except Exception as e:
            await websocket.send(json.dumps({"type": "error", "message": str(e)}))
            break


@app.route('/decrement_memo', methods=['POST'])
async def decrement_memo():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # SELECT ... FOR UPDATE
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s FOR UPDATE",
                    ('Memo Pop', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name=%s AND user_id=%s",
                    ('Memo Pop', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500

# --- Récupérer les vies Memo Pop ---
@app.route('/get_memo', methods=['GET'])
async def get_memo():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s",
                    ('Memo Pop', user_id)
                )
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Memo Pop'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Memo Pop',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Memo Pop'
                }), 500


# -----------------------------------
# SYSTEME DE JEUX DE NEURO QUIZ
# -----------------------------------

QUESTIONS_NEURO = "html 1/lang/neuro.json"

MAX_QUESTIONS = 20
MAX_ERRORS = 5
TIME_LIMIT = 10  # secondes
SESSION_COOLDOWN = 60  # secondes entre les parties

active_sessions = {}  # user_id -> {"last_play": timestamp, "count": n}


async def reward_user(user_id: int, bet: float):
    gain = bet * 2
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (gain, user_id)
            )
            await conn.commit()


async def load_neuro():
    async with aiofiles.open(QUESTIONS_NEURO, "r", encoding="utf-8") as f:
        return json.loads(await f.read())


def generate_session_token():
    return secrets.token_hex(16)  # 32 caractères hex

def sign_question(q_id):
    return hmac.new(SECRET_KEY, str(q_id).encode(), hashlib.sha256).hexdigest()


async def send_neuro(ws, questions_data, state):
    subject = state["subject"]
    pool = questions_data[subject]

    available = [q for q in pool if id(q) not in state["used"]]

    if not available:
        await ws.send(json.dumps({
            "status": "lost",
            "reason": "Plus de questions disponibles"
        }))
        return False

    q = random.choice(available)

    state["used"].add(id(q))
    state["asked"] += 1
    state["current_answer"] = q["correct"]
    state["current_qid"] = id(q)
    state["question_start"] = time.time()

    # Créer la signature HMAC pour cette question
    signature = sign_question(state["current_qid"])

    await ws.send(json.dumps({
        "status": "question",
        "number": state["asked"],
        "time": TIME_LIMIT,
        "q": q["q"],
        "options": {
            "A": q["a"],
            "B": q["b"],
            "C": q["c"]
        },
        "q_id": state["current_qid"],
        "signature": signature
    }))
    return True

@app.websocket("/ws/neuro_quiz")
async def ws_neuro_quiz():
    user_id = session.get("user_id")
    if not user_id:
        await websocket.send(json.dumps({"error": "Non authentifié"}))
        return

    now = time.time()
    last_sess = active_sessions.get(user_id)
    if last_sess and now - last_sess["last_play"] < SESSION_COOLDOWN:
        await websocket.send(json.dumps({"error": "Veuillez attendre avant de rejouer"}))
        return
    active_sessions[user_id] = {"last_play": now, "count": (last_sess["count"] + 1) if last_sess else 1}

    questions_data = await load_neuro()

    state = {
        "subject": None,
        "bet": 0.0,
        "asked": 0,
        "correct": 0,
        "wrong": 0,
        "current_answer": None,
        "current_qid": None,
        "session_token": generate_session_token(),
        "used": set()
    }

    # Envoyer token au frontend
    await websocket.send(json.dumps({
        "status": "start",
        "session_token": state["session_token"]
    }))

    while True:
        try:
            # Timeout par question
            msg = await asyncio.wait_for(
                websocket.receive(),
                timeout=TIME_LIMIT
            )
            data = json.loads(msg)
        except asyncio.TimeoutError:
            # Timeout automatique
            state["wrong"] += 1
            if state["wrong"] >= MAX_ERRORS:
                await websocket.send(json.dumps({
                    "status": "lost",
                    "reason": "Temps écoulé",
                    "score": state["correct"]
                }))
                return
            await websocket.send(json.dumps({
                "result": "timeout",
                "wrong": state["wrong"]
            }))
            await send_neuro(websocket, questions_data, state)
            continue

        action = data.get("action")
        token = data.get("session_token")

        if token != state["session_token"]:
            await websocket.send(json.dumps({"error": "Token invalide"}))
            continue

        if action == "start":
            subject = data.get("subject")
            bet = float(data.get("bet", 0))
            if subject not in questions_data or bet <= 0:
                await websocket.send(json.dumps({"error": "Paramètres invalides"}))
                return
            state["subject"] = subject
            state["bet"] = bet
            await send_neuro(websocket, questions_data, state)

        elif action == "answer":
            choice = data.get("choice")
            q_id = data.get("q_id")
            signature = data.get("signature")

            # Vérification HMAC
            if q_id != state["current_qid"] or signature != sign_question(q_id):
                await websocket.send(json.dumps({"error": "Signature invalide"}))
                continue

            # Vérification réponse
            if choice == state["current_answer"]:
                state["correct"] += 1
                result = "correct"
            else:
                state["wrong"] += 1
                result = "wrong"

            # PERDU
            if state["wrong"] >= MAX_ERRORS:
                await websocket.send(json.dumps({
                    "status": "lost",
                    "reason": "5 erreurs atteintes",
                    "score": state["correct"]
                }))
                return

            # GAGNÉ
            if state["asked"] >= MAX_QUESTIONS:
                await reward_user(user_id, state["bet"])
                await websocket.send(json.dumps({
                    "status": "won",
                    "gain": state["bet"] * 2,
                    "score": state["correct"],
                    "errors": state["wrong"]
                }))
                return

            # Résultat intermédiaire
            await websocket.send(json.dumps({
                "result": result,
                "correct": state["correct"],
                "wrong": state["wrong"]
            }))

            # Envoyer question suivante
            await send_neuro(websocket, questions_data, state)




@app.route('/get_Nquiz', methods=['GET'])
async def get_Nquiz():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s",
                    ('Neuro Quiz', user_id)
                )
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Neuro Quiz'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Neuro Quiz',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Neuro Quiz'
                }), 500


@app.route('/decrement_Nquiz', methods=['POST'])
async def decrement_Nquiz():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # SELECT ... FOR UPDATE
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s FOR UPDATE",
                    ('Neuro Quiz', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name=%s AND user_id=%s",
                    ('Neuro Quiz', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500



# ----------------------------------------
# SYSTEME DE JEUX DE AVOID THE SQUARES
# ----------------------------------------

# --- HMAC général ---
def create_hmac(payload: dict) -> str:
    msg = json.dumps(payload, sort_keys=True).encode()
    return hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()

def verify_hmac(payload: dict, signature: str) -> bool:
    expected = create_hmac(payload)
    return hmac.compare_digest(expected, signature)

# --- Session HMAC ---
def sign_session(session_id: str, user_id: int) -> str:
    return create_hmac({"session_id": session_id, "user_id": user_id})

def verify_session(session_id: str, user_id: int, signature: str) -> bool:
    return verify_hmac({"session_id": session_id, "user_id": user_id}, signature)

@app.websocket('/ws/avoid')
async def ws_avoid_achievement():
    try:
        # Vérifie si user_id est en session
        user_id = session.get("user_id")
        if not user_id:
            await websocket.send_json({"error": "Utilisateur non connecté"})
            await websocket.close(code=1000)
            return

        # ÉTAPE 1: Envoi IMMÉDIAT de la session signée au frontend
        session_id = secrets.token_hex(16)
        session_hmac = sign_session(session_id, user_id)
        
        await websocket.send_json({
            "type": "session_init",
            "session_id": session_id,
            "session_hmac": session_hmac,
            "timestamp": int(time.time())
        })

        # Attend le bet du frontend
        try:
            data = await asyncio.wait_for(websocket.receive_json(), timeout=15.0)
        except asyncio.TimeoutError:
            await websocket.send_json({"error": "Timeout: Bet non reçu"})
            await websocket.close(code=1000)
            return

        client_hmac = data.get("session_hmac", "")
        if not verify_session(data["session_id"], user_id, client_hmac):
            await websocket.send_json({"error": "Session invalide"})
            await websocket.close(code=1000)
            return

        bet = data.get("bet", 0)
        if bet < 100:
            await websocket.send_json({"error": "Bet insuffisant"})
            await websocket.close(code=1000)
            return

        # Génère un objectif aléatoire
        achievement_type = random.randint(0, 2)
        objective_id = str(uuid.uuid4())[:8]

        if achievement_type == 0:
            distance_target = random.randint(10000, 50000)
            message = f"Atteindre une distance de {distance_target} mètres !"
            payload = {"type": "distance", "target": distance_target, "objective_id": objective_id}

        elif achievement_type == 1:
            seconds_target = random.randint(90, 300)
            message = f"Jouer pendant {seconds_target} secondes !"
            payload = {"type": "time", "target": seconds_target, "objective_id": objective_id}

        else:
            distance_target = random.randint(15000, 30000)
            seconds_target = random.randint(90, 230)
            message = f"Atteindre {distance_target} mètres en {seconds_target} secondes !"
            payload = {"type": "distance_time", "distance_target": distance_target,
                       "seconds_target": seconds_target, "objective_id": objective_id}

        payload_hmac = create_hmac(payload)

        await websocket.send_json({
            "achievement": message,
            "data": payload,
            "hmac": payload_hmac,
            "objective_id": objective_id
        })

        # Variables côté serveur
        game_active = True
        game_start_time = time.time()
        total_distance = 0.0
        last_distance_sent = 0.0
        last_speed = 0
        last_score = 0
        distance_history = []
        obstacles_history = []
        last_obstacle_time = time.time()
        min_obstacle_interval = 1.2

        pool = await get_pool()

        while game_active:
            try:
                game_data = await asyncio.wait_for(websocket.receive_json(), timeout=0.1)

                client_hmac = game_data.pop("session_hmac", "")
                if not verify_session(game_data["session_id"], user_id, client_hmac):
                    await websocket.send_json({"error": "Session invalide"})
                    continue

                # Gestion des obstacles
                if game_data.get("type") == "obstacle_generated":
                    obstacle_info = game_data.get("obstacle", {})
                    current_time = time.time()
                    time_since_last_obstacle = current_time - last_obstacle_time

                    if time_since_last_obstacle >= min_obstacle_interval:
                        lane = obstacle_info.get("lane", 0)
                        if 0 <= lane <= 2:
                            await websocket.send_json({
                                "obstacle_confirmed": True,
                                "obstacle_id": obstacle_info.get("id"),
                                "lane": lane,
                                "timestamp": current_time
                            })
                            last_obstacle_time = current_time
                            obstacles_history.append({
                                "time": current_time,
                                "lane": lane,
                                "speed": obstacle_info.get("speed", 0)
                            })
                        else:
                            await websocket.send_json({"obstacle_confirmed": False, "error": "Position invalide"})
                    else:
                        await websocket.send_json({"obstacle_confirmed": False,
                                                  "error": "Intervalle trop court",
                                                  "required_interval": min_obstacle_interval,
                                                  "actual_interval": time_since_last_obstacle})
                    continue

                # Données normales de jeu
                current_distance_sent = game_data.get("distance", last_distance_sent)
                distance_increment = max(0, current_distance_sent - last_distance_sent)
                total_distance += distance_increment
                last_distance_sent = current_distance_sent
                last_speed = game_data.get("speed", last_speed)
                last_score = game_data.get("score", last_score)

                current_time = time.time()
                distance_history.append((current_time, total_distance))
                elapsed_time = current_time - game_start_time

                objective_achieved = False
                winnings = 0
                game_end_reason = None

                player_moving = total_distance > 50
                recent_distances = [d for t, d in distance_history if t >= current_time - 10]
                recent_progress = (max(recent_distances) - min(recent_distances) > 20) if recent_distances else False
                average_speed = total_distance / elapsed_time if elapsed_time > 0 else 0

                # Check objectifs
                if payload["type"] == "distance":
                    if total_distance >= payload["target"] and player_moving:
                        objective_achieved = True
                        winnings = bet * 2
                        game_end_reason = "objective_achieved"
                    elif elapsed_time > 60 and total_distance < 100:
                        game_end_reason = "no_progress"
                elif payload["type"] == "time":
                    if elapsed_time >= payload["target"] and total_distance >= 300 and player_moving:
                        objective_achieved = True
                        winnings = bet * 2
                        game_end_reason = "objective_achieved"
                    elif elapsed_time > 30 and not recent_progress:
                        game_end_reason = "stagnation"
                elif payload["type"] == "distance_time":
                    if total_distance >= payload["distance_target"] and elapsed_time >= payload["seconds_target"] and player_moving:
                        objective_achieved = True
                        winnings = bet * 2
                        game_end_reason = "objective_achieved"
                    elif elapsed_time > payload["seconds_target"] + 10 and total_distance < payload["distance_target"] * 0.5:
                        game_end_reason = "failed_objective"

                if elapsed_time > 300:
                    game_end_reason = "timeout"
                    game_active = False

                if game_end_reason:
                    game_active = False
                    if objective_achieved:
                        async with pool.acquire() as conn:
                            async with conn.cursor() as cur:
                                await cur.execute(
                                    "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                                    (winnings, user_id)
                                )

                        await websocket.send_json({
                            "game_ended": True,
                            "end_reason": "objective_achieved",
                            "objective_id": objective_id,
                            "winnings": winnings,
                            "final_distance": total_distance,
                            "final_time": elapsed_time,
                            "message": "🎉 Objectif atteint ! Gain crédité !",
                            "hmac": create_hmac({"winnings": winnings, "objective_id": objective_id})
                        })
                    else:
                        loss_message = {
                            "timeout": "⏱️ Temps écoulé",
                            "no_progress": "❌ Progression insuffisante",
                            "stagnation": "❌ Jeu stagnant",
                            "failed_objective": "❌ Objectif non atteint"
                        }.get(game_end_reason, "❌ Jeu terminé")
                        await websocket.send_json({
                            "game_ended": True,
                            "end_reason": game_end_reason,
                            "winnings": 0,
                            "final_distance": total_distance,
                            "final_time": elapsed_time,
                            "message": loss_message,
                            "hmac": create_hmac({"winnings": 0, "objective_id": objective_id})
                        })

                    await websocket.close(code=1000)
                    return

            except asyncio.TimeoutError:
                continue

            except Exception as e:
                objective_achieved = False
                winnings = 0
                elapsed_time_at_disconnect = time.time() - game_start_time

                if payload["type"] == "distance" and total_distance >= payload["target"] and total_distance > 50:
                    objective_achieved = True
                    winnings = bet * 2
                elif payload["type"] == "time" and elapsed_time_at_disconnect >= payload["target"] and total_distance >= 300:
                    objective_achieved = True
                    winnings = bet * 2
                elif payload["type"] == "distance_time" and total_distance >= payload["distance_target"] and elapsed_time_at_disconnect >= payload["seconds_target"] and total_distance > 50:
                    objective_achieved = True
                    winnings = bet * 2

                if objective_achieved:
                    async with pool.acquire() as conn:
                        async with conn.cursor() as cur:
                            await cur.execute(
                                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                                (winnings, user_id)
                            )
                return

    except Exception as e:
        pass


# --- Route async pour récupérer les vies de "Avoid" ---
@app.route('/get_Avoid_lives')
async def get_avoid_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Avoid' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'lives': result[0],
                'product': 'Avoid'
            })
        else:
            return jsonify({
                'lives': 0,  # Valeur par défaut
                'product': 'Avoid',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Avoid'
        }), 500


# --- Route async pour décrémenter les vies de "Avoid" ---
@app.route('/decrement_avoid_lives', methods=['POST'])
async def decrement_avoid_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Avoid' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'Avoid' AND user_id = %s
                """, (user_id,))

        # Retourner le nouveau nombre de vies (remaining_lives - 1)
        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


# -----------------------------------
# SYSTEME DE JEUX DE TREND UP
# -----------------------------------

def generate_hmac(payload: dict) -> str:
    msg = json.dumps(payload, sort_keys=True).encode()
    return hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()

def check_hmac(payload: dict, signature: str) -> bool:
    expected = generate_hmac(payload)
    return hmac.compare_digest(expected, signature)

connected_clients = {}
active_games = {}  

@app.websocket('/ws/trend')
async def ws_chart():
    client_id = id(websocket._get_current_object())
    connected_clients[client_id] = websocket._get_current_object()

    try:
        await websocket.accept()
        data = await websocket.receive_json()

        # Vérification HMAC côté serveur
        payload = {k: v for k, v in data.items() if k != "hmac"}
        hmac_sig = generate_hmac(payload)  # le serveur génère l'HMAC
        await websocket.send_json({'type': 'hmac', 'hmac': hmac_sig})  # envoi au frontend si besoin

        if data.get('action') != 'start_game':
            await websocket.send_json({'error': 'Action invalide'})
            return

        # Bet depuis le frontend
        bet_amount = float(data.get('bet', 0))
        if bet_amount < 100:
            await websocket.send_json({'error': 'Mise minimale 100'})
            return

        user_id = session.get('user_id')
        if not user_id:
            await websocket.send_json({'error': 'Utilisateur non connecté', 'type': 'auth_error'})
            return

        # Anti double gain / anti replay
        if user_id in active_games:
            await websocket.send_json({'error': 'Partie déjà en cours ou gains déjà crédités', 'type': 'double_play'})
            return

        # Générer token unique pour cette partie
        game_token = hmac.new(SECRET_KEY, f"{user_id}-{datetime.utcnow().timestamp()}".encode(), hashlib.sha256).hexdigest()
        active_games[user_id] = game_token

        # Vérifier booster
        has_booster = await check_booster(user_id)

        # Résultat maître (0 ou 1)
        result = await fetch_latest_result()
        if result not in [0, 1]:
            result = 0

        # Lancer le jeu
        await run_chart_game(
            ws=websocket,
            user_id=user_id,
            bet_amount=bet_amount,
            result=result,
            has_booster=has_booster,
            game_token=game_token
        )

    except Exception as e:
        await websocket.send_json({'type': 'error', 'message': str(e)})

    finally:
        connected_clients.pop(client_id, None)
        if 'user_id' in locals() and user_id in active_games:
            active_games.pop(user_id)

async def fetch_latest_result():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT result FROM calcul_fx ORDER BY timestamp DESC LIMIT 1")
            row = await cur.fetchone()
            return int(row[0]) if row else 0

async def check_booster(user_id: int) -> bool:
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT 1 FROM product_purchases WHERE user_id=%s AND product_name=%s LIMIT 1",
                (user_id, "Booster +20% gains")
            )
            return bool(await cur.fetchone())

async def update_user_balance(user_id: int, amount: float):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE solde SET solde = solde + %s WHERE user_id=%s", (amount, user_id))
            await conn.commit()

async def run_chart_game(ws, user_id, bet_amount, result, has_booster, game_token):
    duration = 180
    current_price = 100.0
    initial_bet = bet_amount

    price_history = []
    candlestick_data = []

    # Variations inverses visibles
    opposite_count = 10
    # chaque variation dure ≥ 8s
    base_seconds = list(range(duration))
    opposite_starts = random.sample(base_seconds[:-8], opposite_count)

    negative_variations = []
    for s in opposite_starts:
        negative_variations.extend(range(s, s+8))
    negative_variations = set([sec for sec in negative_variations if sec < duration])

    try:
        for second in range(duration):
            # Variation principale
            if result == 1:
                change = random.uniform(0.2, 1.0)  # hausse normale
            else:
                change = -random.uniform(0.2, 1.0)  # baisse normale

            # Injecter variations inverses
            if second in negative_variations:
                change *= -1

            current_price += change
            current_price = max(70.0, min(130.0, current_price))  # clamp max/min ±30%
            current_bet_value = bet_amount * (current_price / 100.0)

            current_time = second + 1
            price_history.append({'time': current_time, 'price': round(current_price, 2)})

            # Chandeliers
            if current_time % 5 == 0 and len(price_history) >= 5:
                last = price_history[-5:]
                candlestick_data.append({
                    'time': current_time,
                    'open': last[0]['price'],
                    'high': max(p['price'] for p in last),
                    'low': min(p['price'] for p in last),
                    'close': last[-1]['price'],
                    'color': 'green' if last[-1]['price'] >= last[0]['price'] else 'red'
                })
                if len(candlestick_data) > 20:
                    candlestick_data.pop(0)

            # Envoi WS
            await ws.send_json({
                'type': 'chart_update',
                'timestamp': datetime.now().isoformat(),
                'current_time': current_time,
                'current_price': round(current_price, 2),
                'current_value': round(current_bet_value, 2),
                'price_history': price_history[-50:],
                'candlestick_data': candlestick_data,
                'remaining_seconds': duration - current_time,
                'status': 'running'
            })

            await asyncio.sleep(1)

            # Crash
            if current_price <= 20:
                await ws.send_json({
                    'type': 'game_over',
                    'status': 'crashed',
                    'message': 'Crash du marché, mise perdue.',
                    'final_value': 0
                })
                active_games.pop(user_id, None)
                return

        final_value = bet_amount * (current_price / 100)
        gain_net = final_value - initial_bet

        if gain_net >= 0:
            bonus = gain_net * 0.2 if has_booster else 0
            total_credit = final_value + bonus

            # Anti double gain
            if user_id in active_games and active_games[user_id] == game_token:
                await update_user_balance(user_id, total_credit)
                active_games.pop(user_id, None)
                await ws.send_json({
                    'type': 'game_over',
                    'status': 'won',
                    'initial_bet': round(initial_bet,2),
                    'final_value': round(final_value,2),
                    'gain_net': round(gain_net,2),
                    'bonus': round(bonus,2),
                    'credited': round(total_credit,2),
                    'message': 'Victoire ! Gains crédités.'
                })
            else:
                await ws.send_json({'type':'error','message':'Gains déjà crédités ou partie invalide.'})
        else:
            active_games.pop(user_id, None)
            await ws.send_json({
                'type': 'game_over',
                'status': 'lost',
                'initial_bet': round(initial_bet,2),
                'final_value': round(final_value,2),
                'message': 'Défaite. Mise perdue.'
            })

    except Exception as e:
        active_games.pop(user_id, None)
        await ws.send_json({'type': 'error','message': str(e)})


# --- Décrémenter les vies du jeu Trend Up ---
@app.route('/decrement_trend_lives', methods=['POST'])
async def decrement_trend_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Trend Up' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'Trend Up' AND user_id = %s
                """, (user_id,))

        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


# --- Récupérer les vies du jeu Trend Up ---
@app.route('/get_trend_lives', methods=['GET'])
async def get_trend_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Trend Up' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

        if result:
            return jsonify({
                'lives': result[0],
                'product': 'Trend Up'
            })
        else:
            # Valeur par défaut si aucune entrée n'existe
            return jsonify({
                'lives': 0,
                'product': 'Trend Up',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Trend Up'
        }), 500


# -----------------------------------
# SYSTEME DE JEUX DE WORLD CAP
# -----------------------------------

def quiz_generate_hmac(session_id: str) -> str:
    return hmac.new(SECRET_KEY, session_id.encode(), hashlib.sha256).hexdigest()

def quiz_verify_hmac(session_id: str, signature: str) -> bool:
    expected = quiz_generate_hmac(session_id)
    return hmac.compare_digest(expected, signature)

countries_data = []

async def load_countries_data():
    global countries_data
    file_path = os.path.join("html 1", "lang", "cap.json")
    async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
        countries_data = json.loads(await f.read())

@app.before_serving
async def startup():
    await load_countries_data()

user_sessions = {}

async def credit_user_balance(pool, user_id: str, amount: float):
    if amount <= 0:
        return
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            await conn.commit()

@app.websocket("/ws/cap")
async def ws_cap():
    await websocket.accept()

    user_id = session.get("user_id")
    if not user_id:
        await websocket.send_json({"error": "Utilisateur non connecté"})
        await websocket.close(code=1000)
        return

    pool = await get_pool()

    # ===== DEMANDE MISE =====
    await websocket.send_json({"action": "send_bet", "min": 100})

    try:
        bet_data = await websocket.receive_json()
        bet = float(bet_data.get("bet", 0))
    except Exception:
        await websocket.send_json({"error": "Mise invalide"})
        await websocket.close(code=1000)
        return

    if bet < 100:
        await websocket.send_json({"error": "La mise doit être >= 100"})
        await websocket.close(code=1000)
        return

    # ===== SESSION UNIQUE =====
    session_id = secrets.token_hex(16)
    session_token = quiz_generate_hmac(session_id)

    user_sessions[user_id] = {
        "session_id": session_id,
        "token": session_token,
        "mise_initiale": bet,
        "current_bet": bet,
        "correct": 0,
        "wrong": 0,
        "asked": 0,
        "credited": False
    }

    await websocket.send_json({"session_token": session_token})

    try:
        while user_sessions[user_id]["asked"] < 50:
            s = user_sessions[user_id]

            if s["wrong"] >= 15:
                await websocket.send_json({"finished": True, "message": "Trop d'erreurs. Perdu."})
                break

            if s["current_bet"] <= 0.6 * bet:
                await websocket.send_json({"finished": True, "message": "Perte de 40%. Perdu."})
                break

            q = random.choice(countries_data)
            country = q["country"]
            correct = q["capital"]

            options = random.sample(
                [c["capital"] for c in countries_data if c["capital"] != correct],
                k=4
            ) + [correct]
            random.shuffle(options)

            await websocket.send_json({
                "country": country,
                "options": options,
                "session_token": s["token"]
            })

            try:
                answer_data = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=8
                )
            except asyncio.TimeoutError:
                s["wrong"] += 1
                s["current_bet"] -= 0.2 * bet
                s["asked"] += 1
                await websocket.send_json({
                    "result": "timeout",
                    "current_bet": round(s["current_bet"], 2)
                })
                continue

            if not quiz_verify_hmac(s["session_id"], answer_data.get("session_token", "")):
                await websocket.send_json({"error": "Token invalide"})
                continue

            if answer_data.get("answer", "").lower() == correct.lower():
                s["correct"] += 1
                s["current_bet"] += 0.2 * bet
                result = "correct"
            else:
                s["wrong"] += 1
                s["current_bet"] -= 0.2 * bet
                result = "wrong"

            s["asked"] += 1

            await websocket.send_json({
                "result": result,
                "current_bet": round(s["current_bet"], 2)
            })

        # ===== FIN DE JEU =====
        gain = s["current_bet"] - bet
        if gain > 0 and not s["credited"]:
            await credit_user_balance(pool, user_id, gain)
            s["credited"] = True
            msg = "Gains crédités"
        else:
            msg = "Dommage"

        await websocket.send_json({
            "finished": True,
            "message": msg,
            "current_bet": round(s["current_bet"], 2)
        })

    finally:
        user_sessions.pop(user_id, None)
        await websocket.close(code=1000)


    # --- Route 100% async pour décrémenter les vies ---
@app.route('/decrement_worldcap_lives', methods=['POST'])
async def decrement_worldcap_lives():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401
    
    user_id = session['user_id']

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # Verrou pour lecture + update
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'World Cap' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                
                result = await cur.fetchone()
                
                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404
                
                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'World Cap' AND user_id = %s
                """, (user_id,))

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })
            
            except Exception as e:
                await conn.rollback()
                return jsonify({'error': str(e), 'success': False}), 500
            finally:
                await conn.commit()


# --- Récupérer les vies World Cap ---
@app.route('/get_worldcap_lives', methods=['GET'])
async def get_worldcap_lives():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'World Cap' AND user_id = %s
                """, (user_id,))
                
                result = await cur.fetchone()
                
                if result:
                    return jsonify({'lives': result[0], 'product': 'World Cap'})
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'World Cap',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({'error': str(e), 'product': 'World Cap'}), 500


# -----------------------------------
# SYSTEME DE LETTRICIDE
# -----------------------------------

def lettricide_generate_hmac(game_id: str, user_id: int) -> str:
    msg = f"{game_id}:{user_id}".encode()
    return hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()

def lettricide_verify_hmac(token: str, game_id: str, user_id: int) -> bool:
    expected = lettricide_generate_hmac(game_id, user_id)
    return hmac.compare_digest(expected, token)

word_cache: list[str] = []
default_words: list[str] = []
games: dict[str, dict] = {}

@app.before_serving
async def lettricide_load_words():
    global default_words
    JSON_PATH = os.path.join("html 1", "lang", "lettricide.json")
    async with aiofiles.open(JSON_PATH, "r", encoding="utf-8") as f:
        content = await f.read()
        data = json.loads(content)
        default_words = data.get("default_words", [])

async def lettricide_get_random_word() -> str:
    if word_cache:
        return word_cache.pop()
    return random.choice(default_words)

def lettricide_generate_game_id() -> str:
    return str(random.randint(100000, 999999))

def lettricide_generate_hint(word: str) -> str:
    if len(word) <= 4:
        return "_" * len(word)
    return word[0] + "".join("_" for _ in word[1:-1]) + word[-1]

async def lettricide_word_timer(game_data: dict, websocket):
    await asyncio.sleep(30)

    # Si le mot est toujours en jeu → perdu
    if game_data["status"] == "playing":
        game_data["status"] = "timeout"
        game_data["current_word_index"] += 1

        await websocket.send_json({
            "status": "timeout",
            "word": game_data["current_word"]
        })

        if game_data["current_word_index"] >= game_data["words_total"]:
            await lettricide_finish_game(game_data, websocket)
        else:
            await lettricide_next_word(game_data, websocket)

async def lettricide_finish_game(game_data: dict, websocket):
    if game_data["total_gain"] > 0 and not game_data["credited"]:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (game_data["total_gain"], game_data["user_id"])
            )
        game_data["credited"] = True

    await websocket.send_json({
        "status": "finished",
        "total_gain": game_data["total_gain"]
    })

async def lettricide_next_word(game_data: dict, websocket):
    word = await lettricide_get_random_word()
    game_data["current_word"] = word
    game_data["used_letters"] = []
    game_data["tries_left"] = 10
    game_data["status"] = "playing"
    game_data["word_start_time"] = time.time()

    game_data["hint"] = lettricide_generate_hint(word)
    game_data["masked"] = game_data["hint"]

    await websocket.send_json({
        "status": "new_word",
        "masked": game_data["masked"],
        "tries_left": 10,
        "word_index": game_data["current_word_index"] + 1,
        "total_words": game_data["words_total"],
        "time_left": 30
    })

    # 🔥 Démarrage du timer serveur
    asyncio.create_task(lettricide_word_timer(game_data, websocket))

@app.websocket("/ws/lettricide")
async def lettricide_ws():
    print("[WS] Client connecté")

    user_id = session.get("user_id")
    if not user_id:
        await websocket.send_json({"error": "Utilisateur non connecté"})
        return

    game_id = lettricide_generate_game_id()
    game_token = lettricide_generate_hmac(game_id, user_id)

    game_data = {
        "user_id": user_id,
        "game_id": game_id,
        "token": game_token,
        "current_word_index": 0,
        "words_total": 10,
        "tries_left": 10,
        "used_letters": [],
        "current_word": "",
        "masked": "",
        "hint": "",
        "status": "playing",
        "bet": 0,
        "total_gain": 0,
        "credited": False,
        "word_start_time": 0
    }

    games[game_id] = game_data

    await websocket.send_json({
        "status": "session_created",
        "game_id": game_id,
        "token": game_token
    })

    await lettricide_next_word(game_data, websocket)

    try:
        while True:
            msg = await websocket.receive()
            data = json.loads(msg)

            token = data.get("token")
            if not lettricide_verify_hmac(token, game_id, user_id):
                await websocket.send_json({"error": "Token invalide"})
                continue

            action = data.get("action")

            if action == "start":
                bet = data.get("bet", 0)
                if bet < 100:
                    await websocket.send_json({"error": "Mise minimale 100"})
                    continue
                game_data["bet"] = bet
                continue

            if action == "guess" and game_data["status"] == "playing":
                letter = data.get("letter", "").lower()

                if not letter.isalpha() or len(letter) != 1:
                    continue
                if letter in game_data["used_letters"]:
                    continue

                game_data["used_letters"].append(letter)

                if letter not in game_data["current_word"]:
                    game_data["tries_left"] -= 1

                masked = "".join(
                    c if c in game_data["used_letters"] or game_data["hint"][i] != "_"
                    else "_"
                    for i, c in enumerate(game_data["current_word"])
                )

                game_data["masked"] = " ".join(masked)

                if "_" not in masked:
                    game_data["status"] = "win"
                    game_data["total_gain"] += game_data["bet"] * 2 / 10

                elif game_data["tries_left"] <= 0:
                    game_data["status"] = "lose"

                await websocket.send_json({
                    "masked": game_data["masked"],
                    "tries_left": game_data["tries_left"],
                    "time_left": max(0, 30 - int(time.time() - game_data["word_start_time"])),
                    "words_left": game_data["words_total"] - game_data["current_word_index"],
                    "status": game_data["status"]
                })

                if game_data["status"] in ["win", "lose"]:
                    game_data["current_word_index"] += 1
                    if game_data["current_word_index"] >= game_data["words_total"]:
                        await lettricide_finish_game(game_data, websocket)
                        break
                    else:
                        await lettricide_next_word(game_data, websocket)

    finally:
        print("[WS] Client déconnecté")

# Route 100% async
@app.route('/get_lettricide_lives', methods=['GET'])
async def get_lettricide_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name = %s AND user_id = %s",
                    ('Lettricide', user_id)
                )
                row = await cur.fetchone()

        if row:
            return jsonify({
                'lives': row[0],
                'product': 'Lettricide'
            })
        else:
            # Valeur par défaut si aucune entrée n'existe
            return jsonify({
                'lives': 0,
                'product': 'Lettricide',
                'message': 'Configuration par défaut appliquée'
            })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Lettricide'
        }), 500


# Route 100% async pour décrémenter les vies Lettricide
@app.route('/decrement_lettricide_lives', methods=['POST'])
async def decrement_lettricide_lives():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = %s AND user_id = %s
                    FOR UPDATE
                """, ('Lettricide', user_id))
                row = await cur.fetchone()

                if not row:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = row[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings
                    SET vies = vies - 1
                    WHERE product_name = %s AND user_id = %s
                """, ('Lettricide', user_id))

        # Le pool est en autocommit, donc pas besoin de commit explicite
        return jsonify({
            'success': True,
            'remaining_lives': remaining_lives - 1
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


# -----------------------------------
# SYSTEME DE JEUX DE GRID POP
# -----------------------------------


FALLBACK_CACHE = []
GRID_SIZE = 10
# Directions pour placer les mots dans la grille
DIRECTIONS = [
    (1, 0), # horizontal vers la droite
    (0, 1), # vertical vers le bas
    (1, 1), # diagonal droite-bas
    (1, -1), # diagonal droite-haut
]

active_games: Dict[str, Dict] = {}

# Utilise  lettricide_generate_hmac et  lettricide_verify_hmac pour la generation et la verification du token 

async def load_fallback_words():
    global FALLBACK_CACHE
    try:
        async with aiofiles.open("html 1/lang/grid.json", mode="r", encoding="utf-8") as f:
            content = await f.read()
            data = json.loads(content)
            FALLBACK_CACHE = data.get("fallback_words", [])
    except Exception as e:
        FALLBACK_CACHE = []

@app.before_serving
async def startup():
    await load_fallback_words()

async def fetch_words_from_api():
    """Récupère des mots aléatoires depuis l'API externe"""
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://random-word-api.herokuapp.com/word?number=6"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    words = await response.json()
                    return [word.upper() for word in words]
    except Exception as e:
        await ws.send_json({'type': 'error','message': str(e)})
    return None

def get_fallback_words():
    """Récupère des mots depuis le cache de secours"""
    if len(FALLBACK_CACHE) >= 6:
        return [word.upper() for word in random.sample(FALLBACK_CACHE, 6)]
    return [word.upper() for word in FALLBACK_CACHE[:6]]

def can_place_word(grid, word, row, col, direction):
    """Vérifie si un mot peut être placé à la position donnée"""
    dr, dc = direction
    word_len = len(word)
   
    # Vérifier que le mot tient dans la grille
    for i in range(word_len):
        r = row + dr * i
        c = col + dc * i
        if r < 0 or r >= GRID_SIZE or c < 0 or c >= GRID_SIZE:
            return False
   
    # Vérifier les conflits avec les lettres existantes
    for i in range(word_len):
        r = row + dr * i
        c = col + dc * i
        existing = grid[r][c]
        if existing != '' and existing != word[i]:
            return False
   
    return True

def place_word_in_grid(grid, word, row, col, direction):
    """Place un mot dans la grille"""
    dr, dc = direction
    positions = []
    for i in range(len(word)):
        r = row + dr * i
        c = col + dc * i
        grid[r][c] = word[i]
        positions.append((r, c))
    return positions

def place_words_in_grid(words):
    """Place tous les mots dans la grille - Version corrigée et garantie"""
    grid = [['' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
    word_positions = {}
   
    # Trier les mots par longueur (les plus longs d'abord pour faciliter le placement)
    sorted_words = sorted(words, key=len, reverse=True)
   
    for word in sorted_words:
        placed = False
        word_len = len(word)
        attempts = 0
        max_attempts = 1000 # Beaucoup d'essais pour garantir le placement
       
        while not placed and attempts < max_attempts:
            # Choisir une direction aléatoire
            dr, dc = random.choice(DIRECTIONS)
           
            # Calculer les limites selon la direction
            if dr == 1: # Vers le bas
                min_row = 0
                max_row = GRID_SIZE - word_len
            elif dr == -1: # Vers le haut (pas utilisé dans nos directions)
                min_row = word_len - 1
                max_row = GRID_SIZE - 1
            else: # dr == 0 (horizontal)
                min_row = 0
                max_row = GRID_SIZE - 1
           
            if dc == 1: # Vers la droite
                min_col = 0
                max_col = GRID_SIZE - word_len
            elif dc == -1: # Vers la gauche
                min_col = word_len - 1
                max_col = GRID_SIZE - 1
            else: # dc == 0 (vertical)
                min_col = 0
                max_col = GRID_SIZE - 1
           
            # Vérifier que les limites sont valides
            if min_row > max_row or min_col > max_col:
                attempts += 1
                continue
           
            # Choisir une position aléatoire dans les limites
            row = random.randint(min_row, max_row)
            col = random.randint(min_col, max_col)
           
            if can_place_word(grid, word, row, col, (dr, dc)):
                positions = place_word_in_grid(grid, word, row, col, (dr, dc))
                word_positions[word] = positions
                placed = True
           
            attempts += 1
       
        if not placed:
            # Recherche exhaustive comme dernier recours
            for dr, dc in DIRECTIONS:
                # Calculer toutes les positions possibles pour cette direction
                if dr == 1:
                    row_range = range(0, GRID_SIZE - word_len + 1)
                elif dr == -1:
                    row_range = range(word_len - 1, GRID_SIZE)
                else:
                    row_range = range(0, GRID_SIZE)
               
                if dc == 1:
                    col_range = range(0, GRID_SIZE - word_len + 1)
                elif dc == -1:
                    col_range = range(word_len - 1, GRID_SIZE)
                else:
                    col_range = range(0, GRID_SIZE)
               
                for r in row_range:
                    for c in col_range:
                        if can_place_word(grid, word, r, c, (dr, dc)):
                            positions = place_word_in_grid(grid, word, r, c, (dr, dc))
                            word_positions[word] = positions
                            placed = True
                            break
                    if placed:
                        break
                if placed:
                    break
       
        if not placed:
            # Créer un mot alternatif simple
            simple_word = "LALMA"
            if len(simple_word) <= GRID_SIZE:
                r = random.randint(0, GRID_SIZE - len(simple_word))
                c = random.randint(0, GRID_SIZE - 1)
                positions = place_word_in_grid(grid, simple_word, r, c, (1, 0))
                word_positions[simple_word] = positions
                words[words.index(word)] = simple_word
   
    # Vérification finale
    for word, positions in word_positions.items():
        # Vérifier que le mot est bien dans la grille
        word_from_grid = ''.join([grid[r][c] for r, c in positions])
        if word_from_grid == word:
            pass
   
    return grid, word_positions

def debug_display_grid(grid, word_positions):
    # Créer un dictionnaire pour marquer les cellules de mots
    word_cells = {}
    for word, positions in word_positions.items():
        for r, c in positions:
            word_cells[(r, c)] = word
   
    for r in range(GRID_SIZE):
        row_display = f"{r:2}|"
        for c in range(GRID_SIZE):
            cell = grid[r][c]
            if (r, c) in word_cells:
                row_display += f" [{cell}]"
            else:
                row_display += f" {cell} "
   
    for word, positions in word_positions.items():
        pass

def fill_empty_cells(grid):
    """Remplit les cellules vides avec des lettres aléatoires"""
    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            if grid[r][c] == '':
                grid[r][c] = chr(random.randint(65, 90)) # Lettre majuscule aléatoire
    return grid

def generate_game_grid(words):
   
    # Place les mots dans la grille
    grid, word_positions = place_words_in_grid(words)
   
    # Vérifier que tous les mots sont placés
    if len(word_positions) < len(words):
        missing = set(words) - set(word_positions.keys())
   
    # Remplit les cellules vides
    grid = fill_empty_cells(grid)
   
    # Afficher la grille pour débogage
    debug_display_grid(grid, word_positions)
   
    return {
        "grid": grid,
        "words": list(word_positions.keys()), # Utiliser uniquement les mots placés
        "word_positions": word_positions
    }

def is_adjacent(pos1: Tuple[int, int], pos2: Tuple[int, int]) -> bool:
    """Vérifie si deux positions sont adjacentes"""
    r1, c1 = pos1
    r2, c2 = pos2
    return abs(r1 - r2) <= 1 and abs(c1 - c2) <= 1

def is_valid_selection(game_data: Dict, selection: List[Tuple[int, int]]) -> Tuple[bool, str]:
    """Valide une sélection de cellules"""
   
    # Vérifier si la partie est active
    if not game_data.get("active", False):
        return False, "La partie n'est pas active"
   
    # Vérifier si la sélection est vide
    if not selection:
        return False, "Sélection vide"
   
    # Vérifier si toutes les cellules sont dans la grille
    for row, col in selection:
        if row < 0 or row >= GRID_SIZE or col < 0 or col >= GRID_SIZE:
            return False, "Cellule hors de la grille"
   
    # Vérifier si les cellules sont adjacentes
    for i in range(1, len(selection)):
        if not is_adjacent(selection[i-1], selection[i]):
            return False, "Les cellules ne sont pas adjacentes"
   
    # Vérifier si une cellule a déjà été trouvée
    found_positions = set()
    for positions in game_data.get("found_words", {}).values():
        found_positions.update([tuple(pos) for pos in positions])
   
    for cell in selection:
        if tuple(cell) in found_positions:
            return False, "Cette cellule fait déjà partie d'un mot trouvé"
   
    return True, "Sélection valide"

def check_word(game_data: Dict, selection: List[Tuple[int, int]]) -> Tuple[bool, str, str]:
    """Vérifie si la sélection correspond à un mot"""
    selection_tuple = [tuple(pos) for pos in selection]
    for word, positions in game_data["word_positions"].items():
        # Vérifier l'ordre direct
        if selection_tuple == positions:
            return True, word, "direct"
        # Vérifier l'ordre inversé
        if selection_tuple == positions[::-1]:
            return True, word, "reversed"
   
    return False, "", ""

async def add_win_to_user_solde(user_id: str, win_amount: float, word_found: str):
    """Ajoute le gain d'un mot trouvé au solde de l'utilisateur"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 1. Récupérer le solde actuel
                await cursor.execute(
                    "SELECT solde FROM solde WHERE user_id = %s",
                    (user_id,)
                )
                result = await cursor.fetchone()
               
                if not result:
                    return False, "Utilisateur non trouvé"
               
                current_solde = float(result[0])
               
                # 2. Calculer le nouveau solde
                new_solde = current_solde + win_amount
               
                # 3. Mettre à jour le solde
                await cursor.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_solde, user_id)
                )
               
                await conn.commit()

                return True, new_solde
               
    except Exception as e:
        return False, str(e)

def update_game_state(game_data: Dict, word: str, positions: List[Tuple[int, int]]) -> Dict:
    """Met à jour l'état du jeu après la découverte d'un mot"""
   
    # Ajouter le mot aux mots trouvés
    if "found_words" not in game_data:
        game_data["found_words"] = {}
   
    game_data["found_words"][word] = positions
   
    # Vérifier si tous les mots ont été trouvés
    all_words = set(game_data["words"])
    found_words = set(game_data["found_words"].keys())
   
    if all_words.issubset(found_words):
        game_data["completed"] = True
        game_data["active"] = False
   
    return game_data

@app.websocket("/ws/Gpop")
async def ws_Gpop():
    """WebSocket principal pour le jeu"""
   
    try:
        # Récupérer le user_id depuis la session (comme dans les routes HTTP)
        user_id = session.get('user_id')
        if not user_id:
            await websocket.send_json({
                "error": "Utilisateur non connecté",
                "action": "auth_error"
            })
            return
       
       
        while True:
            # ⏳ Attendre une demande du client
            data = await websocket.receive_json()
           
            action = data.get("action")
           
            if action == "get_game":
                # Vérifier que l'utilisateur est toujours connecté
                if not session.get('user_id'):
                    await websocket.send_json({
                        "error": "Session expirée, reconnectez-vous",
                        "action": "get_game"
                    })
                    continue
               
                # 🎯 Tentative API externe pour les mots
                api_words = await fetch_words_from_api()
               
                if api_words and len(api_words) >= 3: # Au moins 3 mots
                    words_source = "api"
                    words = api_words[:6] # Prendre max 6 mots
                else:
                    # 🔄 Fallback sur les mots locaux
                    fallback_words = get_fallback_words()
                    if fallback_words and len(fallback_words) >= 3:
                        words_source = "fallback"
                        words = fallback_words[:6]
                    else:
                        # Fallback ultime: mots simples garantis
                        words_source = "default"
                        words = ["TEST", "CLOUDSIDE", "LALMATECH", "GRIDPOP", "PLAYING", "CHANGEMENT"]
                        words = [word.upper() for word in words]
               
                # 🎮 Génération de la grille
                game_data = generate_game_grid(words)
               
                # Générer un ID unique pour la partie
                game_id = str(int(datetime.now().timestamp()))
               
                # Générer le token HMAC pour cette partie
                hmac_token = lettricide_generate_hmac(game_id, int(user_id))
               
                # Initialiser l'état de la partie
                game_data.update({
                    "game_id": game_id,
                    "hmac_token": hmac_token,
                    "active": True,
                    "completed": False,
                    "found_words": {},
                    "selected_cells": [],
                    "start_time": datetime.now().isoformat(),
                    "source": words_source,
                    "current_bet": data.get("bet", 100) # Stocker la mise
                })
               
                # Stocker la partie
                active_games[user_id] = game_data
               
                # 📤 Envoi des données au client
                await websocket.send_json({
                    "action": "game_created",
                    "grid": game_data["grid"],
                    "words": game_data["words"],
                    "word_positions": game_data["word_positions"],
                    "grid_size": GRID_SIZE,
                    "source": words_source,
                    "game_id": game_id,
                    "hmac_token": hmac_token,
                    "game_state": {
                        "active": True,
                        "completed": False,
                        "found_words": {},
                        "remaining_words": len(game_data["words"])
                    }
                })
               
               
            elif action == "select_cell":
                # Vérifier que l'utilisateur est toujours connecté
                if not session.get('user_id'):
                    await websocket.send_json({
                        "error": "Session expirée, reconnectez-vous",
                        "action": "select_cell"
                    })
                    continue
               
                # Vérifier si l'utilisateur a une partie active
                if user_id not in active_games:
                    await websocket.send_json({
                        "error": "Aucune partie active",
                        "action": "select_cell"
                    })
                    continue
               
                game_data = active_games[user_id]
               
                # Vérifier le token HMAC
                client_token = data.get("hmac_token")
                game_id = game_data.get("game_id")
                
                if not client_token or not game_id:
                    await websocket.send_json({
                        "error": "Token manquant",
                        "action": "select_cell"
                    })
                    continue
                    
                if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                    await websocket.send_json({
                        "error": "Token invalide",
                        "action": "select_cell"
                    })
                    continue
               
                # Récupérer la cellule sélectionnée
                row = data.get("row")
                col = data.get("col")
               
                if row is None or col is None:
                    await websocket.send_json({
                        "error": "Coordonnées manquantes",
                        "action": "select_cell"
                    })
                    continue
               
                cell = (row, col)
               
                # Vérifier si la cellule est déjà sélectionnée
                if cell in game_data.get("selected_cells", []):
                    await websocket.send_json({
                        "action": "selection_updated",
                        "selected_cells": game_data["selected_cells"],
                        "valid": True,
                        "message": "Cellule déjà sélectionnée"
                    })
                    continue
               
                # Valider la sélection
                selection = game_data.get("selected_cells", []) + [cell]
                valid, message = is_valid_selection(game_data, selection)
               
                if valid:
                    # Mettre à jour la sélection
                    game_data["selected_cells"] = selection
                    active_games[user_id] = game_data
                   
                    await websocket.send_json({
                        "action": "selection_updated",
                        "selected_cells": selection,
                        "valid": True,
                        "message": "Sélection mise à jour"
                    })
                   
                    # Vérifier si un mot a été formé
                    word_found, word, direction = check_word(game_data, selection)
                   
                    if word_found:
                        # Calculer le gain (mise * 2 / 6)
                        current_bet = game_data.get("current_bet", 100)
                        win_amount = round((current_bet * 2) / 6, 2) # Gain par mot
                       
                        # Ajouter le gain au solde de l'utilisateur
                        success, result = await add_win_to_user_solde(user_id, win_amount, word)
                       
                        if not success:
                            win_amount = 0 # Ne pas créditer le gain en cas d'erreur
                       
                        # Mettre à jour l'état du jeu
                        game_data = update_game_state(game_data, word, selection)
                        game_data["selected_cells"] = []
                        active_games[user_id] = game_data
                       
                        await websocket.send_json({
                            "action": "word_found",
                            "word": word,
                            "direction": direction,
                            "positions": selection,
                            "win_amount": win_amount,
                            "gain_added": success,
                            "hmac_token": game_data["hmac_token"], # Renvoyer le même token
                            "game_state": {
                                "active": game_data["active"],
                                "completed": game_data["completed"],
                                "found_words": game_data["found_words"],
                                "remaining_words": len(game_data["words"]) - len(game_data["found_words"])
                            }
                        })
                       
                        # Si la partie est terminée
                        if game_data["completed"]:
                            total_win = win_amount * len(game_data["words"])
                            await websocket.send_json({
                                "action": "game_completed",
                                "message": "Tous les mots ont été trouvés!",
                                "total_win": total_win,
                                "hmac_token": game_data["hmac_token"],
                                "game_state": {
                                    "active": False,
                                    "completed": True,
                                    "found_words": game_data["found_words"],
                                    "remaining_words": 0
                                }
                            })
                    else:
                        # Vérifier si la sélection est trop longue
                        max_word_length = max([len(w) for w in game_data["words"]]) if game_data["words"] else 0
                        if len(selection) > max_word_length:
                            game_data["selected_cells"] = []
                            active_games[user_id] = game_data
                           
                            await websocket.send_json({
                                "action": "invalid_word",
                                "selected_cells": [],
                                "hmac_token": game_data["hmac_token"],
                                "message": "Mot incorrect. Essayez encore!"
                            })
                else:
                    # Sélection invalide
                    await websocket.send_json({
                        "action": "selection_invalid",
                        "selected_cells": game_data.get("selected_cells", []),
                        "hmac_token": game_data["hmac_token"],
                        "valid": False,
                        "message": message
                    })
               
            elif action == "clear_selection":
                # Effacer la sélection
                if user_id in active_games:
                    game_data = active_games[user_id]
                    
                    # Vérifier le token HMAC
                    client_token = data.get("hmac_token")
                    game_id = game_data.get("game_id")
                    
                    if not client_token or not game_id:
                        await websocket.send_json({
                            "error": "Token manquant",
                            "action": "clear_selection"
                        })
                        continue
                        
                    if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                        await websocket.send_json({
                            "error": "Token invalide",
                            "action": "clear_selection"
                        })
                        continue
                    
                    game_data["selected_cells"] = []
                    active_games[user_id] = game_data
                   
                    await websocket.send_json({
                        "action": "selection_cleared",
                        "selected_cells": [],
                        "hmac_token": game_data["hmac_token"],
                        "message": "Sélection effacée"
                    })
               
            elif action == "end_game":
                # Terminer la partie
                if user_id in active_games:
                    game_data = active_games[user_id]
                    
                    # Vérifier le token HMAC
                    client_token = data.get("hmac_token")
                    game_id = game_data.get("game_id")
                    
                    if client_token and game_id:
                        if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                            await websocket.send_json({
                                "error": "Token invalide",
                                "action": "end_game"
                            })
                            continue
                    
                    game_data["active"] = False
                    game_data["completed"] = True
                    active_games[user_id] = game_data
                   
                    found_count = len(game_data.get("found_words", {}))
                    total_words = len(game_data["words"])
                   
                    await websocket.send_json({
                        "action": "game_ended",
                        "message": f"Partie terminée! {found_count}/{total_words} mots trouvés.",
                        "found_count": found_count,
                        "total_words": total_words,
                        "hmac_token": game_data.get("hmac_token", ""),
                        "game_state": {
                            "active": False,
                            "completed": True,
                            "found_words": game_data["found_words"],
                            "remaining_words": total_words - found_count
                        }
                    })
                   
               
            elif action == "get_game_state":
                # Obtenir l'état actuel du jeu
                if user_id in active_games:
                    game_data = active_games[user_id]
                    
                    # Vérifier le token HMAC si fourni
                    client_token = data.get("hmac_token")
                    game_id = game_data.get("game_id")
                    
                    if client_token and game_id:
                        if not lettricide_verify_hmac(client_token, game_id, int(user_id)):
                            await websocket.send_json({
                                "error": "Token invalide",
                                "action": "get_game_state"
                            })
                            continue
                   
                    await websocket.send_json({
                        "action": "game_state",
                        "game_state": {
                            "active": game_data["active"],
                            "completed": game_data["completed"],
                            "found_words": game_data["found_words"],
                            "selected_cells": game_data.get("selected_cells", []),
                            "remaining_words": len(game_data["words"]) - len(game_data.get("found_words", {})),
                            "grid": game_data["grid"],
                            "words": game_data["words"]
                        },
                        "hmac_token": game_data.get("hmac_token", "")
                    })
                else:
                    await websocket.send_json({
                        "action": "game_state",
                        "game_state": None,
                        "message": "Aucune partie active"
                    })
               
            else:
                await websocket.send_json({
                    "error": "Action inconnue",
                    "action": action,
                    "valid_actions": [
                        "get_game",
                        "select_cell",
                        "clear_selection",
                        "end_game",
                        "get_game_state"
                    ]
                })
           
    except Exception as e:
        pass
    finally:
        if 'user_id' in locals() and user_id in active_games:
            del active_games[user_id]

# --- Endpoint async pour décrémenter les vies ---
@app.route('/decrement_Gpop', methods=['POST'])
async def decrement_Gpop():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Grid Pop' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'Grid Pop' AND user_id = %s
                """, (user_id,))

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'success': False
                }), 500


# --- Endpoint async pour récupérer le nombre de vies ---
@app.route('/get_Gpop', methods=['GET'])
async def get_Gpp():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Grid Pop' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Grid Pop'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Grid Pop',
                        'message': 'Configuration par défaut appliquée'
                    })

            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Grid Pop'
                }), 500



# -----------------------------------
# SYSTEME DE JEUX DE SPEED MIND
# -----------------------------------

JSON_MIND_PATH = "html 1/lang/mind.json"
SMIND_QUESTION_TIME = 10
SMIND_TOTAL_QUESTIONS = 40
SMIND_MIN_BET = 100
SMIND_QUESTIONS_BY_ID = {}

@app.before_serving
async def smind_load_questions():
    global SMIND_QUESTIONS_BY_ID
    async with aiofiles.open(JSON_MIND_PATH, "r", encoding="utf-8") as f:
        data = json.loads(await f.read())
    SMIND_QUESTIONS_BY_ID = {
        i: q for i, q in enumerate(data["questions"])
    }

def smind_create_question_token(question_id: int) -> str:
    return hmac.new(
        SECRET_KEY,
        str(question_id).encode(),
        hashlib.sha256
    ).hexdigest()

def smind_verify_question_token(question_id: int, token: str) -> bool:
    expected = smind_create_question_token(question_id)
    return hmac.compare_digest(expected, token)

async def smind_credit_user(user_id: int, amount: int):
    if amount <= 0:
        return
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            if cur.rowcount == 0:
                raise Exception("Utilisateur introuvable")
            await conn.commit()

@app.websocket("/ws/Smind")
async def smind_websocket():
    if "user_id" not in session:
        await websocket.send(json.dumps({
            "type": "error",
            "message": "Utilisateur non connecté"
        }))
        return
    user_id = session["user_id"]
    smind_game = {
        "question_ids": [],
        "current_qid": None,
        "index": 0,
        "good": 0,
        "bad": 0,
        "bet": 0,
        "gain_per_question": 0,
        "waiting": False
    }
    try:
        while True:
            data = json.loads(await websocket.receive())
            if data["action"] == "start_game":
                bet = int(data.get("bet", 0))
                if bet < SMIND_MIN_BET:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": f"Mise minimale : {SMIND_MIN_BET}"
                    }))
                    continue
                smind_game["question_ids"] = random.sample(
                    list(SMIND_QUESTIONS_BY_ID.keys()),
                    min(SMIND_TOTAL_QUESTIONS, len(SMIND_QUESTIONS_BY_ID))
                )
                smind_game["index"] = 0
                smind_game["good"] = 0
                smind_game["bad"] = 0
                smind_game["bet"] = bet
                smind_game["gain_per_question"] = round((bet * 2) / SMIND_TOTAL_QUESTIONS)
                await smind_send_question(smind_game)
            elif data["action"] == "answer":
                if not smind_game["waiting"]:
                    continue
                qid = data.get("id")
                token = data.get("token")
                choice = data.get("choice")
                if qid != smind_game["current_qid"]:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Question invalide"
                    }))
                    return
                if not smind_verify_question_token(qid, token):
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Tentative de triche détectée"
                    }))
                    return
                await smind_process_answer(smind_game, choice, user_id)
    except Exception as e:
        pass

async def smind_send_question(smind_game):
    if smind_game["index"] >= SMIND_TOTAL_QUESTIONS:
        await websocket.send(json.dumps({
            "type": "game_over",
            "good": smind_game["good"],
            "bad": smind_game["bad"]
        }))
        return
    qid = smind_game["question_ids"][smind_game["index"]]
    q = SMIND_QUESTIONS_BY_ID[qid]
    token = smind_create_question_token(qid)
    smind_game["current_qid"] = qid
    smind_game["waiting"] = True
    smind_game["current_timer"] = asyncio.create_task(smind_question_timeout(smind_game, qid))
    await websocket.send(json.dumps({
        "type": "question",
        "id": qid,
        "index": smind_game["index"] + 1,
        "total": SMIND_TOTAL_QUESTIONS,
        "question": q["question"],
        "options": q["options"],
        "token": token,
        "time": SMIND_QUESTION_TIME
    }))

async def smind_question_timeout(smind_game, qid):
    try:
        await asyncio.sleep(SMIND_QUESTION_TIME)
        if smind_game.get("waiting") and smind_game.get("current_qid") == qid:
            await smind_process_answer(smind_game, None, None)
    except asyncio.CancelledError:
        pass

async def smind_wait_for_answer(smind_game):
    fut = asyncio.get_running_loop().create_future()
    smind_game["_future"] = fut
    await fut

async def smind_process_answer(smind_game, choice, user_id):
    if not smind_game["waiting"]:
        return
    smind_game["waiting"] = False
    qid = smind_game["current_qid"]
    q = SMIND_QUESTIONS_BY_ID[qid]
    if choice is not None and choice == q["correct"]:
        smind_game["good"] += 1
        gain = smind_game["gain_per_question"]
        if user_id is not None:
            await smind_credit_user(user_id, gain)
        result = {
            "type": "result",
            "status": "correct",
            "gain": gain
        }
    else:
        smind_game["bad"] += 1
        result = {
            "type": "result",
            "status": "wrong",
            "gain": 0
        }
    if "_future" in smind_game:
        fut = smind_game.pop("_future")
        if not fut.done():
            fut.set_result(True)
    smind_game["index"] += 1
    await websocket.send(json.dumps({
        **result,
        "good": smind_game["good"],
        "bad": smind_game["bad"]
    }))
    await smind_send_question(smind_game)


# -----------------------------------
# SYSTEME DE JEUX DE ANA MIND
# -----------------------------------

FALLBACK_WORDS = ['ordinateur', 'programmation', 'développeur', 'algorithm', 'internet']

# --- Mélange lettres ---
def shuffle_word(word: str) -> str:
    letters = list(word)
    random.shuffle(letters)
    return ''.join(letters)

# --- HMAC ---
# Utilise generate_hmac et  verify_hmac pour la securiter hmac

ACTIVE_WORDS = {}  

@app.websocket('/ws/amind')
async def ws_get_word():
    pool = await get_pool()

    while True:
        try:
            msg = await websocket.receive_json()

            bet = msg.get('bet')
            user_id = session.get('user_id')

            if user_id is None:
                await websocket.send_json({'error': 'Utilisateur non connecté'})
                continue

            if bet is None or bet < 100:
                await websocket.send_json({'error': 'Le pari doit être >= 100'})
                continue

            # --- Génération du mot ---
            word = None
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    response = await client.get('https://trouve-mot.fr/api/random')
                    response.raise_for_status()
                    data = response.json()
                    if data and len(data) > 0 and 'name' in data[0]:
                        word = data[0]['name'].lower()
            except Exception as e:
                pass

            if not word:
                word = random.choice(FALLBACK_WORDS)

            # --- Eviter rejouer le même mot ---
            if ACTIVE_WORDS.get(user_id) == word:
                word = random.choice([w for w in FALLBACK_WORDS if w != word])

            shuffled = shuffle_word(word)
            word_hmac = generate_hmac(word)

            # Stockage mot actif
            ACTIVE_WORDS[user_id] = word

            # --- Envoi uniquement le mot mélangé et le HMAC ---
            await websocket.send_json({
                'shuffled': shuffled,
                'time_limit': 30,
                'hmac': word_hmac
            })

            # --- Attente réponse joueur ---
            try:
                player_response = await asyncio.wait_for(websocket.receive_json(), timeout=30)
                player_answer = player_response.get('answer', '').lower().strip()
                response_hmac = player_response.get('hmac')

                # Vérification HMAC côté serveur
                if not verify_hmac(word, response_hmac):
                    await websocket.send_json({'success': False, 'message': 'HMAC invalide !'})
                    continue

                if player_answer == word:
                    # --- Crédits ×2 ---
                    async with pool.acquire() as conn:
                        async with conn.cursor() as cur:
                           await cur.execute(
                              "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                               (bet*2, user_id)
                            )


                    result = {'success': True, 'message': 'Correct !', 'gain': bet*2}
                else:
                    result = {'success': False, 'message': 'Échec !', 'gain': 0}

                # Supprimer mot actif après tentative
                ACTIVE_WORDS.pop(user_id, None)

            except asyncio.TimeoutError:
                result = {'success': False, 'message': 'Temps écoulé !', 'gain': 0}
                ACTIVE_WORDS.pop(user_id, None)

            await websocket.send_json(result)

        except Exception as e:
            pass
            break


@app.route('/decrement_Amind', methods=['POST'])
async def decrement_Amind():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # On commence une transaction explicite
                await conn.begin()

                # Vérifier l'existence des paramètres du jeu
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = 'Ana Mind' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    await conn.rollback()
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    await conn.rollback()
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute("""
                    UPDATE game_settings
                    SET vies = vies - 1
                    WHERE product_name = 'Ana Mind' AND user_id = %s
                """, (user_id,))
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


# --- Route async : récupérer les vies de Ana Mind ---
@app.route('/get_Amind', methods=['GET'])
async def get_Amind():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies
                    FROM game_settings
                    WHERE product_name = 'Ana Mind' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Ana Mind'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Ana Mind',
                        'message': 'Configuration par défaut appliquée'
                    })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Ana Mind'
        }), 500


# -----------------------------------
# SYSTEME DE JEUX DE SMART BATTLE
# -----------------------------------

SMART_PATH = os.path.join("html 1", "lang", "smart.json")
CATEGORIES_ORDER = ["science", "litterature", "maths", "histoire"]
CATEGORY_DURATION = 30  # secondes

CATEGORY_POINTS = {
    "science": 4,
    "litterature": 3,
    "maths": 2,
    "histoire": 1
}

QUESTIONS = {}      # category -> list of questions SAFE
ANSWER_KEY = {}     # question_id -> correct index
PLAYER_STATS = {}   # smart_id -> stats
QUESTION_USED = {}  # smart_id -> set(question_id) pour anti-rejeu

async def load_questions():
    if QUESTIONS:
        return
    async with aiofiles.open(SMART_PATH, "r", encoding="utf-8") as f:
        raw = json.loads(await f.read())
    for category, qs in raw.items():
        QUESTIONS[category] = []
        for idx, q in enumerate(qs):
            qid = f"{category}_{idx}"
            ANSWER_KEY[qid] = q["correct"]
            QUESTIONS[category].append({
                "id": qid,
                "question": q["question"],
                "options": q["options"]
            })
    print("✅ Questions chargées")

def generate_smart_id(user_id):
    return hashlib.sha256(str(user_id).encode()).hexdigest()[:16]

#Utilise  create_question_token et verify_question_token pour la securiter hmac 

async def send_question(category, smart_id):
    used = QUESTION_USED.get(smart_id, set())
    available = [q for q in QUESTIONS[category] if q["id"] not in used]
    if not available:
        QUESTION_USED[smart_id] = set()
        available = QUESTIONS[category].copy()
    question = random.choice(available)
    QUESTION_USED.setdefault(smart_id, set()).add(question["id"])
    token = smind_create_question_token(question["id"])
    await websocket.send(json.dumps({
        "type": "question",
        "category": category,
        "data": question,
        "token": token
    }))
    return question["id"], token

async def credit_player(user_id, amount):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            await conn.commit()

@app.websocket("/ws/sbattle")
async def sbattle_ws():
    try:
        # Vérifier connexion
        if "user_id" not in session:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Utilisateur non connecté"
            }))
            return
        user_id = session["user_id"]
        smart_id = generate_smart_id(user_id)

        # Attendre START + BET
        start_msg = await websocket.receive()
        start_msg = json.loads(start_msg)
        if start_msg.get("type") != "start":
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Message de démarrage invalide"
            }))
            return

        bet = start_msg.get("bet")
        if not isinstance(bet, (int, float)) or bet < 100:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Bet invalide (minimum 100)"
            }))
            return

        # Initialiser stats joueur
        PLAYER_STATS[smart_id] = {"total": 0, "correct": 0, "wrong": 0, "score": 0}
        QUESTION_USED[smart_id] = set()
        await load_questions()

        # Parcourir catégories
        for category in CATEGORIES_ORDER:
            start_time = time.monotonic()
            await websocket.send(json.dumps({
                "type": "category_start",
                "category": category,
                "duration": CATEGORY_DURATION
            }))

            while time.monotonic() - start_time < CATEGORY_DURATION:
                qid, token = await send_question(category, smart_id)

                # attendre la réponse ou timeout catégorie
                while True:
                    remaining = CATEGORY_DURATION - (time.monotonic() - start_time)
                    if remaining <= 0:
                        break
                    try:
                        msg = await asyncio.wait_for(websocket.receive(), timeout=remaining)
                    except asyncio.TimeoutError:
                        break

                    data = json.loads(msg)
                    if data.get("type") != "answer" or data.get("question_id") != qid:
                        continue

                    recv_token = data.get("token")
                    if not smind_verify_question_token(qid, recv_token):
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "Token invalide. Triche détectée."
                        }))
                        continue

                    selected = data["selected"]
                    stats = PLAYER_STATS[smart_id]
                    stats["total"] += 1
                    if selected == ANSWER_KEY.get(qid):
                        stats["correct"] += 1
                        stats["score"] += CATEGORY_POINTS[category]
                    else:
                        stats["wrong"] += 1

                    await websocket.send(json.dumps({
                        "type": "result",
                        "question_id": qid,
                        "correct": selected == ANSWER_KEY.get(qid),
                        "score": stats["score"],
                        "stats": stats
                    }))
                    break  # envoyer question suivante

            await websocket.send(json.dumps({
                "type": "category_end",
                "category": category
            }))

        # FIN DE LA PARTIE / GAIN
        stats = PLAYER_STATS[smart_id]
        total_score = stats["score"]
        gain = 0
        winner = total_score > 150
        if winner:
            total_q = stats["total"]
            divisor = total_q if total_q < 50 else 40
            gain = bet * 2 / divisor * stats["correct"]
            await credit_player(user_id, gain)

        await websocket.send(json.dumps({
            "type": "game_over",
            "score": total_score,
            "stats": stats,
            "gain": gain,
            "winner": winner
        }))

        # Cleanup
        del PLAYER_STATS[smart_id]
        del QUESTION_USED[smart_id]

    except Exception as e:
        await websocket.send(json.dumps({
            "type": "error",
            "message": str(e)
        }))


# --- Décrémenter les vies Smart Battle ---
@app.route('/decrement_Sbattle', methods=['POST'])
async def decrement_Sbattle():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # SELECT ... FOR UPDATE
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s FOR UPDATE",
                    ('Smart Battle', user_id)
                )
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter les vies
                await cur.execute(
                    "UPDATE game_settings SET vies = vies - 1 WHERE product_name=%s AND user_id=%s",
                    ('Smart Battle', user_id)
                )
                await conn.commit()

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

            except Exception as e:
                await conn.rollback()
                return jsonify({'success': False, 'error': str(e)}), 500


# --- Récupérer les vies Smart Battle ---
@app.route('/get_Sbattle', methods=['GET'])
async def get_Sbattlle():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    "SELECT vies FROM game_settings WHERE product_name=%s AND user_id=%s",
                    ('Smart Battle', user_id)
                )
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Smart Battle'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Smart Battle',
                        'message': 'Configuration par défaut appliquée'
                    })
            except Exception as e:
                return jsonify({
                    'error': str(e),
                    'product': 'Smart Battle'
                }), 500

# -----------------------------------
# SYSRTEME DE JEUX DE FALLING TILES
# -----------------------------------
# Stockage des données de jeu en mémoire
user_game_data: Dict[str, Dict[str, Any]] = {}

# Stockage des tokens HMAC
game_tokens: Dict[str, str] = {}  # falling_id -> token

class GameManager:
    @staticmethod
    def initialize_game(falling_id: str) -> Dict[str, Any]:
        """Initialise une nouvelle partie pour un joueur."""
        
        game_data = {
            # Statistiques de tuiles
            'tiles_created': 0,
            'tiles_clicked': 0,
            'tiles_missed': 0,
            
            # État du jeu
            'score': 0,
            'lives': 3,
            'game_time': 0,
            'current_bet': 0,
            'difficulty_level': 1,
            'base_speed': 0.5,
            'current_speed': 0.5,
            'base_spawn_interval': 1000,
            'current_spawn_interval': 1000,
            'is_game_running': False,
            
            # Gains et récompenses
            'winnings': 0,
            'total_winnings': 0,
            'bonus': 0,
            
            # Objectif
            'current_objective': None,
            'current_tiles_id': None,
            'objective_completed': False,
            'objective_progress': 0,
            
            # Paramètres de difficulté
            'last_difficulty_increase_time': 0,
            
            # Date de création
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat()
        }
        
        user_game_data[falling_id] = game_data
        return game_data
    
    @staticmethod
    def create_game_token(falling_id: str) -> str:
        """Crée un token HMAC pour sécuriser la partie."""
        token = create_hmac_token(falling_id)
        game_tokens[falling_id] = token
        return token
    
    @staticmethod
    def verify_game_token(falling_id: str, token: str) -> bool:
        """Vérifie si le token HMAC est valide."""
        
        if falling_id not in game_tokens:
            return False
        
        expected_token = game_tokens[falling_id]
        is_valid = verify_hmac_token(falling_id, token)
        
        return is_valid

    @staticmethod
    def calculate_difficulty(game_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcule la difficulté basée sur le temps de jeu."""
        game_time = game_data['game_time']
        difficulty_level = game_data['difficulty_level']
        
        # Augmenter la difficulté toutes les 15 secondes
        if game_time > 0 and game_time % 15 == 0:
            if game_time != game_data['last_difficulty_increase_time']:
                difficulty_level += 1
                game_data['difficulty_level'] = difficulty_level
                game_data['last_difficulty_increase_time'] = game_time
                
                base_speed = game_data['base_speed']
                base_spawn_interval = game_data['base_spawn_interval']
                
                game_data['current_speed'] = base_speed * (1 + (difficulty_level * 0.1))
                game_data['current_spawn_interval'] = max(250, base_spawn_interval * (1 - (difficulty_level * 0.08)))
                
        return game_data
    
    @staticmethod
    def tile_clicked(falling_id: str) -> Dict[str, Any]:
        """Gère le clic sur une tuile."""
        
        if falling_id not in user_game_data:
            return {'success': False, 'error': 'Partie non trouvée'}
        
        game_data = user_game_data[falling_id]
        
        # Mettre à jour les statistiques
        game_data['tiles_clicked'] += 1
        game_data['score'] += 1
        
        game_data['last_updated'] = datetime.now().isoformat()

        return {
            'success': True,
            'score': game_data['score'],
            'tiles_clicked': game_data['tiles_clicked'],
            'stats': {
                'tiles_created': game_data['tiles_created'],
                'tiles_clicked': game_data['tiles_clicked'],
                'tiles_missed': game_data['tiles_missed']
            }
        }
    
    @staticmethod
    def tile_missed(falling_id: str) -> Dict[str, Any]:
        """Gère une tuile manquée."""
        
        if falling_id not in user_game_data:
            return {'success': False, 'error': 'Partie non trouvée'}
        
        game_data = user_game_data[falling_id]
        
        # Mettre à jour les statistiques
        game_data['tiles_missed'] += 1
        
        # Diminuer les vies
        game_data['lives'] -= 1
        lives = game_data['lives']
        
        game_data['last_updated'] = datetime.now().isoformat()
        
        return {
            'success': True,
            'lives': lives,
            'game_over': lives <= 0,
            'stats': {
                'tiles_created': game_data['tiles_created'],
                'tiles_clicked': game_data['tiles_clicked'],
                'tiles_missed': game_data['tiles_missed']
            }
        }
    
    @staticmethod
    def update_game_time(falling_id: str, time_increment: int = 1) -> Dict[str, Any]:
        """Met à jour le temps de jeu."""

        if falling_id not in user_game_data:
            return {'success': False, 'error': 'Partie non trouvée'}
        
        game_data = user_game_data[falling_id]
        game_data['game_time'] += time_increment
        
        # Calculer la difficulté
        game_data = GameManager.calculate_difficulty(game_data)
        
        game_data['last_updated'] = datetime.now().isoformat()
        
        return {
            'success': True,
            'game_time': game_data['game_time'],
            'difficulty_level': game_data['difficulty_level'],
            'current_speed': game_data['current_speed'],
            'current_spawn_interval': game_data['current_spawn_interval']
        }
    
    @staticmethod
    async def end_game_with_objective(falling_id: str, user_id: int) -> Dict[str, Any]:
        """Termine la partie quand l'objectif est atteint et crédite le joueur."""
        
        if falling_id not in user_game_data:
            return {'success': False, 'error': 'Partie non trouvée'}
        
        game_data = user_game_data[falling_id]
        
        # Arrêter le jeu
        game_data['is_game_running'] = False
        
        # Calculer les gains (bet * 2)
        current_bet = game_data.get('current_bet', 0)
        gains = current_bet * 2
        
        game_data['bonus'] = gains
        game_data['total_winnings'] = gains
        game_data['objective_completed'] = True
        game_data['last_updated'] = datetime.now().isoformat()

        # Créditer le joueur dans la base de données
        try:
            await credit_falling(user_id, gains)
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur crédit: {str(e)}'
            }
        
        # Nettoyer le token après la fin de partie
        if falling_id in game_tokens:
            del game_tokens[falling_id]

        return {
            'success': True,
            'score': game_data['score'],
            'game_time': game_data['game_time'],
            'gains': gains,
            'bonus': gains,
            'total_winnings': gains,
            'objective_completed': True,
            'message': f'Objectif atteint ! Vous avez gagné {gains} XOF',
            'stats': {
                'tiles_created': game_data['tiles_created'],
                'tiles_clicked': game_data['tiles_clicked'],
                'tiles_missed': game_data['tiles_missed']
            },
            'game_data': game_data
        }
    
    @staticmethod
    def end_game_normal(falling_id: str) -> Dict[str, Any]:
        """Termine la partie normalement (sans objectif atteint)."""
        
        if falling_id not in user_game_data:
            return {'success': False, 'error': 'Partie non trouvée'}
        
        game_data = user_game_data[falling_id]
        
        # Arrêter le jeu
        game_data['is_game_running'] = False
        
        # Pas de gains si objectif non atteint
        game_data['total_winnings'] = 0
        game_data['bonus'] = 0
        game_data['last_updated'] = datetime.now().isoformat()
        
        # Nettoyer le token après la fin de partie
        if falling_id in game_tokens:
            del game_tokens[falling_id]

        return {
            'success': True,
            'score': game_data['score'],
            'game_time': game_data['game_time'],
            'gains': 0,
            'bonus': 0,
            'total_winnings': 0,
            'objective_completed': game_data['objective_completed'],
            'message': 'Partie terminée',
            'stats': {
                'tiles_created': game_data['tiles_created'],
                'tiles_clicked': game_data['tiles_clicked'],
                'tiles_missed': game_data['tiles_missed']
            },
            'game_data': game_data
        }
    
    @staticmethod
    def set_bet(falling_id: str, bet_amount: float) -> Dict[str, Any]:
        """Définit la mise pour la partie."""
        
        if falling_id not in user_game_data:
            return {'success': False, 'error': 'Partie non trouvée'}
        
        game_data = user_game_data[falling_id]
        game_data['current_bet'] = bet_amount
        game_data['last_updated'] = datetime.now().isoformat()
        
        
        return {'success': True, 'current_bet': bet_amount}
    
    @staticmethod
    def get_game_state(falling_id: str) -> Dict[str, Any]:
        """Récupère l'état actuel du jeu."""
        
        if falling_id not in user_game_data:
            return {'success': False, 'error': 'Partie non trouvée'}
        
        
        return {'success': True, 'game_data': user_game_data[falling_id]}

class ObjectiveGenerator:
    @staticmethod
    def generate_objective() -> Dict[str, Any]:
        """Génère un objectif aléatoire."""
        objective_types = ['score', 'time']
        objective_type = random.choice(objective_types)
        
        if objective_type == 'score':
            target = random.randint(90, 300)
            description = "Atteignez le score cible !"
            unit = "points"
        else:
            target = random.randint(60, 300)
            description = "Survivez pendant la durée cible !"
            unit = "secondes"
        
        reward = "Mise DOUBLÉE"
        
        objective = {
            'type': objective_type,
            'target': target,
            'description': description,
            'reward': reward,
            'unit': unit,
            'created_at': datetime.now().isoformat()
        }
        
        return objective

def create_hmac_token(falling_id: str) -> str:
    """Crée un token HMAC pour sécuriser une partie."""
    
    token = hmac.new(
        SECRET_KEY,
        str(falling_id).encode(),
        hashlib.sha256
    ).hexdigest()
    
    
    return token

def verify_hmac_token(falling_id: str, token: str) -> bool:
    """Vérifie si un token HMAC est valide."""
    expected = create_hmac_token(falling_id)
    is_valid = hmac.compare_digest(expected, token)
    
    return is_valid

async def credit_falling(user_id, amount):
    """Crédite le joueur dans la base de données MySQL."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE solde SET solde = solde + %s WHERE user_id = %s",
                (amount, user_id)
            )
            await conn.commit()

def verify_request_token(falling_id: str, data: Dict[str, Any]) -> bool:
    """Vérifie le token dans une requête WebSocket."""
    
    if 'hmac_token' not in data:
        return False
    
    token = data['hmac_token']
    result = GameManager.verify_game_token(falling_id, token)
    
    
    return result

@app.websocket('/ws/falling')
async def falling_ws():
    """
    WebSocket qui gère toutes les logiques de jeu avec sécurité HMAC.
    """
    
    # Vérifier que l'utilisateur est authentifié
    user_id = session.get('user_id')
    if not user_id:
        await websocket.send(json.dumps({
            'success': False,
            'error': 'Utilisateur non authentifié'
        }))
        return

    # Générer un falling_id unique pour ce joueur
    falling_id = str(uuid.uuid4())
    
    # Initialiser une nouvelle partie
    GameManager.initialize_game(falling_id)
    
    # Générer un token HMAC pour cette partie
    hmac_token = GameManager.create_game_token(falling_id)
    
    await websocket.send(json.dumps({
        "message": f"Connecté avec falling_id {falling_id}",
        "falling_id": falling_id,
        "hmac_token": hmac_token,
        "success": True
    }))

    try:
        while True:
            data_str = await websocket.receive()
            data = json.loads(data_str)
            action = data.get('action')
            

            # Vérifier le token HMAC pour toutes les actions sauf start_game
            if action != 'start_game':
                if not verify_request_token(falling_id, data):
                    await websocket.send(json.dumps({
                        'success': False,
                        'error': 'Token de sécurité invalide'
                    }))
                    continue

            if action == 'start_game':
                # Démarrer la partie
                if falling_id not in user_game_data:
                    GameManager.initialize_game(falling_id)
                
                game_data = user_game_data[falling_id]
                game_data['is_game_running'] = True
                game_data['last_updated'] = datetime.now().isoformat()
                
                await websocket.send(json.dumps({
                    'success': True,
                    'message': 'Partie démarrée',
                    'game_state': {
                        'score': game_data['score'],
                        'lives': game_data['lives'],
                        'game_time': game_data['game_time'],
                        'difficulty_level': game_data['difficulty_level']
                    }
                }))

            elif action == 'tile_created':
                # Une nouvelle tuile a été créée
                if falling_id in user_game_data:
                    user_game_data[falling_id]['tiles_created'] += 1
                    stats = {
                        'tiles_created': user_game_data[falling_id]['tiles_created'],
                        'tiles_clicked': user_game_data[falling_id]['tiles_clicked'],
                        'tiles_missed': user_game_data[falling_id]['tiles_missed']
                    }
                await websocket.send(json.dumps({
                    'success': True,
                    'message': 'Tuile créée enregistrée',
                    'stats': stats if 'stats' in locals() else {}
                }))

            elif action == 'tile_clicked':
                # Une tuile a été cliquée
                result = GameManager.tile_clicked(falling_id)
                
                # Si un objectif est actif, mettre à jour la progression
                game_data = user_game_data.get(falling_id)
                if (game_data and game_data.get('current_objective') 
                    and game_data['current_objective']['type'] == 'score'):
                    
                    # Mettre à jour l'objectif score
                    objective_result = update_objective_progress(
                        falling_id, 
                        game_data['current_tiles_id'], 
                        game_data['score'], 
                        'score'
                    )
                    result['objective_update'] = objective_result
                    
                    # Si l'objectif est atteint, terminer la partie et créditer
                    if objective_result.get('completed'):
                        # Terminer la partie avec objectif atteint
                        end_result = await GameManager.end_game_with_objective(falling_id, user_id)
                        result['game_ended'] = end_result
                
                await websocket.send(json.dumps(result))

            elif action == 'tile_missed':
                # Une tuile a été manquée
                result = GameManager.tile_missed(falling_id)
                
                # Vérifier si la partie est terminée (vies épuisées)
                if result.get('game_over'):
                    # Terminer la partie normalement
                    end_result = GameManager.end_game_normal(falling_id)
                    result['game_ended'] = end_result
                
                await websocket.send(json.dumps(result))

            elif action == 'update_time':
                # Mettre à jour le temps de jeu
                time_increment = data.get('time_increment', 1)
                result = GameManager.update_game_time(falling_id, time_increment)
                
                # Si un objectif est actif, mettre à jour la progression
                game_data = user_game_data.get(falling_id)
                if (game_data and game_data.get('current_objective') 
                    and game_data['current_objective']['type'] == 'time'):
                    
                    # Mettre à jour l'objectif temps
                    objective_result = update_objective_progress(
                        falling_id, 
                        game_data['current_tiles_id'], 
                        game_data['game_time'], 
                        'time'
                    )
                    result['objective_update'] = objective_result
                    
                    # Si l'objectif est atteint, terminer la partie et créditer
                    if objective_result.get('completed'):
                        # Terminer la partie avec objectif atteint
                        end_result = await GameManager.end_game_with_objective(falling_id, user_id)
                        result['game_ended'] = end_result
                
                await websocket.send(json.dumps(result))

            elif action == 'set_bet':
                # Définir la mise
                bet_amount = data.get('bet_amount', 0)
                result = GameManager.set_bet(falling_id, bet_amount)
                await websocket.send(json.dumps(result))

            elif action == 'get_game_state':
                # Récupérer l'état du jeu
                result = GameManager.get_game_state(falling_id)
                await websocket.send(json.dumps(result))

            elif action == 'end_game':
                # Terminer la partie manuellement
                await websocket.send(json.dumps(result))

            elif action == 'generate_objective':
                # Générer un nouvel objectif
                objective = ObjectiveGenerator.generate_objective()
                tiles_id = str(uuid.uuid4())
                
                if falling_id not in user_game_data:
                    GameManager.initialize_game(falling_id)
                
                game_data = user_game_data[falling_id]
                game_data['current_objective'] = objective
                game_data['current_tiles_id'] = tiles_id
                game_data['objective_completed'] = False
                game_data['objective_progress'] = 0
                game_data['bonus'] = 0
                
                await websocket.send(json.dumps({
                    'success': True,
                    'tiles_id': tiles_id,
                    'objective': objective,
                    'message': 'Objectif généré avec succès!'
                }))

            elif action == 'update_objective':
                # Mettre à jour la progression d'un objectif
                tiles_id = data.get('tiles_id')
                progress_value = data.get('progress_value', 0)
                progress_type = data.get('progress_type', 'score')
                
                result = update_objective_progress(falling_id, tiles_id, progress_value, progress_type)
                
                # Si l'objectif est atteint, terminer la partie et créditer
                if result.get('completed'):
                    end_result = await GameManager.end_game_with_objective(falling_id, user_id)
                    result['game_ended'] = end_result
                
                await websocket.send(json.dumps(result))

            elif action == 'get_stats':
                # Récupérer les statistiques
                if falling_id in user_game_data:
                    game_data = user_game_data[falling_id]
                    stats = {
                        'tiles_created': game_data['tiles_created'],
                        'tiles_clicked': game_data['tiles_clicked'],
                        'tiles_missed': game_data['tiles_missed'],
                        'score': game_data['score'],
                        'lives': game_data['lives'],
                        'game_time': game_data['game_time'],
                        'difficulty_level': game_data['difficulty_level']
                    }
                    await websocket.send(json.dumps({
                        'success': True,
                        'stats': stats,
                        'message': 'Statistiques récupérées'
                    }))
                else:
                    await websocket.send(json.dumps({
                        'success': False,
                        'error': 'Partie non trouvée'
                    }))

            else:
                await websocket.send(json.dumps({
                    'success': False,
                    'error': 'Action inconnue'
                }))

    except Exception as e:
        pass
        await websocket.send(json.dumps({'success': False, 'error': str(e)}))

def update_objective_progress(falling_id: str, tiles_id: str, progress_value: int, progress_type: str) -> Dict[str, Any]:
    """Met à jour la progression d'un objectif."""
    
    if (falling_id not in user_game_data or 
        not user_game_data[falling_id].get('current_objective') or
        user_game_data[falling_id].get('current_tiles_id') != tiles_id):
        return {'success': False, 'error': 'Objectif non trouvé'}
    
    game_data = user_game_data[falling_id]
    objective = game_data['current_objective']
    
    # Vérifier que le type correspond
    if objective['type'] != progress_type:
        return {'success': False, 'error': f'Type de progression incompatible. Attendu: {objective["type"]}, Reçu: {progress_type}'}
    
    game_data['objective_progress'] = progress_value
    
    # Vérifier si l'objectif est atteint
    completed = progress_value >= objective['target']
    
    return {
        'success': True,
        'tiles_id': tiles_id,
        'progress': progress_value,
        'completed': completed,
        'target': objective['target'],
        'message': 'Objectif atteint !' if completed else 'Progression mise à jour'
    }


# --- Décrémenter une vie ---
@app.route('/decrement_tiles', methods=['POST'])
async def decrement_tiles():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']

    pool = await get_pool()
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # On bloque la ligne le temps de la transaction
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Falling Tiles' AND user_id = %s
                    FOR UPDATE
                """, (user_id,))
                result = await cur.fetchone()

                if not result:
                    return jsonify({
                        'success': False,
                        'error': 'Paramètres de jeu non trouvés',
                        'remaining_lives': 0
                    }), 404

                remaining_lives = result[0]
                if remaining_lives <= 0:
                    return jsonify({
                        'success': False,
                        'error': 'Plus de vies disponibles',
                        'remaining_lives': 0
                    })

                # Décrémenter
                await cur.execute("""
                    UPDATE game_settings 
                    SET vies = vies - 1 
                    WHERE product_name = 'Falling Tiles' AND user_id = %s
                """, (user_id,))

                # ✅ pas besoin de commit si autocommit=True dans le pool

                return jsonify({
                    'success': True,
                    'remaining_lives': remaining_lives - 1
                })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


# --- Récupérer les vies ---
@app.route('/get_tiles', methods=['GET'])
async def get_tiles():
    if 'user_id' not in session:
        return jsonify({'error': 'Utilisateur non connecté'}), 401

    user_id = session['user_id']

    pool = await get_pool()
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT vies 
                    FROM game_settings 
                    WHERE product_name = 'Falling Tiles' AND user_id = %s
                """, (user_id,))
                result = await cur.fetchone()

                if result:
                    return jsonify({
                        'lives': result[0],
                        'product': 'Falling Tiles'
                    })
                else:
                    return jsonify({
                        'lives': 0,
                        'product': 'Falling Tiles',
                        'message': 'Configuration par défaut appliquée'
                    })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'product': 'Falling Tiles'
        }), 500







# -----------------------------------
# ROUTE POUR JOUER / MISER
# -----------------------------------


#def track_mise():

#    def decorator(func):
#        @wraps(func)
#        async def wrapper(*args, **kwargs):
#            pool = await get_pool()
#            async with pool.acquire() as conn:
#                async with conn.cursor() as cursor:
#                    try:
                        # Vérifier si la colonne total_mises_count existe
#                        await cursor.execute("""
#                            SHOW COLUMNS FROM feeds LIKE 'total_mises_count'
#                        """)
#                        column_exists = await cursor.fetchone()

#                        if not column_exists:
                            # ajouter la colonne si elle n'existe pas
#                            await cursor.execute("""
#                                ALTER TABLE feeds
#                                ADD COLUMN total_mises_count INT NOT NULL DEFAULT 0
#                            """)

                        # Vérifier si la ligne id=1 existe
#                        await cursor.execute("SELECT id FROM feeds WHERE id = 1")
#                        result = await cursor.fetchone()
#                        if not result:
                            # créer la ligne si elle n'existe pas
#                            await cursor.execute("""
#                                INSERT INTO feeds (id, total_mises_count, last_updated)
#                                VALUES (1, 0, NOW())
#                            """)

                        # Incrémenter total_mises_count
#                        await cursor.execute("""
#                            UPDATE feeds
#                            SET total_mises_count = total_mises_count + 1,
#                                last_updated = NOW()
#                            WHERE id = 1
#                        """)
#                    except Exception as e:
#                        pass

            # exécuter la fonction décorée
#            return await func(*args, **kwargs)

#        return wrapper
#    return decorator

@app.route('/cherif', methods=['POST'])
@track_mise()
async def cherif():
    try:
        # 1️⃣ Vérification utilisateur connecté
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        # 2️⃣ Données envoyées par le frontend
        data = await request.get_json()
        bet_raw = data.get("bet")

        if not bet_raw:
            return jsonify({
                "success": False,
                "error": "Mise manquante"
            }), 400

        try:
            bet = float(bet_raw)
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Mise invalide"
            }), 400

        if bet <= 99:
            return jsonify({
                "success": False,
                "error": "La mise doit être supérieure à 99"
            }), 400 

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:

                # 3️⃣ Récupération du solde
                await cursor.execute(
                    "SELECT solde FROM solde WHERE user_id=%s LIMIT 1",
                    (user_id,)
                )
                solde_row = await cursor.fetchone()

                if not solde_row:
                    return jsonify({
                        "success": False,
                        "error": "Solde introuvable"
                    }), 404

                solde_avant = float(solde_row[0])

                # 4️⃣ Vérification solde suffisant
                if bet > solde_avant:
                    return jsonify({
                        "success": False,
                        "error": "Solde insuffisant"
                    }), 400

                # 5️⃣ Calcul du nouveau solde
                solde_apres = solde_avant - bet

                # 6️⃣ Mise à jour du solde
                await cursor.execute(
                    "UPDATE solde SET solde=%s WHERE user_id=%s",
                    (solde_apres, user_id)
                )

                # 7️⃣ Récupération du nom utilisateur
                await cursor.execute(
                    "SELECT name FROM users WHERE id=%s LIMIT 1",
                    (user_id,)
                )
                user_row = await cursor.fetchone()
                user_name = user_row[0] if user_row else f"Utilisateur #{user_id}"

                # 8️⃣ Génération du texte historique
                now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

                description = (
                    f"Le joueur {user_name} (ID {user_id}) "
                    f"a misé {bet} XOF le {now_str}. "
                    f"Son solde avant la mise était {solde_avant} XOF "
                    f"et son nouveau solde est de {solde_apres} XOF."
                )

                # 9️⃣ Insertion dans bets_history
                await cursor.execute(
                    """
                    INSERT INTO bets_history
                    (user_id, mise, solde_avant, solde_apres, description, created_at)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                    """,
                    (user_id, bet, solde_avant, solde_apres, description)
                )

                await conn.commit()

        # 🔟 Réponse propre au frontend
        return jsonify({
            "success": True,
            "message": "Mise effectuée avec succès",
            "bet": bet,
            "new_solde": solde_apres
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# =============================================
# SECTION DE DEPOT ( TRANSACTION DEPOT )
# =============================================

import hmac
from quart import request, session, jsonify, current_app

# --- Clés et variables d'environnement ---
HMAC_KEY = os.environ.get("TOKENS_HMAC_KEY")
if HMAC_KEY is None:
    raise RuntimeError("TOKENS_HMAC_KEY non défini dans les env")
HMAC_KEY = HMAC_KEY.encode()  # bytes

FEDAPAY_SECRET = os.environ.get("FEDAPAY_SECRET")
API_URL = os.environ.get("API_URL")

# --- Endpoint création transaction ---
@app.route("/create-transaction", methods=["POST"])
async def create_transaction():
    data = await request.get_json()
    user_id = session.get("user_id")

    # Vérifications
    if not user_id:
        return jsonify({"status": "error", "message": "Utilisateur non connecté"}), 401

    amount = data.get("amount")
    try:
        amount = float(amount)
    except Exception:
        return jsonify({"status": "error", "message": "Montant invalide"}), 400
    if amount < 10:
        return jsonify({"status": "error", "message": "Montant minimal = 100 FCFA"}), 400

    # --- Génération du token ---
    token_plain = secrets.token_urlsafe(32)  # token à donner au client
    token_hmac = hmac.new(HMAC_KEY, token_plain.encode(), hashlib.sha256).hexdigest()

    # --- Construire le callback_url avec le token ---
    callback_url = f"http://127.0.0.1:5000/callbackss/{token_plain}"

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=5)

    # --- Préparer payload pour prestataire ---
    payload = {
        "amount": amount,
        "currency": {"iso": "XOF"},
        "description": f"Dépôt de {amount} FCFA",
        "callback_url": callback_url,
        "metadata": {"user_id": user_id}
    }
    headers = {"Authorization": f"Bearer {FEDAPAY_SECRET}"}

    # --- Appel API prestataire ---
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

    # --- Insérer token HMAC dans DB ---
    pool = await get_pool()  # ✅ await le pool
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            insert_sql = """
            INSERT INTO tokens (user_id, amount, token, created_at, expires_at)
            VALUES (%s, %s, %s, %s, %s)
            """
            await cur.execute(
                insert_sql,
                (
                    user_id,
                    amount,
                    token_hmac,
                    now.strftime("%Y-%m-%d %H:%M:%S"),
                    expires_at.strftime("%Y-%m-%d %H:%M:%S")
                )
            )
        await conn.commit()

    # --- Retourner les infos au frontend ---
    return jsonify({
        "status": "success",
        "payment_url": payment_url,
        "payment_token": payment_token,
        "transaction_token": token_plain,  # token à garder côté client
        "expires_at": expires_at.isoformat()
    }), 201

############Deuxieme partie du depot qui gere la verification quand fedapay redirige vers /callbackss avec le statut et l'id du transfer .#
################################################################7

@app.route("/callbackss/<transaction_token>", methods=["GET", "POST"])
async def callbackss(transaction_token):
    """
    Callback sécurisé Fedapay :
    - Vérifie HMAC et expiration du token
    - Vérifie que le status est 'success' ou 'approved'
    - Vérifie que l'id Fedapay n'existe pas encore
    """
    try:
        user_id = session.get("user_id")
        if not user_id:
            return redirect("/recharger")

        # --- Récupérer paramètres Fedapay ---
        status = request.args.get("status")
        feda_id = request.args.get("id")  # id fourni par Fedapay

        # --- Vérifications initiales ---
        if status not in ("success", "approved"):
            return redirect("/recharger")

        if not feda_id or not feda_id.isdigit():
            return redirect("/recharger")

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:

                # --- Vérifier que l'id n'existe pas déjà ---
                await cur.execute(
                    "SELECT 1 FROM mobile_money WHERE transaction_id=%s",
                    (feda_id,)
                )
                exists = await cur.fetchone()
                if exists:
                    return redirect("/recharger")

                # --- Récupérer la dernière transaction token pour ce user ---
                await cur.execute(
                    """
                    SELECT id, amount, token, expires_at
                    FROM tokens
                    WHERE user_id=%s
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                    (user_id,)
                )
                row = await cur.fetchone()
                if not row:
                    return redirect("/recharger")

                token_id, amount_db, token_hmac_db, expires_at = row

                # --- Vérifier HMAC du token ---
                token_hmac_calc = hmac.new(HMAC_KEY, transaction_token.encode(), hashlib.sha256).hexdigest()
                if not hmac.compare_digest(token_hmac_calc, token_hmac_db):
                    return redirect("/recharger")

                # --- Vérifier expiration (UTC aware) ---
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                if now > expires_at:
                    await cur.execute("DELETE FROM tokens WHERE id=%s", (token_id,))
                    await conn.commit()
                    return redirect("/recharger")

                # --- Créditer le solde ---
                await cur.execute("SELECT solde FROM solde WHERE user_id=%s", (user_id,))
                row_solde = await cur.fetchone()
                if row_solde:
                    new_solde = row_solde[0] + amount_db
                    await cur.execute("UPDATE solde SET solde=%s WHERE user_id=%s", (new_solde, user_id))
                else:
                    new_solde = amount_db
                    await cur.execute("INSERT INTO solde (user_id, solde) VALUES (%s, %s)", (user_id, new_solde))

                # --- Journaliser la transaction ---
                msg = (
                    f"Vous avez effectué un dépôt de {amount_db} FCFA "
                    f"le {now.strftime('%d/%m/%Y %H:%M:%S')}. "
                    f"Votre solde actuel est de {new_solde} FCFA."
                )
                await cur.execute(
                    """
                    INSERT INTO mobile_money (user_id, amount, solde, message, transaction_id)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (user_id, amount_db, new_solde, msg, feda_id)
                )

                # --- Supprimer le token utilisé ---
                await cur.execute("DELETE FROM tokens WHERE id=%s", (token_id,))

                # --- Mise à jour stats globales dépôts dans feeds ---
                await cur.execute("""
                    INSERT INTO feeds (id, total_deposits_count, total_deposits_amount, last_updated)
                    VALUES (1, 1, %s, NOW())
                    ON DUPLICATE KEY UPDATE
                        total_deposits_count = total_deposits_count + 1,
                        total_deposits_amount = total_deposits_amount + %s,
                        last_updated = NOW()
                """, (amount_db, amount_db))

                await conn.commit()

        return redirect("/recharger")

    except Exception as e:
        return redirect("/recharger")


# =============================================
# SECTION DE RETRAIT ( PAYOUT )
# =============================================


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

            # tout est ok, on passe à la route
            return await func(*args, **kwargs)

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

@app.route('/create-payout', methods=['POST'])
@depot_required()
async def create_payout():
    try:
        
        # Vérification session utilisateur
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        # Récupération des données de la requête
        data = await request.get_json()
        
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        phone = data.get("phone")
        network = data.get("network")
        amount_raw = data.get("amount")

        # Vérification des champs obligatoires
        if not all([firstname, lastname, email, phone, amount_raw, network]):
            return jsonify({"success": False, "error": "Champs manquants"}), 400

        # Conversion sécurisée du montant
        try:
            amount_requested = float(amount_raw)
        except (TypeError, ValueError) as e:
            return jsonify({"success": False, "error": "Montant invalide"}), 400

        # Vérification du montant maximum
        if amount_requested > 500000:
            return jsonify({"success": False, "error": "Le montant maximum autorisé est de 500 000 XOF"}), 400

        # Calcul des frais
        internal_fee = calculate_internal_fee(amount_requested)
        fedapay_fee = calculate_fedapay_fee(amount_requested)
        total_fees = internal_fee + fedapay_fee
        net_received = amount_requested - total_fees

        if net_received <= 0:
            return jsonify({"success": False, "error": "Montant trop faible après application des frais"}), 400

        pool = await get_pool()
        
        # Vérification du solde utilisateur
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT solde FROM solde WHERE user_id=%s LIMIT 1", (user_id,))
                row = await cursor.fetchone()
                if not row:
                    return jsonify({"success": False, "error": "Solde introuvable"}), 404
                current_solde = float(row[0])
                if amount_requested > current_solde:
                    return jsonify({"success": False, "error": f"Solde insuffisant. Total requis : {amount_requested} XOF"}), 400

        # Préfixe international pour Bénin
        if not phone.startswith("+229"):
            phone = "+229" + phone

        # Vérification du réseau
        if network not in ["mtn", "moov", "celtiis"]:
            return jsonify({"success": False, "error": "Réseau invalide"}), 400

        # Heure programmée pour le payout
        scheduled_time = datetime.now(timezone.utc) + timedelta(minutes=5)
        scheduled_at = scheduled_time.isoformat().replace("+00:00", "Z")

        # Préparation du payload pour Fedapay
        payload = {
            "amount": int(amount_requested - internal_fee),
            "currency": {"iso": "XOF"},
            "customer": {
                "firstname": firstname,
                "lastname": lastname,
                "email": email,
                "phone_number": {
                    "country": "BJ",
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
            except Exception as e:
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
            # Chercher dans toutes les clés possibles
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
        except (TypeError, ValueError) as e:
            return jsonify({
                "success": False,
                "error": f"Veillez Réessayer"
            }), 500

        # === DÉMARRAGE IMMÉDIAT DU PAYOUT ===
        start_url = f"{FEDAPAY_API_URL}/start"
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
            except Exception as e:
                start_data = {
                    "status": start_response.status_code,
                    "raw_content": start_response.text
                }
        else:
            start_data = {
                "status": start_response.status_code,
                "message": "Réponse vide"
            }

        # Vérification si le démarrage a réussi
        start_success = start_response.status_code in [200, 201]

        # Mise à jour du solde, historique et feeds en une seule transaction
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Retrait du solde initial
                new_solde = current_solde - amount_requested
                await cursor.execute(
                    "UPDATE solde SET solde=%s WHERE user_id=%s",
                    (new_solde, user_id)
                )

                # Historique dans retraits
                contact_str = f"{firstname} {lastname} - {phone}"
                statut_retrait = "envoyé" if start_success else "créé"
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
                        total_payouts_count = total_payouts_count + 1,
                        total_payouts_amount = total_payouts_amount + %s,
                        last_updated = NOW()
                """, (amount_requested, amount_requested))

                await conn.commit()

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
            "create_response": response_data
        }

        if start_success:
            result["start_response"] = start_data
            return jsonify(result), 200
        else:
            result["start_error"] = start_data
            return jsonify(result), 207

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500



# --- Route async pour récupérer l’historique des dépôts ---
@app.route("/api/historique_", methods=["GET"])
async def historique_():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Utilisateur non connecté"}), 401

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT amount, date, solde, message
                    FROM mobile_money
                    WHERE user_id=%s
                    ORDER BY date DESC
                    """,
                    (user_id,)
                )
                rows = await cur.fetchall()

        # Transformation des données en dictionnaires
        historique = []
        for row in rows:
            historique.append({
                "amount": row[0],
                "date": row[1].strftime('%d/%m/%Y %H:%M:%S') if row[1] else None,
                "solde": row[2],
                "message": row[3]
            }) 

        return jsonify({"status": "success", "historique": historique})

    except Exception as e:
        print("Erreur récupération historique :", e)
        return jsonify({
            "status": "error",
            "message": "Impossible de récupérer l'historique"
        }), 500



# Liste des objectifs
objectifsss = [
    {"id": 1, "description": "Jouer pendant {temps} secondes"},
    {"id": 2, "description": "Tuer {ennemis} ennemis en {temps} secondes"},
    {"id": 3, "description": "Atteindre un score de {score}"},
    {"id": 4, "description": "Tuer {ennemis} ennemis"}
]

# --- Route 100% async ---
@app.route("/galaxyobj", methods=["GET"])
async def galaxyobj():
    obj = random.choice(objectifsss)
    result = {"id": obj["id"]}

    # Générer les valeurs aléatoires selon l'objectif
    if obj["id"] == 1:
        temps = random.randint(60, 300)
        result["description"] = obj["description"].format(temps=temps)
        result["temps"] = temps

    elif obj["id"] == 2:
        ennemis = random.randint(50, 300)
        temps = random.randint(70, 180)
        result["description"] = obj["description"].format(ennemis=ennemis, temps=temps)
        result["ennemis"] = ennemis
        result["temps"] = temps

    elif obj["id"] == 3:
        score = random.randint(300, 1000)
        result["description"] = obj["description"].format(score=score)
        result["score"] = score

    elif obj["id"] == 4:
        ennemis = random.randint(100, 500)
        result["description"] = obj["description"].format(ennemis=ennemis)
        result["ennemis"] = ennemis

    return jsonify(result)


#Section de l'admin #########################################
#################################################################
##########################################################################"
#####################################################################"
from functools import wraps

def admin_required():

    def decorator(func):

        @wraps(func)
        async def wrapper(*args, **kwargs):

            user_id = session.get("user_id")

            if user_id != 11:
                return jsonify({
                    "error": "Accès refusé"
                }), 403

            return await func(*args, **kwargs)

        return wrapper

    return decorator

# --- Route async pour récupérer tous les utilisateurs ---
@app.route('/get_users', methods=['GET'])
@admin_required()
async def get_users():
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute("""
                    SELECT u.id, u.name, u.email, u.created_at, u.picture, u.phone, 
                           u.password, s.solde, s.wari_id, v.code as verification_code
                    FROM users u
                    LEFT JOIN solde s ON u.id = s.user_id
                    LEFT JOIN verification_codes v ON u.id = v.user_id
                """)
                users = await cur.fetchall()

                users_list = []
                for user in users:
                    # filtrer si name ou created_at manquant
                    if not user[1] or not user[3]:
                        continue

                    users_list.append({
                        'id': user[0],
                        'name': user[1],
                        'email': user[2],
                        'created_at': user[3].strftime('%Y-%m-%d %H:%M:%S') if user[3] else None,
                        'picture': user[4],
                        'phone': user[5],
                        'password': user[6],  # Mot de passe en base64
                        'solde': float(user[7]) if user[7] is not None else 0,
                        'wari_id': user[8],
                        'verification_code': user[9]
                    })

                return jsonify(users_list)

            except Exception as e:
                return jsonify({'error': str(e)}), 500


import string


# décorateur admin_required déjà défini ailleurs
@app.route("/delete_user_data", methods=["POST"])
@admin_required()
async def delete_user_data():

    data = await request.get_json()
    target_user_id = data.get("user_id")
    code = data.get("code")  # le code envoyé par le frontend

    if not target_user_id or not code:
        return jsonify({"error": "user_id ou code manquant"}), 400

    if target_user_id == 11:
        return jsonify({"error": "Impossible de supprimer l'admin"}), 403

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            try:
                # récupérer le phone de l'admin (id=11)
                await cursor.execute("SELECT phone FROM users WHERE id = 11")
                admin_phone_result = await cursor.fetchone()
                
                if not admin_phone_result:
                    return jsonify({"error": "Admin introuvable"}), 500

                admin_phone = admin_phone_result[0]

                if code != admin_phone:
                    return jsonify({"error": "Code incorrect"}), 403

                # générer un email aléatoire
                random_email = ''.join(random.choices(string.ascii_letters + string.digits, k=12)) + "@example.com"

                # vider les données dans users sauf id
                await cursor.execute("""
                    UPDATE users
                    SET 
                        email = %s,
                        password = NULL,
                        name = NULL,
                        google_id = NULL,
                        created_at = NULL,
                        picture = NULL,
                        phone = NULL,
                        email_notifications = NULL,
                        verify = 0
                    WHERE id = %s
                """, (random_email, target_user_id))

                # supprimer les infos de solde liées au target_user_id
                await cursor.execute("""
                    DELETE FROM solde
                    WHERE user_id = %s
                """, (target_user_id,))

                # supprimer les bonus où pere_id = target_user_id
                await cursor.execute("""
                    DELETE FROM bonus
                    WHERE pere_id = %s
                """, (target_user_id,))

                return jsonify({
                    "status": "success",
                    "message": f"Utilisateur {target_user_id} vidé de la base, solde et bonus supprimés"
                })

            except Exception as e:
                return jsonify({"error": str(e)}), 500


@app.route("/feeds_data", methods=["GET"])
@admin_required()
async def feeds_data():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT total_payouts_amount, total_deposits_amount, total_mises_count FROM feeds WHERE id=1")
            row = await cursor.fetchone()
            if not row:
                return jsonify({"error": "Aucune donnée disponible"}), 404

            data = {
                "total_payouts": float(row[0]),   # ce que le site perd
                "total_deposits": float(row[1]),  # ce que le site gagne
                "total_mises": int(row[2])
            }
            return jsonify(data)


# --- Route async pour récupérer tous les retraits en attente ---
@app.route('/get_retraits', methods=['GET'])
@admin_required()
async def get_retraits():
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute("""
                    SELECT id, user_id, methode, montant, contact, statut, created_at, frais
                    FROM retraits
                    ORDER BY created_at DESC
                """)
                retraits = await cur.fetchall()

                retraits_list = []
                for r in retraits:
                    retraits_list.append({
                        'id': r[0],
                        'user_id': r[1],
                        'methode': r[2],
                        'montant': r[3],
                        'contact': r[4],
                        'statut': r[5],
                        'created_at': r[6].strftime('%Y-%m-%d %H:%M') if r[6] else None,
                        'frais': r[7]
                    })

                return jsonify(retraits_list)

            except Exception as e:
                return jsonify({'error': str(e)}), 500

@app.route("/get_pro", methods=["GET"])
@admin_required()
async def get_pro():

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            try:

                await cursor.execute("""
                    SELECT id, name, is_paid
                    FROM games_pro
                    ORDER BY id ASC
                """)

                rows = await cursor.fetchall()

                games = []

                for row in rows:
                    games.append({
                        "id": row[0],
                        "name": row[1],
                        "is_paid": bool(row[2])
                    })

                return jsonify(games)

            except Exception as e:
                return jsonify({"error": str(e)}), 500

@app.route("/make_game_free", methods=["POST"])
@admin_required()
async def make_game_free():

    data = await request.get_json()
    game_id = data.get("game_id")

    if not game_id:
        return jsonify({"error": "game_id manquant"}), 400

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            try:

                await cursor.execute("""
                    UPDATE games_pro
                    SET is_paid = 0
                    WHERE id = %s
                """, (game_id,))

                return jsonify({
                    "status": "success",
                    "message": f"Le jeu {game_id} est maintenant gratuit"
                })

            except Exception as e:
                return jsonify({"error": str(e)}), 500

@app.route('/get_', methods=['GET'])
@admin_required()
async def get_():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            try:
                # On interroge la table `mobile_money` au lieu de `transactions_ocr`
                await cur.execute("""
                    SELECT id, user_id, amount, date, solde, message
                    FROM mobile_money
                    ORDER BY date DESC
                """)
                results = await cur.fetchall()

                 = []
                for row in results:
                    # row : (id, user_id, amount, date, solde, message)
                    _id, user_id, amount, row_date, solde, message = row

                    # formatage de la date si c'est un datetime, sinon conversion en chaîne
                    try:
                        created_at = row_date.strftime('%Y-%m-%d %H:%M') if hasattr(row_date, "strftime") else str(row_date)
                    except Exception:
                        created_at = str(row_date)

                    .append({
                        'id': _id,
                        'user_id': user_id,
                        # champs compatibles avec l'ancien output
                        'transfer_id': None,
                        'amount': amount,
                        'montant': amount,               # si le front attend 'montant'
                        'method': None,
                        'text_extrait': message,         # on utilise message comme extrait
                        'image': "",                     # pas d'image dans mobile_money
                        'date': created_at,
                        'created_at': created_at,
                        'solde': solde
                    })

                return jsonify()
            except Exception as e:
                return jsonify({'error': str(e)}), 500

import traceback

@app.route('/get_what', methods=['GET'])
@admin_required()
async def get_what():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                print("🔗 Exécution de la requête SQL...")
                await cursor.execute("""
                    SELECT categorie, COUNT(*) AS nb_questions
                    FROM questions
                    GROUP BY categorie
                    ORDER BY categorie
                """)
                rows = await cursor.fetchall()
                counts = [{'categorie': r[0], 'nb_questions': r[1]} for r in rows]
                print(f"✅ Comptage récupéré : {counts}")
                return jsonify(counts)
    except Exception as e:
        import traceback
        print("❌ Erreur détectée !")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/get_questions_by_category', methods=['GET'])
@admin_required()
async def get_questions_by_category():
    try:
        # Récupérer le paramètre categorie depuis l'URL
        categorie = request.args.get('categorie')
        
        if not categorie:
            return jsonify({
                'success': False, 
                'error': 'Le paramètre "categorie" est requis'
            }), 400

        print(f"🔍 Récupération des questions pour la catégorie: {categorie}")

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:  # <-- plus de dictionary=True
                await cursor.execute("""
                    SELECT id, categorie, question, reponse
                    FROM questions 
                    WHERE categorie = %s
                    ORDER BY id
                """, (categorie,))
                
                rows = await cursor.fetchall()
                
                # Convertir les tuples en dictionnaires
                questions = [
                    {'id': r[0], 'categorie': r[1], 'question': r[2], 'reponse': r[3]} 
                    for r in rows
                ]
                
                print(f"✅ {len(questions)} questions trouvées pour la catégorie '{categorie}'")
                return jsonify(questions)
                
    except Exception as e:
        import traceback
        print(f"❌ Erreur lors de la récupération des questions pour '{categorie}':")
        traceback.print_exc()
        return jsonify({
            'success': False, 
            'error': f"Erreur serveur: {str(e)}"
        }), 500




@app.route('/get_settings', methods=['GET'])
@admin_required()
async def get_settings():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                print("🔗 Exécution de la requête SQL...")
                await cursor.execute("""
                    SELECT id, product_name, image_url, vies, duree_jours, renewal, user_id, created_at, renewal_start
                    FROM game_settings
                    ORDER BY id
                """)
                rows = await cursor.fetchall()

                # Conversion en dictionnaires
                games = [
                    {
                        'id': r[0],
                        'product_name': r[1],
                        'image_url': r[2],
                        'vies': r[3],
                        'duree_jours': r[4],
                        'renewal': r[5],
                        'user_id': r[6],
                        'created_at': r[7].strftime('%Y-%m-%d %H:%M:%S') if r[7] else None,
                        'renewal_start': r[8].strftime('%Y-%m-%d %H:%M:%S') if r[8] else None
                    }
                    for r in rows
                ]

                print(f"✅ {len(games)} jeux récupérés depuis la base")
                return jsonify(games)

    except Exception as e:
        print("❌ Erreur lors de la récupération des jeux :")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/gett_achats', methods=['GET'])
@admin_required()
async def gett_achats():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                print("🔗 Exécution de la requête SQL sur la table 'achats'...")
                await cursor.execute("""
                    SELECT id, user_id, produit, duree, vies, renouvellement, created_at, start_time
                    FROM achats
                    ORDER BY id DESC
                """)
                rows = await cursor.fetchall()

                # Transformation des tuples en dictionnaires
                achats_list = [
                    {
                        'id': r[0],
                        'user_id': r[1],
                        'produit': r[2],
                        'duree': r[3],
                        'vies': r[4],
                        'renouvellement': r[5],
                        'created_at': r[6].strftime('%Y-%m-%d %H:%M:%S') if r[6] else None,
                        'start_time': r[7].strftime('%Y-%m-%d %H:%M:%S') if r[7] else None
                    }
                    for r in rows
                ]

                print(f"✅ {len(achats_list)} achats récupérés depuis la base")
                return jsonify(achats_list)

    except Exception as e:
        print("❌ Erreur lors de la récupération des achats :")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500



# Route pour récupérer toutes les transactions
@app.route('/get_transactions_wallet', methods=['GET'])
@admin_required()
async def get_transactions_wallet():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Requête pour récupérer toutes les transactions
                await cursor.execute("""
                    SELECT id, sender_id, recipient_id, amount, transaction_type, status, created_at
                    FROM jeicke
                    ORDER BY created_at DESC
                """)
                rows = await cursor.fetchall()

                # Convertir en liste de dictionnaires
                transactions = []
                for row in rows:
                    transactions.append({
                        'id': row[0],
                        'sender_id': row[1],
                        'recipient_id': row[2],
                        'amount': float(row[3]),
                        'transaction_type': row[4],
                        'status': row[5],
                        'created_at': row[6].strftime('%Y-%m-%d %H:%M:%S') if row[6] else None
                    })

                return jsonify(transactions)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500



# ✅ Récupérer tous les achats
@app.route('/get_purchases', methods=['GET'])
@admin_required()
async def get_purchases():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT id, user_id, product_name, amount, purchase_date
                    FROM product_purchases
                    ORDER BY purchase_date DESC
                """)
                rows = await cursor.fetchall()

                # Transformer en JSON propre
                purchases = [
                    {
                        "id": row[0],
                        "user_id": row[1],
                        "product_name": row[2],
                        "amount": float(row[3]),
                        "purchase_date": row[4].strftime("%Y-%m-%d %H:%M:%S") if row[4] else None
                    }
                    for row in rows
                ]
                return jsonify(purchases)

    except Exception as e:
        print("❌ Erreur lors de la récupération des achats :")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# --- Route pour récupérer tous les wallets ---
@app.route("/get_wallets", methods=["GET"])
@admin_required()
async def get_wallets():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                print("🔗 Exécution de la requête SQL...")
                await cursor.execute("""
                    SELECT id, wallet_id, user_id, user_name, user_file, created_at
                    FROM wallets
                    ORDER BY id DESC
                """)
                rows = await cursor.fetchall()

                # 🔄 Conversion manuelle en dictionnaires
                result = []
                for row in rows:
                    result.append({
                        "id": row[0],
                        "wallet_id": row[1],
                        "user_id": row[2],
                        "user_name": row[3],
                        "user_file": row[4],
                        "created_at": str(row[5])
                    })

                print(f"✅ {len(result)} wallets récupérés avec succès.")
                return jsonify(result)

    except Exception as e:
        print("❌ Erreur lors de la récupération des wallets :")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500



# --- Route pour récupérer toutes les épargnes ---
@app.route("/get_epargnes", methods=["GET"])
@admin_required()
async def get_epargnes():
    try:
        print("🔗 Connexion à la base et récupération des données de la table epargne...")

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT id, user_id, solde, created_at, updated_at, taux, interet
                    FROM epargne
                    ORDER BY id DESC
                """)
                rows = await cursor.fetchall()

                epargnes = []
                for row in rows:
                    epargnes.append({
                        "id": row[0],
                        "user_id": row[1],
                        "solde": float(row[2]),
                        "created_at": str(row[3]),
                        "updated_at": str(row[4]),
                        "taux": float(row[5]),
                        "interet": str(row[6])
                    })

                print(f"✅ {len(epargnes)} lignes récupérées depuis la table epargne.")
                return jsonify(epargnes)

    except Exception as e:
        print("❌ Erreur lors de la récupération des épargnes :")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500



# --- Route pour récupérer les bonus ---
@app.route("/get_bonus", methods=["GET"])
@admin_required()
async def get_bonus():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT id, code, pere_id, used, used_by, created_at
                    FROM bonus
                    ORDER BY id DESC
                """)
                rows = await cursor.fetchall()

                # Convertir les résultats en dictionnaires
                data = []
                for row in rows:
                    data.append({
                        "id": row[0],
                        "code": row[1],
                        "pere_id": row[2],
                        "used": row[3],
                        "used_by": row[4],
                        "created_at": row[5].strftime("%Y-%m-%d %H:%M:%S") if row[5] else None
                    })

                return jsonify(data)

    except Exception as e:
        import traceback
        print("❌ Erreur lors de la récupération des bonus :")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


#############################################""Systeme de rote blade ##################################333333
###############################################################################################################
#############################################################################################################33



LEVELS_JSON_PATH = os.path.join(os.path.dirname(__file__), "html 1", "lang", "levels.json")

levels_data = {}

async def load_levels():
    global levels_data
    try:
        async with aiofiles.open(LEVELS_JSON_PATH, "r", encoding="utf-8") as f:
            content = await f.read()
            levels_list = json.loads(content)
            if isinstance(levels_list, dict) and "levels" in levels_list:
                levels_list = levels_list["levels"]
            levels_data = {lvl["id"]: lvl for lvl in levels_list}
    except Exception as e:
        levels_data = {}

@app.before_serving
async def startup():
    await load_levels()

@app.get("/api/get-level")
async def get_level():
    try:
        user_id = session.get("user_id")
       
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Récupérer le dernier niveau
                await cursor.execute("""
                    SELECT level_id, statut
                    FROM level_completed
                    WHERE user_id = %s
                    ORDER BY level_id DESC
                    LIMIT 1
                """, (user_id,))
                row = await cursor.fetchone()

        try:
            async with aiofiles.open(LEVELS_JSON_PATH, 'r', encoding='utf-8') as f:
                content = await f.read()
                all_levels_data = json.loads(content)
                
                levels_data = {}
                if isinstance(all_levels_data, list):
                    for level in all_levels_data:
                        if isinstance(level, dict) and 'id' in level:
                            levels_data[str(level['id'])] = level
                elif isinstance(all_levels_data, dict):
                    for key in ['levels', 'data', 'niveaux']:
                        if key in all_levels_data and isinstance(all_levels_data[key], list):
                            for level in all_levels_data[key]:
                                if isinstance(level, dict) and 'id' in level:
                                    levels_data[str(level['id'])] = level
                            break
                
        except Exception as e:
            return jsonify({"success": False, "error": "Erreur chargement niveaux"}), 500

        # Déterminer le niveau à retourner
        if not row:
            # Premier niveau pour ce joueur
            level_id = "1"
        else:
            last_level_id, statut = row
            # Convertir en string pour la comparaison
            last_level_id_str = str(last_level_id)
            
            if statut == 0:
                # Reprendre le niveau non terminé
                level_id = last_level_id_str
            else:
                # Passer au niveau suivant
                try:
                    current_id = int(last_level_id_str)
                    next_id = current_id + 1
                    level_id = str(next_id)
                except ValueError:
                    level_id = last_level_id_str

        # Vérifier si le niveau existe
        if level_id not in levels_data:
            return jsonify({
                "success": True,
                "game_finished": True,
                "message": "Tous les niveaux sont complétés 🎉",
                "last_level": level_id
            })

        level_info = levels_data[level_id]

        return jsonify({
            "success": True,
            "level": level_info,
            "level_id": level_id
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    

@app.get("/users/basic")
async def get_users_basic():
    # Vérifier que user_id est en session
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for("/connexion & inscription"))  # redirection vers page login

    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:  # pas de DictCursor
            await cur.execute(
                "SELECT name, picture FROM users WHERE id=%s", (user_id,)
            )
            row = await cur.fetchone()

    if not row:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    # Conversion tuple → dict
    result = {"name": row[0], "picture": row[1]}

    return jsonify(result)


@app.route('/api/store-level', methods=['POST'])
async def store_level():
    try:
        data = await request.get_json()

        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Utilisateur non connecté'}), 401
        
        level_id = data.get('level_id')
        
        # Convertir level_id en int si nécessaire
        try:
            if level_id is not None:
                level_id = int(level_id)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'level_id doit être un nombre'}), 400
        
        # Variables pour stocker specificity et timeg
        specificity = None
        timeg = None
        
        try:
            # Vérifier si le fichier existe
            if not os.path.exists(LEVELS_JSON_PATH):
                return jsonify({'success': False, 'error': 'Fichier levels.json introuvable'}), 500
            
            async with aiofiles.open(LEVELS_JSON_PATH, 'r', encoding='utf-8') as f:
                content = await f.read()
                
                # Parser le JSON
                levels_data = json.loads(content)
                
                if isinstance(levels_data, dict):
                    # Essayer différentes clés possibles
                    possible_keys = ['levels', 'data', 'niveaux', 'levels_list']
                    for key in possible_keys:
                        if key in levels_data:
                            levels_list = levels_data[key]
                            break
                    else:
                        # Si aucune clé connue, essayer de traiter comme liste
                        levels_list = levels_data
                else:
                    # Si c'est déjà une liste
                    levels_list = levels_data
                
                # Rechercher le niveau par ID
                if isinstance(levels_list, list):
                    for level in levels_list:
                        # Vérifier si c'est un dictionnaire
                        if not isinstance(level, dict):
                            continue
                        
                        # Récupérer l'ID (gérer différents formats)
                        level_id_in_json = level.get('id') or level.get('level_id') or level.get('ID')
                        
                        if level_id_in_json is not None:
                            # Convertir en int pour comparaison
                            try:
                                level_id_in_json = int(level_id_in_json)
                            except (ValueError, TypeError):
                                continue
                            
                            if level_id_in_json == level_id:
                                # Récupérer la specificity
                                specificity = level.get('specificity') or level.get('speciality') or level.get('spec')
                                
                                # Vérifier si c'est un cas spécial qui nécessite timeg
                                if specificity in ['2BZ', '2AB', '2RA', '2AA']:
                                    # Récupérer timeg pour ces cas spécifiques
                                    timeg = level.get('timeg') or level.get('time_g') or level.get('time_limit')
                                
                                break
                    
        except FileNotFoundError:
            return jsonify({'success': False, 'error': 'Fichier de configuration des niveaux introuvable'}), 500
        except json.JSONDecodeError as e:
            return jsonify({'success': False, 'error': f'Format JSON invalide: {str(e)}'}), 500
        except Exception as e:
            return jsonify({'success': False, 'error': f'Erreur de lecture: {str(e)}'}), 500
        
        # 2. Vérification des données requises
        required_fields = ['condition', 'target', 'bonus', 'difficulty']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Champs manquants: {", ".join(missing_fields)}'
            }), 400
        
        # 3. Stocker en base de données avec specificity et timeg
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    INSERT INTO fetched_levels 
                    (user_id, level_id, `condition`, target, bonus, difficulty, specificity, timeg, date_fetched)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ON DUPLICATE KEY UPDATE
                        level_id = VALUES(level_id),
                        `condition` = VALUES(`condition`),
                        target = VALUES(target),
                        bonus = VALUES(bonus),
                        difficulty = VALUES(difficulty),
                        specificity = VALUES(specificity),
                        timeg = VALUES(timeg),
                        date_fetched = NOW()
                """, (
                    user_id,
                    level_id,
                    data.get('condition'),
                    data.get('target', 0),
                    data.get('bonus'),
                    data.get('difficulty'),
                    specificity,
                    timeg  # Peut être NULL pour les cas non-spéciaux
                ))
                
                # Récupérer l'ID inséré
                await cursor.execute("SELECT LAST_INSERT_ID()")
                result = await cursor.fetchone()
                record_id = result[0] if result else None
        
        return jsonify({
            'success': True, 
            'level_id': level_id,
            'record_id': record_id
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500 


LEVELS_JSON_PATH = os.path.join("html 1", "lang", "levels.json")
SPECIAL_SPECIFICITIES = {"2RA", "2AB", "2BZ", "2AA", "2HLR", "2BA"}
@app.get("/api/get-current-level")
async def get_current_level():
    try:
        # Vérifier si l'utilisateur est connecté
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        # Récupérer target et level_id depuis la DB
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT level_id, target
                    FROM fetched_levels
                    WHERE user_id = %s
                """, (user_id,))
                row = await cursor.fetchone()

        if not row:
            return jsonify({"success": True, "has_progress": False})

        level_id, target = row[0], row[1]

        # Lire JSON avec aiofiles
        async with aiofiles.open(LEVELS_JSON_PATH, mode="r", encoding="utf-8") as f:
            content = await f.read()
            levels_data = json.loads(content)

        # Gérer JSON structuré différemment
        if isinstance(levels_data, dict) and "levels" in levels_data:
            levels = levels_data["levels"]
        else:
            levels = levels_data

        # Variables de sortie
        specificity = None
        timeg = None

        # Recherche du niveau
        for lvl in levels:
            if isinstance(lvl, dict) and lvl.get("id") == level_id:
                specificity = lvl.get("specificity")
                if specificity in SPECIAL_SPECIFICITIES:
                    timeg = lvl.get("timeg")
                break

        if specificity is None:
            return jsonify({"success": False, "error": "Niveau introuvable dans levels.json"}), 404

        # Déterminer le type en backend
        type_value = ""
        if specificity == "2HLR":
            type_value = "Zombie"
        elif specificity in {"2BZ", "2AB"}:
            type_value = "Zombies"
        elif specificity == "2BA":
            type_value = "Score"
        elif specificity == "2RA":
            type_value = "Piece"
        elif specificity == "2AA":
            type_value = "Score"

        # Ajouter mention timeg si applicable
        if specificity in {"2BZ", "2AB", "2RA", "2AA"}:
            type_value += " + timeg"

        # Réponse API
        response = {
            "success": True,
            "has_progress": True,
            "level_id": level_id,   # <-- ajouté
            "target": target,
            "type": type_value
        }

        if timeg is not None:
            response["timeg"] = timeg

        return jsonify(response)

    except Exception as e:
        print(f"Erreur get_current_level: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/game-config')
async def get_game_config():
    if "user_id" not in session:
        return redirect("/connexion & inscription")  

    config = {
        "success": True,
        "config": {
            # Paramètres de base
            "SPEED_MULTIPLIER": 1.0,
            "ZOMBIE_SPEED_BASE": 1.0,
            "GRAVITY": 0.8,
            "JUMP_FORCE": 18,
            "DOUBLE_JUMP_FORCE": 16,
            "BULLET_SPEED": 15,
            "ENEMY_BULLET_SPEED": 10,
            
            # Paramètres de spawn
            "SPAWN_RATE": 1500,
            "COIN_SPAWN_RATE": 2500,
            "POWERUP_SPAWN_RATE": 5000,
            "MAX_COINS_ON_SCREEN": 8,
            "MAX_POWERUPS_ON_SCREEN": 3,
            "MAX_ZOMBIES_ON_SCREEN": 8,
            "MAX_ZOMBIES_PER_WAVE": 5,
            
            # Paramètres de combat
            "BULLETS_COUNT": 20,
            "MAX_BULLETS": 20,
            "RELOAD_DURATION": 10000,
            
            # Durées des effets
            "INVINCIBILITY_DURATION": 10000,
            "MAGNET_DURATION": 10000,
            "DOUBLE_COINS_DURATION": 15000,
            
            # Santé et points
            "HEALTH_POINTS": 5,
            "ZOMBIE_HEALTH_BASE": 1,
            "COIN_VALUE": 1,
            "SCORE_PER_COIN": 2,
            
            # Scores des zombies
            "ZOMBIE_KILL_SCORE": {
                "NORMAL": 3,
                "SHOOTER": 5,
                "TANK": 7
            },
            
            # Multiplicateurs de difficulté
            "DIFFICULTY_MULTIPLIERS": {
                "SPEED_INCREMENT": 0.25,
                "HEALTH_INCREMENT": 0.33,
                "BULLET_SPEED_INCREMENT": 0.5,
                "SPAWN_RATE_DECREMENT": 150,
                "SPECIAL_CHANCE_INCREMENT": 0.05,
                "MAX_ZOMBIES_INCREMENT": 0.5
            },
            
            # Paramètres des vagues
            "WAVE_SETTINGS": {
                "PAUSE_DURATION": 2000,
                "ZOMBIES_PER_WAVE": 5
            },
            
            # Paramètres des plateformes
            "PLATFORM_SETTINGS": {
                "MIN_HEIGHT": 60,
                "MAX_HEIGHT": 140,
                "RESPAWN_OFFSET": 600
            },
            
            # Chances des powerups
            "POWERUP_CHANCES": {
                "MAGNET": 0.15,
                "RESURRECTION": 0.03,
                "COMMON": 0.82
            },
            
            # Paramètres visuels
            "VISUAL_SETTINGS": {
                "PARTICLE_COUNT": 150,
                "COIN_EFFECT_PARTICLES": 8,
                "POWERUP_EFFECT_PARTICLES": 12,
                "GRASS_BLADES_COUNT": 400,
                "STARS_COUNT": 80,
                "CLOUDS_COUNT": 5,
                "BIRDS_COUNT": 6
            }
        }
    }

    return jsonify(config)



@app.route('/api/game-config-mobile')
async def get_game_config_mobile():
    try:
        if "user_id" not in session:
            return redirect("/connexion & inscription") 
 
        config = {
            "success": True,
            "config": {
                # SECTION: Paramètres de sécurité et limites
                "SECURITY": {
                    "MAX_ZOMBIES_ON_SCREEN": 5,
                    "MAX_SCORE": 999999,
                    "MAX_COINS": 9999,
                    "MAX_ZOMBIES_KILLED": 9999,
                    "MIN_SHOOT_INTERVAL": 100,  # en ms
                    "MAX_REQUESTS_PER_MINUTE": 60,
                    "SESSION_TIMEOUT": 3600  # 1 heure en secondes
                },
                
                # SECTION: Paramètres de gameplay de base
                "GAME": {
                    "GRAVITY": 0.8,
                    "JUMP_FORCE": 18,
                    "DOUBLE_JUMP_FORCE": 16,
                    "SHURIKEN_HEIGHT_FROM_GROUND": 10,
                    "SHURIKEN_SPACING": 8,
                    "BASE_ZOMBIE_SPEED": 2.0,
                    "MOBILE_ZOMBIE_SPEED": 2.5,
                    "GAME_TICK_RATE": 60  # FPS cible
                },
                
                # SECTION: Paramètres des zombies
                "ZOMBIES": {
                    "SPEED_BASE": 2.0,
                    "SPEED_MOBILE": 2.5,
                    "HEALTH_BASE": 1,
                    "TANK_HEALTH": 3,
                    "MIN_ON_SCREEN": 5,
                    "KILLED_FOR_RESPAWN": 2,
                    "SPAWN_RATE": 1500,  # en ms
                    "MAX_PER_WAVE": 15,
                    "SPECIAL_CHANCE": 0.3,
                    "SHOOTER_FIRE_RATE": 5000,  # en ms
                    "TANK_DAMAGE_REDUCTION": 0.5  # 50% de réduction des dégâts
                },
                
                # SECTION: Système de munitions
                "AMMO": {
                    "MAX_AMMO": 20,
                    "RELOAD_TIME": 10000,  # 10 secondes
                    "PAUSE_SPAWN_DURATION": 6000,  # 6 secondes
                    "RESUME_SPAWN_REMAINING": 4000,  # 4 secondes avant la fin
                    "AMMO_PER_PICKUP": 5,
                    "AMMO_SPAWN_CHANCE": 0.1
                },
                
                # SECTION: Système de vagues
                "WAVES": {
                    "COOLDOWN": 1000,  # 1 seconde entre les vagues
                    "ZOMBIES_PER_WAVE": 5,
                    "SPAWN_INTERVAL": 1000,  # 1 seconde entre chaque zombie
                    "WAVE_DURATION": 30000,  # 30 secondes par vague
                    "DIFFICULTY_INCREMENT_PER_WAVE": 0.1  # 10% plus difficile par vague
                },
                
                # SECTION: Collectibles (pièces et power-ups)
                "COLLECTIBLES": {
                    "COIN_SPAWN_RATE": 3000,  # en ms
                    "COIN_VALUE": 5,
                    "COIN_SCORE_BONUS": 2,
                    "MAX_COINS_ON_SCREEN": 8,
                    "POWERUP_SPAWN_RATE": 5000,  # en ms
                    "MAX_POWERUPS_ON_SCREEN": 3,
                    "MAGNET_RADIUS": 200,  # pixels
                    "MAGNET_SPEED": 5,
                    "COIN_DURATION": 10000,  # 10 secondes avant disparition
                    "POWERUP_DURATION": 15000  # 15 secondes avant disparition
                },
                
                # SECTION: Système de score et récompenses
                "SCORING": {
                    "ZOMBIE_NORMAL": 3,
                    "ZOMBIE_SHOOTER": 4,
                    "ZOMBIE_TANK": 5,
                    "DIFFICULTY_THRESHOLDS": [0, 500, 1000, 2000, 3500, 5000, 7500, 10000],
                    "COMBO_MULTIPLIER": 1.5,
                    "TIME_BONUS_PER_SECOND": 10,
                    "PERFECT_WAVE_BONUS": 100,
                    "HEADSHOT_MULTIPLIER": 2.0
                },
                
                # SECTION: Effets visuels et performance
                "VISUALS": {
                    "EXPLOSION_PARTICLES": 150,
                    "COIN_EFFECT_PARTICLES": 8,
                    "POWERUP_EFFECT_PARTICLES": 12,
                    "STARS_COUNT": 50,
                    "CLOUDS_COUNT": 5,
                    "BIRDS_COUNT": 3,
                    "BACKGROUND_SCROLL_SPEED": 0.5,
                    "PARALLAX_LAYERS": 3,
                    "PARTICLE_MAX_LIFE": 2000,  # en ms
                    "SCREEN_SHAKE_INTENSITY": 10
                },
                
                # SECTION: Plateformes et environnement
                "PLATFORMS": {
                    "HEIGHT_DESKTOP": 20,
                    "HEIGHT_MOBILE": 15,
                    "MIN_HEIGHT": 160,
                    "MAX_HEIGHT": 250,
                    "MIN_WIDTH": 120,
                    "MAX_WIDTH": 200,
                    "RESPAWN_OFFSET": 600,
                    "PLATFORM_COUNT": 3,
                    "COLLISION_TOLERANCE": 5
                },
                
                # SECTION: Système de difficulté progressive
                "DIFFICULTY": {
                    "MAX_LEVEL": 8,
                    "LEVEL_NAMES": [
                        "FACILE", "NORMAL", "DIFFICILE", "EXPERT", 
                        "MAÎTRE", "LÉGENDAIRE", "MYTHIQUE", "DIVIN"
                    ],
                    "SPEED_INCREMENT": 0.25,
                    "SPAWN_RATE_DECREMENT": 150,
                    "SPECIAL_CHANCE_INCREMENT": 0.05,
                    "HEALTH_INCREMENT": 0.33,
                    "BULLET_SPEED_INCREMENT": 0.5,
                    "MAX_ZOMBIES_INCREMENT": 0.5,
                    "DAMAGE_INCREASE": 0.1,
                    "SCORE_MULTIPLIER": 1.1
                },
                
                # SECTION: Durées des power-ups
                "POWERUP_DURATIONS": {
                    "DOUBLE_JUMP": 20000,  # 20 secondes
                    "INVINCIBILITY": 10000,  # 10 secondes
                    "DOUBLE_COINS": 20000,  # 20 secondes
                    "COIN_MAGNET": 20000,  # 20 secondes
                    "RAPID_FIRE": 15000,  # 15 secondes
                    "FREEZE_TIME": 10000  # 10 secondes
                },
                
                # SECTION: Chances d'apparition des power-ups
                "POWERUP_CHANCES": {
                    "DOUBLE_JUMP": 0.15,
                    "HEALTH": 0.15,
                    "POISON": 0.1,
                    "INVINCIBILITY": 0.15,
                    "DOUBLE_COINS": 0.15,
                    "COIN_MAGNET": 0.15,
                    "INSTANT_COINS": 0.1,
                    "RESURRECTION": 0.05,
                    "RAPID_FIRE": 0.05,
                    "FREEZE_TIME": 0.05
                },
                
                # SECTION: Paramètres de progression
                "PROGRESSION": {
                    "EXPERIENCE_PER_ZOMBIE": 10,
                    "EXPERIENCE_PER_COIN": 1,
                    "LEVEL_UP_EXPERIENCE_BASE": 1000,
                    "LEVEL_UP_MULTIPLIER": 1.5,
                    "SKILL_POINTS_PER_LEVEL": 1,
                    "MAX_PLAYER_LEVEL": 100
                },
                
                # SECTION: Économie du jeu
                "ECONOMY": {
                    "COIN_DROP_CHANCE": 0.3,
                    "POWERUP_DROP_CHANCE": 0.1,
                    "BOSS_DROP_MULTIPLIER": 3,
                    "DAILY_REWARD_BASE": 100,
                    "STREAK_MULTIPLIER": 1.1,
                    "MAX_STREAK": 7
                },
                
                # SECTION: Paramètres de performance
                "PERFORMANCE": {
                    "MAX_PARTICLES": 500,
                    "MAX_BULLETS": 50,
                    "MAX_ZOMBIES": 20,
                    "MEMORY_CLEANUP_INTERVAL": 5000,  # en ms
                    "GC_THRESHOLD": 0.9,  # 90% d'utilisation mémoire
                    "FRAME_SKIP_THRESHOLD": 16  # ms par frame
                },
                
                # SECTION: Paramètres réseau
                "NETWORK": {
                    "AUTO_SAVE_INTERVAL": 30000,  # 30 secondes
                    "MAX_RETRY_ATTEMPTS": 3,
                    "TIMEOUT": 10000,  # 10 secondes
                    "COMPRESSION_THRESHOLD": 1024  # 1KB
                },
                
                # SECTION: Paramètres spéciaux pour événements
                "EVENTS": {
                    "DOUBLE_XP_CHANCE": 0.05,
                    "LUCKY_DROP_MULTIPLIER": 2,
                    "EVENT_DURATION": 3600000,  # 1 heure en ms
                    "SPECIAL_ZOMBIE_CHANCE": 0.01
                }
            }
        }
        
        
        return jsonify(config)
        
    except Exception as e:
        return jsonify({
            "success": False, 
            "error": "Erreur",
            "config": None
        }), 500




@app.route("/api/user-stats", methods=["GET"])
async def get_user_stats():
    try:
        # --- Sécurité session ---
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Utilisateur non connecté"
            }), 401

        pool = await get_pool()

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("""
                    SELECT
                        user_id,
                        best_score,
                        total_zombies_killed,
                        total_coins,
                        total_game_time,
                        total_partie,
                        total_stars
                    FROM user_stats
                    WHERE user_id = %s
                """, (user_id,))

                row = await cursor.fetchone()

                if not row:
                    return jsonify({
                        "success": False,
                        "message": "Statistiques non trouvées"
                    }), 404

                # --- Mapping safe ---
                stats = {
                    "user_id": row["user_id"],
                    "best_score": row["best_score"] or 0,
                    "total_zombies_killed": row["total_zombies_killed"] or 0,
                    "total_coins": row["total_coins"] or 0,
                    "total_game_time": row["total_game_time"] or 0,
                    "total_partie": row["total_partie"] or 0,
                    "total_stars": row["total_stars"] or 0
                }

                return jsonify({
                    "success": True,
                    "stats": stats
                })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Erreur serveur"
        }), 500





@app.get("/api/user-game-results")
async def get_user_game_results():
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT coins, zombies_killed, game_time, created_at
                    FROM game_results
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                """, (user_id,))
                
                rows = await cursor.fetchall()

                if not rows:
                    return jsonify({"success": True, "results": []})

                # Convertir les tuples en liste de dicts pour JSON
                results = []
                for row in rows:
                    results.append({
                        "coins": row[0],
                        "zombies_killed": row[1],
                        "game_time": row[2],
                        "created_at": row[3].isoformat() if isinstance(row[3], datetime) else str(row[3])
                    })

                return jsonify({"success": True, "results": results})

    except Exception as e:
        print(f"Erreur GET /api/user-game-results : {e}")
        return jsonify({"success": False, "error": str(e)}), 500


SPECIAL_SPECIFICITIES = {"2RA", "2AB", "2BZ", "2AA", "2HLR", "2BA"}

@app.post("/api/save-game-results")
async def save_game_results():
    try:
        # Vérifier que l'utilisateur est connecté
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({
                "success": False, 
                "error": "Veuillez vous connecter",
            }), 401

        data = await request.get_json()

        # Vérification simple de timestamp (optionnelle)
        if "client_timestamp" in data:
            current_time = int(time.time() * 1000)
            client_time = data["client_timestamp"]
            
            # Rejeter les données trop anciennes (> 5 minutes)
            if abs(current_time - client_time) > 300000:
                return jsonify({
                    "success": False,
                    "error": "Données expirées"
                }), 400

        
        # =============================================
        # VÉRIFICATIONS ET NORMALISATION SEULEMENT
        # =============================================
        
        # Pas de vérification de hash, pas de timestamp
        
        # Limites raisonnables
        cheat_detected = False
        cheat_reasons = []
        
        MAX_SCORE = 50000
        MAX_COINS = 10000
        MAX_ZOMBIES = 1000
        MAX_GAME_TIME = 3600
        MAX_HITS = 50
        MAX_RESURRECTIONS = 10
        
        # Récupérer les valeurs avec defaults
        score = data.get("score", 0)
        coins = data.get("coins", 0)
        zombies_killed = data.get("zombies_killed", 0)
        game_time = data.get("game_time", 0)
        hits_taken = data.get("hits_taken", 0)
        resurrections_used = data.get("resurrections_used", 0)
        difficulty_level = data.get("difficulty_level", 1)
        level_id = data.get("level_id", 0)
        
        original_score = score
        adjusted_score = score
        
        # 1. Normaliser les valeurs aux limites
        if score < 0 or score > MAX_SCORE:
            cheat_detected = True
            cheat_reasons.append(f"Score invalide: {score}")
            score = min(max(score, 0), MAX_SCORE)
            print(f"⚠️  Score ajusté: {score}")
            
        if coins < 0 or coins > MAX_COINS:
            cheat_detected = True
            cheat_reasons.append(f"Pièces invalides: {coins}")
            coins = min(max(coins, 0), MAX_COINS)
            
        if zombies_killed < 0 or zombies_killed > MAX_ZOMBIES:
            cheat_detected = True
            cheat_reasons.append(f"Zombies invalides: {zombies_killed}")
            zombies_killed = min(max(zombies_killed, 0), MAX_ZOMBIES)
            
        if game_time < 0 or game_time > MAX_GAME_TIME:
            cheat_detected = True
            cheat_reasons.append(f"Temps invalide: {game_time}")
            game_time = min(max(game_time, 0), MAX_GAME_TIME)
            
        if hits_taken < 0 or hits_taken > MAX_HITS:
            cheat_detected = True
            cheat_reasons.append(f"Dégâts invalides: {hits_taken}")
            hits_taken = min(max(hits_taken, 0), MAX_HITS)
            
        if resurrections_used < 0 or resurrections_used > MAX_RESURRECTIONS:
            cheat_detected = True
            cheat_reasons.append(f"Résurrections invalides: {resurrections_used}")
            resurrections_used = min(max(resurrections_used, 0), MAX_RESURRECTIONS)
            
        if difficulty_level < 1 or difficulty_level > 10:
            cheat_detected = True
            cheat_reasons.append(f"Niveau invalide: {difficulty_level}")
            difficulty_level = min(max(difficulty_level, 1), 10)
        
        # 2. Vérifier la cohérence (optionnel, mais recommandé)
        adjusted_score = score  # Commencer avec le score normalisé
        
        if zombies_killed > 0:
            avg_score_per_zombie = score / zombies_killed
            if avg_score_per_zombie > 50:  # Plus de 50 points par zombie = suspect
                cheat_detected = True
                cheat_reasons.append(f"Ratio score/zombie trop élevé: {avg_score_per_zombie:.1f}")
                penalty = 50 / avg_score_per_zombie
                adjusted_score = int(score * penalty)
        
        if game_time > 60:
            coins_per_minute = (coins / game_time) * 60
            if coins_per_minute > 100:  # Plus de 100 pièces par minute
                cheat_detected = True
                cheat_reasons.append(f"Ratio pièces/temps trop élevé: {coins_per_minute:.1f}")
                penalty = 100 / coins_per_minute
                coins = int(coins * penalty)
        
        # 3. Vérifier les performances impossibles
        if game_time > 0:
            zombies_per_second = zombies_killed / game_time
            if zombies_per_second > 5:  # Plus de 5 zombies par seconde
                cheat_detected = True
                cheat_reasons.append(f"Vitesse de kill impossible: {zombies_per_second:.1f}/sec")
                penalty = 5 / zombies_per_second
                zombies_killed = int(zombies_killed * penalty)
                adjusted_score = int(adjusted_score * penalty)
            
            coins_per_second = coins / game_time
            if coins_per_second > 10:  # Plus de 10 pièces par seconde
                cheat_detected = True
                cheat_reasons.append(f"Vitesse de collecte impossible: {coins_per_second:.1f}/sec")
                penalty = 10 / coins_per_second
                coins = int(coins * penalty)
        
        # 4. Réduction supplémentaire si triche détectée
        if cheat_detected and adjusted_score == score:
            # Si d'autres triches mais pas de pénalité de ratio, réduire le score
            penalty_factor = 0.1  # Garder seulement 10% du score
            adjusted_score = int(score * penalty_factor)
        
        level_completed = False
        specificity_check_result = None
        bonus_amount = 0  # Variable pour stocker le bonus
        
        pool = await get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Récupérer les informations du niveau depuis fetched_levels
                await cursor.execute("""
                    SELECT specificity, target, timeg, bonus 
                    FROM fetched_levels 
                    WHERE user_id = %s AND level_id = %s
                """, (user_id, level_id))
                
                level_info = await cursor.fetchone()
                
                if level_info:
                    specificity, target, timeg, bonus = level_info
                    print(f"🔍 Informations niveau {level_id}: specificity={specificity}, target={target}, timeg={timeg}, bonus={bonus}")
                    
                    # Stocker le bonus pour usage ultérieur
                    bonus_amount = bonus if bonus is not None else 0
                    
                    # Vérification selon la spécificité
                    if specificity == "2HLR":
                        # 2HLR: target > zombies_killed
                        if zombies_killed >= target:
                            level_completed = True
                            specificity_check_result = f"Zombies tués ({zombies_killed}) >= Target ({target})"
                        else:
                            specificity_check_result = f"ÉCHEC: Zombies tués ({zombies_killed}) < Target ({target}) requis"
                            
                    elif specificity == "2BZ":
                        # 2BZ: timeg >= game_time ET target peut être inférieur à score mais pas trop
                        if timeg is not None and game_time <= timeg:
                            # Vérifier que target n'est pas trop inférieur à score
                            if score >= target * 0.8:  # Score doit être au moins 80% du target
                                level_completed = True
                                specificity_check_result = f"Time OK ({game_time}s <= {timeg}s), Score OK ({score} >= {target*0.8})"
                            else:
                                specificity_check_result = f"ÉCHEC: Score ({score}) trop bas par rapport au target ({target})"
                        else:
                            specificity_check_result = f"ÉCHEC: Temps ({game_time}s) > Timeg ({timeg}s) limite"
                            
                    elif specificity == "2AB":
                        # 2AB: target > zombies_killed ET timeg > game_time (les deux obligatoires)
                        if timeg is not None and zombies_killed >= target and game_time <= timeg:
                            level_completed = True
                            specificity_check_result = f"Zombies OK ({zombies_killed} >= {target}), Time OK ({game_time}s <= {timeg}s)"
                        else:
                            failed_conditions = []
                            if zombies_killed < target:
                                failed_conditions.append(f"Zombies ({zombies_killed} < {target})")
                            if timeg is None or game_time > timeg:
                                failed_conditions.append(f"Temps ({game_time}s > {timeg}s)")
                            specificity_check_result = f"ÉCHEC: {', '.join(failed_conditions)}"
                            
                    elif specificity == "2BA":
                        # 2BA: target >= score (jamais inférieur)
                        if score <= target:
                            level_completed = True
                            specificity_check_result = f"Score ({score}) <= Target ({target})"
                        else:
                            specificity_check_result = f"ÉCHEC: Score ({score}) > Target ({target})"
                            
                    elif specificity == "2RA":
                        # 2RA: target >= coins ET timeg >= game_time (les deux obligatoires)
                        if timeg is not None and coins <= target and game_time <= timeg:
                            level_completed = True
                            specificity_check_result = f"Coins OK ({coins} <= {target}), Time OK ({game_time}s <= {timeg}s)"
                        else:
                            failed_conditions = []
                            if coins > target:
                                failed_conditions.append(f"Coins ({coins} > {target})")
                            if timeg is None or game_time > timeg:
                                failed_conditions.append(f"Temps ({game_time}s > {timeg}s)")
                            specificity_check_result = f"ÉCHEC: {', '.join(failed_conditions)}"
                            
                    elif specificity == "2AA":
                        # 2AA: target >= score ET timeg >= game_time (les deux obligatoires)
                        if timeg is not None and score <= target and game_time <= timeg:
                            level_completed = True
                            specificity_check_result = f"Score OK ({score} <= {target}), Time OK ({game_time}s <= {timeg}s)"
                        else:
                            failed_conditions = []
                            if score > target:
                                failed_conditions.append(f"Score ({score} > {target})")
                            if timeg is None or game_time > timeg:
                                failed_conditions.append(f"Temps ({game_time}s > {timeg}s)")
                            specificity_check_result = f"ÉCHEC: {', '.join(failed_conditions)}"
                            
                    else:
                        # Spécificité non reconnue
                        specificity_check_result = f"Spécificité '{specificity}' non gérée"
                else:
                    specificity_check_result = f"Aucune information trouvée pour le niveau {level_id}"
        
        completion_time = datetime.now()
        completed_status = data.get("completed", False)
        
        level_completed_status = 1 if level_completed else 0
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                
                if level_completed and bonus_amount > 0:
                    try:
                        # Récupérer le solde actuel
                        await cursor.execute("""
                            SELECT solde FROM solde WHERE user_id = %s
                        """, (user_id,))
                        
                        solde_result = await cursor.fetchone()
                        
                        current_solde = 0  # Initialiser à 0 par défaut
                        if solde_result:
                            current_solde = solde_result[0] or 0
                        
                        # Calculer le nouveau solde
                        new_solde = current_solde + bonus_amount
                        
                        # Mettre à jour le solde
                        await cursor.execute("""
                            UPDATE solde SET solde = %s WHERE user_id = %s
                        """, (new_solde, user_id))
                        
                    except Exception as e:
                       
                        pass
                
                # 7. Sauvegarder dans game_results (SANS bonus_awarded)
                await cursor.execute("""
                    INSERT INTO game_results 
                    (user_id, level_id, score, coins, zombies_killed, game_time,
                     hits_taken, resurrections_used, difficulty_level,
                     completed, completion_time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    user_id,
                    level_id,
                    adjusted_score,
                    coins,
                    zombies_killed,
                    game_time,
                    hits_taken,
                    resurrections_used,
                    difficulty_level,
                    completed_status,
                    completion_time
                ))

                # 8. Mettre à jour level_completed
                await cursor.execute("""
                    INSERT INTO level_completed 
                    (user_id, level_id, statut, updated_at)
                    VALUES (%s, %s, %s, NOW())
                    ON DUPLICATE KEY UPDATE
                        statut = VALUES(statut),
                        updated_at = NOW()
                """, (user_id, level_id, level_completed_status))

                # 9. Mettre à jour les stats utilisateur
                await cursor.execute("""
                    SELECT best_score, total_zombies_killed, total_coins, 
                           total_game_time, total_partie
                    FROM user_stats
                    WHERE user_id = %s
                """, (user_id,))
                stats = await cursor.fetchone()

                if stats:
                    best_score_db, total_z_db, total_c_db, total_time_db, total_p_db = stats
                else:
                    best_score_db = total_z_db = total_c_db = total_time_db = total_p_db = 0
                    await cursor.execute("INSERT INTO user_stats (user_id) VALUES (%s)", (user_id,))

                new_best_score = max(best_score_db, adjusted_score)
                new_total_zombies = total_z_db + zombies_killed
                new_total_coins = total_c_db + coins
                new_total_game_time = total_time_db + game_time
                new_total_partie = total_p_db + 1

                await cursor.execute("""
                    UPDATE user_stats
                    SET best_score = %s,
                        total_zombies_killed = %s,
                        total_coins = %s,
                        total_game_time = %s,
                        total_partie = %s
                    WHERE user_id = %s
                """, (
                    new_best_score,
                    new_total_zombies,
                    new_total_coins,
                    new_total_game_time,
                    new_total_partie,
                    user_id
                ))

                await conn.commit()

        response = {
            "success": True,
            "level_completed": level_completed,
            "bonus_awarded": bonus_amount if level_completed else 0
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Erreur "
        }), 500


min_bet_table = []
block_size = 5  # nombre de niveaux par bloc
for i in range(0, 500, block_size):
    start = i + 1
    end = i + block_size
    min_bet = 50 * ((i // block_size) + 1)  # incrément augmente de 50 tous les 5 niveaux
    min_bet_table.append((start, end, min_bet))

# Fonction pour récupérer la mise minimale selon le level_id
def get_min_bet(level_id: int) -> int:
    for start, end, min_bet in min_bet_table:
        if start <= level_id <= end:
            return min_bet
    return 50  # valeur par défaut
    
@app.route('/api/hafsat', methods=['POST'])
@track_mise()
async def hafast():
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"success": False, "error": "Utilisateur non connecté"}), 401

        data = await request.get_json()
        bet_amount = data.get('bet_amount')
        level_id = data.get('level_id')

        if bet_amount is None or level_id is None:
            return jsonify({"success": False, "error": "Données manquantes"}), 400

        try:
            bet_amount = float(bet_amount)
            level_id = int(level_id)
        except ValueError:
            return jsonify({"success": False, "error": "Valeurs invalides"}), 400

        min_bet = get_min_bet(level_id)
        max_bet = 20000 

        if bet_amount <= 99:
            return jsonify({
                "success": False,
                "error": "La mise minimal est de 100 XOF"
            }), 400 

        if bet_amount < min_bet:
            return jsonify({"success": False, "error": f"Mise minimale pour ce niveau : {min_bet} XOF"}), 400
        if bet_amount > max_bet:
            return jsonify({"success": False, "error": f"Mise maximale : {max_bet} XOF"}), 400

        # ✅ UNE SEULE FOIS
        pool = await get_pool()

        # --- Lire le solde ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT solde FROM solde WHERE user_id = %s",
                    (user_id,)
                )
                row = await cursor.fetchone()

        if not row:
            return jsonify({"success": False, "error": "Solde utilisateur introuvable"}), 404

        current_balance = float(row[0])

        if bet_amount > current_balance:
            return jsonify({"success": False, "error": "Solde insuffisant"}), 400

        new_balance = current_balance - bet_amount

        # --- Mise à jour ---
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE solde SET solde = %s WHERE user_id = %s",
                    (new_balance, user_id)
                )
                await conn.commit()

        return jsonify({
            "success": True,
            "new_balance": new_balance,
            "message": f"Mise de {bet_amount} XOF placée pour le niveau {level_id}"
        })

    except Exception as e:
        return jsonify({"success": False, "error": "Erreur serveur"}), 500


###########################Evenement #################################


# VARIABLES GLOBALES

events_data = {}
user_runtime_events = {}
TIME_KEYS = {"2FA", "2HA", "3KN", "2NU", "2NN"}

# CHARGEMENT DES EVENTS JSON

async def load_events():
    global events_data
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'html 1/lang/events.json')
        async with aiofiles.open(json_path, 'r', encoding='utf-8') as f:
            content = await f.read()
            events_data = json.loads(content).get("events", {})
    except Exception as e:
        pass

# RÉCUPÉRATION LEVEL ET STATS
async def get_current_user_level(user_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT level_id FROM fetched_levels WHERE user_id=%s LIMIT 1", (user_id,))
            row = await cur.fetchone()
            return row[0] if row else None

async def get_last_game_result(user_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT score, coins, zombies_killed, game_time
                FROM game_results
                WHERE user_id=%s
                ORDER BY created_at DESC
                LIMIT 1
            """, (user_id,))
            row = await cur.fetchone()
            if not row:
                return None
            return {"score": row[0], "coins": row[1], "zombies_killed": row[2], "game_time": row[3]}

async def get_user_stats(user_id):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("""
                SELECT best_score, total_zombies_killed, total_coins,
                       total_game_time, total_partie, total_stars
                FROM user_stats
                WHERE user_id=%s
            """, (user_id,))
            row = await cur.fetchone()
            if not row:
                return None
            return {
                "best_score": row.get("best_score", 0),
                "total_zombies_killed": row.get("total_zombies_killed", 0),
                "total_coins": row.get("total_coins", 0),
                "total_game_time": row.get("total_game_time", 0),
                "total_partie": row.get("total_partie", 0),
                "total_stars": row.get("total_stars", 0)
            }

# RÉCUPÉRER EVENTS COMPLÉTÉS

async def get_completed_events(user_id):
    pool = await get_pool()
    completed = set()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT event_id FROM completed_events WHERE user_id=%s AND completed=1", (user_id,))
            rows = await cur.fetchall()
            completed = {row[0] for row in rows}
    return completed

# MARQUAGE EVENT COMPLÉTÉ + RECOMPENSE

async def mark_event_completed(user_id, event, level_id=None):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT completed FROM completed_events
                WHERE user_id=%s AND event_id=%s
            """, (user_id, event["id"]))
            row = await cur.fetchone()
            if row and row.get("completed") == 1:
                return  # déjà complété

            # Marquer complété + rewards
            await cur.execute("""
                INSERT INTO completed_events (user_id, event_id, level_id, completed)
                VALUES (%s, %s, %s, 1)
                ON DUPLICATE KEY UPDATE completed=1, updated_at=CURRENT_TIMESTAMP
            """, (user_id, event["id"], level_id))

            await cur.execute("UPDATE user_stats SET total_stars = total_stars + 2 WHERE user_id=%s", (user_id,))
            await cur.execute("UPDATE solde SET solde = solde + 25 WHERE user_id=%s", (user_id,))
        await conn.commit()

# LOGIQUE MÉTIER
def evaluate_event(event, game_data, user_stats=None):
    key = event["key"]
    target = event["target"]
    if key=="2FN": return game_data["coins"]>=target
    if key=="2RE": return game_data["coins"]==target
    if key=="2FA": return game_data["score"]>=target and game_data["game_time"]>=event["timeE"]
    if key=="2HA": return game_data["score"]==target and game_data["game_time"]==event["timeE"]
    if key=="3KN": return game_data["game_time"]>=event["timeE"]
    if key=="3NX": return game_data["zombies_killed"]>=target
    if key=="2NU" and user_stats: return user_stats["total_partie"]>=target
    if key=="2NN": return game_data["score"]>=target
    return False

def enrich_events(events, game_data, user_stats=None):
    return [{**e, "completed": evaluate_event(e, game_data, user_stats)} for e in events]

# FILTRAGE EVENTS

def filter_events_by_level_and_keys(events_obj, level_id, completed_event_ids):
    all_level_events = []
    for key, events_list in events_obj.items():
        if key != 'Autres' and isinstance(events_list, list):
            for event in events_list:
                if event.get('level')==level_id and event['id'] not in completed_event_ids:
                    all_level_events.append(event)
    all_level_events.sort(key=lambda x:x['id'])

    filtered_events=[]
    key_counts={'2FN':0,'2FA':0,'2HA':0}
    for e in all_level_events:
        k=e['key']
        if k=='2FN' and key_counts['2FN']<2: filtered_events.append(e); key_counts['2FN']+=1
        elif k=='2FA' and key_counts['2FA']<1: filtered_events.append(e); key_counts['2FA']+=1
        elif k=='2HA' and key_counts['2HA']<1: filtered_events.append(e); key_counts['2HA']+=1
        if key_counts['2FN']>=2 and key_counts['2FA']>=1 and key_counts['2HA']>=1: break
    return filtered_events, len(all_level_events)==0

def filter_other_events(events_obj, completed_event_ids, all_level_completed):
    other_events=[]
    if 'Autres' in events_obj and isinstance(events_obj['Autres'], list) and all_level_completed:
        key_counts={'2NN':0,'2NU':0,'2RE':0,'3KN':0,'3NX':0}
        for e in sorted(events_obj['Autres'], key=lambda x:x['id']):
            if e['id'] in completed_event_ids: continue
            k=e['key']
            if k in key_counts and key_counts[k]<1:
                other_events.append(e); key_counts[k]+=1
            if all(v>=1 for v in key_counts.values()): break
    return other_events

# WEBSOCKET
@app.websocket('/ws/events')
async def ws_events():
    user_id = session.get("user_id")
    if not user_id:
        await websocket.close()
        return

    # Charger les events JSON une seule fois
    await load_events()
    
    # Récupérer les events déjà complétés
    completed_event_ids = await get_completed_events(user_id)

    while True:
        try:
            game_data = await get_last_game_result(user_id) or {}
            user_stats = await get_user_stats(user_id) or {}
            current_level = await get_current_user_level(user_id)
            if not current_level:
                await asyncio.sleep(1)
                continue

            level_events, all_level_completed = filter_events_by_level_and_keys(
                events_data, current_level, completed_event_ids
            )
            other_events = filter_other_events(
                events_data, completed_event_ids, all_level_completed
            )

            for e in level_events + other_events:
                if evaluate_event(e, game_data, user_stats) and e["id"] not in completed_event_ids:
                    await mark_event_completed(user_id, e, current_level)
                    completed_event_ids.add(e["id"])

            await websocket.send(json.dumps({
                "level": current_level,
                "events": enrich_events(level_events + other_events, game_data, user_stats)
            }))

            await asyncio.sleep(3)

        except Exception as e:
            pass
            await asyncio.sleep(1)



# DÉMARRAGE BACKGROUND (chargement events)
@app.before_serving
async def startup():
    await load_events() 



# -----------------------------
# ROUTE POUR RECUPERER LES STARS
# -----------------------------
@app.route("/api/stars", methods=["GET"])
async def get_user_stars():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Aucun user_id en session"}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT total_stars FROM user_stats WHERE user_id=%s", (user_id,))
            row = await cur.fetchone()
            if not row:
                return jsonify({"error": "Utilisateur introuvable"}), 404
            total_stars = row[0]

    return jsonify({"total_stars": total_stars})


########################Boutique ###############

@app.route('/api/shop-items')
async def get_shop_items():
    try:
        async with aiofiles.open('html 1/lang/shop.json', 'r', encoding='utf-8') as f:
            content = await f.read()
            data = json.loads(content)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "shop_items.json non trouvé"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Erreur de décodage JSON"}), 500
    except Exception as e:
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500


SHOP_JSON_PATH = "html 1/lang/shop.json"

@app.route("/hafsat", methods=["POST"])
async def hafsat():
    try:
        data = await request.get_json()
        item_id = str(data.get("id"))

        if not item_id:
            return jsonify({"error": "Aucun id fourni"}), 400

        # Lecture JSON
        async with aiofiles.open(SHOP_JSON_PATH, mode='r', encoding='utf-8') as f:
            content = await f.read()
            shop_data = json.loads(content)

        shop_items = shop_data.get("shop_items", [])
        item = next((i for i in shop_items if i.get("id") == item_id), None)

        if not item:
            return jsonify({"error": "Article non trouvé"}), 404

        price = item["price"]
        key = item.get("key", "")
        amount = item.get("amount", 0)

        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Utilisateur non connecté"}), 401

        pool = await get_pool()
        async with pool.acquire() as conn:

            # Déduction du prix
            async with conn.cursor() as cur:
                if item_id in ["1", "7", "8"]:  # id spéciaux
                    await cur.execute("SELECT solde FROM solde WHERE user_id=%s", (user_id,))
                    row = await cur.fetchone()
                    if not row: return jsonify({"error": "Solde introuvable"}), 404
                    current_solde = row[0]
                    if current_solde < price: return jsonify({"error": "Solde insuffisant"}), 400
                    await cur.execute("UPDATE solde SET solde = solde - %s WHERE user_id=%s", (price, user_id))
                else:  # Autres achats, déduction depuis total_coins
                    await cur.execute("SELECT total_coins FROM user_stats WHERE user_id=%s", (user_id,))
                    row = await cur.fetchone()
                    if not row: return jsonify({"error": "User stats introuvable"}), 404
                    total_coins = row[0]
                    if total_coins < price: return jsonify({"error": "Coins insuffisants"}), 400
                    await cur.execute("UPDATE user_stats SET total_coins = total_coins - %s WHERE user_id=%s", (price, user_id))

            # S'assurer qu'une ligne existe dans booster
            async with conn.cursor() as cur:
                await cur.execute("SELECT user_id FROM booster WHERE user_id=%s", (user_id,))
                row = await cur.fetchone()
                if not row:
                    await cur.execute("""
                        INSERT INTO booster (user_id, vie, double_pieces, bouclier, attaque_speciale, double_saut)
                        VALUES (%s, 0, 0, 0, 0, 0)
                    """, (user_id,))

            # Appliquer le booster
            async with conn.cursor() as cur:
                if key == "ulrich":
                    return jsonify({"error": "Achat de ce booster impossible pour le moment"}), 400

                elif key == "hilaire":
                    await cur.execute("SELECT vie FROM booster WHERE user_id=%s", (user_id,))
                    row = await cur.fetchone()
                    if row[0] >= 1: return jsonify({"error": "Vous avez déjà ce booster (vie)"}), 400
                    await cur.execute("UPDATE booster SET vie = vie + %s WHERE user_id=%s", (amount, user_id))

                elif key == "jeicke":
                    await cur.execute("SELECT double_pieces FROM booster WHERE user_id=%s", (user_id,))
                    row = await cur.fetchone()
                    if row[0] >= 1: return jsonify({"error": "Vous avez déjà ce booster (double pièces)"}), 400
                    await cur.execute("UPDATE booster SET double_pieces = double_pieces + %s WHERE user_id=%s", (amount, user_id))

                elif key == "lucia":
                    await cur.execute("SELECT bouclier FROM booster WHERE user_id=%s", (user_id,))
                    row = await cur.fetchone()
                    if row[0] >= 1: return jsonify({"error": "Vous avez déjà ce booster (bouclier)"}), 400
                    await cur.execute("UPDATE booster SET bouclier = bouclier + %s WHERE user_id=%s", (amount, user_id))

                elif key == "hafsat":
                    await cur.execute("SELECT attaque_speciale FROM booster WHERE user_id=%s", (user_id,))
                    row = await cur.fetchone()
                    if row[0] >= 1: return jsonify({"error": "Vous avez déjà ce booster (attaque spéciale)"}), 400
                    await cur.execute("UPDATE booster SET attaque_speciale = attaque_speciale + %s WHERE user_id=%s", (amount, user_id))

                elif key == "sophie":
                    await cur.execute("SELECT double_saut FROM booster WHERE user_id=%s", (user_id,))
                    row = await cur.fetchone()
                    if row[0] >= 1: return jsonify({"error": "Vous avez déjà ce booster (double saut)"}), 400
                    await cur.execute("UPDATE booster SET double_saut = double_saut + %s WHERE user_id=%s", (amount, user_id))

                elif key == "emma":
                    await cur.execute("UPDATE user_stats SET total_coins = total_coins + 1000 WHERE user_id=%s", (user_id,))

                elif key == "lalma":
                    await cur.execute("UPDATE user_stats SET total_coins = total_coins + 10000 WHERE user_id=%s", (user_id,))

        return jsonify({"id": item_id, "price": price, "message": "Achat effectué avec succès !"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/hilaire", methods=["GET"])
async def hilaire():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Utilisateur non connecté"}), 401

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT vie, double_pieces, bouclier, attaque_speciale, double_saut
                FROM booster
                WHERE user_id=%s
            """, (user_id,))
            row = await cur.fetchone()

            # Valeurs par défaut si aucune ligne
            boosters = {
                "vie": 0,
                "double_pieces": 0,
                "bouclier": 0,
                "attaque_speciale": 0,
                "double_saut": 0
            }

            if row:
                boosters["vie"] = row[0]
                boosters["double_pieces"] = row[1]
                boosters["bouclier"] = row[2]
                boosters["attaque_speciale"] = row[3]
                boosters["double_saut"] = row[4]

    return jsonify(boosters)



@app.route("/lucia", methods=["POST"])
async def lucia():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Utilisateur non connecté"}), 401

    data = await request.get_json()
    action = data.get("action")

    if action not in ("start", "vie"):
        return jsonify({"error": "Action invalide"}), 400

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:

            # 🔴 UTILISATION D'UNE VIE (ressusciter)
            if action == "vie":
                await cur.execute("""
                    SELECT vie FROM booster
                    WHERE user_id=%s
                    FOR UPDATE
                """, (user_id,))
                row = await cur.fetchone()

                if not row or row[0] <= 0:
                    return jsonify({
                        "success": False,
                        "message": "Aucune vie disponible"
                    }), 400

                await cur.execute("""
                    UPDATE booster
                    SET vie = vie - 1
                    WHERE user_id=%s
                """, (user_id,))

                return jsonify({
                    "success": True,
                    "used": "vie"
                })

            # 🔵 UTILISATION DES BOOSTERS AU DÉMARRAGE
            if action == "start":
                await cur.execute("""
                    UPDATE booster
                    SET
                        double_pieces = IF(double_pieces > 0, double_pieces - 1, 0),
                        bouclier = IF(bouclier > 0, bouclier - 1, 0),
                        attaque_speciale = IF(attaque_speciale > 0, attaque_speciale - 1, 0),
                        double_saut = IF(double_saut > 0, double_saut - 1, 0)
                    WHERE user_id=%s
                """, (user_id,))

                return jsonify({
                    "success": True,
                    "used": "start_boosters"
                })







# -------------------
# Lancement du serveur avec Uvicorn
# -------------------
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "wari:app",
        host="0.0.0.0", 
        port=5000,
        workers=1,                    # Processes
        loop="asyncio",               # Use asyncio loop
        timeout_keep_alive=30,        # Keep-alive timeout
    )