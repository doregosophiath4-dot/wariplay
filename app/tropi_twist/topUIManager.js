// topUIManager.js
// Port JS de top_ui_manager.py : score, coups restants, barre de score,
// et Goal UI (objectifs du niveau avec icône + compteur).

class TopUIManager {
  constructor(assets) {
    this.assets = assets;

    this.x = 0;
    this.y = 0;
    this.largeur = 0;
    this.hauteur = 0;

    // Zones proportionnelles (identiques à top_ui_manager.py)
    this.zoneGauche = 0.15;
    this.zoneCentre = 0.50;
    this.zoneDroite = 0.85;

    this.zoneHautTemps = 0.40;
    this.zoneHautScore = 0.18;
    this.zoneHautGoal = 0.15;

    this.tailleFontRef = 38;
    this.tailleFontPetiteRef = 16;
  }

  setup(x, y, largeur, hauteur) {
    this.x = x;
    this.y = y;
    this.largeur = largeur;
    this.hauteur = hauteur;
  }

  positionGauche() {
    return { x: this.x + this.largeur * this.zoneGauche, y: this.y + this.hauteur * this.zoneHautScore };
  }

  positionCentre() {
    return { x: this.x + this.largeur * this.zoneCentre, y: this.y + this.hauteur * this.zoneHautTemps };
  }

  positionScoreBar() {
    const pos = this.positionGauche();
    return { x: pos.x - this.largeur * 0.12, y: pos.y + this.hauteur * 0.16 };
  }

  positionGoal(index) {
    const largeurGoal = this.largeur * 0.16;
    const droiteX = this.x + this.largeur * this.zoneDroite;
    const y = this.y + this.hauteur * this.zoneHautGoal;
    if (index === 0) {
      return { x: droiteX - largeurGoal - this.largeur * 0.01, y, largeur: largeurGoal };
    }
    return { x: droiteX + this.largeur * 0.01, y, largeur: largeurGoal };
  }

  dessinerFond(ctx) {
    const entry = this.assets.topUI;
    if (entry.loaded && entry.image) {
      ctx.drawImage(entry.image, this.x, this.y, this.largeur, this.hauteur);
    } else {
      ctx.fillStyle = "#2b2b45";
      ctx.fillRect(this.x, this.y, this.largeur, this.hauteur);
    }
  }

  _texte(ctx, texte, x, y, taille, couleur = CONFIG.BLANC, align = "center") {
    ctx.save();
    ctx.fillStyle = couleur;
    ctx.font = this.assets.getFont(taille);
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(String(texte), x, y);
    ctx.restore();
  }

  dessinerScore(ctx, score) {
    const pos = this.positionGauche();
    this._texte(ctx, score, pos.x, pos.y, this.tailleFontRef * 0.6);
  }

  dessinerCoups(ctx, coupsRestants) {
    const pos = this.positionCentre();
    this._texte(ctx, coupsRestants, pos.x, pos.y, this.tailleFontRef * 0.7);
  }

  dessinerScoreBar(ctx, score, scoreMax) {
    const bg = this.assets.scoreBarBg;
    const fill = this.assets.scoreBarFill;
    const pos = this.positionScoreBar();
    const largeurBar = this.largeur * 0.27;
    const hauteurBar = this.hauteur * 0.11;

    if (bg.loaded && bg.image) {
      ctx.drawImage(bg.image, pos.x, pos.y, largeurBar, hauteurBar);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(pos.x, pos.y, largeurBar, hauteurBar);
    }

    const ratio = Math.min(score / scoreMax, 1.0);
    const largeurFill = largeurBar * ratio;

    if (largeurFill > 0) {
      if (fill.loaded && fill.image) {
        const srcW = fill.image.width * ratio;
        ctx.drawImage(fill.image, 0, 0, srcW, fill.image.height, pos.x, pos.y, largeurFill, hauteurBar);
      } else {
        ctx.fillStyle = "#f5d90a";
        ctx.fillRect(pos.x, pos.y, largeurFill, hauteurBar);
      }
    }
  }

  // levelGoals: objet { goalKey: total } (déjà résolu, "all"/true remplacé
  // par la vraie valeur côté main.js) ; objectifsProgression: { goalKey: n }
  dessinerGoals(ctx, levelGoals, objectifsProgression, assetLoaderPieces) {
    if (!levelGoals) return;
    const entries = Object.entries(levelGoals).slice(0, 2);

    entries.forEach(([goalKey, total], idx) => {
      const pos = this.positionGoal(idx);
      const goalBg = this.assets.goalBg;

      if (goalBg.loaded && goalBg.image) {
        ctx.drawImage(goalBg.image, pos.x, pos.y, pos.largeur, pos.largeur);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(pos.x, pos.y, pos.largeur, pos.largeur);
      }

      // Icône de l'objectif (pièce de couleur ou obstacle)
      const iconTaille = pos.largeur * 0.55;
      const iconX = pos.x + (pos.largeur - iconTaille) / 2;
      const iconY = pos.y + pos.largeur * 0.08;

      const entryIcone = this._entreeIconeGoal(goalKey, assetLoaderPieces);
      if (entryIcone && entryIcone.loaded && entryIcone.image) {
        ctx.drawImage(entryIcone.image, iconX, iconY, iconTaille, iconTaille);
      } else if (CONFIG.PIECES_FILES[goalKey]) {
        ctx.fillStyle = assetLoaderPieces.getCouleurFallback(goalKey);
        ctx.fillRect(iconX, iconY, iconTaille, iconTaille);
      } else {
        ctx.fillStyle = "#888";
        ctx.fillRect(iconX, iconY, iconTaille, iconTaille);
      }

      const progression = objectifsProgression[goalKey] || 0;
      const texte = `${progression}/${total}`;
      this._texte(ctx, texte, pos.x + pos.largeur / 2, pos.y + pos.largeur * 0.85, pos.largeur * 0.22, CONFIG.BLANC);
    });
  }

  _entreeIconeGoal(goalKey, assetLoaderPieces) {
    if (CONFIG.PIECES_FILES[goalKey]) return assetLoaderPieces.getPieceEntry(CONFIG.PIECES_FILES[goalKey]);
    if (goalKey === "ice" || goalKey === "ice_break") return this.assets.iceOverlay;
    if (goalKey === "slime") return this.assets.slimeOverlay;
    if (goalKey === "locks") return this.assets.locksOverlay;
    if (goalKey === "concrete") return this.assets.concreteOverlay;
    if (goalKey === "sinker") return this.assets.sinkerOverlay;
    return null;
  }

  dessiner(ctx, { score, coupsRestants, scoreMax, levelGoals, objectifsProgression, assetLoaderPieces }) {
    this.dessinerFond(ctx);
    this.dessinerScore(ctx, score);
    this.dessinerCoups(ctx, coupsRestants);
    this.dessinerScoreBar(ctx, score, scoreMax);
    this.dessinerGoals(ctx, levelGoals, objectifsProgression, assetLoaderPieces);
  }
}