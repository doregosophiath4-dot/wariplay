// grille.js
// Équivalent JS de la classe Grille (pieces.py), cœur de jeu uniquement
// (pas de béton/obstacles pour l'instant : est_case_beton toujours false).

class Grille {
  constructor(lignes, colonnes) {
    this.lignes = lignes;
    this.colonnes = colonnes;
    this.grille = [];
    for (let l = 0; l < lignes; l++) {
      this.grille.push(new Array(colonnes).fill(null));
    }
  }

  estCaseAccessible(ligne, colonne) {
    return ligne >= 0 && ligne < this.lignes && colonne >= 0 && colonne < this.colonnes;
  }

  estCaseActive(ligne, colonne) {
    // Phase suivante : gèrera les cases béton. Pour l'instant = accessible.
    return this.estCaseAccessible(ligne, colonne);
  }

  getPiece(ligne, colonne) {
    if (this.estCaseAccessible(ligne, colonne)) {
      return this.grille[ligne][colonne];
    }
    return null;
  }

  setPiece(ligne, colonne, piece) {
    if (this.estCaseAccessible(ligne, colonne)) {
      this.grille[ligne][colonne] = piece;
    }
  }

  creerPieceAleatoire(ligne, colonne) {
    const types = Object.keys(CONFIG.PIECES_FILES);
    const type = types[Math.floor(Math.random() * types.length)];
    const piece = new Piece(type, ligne, colonne);
    return piece;
  }

  // Remplit toute la grille en évitant de créer des matches initiaux,
  // puis applique les obstacles selon les probabilités du niveau
  // (obstacles = { ice, slime, locks, concrete, sinker } probabilités 0..1)
  creerGrilleInitiale(obstacles = {}) {
    for (let ligne = 0; ligne < this.lignes; ligne++) {
      for (let colonne = 0; colonne < this.colonnes; colonne++) {
        let piece;
        let tentatives = 0;
        do {
          piece = this.creerPieceAleatoire(ligne, colonne);
          tentatives++;
        } while (this._creeUnMatchImmediat(ligne, colonne, piece.type) && tentatives < 100);
        this._appliquerObstacleAleatoire(piece, obstacles);
        this.grille[ligne][colonne] = piece;
      }
    }
  }

  // Tire un obstacle pour la pièce selon les probabilités (au plus un
  // obstacle par pièce ; ordre de priorité : ice, slime, locks, concrete,
  // sinker). Assomption : chaque case ne porte qu'un seul type d'obstacle.
  _appliquerObstacleAleatoire(piece, obstacles) {
    const r = Math.random();
    let seuil = 0;

    seuil += obstacles.ice || 0;
    if (r < seuil) { piece.gelee = true; return; }

    seuil += obstacles.slime || 0;
    if (r < seuil) { piece.slime = true; return; }

    seuil += obstacles.locks || 0;
    if (r < seuil) { piece.reglisse = true; return; }

    seuil += obstacles.concrete || 0;
    if (r < seuil) { piece.beton = true; return; }

    seuil += obstacles.sinker || 0;
    if (r < seuil) { piece.sinker = true; return; }
  }

  _creeUnMatchImmediat(ligne, colonne, type) {
    // Vérifie les 2 pièces à gauche
    if (colonne >= 2) {
      const p1 = this.getPiece(ligne, colonne - 1);
      const p2 = this.getPiece(ligne, colonne - 2);
      if (p1 && p2 && p1.type === type && p2.type === type) return true;
    }
    // Vérifie les 2 pièces au-dessus
    if (ligne >= 2) {
      const p1 = this.getPiece(ligne - 1, colonne);
      const p2 = this.getPiece(ligne - 2, colonne);
      if (p1 && p2 && p1.type === type && p2.type === type) return true;
    }
    return false;
  }

  echangerPieces(piece1, piece2) {
    if (!piece1.peutEtreDeplacee() || !piece2.peutEtreDeplacee()) {
      return false;
    }

    const ligne1 = piece1.ligne, colonne1 = piece1.colonne;
    const ligne2 = piece2.ligne, colonne2 = piece2.colonne;

    this.grille[ligne1][colonne1] = piece2;
    this.grille[ligne2][colonne2] = piece1;

    piece1.ligne = ligne2; piece1.colonne = colonne2;
    piece2.ligne = ligne1; piece2.colonne = colonne1;

    return true;
  }

  detruirePieces(piecesADetruire) {
    for (const piece of piecesADetruire) {
      if (piece && this.grille[piece.ligne][piece.colonne] === piece) {
        this.grille[piece.ligne][piece.colonne] = null;
      }
    }
  }

  // Fait tomber les pièces existantes vers le bas, retourne la liste des mouvements
  appliquerGravite() {
    const mouvements = [];

    for (let colonne = 0; colonne < this.colonnes; colonne++) {
      for (let ligne = this.lignes - 1; ligne >= 0; ligne--) {
        if (!this.estCaseAccessible(ligne, colonne)) continue;

        if (this.grille[ligne][colonne] === null) {
          for (let ligneAuDessus = ligne - 1; ligneAuDessus >= 0; ligneAuDessus--) {
            if (!this.estCaseAccessible(ligneAuDessus, colonne)) continue;
            const piece = this.grille[ligneAuDessus][colonne];
            if (piece !== null) {
              this.grille[ligne][colonne] = piece;
              this.grille[ligneAuDessus][colonne] = null;
              piece.ligne = ligne;
              piece.colonne = colonne;
              mouvements.push({ piece, ligne, colonne });
              break;
            }
          }
        }
      }
    }

    return mouvements;
  }

  // Remplit les cases vides avec de nouvelles pièces (en haut de la grille)
  remplirGrille() {
    const nouvellesPieces = [];

    for (let colonne = 0; colonne < this.colonnes; colonne++) {
      for (let ligne = 0; ligne < this.lignes; ligne++) {
        if (this.estCaseAccessible(ligne, colonne) && this.grille[ligne][colonne] === null) {
          const nouvellePiece = this.creerPieceAleatoire(ligne, colonne);
          this.grille[ligne][colonne] = nouvellePiece;
          nouvellesPieces.push({ piece: nouvellePiece, ligne, colonne });
        }
      }
    }

    return nouvellesPieces;
  }

  aDesCasesVides() {
    for (let ligne = 0; ligne < this.lignes; ligne++) {
      for (let colonne = 0; colonne < this.colonnes; colonne++) {
        if (this.estCaseAccessible(ligne, colonne) && this.grille[ligne][colonne] === null) {
          return true;
        }
      }
    }
    return false;
  }

  // Mélange les types de couleur de toutes les pièces non-bombes (les
  // obstacles/flags sont conservés), en évitant de recréer un match
  // immédiat. Utilisé quand plus aucun coup n'est possible (voir
  // deadlockDetector.js / hintSystem.js) — logique absente des fichiers
  // Python fournis, ajoutée pour éviter un blocage définitif du joueur.
  melangerPieces() {
    for (let ligne = 0; ligne < this.lignes; ligne++) {
      for (let colonne = 0; colonne < this.colonnes; colonne++) {
        const piece = this.grille[ligne][colonne];
        if (!piece || piece.estBombe) continue;

        let tentatives = 0;
        let nouveauType;
        do {
          const types = Object.keys(CONFIG.PIECES_FILES);
          nouveauType = types[Math.floor(Math.random() * types.length)];
          tentatives++;
        } while (this._creeUnMatchImmediat(ligne, colonne, nouveauType) && tentatives < 100);

        piece.type = nouveauType;
        piece.imageKey = piece.resoudreImageKey();
      }
    }
  }
}