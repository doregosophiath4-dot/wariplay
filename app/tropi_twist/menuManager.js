// menuManager.js
// Port JS de menu_manager.py : menu principal (Play / Settings) et écran
// des réglages (Sound toggle / Back), rendu sur le canvas partagé.
//
// Les rects sont recalculés à chaque frame à partir du ratio RÉEL de
// chaque image une fois chargée (largeur cible fixe, hauteur = largeur *
// image.height/image.width), pour ne jamais étirer les boutons/logos.
// Tant qu'une image n'est pas encore chargée, un ratio de secours est
// utilisé et corrigé dès que l'image arrive.

class MenuButton {
  constructor(image, ratioFallback = 0.35) {
    this.image = image;
    this.ratioFallback = ratioFallback;
    this.rect = { x: 0, y: 0, largeur: 0, hauteur: 0 };
    this.survole = false;
  }

  // Calcule rect.hauteur à partir du ratio réel de l'image (ou du ratio
  // de secours tant qu'elle n'est pas chargée), et positionne le bouton.
  positionner(x, y, largeur) {
    const ratio = (this.image && this.image.loaded && this.image.image)
      ? this.image.image.height / this.image.image.width
      : this.ratioFallback;
    this.rect = { x, y, largeur, hauteur: largeur * ratio };
    return this.rect.hauteur;
  }

  contient(mx, my) {
    const r = this.rect;
    return mx >= r.x && mx <= r.x + r.largeur && my >= r.y && my <= r.y + r.hauteur;
  }

  dessiner(ctx) {
    const r = this.rect;
    if (this.image && this.image.loaded && this.image.image) {
      ctx.drawImage(this.image.image, r.x, r.y, r.largeur, r.hauteur);
    } else {
      ctx.fillStyle = "#444466";
      ctx.fillRect(r.x, r.y, r.largeur, r.hauteur);
    }
    if (this.survole) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = CONFIG.BLANC;
      ctx.fillRect(r.x, r.y, r.largeur, r.hauteur);
      ctx.restore();
    }
  }
}

class MenuManager {
  constructor(assets, configManager) {
    this.assets = assets;
    this.configManager = configManager;
    this.modeSettings = false;

    this.largeur = CONFIG.LARGEUR_REFERENCE;
    this.hauteur = CONFIG.HAUTEUR_REFERENCE;

    // Transition glissée + fondu entre l'écran Menu et l'écran Réglages.
    this.enTransition = false;
    this.transitionProgress = 0; // 0 = ancien contenu plein écran, 1 = nouveau contenu plein écran
    this.transitionDirection = 1; // 1 = menu -> réglages, -1 = réglages -> menu
    this._modeCible = false;
    this._transitionTween = new Tween();

    this._chargerImages();
  }

  _img(chemin) {
    return this.assets.charger(chemin);
  }

  _chargerImages() {
    this.logoImg = this._img(`${CONFIG.UI_PATH}/${CONFIG.LOGO_FILE}`);
    this.settingsTitleImg = this._img(`${CONFIG.UI_PATH}/${CONFIG.SETTINGS_TITLE_FILE}`);

    this.boutonPlay = new MenuButton(this._img(`${CONFIG.BUTTONS_PATH}/${CONFIG.PLAY_BUTTON_FILE}`), 0.35);
    this.boutonSettingsMenu = new MenuButton(this._img(`${CONFIG.BUTTONS_PATH}/${CONFIG.SETTINGS_BUTTON_FILE}`), 0.35);
    this.boutonSound = new MenuButton(this._img(`${CONFIG.BUTTONS_PATH}/${CONFIG.SOUND_BUTTON_FILE}`), 0.35);
    this.boutonSoundOff = new MenuButton(this._img(`${CONFIG.BUTTONS_PATH}/${CONFIG.SOUND_OFF_BUTTON_FILE}`), 0.35);
    this.boutonBack = new MenuButton(this._img(`${CONFIG.BUTTONS_PATH}/${CONFIG.BACK_BUTTON_FILE}`), 0.35);

    this.backgroundImg = this._img(`${CONFIG.BACKGROUNDS_PATH}/${CONFIG.MENU_BACKGROUND_FILE}`);
  }

  // Recalcule position/taille de tout ce qui est visible dans l'écran
  // courant (menu ou réglages), à partir des ratios réels des images.
  // Appelé avant tout hit-test (clic/survol) et avant le rendu, pour que
  // les rects soient toujours synchronisés avec ce qui est affiché.
  _mettreAJourLayout() {
    const L = this.largeur, H = this.hauteur;
    const largeurLogo = L * 0.55;
    const xLogo = (L - largeurLogo) / 2;
    const yLogo = H * 0.10;

    const ratioLogo = (this.logoImg.loaded && this.logoImg.image) ? this.logoImg.image.height / this.logoImg.image.width : 0.4;
    this.logoRect = { x: xLogo, y: yLogo, largeur: largeurLogo, hauteur: largeurLogo * ratioLogo, image: this.logoImg };

    const ratioSettingsTitre = (this.settingsTitleImg.loaded && this.settingsTitleImg.image) ? this.settingsTitleImg.image.height / this.settingsTitleImg.image.width : 0.35;
    this.settingsTitreRect = { x: xLogo, y: yLogo, largeur: largeurLogo, hauteur: largeurLogo * ratioSettingsTitre, image: this.settingsTitleImg };

    const largeurBouton = L * 0.45;
    const centreX = (L - largeurBouton) / 2;
    const yDepart = H * 0.55;
    const espace = 15;

    const hPlay = this.boutonPlay.positionner(centreX, yDepart, largeurBouton);
    this.boutonSettingsMenu.positionner(centreX, yDepart + hPlay + espace, largeurBouton);

    const hSound = this.boutonSound.positionner(centreX, yDepart, largeurBouton);
    this.boutonSoundOff.positionner(centreX, yDepart, largeurBouton);
    this.boutonBack.positionner(centreX, yDepart + hSound + espace, largeurBouton);
  }

