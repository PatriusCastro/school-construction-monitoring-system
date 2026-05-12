'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, RefreshCw, Search, X, Info, Expand } from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { fetchSchools } from '@/lib/api'
import type { School } from '@/components/map/SchoolMap'

const SchoolMap = dynamic(() => import('@/components/map/SchoolMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-100 text-[13px] text-slate-400">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#0F2444] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p>Loading map...</p>
      </div>
    </div>
  ),
})

export default function SchoolsMap() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showSitemap, setShowSitemap] = useState(false)

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
      <div className="flex flex-col bg-white overflow-hidden" style={{ height: 'calc(100vh - 0px)' }}>

        {noCoords.length > 0 && !loading && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 shrink-0">
            <Info size={13} className="text-amber-600 shrink-0" />
            <p className="text-[12px] text-amber-700">
              <strong>{noCoords.length} school{noCoords.length > 1 ? 's' : ''}</strong> not shown — missing coordinates. Add in Admin Panel.
            </p>
          </div>
        )}

        {error && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700 shrink-0">
            {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden p-4 pt-3 gap-3">

          {/* Left school list */}
          <div className="w-60 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="px-3 py-3 border-b border-slate-100">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search schools..."
                  className="w-full pl-8 pr-3 py-2 text-[12px] text-black/80 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-[#0F2444]"
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
                    className={`w-full text-left px-3 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center gap-2.5 ${
                      selectedSchool?.id === s.id ? 'bg-blue-50 border-l-2 border-l-[#0F2444]' : ''
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: s.sdo_priority_level === 'High' ? '#DC2626' :
                          s.sdo_priority_level === 'Medium' ? '#FFB900' : '#27AE60'
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[12px] font-medium truncate leading-tight ${selectedSchool?.id === s.id ? 'text-[#0F2444]' : 'text-slate-700'}`}>
                        {s.school_name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.municipality || '—'}</p>
                    </div>
                    {(!s.latitude || !s.longitude) && (
                      <span className="text-[9px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">No pin</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">{validSchools.length} pinned · {noCoords.length} missing</p>
              <button onClick={loadSchools} disabled={loading} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Map — takes remaining space, relative for floating panel */}
          <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">

            {/* Priority legend — top left overlay */}
            <div className="absolute top-3 left-3 z-999 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1.5">Priority</p>
              <div className="flex flex-col gap-1.5">
                {[['High', '#DC2626'], ['Medium', '#FFB900'], ['Low', '#27AE60']].map(([label, color]) => (
                  <span key={label} className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating right info panel */}
            {selectedSchool && (
              <div className="absolute top-3 right-3 z-999 w-72 bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                {/* Header */}
                <div className="bg-[#0F2444] px-4 py-4 relative">
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="absolute top-3 right-3 w-6 h-6 bg-white/15 hover:bg-white/25 rounded-md flex items-center justify-center transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                  <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">
                    {selectedSchool.municipality?.toUpperCase() || 'LEGAZPI CITY'} · {selectedSchool.legislative_district || '—'}
                  </p>
                  <h3 className="text-[15px] font-bold text-white leading-tight pr-8">{selectedSchool.school_name}</h3>
                  {selectedSchool.school_id && (
                    <p className="text-[10px] text-white/40 font-mono mt-1">ID: {selectedSchool.school_id}</p>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap">
                    {selectedSchool.sdo_priority_level && (
                      <span className={`text-[11px] font-semibold px-3 py-1 rounded-lg ${
                        selectedSchool.sdo_priority_level === 'High' ? 'bg-red-50 text-[#DC2626]' :
                        selectedSchool.sdo_priority_level === 'Medium' ? 'bg-amber-50 text-[#FFB900]' :
                        'bg-green-50 text-[#27AE60]'
                      }`}>
                        {selectedSchool.sdo_priority_level} Priority
                      </span>
                    )}
                    {selectedSchool.auto_generated_scope && (
                      <span className="text-[11px] font-bold font-mono px-3 py-1 rounded-lg bg-blue-50 text-[#0F2444]">
                        {selectedSchool.auto_generated_scope}
                      </span>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      { label: 'CLASSROOMS',   value: selectedSchool.proposed_classrooms },
                      { label: 'UNITS',         value: selectedSchool.number_of_units },
                      { label: 'STORIES',       value: selectedSchool.stories },
                      { label: 'FUNDING YEAR',  value: selectedSchool.funding_year },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-[22px] font-bold text-slate-800 leading-none">{value ?? '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <ProgressBar label="Construction" value={selectedSchool.construction_progress_pct} color="#0F2444" />
                    <ProgressBar label="Materials" value={selectedSchool.materials_delivered_pct} color="#FFB900" />
                  </div>

                  {selectedSchool.site_map_url && (
                    <>
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                            Sitemap
                          </p>

                          <button
                            onClick={() => setShowSitemap(true)}
                            className="text-[10px] text-[#0F2444] hover:bg-[#0F2444]/5 p-2 rounded transition-colors flex items-center gap-1"
                          >
                            <Expand size={12}/>
                          </button>
                        </div>

                        <button
                          onClick={() => setShowSitemap(true)}
                          className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 group"
                        >
                          <img
                            src={selectedSchool.site_map_url}
                            alt={`${selectedSchool.school_name} sitemap`}
                            className="w-full h-full object-contain bg-slate-100 group-hover:scale-[1.02] transition-transform duration-300"
                          />

                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2">
                            <p className="text-[10px] text-white font-medium truncate">
                              Click to expand
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Fullscreen Modal */}
                      {showSitemap && (
                        <div className="fixed h-screen inset-0 z-9999 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                          <button
                            onClick={() => setShowSitemap(false)}
                            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                          >
                            <X size={18} className="text-white" />
                          </button>

                          <div className="max-h-[90vh] w-full flex items-center justify-center">
                            <img
                              src={selectedSchool.site_map_url}
                              alt="Expanded Sitemap"
                              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Budget */}
                  {selectedSchool.budget_allocated_php ? (
                    <div className="text-right pt-2 border-t border-slate-100">
                      <span className="text-[12px] text-slate-500">Budget: </span>
                      <span className="text-[13px] font-bold text-slate-800">
                        ₱{Number(selectedSchool.budget_allocated_php).toLocaleString()}
                      </span>
                    </div>
                  ) : null}

                  {/* Coordinates */}
                  {(selectedSchool.latitude || selectedSchool.longitude) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <MapPin size={10} />
                      {selectedSchool.latitude}, {selectedSchool.longitude}
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="h-full flex items-center justify-center bg-slate-100">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#0F2444] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[12px] text-slate-400">Loading map...</p>
                </div>
              </div>
            ) : (
              <SchoolMap
                schools={schools}
                selectedSchool={selectedSchool}
                onSelectSchool={setSelectedSchool}
              />
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

function ProgressBar({ label, value, color }: { label: string; value?: number; color: string }) {
  const pct = value || 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-slate-500">{label}</span>
        <span className="text-[11px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}