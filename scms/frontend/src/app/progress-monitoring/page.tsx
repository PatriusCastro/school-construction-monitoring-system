'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, RefreshCw, Building2, X,
  AlertTriangle, Clock,
  CheckCircle2, CalendarDays, ChevronUp, ChevronDown
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { fetchSchools } from '@/lib/api'

interface School {
  id: string
  school_id: string
  school_name: string
  municipality: string
  auto_generated_scope: string
  sdo_priority_level: string
  construction_progress_pct: number
  materials_delivered_pct: number
  completion_date: string
  funding_year: number
  budget_allocated_php: number
  budget_utilized_php: number
}

function getStatus(pct: number): { label: string; color: string; bg: string; icon: React.ElementType } {
  if (pct >= 100) return { label: 'Complete', color: 'text-green-700', bg: 'bg-green-50 border-green-100', icon: CheckCircle2 }
  if (pct >= 60) return { label: 'On Track', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100', icon: TrendingUp }
  if (pct >= 20) return { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', icon: Clock }
  return { label: 'Delayed', color: 'text-red-700', bg: 'bg-red-50 border-red-100', icon: AlertTriangle }
}

function getDaysRemaining(dateStr?: string): number | null {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  return diff
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ProgressMonitoring() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortField, setSortField] = useState<'school_name' | 'construction_progress_pct' | 'sdo_priority_level'>('construction_progress_pct')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => { loadSchools() }, [])

  const loadSchools = async () => {
    try {
      setLoading(true)
      const data = await fetchSchools()
      setSchools(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const sorted = [...schools].sort((a, b) => {
    const aVal = a[sortField] ?? 0
    const bVal = b[sortField] ?? 0
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  // Summary stats
  const avgConstruction = schools.length ? Math.round(schools.reduce((s, x) => s + (x.construction_progress_pct || 0), 0) / schools.length) : 0
  const avgMaterials = schools.length ? Math.round(schools.reduce((s, x) => s + (x.materials_delivered_pct || 0), 0) / schools.length) : 0

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={8} className={sortField === field && sortDir === 'asc' ? 'opacity-100 text-[#0F2444]' : ''} />
      <ChevronDown size={8} className={sortField === field && sortDir === 'desc' ? 'opacity-100 text-[#0F2444]' : ''} />
    </span>
  )

  return (
    <SidebarLayout title="Progress Monitoring" description="Track construction progress">
      <div className="min-h-screen bg-white">

        <div className="px-6 py-6 space-y-5">

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-semibold">Department of Education</p>
                <h2 className="text-[22px] font-bold text-slate-900 leading-tight">Progress Monitoring</h2>
                <p className="text-[12px] text-slate-500 mt-2">Legazpi City, Albay — Region V</p>
              </div>
              <div className="text-right justify-end">
                <button
                  onClick={loadSchools}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-3 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-center gap-2">
              <AlertTriangle size={13} className="shrink-0" /> {error}
              <button onClick={() => setError('')} className="ml-auto"><X size={12} /></button>
            </div>
          )}

          {/* Overall progress bars */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-slate-800 mb-4">Overall Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <OverallBar label="Average Construction Progress" value={avgConstruction} color="#0F2444" />
              <OverallBar label="Average Materials Delivered" value={avgMaterials} color="#FFB900" />
            </div>
          </div>

          {/* Main progress table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[13px] font-semibold text-slate-800">Construction Progress per School</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Track progress for construction and materials delivery across your schools.</p>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[12px] text-slate-300">Loading progress data...</div>
            ) : schools.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <Building2 size={28} className="text-slate-200" />
                <p className="text-[13px] text-slate-400">No schools added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th
                        className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 whitespace-nowrap"
                        onClick={() => toggleSort('school_name')}
                      >
                        School <SortIcon field="school_name" />
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        Scope
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 whitespace-nowrap"
                        onClick={() => toggleSort('sdo_priority_level')}
                      >
                        Priority <SortIcon field="sdo_priority_level" />
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 whitespace-nowrap min-w-45"
                        onClick={() => toggleSort('construction_progress_pct')}
                      >
                        Construction % <SortIcon field="construction_progress_pct" />
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap min-w-45">
                        Materials %
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        Target Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sorted.map(s => {
                      const status = getStatus(s.construction_progress_pct || 0)
                      const StatusIcon = status.icon

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">

                          {/* School */}
                          <td className="px-4 py-3">
                            <p className="text-[12px] font-medium text-slate-800">{s.school_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{s.school_id || '—'}</p>
                          </td>

                          {/* Scope */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-[11px] bg-blue-50 text-[#0F2444] border border-blue-100 px-2 py-0.5 rounded-md">
                              {s.auto_generated_scope || '—'}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="px-4 py-3">
                            <PriorityBadge priority={s.sdo_priority_level} />
                          </td>

                          {/* Construction % */}
                          <td className="px-4 py-3">
                            <ProgressCell value={s.construction_progress_pct} color="#0F2444" />
                          </td>

                          {/* Materials % */}
                          <td className="px-4 py-3">
                            <ProgressCell value={s.materials_delivered_pct} color="#FFB900" />
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${status.bg} ${status.color}`}>
                              <StatusIcon size={10} />
                              {status.label}
                            </span>
                          </td>

                          {/* Target date */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-[12px] text-slate-600">{formatDate(s.completion_date)}</p>
                              {s.completion_date && (() => {
                                const days = getDaysRemaining(s.completion_date)
                                if (days === null) return null
                                if (days < 0) return <p className="text-[10px] text-red-500 mt-0.5">{Math.abs(days)}d overdue</p>
                                if (days <= 30) return <p className="text-[10px] text-amber-500 mt-0.5">{days}d left</p>
                                return <p className="text-[10px] text-slate-400 mt-0.5">{days}d remaining</p>
                              })()}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completion summary table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[13px] font-semibold text-slate-800">Completion Summary</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Target dates and overall completion status per school</p>
            </div>

            {!loading && schools.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['School', 'Scope', 'Priority', 'Construction', 'Materials', 'Overall', 'Target Date', 'Days Remaining', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sorted.map(s => {
                      const overall = Math.round(((s.construction_progress_pct || 0) + (s.materials_delivered_pct || 0)) / 2)
                      const status = getStatus(s.construction_progress_pct || 0)
                      const StatusIcon = status.icon
                      const days = getDaysRemaining(s.completion_date)

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-[12px] font-medium text-slate-800">{s.school_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{s.municipality || '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[11px] bg-blue-50 text-[#0F2444] border border-blue-100 px-2 py-0.5 rounded-md\">
                              {s.auto_generated_scope || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3"><PriorityBadge priority={s.sdo_priority_level} /></td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] font-mono font-semibold text-[#0F2444]">{s.construction_progress_pct || 0}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] font-mono font-semibold text-[#FFB900]">{s.materials_delivered_pct || 0}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[#0F2444]" style={{ width: `${overall}%` }} />
                              </div>
                              <span className="text-[11px] font-mono text-slate-500">{overall}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                              <CalendarDays size={11} className="text-slate-400" />
                              {formatDate(s.completion_date)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {days === null ? (
                              <span className="text-[11px] text-slate-300">—</span>
                            ) : days < 0 ? (
                              <span className="text-[11px] font-medium text-red-600">{Math.abs(days)}d overdue</span>
                            ) : (
                              <span className={`text-[11px] font-medium ${days <= 30 ? 'text-amber-600' : 'text-slate-600'}`}>
                                {days}d
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${status.bg} ${status.color}`}>
                              <StatusIcon size={10} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && schools.length === 0 && (
              <div className="py-12 flex flex-col items-center gap-3">
                <Building2 size={28} className="text-slate-200" />
                <p className="text-[13px] text-slate-400">No schools added yet</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </SidebarLayout>
  )
}

function OverallBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-slate-500">{label}</span>
        <span className="text-[14px] font-semibold font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-300">0%</span>
        <span className="text-[10px] text-slate-300">100%</span>
      </div>
    </div>
  )
}

function ProgressCell({ value, color }: { value?: number; color: string }) {
  const pct = value || 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[12px] font-mono font-semibold min-w-8" style={{ color }}>{pct}%</span>
    </div>
  )
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return <span className="text-[11px] text-slate-400">—</span>
  const styles: Record<string, string> = {
    High: 'bg-red-50 text-red-700 border-red-100',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100',
    Low: 'bg-green-50 text-green-700 border-green-100',
  }
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${styles[priority] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
      {priority}
    </span>
  )
}