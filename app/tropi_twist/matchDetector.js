// matchDetector.js
// Port JS de match_detector.py : détection des matches, création de bombes,
// activation de bombes touchées dans un match, bombe rainbow, et explosions
// en chaîne (colonne / rangée / adjacente / rainbow).

class MatchDetector {
  constructor(grille) {
    this.grille = grille;
    this.bombesAExploser = [];
    this.piecesADetruire = new Set();
    this.piecesConservees = new Set(); // pièces transformées en bombes (pas détruites)
    this.rainbowCouleurCible = null;

    // Pour l'affichage des effets d'explosion (rempli à chaque appel)
    this.effets = []; // { type: 'column'|'row'|'adjacent'|'rainbow', ligne, colonne, couleur }
  }

  // Point d'entrée principal : détecte tous les matches, crée/active les
  // bombes nécessaires, calcule les pièces à détruire. Ne modifie PAS encore
  // la grille (laisse l'appelant animer avant de retirer les pièces).
  analyser() {
    this.bombesAExploser = [];
    this.piecesADetruire = new Set();
    this.piecesConservees = new Set();
    this.rainbowCouleurCible = null;
    this.effets = [];

    const matchesHorizontaux = this.detecterMatchesHorizontaux();
    const matchesVerticaux = this.detecterMatchesVerticaux();
    const tousLesMatches = [...matchesHorizontaux, ...matchesVerticaux];

    if (tousLesMatches.length === 0) {
      return { total: 0, piecesADetruire: this.piecesADetruire, piecesConservees: this.piecesConservees, effets: this.effets };
    }

    for (const match of tousLesMatches) {
      let bombeDansMatch = null;
      let pieceNormaleDansMatch = null;

      for (const piece of match) {
        if (piece.estBombe) {
          bombeDansMatch = piece;
        } else {
          pieceNormaleDansMatch = piece;
        }
      }

      if (bombeDansMatch) {
        if (bombeDansMatch.typeBombe === CONFIG.BOMBE_RAINBOW && pieceNormaleDansMatch) {
          const couleurCible = pieceNormaleDansMatch.type;
          this.rainbowCouleurCible = couleurCible;
          this.piecesADetruire.add(bombeDansMatch);
          for (const piece of match) this.piecesADetruire.add(piece);
        } else {
          this.bombesAExploser.push(bombeDansMatch);
          this.piecesADetruire.add(bombeDansMatch);
          for (const piece of match) {
            if (piece !== bombeDansMatch) this.piecesADetruire.add(piece);
          }
        }
      } else if (match.length >= CONFIG.MATCH_BOMBE) {
        const milieu = Math.floor(match.length / 2);
        let pieceMilieu = match[milieu];

        // Une pièce gelée ou verrouillée ne peut pas devenir le centre
        // d'une bombe : on cherche une autre pièce du match pour ce rôle.
        if (pieceMilieu.reglisse || pieceMilieu.gelee) {
          for (const p of match) {
            if (!p.reglisse && !p.gelee && !p.estBombe) { pieceMilieu = p; break; }
          }
        }

        let typeBombe;
        if (match.length >= CONFIG.MATCH_RAINBOW) {
          typeBombe = CONFIG.BOMBE_RAINBOW;
        } else if (match.length >= CONFIG.MATCH_SUPER_BOMBE) {
          typeBombe = CONFIG.BOMBE_ADJACENTE;
        } else if (match[0].ligne === match[1].ligne) {
          typeBombe = CONFIG.BOMBE_RANGEE;
        } else {
          typeBombe = CONFIG.BOMBE_COLONNE;
        }

        if (!pieceMilieu.gelee) {
          pieceMilieu.transformerEnBombe(typeBombe);
          this.piecesConservees.add(pieceMilieu);
          for (const piece of match) {
            if (piece !== pieceMilieu) this.piecesADetruire.add(piece);
          }
        } else {
          // Toujours gelée (aucune alternative trouvée) : détruite normalement
          for (const piece of match) this.piecesADetruire.add(piece);
        }
      } else {
        for (const piece of match) this.piecesADetruire.add(piece);
      }
    }

    if (this.rainbowCouleurCible) {
      this._exploserRainbow(this.rainbowCouleurCible);
    }

    this._exploserBombesEnChaine();

    const total = this.piecesADetruire.size + this.piecesConservees.size;
    return { total, piecesADetruire: this.piecesADetruire, piecesConservees: this.piecesConservees, effets: this.effets };
  }

