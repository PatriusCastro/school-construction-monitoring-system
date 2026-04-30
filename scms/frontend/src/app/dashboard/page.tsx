'use client';

import { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { barOptions, pieOptions } from "@/lib/chart";
import { fetchReports } from "@/lib/api";
import NavBar from "@/components/NavBar";

export default function DashboardPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const schoolProgress = useMemo(() => {
    if (!reports?.schools?.length || !reports?.progress?.length) return [];
    return reports.schools.map((school: any) => {
      const progress = reports.progress.find((entry: any) => entry.school_id === school.id);
      return {
        name: school.name,
        progress: progress?.construction_progress ?? 0,
        status: school.project_status || "Planned",
      };
    });
  }, [reports]);

  const barData = useMemo(() => ({
    labels: schoolProgress.map((item: any) => item.name),
    datasets: [
      {
        label: "Construction Progress",
        data: schoolProgress.map((item: any) => item.progress),
        backgroundColor: "rgba(14, 165, 233, 0.75)",
      },
    ],
  }), [schoolProgress]);

  const pieData = useMemo(() => ({
    labels: Object.keys(reports?.statusSummary || {}),
    datasets: [
      {
        data: Object.values(reports?.statusSummary || {}),
        backgroundColor: ["#2563eb", "#f97316", "#10b981", "#a855f7", "#e11d48"],
      },
    ],
  }), [reports]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Project status overview</h1>
            </div>
            <p className="max-w-xl text-slate-600">
              Live insights for school construction projects, funding, and site planning.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Total schools</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{reports?.schools?.length ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Active projects</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{schoolProgress.filter((item: any) => item.progress < 100).length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Average completion</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{reports?.averageProgress || 0}%</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 p-5">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Construction progress</h2>
                {loading ? (
                  <p className="text-slate-500">Loading charts…</p>
                ) : (
                  <Bar options={barOptions} data={barData} />
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 p-5">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Status distribution</h2>
                {loading ? (
                  <p className="text-slate-500">Loading charts…</p>
                ) : (
                  <Pie options={pieOptions} data={pieData} />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">School list</p>
                <h2 className="text-2xl font-semibold text-slate-950">Project summary</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800">Updated live</span>
            </div>
            {error ? (
              <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3">School</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {(reports?.schools || []).map((school: any) => {
                      const progress = reports?.progress?.find((entry: any) => entry.school_id === school.id);
                      return (
                        <tr key={school.id}>
                          <td className="px-4 py-4 font-medium text-slate-900">{school.name || school.title || "Unnamed school"}</td>
                          <td className="px-4 py-4 text-slate-600">{school.project_status || "Planned"}</td>
                          <td className="px-4 py-4 text-slate-600">{progress?.construction_progress ?? 0}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
