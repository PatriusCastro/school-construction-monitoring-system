import { FileDown, AlertTriangle, BarChart3, CalendarDays, Loader2, Download, CheckCircle2 } from 'lucide-react'

interface School {
  id: string
  school_name: string
  sdo_priority_level?: string
  proposed_classrooms?: number
  ranking?: number
  funding_year?: number
}

interface ReportCardsProps {
  schools: School[]
  loading: boolean
  exporting: 'pdf' | 'excel' | null
  onExportPriority: () => void
  onExportShortage: () => void
  onExportSYIP: () => void
}

export default function ReportCards({
  schools,
  loading,
  exporting,
  onExportPriority,
  onExportShortage,
  onExportSYIP,
}: ReportCardsProps) {
  const top3Priority = [...schools]
    .sort((a, b) => (a.ranking || 99) - (b.ranking || 99))
    .slice(0, 3)

  const syipByYear = schools.reduce((acc, s) => {
    if (!s.funding_year) return acc
    if (!acc[s.funding_year]) acc[s.funding_year] = { count: 0, cl: 0 }
    acc[s.funding_year].count++
    acc[s.funding_year].cl += s.proposed_classrooms || 0
    return acc
  }, {} as Record<number, { count: number; cl: number }>)

  const syipPreviewYears = Object.entries(syipByYear)
    .sort(([a], [b]) => Number(a) - Number(b))
    .slice(0, 4)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* 1. School Construction Priority Report */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[14px] font-semibold text-slate-900 leading-snug">
                  School Construction Priority Report
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                  PDF
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                Comprehensive list of schools ranked by SDO priority level with construction details, scope of work, and funding year.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Preview: Top 3 Priority Schools
            </p>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />)}
              </div>
            ) : top3Priority.length === 0 ? (
              <p className="text-[12px] text-slate-300">No data available</p>
            ) : (
              <div className="space-y-0 divide-y divide-slate-100">
                {top3Priority.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                    <span className="text-[12px] text-slate-600 truncate pr-2">
                      #{i + 1} {s.school_name}
                    </span>
                    <span className={`text-[11px] font-semibold shrink-0 ${
                      s.sdo_priority_level === 'High'   ? 'text-red-600' :
                      s.sdo_priority_level === 'Medium' ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {s.sdo_priority_level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto px-4 pb-4">
          <button
            onClick={onExportPriority}
            disabled={!!exporting || loading || schools.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white bg-[#1a3a6b] rounded-xl hover:bg-[#163260] transition-colors disabled:opacity-50"
          >
            {exporting === 'pdf'
              ? <Loader2 size={13} className="animate-spin" />
              : <FileDown size={13} />
            }
            Generate Report
          </button>
        </div>
      </div>

      {/* 2. Classroom Shortage Report */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <BarChart3 size={16} className="text-[#1a3a6b]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[14px] font-semibold text-slate-900 leading-snug">
                  Classroom Shortage Report
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                  PDF
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                Analysis of existing vs. proposed classrooms showing the deficit per school, municipality, and legislative district.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Preview: Classroom Shortage Analysis
            </p>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />)}
              </div>
            ) : schools.length === 0 ? (
              <p className="text-[12px] text-slate-300">No data available</p>
            ) : (
              <div className="space-y-0 divide-y divide-slate-100">
                {schools.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                    <span className="text-[12px] text-slate-600 truncate pr-2">{s.school_name}</span>
                    <span className="text-[11px] font-semibold text-red-600 shrink-0">
                      Shortage: +{s.proposed_classrooms || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto px-4 pb-4">
          <button
            onClick={onExportShortage}
            disabled={!!exporting || loading || schools.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white bg-[#1a3a6b] rounded-xl hover:bg-[#163260] transition-colors disabled:opacity-50"
          >
            {exporting === 'pdf'
              ? <Loader2 size={13} className="animate-spin" />
              : <FileDown size={13} />
            }
            Generate Report
          </button>
        </div>
      </div>

      {/* 3. Six-Year Infrastructure Plan */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <CalendarDays size={16} className="text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[14px] font-semibold text-slate-900 leading-snug">
                  Six-Year Infrastructure Plan (SYIP)
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100">
                  Excel
                </span>
                <CheckCircle2 size={13} className="text-green-600" />
              </div>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                Multi-year construction roadmap from 2025–2030 including proposed classrooms, structures, funding allocation, and implementation timeline.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Preview: Six-Year Infrastructure Plan
            </p>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />)}
              </div>
            ) : syipPreviewYears.length === 0 ? (
              <p className="text-[12px] text-slate-300">No funding year data available</p>
            ) : (
              <div className="space-y-0 divide-y divide-slate-100">
                {syipPreviewYears.map(([fy, v]) => (
                  <div key={fy} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                    <span className="text-[12px] text-slate-400">FY {fy}</span>
                    <span className="text-[12px] font-medium text-slate-700">
                      {v.count} school(s) · {v.cl} CL
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto px-4 pb-4 flex gap-2">
          <button
            onClick={onExportSYIP}
            disabled={!!exporting || loading || schools.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white bg-[#1a3a6b] rounded-xl hover:bg-[#163260] transition-colors disabled:opacity-50"
          >
            {exporting === 'excel'
              ? <Loader2 size={13} className="animate-spin" />
              : <FileDown size={13} />
            }
            Generate Report
          </button>
          <button
            onClick={onExportSYIP}
            disabled={!!exporting || loading || schools.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
