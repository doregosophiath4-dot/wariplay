// components/AnimatedBackground.tsx
'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ✅ Respecte les préférences d'accessibilité
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0
    let frameId: number
    let isRunning = true

    const draw = () => {
      if (!isRunning) return
      if (!ctx || !canvas) return

      // ✅ Fond semi-transparent pour effet de traînée
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.008

      // ============================================
      // 1. Vagues animées superposées (5 calques)
      // ============================================
      for (let waveIndex = 0; waveIndex < 5; waveIndex++) {
        ctx.beginPath()
        
        // ✅ Couleurs HSL : du bleu-vert (200°) au violet (260°)
        // ✅ Opacité progressive : 6% à 14%
        ctx.strokeStyle = `hsla(${200 + waveIndex * 15}, 80%, ${45 + waveIndex * 5}%, ${0.06 + waveIndex * 0.02})`
        
        // ✅ Épaisseur progressive
        ctx.lineWidth = 1.2 + waveIndex * 0.2

        for (let x = 0; x < canvas.width; x += 5) {
          // ✅ 3 fréquences différentes pour des ondulations complexes
          const y =
            canvas.height * 0.4 +
            Math.sin(x * 0.003 + time * 0.5 + waveIndex) * 50 +
            Math.cos(x * 0.001 + time * 0.3) * 70 +
            Math.sin(x * 0.005 + waveIndex * 1.5) * 30 +
            waveIndex * 55

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // ============================================
      // 2. Particules lumineuses (12 étoiles)
      // ============================================
      for (let i = 0; i < 12; i++) {
        // ✅ Mouvement circulaire avec décalages
        const px = (Math.sin(time * 0.7 + i * 2.1) * 0.5 + 0.5) * canvas.width
        const py = (Math.cos(time * 0.5 + i * 1.7) * 0.5 + 0.5) * canvas.height
        
        // ✅ Taille qui pulse
        const radius = 1.5 + Math.sin(time * 2 + i) * 0.8
        
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        
        // ✅ Couleurs du cyan au violet, opacité pulsante
        ctx.fillStyle = `hsla(${180 + i * 20}, 80%, 60%, ${0.06 + Math.sin(time + i) * 0.03})`
        ctx.fill()
      }

      // ============================================
      // 3. Particules supplémentaires (petites étincelles)
      // ============================================
      for (let i = 0; i < 30; i++) {
        const px = (Math.sin(time * 0.3 + i * 1.7) * 0.5 + 0.5) * canvas.width
        const py = (Math.cos(time * 0.4 + i * 2.3) * 0.5 + 0.5) * canvas.height
        const radius = 0.5 + Math.sin(time * 1.5 + i) * 0.3
        
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(200, 80%, 80%, ${0.03 + Math.sin(time + i * 0.5) * 0.02})`
        ctx.fill()
      }

      frameId = requestAnimationFrame(draw)
    }

    // ============================================
    // 4. Gestion de la visibilité de l'onglet
    // ============================================
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false
        if (frameId) cancelAnimationFrame(frameId)
      } else {
        isRunning = true
        frameId = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    draw()

    return () => {
      isRunning = false
      if (frameId) cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <>
      {/* ============================================ */}
      {/* CANVAS - Vagues et particules */}
      {/* ============================================ */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* ============================================ */}
      {/* HALOS - Orbes flous en arrière-plan */}
      {/* ============================================ */}
      
      {/* Halo 1 - Vert émeraude (en haut à droite) */}
      <div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 -top-[20%] -right-[10%]"
        style={{
          background: 'radial-gradient(circle, rgba(0, 200, 150, 0.08) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float1 12s ease-in-out infinite',
        }}
      />

      {/* Halo 2 - Violet (en bas à gauche) */}
      <div
        className="fixed w-[450px] h-[450px] rounded-full pointer-events-none z-0 -bottom-[20%] -left-[10%]"
        style={{
          background: 'radial-gradient(circle, rgba(108, 92, 231, 0.07) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float2 15s ease-in-out infinite',
        }}
      />

      {/* Halo 3 - Orange (au centre, pour la profondeur) */}
      <div
        className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-0 top-[30%] left-[50%] -translate-x-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float3 18s ease-in-out infinite',
        }}
      />
    </>
  )
}