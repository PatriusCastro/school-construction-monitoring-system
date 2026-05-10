'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw, FileText } from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import ReportCards from '@/components/reports/ReportCards'
import OverallReportSection from '@/components/reports/OverallReportSection'
import ErrorAlert from '@/components/reports/ErrorAlert'
import { fetchSchools } from '@/lib/api'

interface School {
  id: string
  school_id: string
  school_name: string
  municipality: string
  legislative_district: string
  auto_generated_scope: string
  sdo_priority_level: string
  ranking: number
  funding_year: number
  proposed_classrooms: number
  number_of_units: number
  stories: number
  construction_progress_pct: number
  materials_delivered_pct: number
  budget_allocated_php: number
  budget_utilized_php: number
  completion_date: string
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatPHP(n?: number) {
  if (!n) return '—'
  return `₱${Number(n).toLocaleString()}`
}

export default function Reports() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
  const [error, setError] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadSchools() }, [])

  const loadSchools = async () => {
    try {
      setLoading(true)
      const data = await fetchSchools()
      setSchools(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  // Derived stats are now computed in the OverallReportSection component

  // ── Export Overall PDF ──────────────────────────────────────────────────────
  const exportPDF = async () => {
    setExporting('pdf')
    try {
      const jsPDF     = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const totalClassrooms   = schools.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)
      const totalBudget       = schools.reduce((s, x) => s + (x.budget_allocated_php || 0), 0)
      const totalUtilized     = schools.reduce((s, x) => s + (x.budget_utilized_php || 0), 0)
      const avgConstruction   = schools.length ? Math.round(schools.reduce((s, x) => s + (x.construction_progress_pct || 0), 0) / schools.length) : 0
      const avgMaterials      = schools.length ? Math.round(schools.reduce((s, x) => s + (x.materials_delivered_pct || 0), 0) / schools.length) : 0
      const completed         = schools.filter(s => (s.construction_progress_pct || 0) >= 100).length
      const onTrack           = schools.filter(s => { const p = s.construction_progress_pct || 0; return p >= 60 && p < 100 }).length
      const inProgress        = schools.filter(s => { const p = s.construction_progress_pct || 0; return p >= 20 && p < 60 }).length
      const highPriority      = schools.filter(s => s.sdo_priority_level === 'High').length

      doc.setFillColor(26, 58, 107)
      doc.rect(0, 0, 297, 22, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('School Construction Monitoring System', 14, 10)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Overall Construction Report — Legazpi City, Albay (Region V)', 14, 17)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`, 230, 17)

      doc.setTextColor(30, 41, 59)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('SUMMARY', 14, 30)

      const summaryData = [
        ['Total Schools', String(schools.length), 'Avg. Construction', `${avgConstruction}%`, 'Total Budget', formatPHP(totalBudget)],
        ['High Priority', String(highPriority),   'Avg. Materials',    `${avgMaterials}%`,    'Budget Utilized', formatPHP(totalUtilized)],
        ['Completed',     String(completed),       'On Track',          String(onTrack),       'In Progress',   String(inProgress)],
      ]

      autoTable(doc, {
        startY: 33,
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [100, 116, 139] },
          2: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [100, 116, 139] },
          4: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [100, 116, 139] },
        },
      })

      const afterSummary = (doc as any).lastAutoTable.finalY + 6

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('SCHOOL CONSTRUCTION DETAILS', 14, afterSummary)

      function getStatus(pct: number) {
        if (pct >= 100) return { label: 'Complete' }
        if (pct >= 60)  return { label: 'On Track' }
        if (pct >= 20)  return { label: 'In Progress' }
        return           { label: 'Delayed' }
      }

      autoTable(doc, {
        startY: afterSummary + 3,
        head: [[
          'School Name', 'ID', 'Municipality', 'Scope', 'Priority', 'Ranking',
          'CL', 'Units', 'Construction %', 'Materials %', 'Status',
          'Budget Allocated', 'Budget Utilized', 'Funding Year', 'Completion Date'
        ]],
        body: schools.map(s => {
          const status = getStatus(s.construction_progress_pct || 0)
          return [
            s.school_name || '—',
            s.school_id || '—',
            s.municipality || '—',
            s.auto_generated_scope || '—',
            s.sdo_priority_level || '—',
            s.ranking || '—',
            s.proposed_classrooms || 0,
            s.number_of_units || 0,
            `${s.construction_progress_pct || 0}%`,
            `${s.materials_delivered_pct || 0}%`,
            status.label,
            formatPHP(s.budget_allocated_php),
            formatPHP(s.budget_utilized_php),
            s.funding_year || '—',
            formatDate(s.completion_date),
          ]
        }),
        theme: 'striped',
        headStyles: { fillColor: [26, 58, 107], textColor: 255, fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 40 }, 8: { halign: 'center' }, 9: { halign: 'center' } },
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text(`Page ${i} of ${pageCount} — SCMS Legazpi City`, 14, 205)
      }

      doc.save(`SCMS_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error(err)
      setError('PDF export failed.')
    } finally {
      setExporting(null)
    }
  }

  // ── Export Overall Excel ──────────────────────────────────────────────────────
  const exportExcel = async () => {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')

      const totalClassrooms   = schools.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)
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

      function getStatus(pct: number) {
        if (pct >= 100) return { label: 'Complete' }
        if (pct >= 60)  return { label: 'On Track' }
        if (pct >= 20)  return { label: 'In Progress' }
        return           { label: 'Delayed' }
      }

      const summaryWs = XLSX.utils.aoa_to_sheet([
        ['SCHOOL CONSTRUCTION MONITORING SYSTEM'],
        ['Overall Construction Report — Legazpi City, Albay (Region V)'],
        [`Generated: ${new Date().toLocaleDateString('en-PH')}`],
        [],
        ['SUMMARY STATISTICS'],
        ['Metric', 'Value'],
        ['Total Schools', schools.length],
        ['High Priority', highPriority],
        ['Medium Priority', medPriority],
        ['Completed', completed],
        ['On Track', onTrack],
        ['In Progress', inProgress],
        ['Delayed', delayed],
        ['Avg. Construction Progress', `${avgConstruction}%`],
        ['Avg. Materials Delivered', `${avgMaterials}%`],
        ['Total Budget Allocated', totalBudget],
        ['Total Budget Utilized', totalUtilized],
        ['Budget Utilization %', `${budgetUtil}%`],
      ])

      const detailRows = [
        [
          'School Name', 'School ID', 'Municipality', 'Legislative District',
          'Scope', 'Priority', 'Ranking', 'Classrooms', 'Units', 'Stories',
          'Construction %', 'Materials %', 'Status',
          'Budget Allocated (PHP)', 'Budget Utilized (PHP)',
          'Funding Year', 'Completion Date'
        ],
        ...schools.map(s => {
          const status = getStatus(s.construction_progress_pct || 0)
          return [
            s.school_name || '',
            s.school_id || '',
            s.municipality || '',
            s.legislative_district || '',
            s.auto_generated_scope || '',
            s.sdo_priority_level || '',
            s.ranking || '',
            s.proposed_classrooms || 0,
            s.number_of_units || 0,
            s.stories || 0,
            s.construction_progress_pct || 0,
            s.materials_delivered_pct || 0,
            status.label,
            s.budget_allocated_php || 0,
            s.budget_utilized_php || 0,
            s.funding_year || '',
            formatDate(s.completion_date),
          ]
        })
      ]

      const detailWs = XLSX.utils.aoa_to_sheet(detailRows)
      detailWs['!cols'] = [
        { wch: 40 }, { wch: 12 }, { wch: 18 }, { wch: 20 },
        { wch: 12 }, { wch: 10 }, { wch: 8  }, { wch: 12 },
        { wch: 8  }, { wch: 8  }, { wch: 14 }, { wch: 14 },
        { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 16 }
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')
      XLSX.utils.book_append_sheet(wb, detailWs, 'School Details')
      XLSX.writeFile(wb, `SCMS_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      console.error(err)
      setError('Excel export failed.')
    } finally {
      setExporting(null)
    }
  }

  // ── Export Priority PDF ───────────────────────────────────────────────────────
  const exportPriorityPDF = async () => {
    setExporting('pdf')
    try {
      const jsPDF     = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const highPriority      = schools.filter(s => s.sdo_priority_level === 'High').length
      const medPriority       = schools.filter(s => s.sdo_priority_level === 'Medium').length

      doc.setFillColor(26, 58, 107)
      doc.rect(0, 0, 297, 22, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('School Construction Priority Report', 14, 10)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Ranked by SDO Priority Level — Legazpi City, Albay (Region V)', 14, 17)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`, 200, 17)

      // Summary counts
      autoTable(doc, {
        startY: 28,
        body: [
          ['Total Schools', String(schools.length), 'High Priority', String(highPriority), 'Medium Priority', String(medPriority)],
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [100, 116, 139] },
          2: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [100, 116, 139] },
          4: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [100, 116, 139] },
        },
      })

      const afterSummary = (doc as any).lastAutoTable.finalY + 6

      const sorted = [...schools].sort((a, b) => (a.ranking || 99) - (b.ranking || 99))

      autoTable(doc, {
        startY: afterSummary,
        head: [[
          'Rank', 'School Name', 'School ID', 'Municipality', 'Legislative District',
          'Scope', 'Priority', 'Classrooms', 'Units',
          'Construction %', 'Materials %', 'Funding Year', 'Completion Date'
        ]],
        body: sorted.map(s => [
          s.ranking || '—',
          s.school_name || '—',
          s.school_id || '—',
          s.municipality || '—',
          s.legislative_district || '—',
          s.auto_generated_scope || '—',
          s.sdo_priority_level || '—',
          s.proposed_classrooms || 0,
          s.number_of_units || 0,
          `${s.construction_progress_pct || 0}%`,
          `${s.materials_delivered_pct || 0}%`,
          s.funding_year || '—',
          formatDate(s.completion_date),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [26, 58, 107], textColor: 255, fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 1: { cellWidth: 38 } },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 6) {
            const val = data.cell.raw as string
            if (val === 'High')   data.cell.styles.textColor = [192, 57, 43]
            if (val === 'Medium') data.cell.styles.textColor = [180, 117, 0]
            if (val === 'Low')    data.cell.styles.textColor = [39, 174, 96]
          }
        },
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text(`Page ${i} of ${pageCount} — SCMS Legazpi City`, 14, 205)
      }

      doc.save(`SCMS_Priority_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error(err)
      setError('Priority PDF export failed.')
    } finally {
      setExporting(null)
    }
  }

  // ── Export Shortage PDF ───────────────────────────────────────────────────────
  const exportShortagePDF = async () => {
    setExporting('pdf')
    try {
      const jsPDF     = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const totalClassrooms   = schools.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)
      const totalUnits        = schools.reduce((s, x) => s + (x.number_of_units || 0), 0)

      doc.setFillColor(26, 58, 107)
      doc.rect(0, 0, 297, 22, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Classroom Shortage Report', 14, 10)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Existing vs. Proposed Classrooms — Legazpi City, Albay (Region V)', 14, 17)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`, 200, 17)

      // Group by municipality for summary
      const byMunicipality = schools.reduce((acc, s) => {
        const mun = s.municipality || 'Unknown'
        if (!acc[mun]) acc[mun] = { count: 0, proposed: 0 }
        acc[mun].count++
        acc[mun].proposed += s.proposed_classrooms || 0
        return acc
      }, {} as Record<string, { count: number; proposed: number }>)

      doc.setTextColor(30, 41, 59)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('SUMMARY BY MUNICIPALITY', 14, 30)

      autoTable(doc, {
        startY: 33,
        head: [['Municipality', 'Schools', 'Total Proposed Classrooms']],
        body: Object.entries(byMunicipality).map(([mun, v]) => [mun, v.count, v.proposed]),
        theme: 'grid',
        headStyles: { fillColor: [26, 58, 107], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        tableWidth: 100,
      })

      const afterSummary = (doc as any).lastAutoTable.finalY + 6

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('SCHOOL CLASSROOM DETAILS', 14, afterSummary)

      autoTable(doc, {
        startY: afterSummary + 3,
        head: [[
          'School Name', 'School ID', 'Municipality', 'Legislative District',
          'Scope', 'Proposed Classrooms', 'Units', 'Stories',
          'Construction %', 'Priority', 'Funding Year'
        ]],
        body: schools.map(s => [
          s.school_name || '—',
          s.school_id || '—',
          s.municipality || '—',
          s.legislative_district || '—',
          s.auto_generated_scope || '—',
          s.proposed_classrooms || 0,
          s.number_of_units || 0,
          s.stories || 0,
          `${s.construction_progress_pct || 0}%`,
          s.sdo_priority_level || '—',
          s.funding_year || '—',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [26, 58, 107], textColor: 255, fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 42 } },
        foot: [[
          'TOTAL', '', '', '', '',
          String(totalClassrooms), String(totalUnits), '', '', '', ''
        ]],
        footStyles: { fillColor: [26, 58, 107], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text(`Page ${i} of ${pageCount} — SCMS Legazpi City`, 14, 205)
      }

      doc.save(`SCMS_Shortage_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error(err)
      setError('Shortage PDF export failed.')
    } finally {
      setExporting(null)
    }
  }

  // ── Export SYIP Excel ─────────────────────────────────────────────────────────
  const exportSYIPExcel = async () => {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')

      function getStatus(pct: number) {
        if (pct >= 100) return { label: 'Complete' }
        if (pct >= 60)  return { label: 'On Track' }
        if (pct >= 20)  return { label: 'In Progress' }
        return           { label: 'Delayed' }
      }

      // Group schools by funding year
      const byYear = schools.reduce((acc, s) => {
        const fy = s.funding_year ? String(s.funding_year) : 'Unassigned'
        if (!acc[fy]) acc[fy] = []
        acc[fy].push(s)
        return acc
      }, {} as Record<string, School[]>)

      const wb = XLSX.utils.book_new()

      // Overview sheet
      const overviewRows: any[][] = [
        ['SIX-YEAR INFRASTRUCTURE PLAN (SYIP)'],
        ['School Division Office — Legazpi City, Albay (Region V)'],
        [`Generated: ${new Date().toLocaleDateString('en-PH')}`],
        ['Planning Period: FY 2025 – 2030'],
        [],
        ['OVERVIEW BY FISCAL YEAR'],
        ['Fiscal Year', 'No. of Schools', 'Total Classrooms', 'Total Units', 'Priority High', 'Priority Medium', 'Priority Low'],
      ]

      const sortedYears = Object.keys(byYear).sort()
      let grandSchools = 0, grandCL = 0, grandUnits = 0

      for (const fy of sortedYears) {
        const list = byYear[fy]
        const cl    = list.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)
        const units = list.reduce((s, x) => s + (x.number_of_units || 0), 0)
        const high  = list.filter(x => x.sdo_priority_level === 'High').length
        const med   = list.filter(x => x.sdo_priority_level === 'Medium').length
        const low   = list.filter(x => x.sdo_priority_level === 'Low').length
        overviewRows.push([fy, list.length, cl, units, high, med, low])
        grandSchools += list.length
        grandCL += cl
        grandUnits += units
      }

      overviewRows.push([])
      overviewRows.push(['GRAND TOTAL', grandSchools, grandCL, grandUnits, '', '', ''])

      const overviewWs = XLSX.utils.aoa_to_sheet(overviewRows)
      overviewWs['!cols'] = [
        { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 14 },
        { wch: 14 }, { wch: 16 }, { wch: 14 }
      ]
      XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview')

      // One sheet per fiscal year
      for (const fy of sortedYears) {
        const list = byYear[fy]
        const rows: any[][] = [
          [`SYIP — Fiscal Year ${fy}`],
          [`Legazpi City, Albay | ${list.length} school(s) | ${list.reduce((s, x) => s + (x.proposed_classrooms || 0), 0)} classrooms`],
          [],
          [
            'Ranking', 'School Name', 'School ID', 'Municipality', 'Legislative District',
            'Scope', 'Priority', 'Proposed Classrooms', 'Units', 'Stories',
            'Construction %', 'Materials %', 'Status',
            'Budget Allocated (PHP)', 'Budget Utilized (PHP)', 'Completion Date'
          ],
          ...list
            .sort((a, b) => (a.ranking || 99) - (b.ranking || 99))
            .map(s => {
              const status = getStatus(s.construction_progress_pct || 0)
              return [
                s.ranking || '',
                s.school_name || '',
                s.school_id || '',
                s.municipality || '',
                s.legislative_district || '',
                s.auto_generated_scope || '',
                s.sdo_priority_level || '',
                s.proposed_classrooms || 0,
                s.number_of_units || 0,
                s.stories || 0,
                s.construction_progress_pct || 0,
                s.materials_delivered_pct || 0,
                status.label,
                s.budget_allocated_php || 0,
                s.budget_utilized_php || 0,
                formatDate(s.completion_date),
              ]
            }),
          [],
          [
            '', 'TOTALS', '', '', '', '', '',
            list.reduce((s, x) => s + (x.proposed_classrooms || 0), 0),
            list.reduce((s, x) => s + (x.number_of_units || 0), 0),
            '', '', '', '',
            list.reduce((s, x) => s + (x.budget_allocated_php || 0), 0),
            list.reduce((s, x) => s + (x.budget_utilized_php || 0), 0),
            ''
          ]
        ]

        const ws = XLSX.utils.aoa_to_sheet(rows)
        ws['!cols'] = [
          { wch: 8  }, { wch: 40 }, { wch: 12 }, { wch: 18 }, { wch: 20 },
          { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 8  }, { wch: 8  },
          { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 16 }
        ]

        // Sheet name max 31 chars
        const sheetName = `FY ${fy}`.slice(0, 31)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      }

      XLSX.writeFile(wb, `SCMS_SYIP_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      console.error(err)
      setError('SYIP Excel export failed.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <SidebarLayout title="Reports" description="Generate and export construction reports">
      <div className="min-h-screen bg-slate-50/40">
        
        {/* Page Header */}
        {/* <div className="bg-white border-b border-slate-200">
          <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-md bg-[#1a3a6b] flex items-center justify-center">
                  <FileText size={13} className="text-white" />
                </div>
                <h1 className="text-[16px] font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
              </div>
              <p className="text-[12px] text-slate-400 ml-8">Generate comprehensive construction reports for monitoring and planning</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={loadSchools}
                disabled={loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div> */}

        <div className="px-6 py-6">
          {error && <ErrorAlert message={error} />}

          <div className="space-y-6">
            <OverallReportSection
              schools={schools}
              loading={loading}
              exporting={exporting}
              onExportExcel={exportExcel}
              onExportPDF={exportPDF}
              reportRef={reportRef as React.RefObject<HTMLDivElement>}
            />
            <ReportCards
              schools={schools}
              loading={loading}
              exporting={exporting}
              onExportPriority={exportPriorityPDF}
              onExportShortage={exportShortagePDF}
              onExportSYIP={exportSYIPExcel}
            />
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}