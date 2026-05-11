'use client'

import { useState } from 'react'
import {
  Calculator, BookOpen, FlaskConical, Monitor,
  Library, Droplets, HandMetal, UtensilsCrossed,
  BriefcaseBusiness, HeartHandshake, Trophy,
  ChevronRight, Building2, Users, Layers
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'

type SchoolLevel = 'kindergarten' | 'grade1_3' | 'grade4_6' | 'grade7_10' | 'grade11_12' | 'combined'

interface LevelConfig {
  label: string
  cmax: number
  factor: number
  description: string
}

interface CalcResult {
  cReq: number
  cSurplus: number
  additionalNeeded: number
  tReq: number
  labSci: number
  toilets: number
  handwash: number
  status: 'surplus' | 'deficit' | 'exact'
}

const LEVEL_CONFIG: Record<SchoolLevel, LevelConfig> = {
  kindergarten: { label: 'Kindergarten',        cmax: 30, factor: 1.0, description: 'Max 30 learners/class' },
  grade1_3:     { label: 'Elementary (Gr 1–3)',  cmax: 35, factor: 1.0, description: 'Max 35 learners/class' },
  grade4_6:     { label: 'Elementary (Gr 4–6)',  cmax: 40, factor: 1.0, description: 'Max 40 learners/class' },
  grade7_10:    { label: 'Junior High (Gr 7–10)',cmax: 50, factor: 1.2, description: 'Max 50 learners/class' },
  grade11_12:   { label: 'Senior High (Gr 11–12)',cmax: 40, factor: 1.5, description: 'Max 40 learners/class' },
  combined:     { label: 'Combined K–12',         cmax: 40, factor: 1.2, description: 'Max 40 learners/class' },
}

const CLASSROOM_STANDARDS = [
  { grade: 'Kindergarten',      learners: '25 – 30 learners', color: 'bg-amber-100 text-amber-800' },
  { grade: 'Grade 1 – 3',       learners: '30 – 35 learners', color: 'bg-amber-100 text-amber-800' },
  { grade: 'Grade 4 – 6',       learners: '40 learners',      color: 'bg-amber-100 text-amber-800' },
  { grade: 'Grade 7 – 10 (JHS)',learners: '45 – 50 learners', color: 'bg-amber-100 text-amber-800' },
  { grade: 'Grade 11 – 12 (SHS)',learners: '40 learners',     color: 'bg-amber-100 text-amber-800' },
]

const TEACHER_STANDARDS = [
  { grade: 'Kindergarten', ratio: '1 teacher per class',   factor: '×1',   factorColor: 'text-slate-700', note: 'Dedicated homeroom teacher' },
  { grade: 'Grade 1 – 6',  ratio: '1 teacher per class',   factor: '×1',   factorColor: 'text-slate-700', note: 'Standard ratio' },
  { grade: 'Grade 7 – 10', ratio: '1 teacher per subject', factor: '×1.2', factorColor: 'text-amber-600', note: 'Specialization factor' },
  { grade: 'Grade 11 – 12',ratio: '1 teacher per subject', factor: '×1.5', factorColor: 'text-amber-600', note: 'Higher specialization factor' },
]

const INFRA_STANDARDS = [
  { facility: 'Science Laboratory', requirement: '1 per 6 classrooms', formula: 'Lab = ⌈C_req ÷ 6⌉',     icon: FlaskConical },
  { facility: 'Computer Laboratory', requirement: '1 per school',       formula: 'Min. 30 computers',      icon: Monitor },
  { facility: 'Library',             requirement: '1 per school',       formula: 'Fixed requirement',      icon: Library },
  { facility: 'Toilet Units',        requirement: '1 per 50 students',  formula: 'Toilet = ⌈E ÷ 50⌉',    icon: Droplets },
  { facility: 'Handwashing Facility',requirement: '1 per 100 students', formula: 'Wash = ⌈E ÷ 100⌉',     icon: HandMetal },
  { facility: 'Canteen / Feeding',   requirement: '1 per school',       formula: 'Fixed requirement',      icon: UtensilsCrossed },
  { facility: "Principal's Office",  requirement: '1 per school',       formula: 'Fixed requirement',      icon: BriefcaseBusiness },
  { facility: 'Guidance Office',     requirement: '1 per school',       formula: 'Fixed requirement',      icon: HeartHandshake },
  { facility: 'Sports Facility',     requirement: '1 court per school', formula: 'Fixed requirement',      icon: Trophy },
]

function calculate(enrollment: number, existing: number, level: SchoolLevel): CalcResult {
  const { cmax, factor } = LEVEL_CONFIG[level]
  const cReq = Math.ceil(enrollment / cmax)
  const cSurplus = existing - cReq
  const additionalNeeded = cSurplus < 0 ? Math.abs(cSurplus) : 0
  const tReq = Math.ceil(cReq * factor)
  const labSci = Math.ceil(cReq / 6)
  const toilets = Math.ceil(enrollment / 50)
  const handwash = Math.ceil(enrollment / 100)
  const status = cSurplus > 0 ? 'surplus' : cSurplus < 0 ? 'deficit' : 'exact'
  return { cReq, cSurplus, additionalNeeded, tReq, labSci, toilets, handwash, status }
}

export default function PlanningParameters() {
  const [level, setLevel] = useState<SchoolLevel>('grade1_3')
  const [enrollment, setEnrollment] = useState<number>(100)
  const [existing, setExisting] = useState<number>(6)
  const [result, setResult] = useState<CalcResult | null>(null)

  const handleCalculate = () => {
    if (!enrollment || enrollment < 1) return
    setResult(calculate(enrollment, existing, level))
  }

  return (
    <SidebarLayout title="Planning Parameters" description="DepEd standards and calculator">
      <div className="min-h-screen bg-white">
        <div className="px-6 py-6 space-y-5">

          {/* ── Automated Planning Calculator ── */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">

            {/* Calculator header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator size={15} className="text-[#0F2444]" />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Automated Planning Calculator</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Compute required classrooms, teachers & facilities based on enrollment</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="p-6 border-b border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">School Level</label>
                  <select
                    value={level}
                    onChange={e => { setLevel(e.target.value as SchoolLevel); setResult(null) }}
                    className="w-full px-3 py-2.5 text-[13px] border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-[#0F2444] focus:ring-1 focus:ring-[#0F2444]/20 cursor-pointer"
                  >
                    {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">{LEVEL_CONFIG[level].description}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Total Enrollment</label>
                  <input
                    type="number" value={enrollment} min={1}
                    onChange={e => { setEnrollment(parseInt(e.target.value) || 0); setResult(null) }}
                    className="w-full px-3 py-2.5 text-[13px] border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-[#0F2444] focus:ring-1 focus:ring-[#0F2444]/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Number of learners enrolled</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Existing Classrooms</label>
                  <input
                    type="number" value={existing} min={0}
                    onChange={e => { setExisting(parseInt(e.target.value) || 0); setResult(null) }}
                    className="w-full px-3 py-2.5 text-[13px] border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-[#0F2444] focus:ring-1 focus:ring-[#0F2444]/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Currently operational classrooms</p>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0F2444] hover:bg-[#0a1a2e] text-white text-[13px] font-semibold rounded-lg transition-colors"
              >
                <Calculator size={14} />
                Calculate Requirements
                <ChevronRight size={14} />
              </button>
            </div>

            {/* ── Results ── */}
            {result && (
              <div className="p-6 space-y-5">
                <h3 className="text-[14px] font-semibold text-slate-800">Calculation Results</h3>

                {/* Primary 4 result cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <ResultCard
                    value={result.cReq}
                    label="Required Classrooms"
                    sub={`Based on ${enrollment} enrollees ÷ ${LEVEL_CONFIG[level].cmax}`}
                    highlight={false}
                  />
                  <ResultCard
                    value={result.cSurplus}
                    label="Classroom Surplus"
                    sub="Existing supply is sufficient"
                    highlight={false}
                    valueColor={result.cSurplus >= 0 ? 'text-slate-800' : 'text-red-600'}
                  />
                  <ResultCard
                    value={result.tReq}
                    label="Required Teachers"
                    sub={`Factor: ×${LEVEL_CONFIG[level].factor}`}
                    highlight={true}
                    highlightColor="bg-amber-50 border-amber-200"
                    valueColor="text-amber-600"
                  />
                  <ResultCard
                    value={result.labSci}
                    label="Science Labs Needed"
                    sub="1 lab per 6 classes"
                    highlight={false}
                  />
                </div>

                {/* Secondary 4 result cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <ResultCard
                    value={result.toilets}
                    label="Toilet Units"
                    sub="Boys + Girls (1 per 50)"
                    highlight={false}
                  />
                  <ResultCard
                    value={result.handwash}
                    label="Handwashing Facilities"
                    sub="1 per 100 students"
                    highlight={false}
                  />
                  <ResultCard
                    value={1}
                    label="Computer Labs"
                    sub="Min. 30 units"
                    highlight={false}
                  />
                  <ResultCard
                    value={1}
                    label="Library"
                    sub="Per school requirement"
                    highlight={false}
                  />
                </div>

                {/* Building recommendation */}
                <div className={`flex items-start gap-3 px-5 py-4 rounded-xl border ${
                  result.status === 'surplus' || result.status === 'exact'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <Building2 size={18} className={result.status === 'deficit' ? 'text-red-500 shrink-0 mt-0.5' : 'text-green-500 shrink-0 mt-0.5'} />
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 mb-0.5">Recommended Building</p>
                    {result.status === 'surplus' || result.status === 'exact' ? (
                      <>
                        <p className="text-[14px] font-bold text-green-600">No additional building needed</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Existing classrooms meet demand</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[14px] font-bold text-red-600">
                          Build {result.additionalNeeded} additional classroom{result.additionalNeeded > 1 ? 's' : ''}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          C_req ({result.cReq}) − C_existing ({existing}) = {result.additionalNeeded} needed
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Classroom Standards Table ── */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <BookOpen size={14} className="text-slate-600" />
              <h2 className="text-[13px] font-semibold text-slate-900">Classroom Standards (Learner-Classroom Ratio)</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Grade Level', 'Learners per Classroom', 'Classrooms per Section', 'Note'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {CLASSROOM_STANDARDS.map(row => (
                  <tr key={row.grade} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800">{row.grade}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[12px] font-semibold px-3 py-1 rounded-md ${row.color}`}>
                        {row.learners}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-700">1</td>
                    <td className="px-5 py-3.5 text-[12px] text-slate-400">Per section</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Teacher Requirements Table ── */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <Users size={14} className="text-slate-600" />
              <h2 className="text-[13px] font-semibold text-slate-900">Teacher Requirements (Teacher Ratio)</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Grade Level', 'Teacher Ratio', 'Specialization Factor', 'Note'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TEACHER_STANDARDS.map(row => (
                  <tr key={row.grade} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800">{row.grade}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600">{row.ratio}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] font-bold ${row.factorColor}`}>{row.factor}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-slate-400">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Infrastructure Standards ── */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <Layers size={14} className="text-slate-600" />
              <h2 className="text-[13px] font-semibold text-slate-900">Infrastructure Standards & Facility Requirements</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Facility', 'Requirement', 'Formula / Note'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {INFRA_STANDARDS.map(row => {
                  const Icon = row.icon
                  return (
                    <tr key={row.facility} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                            <Icon size={12} className="text-[#0F2444]" />
                          </div>
                          <span className="text-[13px] font-medium text-slate-800">{row.facility}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-600">{row.requirement}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] text-[#0F2444] bg-blue-50 px-2 py-0.5 rounded-md">{row.formula}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </SidebarLayout>
  )
}

function ResultCard({
  value, label, sub, highlight, highlightColor, valueColor
}: {
  value: number
  label: string
  sub: string
  highlight: boolean
  highlightColor?: string
  valueColor?: string
}) {
  return (
    <div className={`rounded-xl border px-4 py-4 ${highlight ? highlightColor ?? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
      <p className={`text-[28px] font-bold leading-none mb-1 ${valueColor ?? 'text-slate-800'}`}>{value}</p>
      <p className="text-[12px] font-medium text-slate-700 mb-0.5">{label}</p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  )
}