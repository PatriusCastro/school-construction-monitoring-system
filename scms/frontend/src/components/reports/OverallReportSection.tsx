import { FileSpreadsheet, FileDown, Building2, BarChart3, CheckCircle2, AlertTriangle, TrendingUp, Banknote, CalendarDays, ChevronDown, Loader2 } from 'lucide-react'

interface School {
  id: string
  school_name: string
  school_id?: string
  municipality?: string
  legislative_district?: string
  auto_generated_scope?: string
  sdo_priority_level?: string
  ranking?: number
  proposed_classrooms?: number
  number_of_units?: number
  stories?: number
  construction_progress_pct?: number
  materials_delivered_pct?: number
  budget_allocated_php?: number
  budget_utilized_php?: number
  funding_year?: number
  completion_date?: string
}

interface OverallReportSectionProps {
  schools: School[]
  loading: boolean
  exporting: 'pdf' | 'excel' | null
  onExportExcel: () => void
  onExportPDF: () => void
  reportRef: React.RefObject<HTMLDivElement>
}

function getStatus(pct: number) {
  if (pct >= 100) return { label: 'Complete',    color: 'text-green-700',  bg: 'bg-green-50 border-green-100',  icon: CheckCircle2 }
  if (pct >= 60)  return { label: 'On Track',    color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-100',    icon: TrendingUp }
  if (pct >= 20)  return { label: 'In Progress', color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-100',  icon: AlertTriangle }
  return           { label: 'Delayed',     color: 'text-red-700',    bg: 'bg-red-50 border-red-100',      icon: AlertTriangle }
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatPHP(n?: number) {
  if (!n) return '—'
  return `₱${Number(n).toLocaleString()}`
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return <span className="text-[11px] text-slate-400">—</span>
  const styles: Record<string, string> = {
    High:   'bg-red-50 text-red-700 border-red-100',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100',
    Low:    'bg-green-50 text-green-700 border-green-100',
  }
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${styles[priority] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
      {priority}
    </span>
  )
}

export default function OverallReportSection({
  schools,
  loading,
  exporting,
  onExportExcel,
  onExportPDF,
  reportRef,
}: OverallReportSectionProps) {
  const totalClassrooms   = schools.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)
  const totalUnits        = schools.reduce((s, x) => s + (x.number_of_units || 0), 0)
  const totalBudget       = schools.reduce((s, x) => s + (x.budget_allocated_php || 0), 0)
  const totalUtilized     = schools.reduce((s, x) => s + (x.budget_utilized_php || 0), 0)
  const avgConstruction   = schools.length ? Math.round(schools.reduce((s, x) => s + (x.construction_progress_pct || 0), 0) / schools.length) : 0
  const avgMaterials      = schools.length ? Math.round(schools.reduce((s, x) => s + (x.materials_delivered_pct || 0), 0) / schools.length) : 0
  const completed         = schools.filter(s => (s.construction_progress_pct || 0) >= 100).length
  const onTrack           = schools.filter(s => { const p = s.construction_progress_pct || 0; return p >= 60 && p < 100 }).length
  const inProgress        = schools.filter(s => { const p = s.construction_progress_pct || 0; return p >= 20 && p < 60 }).length
  const delayed           = schools.filter(s => (s.construction_progress_pct || 0) < 20).length
  const highPriority      = schools.filter(s => s.sdo_priority_level === 'High').length
  const medPriority       = schools.filter(s => s.sdo_priority_level === 'Medium').length
  const budgetUtil        = totalBudget > 0 ? Math.round((totalUtilized / totalBudget) * 100) : 0

  return (
    <div ref={reportRef} className="space-y-5">
      {/* Report header card */}
      <div className="bg-[#1a3a6b] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Department of Education</p>
            <h2 className="text-[20px] font-bold">Overall Construction Report</h2>
            <p className="text-[13px] text-white/60 mt-1">Legazpi City, Albay — Region V</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Generated</p>
            <p className="text-[13px] font-semibold">
              {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap justify-end">
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md">SDO Legazpi City</span>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md">AY 2025–2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Building2,     label: 'Total Schools',     value: schools.length,        color: 'text-[#1a3a6b]', bg: 'bg-blue-50' },
          { icon: BarChart3,     label: 'Total Classrooms',  value: totalClassrooms,        color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: CheckCircle2,  label: 'Completed',         value: completed,              color: 'text-green-600', bg: 'bg-green-50' },
          { icon: AlertTriangle, label: 'Delayed',           value: delayed,                color: 'text-red-600',   bg: 'bg-red-50' },
          { icon: TrendingUp,    label: 'Avg. Construction',  value: `${avgConstruction}%`, color: 'text-[#1a3a6b]', bg: 'bg-blue-50' },
          { icon: TrendingUp,    label: 'Avg. Materials',     value: `${avgMaterials}%`,    color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Banknote,      label: 'Total Budget',       value: totalBudget ? `₱${(totalBudget / 1_000_000).toFixed(1)}M` : '—', color: 'text-[#1a3a6b]', bg: 'bg-blue-50' },
          { icon: CalendarDays,  label: 'Funding Years',      value: [...new Set(schools.map(s => s.funding_year).filter(Boolean))].length, color: 'text-[#1a3a6b]', bg: 'bg-blue-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={13} className={color} />
              </div>
            </div>
            <p className={`text-[22px] font-semibold ${color}`}>
              {loading ? <span className="text-slate-200 animate-pulse">—</span> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'High Priority',   count: highPriority, color: '#c0392b', bg: 'bg-red-500' },
              { label: 'Medium Priority', count: medPriority,  color: '#c8a800', bg: 'bg-amber-400' },
              { label: 'Low Priority',    count: schools.filter(s => s.sdo_priority_level === 'Low').length, color: '#27ae60', bg: 'bg-green-500' },
            ].map(({ label, count, color, bg }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-slate-600">{label}</span>
                  <span className="text-[12px] font-semibold" style={{ color }}>{count} schools</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bg}`} style={{ width: schools.length ? `${(count / schools.length) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Construction Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Complete',    count: completed,  color: '#27ae60', bg: 'bg-green-500' },
              { label: 'On Track',    count: onTrack,    color: '#1a3a6b', bg: 'bg-blue-700' },
              { label: 'In Progress', count: inProgress, color: '#c8a800', bg: 'bg-amber-400' },
              { label: 'Delayed',     count: delayed,    color: '#c0392b', bg: 'bg-red-500' },
            ].map(({ label, count, color, bg }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-slate-600">{label}</span>
                  <span className="text-[12px] font-semibold" style={{ color }}>{count} schools</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bg}`} style={{ width: schools.length ? `${(count / schools.length) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Budget Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Allocated',  value: formatPHP(totalBudget),   color: 'text-[#1a3a6b]' },
            { label: 'Total Utilized',   value: formatPHP(totalUtilized), color: 'text-amber-600' },
            { label: 'Utilization Rate', value: `${budgetUtil}%`,         color: budgetUtil >= 70 ? 'text-green-600' : 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-[18px] font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1a3a6b] rounded-full transition-all" style={{ width: `${budgetUtil}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{budgetUtil}% of total budget utilized</p>
      </div>

      {/* Export actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-1">Export Overall Report</h3>
        <p className="text-[11px] text-slate-400 mb-4">Download the complete construction report for all {schools.length} monitored schools</p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportExcel}
            disabled={!!exporting || loading || schools.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {exporting === 'excel' ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} className="text-green-600" />}
            Export Excel
          </button>
          <button
            onClick={onExportPDF}
            disabled={!!exporting || loading || schools.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#163260] transition-colors disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
            Export PDF
          </button>
        </div>
      </div>

      {/* Full details table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800">School Construction Details</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Complete record of all {schools.length} monitored schools</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ChevronDown size={12} /> Scroll to view all columns
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[12px] text-slate-300">Loading report data...</div>
        ) : schools.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Building2 size={28} className="text-slate-200" />
            <p className="text-[13px] text-slate-400">No schools added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    '#', 'School Name', 'ID', 'Municipality', 'Scope',
                    'Priority', 'Classrooms', 'Units',
                    'Construction', 'Materials', 'Status',
                    'Budget Allocated', 'Budget Utilized',
                    'Funding Year', 'Completion Date'
                  ].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schools.map((s, idx) => {
                  const status = getStatus(s.construction_progress_pct || 0)
                  const StatusIcon = status.icon
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-800 whitespace-nowrap">{s.school_name}</p>
                        <p className="text-[10px] text-slate-400">{s.legislative_district || '—'}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">{s.school_id || '—'}</td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{s.municipality || '—'}</td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-[11px] bg-blue-50 text-[#1a3a6b] border border-blue-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {s.auto_generated_scope || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <PriorityBadge priority={s.sdo_priority_level} />
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-[#1a3a6b]">{s.proposed_classrooms || 0}</td>
                      <td className="px-3 py-3 text-center text-slate-600">{s.number_of_units || 0}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-25">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a3a6b] rounded-full" style={{ width: `${s.construction_progress_pct || 0}%` }} />
                          </div>
                          <span className="font-mono text-[11px] text-[#1a3a6b] font-semibold w-8">{s.construction_progress_pct || 0}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-25">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${s.materials_delivered_pct || 0}%` }} />
                          </div>
                          <span className="font-mono text-[11px] text-amber-600 font-semibold w-8">{s.materials_delivered_pct || 0}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${status.bg} ${status.color}`}>
                          <StatusIcon size={9} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatPHP(s.budget_allocated_php)}</td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatPHP(s.budget_utilized_php)}</td>
                      <td className="px-3 py-3">
                        {s.funding_year
                          ? <span className="text-[11px] font-medium px-2 py-0.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-md">{s.funding_year}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatDate(s.completion_date)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#1a3a6b]/5 border-t-2 border-[#1a3a6b]/20">
                  <td colSpan={6} className="px-3 py-3 text-[11px] font-semibold text-[#1a3a6b]">TOTALS / AVERAGES</td>
                  <td className="px-3 py-3 text-center font-bold text-[#1a3a6b]">{totalClassrooms}</td>
                  <td className="px-3 py-3 text-center font-bold text-[#1a3a6b]">{totalUnits}</td>
                  <td className="px-3 py-3"><span className="font-mono text-[11px] font-bold text-[#1a3a6b]">{avgConstruction}% avg</span></td>
                  <td className="px-3 py-3"><span className="font-mono text-[11px] font-bold text-amber-600">{avgMaterials}% avg</span></td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3 font-bold text-[#1a3a6b] whitespace-nowrap text-[11px]">{formatPHP(totalBudget)}</td>
                  <td className="px-3 py-3 font-bold text-amber-600 whitespace-nowrap text-[11px]">{formatPHP(totalUtilized)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400 pb-4">
        Use the report cards above or the export buttons to download reports. · SCMS — SDO Legazpi City
      </p>
    </div>
  )
}
