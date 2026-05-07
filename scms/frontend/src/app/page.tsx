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
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <section className="mb-16">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900 mb-4">
            School Construction Monitoring
          </h1>
          <p className="text-lg leading-relaxed text-slate-600 max-w-3xl">
            Navigate through dashboards, maps, construction records, progress tools, planning calculators, and admin exports.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group rounded-xl border border-slate-200 bg-white p-6 text-slate-900 transition-all hover:border-slate-300 hover:shadow-md hover:shadow-slate-200"
            >
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-[#1a3a6b] transition-colors">{page.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{page.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
