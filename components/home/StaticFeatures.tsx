// components/StaticFeatures.tsx
const features = [
  { title: 'Free Game', subtitle: 'Jeux Gratuit !' },
  { title: 'Free Money', subtitle: 'Argent gratuit !' },
  { title: 'With WariPlay', subtitle: 'Avec WariPlay !' },
]

export default function StaticFeatures() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-4">
      {features.map((f, i) => (
        <div
          key={i}
          className="w-full rounded-2xl p-2.5 sm:p-5 lg:p-5 text-center border backdrop-blur-xl
            transition-all duration-300 cursor-default hover:-translate-y-1
            border-white/[0.06] hover:border-emerald-400/20 hover:shadow-[0_8px_25px_rgba(0,200,150,0.1)]"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}
        >
          <span className="block text-[11px] sm:text-base font-bold text-emerald-400 mb-1 leading-tight">
            {f.title}
          </span>
          <small className="text-[8px] sm:text-xs text-white/50 leading-tight block">
            {f.subtitle}
          </small>
        </div>
      ))}
    </div>
  )
}