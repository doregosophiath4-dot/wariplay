// levelSelect.js
// Port JS de level_select.py : carte scrollable avec boutons de niveau
// (vert = débloqué, rouge = verrouillé), étoiles, et bouton Quit.

class LevelSelect {
  constructor(assets, configManager) {
    this.assets = assets;
    this.configManager = configManager;

    this.largeur = CONFIG.LARGEUR_REFERENCE;
    this.hauteur = CONFIG.HAUTEUR_REFERENCE;

    this.ratio = this.largeur / 480; // comme level_select.py (référence 480px)
    this.boutonTaille = 70 * this.ratio;
    this.starTaille = 40 * this.ratio;
    this.starOffset = 6 * this.ratio;
    this.quitTaille = 50 * this.ratio;

    this.quitX = 10 * this.ratio;
    this.quitY = 10 * this.ratio;

    this.scrollY = this.configManager.getLevelSelectScroll();
    this.targetY = this.scrollY;

    // Popup de mise ("Votre Mise!") affiché au tap sur un niveau débloqué —
    // il faut confirmer une mise avant que la partie démarre réellement.
    this.misePopup = new MisePopup(assets);
    this._miseConfirmee = null; // { niveau, montant } — lu par app.js via recupererMiseConfirmee()

    this._chargerImages();
    this._construireCarte();
  }

