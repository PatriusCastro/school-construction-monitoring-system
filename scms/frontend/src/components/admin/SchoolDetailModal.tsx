import { useState } from 'react'
import {
  X, MapPin, Building2, DollarSign, Layers,
  Pencil, Map as MapIcon, ZoomIn, ShieldAlert,
} from 'lucide-react'
import type { SchoolFormData } from '@/components/forms/SchoolForm'
import PriorityBadge from './PriorityBadge'
import ProgressBar from './ProgressBar'

interface Props {
  school: SchoolFormData
  onClose: () => void
  onEdit: (s: SchoolFormData) => void
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-[13px] text-slate-800 font-medium">{value}</p>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, iconBg = 'bg-[#0F2444]/8', iconColor = 'text-[#0F2444]' }: {
  icon: React.ElementType; title: string; iconBg?: string; iconColor?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconBg}`}>
        <Icon size={12} className={iconColor} />
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SchoolDetailModal({ school: s, onClose, onEdit }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const budgetUtil = s.budget_allocated_php
    ? Math.round((Number(s.budget_utilized_php) / Number(s.budget_allocated_php)) * 100)
    : 0

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[3px] p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-[15px] font-bold text-slate-900 leading-tight">{s.school_name}</h2>
                <PriorityBadge priority={s.sdo_priority_level as string} />
                {s.auto_generated_scope && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#0F2444]/8 text-[#0F2444]">
                    {s.auto_generated_scope}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-400">
                {[s.school_id && `ID: ${s.school_id}`, s.municipality, s.legislative_district]
                  .filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onEdit(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#0F2444] bg-[#0F2444]/8 rounded-lg hover:bg-[#0F2444]/14 transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* ── Progress strip ── */}
          <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex items-center gap-8 flex-wrap">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Construction Progress</p>
              <ProgressBar pct={Number(s.construction_progress_pct) || 0} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Materials Delivered</p>
              <ProgressBar pct={Number(s.materials_delivered_pct) || 0} />
            </div>
            {s.budget_allocated_php ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Budget Utilization</p>
                <ProgressBar pct={budgetUtil} />
              </div>
            ) : null}
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            {/* Site Development Map — admin-exclusive */}
            <div>
              <SectionHeader icon={MapIcon} title="Site Development Map" iconBg="bg-teal-50" iconColor="text-teal-600" />
              {s.site_map_url ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="relative group cursor-pointer" onClick={() => setLightboxOpen(true)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.site_map_url}
                      alt="Site development map"
                      className="w-full max-h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-[12px] font-medium text-slate-800 shadow">
                        <ZoomIn size={13} /> View Full Size
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <MapIcon size={11} /> Site development map on file
                    </span>
                    <button
                      onClick={() => onEdit(s)}
                      className="text-[11px] text-[#0F2444] font-medium hover:underline"
                    >
                      Replace in Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 px-4 py-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-teal-300 hover:bg-teal-50/40 transition-all"
                  onClick={() => onEdit(s)}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <MapIcon size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-slate-600">No site map uploaded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click to open Edit and upload one</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100" />

            {/* School Info */}
            <div>
              <SectionHeader icon={Building2} title="School Information" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pl-1">
                <Field label="School ID"            value={s.school_id} />
                <Field label="Municipality"         value={s.municipality} />
                <Field label="Legislative District" value={s.legislative_district} />
                <Field label="Funding Year"         value={s.funding_year} />
                <Field label="Workshop Type"        value={s.workshop_type} />
                <Field label="Design Configuration" value={s.design_configuration} />
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Scope & Structure */}
            <div>
              <SectionHeader icon={Layers} title="Scope & Structure" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pl-1">
                <Field label="Existing Classrooms"  value={s.existing_classrooms} />
                <Field label="Proposed Classrooms"  value={s.proposed_classrooms} />
                <Field label="Number of Sites"      value={s.number_of_sites} />
                <Field label="Number of Units"      value={s.number_of_units} />
                <Field label="Stories"              value={s.stories} />
                <Field label="Auto-generated Scope" value={s.auto_generated_scope} />
                <Field label="Old Scope"            value={s.old_scope} />
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Budget & Timeline */}
            <div>
              <SectionHeader icon={DollarSign} title="Budget & Timeline" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pl-1">
                <Field label="Completion Date" value={s.completion_date} />
                <Field
                  label="Budget Allocated"
                  value={s.budget_allocated_php ? `₱${Number(s.budget_allocated_php).toLocaleString()}` : undefined}
                />
                <Field
                  label="Budget Utilized"
                  value={s.budget_utilized_php ? `₱${Number(s.budget_utilized_php).toLocaleString()}` : undefined}
                />
                <Field
                  label="Budget Remaining"
                  value={
                    s.budget_allocated_php && s.budget_utilized_php
                      ? `₱${(Number(s.budget_allocated_php) - Number(s.budget_utilized_php)).toLocaleString()}`
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Priority — admin-exclusive */}
            <div className="border-t border-slate-100" />
            <div>
              <SectionHeader icon={ShieldAlert} title="Priority & Ranking" iconBg="bg-red-50" iconColor="text-red-500" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pl-1">
                <Field label="SDO Priority Level" value={s.sdo_priority_level} />
                <Field label="Ranking"            value={s.ranking} />
              </div>
            </div>

            {/* Coordinates — admin-exclusive */}
            {(s.latitude || s.longitude) && (
              <>
                <div className="border-t border-slate-100" />
                <div>
                  <SectionHeader icon={MapPin} title="GPS Coordinates" iconBg="bg-rose-50" iconColor="text-rose-500" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pl-1">
                    <Field label="Latitude"  value={s.latitude} />
                    <Field label="Longitude" value={s.longitude} />
                  </div>
                </div>
              </>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Click <span className="font-semibold text-slate-600">Edit</span> to modify this record or upload a site map
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && s.site_map_url && (
        <div
          className="fixed inset-0 z-9999 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 flex items-center gap-1.5 text-[12px] text-white/70 hover:text-white transition-colors"
            >
              <X size={15} /> Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.site_map_url}
              alt="Site development map — full view"
              className="w-full rounded-2xl shadow-2xl object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </>
  )
}