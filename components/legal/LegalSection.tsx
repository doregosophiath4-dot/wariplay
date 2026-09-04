// components/legal/LegalSection.tsx
interface LegalSectionProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalSection({ title, lastUpdated, children }: LegalSectionProps) {
  return (
    <div
      className="max-w-3xl mx-auto p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border relative before:block before:w-12 sm:before:w-16 before:h-0.5 sm:before:h-1 before:rounded before:bg-gradient-to-r before:from-emerald-400 before:to-purple-500 before:mx-auto before:mb-6 sm:before:mb-8"
      style={{
        background: 'rgba(26, 26, 46, 0.75)',
        backdropFilter: 'blur(15px)',
        borderColor: 'rgba(0, 200, 150, 0.12)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 text-center mb-2">{title}</h1>
      <p className="text-center text-white/40 italic text-xs sm:text-sm mb-6 sm:mb-8">Derniere mise a jour : {lastUpdated}</p>

      <div className="space-y-5 sm:space-y-6">
        {children}
      </div>

      <div className="mt-8 sm:mt-10 text-right">
        <p className="text-purple-400/60 italic text-xs sm:text-sm">Document valide a compter du {lastUpdated}</p>
      </div>
    </div>
  )
}