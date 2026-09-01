// assetLoader.js
// Charge les images depuis les mêmes chemins que config.py, avec fallback
// (rectangle coloré) si un fichier est introuvable, comme le try/except pygame.

const COULEURS_FALLBACK = {
  yellow: "#f5d90a",
  green: "#2ecc71",
  orange: "#e67e22",
  blue: "#3498db",
  light_green: "#a3e635",
  pink: "#ec4899",
};

class AssetLoader {
  constructor() {
    this.cache = new Map();

    // Suivi de progression pour l'écran de chargement : nombre d'images
    // demandées vs déjà résolues (chargées OU en échec — un échec ne doit
    // pas bloquer indéfiniment la barre de progression).
    this.totalDemandes = 0;
    this.totalResolus = 0;
    this._callbacksProgression = [];
  }

  charger(chemin) {
    if (chemin === undefined || chemin === null || chemin.includes("undefined")) {
      console.error(
        `Chemin d'image invalide : "${chemin}". ` +
        `Probablement un CONFIG.xxx manquant ou un config.js pas à jour ` +
        `(fais un hard refresh : Ctrl+Maj+R / Cmd+Maj+R).`
      );
      return { image: null, loaded: false, failed: true };
    }

    if (this.cache.has(chemin)) {
      return this.cache.get(chemin);
    }

    const entry = { image: null, loaded: false, failed: false };
    this.totalDemandes++;

    const img = new Image();
    img.onload = () => {
      entry.image = img;
      entry.loaded = true;
      this._marquerResolu();
    };
    img.onerror = () => {
      entry.failed = true;
      console.warn(`Image non trouvée: ${chemin}`);
      this._marquerResolu();
    };
    img.src = chemin;

    this.cache.set(chemin, entry);
    return entry;
  }

  _marquerResolu() {
    this.totalResolus++;
    for (const cb of this._callbacksProgression) cb(this.totalResolus, this.totalDemandes);
  }

  // S'abonne aux mises à jour de progression : cb(resolus, total)
  onProgression(cb) {
    this._callbacksProgression.push(cb);
  }

  getProgression() {
    return { resolus: this.totalResolus, total: this.totalDemandes };
  }

  estChargementTermine() {
    return this.totalResolus >= this.totalDemandes;
  }

  // Précharge toutes les images des pièces normales + variantes pink
  chargerPieces() {
    const fichiers = new Set(Object.values(CONFIG.PIECES_FILES));
    for (const alt of CONFIG.PINK_ALTERNATIVES) fichiers.add(alt);

    for (const fichier of fichiers) {
      this.charger(`${CONFIG.PIECES_PATH}/${fichier}`);
    }
  }

  // Précharge toutes les images de bombes (colonne/rangée/adjacente) + rainbow
  chargerBombes() {
    for (const typeCouleur of Object.keys(CONFIG.BOMBES_FILES)) {
      const fichiers = CONFIG.BOMBES_FILES[typeCouleur];
      for (const fichier of Object.values(fichiers)) {
        this.charger(`${CONFIG.PIECES_PATH}/${fichier}`);
      }
    }
    this.charger(`${CONFIG.PIECES_PATH}/${CONFIG.BOMBE_RAINBOW_FILE}`);
  }

  getPieceEntry(imageKey) {
    return this.charger(`${CONFIG.PIECES_PATH}/${imageKey}`);
  }

