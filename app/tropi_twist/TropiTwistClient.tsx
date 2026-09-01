"use client";

import { useEffect, useRef, useState } from "react";
import "./styles.css";
import GameLoader from "../../components/game_loader";

declare global {
  interface Window {
    // Classe exposée par app.js (voir la note dans ce fichier plus bas).
    App?: new (
      canvas: HTMLCanvasElement,
      rappels?: {
        onProgression?: (ratio: number) => void;
        onErreur?: (message: string) => void;
        onPret?: () => void;
      }
    ) => unknown;
  }
}

type ScriptSource = { nom: string; code: string };

export default function TropiTwistClient({ scripts }: { scripts: ScriptSource[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jeuDemarre = useRef(false);

  // État du chargement, affiché par components/game_loader.tsx à la place
  // de l'ancien écran de chargement dessiné en canvas.
  const [progression, setProgression] = useState(0); // 0-100
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    if (jeuDemarre.current) return;
    if (!canvasRef.current) return;

    // Un <script> créé via createElement + textContent puis inséré dans le
    // document s'exécute IMMÉDIATEMENT et SYNCHRONE (contrairement à un
    // <script src>, qui charge de façon async) — donc en les ajoutant les
    // uns après les autres dans l'ordre, chacun s'exécute avant le suivant,
    // exactement comme les <script src="..."> classés dans l'ancien
    // index.html. Pas besoin d'attendre un événement "load".
    for (const { nom, code } of scripts) {
      const balise = document.createElement("script");
      balise.text = code;
      balise.dataset.script = nom;
      document.head.appendChild(balise);
    }

    // Par ce point, app.js (dernier script) s'est déjà exécuté et a posé
    // window.App = App; (une class déclarée dans un <script> classique ne
    // devient pas automatiquement une propriété de window, contrairement à
    // var — il fallait l'exposer explicitement pour que ce composant React,
    // qui vit dans un module ES séparé, puisse l'instancier).
    const ClasseApp = window.App;
    if (typeof ClasseApp === "function") {
      jeuDemarre.current = true;
      new ClasseApp(canvasRef.current, {
        onProgression: (ratio) => setProgression(ratio * 100),
        onErreur: (message) => setErreurChargement(message),
        onPret: () => setPret(true),
      });
    } else {
      console.error("window.App est introuvable — un des scripts a-t-il échoué à s'exécuter ?");
    }
  }, [scripts]);

  return (
    <div id="conteneur">
      <canvas id="jeu" ref={canvasRef} />
      {/*
        Champ HTML positionné par-dessus le canvas pendant le popup de mise
        (voir misePopup.js + app.js::_synchroniserInputMise). Volontairement
        non contrôlé par React (pas de value=/onChange=) : c'est le JS
        classique du jeu qui lit/écrit .value directement.
      */}
      <input
        type="number"
        id="inputMise"
        inputMode="numeric"
        min={100}
        max={500}
        step={1}
        autoComplete="off"
      />

      {/*
        Loader React (WariPlay · FLY) par-dessus le canvas tant que le
        chargement n'est pas terminé — remplace l'ancien écran de
        chargement dessiné en canvas (loadingScreen.js, supprimé). Une
        fois `onPret` déclenché (au point le plus sombre du fondu vers le
        Menu, côté canvas), on le retire : l'écran est déjà noir à ce
        moment-là, donc la transition est invisible.
      */}
      {!pret && (
        <div className="fixed inset-0 z-50">
          <GameLoader progress={progression} errorMessage={erreurChargement} showBackLink={false} />
        </div>
      )}
    </div>
  );
}
