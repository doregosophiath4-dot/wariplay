// app/loading.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedBackground from './AnimatedBackground';

// --- Types ---
type LoadingStatus = 
  | 'Initialisation'
  | 'Décompression'
  | 'Chargement'
  | 'Préparation'
  | 'Finalisation'
  | '✓ Prêt';

// --- Composant principal ---
export default function LoadingPage() {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<LoadingStatus>('Initialisation');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Met à jour l'interface en fonction de la progression
  const updateUI = (value: number): void => {
    const clamped = Math.min(100, Math.max(0, value));
    setProgress(clamped);

    // Déterminer le statut en fonction du pourcentage
    if (clamped < 15) setStatus('Initialisation');
    else if (clamped < 35) setStatus('Décompression');
    else if (clamped < 60) setStatus('Chargement');
    else if (clamped < 85) setStatus('Préparation');
    else if (clamped < 100) setStatus('Finalisation');
    else setStatus('✓ Prêt');
  };

  // Simulation de la progression
  const startLoading = (): void => {
    let current = 0;
    updateUI(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      let step: number;
      if (current < 30) step = Math.floor(Math.random() * 4) + 2;
      else if (current < 60) step = Math.floor(Math.random() * 4) + 2;
      else if (current < 85) step = Math.floor(Math.random() * 3) + 1;
      else step = Math.floor(Math.random() * 2) + 1;

      const newValue = Math.min(current + step, 100);
      updateUI(newValue);
      current = newValue;

      if (current >= 100 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 160);
  };

  // Nettoyer l'intervalle au démontage
  useEffect(() => {
    const timer = setTimeout(startLoading, 350);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Fond animé */}
      <AnimatedBackground />

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        {/* Carte transparente */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl px-8 py-10 sm:px-12 sm:py-12 max-w-sm w-full shadow-2xl shadow-black/40 flex flex-col items-center text-center">
          
          {/* Identité avec logo WariPlay */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10">
              <Image
                src="/img/wari.png"
                alt="WariPlay"
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(0,200,150,0.3)]"
                priority
              />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-50">
              WariPlay
            </span>
          </div>

          {/* Progression */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between text-xs tracking-wide text-white/30 px-0.5">
              <span className="text-white/50 font-medium">{status}</span>
              <span className="font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-0.5 rounded-full border border-emerald-400/10 text-[0.65rem]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-200 ease-out shadow-[0_0_14px_rgba(16,185,129,0.2)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Pied : spinner + retour + version */}
          <div className="mt-8 flex items-center gap-5 flex-wrap justify-center">
            <span className="inline-block w-4 h-4 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin opacity-70" />
            <Link
              href="/"
              className="text-white/20 text-xs font-medium px-4 py-1.5 rounded-full border border-white/5 bg-white/5 hover:text-white/60 hover:bg-white/10 hover:border-white/10 transition-all"
            >
              ← Retour
            </Link>
            <span className="text-white/10 text-[0.6rem] tracking-wider pointer-events-none">
              v0.3.1
            </span>
          </div>
        </div>
      </div>
    </>
  );
}