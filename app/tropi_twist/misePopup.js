// misePopup.js
// Popup de mise ("Votre Mise!") affiché avant de jouer un niveau. Le joueur
// choisit un montant entre CONFIG.MISE_MIN et CONFIG.MISE_MAX (par pas de
// CONFIG.MISE_PAS) avec des boutons -/+, puis confirme avec le bouton
// Continue pour lancer réellement la partie. Possédé par LevelSelect (voir
// levelSelect.js), qui l'ouvre au tap sur un niveau et lit le résultat via
// recupererMiseConfirmee().

class MisePopup {
  constructor(assets) {
    this.assets = assets;

    this.actif = false;
    this.fermeture = false;
    this.niveau = null;
    this.montantTexte = String(CONFIG.MISE_MIN); // saisie brute de l'utilisateur (voir app.js::_synchroniserInputMise)

    this.alpha = 0;
    this.echelle = 1;
    this.tween = new Tween();

    // Rects recalculés à chaque frame (voir _mettreAJourLayout)
    this._rectPanel = null;
    this._rectZone = null;
    this._rectContinuer = null;
  }

  ouvrir(niveau, montantParDefaut = CONFIG.MISE_MIN) {
    this.niveau = niveau;
    const borne = Math.max(CONFIG.MISE_MIN, Math.min(CONFIG.MISE_MAX, montantParDefaut));
    this.montantTexte = String(borne);
    this.actif = true;
    this.fermeture = false;
    this.alpha = 0;
    this.echelle = 0.82;

    this.tween
      .tweenProperty(this, "alpha", 1, 0.18)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_OUT);
    this.tween
      .tweenProperty(this, "echelle", 1.04, 0.18)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_OUT)
      .setOnComplete(() => {
        this.tween
          .tweenProperty(this, "echelle", 1.0, 0.10)
          .setTrans(TransitionType.QUAD)
          .setEase(EaseType.EASE_IN);
      });
  }

  // Ferme le popup avec une petite animation puis appelle `apresFermeture`
  // une fois terminé (annulation : rien à faire ; confirmation : géré par
  // LevelSelect via recupererMiseConfirmee()).
  fermer(apresFermeture) {
    if (!this.actif || this.fermeture) return;
    this.fermeture = true;

    this.tween
      .tweenProperty(this, "alpha", 0, 0.14)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_IN)
      .setOnComplete(() => {
        this.actif = false;
        this.fermeture = false;
        if (apresFermeture) apresFermeture();
      });
    this.tween
      .tweenProperty(this, "echelle", 0.85, 0.14)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_IN);
  }

  update(dt) {
    this.tween.update(dt);
  }

  // Convertit la saisie libre de l'utilisateur en montant valide, bornée
  // entre CONFIG.MISE_MIN et CONFIG.MISE_MAX (texte vide/non numérique -> min).
  obtenirMontantValide() {
    const nombre = parseInt(this.montantTexte, 10);
    if (Number.isNaN(nombre)) return CONFIG.MISE_MIN;
    return Math.max(CONFIG.MISE_MIN, Math.min(CONFIG.MISE_MAX, nombre));
  }

  // Rect (coordonnées canvas 0..L / 0..H) de la zone de saisie, pour que
  // app.js puisse y positionner un <input> HTML par-dessus le canvas.
  obtenirRectZone() {
    return this._rectZone;
  }

  _mettreAJourLayout(L, H) {
    const panelImg = this.assets.misePanelImg;
    const largeurPanel = L * 0.72;
    const ratioPanel = (panelImg.loaded && panelImg.image)
      ? panelImg.image.height / panelImg.image.width
      : 0.9;
    const hauteurPanel = largeurPanel * ratioPanel;
    const x = (L - largeurPanel) / 2;
    const y = (H - hauteurPanel) / 2;

    this._rectPanel = { x, y, largeur: largeurPanel, hauteur: hauteurPanel };

    // Zone de saisie du montant (rectangle creux de l'image "Votre Mise!") —
    // coordonnées mesurées avec positionneur_mise.html.
    this._rectZone = {
      x: x + largeurPanel * 0.0866,
      y: y + hauteurPanel * 0.3608,
      largeur: largeurPanel * 0.8300,
      hauteur: hauteurPanel * 0.2600,
    };

    // Bouton Continue — position/taille mesurées manuellement elles aussi
    // (positionneur_mise.html), plus de centrage/ratio automatique.
    this._rectContinuer = {
      x: x + largeurPanel * 0.2226,
      y: y + hauteurPanel * 0.7046,
      largeur: largeurPanel * 0.5000,
      hauteur: hauteurPanel * 0.1600,
    };
  }

  _contient(rect, mx, my) {
    return rect && mx >= rect.x && mx <= rect.x + rect.largeur && my >= rect.y && my <= rect.y + rect.hauteur;
  }

  // Retourne "continuer" | "fermer" | null. À appeler uniquement si
  // this.actif est vrai (voir levelSelect.js).
  gererClic(mx, my, L, H) {
    if (!this.actif || this.fermeture) return null;
    this._mettreAJourLayout(L, H);

    if (this._contient(this._rectContinuer, mx, my)) return "continuer";
    if (!this._contient(this._rectPanel, mx, my)) return "fermer"; // tap hors du panneau
    return null;
  }

  dessiner(ctx, L, H) {
    if (!this.actif && this.alpha <= 0) return;
    this._mettreAJourLayout(L, H);

    // Voile sombre derrière le panneau
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.55;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, L, H);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(L / 2, H / 2);
    ctx.scale(this.echelle, this.echelle);
    ctx.translate(-L / 2, -H / 2);

    const r = this._rectPanel;
    const panelImg = this.assets.misePanelImg;
    if (panelImg.loaded && panelImg.image) {
      ctx.drawImage(panelImg.image, r.x, r.y, r.largeur, r.hauteur);
    } else {
      ctx.fillStyle = "#e8b478";
      ctx.strokeStyle = "#5a3a2a";
      ctx.lineWidth = 4;
      ctx.fillRect(r.x, r.y, r.largeur, r.hauteur);
      ctx.strokeRect(r.x, r.y, r.largeur, r.hauteur);
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(r.largeur * 0.09);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Votre Mise !", r.x + r.largeur / 2, r.y + r.hauteur * 0.16);

      const zone = this._rectZone;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(zone.x, zone.y, zone.largeur, zone.hauteur);
    }

    // Le montant lui-même n'est pas dessiné ici : app.js positionne un
    // <input> HTML au-dessus de _rectZone, où l'utilisateur tape sa mise
    // directement (voir _synchroniserInputMise() dans app.js).

    const btn = this._rectContinuer;
    const continueImg = this.assets.continueWinBtn;
    if (continueImg.loaded && continueImg.image) {
      ctx.drawImage(continueImg.image, btn.x, btn.y, btn.largeur, btn.hauteur);
    } else {
      ctx.save();
      ctx.fillStyle = "#5a9c3a";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(btn.x, btn.y, btn.largeur, btn.hauteur, btn.hauteur / 2);
      else ctx.rect(btn.x, btn.y, btn.largeur, btn.hauteur);
      ctx.fill();
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(btn.hauteur * 0.5);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Continue", btn.x + btn.largeur / 2, btn.y + btn.hauteur / 2);
      ctx.restore();
    }

    ctx.restore();
  }
}
