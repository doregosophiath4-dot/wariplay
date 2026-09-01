"use client";

import React, { useState, useEffect, useRef } from "react";

// Types
type ObjectiveType = "score" | "combo" | "temps";

interface Objective {
  type: ObjectiveType;
  valeur: number;
  texte: string;
}

// Configuration
const LARGEUR = 360;
const HAUTEUR = 640;
const NB_COLONNES = 4;
const TRAIT_WIDTH = 4;
const TILE_MARGIN = 8;

const COLONNE_WIDTH = Math.floor(LARGEUR / NB_COLONNES);
const TILE_WIDTH = COLONNE_WIDTH - 2 * TILE_MARGIN;
const TILE_HEIGHT = 120;
const MIN_DISTANCE_BETWEEN_TILES = TILE_HEIGHT + 20;

const positions_traits = [COLONNE_WIDTH, 2 * COLONNE_WIDTH, 3 * COLONNE_WIDTH];

// Couleurs
const BLANC = "#FFFFFF";
const NOIR = "#000000";
const GRIS = "#646464";
const ROUGE = "#FF0000";
const VERT = "#00FF00";
const ORANGE = "#FFA500";
const JAUNE = "#FFFF00";

class Particule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  taille: number;
  couleur: string;
  vie: number;
  gravite: number;
  friction: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.taille = Math.random() * 5 + 3;

    const couleurs = [JAUNE, ORANGE, ROUGE, BLANC];
    this.couleur = couleurs[Math.floor(Math.random() * couleurs.length)];
    this.vie = 255;
    this.gravite = 0.2;
    this.friction = 0.95;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravite;

    this.x += this.vx;
    this.y += this.vy;

    this.vie -= 5;
    this.taille = Math.max(1, this.taille * 0.95);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.vie > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.vie / 255);
      ctx.fillStyle = this.couleur;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.taille, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  estMorte() {
    return this.vie <= 0;
  }
}

class AnimationExplosion {
  x: number;
  y: number;
  tempsVie: number;
  age: number;
  particules: Particule[];
  anneauRayon: number;
  anneauRayonMax: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.tempsVie = 30;
    this.age = 0;
    this.particules = [];

    const nbParticules = Math.floor(Math.random() * 11) + 20;
    for (let i = 0; i < nbParticules; i++) {
      this.particules.push(new Particule(x, y));
    }

    this.anneauRayon = 0;
    this.anneauRayonMax = 50;
  }

  update() {
    this.age += 1;
    this.particules.forEach((p) => p.update());
    this.particules = this.particules.filter((p) => !p.estMorte());
    this.anneauRayon = Math.min(this.anneauRayonMax, this.anneauRayon + 3);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.anneauRayon > 0) {
      ctx.save();
      const alpha = Math.max(0, (150 - this.age * 5) / 255);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = JAUNE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.anneauRayon, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.particules.forEach((p) => p.draw(ctx));
  }

  estTerminee() {
    return this.age >= this.tempsVie && this.particules.length === 0;
  }
}

class Tuile {
  colonne: number;
  y: number;
  x: number;
  width: number;
  height: number;
  couleur: string;
  animationClic: number;

  constructor(colonne: number, y: number) {
    this.colonne = colonne;
    this.y = y;
    this.x = colonne * COLONNE_WIDTH + TILE_MARGIN;
    this.width = TILE_WIDTH;
    this.height = TILE_HEIGHT;
    this.couleur = NOIR;
    this.animationClic = 0;
  }

  update(speed: number) {
    this.y += speed;
    if (this.animationClic > 0) {
      this.animationClic -= 1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    let currentX = this.x;
    let currentY = this.y;
    let currentW = this.width;
    let currentH = this.height;

    if (this.animationClic > 0) {
      const scale = 1 + this.animationClic / 20;
      const deltaW = currentW * (scale - 1);
      const deltaH = currentH * (scale - 1);
      currentX -= deltaW / 2;
      currentY -= deltaH / 2;
      currentW += deltaW;
      currentH += deltaH;
    }

    ctx.fillStyle = this.couleur;
    ctx.beginPath();
    ctx.roundRect(currentX, currentY, currentW, currentH, 8);
    ctx.fill();

    ctx.strokeStyle = GRIS;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 8);
    ctx.stroke();

    const centreX = this.x + this.width / 2;
    const centreY = this.y + this.height / 2;
    ctx.beginPath();
    ctx.arc(centreX, centreY, 15, 0, Math.PI * 2);
    ctx.stroke();
  }

