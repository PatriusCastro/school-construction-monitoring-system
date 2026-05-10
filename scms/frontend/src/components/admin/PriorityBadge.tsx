export default function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return <span className="text-[11px] text-slate-300">—</span>

  const styles: Record<string, { wrap: string; dot: string }> = {
    High:   { wrap: 'bg-red-50 text-red-700 border-red-200',                dot: 'bg-red-400' },
    Medium: { wrap: 'bg-amber-50 text-amber-700 border-amber-200',          dot: 'bg-amber-400' },
    Low:    { wrap: 'bg-emerald-50 text-emerald-700 border-emerald-200',    dot: 'bg-emerald-400' },
  }
  const s = styles[priority] ?? { wrap: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${s.wrap}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {priority}
    </span>
  )
}