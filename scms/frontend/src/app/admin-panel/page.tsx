'use client';

import { useEffect, useState } from "react";
import { createSchool, fetchReports, uploadSitePlan } from "@/lib/api";
import NavBar from "@/components/NavBar";

export default function AdminPanelPage() {
  const [reports, setReports] = useState<any>(null);
  const [school, setSchool] = useState({ name: "", address: "", priority: "Medium", project_status: "Planned" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      setReports(await fetchReports());
    }
    load();
  }, []);

  const handleSchoolSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await createSchool(school);
      setMessage("School added successfully.");
      setSchool({ name: "", address: "", priority: "Medium", project_status: "Planned" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setMessage(null);
    setError(null);

    try {
      const result = await uploadSitePlan(file);
      setUploadResult(result.url);
      setMessage("Site plan uploaded successfully.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Admin Panel</h1>
          <p className="mt-2 text-slate-600">Admin functions for adding schools, uploading site plans, and exporting project data.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Add new school</h2>
            <form onSubmit={handleSchoolSubmit} className="mt-5 space-y-4">
              {(message || error) && (
                <div className={`rounded-2xl p-4 text-sm ${message ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {message || error}
                </div>
              )}
              <label className="block text-sm font-medium text-slate-700">
                School name
                <input
                  type="text"
                  value={school.name}
                  onChange={(event) => setSchool({ ...school, name: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Address
                <input
                  type="text"
                  value={school.address}
                  onChange={(event) => setSchool({ ...school, address: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Priority
                <select
                  value={school.priority}
                  onChange={(event) => setSchool({ ...school, priority: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Project status
                <select
                  value={school.project_status}
                  onChange={(event) => setSchool({ ...school, project_status: event.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                >
                  <option>Planned</option>
                  <option>In progress</option>
                  <option>Complete</option>
                </select>
              </label>
              <button className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Add school
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Upload site plan</h2>
            <form onSubmit={handleUpload} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Select plan file
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
                />
              </label>
              <button className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Upload plan
              </button>
            </form>
            {uploadResult ? (
              <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-slate-700">
                <p className="text-sm font-medium">Uploaded URL</p>
                <a href={uploadResult} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {uploadResult}
                </a>
              </div>
            ) : null}
          </section>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Recent reports</h2>
          <p className="mt-2 text-slate-600">Preview the latest school project summary for review before exporting.</p>
          <div className="mt-5 space-y-3 text-slate-700">
            <p>Total schools: {reports?.schools?.length ?? "—"}</p>
            <p>Progress records: {reports?.progress?.length ?? "—"}</p>
            <p>Funding entries: {reports?.funding?.length ?? "—"}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
