'use client'

import { useEffect, useState } from 'react'
import {
  HardHat, Search, SlidersHorizontal, LayoutList,
  LayoutGrid, RefreshCw, Building2, ChevronDown,
  MapPin, Calendar, Layers, BookOpen, Wrench,
  PenSquare, Hash, X, TrendingUp
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { fetchSchools } from '@/lib/api'

interface School {
  id: string
  school_id: string
  school_name: string
  municipality: string
  legislative_district: string
  number_of_sites: number
  existing_classrooms: number
  proposed_classrooms: number
  number_of_units: number
  stories: number
  auto_generated_scope: string
  workshop_type: string
  design_configuration: string
  old_scope: string
  funding_year: number
  sdo_priority_level: string
  ranking: number
  construction_progress_pct: number
  materials_delivered_pct: number
  budget_allocated_php: number
  budget_utilized_php: number
  completion_date: string
  latitude: number
  longitude: number
}

type ViewMode = 'table' | 'card'

const PRIORITY_OPTIONS = ['All', 'High', 'Medium', 'Low']
const FUNDING_YEAR_OPTIONS = ['All', '2026', '2027', '2028', '2029']

export default function ConstructionData() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('All')
  const [fundingYear, setFundingYear] = useState('All')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)

  useEffect(() => { loadSchools() }, [])

  const loadSchools = async () => {
    try {
      setLoading(true)
      const data = await fetchSchools()
      setSchools(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('Failed to load construction data')
    } finally {
      setLoading(false)
    }
  }

  const filtered = schools.filter(s => {
    const matchSearch = !search ||
      s.school_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.school_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.municipality?.toLowerCase().includes(search.toLowerCase())
    const matchPriority = priority === 'All' || s.sdo_priority_level === priority
    const matchYear = fundingYear === 'All' || String(s.funding_year) === fundingYear
    return matchSearch && matchPriority && matchYear
  })

  const clearFilters = () => {
    setSearch('')
    setPriority('All')
    setFundingYear('All')
  }

  const hasFilters = search || priority !== 'All' || fundingYear !== 'All'

  return (
    <SidebarLayout title="Construction Data" description="All school construction info">
      <div className="min-h-screen bg-white">
        <div className="px-6 py-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-semibold">Department of Education</p>
                <h2 className="text-[22px] font-bold text-slate-900 leading-tight">Construction Data</h2>
                <p className="text-[12px] text-slate-500 mt-2">Legazpi City, Albay — Region V</p>
              </div>
              <div className="text-right flex gap-3 justify-end">
                <button onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-[#1a3a6b] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'}`}>
                  <LayoutList size={13} /> Table
                </button>
                <button onClick={() => setViewMode('card')} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${viewMode === 'card' ? 'bg-[#1a3a6b] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'}`}>
                  <LayoutGrid size={13} /> Parameter View
                </button>
                <button onClick={loadSchools} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
          {/* <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <LayoutList size={13} /> Table
                </button>
                <button onClick={() => setViewMode('card')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${viewMode === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <LayoutGrid size={13} /> Parameter View
                </button>
              </div>
              <button onClick={loadSchools} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div> */}
        </div>

        <div className="px-6">
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">{error}</div>}

          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
            <SlidersHorizontal size={13} className="text-slate-400 shrink-0" />
            <div className="relative flex-1 min-w-45">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, or municipality..." className="w-full pl-8 pr-3 py-2 text-[12px] text-black border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-[#1a3a6b]" />
            </div>
            <div className="relative">
              <select value={priority} onChange={e => setPriority(e.target.value)} className="appearance-none pl-3 pr-8 py-2 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-600 cursor-pointer">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : `${p} Priority`}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={fundingYear} onChange={e => setFundingYear(e.target.value)} className="appearance-none pl-3 pr-8 py-2 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-600 cursor-pointer">
                {FUNDING_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {hasFilters && <button onClick={clearFilters} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"><X size={11} /> Clear</button>}
            <span className="ml-auto text-[11px] text-slate-400">{filtered.length} of {schools.length} schools</span>
          </div>

          {viewMode === 'table' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {loading ? (
                <div className="py-16 text-center text-[12px] text-slate-300">Loading construction data...</div>
              ) : filtered.length === 0 ? (
                <EmptyState hasFilters={!!hasFilters} onClear={clearFilters} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {['School','Municipality','Sites','Existing CL','Proposed CL','Units','Stories','Scope','Workshop','Design Config','Old Scope','Funding Year','Priority','Ranking'].map(h => (
                          <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(s => (
                        <tr key={s.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedSchool(s)}>
                          <td className="px-3 py-3"><p className="text-[12px] font-medium text-slate-800 group-hover:text-[#1a3a6b]">{s.school_name}</p><p className="text-[10px] text-slate-400 font-mono">{s.school_id || '—'}</p></td>
                          <td className="px-3 py-3 text-[12px] text-slate-600 whitespace-nowrap">{s.municipality || '—'}</td>
                          <td className="px-3 py-3 text-[12px] text-center text-slate-600">{s.number_of_sites ?? '—'}</td>
                          <td className="px-3 py-3 text-[12px] text-center text-slate-600">{s.existing_classrooms ?? 0}</td>
                          <td className="px-3 py-3 text-[13px] text-center font-semibold text-[#1a3a6b]">{s.proposed_classrooms ?? '—'}</td>
                          <td className="px-3 py-3 text-[12px] text-center text-slate-600">{s.number_of_units ?? '—'}</td>
                          <td className="px-3 py-3 text-[12px] text-center text-slate-600">{s.stories ?? '—'}</td>
                          <td className="px-3 py-3"><span className="font-mono text-[11px] bg-blue-50 text-[#1a3a6b] border border-blue-100 px-2 py-0.5 rounded-md whitespace-nowrap">{s.auto_generated_scope || '—'}</span></td>
                          <td className="px-3 py-3 text-[12px] text-slate-600 whitespace-nowrap">{s.workshop_type || '—'}</td>
                          <td className="px-3 py-3 text-[12px] text-slate-600 whitespace-nowrap">{s.design_configuration || '—'}</td>
                          <td className="px-3 py-3">{s.old_scope ? <span className="font-mono text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{s.old_scope}</span> : <span className="text-slate-300 text-[11px]">—</span>}</td>
                          <td className="px-3 py-3">{s.funding_year ? <span className="text-[11px] font-medium px-2 py-0.5 bg-[#1a3a6b]/10 text-[#1a3a6b] rounded-md">{s.funding_year}</span> : <span className="text-slate-300 text-[11px]">—</span>}</td>
                          <td className="px-3 py-3"><PriorityBadge priority={s.sdo_priority_level} /></td>
                          <td className="px-3 py-3 text-[12px] text-center text-slate-600">{s.ranking ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {viewMode === 'card' && (
            loading ? <div className="py-16 text-center text-[12px] text-slate-300">Loading...</div> :
            filtered.length === 0 ? <EmptyState hasFilters={!!hasFilters} onClear={clearFilters} /> :
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(s => <ParameterCard key={s.id} school={s} onClick={() => setSelectedSchool(s)} />)}
            </div>
          )}
        </div>

        {selectedSchool && <SchoolDrawer school={selectedSchool} onClose={() => setSelectedSchool(null)} />}
      </div>
    </SidebarLayout>
  )
}

function ParameterCard({ school: s, onClick }: { school: School; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#1a3a6b]/30 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#1a3a6b] transition-colors leading-tight">{s.school_name}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.school_id || 'No ID'}</p>
        </div>
        <PriorityBadge priority={s.sdo_priority_level} />
      </div>
      <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/10 rounded-lg px-3 py-2.5 mb-4 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Scope</span>
        <span className="font-mono text-[14px] font-semibold text-[#1a3a6b]">{s.auto_generated_scope || '—'}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: BookOpen, label: 'Proposed CL', value: s.proposed_classrooms },
          { icon: Layers, label: 'Units', value: s.number_of_units },
          { icon: Hash, label: 'Stories', value: s.stories },
          { icon: Building2, label: 'Existing CL', value: s.existing_classrooms },
          { icon: Wrench, label: 'Workshop', value: s.workshop_type },
          { icon: PenSquare, label: 'Design Config', value: s.design_configuration },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-slate-50 rounded-lg px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Icon size={10} className="text-slate-400" />
              <span className="text-[9px] text-slate-400 uppercase tracking-wide">{label}</span>
            </div>
            <span className="text-[13px] font-medium text-slate-700">{value ?? '—'}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><MapPin size={10} /><span>{s.municipality || '—'}</span></div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><Calendar size={10} /><span>{s.funding_year || '—'}</span></div>
      </div>
    </div>
  )
}

function SchoolDrawer({ school: s, onClose }: { school: School; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="bg-[#1a3a6b] px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">School Details</p>
              <h2 className="text-[15px] font-semibold text-white leading-tight">{s.school_name}</h2>
              <p className="text-[11px] text-white/60 mt-1 font-mono">{s.school_id || 'No ID'}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors mt-0.5">
              <X size={13} className="text-white" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <PriorityBadge priority={s.sdo_priority_level} dark />
            {s.auto_generated_scope && <span className="text-[11px] font-mono font-semibold bg-white/15 text-white px-2 py-0.5 rounded-md">{s.auto_generated_scope}</span>}
          </div>
        </div>
        <div className="p-5 space-y-5">
          <DrawerSection title="School Information" icon={Building2}>
            <DrawerRow label="School ID" value={s.school_id} />
            <DrawerRow label="Municipality" value={s.municipality} />
            <DrawerRow label="Legislative District" value={s.legislative_district} />
            <DrawerRow label="Number of Sites" value={s.number_of_sites} />
            <DrawerRow label="Existing Classrooms" value={s.existing_classrooms} />
          </DrawerSection>
          <DrawerSection title="Construction Details" icon={HardHat}>
            <DrawerRow label="Proposed Classrooms" value={s.proposed_classrooms} highlight />
            <DrawerRow label="Number of Units" value={s.number_of_units} />
            <DrawerRow label="Stories" value={s.stories} />
            <DrawerRow label="Auto-generated Scope" value={s.auto_generated_scope} mono highlight />
            <DrawerRow label="Old Scope" value={s.old_scope} mono />
            <DrawerRow label="Workshop Type" value={s.workshop_type} />
            <DrawerRow label="Design Configuration" value={s.design_configuration} />
            <DrawerRow label="Funding Year" value={s.funding_year} />
          </DrawerSection>
          <DrawerSection title="Priority & Ranking" icon={Layers}>
            <DrawerRow label="SDO Priority Level" value={s.sdo_priority_level} />
            <DrawerRow label="Ranking" value={s.ranking} />
          </DrawerSection>
          <DrawerSection title="Progress & Budget" icon={TrendingUp}>
            <DrawerProgress label="Construction Progress" value={s.construction_progress_pct} color="#1a3a6b" />
            <DrawerProgress label="Materials Delivered" value={s.materials_delivered_pct} color="#f59e0b" />
            <DrawerRow label="Budget Allocated" value={s.budget_allocated_php ? `₱${Number(s.budget_allocated_php).toLocaleString()}` : undefined} />
            <DrawerRow label="Budget Utilized" value={s.budget_utilized_php ? `₱${Number(s.budget_utilized_php).toLocaleString()}` : undefined} />
            <DrawerRow label="Completion Date" value={s.completion_date ? new Date(s.completion_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined} />
          </DrawerSection>
          <DrawerSection title="Map Coordinates" icon={MapPin}>
            <DrawerRow label="Latitude" value={s.latitude} mono />
            <DrawerRow label="Longitude" value={s.longitude} mono />
          </DrawerSection>
        </div>
      </div>
    </>
  )
}

function DrawerSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-[#1a3a6b]" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  )
}

function DrawerRow({ label, value, mono, highlight }: { label: string; value?: string | number | null; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-400">{label}</span>
      <span className={`text-[12px] text-right max-w-[55%] ${mono ? 'font-mono' : ''} ${highlight ? 'font-semibold text-[#1a3a6b]' : 'text-slate-700'}`}>{value ?? '—'}</span>
    </div>
  )
}

function DrawerProgress({ label, value, color }: { label: string; value?: number; color: string }) {
  const pct = value || 0
  return (
    <div className="py-2 border-b border-slate-50 last:border-0">
      <div className="flex justify-between mb-1.5">
        <span className="text-[12px] text-slate-400">{label}</span>
        <span className="text-[12px] font-mono font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3">
      <Building2 size={28} className="text-slate-200" />
      <p className="text-[13px] text-slate-400">{hasFilters ? 'No schools match your filters' : 'No construction data yet'}</p>
      {hasFilters && <button onClick={onClear} className="text-[12px] text-[#1a3a6b] hover:underline">Clear filters</button>}
    </div>
  )
}

function PriorityBadge({ priority, dark }: { priority?: string; dark?: boolean }) {
  if (!priority) return <span className="text-[11px] text-slate-400">—</span>
  const styles: Record<string, string> = {
    High: dark ? 'bg-red-500/20 text-red-200 border-red-400/20' : 'bg-red-50 text-red-700 border-red-100',
    Medium: dark ? 'bg-amber-500/20 text-amber-200 border-amber-400/20' : 'bg-amber-50 text-amber-700 border-amber-100',
    Low: dark ? 'bg-green-500/20 text-green-200 border-green-400/20' : 'bg-green-50 text-green-700 border-green-100',
  }
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${styles[priority] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
      {priority}
    </span>
  )
}