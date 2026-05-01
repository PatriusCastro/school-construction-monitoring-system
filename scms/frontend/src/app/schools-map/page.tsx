'use client';

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { fetchReports } from "@/lib/api";
import SidebarLayout from "@/components/SidebarLayout";

export default function SchoolsMapPage() {
  const [reports, setReports] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchReports();
        setReports(data);
        setSelectedSchool(data.schools?.[0] ?? null);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  const center = useMemo(() => {
    const first = reports?.schools?.[0];
    if (first?.latitude && first?.longitude) {
      return [Number(first.latitude), Number(first.longitude)];
    }
    return [14.5995, 120.9842];
  }, [reports]);

  return (
    <SidebarLayout title="Schools Map" description="Interactive map showing all school construction locations">
      <div className="p-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Schools Map</h1>
          <p className="mt-2 text-slate-600">Click a pin to inspect the school project and view the site development plan placeholder.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-[520px] overflow-hidden rounded-3xl">
              <MapContainer center={center as [number, number]} zoom={6} className="h-full w-full rounded-3xl">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {reports?.schools?.map((school: any) => {
                  if (!school.latitude || !school.longitude) return null;
                  return (
                    <CircleMarker
                      key={school.id}
                      center={[Number(school.latitude), Number(school.longitude)]}
                      radius={12}
                      pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.8 }}
                      eventHandlers={{ click: () => setSelectedSchool(school) }}
                    >
                      <Popup>
                        <div className="space-y-2">
                          <p className="font-semibold">{school.name || school.title}</p>
                          <p className="text-sm text-slate-600">{school.project_status || "Planned"}</p>
                          <p className="text-sm text-slate-600">Tap to see details</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Selected school</h2>
              {selectedSchool ? (
                <div className="mt-4 space-y-3 text-slate-700">
                  <p className="text-lg font-semibold text-slate-900">{selectedSchool.name || selectedSchool.title}</p>
                  <p>Status: {selectedSchool.project_status || "Planned"}</p>
                  <p>Address: {selectedSchool.location || selectedSchool.address || "N/A"}</p>
                  <p>Project code: {selectedSchool.project_code || "N/A"}</p>
                  <p>Construction type: {selectedSchool.construction_type || "School building"}</p>
                </div>
              ) : (
                <p className="text-slate-600">Select a marker to see school details here.</p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Site Development Plan</h2>
              <p className="mt-4 text-slate-600">Boarding plan integration will connect to the API later. This panel will show the site plan, zoning, and layout.</p>
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Site plan visualization coming soon.</div>
            </div>
          </aside>
        </div>
      </div>
    </SidebarLayout>
  );
}
