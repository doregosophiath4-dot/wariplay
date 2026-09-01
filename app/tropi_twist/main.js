// main.js
// Cœur du jeu : état, rendu, interactions (clic/drag pour échanger),
// matches, gravité, remplissage, réactions en chaîne.

const ETAT = {
  IDLE: "idle",
  SWAP_ANIMATION: "swap_animation",
  SWAP_BACK: "swap_back",
  CHECK_MATCHES: "check_matches",
  DESTROY_MATCHES: "destroy_matches",
  GRAVITY: "gravity",
  FILL_GRID: "fill_grid",
  CHAIN_CHECK: "chain_check",
};

const DUREE_SWAP = 0.18; // secondes
const DUREE_DESTRUCTION = 0.22;
const DUREE_CHUTE_PAR_CASE = 0.06;

class Game {
  constructor(canvas, ctx, assets, niveauId, configManager, onTerminer, soundManager, montantMise = 0) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.assets = assets;
    this.configManager = configManager;
    this.soundManager = soundManager;
    this.onTerminer = onTerminer; // callback({gagne|quitte, score, niveauId})

    // Mise engagée pour cette partie (voir misePopup.js / levelSelect.js) —
    // conservée ici pour un futur système de gain/perte ; pas encore
    // affichée à l'écran.
    this.montantMise = montantMise;

    this.tween = new Tween(); // anime le "pop" des pièces transformées en bombes

    // Niveau en cours
    this.niveauId = niveauId;
    this.niveau = LEVELS_DATA[niveauId];

    this.grille = new Grille(CONFIG.GRILLE_LIGNES, CONFIG.GRILLE_COLONNES);
    this.grille.creerGrilleInitiale(this.niveau.obstacles);
    this.matchDetector = new MatchDetector(this.grille);
    this.deadlockDetector = new DeadlockDetector(this.grille);
    this.hintSystem = new HintSystem(this.grille, this.deadlockDetector);
    this.cameraShake = new CameraShake();
    this.particleSystem = new ParticleSystem(this.assets);

    this.scoreMax = this.niveau.score_max;
    this.coupsRestants = this.niveau.coups_max;
    this.objectifsProgression = {};
    this.objectifsTotal = {}; // totaux résolus (gère "all" / true)
    for (const [cle, total] of Object.entries(this.niveau.goals)) {
      this.objectifsProgression[cle] = 0;
      this.objectifsTotal[cle] = (total === "all" || total === true)
        ? this._compterObstaclesInitial(cle)
        : total;
    }

    this.enPause = false;
    this.jeuTermine = null; // null | "gagne" | "perdu"
    this._finSignalee = false;

    this.boosterManager = new BoosterManager(this.assets, niveauId);
    this.topUI = new TopUIManager(this.assets);
    this.bottomUI = new BottomUIManager(this.assets, this.boosterManager);

    // Background aléatoire de l'écran de jeu (identique à
    // game.py::choisir_background_aleatoire) + images des écrans de fin/pause
    this.assets.chargerEcransFin();
    this.backgroundEntry = this.assets.chargerBackgroundAleatoire();

    // Animations d'ouverture / fermeture des popups (pause, fin de niveau) :
    // alpha 0..1 + léger "pop" d'échelle, pilotés par this.tween.
    this._pauseAlpha = 0;
    this._pauseEchelle = 1;
    this._pauseFermeture = false;

    this._finAlpha = 0;
    this._finEchelle = 1;
    this._finFermeture = false;

    this.score = 0;
    this.etat = ETAT.IDLE;
    this.tempsEtat = 0;

    // Zone de la grille (calculée dans calculerLayout)
    this.grilleX = 0;
    this.grilleY = 0;
    this.taillePiece = CONFIG.TAILLE_PIECE_REFERENCE;

    // Sélection / échange en cours
    this.pieceSelectionnee = null;
    this.echangeEnCours = null; // { piece1, piece2, retour: bool }

    // Piles d'animations en cours (chute, destruction)
    this.piecesEnDestruction = []; // pièces à faire disparaître visuellement
    this.effetsActifs = []; // effets d'explosion (colonne/rangée/adjacente/rainbow)
    this.mouvementsChute = []; // {piece, x0,y0,x1,y1, temps, duree}

