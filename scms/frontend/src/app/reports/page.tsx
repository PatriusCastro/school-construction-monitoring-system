'use client';

import { useEffect, useState } from "react";
import { fetchReportSummary } from "@/lib/api";
import NavBar from "@/components/NavBar";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setReports(await fetchReportSummary());
    }
    load();
  }, []);

  const exportPdf = async () => {
    if (!reports) return;
    const reportElement = document.getElementById("report-card");
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, { scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
    pdf.save("construction-overview.pdf");
    setMessage("PDF exported successfully.");
  };

  const exportXlsx = () => {
    if (!reports) return;
    const workbook = XLSX.utils.book_new();
    const schoolSheet = XLSX.utils.json_to_sheet(reports.schools || []);
    const progressSheet = XLSX.utils.json_to_sheet(reports.progress || []);
    XLSX.utils.book_append_sheet(workbook, schoolSheet, "Schools");
    XLSX.utils.book_append_sheet(workbook, progressSheet, "Progress");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "construction-report.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("XLSX exported successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Reports</h1>
          <p className="mt-2 text-slate-600">Generate exportable PDF and XLSX reports from the latest school construction data.</p>
        </div>

        <section id="report-card" className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Project overview</h2>
              <p className="mt-1 text-slate-600">Press export to generate a file for review or distribution.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportPdf} className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Export PDF
              </button>
              <button onClick={exportXlsx} className="rounded-3xl bg-slate-900/10 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                Export XLSX
              </button>
            </div>
          </div>

          {message ? <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Schools</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{reports?.schools?.length ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Progress entries</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{reports?.progress?.length ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Funding records</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{reports?.funding?.length ?? 0}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-950">Status summary</h3>
              <div className="mt-4 space-y-2 text-slate-700">
                {reports?.statusSummary ? (
                  Object.entries(reports.statusSummary).map(([status, count]: any) => (
                    <p key={status}>{status}: {count}</p>
                  ))
                ) : (
                  <p>No summary available.</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-950">Generated</h3>
              <p className="mt-4 text-slate-700">{reports?.generatedAt ? new Date(reports.generatedAt).toLocaleString() : "Waiting for data..."}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
