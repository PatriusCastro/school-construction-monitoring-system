'use client';

import { useEffect, useState } from "react";
import { fetchReports } from "@/lib/api";
import NavBar from "@/components/NavBar";

export default function ConstructionDataPage() {
  const [reports, setReports] = useState<any>(null);
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

  const rows = reports?.constructionData?.length ? reports.constructionData : reports?.schools?.map((school: any) => ({
    id: school.id,
    name: school.name || school.title,
    budget: school.estimated_budget || school.budget || "TBD",
    timeline: school.timeline || `${school.start_date || "TBD"} — ${school.end_date || "TBD"}`,
    contractor: school.contractor || "TBD",
    progress: school.project_status || "Planned",
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Construction Data</h1>
          <p className="mt-2 text-slate-600">A complete view of construction metrics, timeline, financing, and school-specific parameters.</p>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          {error ? (
            <div className="rounded-3xl bg-rose-50 p-4 text-rose-700">{error}</div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4">School</th>
                    <th className="px-4 py-4">Budget</th>
                    <th className="px-4 py-4">Timeline</th>
                    <th className="px-4 py-4">Contractor</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {rows.map((row: any) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">{row.name}</td>
                      <td className="px-4 py-4 text-slate-600">{row.budget}</td>
                      <td className="px-4 py-4 text-slate-600">{row.timeline}</td>
                      <td className="px-4 py-4 text-slate-600">{row.contractor}</td>
                      <td className="px-4 py-4 text-slate-600">{row.progress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
