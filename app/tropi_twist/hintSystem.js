// hintSystem.js
// Port JS de hint_system.py : après 5s d'inactivité, fait pulser et se
// soulever légèrement une pièce jouable pour suggérer un coup.

class HintSystem {
  constructor(grille, deadlockDetector) {
    this.grille = grille;
    this.deadlockDetector = deadlockDetector;

    this.pieceIndice = null;
    this.animationActive = false;
    this.tempsSansAction = 0;
    this.delaiIndice = 5.0;

    this.tempsAnimation = 0;
    this.echelle = 1.0;
    this.hauteurSoulevement = 0;
    this.alphaLueur = 0;
  }

  reinitialiserTimer() {
    this.tempsSansAction = 0;
    this.arreterAnimation();
  }

  arreterAnimation() {
    this.animationActive = false;
    this.pieceIndice = null;
    this.tempsAnimation = 0;
    this.echelle = 1.0;
    this.hauteurSoulevement = 0;
    this.alphaLueur = 0;
  }

  // Trouve une pièce qui peut être déplacée pour créer un match
  trouverPieceABouger() {
    const casesPossibles = [];

    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        if (!this.grille.estCaseAccessible(ligne, colonne)) continue;

        const piece = this.grille.getPiece(ligne, colonne);
        if (piece === null || piece.reglisse) continue;

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
              if (this.deadlockDetector._simulerEchange(piece, pieceVoisine)) {
                casesPossibles.push(piece);
                break;
              }
            }
          }
        }
      }
    }

    if (casesPossibles.length > 0) {
      return casesPossibles[Math.floor(Math.random() * casesPossibles.length)];
    }
    return null;
  }

  demarrerAnimation() {
    if (this.animationActive) return;

    const piece = this.trouverPieceABouger();
    if (piece === null) return;

    this.pieceIndice = piece;
    this.tempsAnimation = 0;
    this.animationActive = true;
  }

  update(dt) {
    this.tempsSansAction += dt;

    if (this.tempsSansAction >= this.delaiIndice && !this.animationActive) {
      if (this.deadlockDetector.aUnMovePossible()) {
        this.demarrerAnimation();
      }
    }

    if (this.animationActive && this.pieceIndice) {
      this.tempsAnimation += dt;

      // Pulsation : échelle entre 1.0 et 1.25
      this.echelle = 1.0 + 0.25 * (Math.sin(this.tempsAnimation * 3.0) * 0.5 + 0.5);
      // Soulèvement : monte de 0 à 8 pixels
      this.hauteurSoulevement = -8 * (Math.sin(this.tempsAnimation * 3.0) * 0.5 + 0.5);
      // Lueur : alpha entre 0 et 80
      this.alphaLueur = Math.floor(80 * (Math.sin(this.tempsAnimation * 3.0) * 0.5 + 0.5));
    }
  }

  // Retourne l'ajustement visuel à appliquer si cette pièce est celle en
  // cours d'indice, sinon null. Utilisé par Game._dessinerPiece.
  getAjustement(piece) {
    if (this.animationActive && piece === this.pieceIndice) {
      return { echelle: this.echelle, decalageY: this.hauteurSoulevement };
    }
    return null;
  }

  // Dessine une lueur pulsante autour de la pièce indice (sous la pièce)
  dessinerSurbrillance(ctx, positionPixelFn, taillePiece) {
    if (!this.animationActive || !this.pieceIndice) return;

    const pos = positionPixelFn(this.pieceIndice.ligne, this.pieceIndice.colonne);
    const cx = pos.x + taillePiece / 2;
    const cy = pos.y + taillePiece / 2 + this.hauteurSoulevement;
    const rayon = taillePiece / 2 + 6;

    ctx.save();
    ctx.strokeStyle = `rgba(255,255,150,${(this.alphaLueur / 255).toFixed(3)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}