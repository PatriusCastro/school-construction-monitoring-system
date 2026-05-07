'use client'

import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, Upload, FileSpreadsheet,
  FileDown, Search, Building2, AlertCircle,
  CheckCircle2, ChevronRight, Loader2, X,
  ShieldCheck, Users
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import SchoolForm, { SchoolFormData } from '@/components/forms/SchoolForm'
import { createSchool, fetchSchools, updateSchool, deleteSchool } from '@/lib/api'

const emptySchool: SchoolFormData = {
  school_id: '',
  school_name: '',
  municipality: '',
  legislative_district: '',
  number_of_sites: 1,
  existing_classrooms: 0,
  proposed_classrooms: 0,
  number_of_units: 1,
  stories: 1,
  auto_generated_scope: '',
  workshop_type: '',
  design_configuration: '',
  old_scope: '',
  funding_year: '',
  sdo_priority_level: '',
  ranking: '',
  construction_progress_pct: 0,
  materials_delivered_pct: 0,
  budget_allocated_php: 0,
  budget_utilized_php: 0,
  completion_date: '',
  latitude: '',
  longitude: '',
}

type ViewMode = 'list' | 'add' | 'edit'

export default function AdminPanel() {
  const [schools, setSchools] = useState<SchoolFormData[]>([])
  const [school, setSchool] = useState<SchoolFormData>(emptySchool)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null)

  useEffect(() => { loadSchools() }, [])

  const loadSchools = async () => {
    try {
      setLoading(true)
      const data = await fetchSchools()
      setSchools(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('Failed to load schools. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      if (editingId) {
        await updateSchool(editingId, school)
        showMessage('School record updated successfully')
      } else {
        await createSchool(school)
        showMessage('New school record added successfully')
      }
      setSchool(emptySchool)
      setEditingId(null)
      setViewMode('list')
      await loadSchools()
    } catch (err) {
      setError((err as Error).message || 'Operation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (s: SchoolFormData) => {
    setSchool(s)
    setEditingId(s.id || null)
    setViewMode('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true)
      await deleteSchool(id)
      showMessage('School record deleted')
      setDeleteConfirm(null)
      await loadSchools()
    } catch {
      setError('Failed to delete school')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSchool(emptySchool)
    setEditingId(null)
    setViewMode('list')
    setError('')
  }

  const filteredSchools = schools.filter(s =>
    !search ||
    s.school_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.municipality?.toLowerCase().includes(search.toLowerCase()) ||
    s.school_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SidebarLayout title="Admin Panel" description="Manage schools">
      <div className="min-h-screen bg-white">

        <div className="px-6 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-3">
              {viewMode !== 'list' && (
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X size={15} className="text-slate-600" />
                </button>
              )}
              <div>
                {viewMode !== 'list' && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span>Admin Panel</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-600">
                      {viewMode === 'add' ? 'Add New School' : 'Edit School'}
                    </span>
                  </div>
                )}
                <h1 className="text-lg font-semibold text-slate-900">
                  {viewMode === 'list' ? 'Manage Schools' : viewMode === 'add' ? 'Add New School' : 'Edit School Record'}
                </h1>
              </div>
            </div>

            {viewMode === 'list' && (
              <div className="flex items-center gap-2 flex-wrap">
                <button className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Upload size={13} /> Upload Site Plan
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <FileSpreadsheet size={13} /> Export Excel
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <FileDown size={13} /> Export PDF
                </button>
                <button
                  onClick={() => setViewMode('add')}
                  className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#163260] transition-colors"
                >
                  <Plus size={13} /> Add New School
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-6">

          {/* Toast notifications */}
          {message && (
            <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-[13px] text-green-800">
              <CheckCircle2 size={15} className="text-green-600 shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-800">
              <AlertCircle size={15} className="text-red-600 shrink-0" />
              {error}
              <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
            </div>
          )}

          {/* FORM VIEW */}
          {viewMode !== 'list' ? (
            <SchoolForm
              school={school}
              editingId={editingId}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              setSchool={setSchool}
            />
          ) : (
            <>
              {/* Access info banner */}
              <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-[#1a3a6b]/5 border border-[#1a3a6b]/15 rounded-xl">
                <ShieldCheck size={15} className="text-[#1a3a6b] shrink-0" />
                <p className="text-[12px] text-[#1a3a6b]">
                  <span className="font-semibold">Admin access</span> — You can add, edit, and delete school records. Viewers can only read data.
                </p>
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Users size={12} />
                  <span>SDO Legazpi City</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total Schools', value: schools.length, color: 'text-[#1a3a6b]' },
                  { label: 'High Priority', value: schools.filter(s => s.sdo_priority_level === 'High').length, color: 'text-red-600' },
                  { label: 'Medium Priority', value: schools.filter(s => s.sdo_priority_level === 'Medium').length, color: 'text-amber-600' },
                  { label: 'Completed', value: schools.filter(s => s.construction_progress_pct === 100).length, color: 'text-green-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-[11px] text-slate-400 mb-1">{label}</p>
                    <p className={`text-[22px] font-semibold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Table card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-[14px] font-semibold text-slate-800">
                      School Records
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">{filteredSchools.length} of {schools.length} schools</p>
                  </div>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search schools..."
                      className="pl-8 pr-3 py-2 text-[12px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-[#1a3a6b] focus:ring-1 focus:ring-[#1a3a6b]/20 w-52"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-slate-400 text-[13px]">
                    <Loader2 size={16} className="animate-spin" /> Loading schools...
                  </div>
                ) : filteredSchools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <Building2 size={32} className="text-slate-200" />
                    <p className="text-[13px]">
                      {search ? 'No schools match your search' : 'No schools added yet'}
                    </p>
                    {!search && (
                      <button
                        onClick={() => setViewMode('add')}
                        className="mt-1 flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#163260] transition-colors"
                      >
                        <Plus size={13} /> Add First School
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {['School ID', 'School Name', 'Municipality', 'Scope', 'Priority', 'Progress', 'Budget Allocated', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredSchools.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-3 text-[12px] text-slate-400 font-mono">{s.school_id || '—'}</td>
                            <td className="px-4 py-3">
                              <p className="text-[13px] font-medium text-slate-800">{s.school_name}</p>
                              <p className="text-[11px] text-slate-400">{s.legislative_district || '—'}</p>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-slate-600">{s.municipality || '—'}</td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-[11px] bg-blue-50 text-[#1a3a6b] border border-blue-100 px-2 py-0.5 rounded-md">
                                {s.auto_generated_scope || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <PriorityBadge priority={s.sdo_priority_level as string} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#1a3a6b]"
                                    style={{ width: `${s.construction_progress_pct || 0}%` }}
                                  />
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono min-w-7">
                                  {s.construction_progress_pct || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-slate-600">
                              {s.budget_allocated_php
                                ? `₱${Number(s.budget_allocated_php).toLocaleString()}`
                                : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(s)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#1a3a6b] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                                {deleteConfirm === s.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDelete(s.id!)}
                                      className="px-2.5 py-1.5 text-[11px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(s.id!)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={11} /> Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
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