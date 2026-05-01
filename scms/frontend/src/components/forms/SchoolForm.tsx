'use client'

import { useEffect, useState } from 'react'
import { Building2, HardHat, BarChart3, MapPin, X, Check, Loader2 } from 'lucide-react'
import { generateScope } from '../../utils/scopeGenerator'

export interface SchoolFormData {
  [key: string]: unknown
  id?: string | number
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
  funding_year: number | ''
  construction_progress_pct: number
  sdo_priority_level: string
  ranking: number | '' 
  materials_delivered_pct: number
  budget_allocated_php: number
  budget_utilized_php: number
  completion_date: string
  latitude: number | ''
  longitude: number | ''
}

interface FieldError {
  school_name?: string
  municipality?: string
  funding_year?: string
  proposed_classrooms?: string
  stories?: string
}

interface SchoolFormProps {
  school: SchoolFormData
  editingId: string | number | null
  isSubmitting?: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  setSchool: (school: SchoolFormData) => void
}

const DISTRICTS = ['1st District', '2nd District', '3rd District']
const WORKSHOP_TYPES = ['Shop A', 'Shop B', 'Shop C']
const DESIGN_CONFIGS = ['Config-1', 'Config-2', 'Config-3', 'Config-4']
const FUNDING_YEARS = [2026, 2027, 2028, 2029]

