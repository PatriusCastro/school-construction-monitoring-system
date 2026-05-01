'use client';

import { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { barOptions, pieOptions } from "@/lib/chart";
import { fetchReports } from "@/lib/api";
import SidebarLayout from "@/components/SidebarLayout";

export default function DataVisualizationPage() {
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setReports(await fetchReports());
    }
    load();
  }, []);

  const classroomLabels = useMemo(() => {
    if (!reports?.planningParameters?.length) return ["School A", "School B", "School C"];
    return reports.planningParameters.map((item: any) => item.name || item.school || "School");
  }, [reports]);

  const classroomData = useMemo(() => {
    if (!reports?.planningParameters?.length) return [12, 9, 15];
    return reports.planningParameters.map((item: any) => item.proposed_classrooms || item.classrooms || 8);
  }, [reports]);

  const priorityLabels = useMemo(() => {
    if (!reports?.schools?.length) return ["High", "Medium", "Low"];
    return ["High", "Medium", "Low"];
  }, [reports]);

  const priorityCounts = useMemo(() => {
    if (!reports?.schools?.length) return [5, 3, 2];
    return [
      reports.schools.filter((school: any) => school.priority === "High").length,
      reports.schools.filter((school: any) => school.priority === "Medium").length,
      reports.schools.filter((school: any) => school.priority === "Low").length,
    ];
  }, [reports]);

  const fundingLabels = useMemo(() => {
    if (!reports?.funding?.length) return ["2025", "2026", "2027"];
    return reports.funding.map((item: any) => item.year || "Year");
  }, [reports]);

  const fundingData = useMemo(() => {
    if (!reports?.funding?.length) return [12000000, 16000000, 9400000];
    return reports.funding.map((item: any) => item.amount || 0);
  }, [reports]);

  return (
    <SidebarLayout title="Data Visualization" description="Charts and analytics for school construction data">
      <div className="p-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Data Visualization</h1>
          <p className="mt-2 text-slate-600">Explore classrooms, priority ranking, and funding distribution across years.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Proposed Classrooms</h2>
            <div className="mt-6">
              <Bar options={barOptions} data={{ labels: classroomLabels, datasets: [{ label: "Classrooms", data: classroomData, backgroundColor: "#2563eb" }] }} />
            </div>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Priority Ranking</h2>
            <div className="mt-6">
              <Pie options={pieOptions} data={{ labels: priorityLabels, datasets: [{ data: priorityCounts, backgroundColor: ["#ef4444", "#f59e0b", "#10b981"] }] }} />
            </div>
          </section>
          <section className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Funding per Year</h2>
            <div className="mt-6">
              <Bar options={barOptions} data={{ labels: fundingLabels, datasets: [{ label: "Funding", data: fundingData, backgroundColor: "#a855f7" }] }} />
            </div>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}
