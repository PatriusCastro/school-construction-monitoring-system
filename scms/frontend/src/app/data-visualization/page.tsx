'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3, RefreshCw, Building2,
  PieChart, TrendingUp, AlertCircle
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { fetchSchools } from '@/lib/api'
import type { TooltipItem } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend as ChartJSLegend, Title
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, ChartJSLegend, Title)

interface School {
  id: string
  school_name: string
  municipality: string
  proposed_classrooms: number
  number_of_units: number
  sdo_priority_level: string
  funding_year: number
  construction_progress_pct: number
  materials_delivered_pct: number
  auto_generated_scope: string
}

const COLORS = {
  High: '#c0392b',
  Medium: '#c8a800',
  Low: '#27ae60',
  blue: '#1a3a6b',
  blueLight: '#3b6abf',
  blueMid: '#2952a3',
  amber: '#c8a800',
  grid: '#f1f5f9',
  text: '#94a3b8',
}

export default function DataVisualization() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => { loadData() }, [])

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

  // ── Chart 1: Classrooms per school ──────────────────────────────
  const classroomsBar = {
    labels: schools.map(s =>
      s.school_name
        ?.replace('Elementary School', 'ES')
        .replace('National High School', 'NHS')
        .replace('High School', 'HS')
      || '—'
    ),
    datasets: [{
      label: 'Proposed Classrooms',
      data: schools.map(s => s.proposed_classrooms || 0),
      backgroundColor: schools.map(s =>
        s.sdo_priority_level === 'High' ? COLORS.High :
        s.sdo_priority_level === 'Medium' ? COLORS.Medium : COLORS.Low
      ),
      borderRadius: 5,
      borderSkipped: false as const,
    }]
  }

  const classroomsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.y ?? 0} proposed classrooms`,
          title: (items: TooltipItem<'bar'>[]) => schools[items[0].dataIndex]?.school_name || ''
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 10 }, maxRotation: 45, color: COLORS.text },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 2, font: { size: 10 }, color: COLORS.text },
        grid: { color: COLORS.grid },
      }
    }
  } as const

  // ── Chart 2: Priority distribution ──────────────────────────────
  const highCount = schools.filter(s => s.sdo_priority_level === 'High').length
  const mediumCount = schools.filter(s => s.sdo_priority_level === 'Medium').length
  const lowCount = schools.filter(s => s.sdo_priority_level === 'Low').length

  const priorityDoughnut = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [{
      data: [highCount, mediumCount, lowCount],
      backgroundColor: [COLORS.High, COLORS.Medium, COLORS.Low],
      borderWidth: 0,
      hoverOffset: 8,
    }]
  }

  const priorityDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'doughnut'>) => {
            const total = schools.length
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0
            return ` ${ctx.parsed} schools (${pct}%)`
          }
        }
      }
    }
  } as const

  // ── Chart 3: Schools per funding year ───────────────────────────
  const yearCounts = schools.reduce((acc: Record<string, number>, s) => {
    if (s.funding_year) acc[s.funding_year] = (acc[s.funding_year] || 0) + 1
    return acc
  }, {})
  const sortedYears = Object.keys(yearCounts).sort()
  const yearClassrooms = sortedYears.map(yr =>
    schools.filter(s => String(s.funding_year) === yr)
      .reduce((sum, s) => sum + (s.proposed_classrooms || 0), 0)
  )

  const fundingBar = {
    labels: sortedYears,
    datasets: [
      {
        label: 'Schools',
        data: sortedYears.map(yr => yearCounts[yr]),
        backgroundColor: COLORS.blue,
        borderRadius: 5,
        borderSkipped: false as const,
        yAxisID: 'y',
      },
      {
        label: 'Classrooms',
        data: yearClassrooms,
        backgroundColor: COLORS.amber,
        borderRadius: 5,
        borderSkipped: false as const,
        yAxisID: 'y1',
      }
    ]
  }

  const fundingBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            if (ctx.datasetIndex === 0) return ` ${ctx.parsed.y ?? 0} schools`
            return ` ${ctx.parsed.y ?? 0} classrooms`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 11 }, color: COLORS.text },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        position: 'left' as const,
        ticks: { stepSize: 1, font: { size: 10 }, color: COLORS.blue },
        grid: { color: COLORS.grid },
        title: { display: true, text: 'Schools', font: { size: 10 }, color: COLORS.blue }
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        ticks: { stepSize: 2, font: { size: 10 }, color: COLORS.amber },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Classrooms', font: { size: 10 }, color: COLORS.amber }
      }
    }
  } as const

  // ── Chart 4: Construction progress per school ────────────────────
  const progressBar = {
    labels: schools.map(s =>
      s.school_name
        ?.replace('Elementary School', 'ES')
        .replace('National High School', 'NHS')
        .replace('High School', 'HS')
      || '—'
    ),
    datasets: [
      {
        label: 'Construction %',
        data: schools.map(s => s.construction_progress_pct || 0),
        backgroundColor: COLORS.blue,
        borderRadius: 4,
        borderSkipped: false as const,
      },
      {
        label: 'Materials %',
        data: schools.map(s => s.materials_delivered_pct || 0),
        backgroundColor: COLORS.amber,
        borderRadius: 4,
        borderSkipped: false as const,
      }
    ]
  }

  const progressBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) =>
            ` ${ctx.dataset.label}: ${ctx.parsed.y ?? 0}%`
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 10 }, maxRotation: 45, color: COLORS.text },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { font: { size: 10 }, color: COLORS.text, callback: (v: unknown) => `${v}%` },
        grid: { color: COLORS.grid },
      }
    }
  } as const

  const totalClassrooms = schools.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)
  const avgProgress = schools.length
    ? Math.round(schools.reduce((s, x) => s + (x.construction_progress_pct || 0), 0) / schools.length)
    : 0

  return (
    <SidebarLayout title="Data Visualization" description="Analytical charts">
      <div className="min-h-screen bg-slate-50">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 size={17} className="text-[#1a3a6b]" />
              </div>
              <div>
                <h1 className="text-[18px] font-semibold text-slate-900">Data Visualization</h1>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Analytical charts — all schools overview
                  {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
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

        <div className="px-6 py-6 space-y-5">

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-center gap-2">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Schools', value: schools.length, icon: Building2, color: 'text-[#1a3a6b]', bg: 'bg-blue-50' },
              { label: 'Total Classrooms', value: totalClassrooms, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'High Priority', value: highCount, icon: PieChart, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className={`text-[20px] font-semibold ${color} leading-tight`}>
                    {loading ? <span className="text-slate-200 animate-pulse">—</span> : value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Row 1: Classrooms bar + Priority doughnut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Chart 1 — Classrooms per school */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
              <ChartHeader
                title="Proposed Classrooms per School"
                sub="Color coded by SDO priority level"
                icon={BarChart3}
              />
              <div className="flex items-center gap-4 mb-4">
                {[['High', COLORS.High], ['Medium', COLORS.Medium], ['Low', COLORS.Low]].map(([label, color]) => (
                  <Legend key={label} label={label} color={color} />
                ))}
              </div>
              <ChartWrap loading={loading} empty={schools.length === 0} height={220}>
                <Bar data={classroomsBar} options={classroomsBarOptions} />
              </ChartWrap>
              <ChartFooter>
                Total: <strong>{totalClassrooms}</strong> proposed classrooms across <strong>{schools.length}</strong> schools
              </ChartFooter>
            </div>

            {/* Chart 2 — Priority doughnut */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ChartHeader
                title="Priority Level Distribution"
                sub="Proportion of schools by SDO priority"
                icon={PieChart}
              />
              <ChartWrap loading={loading} empty={schools.length === 0} height={180}>
                <Doughnut data={priorityDoughnut} options={priorityDoughnutOptions} />
              </ChartWrap>
              <div className="mt-4 space-y-2.5">
                {[
                  { label: 'High Priority', count: highCount, color: COLORS.High },
                  { label: 'Medium Priority', count: mediumCount, color: COLORS.Medium },
                  { label: 'Low Priority', count: lowCount, color: COLORS.Low },
                ].map(({ label, count, color }) => {
                  const pct = schools.length > 0 ? Math.round((count / schools.length) * 100) : 0
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-[11px] text-slate-500">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-700">{count}</span>
                          <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Funding year + Progress grouped */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Chart 3 — Schools per funding year */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ChartHeader
                title="Funding Year Distribution"
                sub="Number of schools and classrooms per funding year"
                icon={BarChart3}
              />
              <div className="flex items-center gap-4 mb-4">
                <Legend label="Schools" color={COLORS.blue} />
                <Legend label="Classrooms" color={COLORS.amber} />
              </div>
              <ChartWrap loading={loading} empty={sortedYears.length === 0} height={200}>
                <Bar data={fundingBar} options={fundingBarOptions} />
              </ChartWrap>
              <ChartFooter>
                {sortedYears.length} funding years · {schools.length} total schools
              </ChartFooter>
            </div>

            {/* Chart 4 — Construction & Materials progress */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ChartHeader
                title="Construction vs Materials Progress"
                sub="Construction % and materials delivered % per school"
                icon={TrendingUp}
              />
              <div className="flex items-center gap-4 mb-4">
                <Legend label="Construction %" color={COLORS.blue} />
                <Legend label="Materials %" color={COLORS.amber} />
              </div>
              <ChartWrap loading={loading} empty={schools.length === 0} height={200}>
                <Bar data={progressBar} options={progressBarOptions} />
              </ChartWrap>
              <ChartFooter>
                Average construction: <strong>{avgProgress}%</strong>
              </ChartFooter>
            </div>
          </div>

          {/* Summary table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[13px] font-semibold text-slate-800">Data Summary</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Raw data behind all charts above</p>
            </div>
            {!loading && schools.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['School', 'Classrooms', 'Units', 'Scope', 'Priority', 'Funding Year', 'Construction', 'Materials'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {schools.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-[12px] font-medium text-slate-800">{s.school_name}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#1a3a6b] text-center">{s.proposed_classrooms || 0}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600 text-center">{s.number_of_units || 0}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] bg-blue-50 text-[#1a3a6b] border border-blue-100 px-2 py-0.5 rounded-md">
                            {s.auto_generated_scope || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={s.sdo_priority_level} /></td>
                        <td className="px-4 py-3">
                          {s.funding_year
                            ? <span className="text-[11px] font-medium px-2 py-0.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-md">{s.funding_year}</span>
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <MiniBar value={s.construction_progress_pct} color={COLORS.blue} />
                        </td>
                        <td className="px-4 py-3">
                          <MiniBar value={s.materials_delivered_pct} color={COLORS.amber} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !loading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Building2 size={28} className="text-slate-200" />
                <p className="text-[13px] text-slate-400">No data available</p>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </SidebarLayout>
  )
}

// ── Reusable sub-components ──────────────────────────────────────

function ChartHeader({ title, sub, icon: Icon }: { title: string; sub: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start justify-between mb-1">
      <div>
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <Icon size={14} className="text-slate-300 shrink-0 mt-0.5" />
    </div>
  )
}

function ChartWrap({ loading, empty, height, children }: {
  loading: boolean; empty: boolean; height: number; children: React.ReactNode
}) {
  if (loading) return (
    <div style={{ height }} className="flex items-center justify-center text-[12px] text-slate-300">
      Loading chart...
    </div>
  )
  if (empty) return (
    <div style={{ height }} className="flex items-center justify-center text-[12px] text-slate-300">
      No data available
    </div>
  )
  return <div style={{ height }}>{children}</div>
}

function ChartFooter({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-slate-400 mt-3 text-center">{children}</p>
  )
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
      {label}
    </span>
  )
}

function MiniBar({ value, color }: { value?: number; color: string }) {
  const pct = value || 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono" style={{ color }}>{pct}%</span>
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