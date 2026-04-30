"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schools-map", label: "Schools Map" },
  { href: "/construction-data", label: "Construction Data" },
  { href: "/progress-monitoring", label: "Progress Monitoring" },
  { href: "/planning-parameters", label: "Planning Parameters" },
  { href: "/data-visualization", label: "Data Visualization" },
  { href: "/admin-panel", label: "Admin Panel" },
  { href: "/reports", label: "Reports" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div>
          <Link href="/dashboard" className="text-lg font-semibold text-slate-950">
            School Monitoring
          </Link>
          <p className="text-sm text-slate-500">Construction monitoring, reporting, and planning.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((item) => {
            const active = pathname === item.href || pathname === item.href + "/";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
