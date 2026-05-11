export default function ProgressBar({ pct = 0 }: { pct: number }) {
  const safe = Math.min(Math.max(0, pct), 100)
  const color  = safe >= 100 ? 'bg-[#27AE60]' : safe >= 60 ? 'bg-[#0F2444]' : safe >= 30 ? 'bg-[#FFB900]' : 'bg-[#DC2626]'
  const tColor = safe >= 100 ? 'text-[#27AE60]' : safe >= 60 ? 'text-[#0F2444]' : safe >= 30 ? 'text-[#FFB900]' : 'text-[#DC2626]'

  return (
    <div className="flex items-center gap-2 w-36">
      <div className="flex-1 h-1.25 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${safe}%` }} />
      </div>
      <span className={`text-[11px] font-semibold font-mono tabular-nums w-8 text-right shrink-0 ${tColor}`}>
        {safe}%
      </span>
    </div>
  )
}