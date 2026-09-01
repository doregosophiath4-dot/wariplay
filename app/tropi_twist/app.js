// app.js
// Contrôleur de haut niveau : possède le canvas et la boucle de rendu
// unique, et route les entrées vers l'écran actif (Menu, Level Select,
// ou Partie en cours). Remplace le bootstrap qui était dans main.js.

const ECRAN = {
  CHARGEMENT: "chargement",
  MENU: "menu",
  LEVEL_SELECT: "level_select",
  JEU: "jeu",
};

class App {
  // `rappels` (optionnel) permet à un composant React englobant (voir
  // TropiTwistClient.tsx + components/game_loader.tsx) de suivre le
  // chargement réel avec sa propre interface, à la place de l'ancien
  // écran de chargement dessiné en canvas (loadingScreen.js, plus utilisé) :
  //   - onProgression(ratio: number 0..1)
  //   - onErreur(message: string)
  //   - onPret()  — appelé une fois, juste avant le passage au Menu
  constructor(canvas, rappels = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = CONFIG.LARGEUR_REFERENCE;
    this.canvas.height = CONFIG.HAUTEUR_REFERENCE;
    this._rappelsChargement = rappels;

    // Écran de chargement : plus de rendu canvas ici, on ne fait
    // qu'attendre que tout soit prêt (voir _boucle) pendant que le loader
    // React recouvre le canvas.
    this.ecran = ECRAN.CHARGEMENT;

    // Un seul AssetLoader partagé par tous les écrans (évite de recharger
    // les images à chaque changement de niveau ou d'écran). On précharge
    // aussi ici les images des écrans de fin/pause et TOUS les backgrounds
    // (habituellement chargés à la volée dans Game) pour que l'écran de
    // chargement reflète vraiment tout ce dont le jeu aura besoin.
    this.assets = new AssetLoader();
    this.assets.chargerPieces();
    this.assets.chargerBombes();
    this.assets.chargerUI();
    this.assets.chargerObstacles();
    this.assets.chargerBoosters();
    this.assets.chargerParticules();
    this.assets.chargerEcransFin();
    this.assets.chargerTousLesBackgrounds();
    this.assets.chargerMise();

    this._policeChargee = false;
    this.assets.chargerPolice().then(() => { this._policeChargee = true; });

    // Chargement du JSON des niveaux (levels_data.json, à côté d'index.html).
    // Remplace l'ancien LEVELS_DATA codé en dur dans levelData.js.
    this._jsonNiveauxCharge = false;
    this._jsonNiveauxErreur = null;
    this._chargerDonneesNiveaux();

    this.configManager = new ConfigManager();
    this.soundManager = new SoundManager(this.configManager);
    this._musiqueDemarree = false;

    this.menuManager = new MenuManager(this.assets, this.configManager);
    this.levelSelect = new LevelSelect(this.assets, this.configManager);
    this.jeu = null;

    // Transition plein écran (fondu au noir) entre Chargement / Menu /
    // Level Select / Jeu.
    // { phase: 'out'|'in', t, duree, action } — action() est exécutée au
    // point le plus sombre du fondu, pendant qu'on ne voit rien à l'écran.
    this._transition = null;
    this._transitionDureeDefaut = 0.22;

    // État du geste tactile en cours (voir _onTouchStart / _onTouchMove /
    // _onTouchEnd) : { x0, y0, x, y, swiped }.
    this._touchState = null;

    // Champ HTML positionné par-dessus le canvas pendant le popup de mise
    // (voir misePopup.js) — l'utilisateur y tape directement sa mise.
    this.inputMise = document.getElementById("inputMise");
    this._inputMiseEtaitVisible = false;
    this._bindInputMise();

    this._bindInput();
    this._dernierTemps = performance.now();
    requestAnimationFrame((t) => this._boucle(t));
  }

  // Charge levels_data.json (même dossier qu'index.html) et réaffecte la
  // variable globale LEVELS_DATA (déclarée en "let" dans levelData.js) une
  // fois le fetch terminé. Si ça échoue (par ex. index.html ouvert en
  // file:// plutôt que servi par un serveur local), on le signale sur
  // l'écran de chargement au lieu de rester bloqué silencieusement.
  async _chargerDonneesNiveaux() {
    try {
      const reponse = await fetch("/levels_data.json");
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
      const donnees = await reponse.json();
      LEVELS_DATA = donnees;
      this._jsonNiveauxCharge = true;
    } catch (e) {
      console.error("Impossible de charger levels_data.json :", e);
      this._jsonNiveauxErreur =
        "Impossible de charger levels_data.json. Si tu as ouvert index.html " +
        "directement (double-clic), lance plutôt un petit serveur local, " +
        "par exemple : python -m http.server — puis ouvre localhost.";
      this._jsonNiveauxCharge = true; // on arrête d'attendre, l'erreur reste affichée
    }
  }