  // Précharge les images du Top/Bottom UI, de la barre de score, des objectifs
  chargerUI() {
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.TOP_UI_FILE}`);
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.BOTTOM_UI_FILE}`);
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.SCORE_BAR_BACKGROUND_FILE}`);
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.SCORE_BAR_FILL_FILE}`);
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.GOAL_BACKGROUND_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.PAUSE_BUTTON_FILE}`);
  }

  getUIEntry(cheminComplet) {
    return this.charger(cheminComplet);
  }

  get topUI() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.TOP_UI_FILE}`); }
  get bottomUI() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.BOTTOM_UI_FILE}`); }
  get scoreBarBg() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.SCORE_BAR_BACKGROUND_FILE}`); }
  get scoreBarFill() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.SCORE_BAR_FILL_FILE}`); }
  get goalBg() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.GOAL_BACKGROUND_FILE}`); }
  get pauseBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.PAUSE_BUTTON_FILE}`); }

  // Précharge les images des boutons de boosters
  chargerBoosters() {
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.COLOR_BOMB_BUTTON_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.MALLET_BUTTON_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.PLUS_TEN_BUTTON_FILE}`);
  }

  getBoosterImage(boosterType) {
    if (boosterType === "color_bomb") return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.COLOR_BOMB_BUTTON_FILE}`);
    if (boosterType === "mallet") return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.MALLET_BUTTON_FILE}`);
    if (boosterType === "add_time") return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.PLUS_TEN_BUTTON_FILE}`);
    return { image: null, loaded: false, failed: true };
  }

  // Précharge les images des obstacles
  chargerObstacles() {
    this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.ICE_FILE}`);
    this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.SLIME_FILE}`);
    this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.LOCKS_FILE}`);
    this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.CONCRETE_FILE}`);
    this.charger(`${CONFIG.SINKERS_PATH}/${CONFIG.SINKER_FILE}`);
  }

  get iceOverlay() { return this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.ICE_FILE}`); }
  get slimeOverlay() { return this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.SLIME_FILE}`); }
  get locksOverlay() { return this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.LOCKS_FILE}`); }
  get concreteOverlay() { return this.charger(`${CONFIG.OBSTACLES_PATH}/${CONFIG.CONCRETE_FILE}`); }
  get sinkerOverlay() { return this.charger(`${CONFIG.SINKERS_PATH}/${CONFIG.SINKER_FILE}`); }

  get colorBombBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.COLOR_BOMB_BUTTON_FILE}`); }
  get malletBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.MALLET_BUTTON_FILE}`); }
  get addTimeBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.PLUS_TEN_BUTTON_FILE}`); }

  // Précharge les images des particules (étoile) et de l'explosion
  chargerParticules() {
    this.charger(`${CONFIG.PARTICLES_PATH}/${CONFIG.STAR_PARTICLE_FILE}`);
    for (const fichier of CONFIG.EXPLOSION_FILES) {
      this.charger(`${CONFIG.EXPLOSION_PATH}/${fichier}`);
    }
  }

  // Choisit et précharge un background aléatoire pour l'écran de jeu
  // (identique à game.py::choisir_background_aleatoire). Le résultat est
  // mis en cache par charger(), donc appeler ceci plusieurs fois pour un
  // même chemin ne recharge pas l'image.
  chargerBackgroundAleatoire() {
    const fichiers = CONFIG.BACKGROUND_FILES;
    const choix = fichiers[Math.floor(Math.random() * fichiers.length)];
    return this.charger(`${CONFIG.BACKGROUNDS_PATH}/${choix}`);
  }

  // Précharge TOUS les backgrounds possibles (pas un seul aléatoire) — utilisé
  // par l'écran de chargement au démarrage, pour que la progression affichée
  // couvre bien tout ce qui pourra être utilisé pendant la partie, et qu'un
  // niveau ne déclenche jamais un chargement surprise en cours de jeu.
  chargerTousLesBackgrounds() {
    for (const fichier of CONFIG.BACKGROUND_FILES) {
      this.charger(`${CONFIG.BACKGROUNDS_PATH}/${fichier}`);
    }
  }

  // Précharge les images des écrans Game Over / Victoire / Pause
  chargerEcransFin() {
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.GAMEOVER_BACKGROUND_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.QUIT_BUTTON_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.RESTART_BUTTON_FILE}`);
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.WIN_PANEL_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.CONTINUE_WIN_BUTTON_FILE}`);
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.PAUSE_PANEL_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.CONTINUE_PAUSE_BUTTON_FILE}`);
    this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.QUIT_PAUSE_BUTTON_FILE}`);
  }

  get gameoverBg() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.GAMEOVER_BACKGROUND_FILE}`); }
  get quitBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.QUIT_BUTTON_FILE}`); }
  get restartBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.RESTART_BUTTON_FILE}`); }
  get winPanelImg() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.WIN_PANEL_FILE}`); }
  get continueWinBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.CONTINUE_WIN_BUTTON_FILE}`); }
  get pausePanelImg() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.PAUSE_PANEL_FILE}`); }
  get continuePauseBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.CONTINUE_PAUSE_BUTTON_FILE}`); }
  get quitPauseBtn() { return this.charger(`${CONFIG.BUTTONS_PATH}/${CONFIG.QUIT_PAUSE_BUTTON_FILE}`); }

  // Précharge le panneau du popup de mise ("Votre Mise!")
  chargerMise() {
    this.charger(`${CONFIG.UI_PATH}/${CONFIG.MISE_PANEL_FILE}`);
  }

  get misePanelImg() { return this.charger(`${CONFIG.UI_PATH}/${CONFIG.MISE_PANEL_FILE}`); }

  // Charge la police custom (Kenney Blocks.ttf), avec fallback sans-serif
  async chargerPolice() {
    try {
      const police = new FontFace("Kenney Blocks", `url("${CONFIG.FONT_PATH}")`);
      await police.load();
      document.fonts.add(police);
      this.policeChargee = true;
    } catch (e) {
      console.warn("Police custom non trouvée, utilisation de la police par défaut");
      this.policeChargee = false;
    }
  }

  getFont(taille) {
    return this.policeChargee ? `${taille}px "Kenney Blocks"` : `${taille}px sans-serif`;
  }

  getCouleurFallback(type) {
    return COULEURS_FALLBACK[type] || "#999999";
  }
}