  declencherAnimationClic() {
    this.animationClic = 5;
    this.couleur = GRIS;
  }

  containsPoint(px: number, py: number) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  isOffScreen() {
    return this.y > HAUTEUR;
  }
}

class GestionnaireDifficulte {
  niveau: number;
  SCORE_PAR_NIVEAU: number;
  vitesseBase: number;
  vitesseActuelle: number;
  delaiApparitionBase: number;
  delaiApparitionActuel: number;
  maxTuilesBase: number;
  maxTuilesActuel: number;

  constructor() {
    this.niveau = 1;
    this.SCORE_PAR_NIVEAU = 100;
    this.vitesseBase = 3;
    this.vitesseActuelle = this.vitesseBase;
    this.delaiApparitionBase = 45;
    this.delaiApparitionActuel = this.delaiApparitionBase;
    this.maxTuilesBase = 4;
    this.maxTuilesActuel = this.maxTuilesBase;
  }

  mettreAJour(score: number) {
    const nouveauNiveau = Math.floor(score / this.SCORE_PAR_NIVEAU) + 1;
    if (nouveauNiveau > this.niveau) {
      this.niveau = nouveauNiveau;
      this.augmenterDifficulte();
    }
  }

  augmenterDifficulte() {
    this.vitesseActuelle = Math.min(
      this.vitesseBase + (this.niveau - 1) * 1.2,
      15
    );
    this.delaiApparitionActuel = Math.max(
      this.delaiApparitionBase - (this.niveau - 1) * 4,
      10
    );
    this.maxTuilesActuel = Math.min(
      this.maxTuilesBase + Math.floor((this.niveau - 1) / 2),
      10
    );
  }
}

class Jeu {
  tuiles: Tuile[];
  score: number;
  combo: number;
  maxCombo: number;
  partieTerminee: boolean;
  gainTraite: boolean;
  frameCount: number;
  spawnTimer: number;
  gestionnaireDifficulte: GestionnaireDifficulte;
  animations: AnimationExplosion[];
  objectif: Objective;
  tempsEcouleSec: number;
  startTime: number;
  objectifAtteint: boolean;
  miseActuelle: number;
  onSoldeUpdate: (gain: number) => void;

  constructor(
    objectif: Objective,
    miseActuelle: number,
    onSoldeUpdate: (gain: number) => void
  ) {
    this.tuiles = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.partieTerminee = false;
    this.gainTraite = false;
    this.frameCount = 0;
    this.spawnTimer = 0;
    this.gestionnaireDifficulte = new GestionnaireDifficulte();
    this.animations = [];

    this.objectif = objectif;
    this.miseActuelle = miseActuelle;
    this.onSoldeUpdate = onSoldeUpdate;
    this.tempsEcouleSec = 0;
    this.startTime = Date.now();
    this.objectifAtteint = false;
  }

  peutSpawnTuile(colonne: number) {
    if (this.tuiles.length >= this.gestionnaireDifficulte.maxTuilesActuel) {
      return false;
    }

    for (let tuile of this.tuiles) {
      if (tuile.colonne === colonne) {
        const distance = Math.abs(tuile.y - -TILE_HEIGHT);
        if (distance < MIN_DISTANCE_BETWEEN_TILES) {
          return false;
        }
      }
    }
    return true;
  }

