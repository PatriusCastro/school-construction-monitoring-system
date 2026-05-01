'use client';

import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { barOptions } from "@/lib/chart";
import { fetchReports } from "@/lib/api";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Search, Home, Building, ChartArea, Calendar, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (err) {
        console.error(err);
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
        id: school.id,
        name: school.name || school.title,
        progress: progress?.construction_progress ?? 0,
        status: school.project_status || "Planned",
      };
    });
  }, [reports]);

  const topSchools = schoolProgress.slice(0, 4);

  const chartData = useMemo(() => ({
    labels: schoolProgress.map((item: any) => item.name.slice(0, 10)),
    datasets: [
      {
        label: "Progress",
        data: schoolProgress.map((item: any) => item.progress),
        backgroundColor: "#4b5563",
        borderRadius: 6,
      },
    ],
  }), [schoolProgress]);

  const pendingCount = schoolProgress.filter((s: any) => s.status === "Planned").length;
  const activeCount = schoolProgress.filter((s: any) => s.progress > 0 && s.progress < 100).length;

  return (
    <SidebarLayout title="Good Morning" description={`You have ${pendingCount} pending and ${activeCount} active projects`}>
      <div className="p-8">
        <div className="flex justify-end mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {[
            { label: "Total Schools", value: reports?.schools?.length ?? 0, icon: <Home /> },
            { label: "Total Proposed Classrooms", value: reports?.schools?.length ?? 0, icon: <BookOpen /> },
            { label: "Total Units to Construct", value: activeCount, icon: <Building /> },
            { label: "Priority Schools", value: `${reports?.averageProgress ?? 0}%`, icon: <ChartArea /> },
            { label: "Proposed Funding Years", value: pendingCount, icon: <Calendar /> },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <span className="text-2xl text-gray-700">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Budget Overview Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Budget Details */}
          <div className="col-span-2 bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Progress Overview</h3>

            {/* Income/Expense */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-gray-500 text-sm">Active Schools</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{activeCount}</p>
                <p className="text-xs text-gray-500 mt-1">+12.5% from last month</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {schoolProgress.filter((s: any) => s.progress === 100).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">+5.2% from last month</p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              {!loading && schoolProgress.length > 0 ? (
                <Bar options={barOptions} data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
              )}
            </div>
          </div>

          {/* Right: Schools List */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Top Schools</h3>
              <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="space-y-4">
              {topSchools.map((school: any) => (
                <div key={school.id} className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm truncate">{school.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{school.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{school.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Best Selling Products / Schools Table */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">All Schools</h3>
            <button className="text-gray-400 hover:text-gray-600">⋮</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">SCHOOL</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">PROGRESS</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">UPDATED</th>
                </tr>
              </thead>
              <tbody>
                {schoolProgress.map((school: any) => (
                  <tr key={school.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{school.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600" style={{ width: `${school.progress}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{school.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          school.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : school.status === "in progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">Today</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}