  _progressionChargement() {
    const { resolus, total } = this.assets.getProgression();
    const totalTaches = total + 2; // + police + JSON des niveaux
    const resoluesTaches = resolus + (this._policeChargee ? 1 : 0) + (this._jsonNiveauxCharge ? 1 : 0);
    return totalTaches > 0 ? resoluesTaches / totalTaches : 1;
  }

  _chargementEstTermine() {
    return this.assets.estChargementTermine() && this._policeChargee && this._jsonNiveauxCharge;
  }

  // Lance un fondu au noir, exécute `action` une fois l'écran totalement
  // masqué (changement d'écran invisible pour le joueur), puis refait un
  // fondu pour révéler le nouvel écran. Les clics sont ignorés tant que
  // la transition est active (voir _bindInput).
  _transitionVers(action, duree = this._transitionDureeDefaut) {
    this._transition = { phase: "out", t: 0, duree, action, fait: false };
  }

  _mettreAJourTransition(dt) {
    const tr = this._transition;
    if (!tr) return;
    tr.t += dt;

    if (tr.phase === "out" && tr.t >= tr.duree) {
      if (!tr.fait) {
        tr.fait = true;
        tr.action();
      }
      tr.phase = "in";
      tr.t = 0;
    } else if (tr.phase === "in" && tr.t >= tr.duree) {
      this._transition = null;
    }
  }

