'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respecte les préférences d'accessibilité : pas d'animation
    // perpétuelle pour les utilisateurs qui la désactivent.
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
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      for (let waveIndex = 0; waveIndex < 5; waveIndex++) {
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${200 + waveIndex * 15}, 80%, ${45 + waveIndex * 5}%, ${0.06 + waveIndex * 0.02})`
        ctx.lineWidth = 1.2 + waveIndex * 0.2
        for (let x = 0; x < canvas.width; x += 5) {
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

      for (let i = 0; i < 12; i++) {
        const px = (Math.sin(time * 0.7 + i * 2.1) * 0.5 + 0.5) * canvas.width
        const py = (Math.cos(time * 0.5 + i * 1.7) * 0.5 + 0.5) * canvas.height
        const radius = 1 + Math.sin(time * 2 + i) * 0.5
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${180 + i * 20}, 80%, 60%, ${0.08 + Math.sin(time + i) * 0.04})`
        ctx.fill()
      }

      frameId = requestAnimationFrame(draw)
    }

    frameId = requestAnimationFrame(draw)

    // Coupe l'animation quand l'onglet n'est pas visible :
    // économise CPU/batterie sans rien changer visuellement pour l'utilisateur.
    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false
        cancelAnimationFrame(frameId)
      } else {
        isRunning = true
        frameId = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      isRunning = false
      cancelAnimationFrame(frameId) // ← le fix manquant dans la version originale
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />
      <div
        className="fixed w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="fixed w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
    </>
  )
}