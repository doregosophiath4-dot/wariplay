// components/game_loader.tsx
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';

// --- Types ---
type LoaderStatus =
  | 'Initialisation'
  | 'Chargement des assets'
  | 'Préparation du plateau'
  | 'Finalisation'
  | '✓ Prêt';

interface GameLoaderProps {
  /**
   * Liste des chemins d'assets (images) à précharger réellement
   * avant d'afficher le jeu — ex: ["/memo/1.jpg", "/memo/bet.webp", ...]
   */
  assets: string[];
  /** Le jeu à afficher une fois tous les assets chargés */
  children: ReactNode;
  /** Nom affiché sur l'écran de chargement */
  gameName?: string;
  /** Délai minimum (ms) avant de révéler le jeu, pour éviter un flash */
  minDurationMs?: number;
}

// --- Composant ---
export default function GameLoader({
  assets,
  children,
  gameName = 'WariPlay',
  minDurationMs = 300,
}: GameLoaderProps) {
  const [ready, setReady] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<LoaderStatus>('Initialisation');

  const loadedRef = useRef<number>(0);
  const cancelledRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);

  // Met à jour la barre et le libellé de statut en fonction du % réel chargé
  const updateUI = (loaded: number, total: number): void => {
    const value = total > 0 ? Math.round((loaded / total) * 100) : 100;
    const clamped = Math.min(100, Math.max(0, value));

    setProgress(clamped);

    if (clamped < 10) setStatus('Initialisation');
    else if (clamped < 60) setStatus('Chargement des assets');
    else if (clamped < 95) setStatus('Préparation du plateau');
    else if (clamped < 100) setStatus('Finalisation');
    else setStatus('✓ Prêt');
  };

  useEffect(() => {
    cancelledRef.current = false;
    loadedRef.current = 0;
    startTimeRef.current = Date.now();

    setReady(false);
    updateUI(0, assets.length);

    // Aucun asset à charger : on affiche le jeu immédiatement
    if (assets.length === 0) {
      updateUI(1, 1);
      setReady(true);
      return;
    }

    const total = assets.length;

    function markOne() {
      if (cancelledRef.current) {
        return;
      }

      loadedRef.current += 1;

      updateUI(loadedRef.current, total);

      if (loadedRef.current >= total) {
        const elapsed = Date.now() - startTimeRef.current;
        const wait = Math.max(0, minDurationMs - elapsed);

        setTimeout(() => {
          if (!cancelledRef.current) {
            setReady(true);
          }
        }, wait);
      }
    }

    const images: HTMLImageElement[] = assets.map((src) => {
      const img = new window.Image();

      /*
         Un asset manquant ou en erreur ne doit jamais bloquer
         indéfiniment l'affichage du jeu.
      */
      img.onload = markOne;
      img.onerror = markOne;

      img.src = src;

      return img;
    });

    return () => {
      cancelledRef.current = true;

      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [assets, minDurationMs]);

  if (ready) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-[#0a0a1a]">
      {/* Carte transparente */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl px-8 py-10 sm:px-12 sm:py-12 max-w-sm w-full shadow-2xl shadow-black/40 flex flex-col items-center text-center">

        {/* Identité avec logo WariPlay */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10">
            <Image
              src="/img/wari.png"
              alt={gameName}
              fill
              sizes="40px"
              className="object-contain drop-shadow-[0_0_20px_rgba(0,200,150,0.3)]"
              priority
            />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-50">
            {gameName}
          </span>
        </div>

        {/* Progression réelle basée sur les assets chargés */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between text-xs tracking-wide text-white/30 px-0.5">
            <span className="text-white/50 font-medium">{status}</span>
            <span className="font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-0.5 rounded-full border border-emerald-400/10 text-[0.65rem]">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-200 ease-out shadow-[0_0_14px_rgba(16,185,129,0.2)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Pied : spinner + version */}
        <div className="mt-8 flex items-center gap-5 flex-wrap justify-center">
          <span className="inline-block w-4 h-4 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin opacity-70" />
          <span className="text-white/10 text-[0.6rem] tracking-wider pointer-events-none">
            v0.3.1
          </span>
        </div>
      </div>
    </div>
  );
}