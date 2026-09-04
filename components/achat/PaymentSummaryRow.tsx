// components/achat/PaymentSummaryRow.tsx
'use client'

interface PaymentSummaryRowProps {
  label: string
  value: string
  emphasize?: boolean
}

export default function PaymentSummaryRow({ 
  label, 
  value, 
  emphasize = true 
}: PaymentSummaryRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
      <span className="text-white/50 text-sm">{label}</span>
      <span className={`font-bold text-sm ${emphasize ? 'text-emerald-400' : 'text-white font-medium'}`}>
        {value}
      </span>
    </div>
  )
}