  // Démarre le glissement Menu <-> Réglages. Le contenu affiché ne change
  // réellement (this.modeSettings) qu'à la fin de l'anim ; entre-temps
  // dessiner() fait cohabiter les deux écrans (ancien qui sort, nouveau
  // qui entre) via _dessinerContenu().
  basculerSettings() {
    if (this.enTransition) return;

    const versSettings = !this.modeSettings;
    this.enTransition = true;
    this.transitionProgress = 0;
    this.transitionDirection = versSettings ? 1 : -1;
    this._modeCible = versSettings;

    this._transitionTween
      .tweenProperty(this, "transitionProgress", 1, 0.26)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_IN_OUT)
      .setOnComplete(() => {
        this.modeSettings = this._modeCible;
        this.enTransition = false;
        this.transitionProgress = 0;
      });
  }

  // Retourne "play" | "settings" | "sound_toggle" | "back" | null
  gererClic(mx, my) {
    if (this.enTransition) return null;
    this._mettreAJourLayout();
    if (this.modeSettings) {
      const sonActif = this.configManager.getSoundEnabled();
      const bouton = sonActif ? this.boutonSound : this.boutonSoundOff;
      if (bouton.contient(mx, my)) return "sound_toggle";
      if (this.boutonBack.contient(mx, my)) return "back";
    } else {
      if (this.boutonPlay.contient(mx, my)) return "play";
      if (this.boutonSettingsMenu.contient(mx, my)) return "settings";
    }
    return null;
  }

  survoler(mx, my) {
    if (this.enTransition) return;
    this._mettreAJourLayout();
    if (this.modeSettings) {
      const sonActif = this.configManager.getSoundEnabled();
      const bouton = sonActif ? this.boutonSound : this.boutonSoundOff;
      bouton.survole = bouton.contient(mx, my);
      this.boutonBack.survole = this.boutonBack.contient(mx, my);
    } else {
      this.boutonPlay.survole = this.boutonPlay.contient(mx, my);
      this.boutonSettingsMenu.survole = this.boutonSettingsMenu.contient(mx, my);
    }
  }

  update(dt) {
    this._transitionTween.update(dt);
  }

  dessiner(ctx) {
    this._mettreAJourLayout();

    if (this.backgroundImg.loaded && this.backgroundImg.image) {
      ctx.drawImage(this.backgroundImg.image, 0, 0, this.largeur, this.hauteur);
    } else {
      ctx.fillStyle = "#14142a";
      ctx.fillRect(0, 0, this.largeur, this.hauteur);
    }

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, this.largeur, this.hauteur);
    ctx.restore();

    if (this.enTransition) {
      const p = this.transitionProgress;
      const decalage = this.largeur * 0.4;

      // Ancien contenu : glisse vers l'extérieur en s'estompant.
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.translate(-this.transitionDirection * decalage * p, 0);
      this._dessinerContenu(ctx, this.modeSettings);
      ctx.restore();

      // Nouveau contenu : arrive de l'autre côté en apparaissant.
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(this.transitionDirection * decalage * (1 - p), 0);
      this._dessinerContenu(ctx, this._modeCible);
      ctx.restore();
    } else {
      this._dessinerContenu(ctx, this.modeSettings);
    }
  }

  // Dessine soit l'écran menu, soit l'écran réglages, selon `modeSettingsAffiche`
  // (peut différer de this.modeSettings pendant une transition).
  _dessinerContenu(ctx, modeSettingsAffiche) {
    if (modeSettingsAffiche) {
      this._dessinerImageOuTexte(ctx, this.settingsTitreRect, "RÉGLAGES");
      const sonActif = this.configManager.getSoundEnabled();
      (sonActif ? this.boutonSound : this.boutonSoundOff).dessiner(ctx);
      this.boutonBack.dessiner(ctx);
    } else {
      this._dessinerImageOuTexte(ctx, this.logoRect, "MATCH 3");
      this.boutonPlay.dessiner(ctx);
      this.boutonSettingsMenu.dessiner(ctx);
    }
  }

  _dessinerImageOuTexte(ctx, rect, texteFallback) {
    if (rect.image && rect.image.loaded && rect.image.image) {
      ctx.drawImage(rect.image.image, rect.x, rect.y, rect.largeur, rect.hauteur);
    } else {
      ctx.save();
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(40);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(texteFallback, rect.x + rect.largeur / 2, rect.y + rect.hauteur / 2);
      ctx.restore();
    }
  }
}