  _dessinerTransition(ctx) {
    const tr = this._transition;
    if (!tr) return;
    const progression = Math.min(1, tr.t / tr.duree);
    const alpha = tr.phase === "out" ? progression : 1 - progression;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#05050c";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  }

  _demarrerNiveau(niveauId, montantMise = 0) {
    this.jeu = new Game(
      this.canvas,
      this.ctx,
      this.assets,
      niveauId,
      this.configManager,
      (resultat) => this._surFinDeNiveau(resultat),
      this.soundManager,
      montantMise
    );
    this.ecran = ECRAN.JEU;
  }

  _surFinDeNiveau(resultat) {
    // resultat: { gagne?, quitte?, rejouer?, score, niveauId, scoreMax }
    // Une "mise" est requise pour CHAQUE partie : rejouer renvoie donc vers
    // Level Select puis rouvre immédiatement le popup de mise pour ce
    // niveau, exactement comme un premier tap dessus.
    const rejouer = !!(resultat && resultat.rejouer);
    const niveauId = resultat ? resultat.niveauId : null;

    this._transitionVers(() => {
      this.jeu = null;
      this.ecran = ECRAN.LEVEL_SELECT;
      if (rejouer && niveauId) {
        this.levelSelect.misePopup.ouvrir(niveauId);
      }
    });
  }

  _coordonneesCanvas(ev) {
    return this._coordonneesCanvasDepuisPoint(ev.clientX, ev.clientY);
  }

  _coordonneesCanvasDepuisPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      mx: (clientX - rect.left) * scaleX,
      my: (clientY - rect.top) * scaleY,
    };
  }

  // Un simple tap (souris ou tactile sans balayage) : même logique de clic
  // pour les trois écrans (Menu, Level Select, Jeu).
  _gererTap(mx, my) {
    if (this.ecran === ECRAN.MENU) {
      const action = this.menuManager.gererClic(mx, my);
      if (action) this.soundManager.jouerClick();
      if (action === "play") this._transitionVers(() => { this.ecran = ECRAN.LEVEL_SELECT; });
      else if (action === "settings") this.menuManager.basculerSettings();
      else if (action === "sound_toggle") this.soundManager.toggleSon();
      else if (action === "back") this.menuManager.basculerSettings();
    } else if (this.ecran === ECRAN.LEVEL_SELECT) {
      const [action, niveau] = this.levelSelect.gererClic(mx, my);
      if (action) this.soundManager.jouerClick();
      if (action === "quit") this._transitionVers(() => { this.ecran = ECRAN.MENU; });
      else if (action === "level") this._transitionVers(() => this._demarrerNiveau(niveau));
    } else if (this.ecran === ECRAN.JEU && this.jeu) {
      this.jeu.handleClick(mx, my);
    }

    this._synchroniserInputMise();
  }

  _demarrerMusiqueSiBesoin() {
    if (!this._musiqueDemarree) {
      this.soundManager.demarrerMusique();
      this._musiqueDemarree = true;
    }
  }

  _bindInputMise() {
    this.inputMise.addEventListener("input", () => {
      this.levelSelect.misePopup.montantTexte = this.inputMise.value;
    });
    this.inputMise.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        this.inputMise.blur(); // referme le clavier virtuel sur mobile
      }
    });
  }

  // Positionne (ou masque) le champ de saisie de la mise par-dessus le
  // canvas, en convertissant le rectangle "canvas-space" du popup
  // (0..576 x 0..1024) vers de vrais pixels écran via getBoundingClientRect().
  // Appelé à chaque frame ET juste après un tap (voir _gererTap /
  // _onTouchEnd) pour que le focus() reste dans le geste utilisateur — requis
  // par Safari iOS pour ouvrir le clavier automatiquement.
  _synchroniserInputMise() {
    const popup = this.levelSelect.misePopup;
    const doitAfficher = this.ecran === ECRAN.LEVEL_SELECT && popup.actif && !popup.fermeture;

    if (!doitAfficher) {
      if (this.inputMise.style.display !== "none") this.inputMise.style.display = "none";
      this._inputMiseEtaitVisible = false;
      return;
    }

    const zone = popup.obtenirRectZone();
    if (!zone) return;

    const rectCanvas = this.canvas.getBoundingClientRect();
    const echelleX = rectCanvas.width / this.canvas.width;
    const echelleY = rectCanvas.height / this.canvas.height;

    this.inputMise.style.display = "block";
    this.inputMise.style.left = `${rectCanvas.left + zone.x * echelleX}px`;
    this.inputMise.style.top = `${rectCanvas.top + zone.y * echelleY}px`;
    this.inputMise.style.width = `${zone.largeur * echelleX}px`;
    this.inputMise.style.height = `${zone.hauteur * echelleY}px`;
    this.inputMise.style.fontSize = `${zone.hauteur * echelleY * 0.5}px`;

    if (!this._inputMiseEtaitVisible) {
      this.inputMise.value = popup.montantTexte;
      this.inputMise.focus();
      this.inputMise.select();
    }
    this._inputMiseEtaitVisible = true;
  }

  _bindInput() {
    // Souris / clic classique (desktop). Sur tactile, les événements touch
    // ci-dessous appellent preventDefault() dès le touchstart, ce qui
    // empêche le navigateur d'émettre le "click" de substitution — donc pas
    // de double déclenchement entre souris et tactile.
    this.canvas.addEventListener("click", (ev) => {
      this._demarrerMusiqueSiBesoin();
      if (this._transition) return;
      const { mx, my } = this._coordonneesCanvas(ev);
      this._gererTap(mx, my);
    });

    this.canvas.addEventListener("mousemove", (ev) => {
      const { mx, my } = this._coordonneesCanvas(ev);
      if (this.ecran === ECRAN.MENU) this.menuManager.survoler(mx, my);
      else if (this.ecran === ECRAN.JEU && this.jeu) this.jeu.handleMouseMove(mx, my);
    });

    this.canvas.addEventListener(
      "wheel",
      (ev) => {
        if (this.ecran === ECRAN.LEVEL_SELECT) {
          ev.preventDefault();
          this.levelSelect.gererMolette(ev.deltaY);
        }
      },
      { passive: false }
    );

    // Tactile : tap = même action qu'un clic ; glissement au-delà d'un
    // seuil sur la grille de jeu = balayage direct (swap immédiat dans la
    // direction du geste), au lieu d'un cliquer-glisser façon souris.
    this.canvas.addEventListener("touchstart", (ev) => this._onTouchStart(ev), { passive: false });
    this.canvas.addEventListener("touchmove", (ev) => this._onTouchMove(ev), { passive: false });
    this.canvas.addEventListener("touchend", (ev) => this._onTouchEnd(ev), { passive: false });
    this.canvas.addEventListener("touchcancel", (ev) => this._onTouchEnd(ev), { passive: false });
  }

  _onTouchStart(ev) {
    ev.preventDefault(); // bloque le zoom/scroll et le surlignage tactile natif
    this._demarrerMusiqueSiBesoin();

    if (ev.touches.length !== 1 || this._transition) {
      this._touchState = null;
      return;
    }

    const touch = ev.touches[0];
    const { mx, my } = this._coordonneesCanvasDepuisPoint(touch.clientX, touch.clientY);
    this._touchState = { x0: mx, y0: my, x: mx, y: my, lastY: my, swiped: false };

    if (this.ecran === ECRAN.MENU) this.menuManager.survoler(mx, my);
    else if (this.ecran === ECRAN.JEU && this.jeu) this.jeu.handleMouseMove(mx, my);
  }

  _onTouchMove(ev) {
    ev.preventDefault();
    if (!this._touchState || this._transition) return;

    const touch = ev.touches[0];
    const { mx, my } = this._coordonneesCanvasDepuisPoint(touch.clientX, touch.clientY);
    this._touchState.x = mx;
    this._touchState.y = my;

    // Level Select : glissement vertical continu (suit le doigt), comme une
    // liste native — pas un geste unique déclenché au-delà d'un seuil.
    // Le popup de mise gère lui-même ses taps (voir _onTouchEnd) : on
    // n'active pas la détection de swipe tant qu'il est ouvert, pour que
    // les petits mouvements de doigt en tapant -/+ ne soient pas ratés.
    if (this.ecran === ECRAN.LEVEL_SELECT) {
      if (this.levelSelect.misePopup.actif) return;
      const deltaY = my - this._touchState.lastY;
      this._touchState.lastY = my;
      if (!this._touchState.swiped &&
          (Math.abs(my - this._touchState.y0) > 6 || Math.abs(mx - this._touchState.x0) > 6)) {
        this._touchState.swiped = true; // au-delà d'un mini seuil : plus un tap
      }
      this.levelSelect.gererDrag(-deltaY);
      return;
    }

    if (this._touchState.swiped) return;
    if (this.ecran !== ECRAN.JEU || !this.jeu) return;

    const dx = mx - this._touchState.x0;
    const dy = my - this._touchState.y0;
    const seuil = Math.max(18, this.jeu.taillePiece * 0.35);
    if (Math.abs(dx) < seuil && Math.abs(dy) < seuil) return;

    const direction = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? "droite" : "gauche")
      : (dy > 0 ? "bas" : "haut");

    this._touchState.swiped = true;
    const traitee = this.jeu.handleSwipe(this._touchState.x0, this._touchState.y0, direction);
    if (traitee) this.soundManager.jouerClick();
  }

  _onTouchEnd(ev) {
    ev.preventDefault();
    const ts = this._touchState;
    this._touchState = null;
    if (!ts || this._transition) return;

    if (!ts.swiped) {
      // Pas de glissement détecté : on traite le geste comme un simple tap.
      this._gererTap(ts.x0, ts.y0);
    } else if (this.ecran === ECRAN.LEVEL_SELECT) {
      this.levelSelect.sauvegarderScroll();
    }
  }

  _boucle(tMaintenant) {
    const dt = Math.min((tMaintenant - this._dernierTemps) / 1000, 0.05);
    this._dernierTemps = tMaintenant;

    this._mettreAJourTransition(dt);

    if (this.ecran === ECRAN.CHARGEMENT) {
      // Plus de rendu canvas ici : le loader React (components/game_loader.tsx)
      // recouvre entièrement le canvas pendant ce temps — on se contente de
      // le notifier de la progression réelle et d'attendre qu'il ait fini.
      const { onProgression, onErreur, onPret } = this._rappelsChargement;
      if (onProgression) onProgression(this._progressionChargement());
      if (this._jsonNiveauxErreur) {
        if (onErreur) onErreur(this._jsonNiveauxErreur);
      } else if (!this._transition && this._chargementEstTermine()) {
        this._transitionVers(() => {
          this.ecran = ECRAN.MENU;
          if (onPret) onPret();
        });
      }
    } else if (this.ecran === ECRAN.MENU) {
      this.menuManager.update(dt);
      this.menuManager.dessiner(this.ctx);
    } else if (this.ecran === ECRAN.LEVEL_SELECT) {
      this.levelSelect.update(dt);
      this.levelSelect.dessiner(this.ctx);

      const mise = this.levelSelect.recupererMiseConfirmee();
      if (mise && !this._transition) {
        this._transitionVers(() => this._demarrerNiveau(mise.niveau, mise.montant));
      }
    } else if (this.ecran === ECRAN.JEU && this.jeu) {
      this.jeu.update(dt);
      this.jeu.draw();
    }

    this._dessinerTransition(this.ctx);
    this._synchroniserInputMise();

    requestAnimationFrame((t) => this._boucle(t));
  }
}

// Sous Next.js, le canvas est rendu par React (pages/index.tsx), qui
// attend que ce script (et tous les autres) soient chargés puis instancie
// App lui-même via `new window.App(canvas)`. On expose donc App sur window :
// une classe déclarée en haut de fichier dans un <script> classique ne
// devient PAS automatiquement une propriété de window (contrairement à
// `var`), donc le code React (qui vit dans un module ES séparé et ne
// partage pas la portée globale des <script> classiques) ne pourrait pas
// sinon la voir. C'est le seul changement apporté à ce fichier pour la
// migration Next.js — tout le reste du moteur de jeu est inchangé.
window.App = App;