// components/auth/LoadingButton.tsx
'use client'

interface LoadingButtonProps {
  loading: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
}

export default function LoadingButton({
  loading,
  onClick,
  disabled,
  children,
  variant = 'primary',
  fullWidth = true
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`${fullWidth ? 'w-full' : ''} relative overflow-hidden px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-wide text-xs sm:text-sm transition-all duration-300 ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-500 hover:to-emerald-700 hover:-translate-y-0.5'
          : ''
      } ${
        variant === 'danger'
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 hover:-translate-y-0.5'
          : ''
      } ${
        variant === 'secondary'
          ? 'bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20'
          : ''
      } disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0`}
    >
      <span className={loading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </button>
  )
}