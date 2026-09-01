// bottomUIManager.js
// Port JS de bottom_ui_manager.py : barre du bas, bouton pause, et boutons
// de boosters (Color Bomb / Mallet / Add Time) selon le niveau.

class BottomUIManager {
  constructor(assets, boosterManager) {
    this.assets = assets;
    this.boosterManager = boosterManager;

    this.x = 0;
    this.y = 0;
    this.largeur = 0;
    this.hauteur = 0;

    this.boutonPauseRect = null;
    this.survolPause = false;

    this.boutonsBoosters = []; // { rect, type, survole }
  }

  setup(x, y, largeur, hauteur) {
    this.x = x;
    this.y = y;
    this.largeur = largeur;
    this.hauteur = hauteur;

    const tailleBouton = hauteur * 0.55;
    const espaceTotal = largeur * 0.70;
    const espaceEntre = espaceTotal / 5;
    const debutX = x + (largeur - espaceTotal) / 2;
    const boutonY = y + (hauteur - tailleBouton) / 2;

    // Bouton Pause (position 1 sur 5)
    const pauseX = debutX + espaceEntre * 1 - tailleBouton / 2;
    this.boutonPauseRect = { x: pauseX, y: boutonY, largeur: tailleBouton, hauteur: tailleBouton };

    // Boosters disponibles (positions 2, 3, 4 sur 5)
    this.boutonsBoosters = [];
    const boosters = this.boosterManager ? this.boosterManager.getAvailableBoosters() : [];
    boosters.slice(0, 3).forEach((type, i) => {
      const bx = debutX + espaceEntre * (i + 2) - tailleBouton / 2;
      this.boutonsBoosters.push({
        rect: { x: bx, y: boutonY, largeur: tailleBouton, hauteur: tailleBouton },
        type,
        survole: false,
      });
    });
  }

  _contient(rect, mx, my) {
    return rect && mx >= rect.x && mx <= rect.x + rect.largeur && my >= rect.y && my <= rect.y + rect.hauteur;
  }

  // Retourne "pause", un type de booster, ou null
  gererClic(mx, my) {
    if (this._contient(this.boutonPauseRect, mx, my)) return "pause";
    for (const bouton of this.boutonsBoosters) {
      if (this._contient(bouton.rect, mx, my)) return bouton.type;
    }
    return null;
  }

  survoler(mx, my) {
    this.survolPause = this._contient(this.boutonPauseRect, mx, my);
    for (const bouton of this.boutonsBoosters) {
      bouton.survole = this._contient(bouton.rect, mx, my);
    }
  }

  dessiner(ctx) {
    const bg = this.assets.bottomUI;
    if (bg.loaded && bg.image) {
      ctx.drawImage(bg.image, this.x, this.y, this.largeur, this.hauteur);
    } else {
      ctx.fillStyle = "#20203a";
      ctx.fillRect(this.x, this.y, this.largeur, this.hauteur);
    }

    this._dessinerPause(ctx);
    for (const bouton of this.boutonsBoosters) {
      this._dessinerBooster(ctx, bouton);
    }
  }

  _dessinerPause(ctx) {
    const r = this.boutonPauseRect;
    const boutonImg = this.assets.pauseBtn;
    if (boutonImg.loaded && boutonImg.image) {
      ctx.drawImage(boutonImg.image, r.x, r.y, r.largeur, r.hauteur);
    } else {
      ctx.fillStyle = "#eeeeee";
      ctx.beginPath();
      ctx.arc(r.x + r.largeur / 2, r.y + r.hauteur / 2, r.largeur / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#222";
      const barW = r.largeur * 0.12;
      const barH = r.hauteur * 0.4;
      ctx.fillRect(r.x + r.largeur / 2 - barW * 1.4, r.y + r.hauteur / 2 - barH / 2, barW, barH);
      ctx.fillRect(r.x + r.largeur / 2 + barW * 0.4, r.y + r.hauteur / 2 - barH / 2, barW, barH);
    }

    if (this.survolPause) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = CONFIG.BLANC;
      ctx.fillRect(r.x, r.y, r.largeur, r.hauteur);
      ctx.restore();
    }
  }

  _dessinerBooster(ctx, bouton) {
    const r = bouton.rect;
    const img = this.boosterManager.getBoosterImage(bouton.type);
    const actif = this.boosterManager.getActiveBooster() === bouton.type;

    if (img && img.loaded && img.image) {
      ctx.drawImage(img.image, r.x, r.y, r.largeur, r.hauteur);
    } else {
      ctx.fillStyle = "#444466";
      ctx.beginPath();
      ctx.arc(r.x + r.largeur / 2, r.y + r.hauteur / 2, r.largeur / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (actif) {
      ctx.save();
      ctx.strokeStyle = "#f5d90a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x + r.largeur / 2, r.y + r.hauteur / 2, r.largeur / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (bouton.survole) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = CONFIG.BLANC;
      ctx.fillRect(r.x, r.y, r.largeur, r.hauteur);
      ctx.restore();
    }

    // Compteur (cercle rouge + chiffre, comme bottom_ui_manager.py)
    const compte = this.boosterManager.getBoosterCount(bouton.type);
    const cx = r.x + r.largeur - 8;
    const cy = r.y + r.hauteur - 8;
    ctx.fillStyle = "#c83232";
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CONFIG.BLANC;
    ctx.font = this.assets.getFont(14);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(compte), cx, cy);
  }
}