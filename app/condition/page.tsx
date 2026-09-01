'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// SVG Icons
const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 320 512" fill="currentColor">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.2V288z" />
  </svg>
)

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
  </svg>
)

export default function ConditionPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0

    const draw = () => {
      if (!ctx || !canvas) return
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

      requestAnimationFrame(draw)
    }
    draw()

    return () => window.removeEventListener('resize', resize)
  }, [])

  const footerLinks = [
    { href: '/3x', label: 'Accueil' },
    { href: '/offre', label: 'Nos offres' },
    { href: '/jeux', label: 'Jeux' },
    { href: '/strategie', label: 'Strategies' },
    { href: '/equipe', label: 'A propos' }
  ]

  const legalLinks = [
    { href: '#', label: "Conditions d'utilisation" },
    { href: '#', label: 'Politique de confidentialite' },
    { href: '#', label: 'Politique des cookies' },
    { href: '/chat', label: 'FAQ' }
  ]

  const socialLinks = [
    { icon: <FacebookIcon />, url: '#', label: 'Facebook' },
    { icon: <TwitterIcon />, url: '#', label: 'Twitter' },
    { icon: <InstagramIcon />, url: '#', label: 'Instagram' },
    { icon: <LinkedinIcon />, url: '#', label: 'LinkedIn' }
  ]

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ opacity: 0.4 }} />
      
      <div className="fixed w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[250px] sm:w-[350px] md:w-[400px] h-[250px] sm:h-[350px] md:h-[400px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[200px] sm:w-[250px] md:w-[300px] h-[200px] sm:h-[250px] md:h-[300px] rounded-full pointer-events-none z-0 top-[40%] left-[60%] animate-[float1_10s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative z-10 pt-24 sm:pt-28 md:pt-32 pb-8 px-4 sm:px-6">
        
        {/* Conditions Generales d'Utilisation */}
        <motion.div
          className="max-w-3xl mx-auto mb-10 sm:mb-14 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border relative before:block before:w-12 sm:before:w-16 before:h-0.5 sm:before:h-1 before:rounded before:bg-gradient-to-r before:from-emerald-400 before:to-purple-500 before:mx-auto before:mb-6 sm:before:mb-8"
          style={{ 
            background: 'rgba(26, 26, 46, 0.75)', 
            backdropFilter: 'blur(15px)',
            borderColor: 'rgba(0, 200, 150, 0.12)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 text-center mb-2">Conditions Generales d&apos;Utilisation</h1>
          <p className="text-center text-white/40 italic text-xs sm:text-sm mb-6 sm:mb-8">Derniere mise a jour : 01 Aout 2025</p>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">1. Acceptation des conditions</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">En accedant et en utilisant la plateforme WariPlay, vous acceptez sans reserve les presentes Conditions Generales d&apos;Utilisation.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">2. Description du service</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">WariPlay est une plateforme de jeux en ligne offrant des opportunites de gains reels selon les modalites decrites pour chaque jeu.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">3. Compte utilisateur</h2>
              <ul className="space-y-2">
                {['Vous devez avoir au moins 18 ans pour creer un compte', 'Vous etes responsable de la confidentialite de vos identifiants', 'Un seul compte par personne est autorise'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">4. Regles des jeux</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">Chaque jeu possede ses propres regles disponibles dans sa section dediee. Tout non-respect des regles peut entrainer la suspension du compte.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">5. Gains et paiements</h2>
              <ul className="space-y-2">
                {['Les gains sont credites selon les conditions specifiques a chaque jeu', 'Un seuil minimal de 1000 FCFA est requis pour effectuer un retrait', 'Les paiements sont effectues sous 72 heures ouvrables'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">6. Responsabilites</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">WariPlay decline toute responsabilite en cas d&apos;utilisation frauduleuse de votre compte ou de non-respect des regles etablies.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">7. Modifications</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">Nous nous reservons le droit de modifier ces conditions a tout moment. Les utilisateurs en seront informes par email.</p>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-right">
            <p className="text-purple-400/60 italic text-xs sm:text-sm">Document valide a compter du 01/08/2025</p>
          </div>
        </motion.div>

        {/* Politique de Confidentialite */}
        <motion.div
          className="max-w-3xl mx-auto mb-10 sm:mb-14 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border relative before:block before:w-12 sm:before:w-16 before:h-0.5 sm:before:h-1 before:rounded before:bg-gradient-to-r before:from-emerald-400 before:to-purple-500 before:mx-auto before:mb-6 sm:before:mb-8"
          style={{ 
            background: 'rgba(26, 26, 46, 0.75)', 
            backdropFilter: 'blur(15px)',
            borderColor: 'rgba(0, 200, 150, 0.12)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 text-center mb-2">Politique de Confidentialite</h1>
          <p className="text-center text-white/40 italic text-xs sm:text-sm mb-6 sm:mb-8">Derniere mise a jour : 01 Aout 2025</p>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">1. Donnees collectees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Nous collectons :</p>
              <ul className="space-y-2">
                {['Informations personnelles (nom, prenom, email)', 'Donnees de paiement (via notre partenaire securise)', 'Historique de jeu et transactions'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">2. Utilisation des donnees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Vos donnees sont utilisees pour :</p>
              <ul className="space-y-2">
                {['Fournir et ameliorer nos services', 'Verifier votre identite', 'Effectuer les paiements', 'Envoyer des communications importantes'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">3. Protection des donnees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Nous utilisons des mesures de securite avancees incluant :</p>
              <ul className="space-y-2">
                {['Chiffrement SSL 256-bit', 'Stockage securise des donnees', 'Acces restreint au personnel autorise'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">4. Partage des donnees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Vos donnees ne sont partagees qu&apos;avec :</p>
              <ul className="space-y-2">
                {['Nos processeurs de paiement agrees', 'Les autorites si requis par la loi'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">5. Vos droits</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Conformement au RGPD, vous pouvez :</p>
              <ul className="space-y-2">
                {['Acceder a vos donnees', 'Demander leur rectification', 'Demander leur suppression', 'Vous opposer a leur traitement'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-right">
            <p className="text-purple-400/60 italic text-xs sm:text-sm">Document valide a compter du 01/08/2025</p>
          </div>
        </motion.div>

        {/* Politique relative aux Cookies */}
        <motion.div
          className="max-w-3xl mx-auto mb-10 sm:mb-14 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border relative before:block before:w-12 sm:before:w-16 before:h-0.5 sm:before:h-1 before:rounded before:bg-gradient-to-r before:from-emerald-400 before:to-purple-500 before:mx-auto before:mb-6 sm:before:mb-8"
          style={{ 
            background: 'rgba(26, 26, 46, 0.75)', 
            backdropFilter: 'blur(15px)',
            borderColor: 'rgba(0, 200, 150, 0.12)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 text-center mb-2">Politique relative aux Cookies</h1>
          <p className="text-center text-white/40 italic text-xs sm:text-sm mb-6 sm:mb-8">Derniere mise a jour : 01 Aout 2025</p>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">Un cookie est un petit fichier texte stocke sur votre appareil lorsque vous visitez un site web.</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">2. Cookies utilises</h2>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse text-xs sm:text-sm min-w-[400px]">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-3 sm:px-4 text-[#ffd166] border-b border-purple-400/30 font-semibold">Nom</th>
                      <th className="text-left py-3 px-3 sm:px-4 text-[#ffd166] border-b border-purple-400/30 font-semibold">Finalite</th>
                      <th className="text-left py-3 px-3 sm:px-4 text-[#ffd166] border-b border-purple-400/30 font-semibold">Duree</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'session_id', purpose: 'Maintenir votre session connectee', duration: 'Session' },
                      { name: 'preferences', purpose: 'Enregistrer vos preferences', duration: '1 an' },
                      { name: '_ga', purpose: "Analyse d'audience (Google Analytics)", duration: '2 ans' }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.06]">
                        <td className="py-3 px-3 sm:px-4 text-white/65">{row.name}</td>
                        <td className="py-3 px-3 sm:px-4 text-white/65">{row.purpose}</td>
                        <td className="py-3 px-3 sm:px-4 text-white/65">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">3. Gestion des cookies</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Vous pouvez controler les cookies via les parametres de votre navigateur :</p>
              <ul className="space-y-2">
                {['Chrome', 'Firefox', 'Safari', 'Edge'].map((browser, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <a href="#" className="text-purple-400 hover:text-emerald-400 transition-colors">{browser}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">4. Cookies tiers</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">Certains services integres (paiement, analyse) peuvent deposer leurs propres cookies.</p>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-right">
            <p className="text-purple-400/60 italic text-xs sm:text-sm">Document valide a compter du 01/08/2025</p>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 sm:py-16 px-5 sm:px-8 border-t border-emerald-400/10" style={{ background: 'rgba(10, 10, 26, 0.95)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          <div>
            <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-10 sm:h-11 mb-3 brightness-0 invert" />
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-4">
              WariPlay - La plateforme de jeux remunerateurs leader en Afrique, combinant divertissement et opportunites financieres.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.url} aria-label={social.label} className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5" 
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-purple-400 font-semibold text-sm sm:text-base mb-3 sm:mb-4 pb-2.5 relative after:absolute after:bottom-0 after:left-0 after:w-9 after:h-0.5 after:rounded-sm after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center gap-2 text-white/50 hover:text-emerald-400 transition-colors text-xs sm:text-sm">
                    <span className="text-emerald-400"><ChevronRightIcon /></span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-purple-400 font-semibold text-sm sm:text-base mb-3 sm:mb-4 pb-2.5 relative after:absolute after:bottom-0 after:left-0 after:w-9 after:h-0.5 after:rounded-sm after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="flex items-center gap-2 text-white/50 hover:text-emerald-400 transition-colors text-xs sm:text-sm">
                    <span className="text-emerald-400"><ChevronRightIcon /></span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-purple-400 font-semibold text-sm sm:text-base mb-3 sm:mb-4 pb-2.5 relative after:absolute after:bottom-0 after:left-0 after:w-9 after:h-0.5 after:rounded-sm after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">Contact</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-white/50 text-xs sm:text-sm">
                <span className="text-purple-400 w-4 flex justify-center"><MailIcon /></span> wariplay6@.com
              </li>
              <li className="flex items-center gap-2.5 text-white/50 text-xs sm:text-sm">
                <span className="text-purple-400 w-4 flex justify-center"><MapPinIcon /></span> Benin
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <span className="text-white/40 text-xs sm:text-sm">#Mobile Money</span>
          <span className="text-white/30 text-[10px] sm:text-xs">&copy; 2024 WariPlay. Tous droits reserves.</span>
        </div>
      </footer>
    </div>
  )
}