  _chargerImages() {
    this.imagesOriginales = [
      this.assets.charger(`${CONFIG.LEVEL_SELECT_PATH}/${CONFIG.LEVEL_SELECT_MAP_1}`),
      this.assets.charger(`${CONFIG.LEVEL_SELECT_PATH}/${CONFIG.LEVEL_SELECT_MAP_2}`),
      this.assets.charger(`${CONFIG.LEVEL_SELECT_PATH}/${CONFIG.LEVEL_SELECT_MAP_3}`),
    ];
    this.redBtn = this.assets.charger(`${CONFIG.LEVEL_SELECT_PATH}/${CONFIG.RED_BUTTON_FILE}`);
    this.greenBtn = this.assets.charger(`${CONFIG.LEVEL_SELECT_PATH}/${CONFIG.GREEN_BUTTON_FILE}`);
    this.starBlank = this.assets.charger(`${CONFIG.LEVEL_SELECT_PATH}/${CONFIG.STAR_BLANK_FILE}`);
    this.starFilled = this.assets.charger(`${CONFIG.LEVEL_SELECT_PATH}/${CONFIG.STAR_FILLED_FILE}`);
    this.quitBtn = this.assets.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.QUIT_BUTTON_FILE}`);
  }

  // La hauteur totale de la carte dépend des images (une fois chargées) ;
  // en attendant on prend une estimation raisonnable pour le scroll.
  _construireCarte() {
    this.totalH = this.hauteur * 2.2; // estimation ; ajustée dès que les images sont prêtes
    this.maxScroll = Math.max(0, this.totalH - this.hauteur);
  }

  _ajusterHauteurCarte() {
    const chargees = this.imagesOriginales.filter((i) => i.loaded && i.image);
    if (chargees.length === this.imagesOriginales.length && !this._hauteurAjustee) {
      let total = 0;
      for (const img of chargees) {
        const ratioImg = this.largeur / img.image.width;
        total += img.image.height * ratioImg;
      }
      this.totalH = total;
      this.maxScroll = Math.max(0, this.totalH - this.hauteur);
      this.scrollY = Math.min(this.scrollY, this.maxScroll);
      this.targetY = this.scrollY;
      this._hauteurAjustee = true;
    }
  }

  sauvegarderScroll() {
    this.configManager.setLevelSelectScroll(Math.round(this.scrollY));
  }

  // Retourne ["quit", null] | ["level", n] | [null, null]
  gererClic(mx, my) {
    // Le popup de mise capture tous les clics tant qu'il est ouvert.
    if (this.misePopup.actif) {
      const action = this.misePopup.gererClic(mx, my, this.largeur, this.hauteur);
      if (action === "continuer") {
        const niveau = this.misePopup.niveau;
        const montant = this.misePopup.obtenirMontantValide();
        this.misePopup.fermer(() => {
          this._miseConfirmee = { niveau, montant };
        });
      } else if (action === "fermer") {
        this.misePopup.fermer();
      }
      return [null, null];
    }

    const quitRect = { x: this.quitX, y: this.quitY, largeur: this.quitTaille, hauteur: this.quitTaille };
    if (this._contient(quitRect, mx, my)) {
      this.sauvegarderScroll();
      return ["quit", null];
    }

    for (let i = 0; i < CONFIG.LEVEL_POSITIONS.length; i++) {
      const [bx, by] = CONFIG.LEVEL_POSITIONS[i];
      const bxS = bx * this.ratio;
      const byS = by * this.ratio;
      const sx = bxS - this.boutonTaille / 2;
      const sy = byS - this.scrollY - this.boutonTaille / 2;
      const rect = { x: sx, y: sy, largeur: this.boutonTaille, hauteur: this.boutonTaille };

      if (this._contient(rect, mx, my)) {
        if (this.configManager.isLevelUnlocked(i + 1)) {
          this.sauvegarderScroll();
          // On ne lance pas la partie tout de suite : il faut d'abord miser.
          this.misePopup.ouvrir(i + 1);
        }
        return [null, null];
      }
    }

    return [null, null];
  }

  // À appeler une fois par frame par app.js : renvoie { niveau, montant }
  // une seule fois, dès que le popup de mise a fini de se fermer après une
  // confirmation (et seulement à ce moment-là, pour laisser jouer l'anim).
  recupererMiseConfirmee() {
    if (this._miseConfirmee && !this.misePopup.actif && !this.misePopup.fermeture) {
      const resultat = this._miseConfirmee;
      this._miseConfirmee = null;
      return resultat;
    }
    return null;
  }

  _contient(rect, mx, my) {
    return mx >= rect.x && mx <= rect.x + rect.largeur && my >= rect.y && my <= rect.y + rect.hauteur;
  }

  gererMolette(deltaY) {
    if (this.misePopup.actif) return; // pas de scroll derrière le popup de mise
    this.targetY = Math.max(0, Math.min(this.maxScroll, this.targetY + deltaY));
  }

  // Défilement tactile : suit le doigt au pixel près (pas de lissage), pour
  // un glissement direct comme dans une liste native. deltaY est le
  // déplacement du doigt depuis le dernier événement (voir app.js).
  gererDrag(deltaY) {
    if (this.misePopup.actif) return; // pas de scroll derrière le popup de mise
    const nouveauY = Math.max(0, Math.min(this.maxScroll, this.scrollY + deltaY));
    this.scrollY = nouveauY;
    this.targetY = nouveauY;
  }

  update(dt) {
    this._ajusterHauteurCarte();
    this.scrollY += (this.targetY - this.scrollY) * 0.15;
    this.misePopup.update(dt);
  }

  dessiner(ctx) {
    ctx.fillStyle = CONFIG.NOIR;
    ctx.fillRect(0, 0, this.largeur, this.hauteur);

    // Empile les 3 images de fond façon "carte" verticale, avec le scroll
    let y = -this.scrollY;
    for (const img of this.imagesOriginales) {
      if (img.loaded && img.image) {
        const ratioImg = this.largeur / img.image.width;
        const h = img.image.height * ratioImg;
        if (y + h > 0 && y < this.hauteur) {
          ctx.drawImage(img.image, 0, y, this.largeur, h);
        }
        y += h;
      }
    }

    for (let i = 0; i < CONFIG.LEVEL_POSITIONS.length; i++) {
      const niveauNum = i + 1;
      const debloque = this.configManager.isLevelUnlocked(niveauNum);
      const [bx, by] = CONFIG.LEVEL_POSITIONS[i];
      const bxS = bx * this.ratio;
      const byS = by * this.ratio;
      const sx = bxS - this.boutonTaille / 2;
      const sy = byS - this.scrollY - this.boutonTaille / 2;

      if (sy > this.hauteur + 60 || sy < -(this.boutonTaille + this.starTaille + 20)) continue;

      const btn = debloque ? this.greenBtn : this.redBtn;
      if (btn.loaded && btn.image) {
        ctx.drawImage(btn.image, sx, sy, this.boutonTaille, this.boutonTaille);
      } else {
        ctx.fillStyle = debloque ? "#3ba14a" : "#a13b3b";
        ctx.beginPath();
        ctx.arc(sx + this.boutonTaille / 2, sy + this.boutonTaille / 2, this.boutonTaille / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(28 * this.ratio);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(niveauNum), sx + this.boutonTaille / 2, sy + this.boutonTaille / 2);
      ctx.restore();

      // Étoile (pleine si score max atteint pour ce niveau)
      const niveauData = LEVELS_DATA[niveauNum];
      const scoreMax = niveauData ? niveauData.score_max : 0;
      const rempli = debloque && this.configManager.isLevelCompletedWithMaxScore(niveauNum, scoreMax);
      const starImg = rempli ? this.starFilled : this.starBlank;
      const starX = sx + (this.boutonTaille - this.starTaille) / 2;
      const starY = sy + this.boutonTaille + this.starOffset;

      if (starImg.loaded && starImg.image) {
        ctx.drawImage(starImg.image, starX, starY, this.starTaille, this.starTaille);
      }
    }

    const quitImg = this.quitBtn;
    if (quitImg.loaded && quitImg.image) {
      ctx.drawImage(quitImg.image, this.quitX, this.quitY, this.quitTaille, this.quitTaille);
    } else {
      ctx.fillStyle = "#eeeeee";
      ctx.fillRect(this.quitX, this.quitY, this.quitTaille, this.quitTaille);
    }

    this.misePopup.dessiner(ctx, this.largeur, this.hauteur);
  }
}