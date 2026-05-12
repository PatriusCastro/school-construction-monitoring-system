'use client'

import { useEffect, useState } from 'react'
import {
  Plus, FileSpreadsheet, FileDown,
  Building2, AlertCircle, CheckCircle2,
  Loader2, X, RefreshCw, SlidersHorizontal,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import SidebarLayout from '@/components/layout/SidebarLayout'
import SchoolForm, { SchoolFormData } from '@/components/forms/SchoolForm'
import { createSchool, fetchSchools, updateSchool, deleteSchool } from '@/lib/api'

import StatCard          from '@/components/admin/StatCard'
import SchoolRow         from '@/components/admin/SchoolRow'
import SchoolListToolbar from '@/components/admin/SchoolListToolbar'
import SchoolDetailModal from '@/components/admin/SchoolDetailModal'
import Pagination        from '@/components/admin/Pagination'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

const emptySchool: SchoolFormData = {
  school_id: '', school_name: '', municipality: '', legislative_district: '',
  number_of_sites: 1, existing_classrooms: 0, proposed_classrooms: 0,
  number_of_units: 1, stories: 1, auto_generated_scope: '', workshop_type: '',
  design_configuration: '', old_scope: '', funding_year: '', sdo_priority_level: '',
  ranking: '', construction_progress_pct: 0, materials_delivered_pct: 0,
  budget_allocated_php: 0, budget_utilized_php: 0, completion_date: '',
  latitude: '', longitude: '',
}

type ViewMode = 'list' | 'add' | 'edit'

// ─── Export helpers ───────────────────────────────────────────────────────────

function exportToExcel(schools: SchoolFormData[]) {
  const rows = schools.map((s, i) => ({
    '#': i + 1,
    'School ID': s.school_id ?? '',
    'School Name': s.school_name ?? '',
    'Municipality': s.municipality ?? '',
    'Legislative District': s.legislative_district ?? '',
    'Scope': s.auto_generated_scope ?? '',
    'Priority': s.sdo_priority_level ?? '',
    'Construction Progress (%)': s.construction_progress_pct ?? 0,
    'Materials Delivered (%)': s.materials_delivered_pct ?? 0,
    'Budget Allocated (PHP)': s.budget_allocated_php ?? 0,
    'Budget Utilized (PHP)': s.budget_utilized_php ?? 0,
    'Funding Year': s.funding_year ?? '',
    'Completion Date': s.completion_date ?? '',
    'Existing Classrooms': s.existing_classrooms ?? 0,
    'Proposed Classrooms': s.proposed_classrooms ?? 0,
    'Stories': s.stories ?? '',
    'Design Configuration': s.design_configuration ?? '',
    'Workshop Type': s.workshop_type ?? '',
    'Latitude': s.latitude ?? '',
    'Longitude': s.longitude ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = Object.keys(rows[0] ?? {}).map(k => ({
    wch: Math.max(k.length, ...rows.map(r => String((r as Record<string, unknown>)[k] ?? '').length)) + 2,
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'School Records')
  XLSX.writeFile(wb, `SDO-Legazpi-Schools-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

function exportToPDF(schools: SchoolFormData[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('SDO Legazpi City — School Records', 40, 40)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120)
  doc.text(
    `Exported: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}   Total: ${schools.length} schools`,
    40, 56,
  )
  autoTable(doc, {
    startY: 70,
    head: [['#', 'School Name', 'Municipality', 'Scope', 'Priority', 'Progress', 'Budget (PHP)', 'FY']],
    body: schools.map((s, i) => [
      i + 1,
      s.school_name ?? '',
      s.municipality ?? '',
      s.auto_generated_scope ?? '—',
      s.sdo_priority_level ?? '—',
      `${s.construction_progress_pct ?? 0}%`,
      s.budget_allocated_php ? `₱${Number(s.budget_allocated_php).toLocaleString()}` : '—',
      s.funding_year ?? '—',
    ]),
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [26, 58, 107], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 24, halign: 'center' }, 5: { halign: 'center' } },
    margin: { left: 40, right: 40 },
  })
  doc.save(`SDO-Legazpi-Schools-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [schools, setSchools]             = useState<SchoolFormData[]>([])
  const [school, setSchool]               = useState<SchoolFormData>(emptySchool)
  const [editingId, setEditingId]         = useState<string | number | null>(null)
  const [viewMode, setViewMode]           = useState<ViewMode>('list')
  const [viewingSchool, setViewingSchool] = useState<SchoolFormData | null>(null)
  const [message, setMessage]             = useState('')
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [search, setSearch]               = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null)
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [exportingXlsx, setExportingXlsx] = useState(false)
  const [exportingPdf, setExportingPdf]   = useState(false)
  const [page, setPage]                   = useState(1)

  useEffect(() => { loadSchools() }, [])

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1) }, [search, priorityFilter])

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
    setTimeout(() => setMessage(''), 4000)
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
    setViewingSchool(null)
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

  const handleExportExcel = async () => {
    setExportingXlsx(true)
    try { exportToExcel(filteredSchools); showMessage(`Exported ${filteredSchools.length} records to Excel`) }
    catch { setError('Export to Excel failed') }
    finally { setExportingXlsx(false) }
  }

  const handleExportPDF = async () => {
    setExportingPdf(true)
    try { exportToPDF(filteredSchools); showMessage(`Exported ${filteredSchools.length} records to PDF`) }
    catch { setError('Export to PDF failed') }
    finally { setExportingPdf(false) }
  }

  const filteredSchools = schools.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !search || s.school_name?.toLowerCase().includes(q) ||
      s.municipality?.toLowerCase().includes(q) || s.school_id?.toLowerCase().includes(q)
    const matchPriority = priorityFilter === 'All' || s.sdo_priority_level === priorityFilter
    return matchSearch && matchPriority
  })

  const totalPages   = Math.ceil(filteredSchools.length / PAGE_SIZE)
  const pagedSchools = filteredSchools.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = {
    total:     schools.length,
    high:      schools.filter(s => s.sdo_priority_level === 'High').length,
    medium:    schools.filter(s => s.sdo_priority_level === 'Medium').length,
    completed: schools.filter(s => Number(s.construction_progress_pct) >= 100).length,
  }

  // ─── Form View ──────────────────────────────────────────────────────────────

  if (viewMode !== 'list') {
    return (
      <SidebarLayout title="Admin Panel" description="Manage schools">
        <div className="min-h-screen bg-slate-50/50">
          {/* Sticky top bar */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3.5">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X size={14} className="text-slate-600" />
                </button>
                <nav className="flex items-center gap-1.5 text-[12px]">
                  <span className="text-slate-400 hover:text-slate-600 cursor-pointer" onClick={handleCancel}>
                    School Records
                  </span>
                  <span className="text-slate-300 mx-1">›</span>
                  <span className="text-slate-800 font-medium">
                    {viewMode === 'add' ? 'Add New School' : `Edit: ${school.school_name || 'School'}`}
                  </span>
                </nav>
              </div>
              {/* <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  form="school-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold text-white bg-[#1a3a6b] rounded-lg hover:bg-[#163260] disabled:opacity-60 transition-colors"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  {isSubmitting ? 'Saving…' : viewMode === 'add' ? 'Create School' : 'Save Changes'}
                </button>
              </div> */}
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-8">
            {error && (
              <div className="mb-6 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-800">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                {error}
                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                  <X size={13} />
                </button>
              </div>
            )}
            <SchoolForm
              school={school}
              editingId={editingId}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              setSchool={setSchool}
            />
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // ─── List View ──────────────────────────────────────────────────────────────

  return (
    <SidebarLayout title="Admin Panel" description="Manage schools">

      {/* Full-view modal */}
      {viewingSchool && (
        <SchoolDetailModal
          school={viewingSchool}
          onClose={() => setViewingSchool(null)}
          onEdit={handleEdit}
        />
      )}

      <div className="min-h-screen bg-slate-50/40 p-6">

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-semibold">Department of Education</p>
              <h2 className="text-[22px] font-bold text-slate-900 leading-tight">Admin Panel</h2>
              <p className="text-[12px] text-slate-500 mt-2">Legazpi City, Albay — Region V</p>
            </div>
            <div className="text-right justify-end">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={loadSchools}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>

                <button
                  onClick={handleExportExcel}
                  disabled={exportingXlsx || schools.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {exportingXlsx
                    ? <Loader2 size={13} className="animate-spin text-emerald-600" />
                    : <FileSpreadsheet size={13} className="text-emerald-600" />}
                  Export Excel
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={exportingPdf || schools.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {exportingPdf
                    ? <Loader2 size={13} className="animate-spin text-red-500" />
                    : <FileDown size={13} className="text-red-500" />}
                  Export PDF
                </button>

                
                <button
                  onClick={() => setViewMode('add')}
                  className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-[#1a3a6b] rounded-lg hover:bg-[#163260] transition-colors shadow-sm shadow-[#1a3a6b]/20"
                >
                  <Plus size={13} /> Add School
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-5">

          {/* Toasts */}
          {message && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-800">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span className="font-medium">{message}</span>
              <button onClick={() => setMessage('')} className="ml-auto text-emerald-400 hover:text-emerald-600"><X size={12} /></button>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-800">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <span className="font-medium">{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={12} /></button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Schools" value={stats.total}     accent="navy"  icon={Building2}        sublabel="All records" />
            <StatCard label="High Priority" value={stats.high}      accent="red"   icon={AlertCircle}      sublabel="Urgent attention" />
            <StatCard label="Med. Priority" value={stats.medium}    accent="amber" icon={SlidersHorizontal} sublabel="Active monitoring" />
            <StatCard label="Completed"     value={stats.completed} accent="green" icon={CheckCircle2}     sublabel="100% progress" />
          </div>

          {/* School Records List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">

            <SchoolListToolbar
              search={search}
              priorityFilter={priorityFilter}
              totalFiltered={filteredSchools.length}
              totalAll={schools.length}
              onSearchChange={setSearch}
              onPriorityChange={setPriorityFilter}
              onClear={() => { setSearch(''); setPriorityFilter('All') }}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 size={20} className="animate-spin text-[#1a3a6b]" />
                <p className="text-[13px] text-slate-400">Loading school records…</p>
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Building2 size={24} className="text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-medium text-slate-600 mb-1">
                    {search || priorityFilter !== 'All' ? 'No matching records' : 'No schools yet'}
                  </p>
                  <p className="text-[12px] text-slate-400">
                    {search || priorityFilter !== 'All'
                      ? 'Try adjusting your search or filter'
                      : 'Get started by adding your first school record'}
                  </p>
                </div>
                {!search && priorityFilter === 'All' && (
                  <button
                    onClick={() => setViewMode('add')}
                    className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-[#1a3a6b] rounded-lg hover:bg-[#163260] transition-colors"
                  >
                    <Plus size={13} /> Add First School
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {pagedSchools.map((s, idx) => (
                  <SchoolRow
                    key={s.id ?? idx}
                    school={s}
                    index={(page - 1) * PAGE_SIZE + idx}
                    deleteConfirm={deleteConfirm}
                    onView={setViewingSchool}
                    onEdit={handleEdit}
                    onDeleteRequest={setDeleteConfirm}
                    onDeleteConfirm={handleDelete}
                    onDeleteCancel={() => setDeleteConfirm(null)}
                  />
                ))}
              </ul>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredSchools.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}