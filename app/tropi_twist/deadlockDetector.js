// deadlockDetector.js
// Port JS de deadlock_detector.py : vérifie s'il existe au moins un
// mouvement possible sur la grille en simulant chaque échange adjacent.

class DeadlockDetector {
  constructor(grille) {
    this.grille = grille;
  }

  aUnMovePossible() {
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        if (!this.grille.estCaseAccessible(ligne, colonne)) continue;

        const piece = this.grille.getPiece(ligne, colonne);
        if (piece === null) continue;

        // Ignorer les pièces qui ne peuvent pas être déplacées
        if (piece.reglisse) continue;

        const directions = [
          [ligne - 1, colonne],
          [ligne + 1, colonne],
          [ligne, colonne - 1],
          [ligne, colonne + 1],
        ];

        for (const [nl, nc] of directions) {
          if (this.grille.estCaseAccessible(nl, nc)) {
            const pieceVoisine = this.grille.getPiece(nl, nc);
            if (pieceVoisine && !pieceVoisine.reglisse) {
              if (this._simulerEchange(piece, pieceVoisine)) {
                return true;
              }
            }
          }
        }
      }
    }

    console.log("🔒 Aucun mouvement possible trouvé !");
    return false;
  }

  _simulerEchange(piece1, piece2) {
    const ligne1 = piece1.ligne, colonne1 = piece1.colonne;
    const ligne2 = piece2.ligne, colonne2 = piece2.colonne;

    // Échanger temporairement
    this.grille.grille[ligne1][colonne1] = piece2;
    this.grille.grille[ligne2][colonne2] = piece1;
    piece1.ligne = ligne2; piece1.colonne = colonne2;
    piece2.ligne = ligne1; piece2.colonne = colonne1;

    const matchTrouve = this._verifierMatchSimple();

    // Annuler l'échange
    this.grille.grille[ligne1][colonne1] = piece1;
    this.grille.grille[ligne2][colonne2] = piece2;
    piece1.ligne = ligne1; piece1.colonne = colonne1;
    piece2.ligne = ligne2; piece2.colonne = colonne2;

    return matchTrouve;
  }

  // Vérifie rapidement s'il y a un match dans la grille (ignore slime et
  // locks, comme deadlock_detector.py)
  _verifierMatchSimple() {
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        if (!this.grille.estCaseAccessible(ligne, colonne)) continue;

        const piece = this.grille.getPiece(ligne, colonne);
        if (piece === null) continue;
        if (piece.slime || piece.reglisse) continue;

        // Horizontal (3 pièces)
        if (colonne + 2 < this.grille.colonnes) {
          const p1 = piece;
          const p2 = this.grille.getPiece(ligne, colonne + 1);
          const p3 = this.grille.getPiece(ligne, colonne + 2);
          if (p1 && p2 && p3 && !p1.slime && !p2.slime && !p3.slime && !p1.reglisse && !p2.reglisse && !p3.reglisse) {
            if (p1.type === p2.type && p2.type === p3.type) return true;
          }
        }

        // Vertical (3 pièces)
        if (ligne + 2 < this.grille.lignes) {
          const p1 = piece;
          const p2 = this.grille.getPiece(ligne + 1, colonne);
          const p3 = this.grille.getPiece(ligne + 2, colonne);
          if (p1 && p2 && p3 && !p1.slime && !p2.slime && !p3.slime && !p1.reglisse && !p2.reglisse && !p3.reglisse) {
            if (p1.type === p2.type && p2.type === p3.type) return true;
          }
        }

        // Bombes rainbow
        if (piece.estBombe && piece.typeBombe === CONFIG.BOMBE_RAINBOW) {
          if (colonne + 1 < this.grille.colonnes) {
            const p2 = this.grille.getPiece(ligne, colonne + 1);
            if (p2 && !p2.slime && !p2.reglisse && p2.type === piece.type) return true;
          }
          if (ligne + 1 < this.grille.lignes) {
            const p2 = this.grille.getPiece(ligne + 1, colonne);
            if (p2 && !p2.slime && !p2.reglisse && p2.type === piece.type) return true;
          }
        }
      }
    }

    return false;
  }
}