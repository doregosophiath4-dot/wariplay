// app/condition/page.tsx
import Link from 'next/link'
import AnimatedSection from '@/components/legal/AnimatedSection'
import LegalSection from '@/components/legal/LegalSection'
import BulletList from '@/components/legal/BulletList'

// =====================================================
// SVG ICONS
// =====================================================
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

// =====================================================
// DONNEES STATIQUES
// =====================================================
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

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function ConditionPage() {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="relative z-10 pt-24 sm:pt-28 md:pt-32 pb-8 px-4 sm:px-6 space-y-10 sm:space-y-14">
        
        {/* ============================================ */}
        {/* CONDITIONS GENERALES D'UTILISATION */}
        {/* ============================================ */}
        <AnimatedSection trigger="onMount">
          <LegalSection title="Conditions Generales d'Utilisation" lastUpdated="01 Aout 2025">

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">1. Acceptation des conditions</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                En accedant a WariPlay, vous acceptez sans reserve les conditions de la plateforme decrites ci-dessous.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">2. Eligibilite et conformite legale</h2>
              <BulletList items={[
                "Vous devez avoir au moins 18 ans, ou l'age legal en vigueur dans votre pays, pour utiliser la plateforme",
                "Vous reconnaissez utiliser la plateforme conformement aux lois et reglements en vigueur dans votre pays ou region",
                "Vous acceptez d'avoir un seul compte sur la plateforme"
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">3. Depots et retraits</h2>
              <BulletList items={[
                'Vous acceptez les conditions de depot et les frais de retrait applicables sur la plateforme',
                'Vous acceptez de vous conformer au montant minimal de depot et de retrait exige par la plateforme'
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">4. Mises et objectifs</h2>
              <BulletList items={[
                'Vous acceptez la mise minimale exigee par la plateforme, ainsi que la mise minimale specifique a chaque jeu',
                "Vous acceptez l'obligation de remplir l'objectif qui vous sera assigne",
                "Vous acceptez de perdre votre mise si l'objectif assigne n'est pas rempli",
                'Vous acceptez de vous conformer aux regles et exigences propres a chaque jeu'
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">5. Achats et systeme de progression</h2>
              <BulletList items={[
                "Vous acceptez d'acheter certains elements sur la plateforme conformement au montant fixe pour chaque produit",
                'Vous acceptez le systeme de vies mis en place pour chaque jeu',
                'Vous acceptez de commencer par un niveau propose a la vente et disponible pour vous familiariser avec le fonctionnement du systeme'
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">6. Responsabilite des pertes</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Vous reconnaissez etre seul responsable de vos pertes, que celles-ci resultent d'un objectif non rempli, d'une erreur reseau ou d'une erreur serveur.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">7. Responsabilite personnelle</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Vous reconnaissez etre responsable de vous-meme, de la facon dont vous jouez, et des resultats de votre jeu, qu'il s'agisse de gains ou de pertes.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">8. Partage et diffusion</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Vous acceptez de partager la plateforme publiquement de maniere responsable et adaptee a votre entourage.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">9. Gains, paiements et parrainage</h2>
              <BulletList items={[
                'Vous acceptez les conditions de gains propres a chaque jeu',
                'Vous acceptez les methodes de paiement proposees par la plateforme',
                'Vous acceptez les conditions de parrainage et de recompenses liees a la plateforme'
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">10. Mise en garde</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Nous sommes conscients que des plateformes similaires ont pu, par le passe, s'averer etre des arnaques. Nous vous encourageons donc a prendre le temps d'analyser la plateforme, de verifier les avis existants, et de vous assurer d'etre bien sur la plateforme officielle avant toute utilisation.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">11. Triche et fraude</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Toute manipulation, tentative de triche ou de vol entraine la suppression immediate du compte concerne et un bannissement pouvant aller jusqu'a plusieurs annees.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">12. Propriete intellectuelle</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Toute reproduction ou copie, sous quelque forme que ce soit, de la plateforme est strictement interdite. Toute violation de cette clause pourra faire l'objet de poursuites judiciaires.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">13. Renonciation aux recours</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Vous reconnaissez avoir pris connaissance de l'ensemble de ces conditions. Aucune plainte relative a l'une des clauses du present contrat ne sera acceptee ni retenue, et aucune poursuite judiciaire fondee sur ces regles ne sera recevable.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">14. Recommandations d'usage</h2>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                Nous vous conseillons de lire attentivement ces conditions, de verifier votre connexion internet avant chaque partie, et de conserver une pratique de jeu saine et raisonnable afin de profiter pleinement des avantages de la plateforme.
              </p>
            </div>

          </LegalSection>
        </AnimatedSection>

        {/* ============================================ */}
        {/* POLITIQUE DE CONFIDENTIALITE */}
        {/* ============================================ */}
        <AnimatedSection trigger="onScroll">
          <LegalSection title="Politique de Confidentialite" lastUpdated="01 Aout 2025">

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">1. Donnees collectees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Nous collectons :</p>
              <BulletList items={[
                'Informations personnelles (nom, prenom, email)',
                'Donnees de paiement (via notre partenaire securise)',
                'Historique de jeu et transactions'
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">2. Utilisation des donnees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Vos donnees sont utilisees pour :</p>
              <BulletList items={[
                'Fournir et ameliorer nos services',
                'Verifier votre identite',
                'Effectuer les paiements',
                'Envoyer des communications importantes'
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">3. Protection des donnees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Nous utilisons des mesures de securite avancees incluant :</p>
              <BulletList items={[
                'Chiffrement SSL 256-bit pour toutes les communications',
                'Stockage securise des donnees avec acces restreint',
                'Acces limite au personnel strictement autorise',
                'Systemes de detection et de prevention des intrusions',
                'Protection contre les attaques DDoS (Distributed Denial of Service)'
              ]} />
              <p className="text-white/65 text-sm sm:text-base mt-3 leading-relaxed">
                Nous utilisons egalement des systemes anti-abus et anti-bot, incluant Google reCAPTCHA, afin de proteger la plateforme contre les activites frauduleuses, les tentatives d&apos;automatisation et les comportements malveillants. Ces dispositifs nous permettent d&apos;assurer un environnement de jeu securise et equitable pour tous les utilisateurs.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">4. Partage des donnees</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Vos donnees ne sont partagees qu&apos;avec :</p>
              <BulletList items={[
                'Nos processeurs de paiement agrees',
                'Les autorites si requis par la loi'
              ]} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">5. Vos droits</h2>
              <p className="text-white/65 text-sm sm:text-base mb-2">Conformement au RGPD, vous pouvez :</p>
              <BulletList items={[
                'Acceder a vos donnees',
                'Demander leur rectification',
                'Demander leur suppression',
                'Vous opposer a leur traitement'
              ]} />
            </div>

          </LegalSection>
        </AnimatedSection>

        {/* ============================================ */}
        {/* POLITIQUE RELATIVE AUX COOKIES */}
        {/* ============================================ */}
        <AnimatedSection trigger="onScroll">
          <LegalSection title="Politique relative aux Cookies" lastUpdated="01 Aout 2025">

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

          </LegalSection>
        </AnimatedSection>

      </div>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="relative z-10 py-12 sm:py-16 px-5 sm:px-8 border-t border-emerald-400/10" style={{ background: 'rgba(10, 10, 26, 0.95)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          <div>
            <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-10 sm:h-11 mb-3 brightness-0 invert" />
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-4">
              WariPlay - La plateforme de jeux remunerateurs leader, combinant divertissement et opportunites financieres.
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
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <span className="text-white/30 text-[10px] sm:text-xs">&copy; 2024 WariPlay. Tous droits reserves.</span>
        </div>
      </footer>
    </div>
  )
}