export default function SchoolForm({
  school, editingId, isSubmitting = false, onSubmit, onCancel, setSchool,
}: SchoolFormProps) {
  const [errors, setErrors] = useState<FieldError>({})
  const [touched, setTouched] = useState<Partial<Record<keyof SchoolFormData, boolean>>>({})

  // Auto-generate scope when stories or classrooms change
  useEffect(() => {
    const scope = generateScope(school.stories, school.proposed_classrooms)
    setSchool({ ...school, auto_generated_scope: scope })
  }, [school.stories, school.proposed_classrooms])

  const validate = (): boolean => {
    const newErrors: FieldError = {}
    if (!school.school_name.trim()) newErrors.school_name = 'School name is required'
    if (!school.municipality.trim()) newErrors.municipality = 'Municipality is required'
    if (!school.funding_year) newErrors.funding_year = 'Funding year is required'
    if (!school.proposed_classrooms || school.proposed_classrooms < 1)
      newErrors.proposed_classrooms = 'At least 1 classroom required'
    if (!school.stories || school.stories < 1)
      newErrors.stories = 'At least 1 story required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ school_name: true, municipality: true, funding_year: true, proposed_classrooms: true, stories: true })
    if (validate()) onSubmit(e)
  }

  const handleBlur = (field: keyof SchoolFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validate()
  }

  const set = <K extends keyof SchoolFormData>(key: K, value: SchoolFormData[K]) =>
    setSchool({ ...school, [key]: value })

  return (
    <section className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-[#1a3a6b] to-[#1e4a8a] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-white text-[15px] font-semibold">
              {editingId ? 'Edit School Record' : 'Add New School'}
            </h2>
            <p className="text-white/60 text-[11px] mt-0.5">
              Fields marked <span className="text-[#c8a800]">*</span> are required
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <X size={14} className="text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8" noValidate>

        {/* School Information */}
        <Section icon={<Building2 size={14} className="text-blue-700" />} label="School Information" color="bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="School ID" hint="Unique DepEd identifier">
              <Input value={school.school_id} onChange={v => set('school_id', v)} placeholder="e.g. 301816" />
            </Field>
            <div className="md:col-span-2">
              <Field label="School Name" required error={touched.school_name ? errors.school_name : undefined}>
                <Input
                  value={school.school_name}
                  onChange={v => set('school_name', v)}
                  placeholder="Full official school name"
                  onBlur={() => handleBlur('school_name')}
                  hasError={!!(touched.school_name && errors.school_name)}
                />
              </Field>
            </div>
            <Field label="Municipality" required error={touched.municipality ? errors.municipality : undefined}>
              <Input
                value={school.municipality}
                onChange={v => set('municipality', v)}
                placeholder="e.g. Legazpi City"
                onBlur={() => handleBlur('municipality')}
                hasError={!!(touched.municipality && errors.municipality)}
              />
            </Field>
            <Field label="Legislative District">
              <Select value={school.legislative_district} onChange={v => set('legislative_district', v)} options={DISTRICTS} placeholder="Select district" />
            </Field>
            <Field label="Funding Year" required error={touched.funding_year ? errors.funding_year : undefined}>
              <Select
                value={school.funding_year ? String(school.funding_year) : ''}
                onChange={v => set('funding_year', parseInt(v, 10) as SchoolFormData['funding_year'])}
                options={FUNDING_YEARS.map(String)}
                placeholder="Select year"
                hasError={!!(touched.funding_year && errors.funding_year)}
                onBlur={() => handleBlur('funding_year')}
              />
            </Field>
            <Field label="Number of Sites">
              <NumberInput value={school.number_of_sites} onChange={v => set('number_of_sites', v)} min={1} />
            </Field>
            <Field label="Existing Classrooms">
              <NumberInput value={school.existing_classrooms} onChange={v => set('existing_classrooms', v)} min={0} />
            </Field>
          </div>
        </Section>

        {/* Construction Details */}
        <Section icon={<HardHat size={14} className="text-amber-700" />} label="Construction Details" color="bg-amber-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Proposed Classrooms (CL)" required error={touched.proposed_classrooms ? errors.proposed_classrooms : undefined}>
              <NumberInput
                value={school.proposed_classrooms}
                onChange={v => set('proposed_classrooms', v)}
                min={1}
                hasError={!!(touched.proposed_classrooms && errors.proposed_classrooms)}
                onBlur={() => handleBlur('proposed_classrooms')}
              />
            </Field>
            <Field label="Stories (STY)" required error={touched.stories ? errors.stories : undefined}>
              <NumberInput
                value={school.stories}
                onChange={v => set('stories', v)}
                min={1} max={4}
                hasError={!!(touched.stories && errors.stories)}
                onBlur={() => handleBlur('stories')}
              />
            </Field>
            <Field label="Number of Units">
              <NumberInput value={school.number_of_units} onChange={v => set('number_of_units', v)} min={1} />
            </Field>

            {/* Auto scope */}
            <Field label="Auto-generated Scope" hint="Computed from stories × classrooms">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-[#1a3a6b] rounded-xl">
                <span className="font-mono text-[13px] font-semibold text-[#1a3a6b] tracking-wider">
                  {school.auto_generated_scope || '—'}
                </span>
              </div>
            </Field>
            <Field label="Old Scope">
              <Input value={school.old_scope} onChange={v => set('old_scope', v)} placeholder="Previous scope code" />
            </Field>
            <Field label="Workshop Type">
              <Select value={school.workshop_type} onChange={v => set('workshop_type', v)} options={WORKSHOP_TYPES} placeholder="Select type" />
            </Field>
            <Field label="Design Configuration">
              <Select value={school.design_configuration} onChange={v => set('design_configuration', v)} options={DESIGN_CONFIGS} placeholder="Select config" />
            </Field>
            <Field label="Completion Date">
              <Input type="date" value={school.completion_date} onChange={v => set('completion_date', v)} />
            </Field>
          </div>
        </Section>

        {/* Priority & Ranking */}
        <Section icon={<BarChart3 size={14} className="text-purple-700" />} label="Priority & Ranking" color="bg-purple-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="SDO Priority Level">
              <Select
                value={school.sdo_priority_level}
                onChange={v => set('sdo_priority_level', v)}
                options={['High', 'Medium', 'Low']}
                placeholder="Select priority"
              />
            </Field>
            <Field label="Ranking">
              <NumberInput
                value={school.ranking}
                onChange={v => set('ranking', v)}
                min={1}
              />
            </Field>
          </div>
        </Section>

        {/* Progress & Budget */}
        <Section icon={<BarChart3 size={14} className="text-green-700" />} label="Progress & Budget" color="bg-green-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressSlider
              label="Construction Progress"
              value={school.construction_progress_pct}
              onChange={v => set('construction_progress_pct', v)}
              color="#1a3a6b"
            />
            <ProgressSlider
              label="Materials Delivered"
              value={school.materials_delivered_pct}
              onChange={v => set('materials_delivered_pct', v)}
              color="#c8a800"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="Budget Allocated (PHP)">
              <Input type="number" value={school.budget_allocated_php ? String(school.budget_allocated_php) : ''} onChange={v => set('budget_allocated_php', parseFloat(v) || 0)} placeholder="e.g. 5000000" />
            </Field>
            <Field label="Budget Utilized (PHP)">
              <Input type="number" value={school.budget_utilized_php ? String(school.budget_utilized_php) : ''} onChange={v => set('budget_utilized_php', parseFloat(v) || 0)} placeholder="e.g. 2500000" />
            </Field>
          </div>
        </Section>

        {/* Map Coordinates */}
        <Section icon={<MapPin size={14} className="text-red-700" />} label="Map Coordinates" color="bg-red-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Latitude" hint="Legazpi City ≈ 13.1391">
              <Input type="number" value={school.latitude ? String(school.latitude) : ''} onChange={v => set('latitude', parseFloat(v) || '')} placeholder="e.g. 13.1391" step="0.0001" />
            </Field>
            <Field label="Longitude" hint="Legazpi City ≈ 123.7438">
              <Input type="number" value={school.longitude ? String(school.longitude) : ''} onChange={v => set('longitude', parseFloat(v) || '')} placeholder="e.g. 123.7438" step="0.0001" />
            </Field>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <MapPin size={11} /> Used to render this school as a pin on the School Map page.
          </p>
        </Section>

        {/* Footer buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] px-5 py-3 text-[13px] font-medium text-white hover:bg-[#163260] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
              <><Check size={14} /> {editingId ? 'Update School' : 'Add School'}</>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

// Sub-components

function Section({ icon, label, color, children }: {
  icon: React.ReactNode; label: string; color: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-6 h-6 ${color} rounded-md flex items-center justify-center`}>{icon}</div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </div>
  )
}

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-slate-500">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {error && <span className="text-[10px] text-red-500">{error}</span>}
      {hint && !error && <span className="text-[10px] text-slate-400">{hint}</span>}
    </label>
  )
}

function Input({ value, onChange, placeholder, type = 'text', onBlur, hasError, step }: {
  value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; onBlur?: () => void; hasError?: boolean; step?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      step={step}
      className={`w-full rounded-xl border px-3 py-2.5 text-[13px] text-slate-800 bg-white outline-none transition-all
        focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10
        ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
    />
  )
}

function NumberInput({ value, onChange, min, max, hasError, onBlur }: {
  value: number | ''; onChange: (v: number) => void
  min?: number; max?: number; hasError?: boolean; onBlur?: () => void
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
      onBlur={onBlur}
      min={min}
      max={max}
      className={`w-full rounded-xl border px-3 py-2.5 text-[13px] text-slate-800 bg-white outline-none transition-all
        focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10
        ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
    />
  )
}

function Select({ value, onChange, options, placeholder, hasError, onBlur }: {
  value: string; onChange: (v: string) => void; options: string[]
  placeholder?: string; hasError?: boolean; onBlur?: () => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      className={`w-full rounded-xl border px-3 py-2.5 text-[13px] text-slate-800 bg-white outline-none transition-all
        focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10
        ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function ProgressSlider({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <span className="font-mono text-[13px] font-semibold" style={{ color }}>{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1.5 rounded-full outline-none cursor-pointer accent-[#1a3a6b]"
      />
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-200" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}