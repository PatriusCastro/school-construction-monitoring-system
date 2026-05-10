import { Pencil, Trash2 } from 'lucide-react'
import type { SchoolFormData } from '@/components/forms/SchoolForm'
import PriorityBadge from './PriorityBadge'
import ProgressBar from './ProgressBar'

interface Props {
  school: SchoolFormData
  index: number
  deleteConfirm: string | number | null
  onView: (s: SchoolFormData) => void
  onEdit: (s: SchoolFormData) => void
  onDeleteRequest: (id: string | number) => void
  onDeleteConfirm: (id: string | number) => void
  onDeleteCancel: () => void
}

export default function SchoolRow({
  school: s,
  index,
  deleteConfirm,
  onView,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: Props) {
  const rowId = s.id ?? index
  const isDeleting = deleteConfirm === rowId

  return (
    <li
      className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group cursor-pointer ${
        isDeleting ? 'bg-red-50/40' : ''
      }`}
      onClick={() => !isDeleting && onView(s)}
    >
      {/* Rank */}
      <div className="w-8 shrink-0 text-center select-none">
        <span className="text-[12px] font-bold text-slate-300 tabular-nums">#{index + 1}</span>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[13.5px] font-semibold text-slate-800 leading-tight">{s.school_name}</span>
          <PriorityBadge priority={s.sdo_priority_level as string} />
        </div>
        <div className="flex items-center gap-0 text-[11px] text-slate-400 flex-wrap">
          {s.school_id && <span className="font-mono mr-2">ID: {s.school_id}</span>}
          {[
            s.municipality,
            s.legislative_district,
            s.auto_generated_scope ? `${s.existing_classrooms ?? 0} CL · ${s.auto_generated_scope}` : null,
            s.funding_year ? `FY ${s.funding_year}` : null,
          ]
            .filter(Boolean)
            .map((meta, i) => (
              <span key={i} className="flex items-center">
                {(i > 0 || s.school_id) ? <span className="mx-1.5 text-slate-200">·</span> : null}
                <span>{meta}</span>
              </span>
            ))}
        </div>
      </div>

      {/* Progress + budget */}
      <div className="shrink-0 hidden sm:flex flex-col items-end gap-1.5">
        <ProgressBar pct={Number(s.construction_progress_pct) || 0} />
        {s.budget_allocated_php ? (
          <span className="text-[10.5px] text-slate-400 tabular-nums">
            ₱{Number(s.budget_allocated_php).toLocaleString()}
          </span>
        ) : null}
      </div>

      {/* Action buttons — stop propagation so they don't trigger onView */}
      <div
        className="shrink-0 flex items-center gap-1 pl-2"
        onClick={e => e.stopPropagation()}
      >
        {isDeleting ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-red-600 font-semibold mr-0.5">Delete?</span>
            <button
              onClick={() => onDeleteConfirm(s.id!)}
              className="px-3 py-1.5 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Yes, delete
            </button>
            <button
              onClick={onDeleteCancel}
              className="px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit(s)}
              title="Edit school"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/8 transition-all"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDeleteRequest(rowId)}
              title="Delete school"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </li>
  )
}