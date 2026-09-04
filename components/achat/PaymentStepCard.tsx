// components/achat/PaymentStepCard.tsx
'use client'

interface PaymentStepCardProps {
  children: React.ReactNode
}

export default function PaymentStepCard({ children }: PaymentStepCardProps) {
  return (
    <div
      className="rounded-3xl p-6 sm:p-8 border border-emerald-400/15 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(26,26,46,0.9), rgba(22,33,62,0.85))',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,200,150,0.06) inset'
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
      {children}
    </div>
  )
}