    this.calculerLayout();
    this.positionnerToutesLesPieces(true);
    this.particleSystem.redimensionner(this.taillePiece * 0.5, this.taillePiece * 1.3);
  }

  calculerLayout() {
    this.topUIHauteur = CONFIG.HAUTEUR_REFERENCE * CONFIG.TOP_UI_HAUTEUR_POURCENT;
    this.bottomUIHauteur = CONFIG.HAUTEUR_REFERENCE * CONFIG.BOTTOM_UI_HAUTEUR_POURCENT;

    const largeurDispo = CONFIG.LARGEUR_REFERENCE * CONFIG.GRILLE_POURCENTAGE_LARGEUR;
    const hauteurDispo = CONFIG.HAUTEUR_REFERENCE * CONFIG.GRILLE_POURCENTAGE_HAUTEUR;

    const tailleParLargeur = largeurDispo / this.grille.colonnes;
    const tailleParHauteur = hauteurDispo / this.grille.lignes;
    this.taillePiece = Math.floor(Math.min(tailleParLargeur, tailleParHauteur));

    const largeurGrilleTotale = this.taillePiece * this.grille.colonnes;

    this.grilleX = (CONFIG.LARGEUR_REFERENCE - largeurGrilleTotale) / 2;
    this.grilleY = this.topUIHauteur;

    this.topUI.setup(0, 0, CONFIG.LARGEUR_REFERENCE, this.topUIHauteur);
    this.bottomUI.setup(0, this.topUIHauteur + hauteurDispo, CONFIG.LARGEUR_REFERENCE, this.bottomUIHauteur);
  }

  positionPixel(ligne, colonne) {
    return {
      x: this.grilleX + colonne * this.taillePiece,
      y: this.grilleY + ligne * this.taillePiece,
    };
  }

  // Compte le nombre initial de pièces portant un obstacle donné (pour les
  // objectifs "all" / true, ex: "locks": "all", "ice_break": true)
  _compterObstaclesInitial(goalKey) {
    let compte = 0;
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        const piece = this.grille.getPiece(ligne, colonne);
        if (!piece) continue;
        if ((goalKey === "ice" || goalKey === "ice_break") && piece.gelee) compte++;
        else if (goalKey === "slime" && piece.slime) compte++;
        else if (goalKey === "locks" && piece.reglisse) compte++;
        else if (goalKey === "concrete" && piece.beton) compte++;
        else if (goalKey === "sinker" && piece.sinker) compte++;
      }
    }
    return compte;
  }

  positionnerToutesLesPieces(instantane) {
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        const piece = this.grille.getPiece(ligne, colonne);
        if (piece) {
          const { x, y } = this.positionPixel(ligne, colonne);
          if (instantane) {
            piece.snap(x, y);
          } else {
            piece.targetX = x;
            piece.targetY = y;
          }
        }
      }
    }
  }

  handleClick(mx, my) {
    // Bouton pause / boosters : cliquables même hors tour normal
    if (!this.jeuTermine) {
      const clicBoutonBas = this.bottomUI.gererClic(mx, my);
      if (clicBoutonBas) this._jouerClick();
      if (clicBoutonBas === "pause") {
        this._togglePause();
        return;
      }
      if (clicBoutonBas === "add_time") {
        this.coupsRestants = this.boosterManager.useAddTime(this.coupsRestants, this.niveau.coups_max);
        return;
      }
      if (clicBoutonBas === "color_bomb" || clicBoutonBas === "mallet") {
        if (this.boosterManager.getActiveBooster() === clicBoutonBas) {
          this.boosterManager.cancelActiveBooster(); // re-clic = annuler
        } else if (clicBoutonBas === "color_bomb") {
          this.boosterManager.useColorBomb();
        } else {
          this.boosterManager.useMallet();
        }
        return;
      }
    }

    if (this.jeuTermine) {
      if (this._finFermeture) return; // popup déjà en train de se fermer
      const gagne = this.jeuTermine === "gagne";
      if (gagne) {
        if (this._contientRect(this._rectFinContinue, mx, my)) {
          this._jouerClick();
          this._fermerFinDeJeu(() => this._terminer({ gagne: true }));
        }
      } else {
        if (this._contientRect(this._rectFinRestart, mx, my)) {
          this._jouerClick();
          this._fermerFinDeJeu(() => this._redemarrerNiveau());
        } else if (this._contientRect(this._rectFinQuit, mx, my)) {
          this._jouerClick();
          this._fermerFinDeJeu(() => this._terminer({ quitte: true }));
        }
      }
      return;
    }

    if (this.enPause) {
      if (this._pauseFermeture) return; // popup déjà en train de se fermer
      if (this._contientRect(this._rectPauseContinue, mx, my)) {
        this._jouerClick();
        this._fermerPause();
      } else if (this._contientRect(this._rectPauseQuit, mx, my)) {
        this._jouerClick();
        this._fermerPause(() => this._terminer({ quitte: true }));
      }
      return;
    }
    if (this.etat !== ETAT.IDLE) return;

    const colonne = Math.floor((mx - this.grilleX) / this.taillePiece);
    const ligne = Math.floor((my - this.grilleY) / this.taillePiece);

    if (!this.grille.estCaseAccessible(ligne, colonne)) return;

    // Booster actif : la case cliquée reçoit l'effet au lieu d'une sélection normale
    if (this.boosterManager.isBoosterActive()) {
      this._appliquerBoosterActif(ligne, colonne);
      return;
    }

    const piece = this.grille.getPiece(ligne, colonne);
    if (!piece) return;

    this._gererClicPiece(piece);
  }

  handleMouseMove(mx, my) {
    this.bottomUI.survoler(mx, my);
  }

  // Balayage tactile : swap direct entre la pièce sous le doigt au moment du
  // touchstart (mx,my) et sa voisine dans la direction du glissement
  // ("haut"|"bas"|"gauche"|"droite"), sans passer par la sélection à deux
  // taps utilisée sur PC (voir _gererClicPiece). Retourne true si un swap a
  // été lancé, pour que l'appelant (app.js) puisse jouer le son de clic.
  handleSwipe(mx, my, direction) {
    if (this.enPause || this.jeuTermine) return false;
    if (this.etat !== ETAT.IDLE) return false;
    if (this.boosterManager.isBoosterActive()) return false; // un booster attend un tap simple

    const colonne = Math.floor((mx - this.grilleX) / this.taillePiece);
    const ligne = Math.floor((my - this.grilleY) / this.taillePiece);
    if (!this.grille.estCaseAccessible(ligne, colonne)) return false;

    const piece = this.grille.getPiece(ligne, colonne);
    if (!piece) return false;

    let ligneVoisine = ligne;
    let colonneVoisine = colonne;
    if (direction === "haut") ligneVoisine -= 1;
    else if (direction === "bas") ligneVoisine += 1;
    else if (direction === "gauche") colonneVoisine -= 1;
    else if (direction === "droite") colonneVoisine += 1;

    if (!this.grille.estCaseAccessible(ligneVoisine, colonneVoisine)) return false;
    const voisine = this.grille.getPiece(ligneVoisine, colonneVoisine);
    if (!voisine) return false;

    // Annule une éventuelle sélection en cours (mode tap-tap) avant le swap.
    if (this.pieceSelectionnee) {
      this.pieceSelectionnee.selectionnee = false;
      this.pieceSelectionnee = null;
    }

    this.hintSystem.reinitialiserTimer();
    this._demarrerEchange(piece, voisine);
    return true;
  }

  _contientRect(rect, mx, my) {
    return mx >= rect.x && mx <= rect.x + rect.largeur && my >= rect.y && my <= rect.y + rect.hauteur;
  }

  _terminer(resultat) {
    if (this._finSignalee) return;
    this._finSignalee = true;
    if (this.onTerminer) {
      this.onTerminer({ ...resultat, score: this.score, niveauId: this.niveauId, scoreMax: this.scoreMax });
    }
  }

  _jouerClick() {
    if (this.soundManager) this.soundManager.jouerClick();
  }

  // Ouvre/ferme le panneau de pause avec un petit "pop" (échelle + fondu).
  _togglePause() {
    if (this._pauseFermeture) return;
    if (!this.enPause) {
      this.enPause = true;
      this._pauseAlpha = 0;
      this._pauseEchelle = 0.82;
      this.tween
        .tweenProperty(this, "_pauseAlpha", 1, 0.16)
        .setTrans(TransitionType.QUAD)
        .setEase(EaseType.EASE_OUT);
      this.tween
        .tweenProperty(this, "_pauseEchelle", 1.04, 0.16)
        .setTrans(TransitionType.QUAD)
        .setEase(EaseType.EASE_OUT)
        .setOnComplete(() => {
          this.tween
            .tweenProperty(this, "_pauseEchelle", 1.0, 0.10)
            .setTrans(TransitionType.QUAD)
            .setEase(EaseType.EASE_IN);
        });
    } else {
      this._fermerPause();
    }
  }

  // Ferme le panneau de pause (fondu + léger rétrécissement), puis exécute
  // `apresFermeture` une fois l'anim terminée (par défaut : reprendre le
  // jeu). Utilisé pour "Continuer" comme pour "Quitter" depuis la pause.
  _fermerPause(apresFermeture) {
    if (this._pauseFermeture) return;
    this._pauseFermeture = true;

    this.tween
      .tweenProperty(this, "_pauseAlpha", 0, 0.14)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_IN)
      .setOnComplete(() => {
        this.enPause = false;
        this._pauseFermeture = false;
        this._pauseEchelle = 1;
        if (apresFermeture) apresFermeture();
      });
    this.tween
      .tweenProperty(this, "_pauseEchelle", 0.85, 0.14)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_IN);
  }

  // Ouvre le panneau de fin de niveau (victoire/défaite) avec un "pop".
  _ouvrirFinDeJeu() {
    this._finAlpha = 0;
    this._finEchelle = 0.82;
    this.tween
      .tweenProperty(this, "_finAlpha", 1, 0.20)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_OUT);
    this.tween
      .tweenProperty(this, "_finEchelle", 1.05, 0.20)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_OUT)
      .setOnComplete(() => {
        this.tween
          .tweenProperty(this, "_finEchelle", 1.0, 0.12)
          .setTrans(TransitionType.QUAD)
          .setEase(EaseType.EASE_IN);
      });
  }

  // Ferme le panneau de fin de niveau avant de quitter l'écran de jeu
  // (Continuer / Rejouer / Quitter), puis exécute `apresFermeture`.
  _fermerFinDeJeu(apresFermeture) {
    if (this._finFermeture) return;
    this._finFermeture = true;

    this.tween
      .tweenProperty(this, "_finAlpha", 0, 0.14)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_IN)
      .setOnComplete(() => {
        this._finFermeture = false;
        if (apresFermeture) apresFermeture();
      });
    this.tween
      .tweenProperty(this, "_finEchelle", 0.85, 0.14)
      .setTrans(TransitionType.QUAD)
      .setEase(EaseType.EASE_IN);
  }

  // Bouton Restart de l'écran Game Over : signale à App de relancer une
  // partie fraîche sur le même niveau (comme le ferait game.py en
  // rappelant charger_niveau() sur la même instance).
  _redemarrerNiveau() {
    if (this._finSignalee) return;
    this._finSignalee = true;
    if (this.onTerminer) {
      this.onTerminer({ rejouer: true, niveauId: this.niveauId, score: this.score, scoreMax: this.scoreMax });
    }
  }

  _appliquerBoosterActif(ligne, colonne) {
    this.hintSystem.reinitialiserTimer();
    const actif = this.boosterManager.getActiveBooster();

    if (actif === "color_bomb") {
      const piece = this.boosterManager.appliquerColorBomb(this.grille, ligne, colonne);
      if (piece) this._animerPopBombes([piece]);
      return;
    }

    if (actif === "mallet") {
      const piece = this.boosterManager.appliquerMallet(this.grille, ligne, colonne);
      if (piece) {
        this.piecesEnDestruction = [piece];
        this.effetsActifs = [];
        this.etat = ETAT.DESTROY_MATCHES;
        this.tempsEtat = 0;
      }
    }
  }

  _gererClicPiece(piece) {
    this.hintSystem.reinitialiserTimer();

    if (!this.pieceSelectionnee) {
      this.pieceSelectionnee = piece;
      piece.selectionnee = true;
      return;
    }

    if (this.pieceSelectionnee === piece) {
      piece.selectionnee = false;
      this.pieceSelectionnee = null;
      return;
    }

    const dLigne = Math.abs(this.pieceSelectionnee.ligne - piece.ligne);
    const dColonne = Math.abs(this.pieceSelectionnee.colonne - piece.colonne);
    const adjacentes = (dLigne + dColonne) === 1;

    if (adjacentes) {
      this._demarrerEchange(this.pieceSelectionnee, piece);
    } else {
      this.pieceSelectionnee.selectionnee = false;
      piece.selectionnee = true;
      this.pieceSelectionnee = piece;
    }
  }

  _demarrerEchange(piece1, piece2) {
    piece1.selectionnee = false;
    piece2.selectionnee = false;
    this.pieceSelectionnee = null;

    if (!this.grille.echangerPieces(piece1, piece2)) return;

    const pos1 = this.positionPixel(piece1.ligne, piece1.colonne);
    const pos2 = this.positionPixel(piece2.ligne, piece2.colonne);
    piece1.targetX = pos1.x; piece1.targetY = pos1.y;
    piece2.targetX = pos2.x; piece2.targetY = pos2.y;

    this.echangeEnCours = { piece1, piece2, retour: false };
    this.etat = ETAT.SWAP_ANIMATION;
    this.tempsEtat = 0;
  }

  update(dt) {
    // Toujours mis à jour, même en pause / fin de partie, pour que les
    // animations d'ouverture/fermeture des popups (pause, victoire, défaite)
    // continuent de jouer.
    this.tween.update(dt);

    if (this.enPause || this.jeuTermine) return;

    this.tempsEtat += dt;
    this.cameraShake.update(dt);
    this.particleSystem.update();

    // Interpolation générique des positions pour toutes les pièces
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        const piece = this.grille.getPiece(ligne, colonne);
        if (piece) this._approcherCible(piece, dt);
      }
    }

    switch (this.etat) {
      case ETAT.IDLE:
        break;

      case ETAT.SWAP_ANIMATION:
        if (this.tempsEtat >= DUREE_SWAP) {
          this._finirEchange();
        }
        break;

      case ETAT.SWAP_BACK:
        if (this.tempsEtat >= DUREE_SWAP) {
          this.etat = ETAT.IDLE;
          this.echangeEnCours = null;
        }
        break;

      case ETAT.CHECK_MATCHES:
        this._verifierMatches();
        break;

      case ETAT.DESTROY_MATCHES:
        if (this.tempsEtat >= DUREE_DESTRUCTION) {
          this._appliquerDestruction();
        }
        break;

      case ETAT.GRAVITY:
      case ETAT.FILL_GRID:
        if (this._chutesTerminees()) {
          this.etat = ETAT.CHAIN_CHECK;
          this.tempsEtat = 0;
        }
        break;

      case ETAT.CHAIN_CHECK:
        this._verifierMatches(true);
        break;
    }

    // Système d'indices : ne tourne que quand la grille est stable
    if (this.etat === ETAT.IDLE) {
      this.hintSystem.update(dt);
    } else {
      this.hintSystem.reinitialiserTimer();
    }
  }

  _approcherCible(piece, dt) {
    const vitesse = 1 / DUREE_SWAP; // fraction de distance par seconde (approx)
    const facteur = Math.min(1, vitesse * dt * 3.2);
    piece.x += (piece.targetX - piece.x) * facteur;
    piece.y += (piece.targetY - piece.y) * facteur;
    if (Math.abs(piece.x - piece.targetX) < 0.5) piece.x = piece.targetX;
    if (Math.abs(piece.y - piece.targetY) < 0.5) piece.y = piece.targetY;
  }

  _finirEchange() {
    // Un match a-t-il été créé par cet échange ?
    const resultat = this.matchDetector.analyser();

    if (resultat.total > 0) {
      this.piecesEnDestruction = [...resultat.piecesADetruire];
      this.effetsActifs = resultat.effets;
      this._animerPopBombes(resultat.piecesConservees);
      this._declencherImpact(resultat);
      this.coupsRestants = Math.max(0, this.coupsRestants - 1);
      if (this.soundManager) this.soundManager.jouerMatch();
      this.etat = ETAT.DESTROY_MATCHES;
      this.tempsEtat = 0;
    } else if (!this.echangeEnCours.retour) {
      // Pas de match -> on annule l'échange (swap-back)
      const { piece1, piece2 } = this.echangeEnCours;
      this.grille.echangerPieces(piece1, piece2);
      const pos1 = this.positionPixel(piece1.ligne, piece1.colonne);
      const pos2 = this.positionPixel(piece2.ligne, piece2.colonne);
      piece1.targetX = pos1.x; piece1.targetY = pos1.y;
      piece2.targetX = pos2.x; piece2.targetY = pos2.y;
      this.echangeEnCours.retour = true;
      this.etat = ETAT.SWAP_BACK;
      this.tempsEtat = 0;
    } else {
      this.etat = ETAT.IDLE;
      this.echangeEnCours = null;
      this._verifierFinDeJeu();
    }
  }

  _verifierMatches(estChaine = false) {
    const resultat = this.matchDetector.analyser();
    if (resultat.total > 0) {
      this.piecesEnDestruction = [...resultat.piecesADetruire];
      this.effetsActifs = resultat.effets;
      this._animerPopBombes(resultat.piecesConservees);
      this._declencherImpact(resultat);
      if (this.soundManager) this.soundManager.jouerMatch();
      this.etat = ETAT.DESTROY_MATCHES;
      this.tempsEtat = 0;
    } else {
      this.etat = ETAT.IDLE;
      this.echangeEnCours = null;
      this._verifierFinDeJeu();
    }
  }

  _verifierFinDeJeu() {
    const objectifsAtteints = Object.entries(this.objectifsTotal).every(
      ([cle, total]) => (this.objectifsProgression[cle] || 0) >= total
    );

    if (objectifsAtteints) {
      this.jeuTermine = "gagne";
      this._ouvrirFinDeJeu();
      if (this.configManager) {
        this.configManager.setHighScore(this.niveauId, this.score);
        this.configManager.unlockLevel(this.niveauId + 1);
      }
    } else if (this.coupsRestants <= 0) {
      this.jeuTermine = "perdu";
      this._ouvrirFinDeJeu();
    } else if (!this.deadlockDetector.aUnMovePossible()) {
      // Plus aucun coup possible : on mélange la grille pour débloquer
      // le joueur (logique absente des fichiers Python fournis).
      this.grille.melangerPieces();
      this.positionnerToutesLesPieces(true);
    }
  }

  _incrementerObjectif(cle) {
    if (Object.prototype.hasOwnProperty.call(this.objectifsProgression, cle)) {
      const total = this.objectifsTotal[cle];
      this.objectifsProgression[cle] = Math.min(total, this.objectifsProgression[cle] + 1);
    }
  }

  _animerPopBombes(piecesConservees) {
    for (const piece of piecesConservees) {
      piece.scale = 1;
      this.tween
        .tweenProperty(piece, "scale", 1.35, 0.12)
        .setTrans(TransitionType.QUAD)
        .setEase(EaseType.EASE_OUT)
        .setOnComplete(() => {
          this.tween
            .tweenProperty(piece, "scale", 1.0, 0.15)
            .setTrans(TransitionType.QUAD)
            .setEase(EaseType.EASE_IN);
        });
    }
  }

  // Particules + secousse de caméra à chaque match/explosion
  _declencherImpact(resultat) {
    const positions = [];
    for (const piece of resultat.piecesADetruire) {
      positions.push([piece.x + this.taillePiece / 2, piece.y + this.taillePiece / 2]);
    }
    this.particleSystem.creerParticulesAuxPositions(positions);

    const grosImpact = resultat.effets && resultat.effets.length > 0;
    const intensite = grosImpact ? 10 : 4 + Math.min(4, resultat.total * 0.5);
    const duree = grosImpact ? 0.35 : 0.2;
    this.cameraShake.demarrerSecousse(intensite, duree);
  }

  _appliquerDestruction() {
    this.score += this.piecesEnDestruction.length * 10;

    for (const piece of this.piecesEnDestruction) {
      this._incrementerObjectif(piece.type);
      if (piece.gelee) this._incrementerObjectif("ice");
      if (piece.gelee) this._incrementerObjectif("ice_break");
      if (piece.slime) this._incrementerObjectif("slime");
      if (piece.reglisse) this._incrementerObjectif("locks");
      if (piece.beton) this._incrementerObjectif("concrete");
      if (piece.sinker) this._incrementerObjectif("sinker");
    }

    this.grille.detruirePieces(this.piecesEnDestruction);
    this.piecesEnDestruction = [];
    this.effetsActifs = [];

    const mouvements = this.grille.appliquerGravite();
    for (const { piece, ligne, colonne } of mouvements) {
      const { x, y } = this.positionPixel(ligne, colonne);
      piece.targetX = x;
      piece.targetY = y;
    }

    const nouvelles = this.grille.remplirGrille();
    for (const { piece, ligne, colonne } of nouvelles) {
      // Les nouvelles pièces apparaissent au-dessus de la grille et tombent
      const { x, y } = this.positionPixel(ligne, colonne);
      piece.x = x;
      piece.y = this.grilleY - this.taillePiece * (this.grille.lignes - ligne);
      piece.targetX = x;
      piece.targetY = y;
    }

    this.etat = ETAT.GRAVITY;
    this.tempsEtat = 0;
  }

  _chutesTerminees() {
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        const piece = this.grille.getPiece(ligne, colonne);
        if (piece && (piece.x !== piece.targetX || piece.y !== piece.targetY)) {
          return false;
        }
      }
    }
    return true;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Fond (image aléatoire choisie au démarrage du niveau, comme game.py)
    if (this.backgroundEntry.loaded && this.backgroundEntry.image) {
      ctx.drawImage(this.backgroundEntry.image, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      ctx.fillStyle = "#1b1b2e";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Secousse de caméra : englobe la grille, les pièces et les particules
    // (le Top/Bottom UI et les overlays restent fixes, hors transformation)
    this.cameraShake.appliquerTransform(ctx, this.canvas.width, this.canvas.height);

    // Cadre de la grille
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(
      this.grilleX, this.grilleY,
      this.taillePiece * this.grille.colonnes,
      this.taillePiece * this.grille.lignes
    );

    // Effets d'explosion (colonne/rangée/adjacente/rainbow), sous les pièces
    if (this.etat === ETAT.DESTROY_MATCHES) {
      this._dessinerEffets();
    }

    // Surbrillance du système d'indices, sous la pièce concernée
    this.hintSystem.dessinerSurbrillance(ctx, (l, c) => this.positionPixel(l, c), this.taillePiece);

    // Pièces
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        const piece = this.grille.getPiece(ligne, colonne);
        if (piece) this._dessinerPiece(piece);
      }
    }

    // Particules (étoiles + explosions), au-dessus des pièces
    this.particleSystem.dessiner(ctx);

    this.cameraShake.restaurer(ctx);

    // Top UI / Bottom UI (par-dessus la grille, comme dans le jeu original)
    this.topUI.dessiner(ctx, {
      score: this.score,
      coupsRestants: this.coupsRestants,
      scoreMax: this.scoreMax,
      levelGoals: this.objectifsTotal,
      objectifsProgression: this.objectifsProgression,
      assetLoaderPieces: this.assets,
    });
    this.bottomUI.dessiner(ctx);

    // On garde le popup dessiné pendant sa fermeture (`_pauseFermeture` /
    // `_finFermeture`) pour que l'animation de sortie (fondu + rétrécissement
    // piloté par this.tween) reste visible jusqu'à son terme.
    if (this.enPause || this._pauseFermeture) {
      this._dessinerPause();
    }

    if (this.jeuTermine || this._finFermeture) {
      this._dessinerFinDeJeu();
    }
  }

  // Dessine une image centrée sur une largeur cible en conservant son ratio
  // (ou un rectangle arrondi de secours tant que l'image n'est pas chargée).
  // Retourne { x, y, largeur, hauteur } du rectangle réellement dessiné.
  _dessinerImageAjustee(ctx, entry, x, y, largeur, ratioFallback, fillFallback) {
    let hauteur = largeur * ratioFallback;
    if (entry && entry.loaded && entry.image) {
      hauteur = largeur * (entry.image.height / entry.image.width);
      ctx.drawImage(entry.image, x, y, largeur, hauteur);
    } else {
      ctx.save();
      ctx.fillStyle = fillFallback;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, largeur, hauteur, 10);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, largeur, hauteur);
      }
      ctx.restore();
    }
    return { x, y, largeur, hauteur };
  }

  // Panneau de pause : image "Pause Panel.png" + boutons Continuer/Quitter
  // en dessous, comme pause_panel.py (bouton_quit à gauche, bouton_continue
  // à droite, tous les deux vers 60% de la hauteur du panneau).
  _dessinerPause(ctx = this.ctx) {
    const L = this.canvas.width, H = this.canvas.height;
    const alpha = this._pauseAlpha;

    ctx.save();
    ctx.globalAlpha = 0.6 * alpha;
    ctx.fillStyle = CONFIG.NOIR;
    ctx.fillRect(0, 0, L, H);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(L / 2, H / 2);
    ctx.scale(this._pauseEchelle, this._pauseEchelle);
    ctx.translate(-L / 2, -H / 2);

    const largeurPanel = L * 0.72;
    const panelX = (L - largeurPanel) / 2;
    const panelEntry = this.assets.pausePanelImg;
    const ratioPanel = (panelEntry.loaded && panelEntry.image) ? (panelEntry.image.height / panelEntry.image.width) : 0.85;
    const hauteurPanel = largeurPanel * ratioPanel;
    const panelY = (H - hauteurPanel) / 2;
    const panel = this._dessinerImageAjustee(ctx, panelEntry, panelX, panelY, largeurPanel, ratioPanel, "#2b2b45");

    if (!(panelEntry.loaded && panelEntry.image)) {
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(40);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PAUSE", L / 2, panelY + panel.hauteur * 0.25);
    }

    // Boutons Quitter (gauche) / Continuer (droite), vers 60% du panneau
    const largeurBouton = largeurPanel * 0.34;
    const espace = largeurPanel * 0.06;
    const continueEntry = this.assets.continuePauseBtn;
    const quitEntry = this.assets.quitPauseBtn;

    const hC = (continueEntry.loaded && continueEntry.image) ? largeurBouton * (continueEntry.image.height / continueEntry.image.width) : largeurBouton * 0.4;
    const hQ = (quitEntry.loaded && quitEntry.image) ? largeurBouton * (quitEntry.image.height / quitEntry.image.width) : largeurBouton * 0.4;

    const yBoutons = panelY + panel.hauteur * 0.60;
    const totalLargeur = largeurBouton * 2 + espace;
    const debutX = panelX + (largeurPanel - totalLargeur) / 2;

    const rectQuit = this._dessinerImageAjustee(ctx, quitEntry, debutX, yBoutons, largeurBouton, hQ / largeurBouton, "#a13b3b");
    const rectContinue = this._dessinerImageAjustee(ctx, continueEntry, debutX + largeurBouton + espace, yBoutons, largeurBouton, hC / largeurBouton, "#3ba14a");

    if (!(quitEntry.loaded && quitEntry.image) || !(continueEntry.loaded && continueEntry.image)) {
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(18);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (!(quitEntry.loaded && quitEntry.image)) ctx.fillText("Quitter", rectQuit.x + rectQuit.largeur / 2, rectQuit.y + rectQuit.hauteur / 2);
      if (!(continueEntry.loaded && continueEntry.image)) ctx.fillText("Continuer", rectContinue.x + rectContinue.largeur / 2, rectContinue.y + rectContinue.hauteur / 2);
    }

    this._rectPauseQuit = rectQuit;
    this._rectPauseContinue = rectContinue;

    ctx.restore();
  }

  // Écran de fin de niveau. Victoire : "Win Panel.png" + bouton Continuer
  // (comme win_panel.py). Défaite : "GameOver Background.png" + boutons
  // Restart / Quit (comme game.py::charger_gameover / setup_gameover).
  _dessinerFinDeJeu(ctx = this.ctx) {
    const gagne = this.jeuTermine === "gagne";
    const L = this.canvas.width, H = this.canvas.height;
    const alpha = this._finAlpha;

    ctx.save();
    ctx.globalAlpha = 0.7 * alpha;
    ctx.fillStyle = CONFIG.NOIR;
    ctx.fillRect(0, 0, L, H);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(L / 2, H / 2);
    ctx.scale(this._finEchelle, this._finEchelle);
    ctx.translate(-L / 2, -H / 2);

    if (gagne) {
      const largeurPanel = L * 0.78;
      const panelX = (L - largeurPanel) / 2;
      const entry = this.assets.winPanelImg;
      const hauteurEstimee = largeurPanel * 0.9;
      const panelY = H * 0.25;
      const panel = this._dessinerImageAjustee(ctx, entry, panelX, panelY, largeurPanel, hauteurEstimee / largeurPanel, "#2b2b45");

      if (!(entry.loaded && entry.image)) {
        ctx.fillStyle = "#f5d90a";
        ctx.font = this.assets.getFont(36);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("NIVEAU RÉUSSI !", L / 2, panel.y + panel.hauteur * 0.25);
      }
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(24);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const gains = this.montantMise * 2;
      ctx.fillText(`Gains : ${gains} ${CONFIG.MISE_DEVISE}`, L / 2, panel.y + panel.hauteur * 0.45);

      const continueEntry = this.assets.continueWinBtn;
      const largeurBtn = largeurPanel * 0.5;
      const hBtn = (continueEntry.loaded && continueEntry.image) ? largeurBtn * (continueEntry.image.height / continueEntry.image.width) : largeurBtn * 0.35;
      const xBtn = L / 2 - largeurBtn / 2;
      const yBtn = panel.y + panel.hauteur * 0.60;
      const rectContinue = this._dessinerImageAjustee(ctx, continueEntry, xBtn, yBtn, largeurBtn, hBtn / largeurBtn, "#3ba14a");
      if (!(continueEntry.loaded && continueEntry.image)) {
        ctx.fillStyle = CONFIG.BLANC;
        ctx.font = this.assets.getFont(18);
        ctx.fillText("Continuer", rectContinue.x + rectContinue.largeur / 2, rectContinue.y + rectContinue.hauteur / 2);
      }
      this._rectFinContinue = rectContinue;
    } else {
      const entry = this.assets.gameoverBg;
      const largeurPanel = L;
      const hauteurEstimee = L * 0.55;
      const panelY = H * 0.45;
      const panel = this._dessinerImageAjustee(ctx, entry, 0, panelY, largeurPanel, hauteurEstimee / largeurPanel, "#2b2b45");

      if (!(entry.loaded && entry.image)) {
        ctx.fillStyle = CONFIG.BLANC;
        ctx.font = this.assets.getFont(36);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PLUS DE COUPS", L / 2, panel.y + panel.hauteur * 0.2);
      }
      ctx.fillStyle = CONFIG.BLANC;
      ctx.font = this.assets.getFont(22);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Score : ${this.score}`, L / 2, panel.y + panel.hauteur * 0.38);

      const quitEntry = this.assets.quitBtn;
      const restartEntry = this.assets.restartBtn;
      const largeurBtn = largeurPanel * 0.22;
      const hQ = (quitEntry.loaded && quitEntry.image) ? largeurBtn * (quitEntry.image.height / quitEntry.image.width) : largeurBtn;
      const hR = (restartEntry.loaded && restartEntry.image) ? largeurBtn * (restartEntry.image.height / restartEntry.image.width) : largeurBtn;
      const yBtn = panel.y + panel.hauteur * 0.55;

      const xQuit = panel.x + panel.largeur * 0.25 - largeurBtn / 2;
      const xRestart = panel.x + panel.largeur * 0.75 - largeurBtn / 2;

      const rectQuit = this._dessinerImageAjustee(ctx, quitEntry, xQuit, yBtn, largeurBtn, hQ / largeurBtn, "#a13b3b");
      const rectRestart = this._dessinerImageAjustee(ctx, restartEntry, xRestart, yBtn, largeurBtn, hR / largeurBtn, "#3b6fa1");

      if (!(quitEntry.loaded && quitEntry.image) || !(restartEntry.loaded && restartEntry.image)) {
        ctx.fillStyle = CONFIG.BLANC;
        ctx.font = this.assets.getFont(16);
        if (!(quitEntry.loaded && quitEntry.image)) ctx.fillText("Quitter", rectQuit.x + rectQuit.largeur / 2, rectQuit.y + rectQuit.hauteur / 2);
        if (!(restartEntry.loaded && restartEntry.image)) ctx.fillText("Rejouer", rectRestart.x + rectRestart.largeur / 2, rectRestart.y + rectRestart.hauteur / 2);
      }

      this._rectFinQuit = rectQuit;
      this._rectFinRestart = rectRestart;
    }

    ctx.restore();
  }

  _dessinerPiece(piece) {
    const ctx = this.ctx;
    const marge = 4;
    const taille = this.taillePiece - marge * 2;

    const enDestruction = this.piecesEnDestruction.includes(piece);
    let alpha = 1;
    let echelle = piece.scale || 1;
    if (enDestruction) {
      const progression = Math.min(1, this.tempsEtat / DUREE_DESTRUCTION);
      alpha = 1 - progression;
      echelle *= 1 - progression * 0.5;
    }

    // Ajustement visuel du système d'indices (pulsation + soulèvement)
    let decalageY = 0;
    const ajustementIndice = this.hintSystem.getAjustement(piece);
    if (ajustementIndice) {
      echelle *= ajustementIndice.echelle;
      decalageY = ajustementIndice.decalageY;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    const cx = piece.x + this.taillePiece / 2;
    const cy = piece.y + this.taillePiece / 2 + decalageY;
    const demiTaille = (taille * echelle) / 2;

    const entry = this.assets.getPieceEntry(piece.imageKey);
    if (entry.loaded && entry.image) {
      ctx.drawImage(entry.image, cx - demiTaille, cy - demiTaille, demiTaille * 2, demiTaille * 2);
    } else {
      // Fallback pendant le chargement / si l'image est manquante
      ctx.fillStyle = this.assets.getCouleurFallback(piece.type);
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(cx - demiTaille, cy - demiTaille, demiTaille * 2, demiTaille * 2, 8)
        : ctx.rect(cx - demiTaille, cy - demiTaille, demiTaille * 2, demiTaille * 2);
      ctx.fill();
    }

    if (piece.selectionnee) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = CONFIG.BLANC;
      ctx.lineWidth = 3;
      ctx.strokeRect(piece.x + marge, piece.y + marge, taille, taille);
    }

    // Overlays d'obstacles (dessinés par-dessus la pièce)
    if (piece.gelee) this._dessinerOverlay(this.assets.iceOverlay, cx, cy, demiTaille);
    if (piece.slime) this._dessinerOverlay(this.assets.slimeOverlay, cx, cy, demiTaille, "#3ba14a");
    if (piece.reglisse) this._dessinerOverlay(this.assets.locksOverlay, cx, cy, demiTaille, "#5a3a22");
    if (piece.beton) this._dessinerOverlay(this.assets.concreteOverlay, cx, cy, demiTaille, "#888888");
    if (piece.sinker) this._dessinerOverlay(this.assets.sinkerOverlay, cx, cy, demiTaille, "#444488");

    ctx.restore();
  }

  _dessinerOverlay(entry, cx, cy, demiTaille, couleurFallback = "rgba(255,255,255,0.5)") {
    const ctx = this.ctx;
    if (entry && entry.loaded && entry.image) {
      ctx.drawImage(entry.image, cx - demiTaille, cy - demiTaille, demiTaille * 2, demiTaille * 2);
    } else {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = couleurFallback;
      ctx.fillRect(cx - demiTaille, cy - demiTaille, demiTaille * 2, demiTaille * 2);
      ctx.restore();
    }
  }

  _dessinerEffets() {
    if (this.effetsActifs.length === 0) return;

    const ctx = this.ctx;
    const progression = Math.min(1, this.tempsEtat / DUREE_DESTRUCTION);
    const alpha = 1 - progression; // s'estompe pendant la destruction

    for (const effet of this.effetsActifs) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.55;

      if (effet.type === "column") {
        const { x } = this.positionPixel(0, effet.colonne);
        ctx.fillStyle = CONFIG.BLANC;
        ctx.fillRect(x, this.grilleY, this.taillePiece, this.taillePiece * this.grille.lignes);
      } else if (effet.type === "row") {
        const { y } = this.positionPixel(effet.ligne, 0);
        ctx.fillStyle = CONFIG.BLANC;
        ctx.fillRect(this.grilleX, y, this.taillePiece * this.grille.colonnes, this.taillePiece);
      } else if (effet.type === "adjacent") {
        const { x, y } = this.positionPixel(effet.ligne - 1, effet.colonne - 1);
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(x, y, this.taillePiece * 3, this.taillePiece * 3);
      } else if (effet.type === "rainbow") {
        ctx.fillStyle = this.assets.getCouleurFallback(effet.couleur);
        ctx.fillRect(
          this.grilleX, this.grilleY,
          this.taillePiece * this.grille.colonnes,
          this.taillePiece * this.grille.lignes
        );
      }

      ctx.restore();
    }
  }
}