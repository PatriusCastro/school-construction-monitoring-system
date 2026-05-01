'use client';

import { useEffect, useMemo, useState } from "react";
import { fetchReports, postProgress } from "@/lib/api";
import SidebarLayout from "@/components/layout/SidebarLayout";

export default function ProgressMonitoringPage() {
  const [reports, setReports] = useState<any>(null);
  const [form, setForm] = useState({ schoolId: "", construction: "", materials: "", completion: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setReports(await fetchReports());
      } catch (err) {
        setError((err as Error).message);
      }
    }
    load();
  }, []);

  const progressRows = useMemo(() => {
    return reports?.progress?.map((entry: any) => {
      const school = reports?.schools?.find((school: any) => school.id === entry.school_id);
      return {
        id: entry.id,
        school: school?.name || "Unnamed school",
        progress: entry.construction_progress ?? 0,
        materials: entry.materials_delivered ?? 0,
        completionDate: entry.completion_date || "TBD",
      };
    }) || [];
  }, [reports]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await postProgress({
        school_id: Number(form.schoolId),
        construction_progress: Number(form.construction),
        materials_delivered: Number(form.materials),
        completion_date: form.completion,
      });
      setMessage("Progress update saved successfully.");
      setForm({ schoolId: "", construction: "", materials: "", completion: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <SidebarLayout title="Progress Monitoring" description="Track construction progress and material delivery">
      <div className="p-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Progress Monitoring</h1>
          <p className="mt-2 text-slate-600">Record construction progress, material delivery, and completion dates per school.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Progress summary</h2>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4">School</th>
                    <th className="px-4 py-4">Construction %</th>
                    <th className="px-4 py-4">Materials %</th>
                    <th className="px-4 py-4">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {progressRows.length ? (
                    progressRows.map((row: any) => (
                      <tr key={row.id}>
                        <td className="px-4 py-4 font-medium text-slate-900">{row.school}</td>
                        <td className="px-4 py-4 text-slate-600">{row.progress}%</td>
                        <td className="px-4 py-4 text-slate-600">{row.materials}%</td>
                        <td className="px-4 py-4 text-slate-600">{row.completionDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-slate-600">
                        No progress records found. Add a progress update using the form.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Add progress update</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
              {message ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

              <label className="block text-sm font-medium text-slate-700">
                School
                <select
                  value={form.schoolId}
                  onChange={(event) => setForm({ ...form, schoolId: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="">Select a school</option>
                  {reports?.schools?.map((school: any) => (
                    <option key={school.id} value={school.id}>{school.name || school.title}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Construction progress (%)
                <input
                  type="number"
                  value={form.construction}
                  onChange={(event) => setForm({ ...form, construction: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Materials delivered (%)
                <input
                  type="number"
                  value={form.materials}
                  onChange={(event) => setForm({ ...form, materials: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Expected completion date
                <input
                  type="date"
                  value={form.completion}
                  onChange={(event) => setForm({ ...form, completion: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>

              <button className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save progress update
              </button>
            </form>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}
