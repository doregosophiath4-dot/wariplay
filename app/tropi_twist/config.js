// config.js
// Reproduit config.py : mêmes chemins d'assets, mêmes constantes.
// Place ton dossier "Assets" au même niveau que index.html pour que tout charge.

const CONFIG = {
  // Chemins des assets (identiques à config.py)
  BASE_PATH: "/Tropi/Match 3 Assets/Match 3 Assets",
  get UI_PATH() { return `${this.BASE_PATH}/UI`; },
  get BACKGROUNDS_PATH() { return `${this.UI_PATH}/Backgrounds`; },
  get PIECES_PATH() { return `${this.BASE_PATH}/Pieces`; },
  get OBSTACLES_PATH() { return `${this.BASE_PATH}/Obstacles`; },
  get BUTTONS_PATH() { return `${this.UI_PATH}/Buttons`; },
  get PARTICLES_PATH() { return `${this.BASE_PATH}/Particles and effects`; },
  get EXPLOSION_PATH() { return `${this.PARTICLES_PATH}/Explosion V2`; },
  get SINKERS_PATH() { return `${this.BASE_PATH}/Sinkers`; },
  get LEVEL_SELECT_PATH() { return `${this.UI_PATH}/Level Select`; },

  // Chemins des sons/musique (identiques à sound_manager.py)
  SOUNDS_PATH: "/Tropi/Match 3 Sounds/Match 3 Sounds/Sounds",
  MUSIC_PATH: "/Tropi/Match 3 Sounds/Match 3 Sounds/Music",
  MUSIC_FILE: "theme-2.ogg",

  // Fichiers des particules
  STAR_PARTICLE_FILE: "Star Particle.png",

  // Fichiers d'explosion (7 frames)
  EXPLOSION_FILES: [
    "explode_1_1.png",
    "explode_2_1.png",
    "explode_3_1.png",
    "explode_4_1.png",
    "explode_5_1.png",
    "explode_6_1.png",
    "explode_7.png",
  ],

  // Fichiers des pièces normales
  PIECES_FILES: {
    yellow: "Yellow Piece.png",
    green: "Green Piece.png",
    orange: "Orange Piece.png",
    blue: "Blue Piece.png",
    light_green: "Light Green Piece.png",
    pink: "Pink Piece.png",
  },

  // Alternatives pour la pièce rose
  PINK_ALTERNATIVES: ["Pink Piece.png", "Pink Piece 2.png", "Pink Piece 3.png"],

  // Obstacles
  ICE_FILE: "ice.png",
  LOCKS_FILE: "Locks.png",
  CONCRETE_FILE: "Concrete.png",
  SLIME_FILE: "Slime.png",
  SINKER_FILE: "Sinker v3.png",

  // Bombe arc-en-ciel (rainbow)
  BOMBE_RAINBOW_FILE: "Rainbow.png",

  // Fichiers des bombes par type (identique à config.py)
  BOMBES_FILES: {
    yellow: { column: "Yellow Column.png", row: "Yellow Row.png", adjacent: "Yellow Adjacent.png" },
    green: { column: "Green Column.png", row: "Green Row.png", adjacent: "Green Adjacent.png" },
    orange: { column: "Orange Column.png", row: "Orange Row.png", adjacent: "Orange Adjacent.png" },
    blue: { column: "Blue Column.png", row: "Blue Row.png", adjacent: "Blue Adjacent.png" },
    light_green: { column: "Light Green Column.png", row: "Light Green Row.png", adjacent: "Light Green Adjacent.png" },
    pink: { column: "Pink Column.png", row: "Pink Row.png", adjacent: "Pink Adjacent.png" },
  },

  // Types de bombes (identique à config.py)
  BOMBE_COLONNE: "column",
  BOMBE_RANGEE: "row",
  BOMBE_ADJACENTE: "adjacent",
  BOMBE_RAINBOW: "rainbow",

  // Fichiers UI (Top/Bottom UI, score bar, goal, boutons)
  TOP_UI_FILE: "Top UI v 2.png",
  BOTTOM_UI_FILE: "Bottom UI v 2.png",
  SCORE_BAR_BACKGROUND_FILE: "Score Bar Background.png",
  SCORE_BAR_FILL_FILE: "Score Bar Fill.png",
  GOAL_BACKGROUND_FILE: "goal background.png",
  PAUSE_BUTTON_FILE: "Pause Button.png",
  COLOR_BOMB_BUTTON_FILE: "Make Color Bomb Button.png",
  MALLET_BUTTON_FILE: "Mallet Button.png",
  PLUS_TEN_BUTTON_FILE: "Plus Ten Seconds Button.png",
  QUIT_BUTTON_FILE: "Quit Button.png",
  RESTART_BUTTON_FILE: "Restart Button.png",

  // Backgrounds aléatoires de l'écran de jeu (identique à
  // game.py::choisir_background_aleatoire)
  BACKGROUND_FILES: ["background1.png", "background2.png"],

  // Écran Game Over (identique à game.py::charger_gameover)
  GAMEOVER_BACKGROUND_FILE: "GameOver Background.png",

  // Panneau de victoire
  WIN_PANEL_FILE: "Win Panel.png",
  CONTINUE_WIN_BUTTON_FILE: "Continue Button Game Win.png",

  // Panneau de pause (identique à pause_panel.py)
  PAUSE_PANEL_FILE: "Pause Panel.png",
  CONTINUE_PAUSE_BUTTON_FILE: "Continue Button Pause.png",
  QUIT_PAUSE_BUTTON_FILE: "Quit Button Pause.png",

  // Popup de mise avant de jouer un niveau ("Votre Mise!")
  MISE_PANEL_FILE: "Mise Panel.png",
  MISE_MIN: 100,
  MISE_MAX: 500,
  MISE_DEVISE: "XOF",

  // Fichiers du menu principal
  LOGO_FILE: "Tropi.png",
  SETTINGS_TITLE_FILE: "settings.png",
  MENU_BACKGROUND_FILE: "Menu.jpg",
  PLAY_BUTTON_FILE: "Play Button.png",
  SETTINGS_BUTTON_FILE: "Settings Button.png",
  SOUND_BUTTON_FILE: "Sound Button 2.png",
  SOUND_OFF_BUTTON_FILE: "Sound Off Button.png",
  BACK_BUTTON_FILE: "Back Button.png",

  // Fichiers du level select
  LEVEL_SELECT_MAP_1: "Level Select Map 1.png",
  LEVEL_SELECT_MAP_2: "Level Select 2.png",
  LEVEL_SELECT_MAP_3: "Level Select Assets.png",
  RED_BUTTON_FILE: "Red Button.png",
  GREEN_BUTTON_FILE: "Green Button.png",
  STAR_BLANK_FILE: "Star Blank.png",
  STAR_FILLED_FILE: "Star Filled.png",

  // Positions des niveaux sur la carte du level select (NE PAS CHANGER,
  // coordonnées calées sur les images d'origine)
  LEVEL_POSITIONS: [
    [104, 272], [220, 133], [421, 115], [438, 295], [259, 380],
    [72, 453], [32, 638], [197, 622], [327, 497], [452, 639],
  ],

  FONT_PATH: "/Tropi/Fonts/Kenney Blocks.ttf",
  OBJECTIF_DEFAUT: 10,

  // Chemins et fichiers audio (identique à sound_manager.py)
  SOUNDS_PATH: "/Tropi/Match 3 Sounds/Match 3 Sounds/Sounds",
  MUSIC_PATH: "/Tropi/Match 3 Sounds/Match 3 Sounds/Music",
  CLICK_SOUND_FILE: "1.ogg",
  MATCH_SOUND_FILES: ["3.ogg", "4.ogg", "5.ogg", "6.ogg", "7.ogg"],
  MUSIC_FILE: "theme-2.ogg",

  // Configuration de la grille (identique à config.py)
  GRILLE_LIGNES: 10,
  GRILLE_COLONNES: 8,
  TAILLE_PIECE_REFERENCE: 60,

  // Configuration des matches
  MATCH_MINIMUM: 3,
  MATCH_BOMBE: 4,
  MATCH_SUPER_BOMBE: 5,
  MATCH_RAINBOW: 5,

  // Dimensions de référence (design original)
  LARGEUR_REFERENCE: 576,
  HAUTEUR_REFERENCE: 1024,

  // Pourcentage de l'espace pour la grille
  GRILLE_POURCENTAGE_HAUTEUR: 0.70,
  GRILLE_POURCENTAGE_LARGEUR: 0.90,

  // Pourcentage de hauteur pour le Top UI / Bottom UI (le reste = grille)
  TOP_UI_HAUTEUR_POURCENT: 0.20,
  BOTTOM_UI_HAUTEUR_POURCENT: 0.10,

  MARGE_HAUT_POURCENT: 0.01,
  MARGE_BAS_POURCENT: 0.01,

  FPS: 60,

  // Couleurs (identique à config.py, en CSS hex)
  BLANC: "#ffffff",
  NOIR: "#000000",
  GRIS: "#808080",

  SCORE_MAX: 5000,
};