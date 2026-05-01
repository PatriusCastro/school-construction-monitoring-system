'use client'

import { useEffect, useState } from 'react'
import {
  Building2, BookOpen, Layers, AlertTriangle,
  CalendarDays, TrendingUp, RefreshCw, BarChart3
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { fetchSchools } from '@/lib/api'
import type { TooltipItem } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title)

interface School {
  id: string
  school_id: string
  school_name: string
  municipality: string
  legislative_district: string
  proposed_classrooms: number
  number_of_units: number
  sdo_priority_level: string
  funding_year: number
  construction_progress_pct: number
  materials_delivered_pct: number
  auto_generated_scope: string
  budget_allocated_php: number
  completion_date: string
}

export default function Dashboard() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchSchools()
      setSchools(Array.isArray(data) ? data : [])
      setLastUpdated(new Date())
      setError('')
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Derived stats
  const totalClassrooms = schools.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)
  const totalUnits = schools.reduce((s, x) => s + (x.number_of_units || 0), 0)
  const highPriority = schools.filter(s => s.sdo_priority_level === 'High').length
  const mediumPriority = schools.filter(s => s.sdo_priority_level === 'Medium').length
  const fundingYears = [...new Set(schools.map(s => s.funding_year).filter(Boolean))].sort()
  const avgProgress = schools.length
    ? Math.round(schools.reduce((s, x) => s + (x.construction_progress_pct || 0), 0) / schools.length)
    : 0

  // Bar chart — classrooms per school
  const barData = {
    labels: schools.map(s => s.school_name?.replace(' Elementary School', ' ES').replace(' National High School', ' NHS') || ''),
    datasets: [{
      label: 'Proposed Classrooms',
      data: schools.map(s => s.proposed_classrooms || 0),
      backgroundColor: schools.map(s =>
        s.sdo_priority_level === 'High' ? '#c0392b' :
        s.sdo_priority_level === 'Medium' ? '#c8a800' : '#27ae60'
      ),
      borderRadius: 4,
      borderSkipped: false,
    }]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) =>
            ` ${ctx.parsed.y ?? 0} classrooms`
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 10 }, maxRotation: 40, color: '#94a3b8' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 2, font: { size: 10 }, color: '#94a3b8' },
        grid: { color: '#f1f5f9' },
      }
    }
  } as const

  // Doughnut chart — priority distribution
  const doughnutData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [
        schools.filter(s => s.sdo_priority_level === 'High').length,
        schools.filter(s => s.sdo_priority_level === 'Medium').length,
        schools.filter(s => s.sdo_priority_level === 'Low').length,
      ],
      backgroundColor: ['#c0392b', '#c8a800', '#27ae60'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'doughnut'>) =>
            ` ${ctx.label}: ${ctx.parsed ?? 0} schools`
        }
      }
    }
  } as const

  const metrics = [
    {
      label: 'Total Schools',
      value: schools.length,
      sub: 'Monitored institutions',
      icon: Building2,
      color: 'text-[#1a3a6b]',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Proposed Classrooms',
      value: totalClassrooms,
      sub: 'Classrooms for construction',
      icon: BookOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Units to Construct',
      value: totalUnits,
      sub: 'Building units',
      icon: Layers,
      color: 'text-[#1a3a6b]',
      bg: 'bg-blue-50',
    },
    {
      label: 'Priority Schools',
      value: null,
      sub: null,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      custom: (
        <div className="mt-1 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="font-semibold text-red-600">{highPriority}</span>
            <span className="text-slate-400 text-[11px]">High</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="font-semibold text-amber-600">{mediumPriority}</span>
            <span className="text-slate-400 text-[11px]">Medium</span>
          </div>
        </div>
      )
    },
    {
      label: 'Proposed Funding Years',
      value: null,
      sub: null,
      icon: CalendarDays,
      color: 'text-[#1a3a6b]',
      bg: 'bg-blue-50',
      custom: (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fundingYears.length > 0 ? fundingYears.map(yr => (
            <span key={yr} className="text-[11px] font-medium px-2 py-0.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-md">
              {yr}
            </span>
          )) : <span className="text-[12px] text-slate-400">No data yet</span>}
        </div>
      )
    },
    {
      label: 'Avg. Construction Progress',
      value: `${avgProgress}%`,
      sub: 'Across all schools',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <SidebarLayout title="Dashboard" description="Overview">
      <div className="min-h-screen bg-slate-50">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-slate-900">Dashboard</h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Overview of school construction monitoring — Legazpi City
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-[11px] text-slate-400">
                  Updated {lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {metrics.map(({ label, value, sub, icon: Icon, color, bg, custom }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-tight">{label}</p>
                  <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon size={13} className={color} />
                  </div>
                </div>
                {custom ?? (
                  <>
                    <p className={`text-[24px] font-semibold ${color} leading-none`}>
                      {loading ? <span className="text-slate-200 animate-pulse">—</span> : value}
                    </p>
                    {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Bar chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-[13px] font-semibold text-slate-800">Proposed Classrooms per School</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Color coded by priority level</p>
                </div>
                <BarChart3 size={15} className="text-slate-300" />
              </div>
              <div className="flex items-center gap-3 mb-3 mt-2">
                {[['High', '#c0392b'], ['Medium', '#c8a800'], ['Low', '#27ae60']].map(([label, color]) => (
                  <span key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>
              <div style={{ height: 200 }}>
                {loading ? (
                  <div className="h-full flex items-center justify-center text-[12px] text-slate-300">Loading chart...</div>
                ) : schools.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[12px] text-slate-300">No data available</div>
                ) : (
                  <Bar data={barData} options={barOptions} />
                )}
              </div>
            </div>

            {/* Doughnut chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="mb-1">
                <h2 className="text-[13px] font-semibold text-slate-800">Priority Level Distribution</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Proportion of schools by SDO priority</p>
              </div>
              <div style={{ height: 160 }} className="mt-4">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-[12px] text-slate-300">Loading chart...</div>
                ) : schools.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[12px] text-slate-300">No data available</div>
                ) : (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                )}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: 'High Priority', count: highPriority, color: 'bg-red-500' },
                  { label: 'Medium Priority', count: mediumPriority, color: 'bg-amber-400' },
                  { label: 'Low Priority', count: schools.filter(s => s.sdo_priority_level === 'Low').length, color: 'bg-green-500' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-[11px] text-slate-500">{label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schools table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-semibold text-slate-800">Schools Summary</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{schools.length} schools monitored</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[12px] text-slate-300">Loading...</div>
            ) : schools.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-[13px] text-slate-400">No schools added yet</p>
                <p className="text-[11px] text-slate-300 mt-1">Add schools from the Admin Panel</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['School', 'Municipality', 'Classrooms', 'Scope', 'Priority', 'Construction', 'Materials', 'Funding Year'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {schools.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-medium text-slate-800">{s.school_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.school_id || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{s.municipality || '—'}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#1a3a6b]">{s.proposed_classrooms || 0}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] bg-blue-50 text-[#1a3a6b] border border-blue-100 px-2 py-0.5 rounded-md">
                            {s.auto_generated_scope || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={s.sdo_priority_level} />
                        </td>
                        <td className="px-4 py-3">
                          <ProgressCell value={s.construction_progress_pct} color="#1a3a6b" />
                        </td>
                        <td className="px-4 py-3">
                          <ProgressCell value={s.materials_delivered_pct} color="#c8a800" />
                        </td>
                        <td className="px-4 py-3">
                          {s.funding_year ? (
                            <span className="text-[11px] font-medium px-2 py-0.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-md">
                              {s.funding_year}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </SidebarLayout>
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

function ProgressCell({ value, color }: { value?: number; color: string }) {
  const pct = value || 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono text-slate-500">{pct}%</span>
    </div>
  )
}