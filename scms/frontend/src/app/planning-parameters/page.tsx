'use client';

import { useMemo, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";

export default function PlanningParametersPage() {
  const [students, setStudents] = useState(450);
  const [classSize, setClassSize] = useState(30);
  const [siteArea, setSiteArea] = useState(2400);
  const [budgetPerSqm, setBudgetPerSqm] = useState(1200);

  const results = useMemo(() => {
    const classrooms = Math.ceil(students / classSize);
    const estimatedArea = classrooms * 50;
    const budgetEstimate = estimatedArea * budgetPerSqm;
    const staffing = Math.ceil(classrooms * 1.8);
    return { classrooms, estimatedArea, budgetEstimate, staffing };
  }, [students, classSize, siteArea, budgetPerSqm]);

  return (
    <SidebarLayout title="Planning Parameters" description="Automated planning calculator for school construction">
      <div className="p-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Planning Parameters</h1>
          <p className="mt-2 text-slate-600">Automated calculators for classrooms, area requirements, budget needs, and staffing.</p>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4 rounded-3xl border border-slate-200 p-6">
              <label className="block text-sm font-medium text-slate-700">
                Expected student enrollment
                <input
                  type="number"
                  value={students}
                  onChange={(event) => setStudents(Number(event.target.value))}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Classroom capacity
                <input
                  type="number"
                  value={classSize}
                  onChange={(event) => setClassSize(Number(event.target.value))}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Site area estimate (sqm)
                <input
                  type="number"
                  value={siteArea}
                  onChange={(event) => setSiteArea(Number(event.target.value))}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Budget per sqm
                <input
                  type="number"
                  value={budgetPerSqm}
                  onChange={(event) => setBudgetPerSqm(Number(event.target.value))}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Calculated parameters</h2>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Classrooms needed</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{results.classrooms}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Estimated area</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{results.estimatedArea} sqm</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Budget estimate</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">₱{results.budgetEstimate.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Staffing need</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{results.staffing} teachers</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SidebarLayout>
  );
}