  spawnTuile() {
    const colonnesDisponibles: number[] = [];
    for (let col = 0; col < NB_COLONNES; col++) {
      if (this.peutSpawnTuile(col)) {
        colonnesDisponibles.push(col);
      }
    }

    if (colonnesDisponibles.length > 0) {
      const colonne =
        colonnesDisponibles[
          Math.floor(Math.random() * colonnesDisponibles.length)
        ];
      this.tuiles.push(new Tuile(colonne, -TILE_HEIGHT));
    }
  }

  creerExplosion(x: number, y: number) {
    this.animations.push(new AnimationExplosion(x, y));
  }

  calculerBonusPrecision(tuile: Tuile) {
    const zoneFrappeIdeale = HAUTEUR - 150;
    const distance = Math.abs(tuile.y + TILE_HEIGHT - zoneFrappeIdeale);
    return Math.max(0, 10 - Math.floor(distance / 15));
  }

  gererClic(pos: { x: number; y: number }) {
    const colonneCliquee = Math.floor(pos.x / COLONNE_WIDTH);
    const tuilesColonne = this.tuiles.filter(
      (t) => t.colonne === colonneCliquee
    );

    if (tuilesColonne.length > 0) {
      let tuileLaPlusBasse = tuilesColonne[0];
      for (let t of tuilesColonne) {
        if (t.y > tuileLaPlusBasse.y) {
          tuileLaPlusBasse = t;
        }
      }

      if (tuileLaPlusBasse.containsPoint(pos.x, pos.y)) {
        tuileLaPlusBasse.declencherAnimationClic();

        const centreX = tuileLaPlusBasse.x + tuileLaPlusBasse.width / 2;
        const centreY = tuileLaPlusBasse.y + tuileLaPlusBasse.height / 2;
        this.creerExplosion(centreX, centreY);

        const precisionBonus = this.calculerBonusPrecision(tuileLaPlusBasse);
        let pointsGagnes = 10 + precisionBonus;

        if (this.combo > 1) {
          pointsGagnes = Math.floor(pointsGagnes * (1 + this.combo * 0.1));
        }

        this.score += pointsGagnes;
        this.combo += 1;
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        this.tuiles = this.tuiles.filter((t) => t !== tuileLaPlusBasse);
        return true;
      }
    }

    this.combo = 0;
    return false;
  }

  verifierObjectif() {
    if (this.objectif.type === "score" && this.score >= this.objectif.valeur) {
      return true;
    }
    if (
      this.objectif.type === "combo" &&
      this.maxCombo >= this.objectif.valeur
    ) {
      return true;
    }
    if (
      this.objectif.type === "temps" &&
      this.tempsEcouleSec >= this.objectif.valeur
    ) {
      return true;
    }
    return false;
  }