  _exploserRainbow(couleurCible) {
    this.effets.push({ type: "rainbow", couleur: couleurCible });

    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        if (this.grille.estCaseAccessible(ligne, colonne)) {
          const piece = this.grille.getPiece(ligne, colonne);
          if (piece && piece.type === couleurCible) {
            if (piece.estBombe && !this.piecesADetruire.has(piece)) {
              this.bombesAExploser.push(piece);
            }
            this.piecesADetruire.add(piece);
          }
        }
      }
    }
  }

  _exploserBombesEnChaine() {
    let index = 0;
    while (index < this.bombesAExploser.length) {
      const bombe = this.bombesAExploser[index];

      if (bombe.typeBombe === CONFIG.BOMBE_COLONNE) {
        this._exploserColonne(bombe);
      } else if (bombe.typeBombe === CONFIG.BOMBE_RANGEE) {
        this._exploserRangee(bombe);
      } else if (bombe.typeBombe === CONFIG.BOMBE_ADJACENTE) {
        this._exploserAdjacent(bombe);
      } else if (bombe.typeBombe === CONFIG.BOMBE_RAINBOW) {
        const couleurAleatoire = this._getCouleurAleatoire();
        this._exploserRainbow(couleurAleatoire);
      }

      index++;
    }
  }

  _getCouleurAleatoire() {
    const couleursPresentes = new Set();
    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
        const piece = this.grille.getPiece(ligne, colonne);
        if (piece && !piece.estBombe) {
          couleursPresentes.add(piece.type);
        }
      }
    }
    const liste = [...couleursPresentes];
    if (liste.length > 0) return liste[Math.floor(Math.random() * liste.length)];
    const types = Object.keys(CONFIG.PIECES_FILES);
    return types[Math.floor(Math.random() * types.length)];
  }

  _exploserColonne(pieceBombe) {
    this.effets.push({ type: "column", ligne: pieceBombe.ligne, colonne: pieceBombe.colonne });

    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      if (this.grille.estCaseAccessible(ligne, pieceBombe.colonne)) {
        const piece = this.grille.getPiece(ligne, pieceBombe.colonne);
        if (piece && piece !== pieceBombe) {
          if (piece.estBombe && !this.piecesADetruire.has(piece)) {
            this.bombesAExploser.push(piece);
          }
          this.piecesADetruire.add(piece);
        }
      }
    }
  }

  _exploserRangee(pieceBombe) {
    this.effets.push({ type: "row", ligne: pieceBombe.ligne, colonne: pieceBombe.colonne });

    for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
      if (this.grille.estCaseAccessible(pieceBombe.ligne, colonne)) {
        const piece = this.grille.getPiece(pieceBombe.ligne, colonne);
        if (piece && piece !== pieceBombe) {
          if (piece.estBombe && !this.piecesADetruire.has(piece)) {
            this.bombesAExploser.push(piece);
          }
          this.piecesADetruire.add(piece);
        }
      }
    }
  }

  _exploserAdjacent(pieceBombe) {
    this.effets.push({ type: "adjacent", ligne: pieceBombe.ligne, colonne: pieceBombe.colonne });

    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dl, dc] of directions) {
      const ligne = pieceBombe.ligne + dl;
      const colonne = pieceBombe.colonne + dc;
      if (this.grille.estCaseAccessible(ligne, colonne)) {
        const piece = this.grille.getPiece(ligne, colonne);
        if (piece) {
          if (piece.estBombe && !this.piecesADetruire.has(piece)) {
            this.bombesAExploser.push(piece);
          }
          this.piecesADetruire.add(piece);
        }
      }
    }
  }

  detecterMatchesHorizontaux() {
    const matches = [];

    for (let ligne = 0; ligne < this.grille.lignes; ligne++) {
      let colonne = 0;
      while (colonne < this.grille.colonnes) {
        if (!this.grille.estCaseActive(ligne, colonne)) {
          colonne++;
          continue;
        }

        const piece = this.grille.getPiece(ligne, colonne);
        if (piece && !piece.bloqueMatchNormal()) {
          const matchCourant = [piece];
          let colonneSuivante = colonne + 1;

          while (colonneSuivante < this.grille.colonnes) {
            if (!this.grille.estCaseActive(ligne, colonneSuivante)) break;
            const pieceSuivante = this.grille.getPiece(ligne, colonneSuivante);
            if (pieceSuivante && !pieceSuivante.bloqueMatchNormal() && this._sontCompatibles(piece, pieceSuivante)) {
              matchCourant.push(pieceSuivante);
              colonneSuivante++;
            } else {
              break;
            }
          }

          if (matchCourant.length >= CONFIG.MATCH_MINIMUM) {
            matches.push(matchCourant);
            colonne = colonneSuivante;
          } else {
            colonne++;
          }
        } else {
          colonne++;
        }
      }
    }

    return matches;
  }

  detecterMatchesVerticaux() {
    const matches = [];

    for (let colonne = 0; colonne < this.grille.colonnes; colonne++) {
      let ligne = 0;
      while (ligne < this.grille.lignes) {
        if (!this.grille.estCaseActive(ligne, colonne)) {
          ligne++;
          continue;
        }

        const piece = this.grille.getPiece(ligne, colonne);
        if (piece && !piece.bloqueMatchNormal()) {
          const matchCourant = [piece];
          let ligneSuivante = ligne + 1;

          while (ligneSuivante < this.grille.lignes) {
            if (!this.grille.estCaseActive(ligneSuivante, colonne)) break;
            const pieceSuivante = this.grille.getPiece(ligneSuivante, colonne);
            if (pieceSuivante && !pieceSuivante.bloqueMatchNormal() && this._sontCompatibles(piece, pieceSuivante)) {
              matchCourant.push(pieceSuivante);
              ligneSuivante++;
            } else {
              break;
            }
          }

          if (matchCourant.length >= CONFIG.MATCH_MINIMUM) {
            matches.push(matchCourant);
            ligne = ligneSuivante;
          } else {
            ligne++;
          }
        } else {
          ligne++;
        }
      }
    }

    return matches;
  }

  // Deux pièces sont compatibles pour un match si même type, ou si l'une
  // des deux est une bombe rainbow (comme match_detector.py)
  _sontCompatibles(piece, pieceSuivante) {
    if (piece.estBombe && piece.typeBombe === CONFIG.BOMBE_RAINBOW) return true;
    if (pieceSuivante.estBombe && pieceSuivante.typeBombe === CONFIG.BOMBE_RAINBOW) return true;
    return pieceSuivante.type === piece.type;
  }

  // Conservé pour compatibilité (utilisé par le deadlock/hint plus tard) :
  // renvoie simplement l'ensemble des pièces qui font partie d'un match,
  // sans logique de bombes.
  detecterTousLesMatches() {
    const piecesMatchees = new Set();
    const horizontaux = this.detecterMatchesHorizontaux();
    const verticaux = this.detecterMatchesVerticaux();
    for (const match of [...horizontaux, ...verticaux]) {
      for (const piece of match) piecesMatchees.add(piece);
    }
    return piecesMatchees;
  }
}