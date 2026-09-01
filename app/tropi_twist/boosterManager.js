// boosterManager.js
// Port JS de booster_manager.py : Color Bomb, Mallet, Add Time.
// Disponibilité par niveau, compteurs, activation/application.

class BoosterManager {
  constructor(assets, niveauActuel = 1) {
    this.assets = assets;
    this.niveauActuel = niveauActuel;

    // Quantités de base (identique à booster_manager.py)
    this.colorBombCount = 5;
    this.malletCount = 5;
    this.addTimeCount = 5;

    this.colorBombActive = false;
    this.malletActive = false;
  }

  setNiveau(niveau) {
    this.niveauActuel = niveau;
  }

  isBoosterAvailable(boosterType) {
    if (boosterType === "color_bomb") {
      // Color Bomb disponible uniquement à partir du niveau 10
      return this.niveauActuel >= 10 && this.colorBombCount > 0;
    } else if (boosterType === "mallet") {
      // Mallet disponible à partir du niveau 5
      return this.niveauActuel >= 5 && this.malletCount > 0;
    } else if (boosterType === "add_time") {
      // Add Time disponible à partir du niveau 5
      return this.niveauActuel >= 5 && this.addTimeCount > 0;
    }
    return false;
  }

  getAvailableBoosters() {
    const available = [];
    if (this.isBoosterAvailable("color_bomb")) available.push("color_bomb");
    if (this.isBoosterAvailable("mallet")) available.push("mallet");
    if (this.isBoosterAvailable("add_time")) available.push("add_time");
    return available;
  }

  useColorBomb() {
    if (this.isBoosterAvailable("color_bomb")) {
      this.colorBombCount--;
      this.colorBombActive = true;
      return true;
    }
    return false;
  }

  useMallet() {
    if (this.isBoosterAvailable("mallet")) {
      this.malletCount--;
      this.malletActive = true;
      return true;
    }
    return false;
  }

  // Utilise un Add Time booster (+5 coups, plafonné à coupsMax)
  useAddTime(coupsRestants, coupsMax) {
    if (this.isBoosterAvailable("add_time")) {
      this.addTimeCount--;
      return Math.min(coupsRestants + 5, coupsMax);
    }
    return coupsRestants;
  }

  cancelActiveBooster() {
    this.colorBombActive = false;
    this.malletActive = false;
  }

  isBoosterActive() {
    return this.colorBombActive || this.malletActive;
  }

  getActiveBooster() {
    if (this.colorBombActive) return "color_bomb";
    if (this.malletActive) return "mallet";
    return null;
  }

  // Applique le Color Bomb booster sur une pièce (la transforme en rainbow).
  // Ne détruit rien : la bombe attend d'être matchée normalement.
  appliquerColorBomb(grille, ligne, colonne) {
    const piece = grille.getPiece(ligne, colonne);
    if (piece && !piece.estBombe) {
      piece.transformerEnBombe(CONFIG.BOMBE_RAINBOW);
      this.colorBombActive = false;
      return piece;
    }
    return null;
  }

  // Valide la cible du marteau et désactive le booster. La destruction
  // réelle est déclenchée par l'appelant (main.js) via le pipeline normal
  // de destruction/gravité/remplissage, pour rester visuellement cohérent
  // et garder le score/les objectifs synchronisés.
  appliquerMallet(grille, ligne, colonne) {
    const piece = grille.getPiece(ligne, colonne);
    if (piece) {
      this.malletActive = false;
      return piece;
    }
    return null;
  }

  getBoosterImage(boosterType) {
    if (boosterType === "color_bomb") return this.assets.colorBombBtn;
    if (boosterType === "mallet") return this.assets.malletBtn;
    if (boosterType === "add_time") return this.assets.addTimeBtn;
    return null;
  }

  getBoosterCount(boosterType) {
    if (boosterType === "color_bomb") return this.colorBombCount;
    if (boosterType === "mallet") return this.malletCount;
    if (boosterType === "add_time") return this.addTimeCount;
    return 0;
  }
}