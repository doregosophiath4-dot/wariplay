// piece.js
// Équivalent JS de la classe Piece (pieces.py), version cœur de jeu
// (gelee/reglisse/slime/sinker conservés pour la phase suivante mais inertes ici).

class Piece {
  constructor(type, ligne, colonne) {
    this.type = type;
    this.ligne = ligne;
    this.colonne = colonne;

    // Position pixel actuelle (animée) et cible
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;

    // Échelle / alpha pour animations (spawn, destruction)
    this.scale = 1;
    this.alpha = 1;

    this.selectionnee = false;

    // États d'obstacles
    this.gelee = false;
    this.reglisse = false;
    this.slime = false;
    this.beton = false;
    this.sinker = false;

    this.estBombe = false;
    this.typeBombe = null;

    // Fichier image résolu (gère le choix aléatoire pour "pink")
    this.imageKey = this.resoudreImageKey();
  }

  resoudreImageKey() {
    if (this.type === "pink") {
      const alternatives = CONFIG.PINK_ALTERNATIVES;
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    return CONFIG.PIECES_FILES[this.type];
  }

  peutEtreDeplacee() {
    return !this.reglisse;
  }

  // Exclu des matches "normaux" (une ligne de 3 ne peut pas se former à
  // travers elle) — seule une explosion de bombe/rainbow la détruit.
  bloqueMatchNormal() {
    return this.slime || this.beton || this.sinker;
  }

  // Transforme la pièce en bombe (colonne/rangée/adjacente/rainbow)
  transformerEnBombe(typeBombe) {
    this.estBombe = true;
    this.typeBombe = typeBombe;

    if (typeBombe === CONFIG.BOMBE_RAINBOW) {
      this.imageKey = CONFIG.BOMBE_RAINBOW_FILE;
    } else if (CONFIG.BOMBES_FILES[this.type]) {
      this.imageKey = CONFIG.BOMBES_FILES[this.type][typeBombe];
    }
  }

  // Place instantanément la pièce à sa position cible (sans animation)
  snap(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
  }
}