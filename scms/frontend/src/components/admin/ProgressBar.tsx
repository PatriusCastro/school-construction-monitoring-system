export default function ProgressBar({ pct = 0 }: { pct: number }) {
  const safe = Math.min(Math.max(0, pct), 100)
  const color  = safe >= 100 ? 'bg-emerald-500' : safe >= 60 ? 'bg-[#1a3a6b]' : safe >= 30 ? 'bg-amber-400' : 'bg-red-400'
  const tColor = safe >= 100 ? 'text-emerald-600' : safe >= 60 ? 'text-[#1a3a6b]' : safe >= 30 ? 'text-amber-600' : 'text-red-500'

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