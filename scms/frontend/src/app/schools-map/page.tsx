'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  MapPin, RefreshCw, Building2, Search,
  X, ChevronRight, Info
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { fetchSchools } from '@/lib/api'

// Leaflet MUST be dynamically imported — it breaks SSR
const SchoolMap = dynamic(() => import('@/components/map/SchoolMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-100 text-[13px] text-slate-400">
      Loading map...
    </div>
  ),
})

interface School {
  id: string
  school_id: string
  school_name: string
  municipality: string
  legislative_district: string
  proposed_classrooms: number
  number_of_units: number
  stories: number
  auto_generated_scope: string
  sdo_priority_level: string
  funding_year: number
  construction_progress_pct: number
  materials_delivered_pct: number
  budget_allocated_php: number
  completion_date: string
  latitude: number
  longitude: number
}

export default function SchoolsMap() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)

  useEffect(() => { loadSchools() }, [])

  const loadSchools = async () => {
    try {
      setLoading(true)
      const data = await fetchSchools()
      setSchools(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('Failed to load schools')
    } finally {
      setLoading(false)
    }
  }

  const validSchools = schools.filter(s => s.latitude && s.longitude)
  const noCoords = schools.filter(s => !s.latitude || !s.longitude)

  const filteredList = schools.filter(s =>
    !search ||
    s.school_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.municipality?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SidebarLayout title="Schools Map" description="School locations">
      <div className="flex flex-col h-screen bg-slate-50">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="max-w-full flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <MapPin size={17} className="text-[#1a3a6b]" />
              </div>
              <div>
                <h1 className="text-[18px] font-semibold text-slate-900">Schools Map</h1>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  {validSchools.length} of {schools.length} schools plotted — Legazpi City
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Legend */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                {[['High', '#c0392b'], ['Medium', '#c8a800'], ['Low', '#27ae60']].map(([label, color]) => (
                  <span key={label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>
              <button
                onClick={loadSchools}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex-shrink-0">
            {error}
          </div>
        )}

        {/* No coordinates warning */}
        {noCoords.length > 0 && !loading && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 flex-shrink-0">
            <Info size={13} className="text-amber-600 flex-shrink-0" />
            <p className="text-[12px] text-amber-700">
              <strong>{noCoords.length} school{noCoords.length > 1 ? 's' : ''}</strong> not shown — missing coordinates.
              Add latitude & longitude in Admin Panel.
            </p>
          </div>
        )}

        {/* Main content — map + sidebar */}
        <div className="flex flex-1 overflow-hidden gap-0 p-4 pt-3">

          {/* School list sidebar */}
          <div className="w-72 flex-shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col mr-3">
            <div className="px-3 py-3 border-b border-slate-100">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search schools..."
                  className="w-full pl-8 pr-3 py-2 text-[12px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-[#1a3a6b]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-[12px] text-slate-300">Loading...</div>
              ) : filteredList.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-slate-300">No schools found</div>
              ) : (
                filteredList.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSchool(selectedSchool?.id === s.id ? null : s)}
                    className={`w-full text-left px-3 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 group ${
                      selectedSchool?.id === s.id ? 'bg-blue-50 border-l-2 border-l-[#1a3a6b]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: s.sdo_priority_level === 'High' ? '#c0392b' :
                            s.sdo_priority_level === 'Medium' ? '#c8a800' : '#27ae60'
                        }}
                      />
                      <div className="min-w-0">
                        <p className={`text-[12px] font-medium truncate ${selectedSchool?.id === s.id ? 'text-[#1a3a6b]' : 'text-slate-700'}`}>
                          {s.school_name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{s.municipality || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {(!s.latitude || !s.longitude) && (
                        <span className="text-[9px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">No pin</span>
                      )}
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* List footer */}
            <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] text-slate-400 text-center">
                {validSchools.length} pinned · {noCoords.length} missing coords
              </p>
            </div>
          </div>

          {/* Map area */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden relative">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#1a3a6b] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-[12px] text-slate-400">Loading map...</p>
                  </div>
                </div>
              ) : (
                <SchoolMap schools={schools} onSelectSchool={setSelectedSchool} />
              )}
            </div>

            {/* Selected school info panel */}
            {selectedSchool && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: selectedSchool.sdo_priority_level === 'High' ? '#fde8e8' :
                          selectedSchool.sdo_priority_level === 'Medium' ? '#fef3cd' : '#e6f4ea'
                      }}
                    >
                      <Building2
                        size={15}
                        style={{
                          color: selectedSchool.sdo_priority_level === 'High' ? '#c0392b' :
                            selectedSchool.sdo_priority_level === 'Medium' ? '#c8a800' : '#27ae60'
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-slate-800">{selectedSchool.school_name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{selectedSchool.municipality} · {selectedSchool.legislative_district || '—'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSchool(null)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <X size={12} className="text-slate-500" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    { label: 'Priority', value: selectedSchool.sdo_priority_level },
                    { label: 'Scope', value: selectedSchool.auto_generated_scope, mono: true },
                    { label: 'Classrooms', value: selectedSchool.proposed_classrooms },
                    { label: 'Units', value: selectedSchool.number_of_units },
                    { label: 'Funding Year', value: selectedSchool.funding_year },
                    { label: 'Budget', value: selectedSchool.budget_allocated_php ? `₱${Number(selectedSchool.budget_allocated_php).toLocaleString()}` : '—' },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="bg-slate-50 rounded-lg px-2.5 py-2">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className={`text-[12px] font-semibold text-slate-700 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Construction</span>
                      <span className="font-mono text-[#1a3a6b] font-semibold">{selectedSchool.construction_progress_pct || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1a3a6b] rounded-full" style={{ width: `${selectedSchool.construction_progress_pct || 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Materials</span>
                      <span className="font-mono text-amber-600 font-semibold">{selectedSchool.materials_delivered_pct || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${selectedSchool.materials_delivered_pct || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}