  update() {
    if (!this.partieTerminee) {
      this.tempsEcouleSec = Math.floor((Date.now() - this.startTime) / 1000);

      if (this.verifierObjectif()) {
        this.objectifAtteint = true;
        this.partieTerminee = true;
      }
    }

    if (this.partieTerminee) {
      if (!this.gainTraite) {
        if (this.objectifAtteint) {
          const gain = this.miseActuelle * 2;
          this.onSoldeUpdate(gain);
        }
        this.gainTraite = true;
      }
      return;
    }

    this.frameCount += 1;
    this.animations.forEach((a) => a.update());
    this.animations = this.animations.filter((a) => !a.estTerminee());

    this.gestionnaireDifficulte.mettreAJour(this.score);

    this.spawnTimer += 1;
    if (this.spawnTimer >= this.gestionnaireDifficulte.delaiApparitionActuel) {
      this.spawnTuile();
      this.spawnTimer = 0;
    }

    const vitesse = this.gestionnaireDifficulte.vitesseActuelle;
    this.tuiles.forEach((t) => t.update(vitesse));

    for (let i = this.tuiles.length - 1; i >= 0; i--) {
      if (this.tuiles[i].isOffScreen()) {
        this.partieTerminee = true;
        this.objectifAtteint = false;
        this.tuiles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, LARGEUR, HAUTEUR);

    // Zone de frappe
    ctx.strokeStyle = VERT;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, HAUTEUR - 150, LARGEUR, 10);

    // Traits verticaux
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = TRAIT_WIDTH;
    positions_traits.forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HAUTEUR);
      ctx.stroke();
    });

    this.tuiles.forEach((t) => t.draw(ctx));
    this.animations.forEach((a) => a.draw(ctx));

    this.drawInterface(ctx);

    if (this.partieTerminee) {
      this.drawGameOver(ctx);
    }
  }

  drawInterface(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, LARGEUR, 50);

    ctx.fillStyle = BLANC;
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${this.score}`, 10, 34);

    if (this.combo > 1) {
      ctx.fillStyle = ORANGE;
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`x${this.combo}`, LARGEUR - 15, 34);
    }
  }

  drawGameOver(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, LARGEUR, HAUTEUR);

    ctx.fillStyle = this.objectifAtteint ? VERT : ROUGE;
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      this.objectifAtteint ? "OBJECTIF RÉUSSI !" : "OBJECTIF MANQUÉ !",
      LARGEUR / 2,
      HAUTEUR / 2 - 80
    );

    ctx.fillStyle = BLANC;
    ctx.font = "18px Arial";
    ctx.fillText(
      `Score: ${this.score} | Max Combo: x${this.maxCombo}`,
      LARGEUR / 2,
      HAUTEUR / 2 - 30
    );
    ctx.fillText(
      `Temps de jeu: ${this.tempsEcouleSec}s`,
      LARGEUR / 2,
      HAUTEUR / 2
    );

    ctx.fillStyle = JAUNE;
    ctx.fillText(
      `Objectif: ${this.objectif.texte}`,
      LARGEUR / 2,
      HAUTEUR / 2 + 40
    );

    ctx.fillStyle = this.objectifAtteint ? VERT : ROUGE;
    const gain = this.miseActuelle * 2;
    ctx.fillText(
      this.objectifAtteint
        ? `Gain: +${gain} XOF`
        : `Perte: -${this.miseActuelle} XOF`,
      LARGEUR / 2,
      HAUTEUR / 2 + 80
    );

    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = BLANC;
      ctx.font = "18px Arial";
      ctx.fillText("Cliquez pour rejouer", LARGEUR / 2, HAUTEUR / 2 + 130);
    }
  }
}

export default function MagicTilesGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [solde, setSolde] = useState<number>(10000);
  const [miseInput, setMiseInput] = useState<number>(100);
  const [miseActuelle, setMiseActuelle] = useState<number>(0);
  const [objectifActuel, setObjectifActuel] = useState<Objective | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [showBetModal, setShowBetModal] = useState<boolean>(true);
  const [showObjectiveModal, setShowObjectiveModal] = useState<boolean>(false);

  const jeuRef = useRef<Jeu | null>(null);

  // Générateur d'objectifs
  const genererObjectif = (): Objective => {
    const types: ObjectiveType[] = ["score", "combo", "temps"];
    const typeChoisi = types[Math.floor(Math.random() * types.length)];

    if (typeChoisi === "score") {
      const scores = [100, 150, 200, 250];
      const val = scores[Math.floor(Math.random() * scores.length)];
      return { type: "score", valeur: val, texte: `Atteins un score de ${val}` };
    } else if (typeChoisi === "combo") {
      const combos = [5, 8, 10, 12];
      const val = combos[Math.floor(Math.random() * combos.length)];
      return { type: "combo", valeur: val, texte: `Fais un combo de x${val}` };
    } else {
      const temps = [15, 20, 30];
      const val = temps[Math.floor(Math.random() * temps.length)];
      return {
        type: "temps",
        valeur: val,
        texte: `Joue pendant au moins ${val} secondes`,
      };
    }
  };

  // Phase 1 : Valider la mise
  const handleValiderMise = () => {
    if (isNaN(miseInput) || miseInput < 100 || miseInput > 500) {
      setErrorMsg("La mise doit être entre 100 et 500 XOF.");
      return;
    }
    if (miseInput > solde) {
      setErrorMsg("Solde insuffisant !");
      return;
    }

    setErrorMsg("");
    setMiseActuelle(miseInput);
    setSolde((prev) => prev - miseInput);

    const obj = genererObjectif();
    setObjectifActuel(obj);

    setShowBetModal(false);
    setShowObjectiveModal(true);
  };

  // Phase 2 : Démarrer la partie
  const handleStartGame = () => {
    setShowObjectiveModal(false);
    if (objectifActuel) {
      jeuRef.current = new Jeu(
        objectifActuel,
        miseInput,
        (gain: number) => setSolde((prev) => prev + gain)
      );
    }
  };

  const gererAction = (pos: { x: number; y: number }) => {
    if (!jeuRef.current) return;

    if (jeuRef.current.partieTerminee) {
      setShowBetModal(true);
      jeuRef.current = null;
    } else {
      jeuRef.current.gererClic(pos);
    }
  };

  // Attachement non passif des événements tactiles pour empêcher les erreurs de scroll/preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const pos = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
        gererAction(pos);
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Boucle Canvas GameLoop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (jeuRef.current) {
            jeuRef.current.update();
            jeuRef.current.draw(ctx);
          } else {
            ctx.clearRect(0, 0, LARGEUR, HAUTEUR);
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen w-full select-none overflow-hidden font-sans bg-no-repeat bg-cover bg-center bg-[url('/falling/img2.jpg')] md:bg-[url('/falling/img.jpg')]">
      <div id="gameContainer" className="relative w-[360px] h-[640px]">
        {/* Modal 1: Place ta mise */}
        {showBetModal && (
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center rounded-lg text-[#eef7ff] overflow-hidden backdrop-blur-md bg-[radial-gradient(circle_at_50%_35%,rgba(0,229,255,0.08),transparent_42%),rgba(3,5,14,0.94)] before:content-[''] before:absolute before:w-[230px] before:h-[230px] before:-top-[100px] before:-left-[90px] before:bg-[rgba(0,229,255,0.08)] before:border before:border-[rgba(0,229,255,0.16)] before:rounded-full after:content-[''] after:absolute after:w-[280px] after:h-[280px] after:-right-[130px] after:-bottom-[120px] after:bg-[rgba(124,58,237,0.10)] after:border after:border-[rgba(124,58,237,0.18)] after:rounded-full">
            <div className="relative w-[88%] p-[28px_24px_24px] text-center rounded-[18px] border border-[rgba(0,229,255,0.55)] bg-gradient-to-br from-[rgba(18,25,43,0.98)] to-[rgba(7,11,24,0.98)] shadow-[0_24px_60px_rgba(0,0,0,0.65),0_0_32px_rgba(0,229,255,0.12)] animate-popupIn before:content-[''] before:absolute before:top-0 before:left-[12%] before:right-[12%] before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00e5ff] before:to-transparent">
              <h2 className="relative z-10 mb-[14px] text-[#f5fbff] text-[22px] font-black tracking-[1.8px] drop-shadow-[0_0_16px_rgba(0,229,255,0.35)]">
                PLACEZ VOTRE MISE
              </h2>
              <p className="relative z-10 text-[#8195aa] text-[12px] mb-[14px] tracking-[0.6px] leading-[1.5]">
                CONFIGUREZ VOTRE PARTIE
              </p>
              <div className="relative z-10 inline-block mb-[18px] px-[14px] py-[9px] border border-[rgba(0,229,255,0.2)] rounded-[10px] bg-[rgba(0,229,255,0.055)] text-[#9fb4c9] text-[14px] font-bold tracking-[0.5px]">
                Solde:{" "}
                <span className="text-[#00e5ff] text-[18px] drop-shadow-[0_0_12px_rgba(0,229,255,0.45)]">
                  {solde}
                </span>{" "}
                XOF
              </div>

              <div className="relative z-10 my-[16px]">
                <label
                  htmlFor="betInput"
                  className="block mb-[9px] text-[#8fa5ba] text-[12px] font-bold tracking-[0.8px] uppercase"
                >
                  Montant (Min 100 - Max 500 XOF)
                </label>
                <input
                  type="number"
                  id="betInput"
                  min="100"
                  max="500"
                  value={miseInput}
                  onChange={(e) => setMiseInput(parseInt(e.target.value, 10))}
                  className="w-full p-[13px_14px] border border-[rgba(0,229,255,0.28)] rounded-[11px] outline-none bg-[#080d19] text-white text-[20px] font-extrabold text-center transition-all duration-200 focus:border-[#00e5ff] focus:shadow-[0_0_20px_rgba(0,229,255,0.12)]"
                />
                {errorMsg && (
                  <div className="text-[#ff5470] text-[12px] font-bold mt-[8px]">
                    {errorMsg}
                  </div>
                )}
              </div>

              <button
                onClick={handleValiderMise}
                className="relative z-10 mt-[16px] p-[14px_22px] w-full border border-[rgba(255,255,255,0.18)] rounded-[11px] bg-gradient-to-br from-[#00d9ff] to-[#1677ff] text-[#03101a] font-black text-[14px] tracking-[1px] cursor-pointer transition-all duration-180 shadow-[0_8px_22px_rgba(0,145,255,0.25)] hover:-translate-y-[2px] hover:brightness-[1.08] active:translate-y-0 active:scale-[0.98]"
              >
                VALIDER LA MISE
              </button>
            </div>
          </div>
        )}

        {/* Modal 2: Objectif Assigné */}
        {showObjectiveModal && (
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center rounded-lg text-[#eef7ff] overflow-hidden backdrop-blur-md bg-[radial-gradient(circle_at_50%_35%,rgba(0,229,255,0.08),transparent_42%),rgba(3,5,14,0.94)]">
            <div className="relative w-[88%] p-[28px_24px_24px] text-center rounded-[18px] border border-[rgba(0,229,255,0.55)] bg-gradient-to-br from-[rgba(18,25,43,0.98)] to-[rgba(7,11,24,0.98)] shadow-[0_24px_60px_rgba(0,0,0,0.65),0_0_32px_rgba(0,229,255,0.12)] animate-popupIn">
              <h2 className="relative z-10 mb-[14px] text-[#f5fbff] text-[22px] font-black tracking-[1.8px] drop-shadow-[0_0_16px_rgba(0,229,255,0.35)]">
                OBJECTIF ASSIGNÉ
              </h2>
              <p className="relative z-10 text-[#8195aa] text-[13px] leading-[1.5]">
                Atteignez cet objectif pour débloquer votre récompense.
              </p>

              <div className="relative z-10 my-[20px] mb-[10px] p-[18px_14px] border border-[rgba(139,92,246,0.65)] rounded-[13px] bg-gradient-to-br from-[rgba(139,92,246,0.12)] to-[rgba(0,229,255,0.055)] text-[#d9ccff] text-[18px] leading-[1.4] font-black tracking-[0.3px] shadow-[0_0_24px_rgba(124,58,237,0.12)]">
                {objectifActuel?.texte}
              </div>

              <button
                onClick={handleStartGame}
                className="relative z-10 mt-[16px] p-[14px_22px] w-full border border-[rgba(255,255,255,0.18)] rounded-[11px] bg-gradient-to-br from-[#00d9ff] to-[#1677ff] text-[#03101a] font-black text-[14px] tracking-[1px] cursor-pointer transition-all duration-180 shadow-[0_8px_22px_rgba(0,145,255,0.25)] hover:-translate-y-[2px] hover:brightness-[1.08] active:translate-y-0 active:scale-[0.98]"
              >
                C'EST PARTI !
              </button>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={LARGEUR}
          height={HAUTEUR}
          className="shadow-[0_0_30px_rgba(0,0,0,0.6)] cursor-pointer bg-transparent"
          onMouseDown={(e) => {
            if (e.button === 0) gererAction(getCanvasCoordinates(e));
          }}
        />
      </div>
    </div>
  );
}