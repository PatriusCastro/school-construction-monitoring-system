import Link from "next/link";

const pages = [
  { href: "/dashboard", title: "Dashboard", description: "Live status and summaries." },
  { href: "/schools-map", title: "Schools Map", description: "Interactive pinned locations." },
  { href: "/construction-data", title: "Construction Data", description: "Construction records and parameters." },
  { href: "/progress-monitoring", title: "Progress Monitoring", description: "Track progress and materials." },
  { href: "/planning-parameters", title: "Planning Parameters", description: "Calculator for classroom and funding needs." },
  { href: "/data-visualization", title: "Data Visualization", description: "All charts and distribution views." },
  { href: "/admin-panel", title: "Admin Panel", description: "Add schools, upload plans, export reports." },
  { href: "/reports", title: "Reports", description: "Export overall PDF and XLSX reports." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="rounded-4xl bg-white p-10 shadow-sm">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">School Construction Monitoring</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Navigate through dashboards, maps, construction records, progress tools, planning calculators, and admin exports.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <h2 className="text-xl font-semibold">{page.title}</h2>
              <p className="mt-3 text-slate-600">{page.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
