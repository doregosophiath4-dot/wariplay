// components/ToggleSwitch.tsx
'use client'

import { memo } from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  loading?: boolean
}

function ToggleSwitch({ checked, onChange, loading = false }: ToggleSwitchProps) {
  return (
    <label className="relative inline-block w-[50px] h-[26px] flex-shrink-0 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="opacity-0 w-0 h-0"
        disabled={loading}
      />
      <span className={`absolute inset-0 rounded-full transition-all duration-300 ${loading ? 'bg-white/5' : checked ? 'bg-emerald-400' : 'bg-white/[0.08]'}`}>
        <span className={`absolute left-1 top-1 w-[18px] h-[18px] rounded-full transition-all duration-300 ${checked ? 'translate-x-6 bg-white' : 'bg-white/50'}`} />
      </span>
    </label>
  )
}

export default memo(ToggleSwitch)