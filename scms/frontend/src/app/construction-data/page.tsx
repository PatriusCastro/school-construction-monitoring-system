'use client';

import { useEffect, useState } from "react";
import { fetchReports } from "@/lib/api";
import SidebarLayout from "@/components/SidebarLayout";

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
    <SidebarLayout title="Construction Data" description="Complete view of construction metrics and timeline">
      <div className="p-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">All Schools Construction Details</h2>
          </div>

          {error ? (
            <div className="p-6 bg-red-50 text-red-700 text-sm rounded-lg m-6">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">SCHOOL</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">BUDGET</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">TIMELINE</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">CONTRACTOR</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any) => (
                    <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800 text-sm">{row.name}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{row.budget}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{row.timeline}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{row.contractor}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {row.progress}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
