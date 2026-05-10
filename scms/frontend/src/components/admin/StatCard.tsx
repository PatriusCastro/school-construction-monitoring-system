import React from 'react'

type Accent = 'navy' | 'red' | 'amber' | 'green'

interface StatCardProps {
  label: string
  value: number | string
  accent: Accent
  icon: React.ElementType
  sublabel?: string
}

const accentMap: Record<Accent, { bar: string; text: string; iconBg: string }> = {
  navy:  { bar: 'bg-[#1a3a6b]',   text: 'text-[#1a3a6b]',   iconBg: 'bg-[#1a3a6b]/8' },
  red:   { bar: 'bg-red-500',     text: 'text-red-600',      iconBg: 'bg-red-50' },
  amber: { bar: 'bg-amber-400',   text: 'text-amber-600',    iconBg: 'bg-amber-50' },
  green: { bar: 'bg-emerald-500', text: 'text-emerald-600',  iconBg: 'bg-emerald-50' },
}

export default function StatCard({ label, value, accent, icon: Icon, sublabel }: StatCardProps) {
  const a = accentMap[accent]
  return (
    <div className="relative bg-white border border-slate-200/80 rounded-2xl p-5 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">
      <div className={`absolute left-0 top-4 bottom-4 w-0.75 rounded-r-full ${a.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
          <p className={`text-[26px] font-bold leading-none tabular-nums ${a.text}`}>{value}</p>
          {sublabel && <p className="text-[11px] text-slate-400 mt-1.5">{sublabel}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.iconBg}`}>
          <Icon size={16} className={a.text} />
        </div>
      </div>
    </div>
  )
}