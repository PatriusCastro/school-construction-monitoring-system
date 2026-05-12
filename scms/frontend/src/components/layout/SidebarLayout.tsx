"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Home,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  HelpCircle,
  LogOut,
  MapPin,
  ChevronRight,
  X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";

const sidebarLinks = [
  { href: "/dashboard",           label: "Dashboard",           icon: Home,          adminOnly: false },
  { href: "/schools-map",         label: "Schools Map",         icon: MapPin,        adminOnly: false },
  { href: "/data-visualization",  label: "Data Visualization",  icon: BarChart3,     adminOnly: false },
  { href: "/construction-data",   label: "Construction Data",   icon: FileText,      adminOnly: false },
  { href: "/planning-parameters", label: "Planning Parameters", icon: Calendar,      adminOnly: false },
  { href: "/progress-monitoring", label: "Progress Monitoring", icon: MessageSquare, adminOnly: false },
  { href: "/admin-panel",         label: "Admin Panel",         icon: Bell,          adminOnly: true  },
  { href: "/reports",             label: "Reports",             icon: HelpCircle,    adminOnly: false  },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function SidebarLayout({ children, title, description }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [role,        setRole]        = useState<"admin" | "viewer" | null>(null);
  const [mounted,     setMounted]     = useState(false);

  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(data?.role ?? "viewer");
    }
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const visibleLinks = sidebarLinks.filter(
    (link) => !link.adminOnly || role === "admin"
  );

  /* ─── Reusable nav link ─────────────────────────────────────────── */
  const NavLink = ({ link, collapsed }: { link: typeof sidebarLinks[0]; collapsed: boolean }) => {
    const Icon     = link.icon;
    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

    return (
      <Link
        href={link.href}
        title={collapsed ? link.label : undefined}
        className={[
          "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
          collapsed ? "justify-center py-3 px-0" : "px-3 py-2.5",
          isActive
            ? "bg-white/12 text-white"
            : "text-white/50 hover:bg-white/[0.07] hover:text-white",
        ].join(" ")}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-white" />
        )}
        <Icon size={17} className="shrink-0" />
        {!collapsed && (
          <span className="text-[13px] font-medium leading-none">{link.label}</span>
        )}
        {!collapsed && isActive && (
          <ChevronRight size={13} className="ml-auto text-white/35" />
        )}
      </Link>
    );
  };

  /* ─── Sidebar internals (shared between desktop + mobile drawer) ── */
  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className="flex h-full flex-col">

      {/* Logo */}
      <div
        className={[
          "flex items-center gap-3 border-b border-white/10 px-4 py-5",
          collapsed ? "justify-center" : "",
        ].join(" ")}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <span className="text-sm font-bold tracking-wide text-white">S</span>
        </div>
        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-sm font-semibold leading-tight text-white">
              DepEd SCMS
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
              SDO Legazpi City             
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {!collapsed && (
          <p className="px-3 pb-2 pt-1 text-[9px] font-semibold uppercase tracking-widest text-white/30">
            Navigation
          </p>
        )}

        <div className="space-y-0.5">
          {visibleLinks
            .filter((l) => !l.adminOnly)
            .map((link) => <NavLink key={link.href} link={link} collapsed={collapsed} />)}
        </div>

        {/* Admin section */}
        {role === "admin" && visibleLinks.some((l) => l.adminOnly) && (
          <>
            {collapsed
              ? <div className="my-3 mx-2 h-px bg-white/10" />
              : <p className="px-3 pb-2 pt-5 text-[9px] font-semibold uppercase tracking-widest text-white/30">Admin</p>
            }
            <div className="space-y-0.5">
              {visibleLinks
                .filter((l) => l.adminOnly)
                .map((link) => <NavLink key={link.href} link={link} collapsed={collapsed} />)}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div
        className={[
          "border-t border-white/10 px-3 py-4",
          collapsed ? "flex flex-col items-center" : "",
        ].join(" ")}
      >
        {/* User chip — hidden when collapsed */}
        {!collapsed && role && (
          <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/[0.07] px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <span className="text-xs font-semibold text-white">U</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/75">Signed in</p>
              <p className={`mt-0.5 text-[10px] font-medium ${role === "admin" ? "text-sky-300" : "text-white/40"}`}>
                {role === "admin" ? "Administrator" : "Viewer"}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Log out" : undefined}
          className={[
            "flex w-full items-center gap-3 rounded-xl text-white/45 transition-all duration-200",
            "hover:bg-white/[0.07] hover:text-white",
            collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5",
          ].join(" ")}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Log out</span>}
        </button>

        {/* Credits */}
        <div className="mt-4 text-center text-[10px] text-white/30">
          <p>© 2026 DepEd SCMS</p>
          <p className="mt-1">Developed by J.A.V.B.D.C.</p>
        </div>
      </div>
    </div>
  );

  /* ─── Root ──────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden md:flex flex-col shrink-0 overflow-hidden bg-[#0F2444]",
          "transition-[width] duration-300 ease-in-out",
          sidebarOpen ? "w-58" : "w-16",
        ].join(" ")}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-58 flex-col bg-[#0F2444] md:hidden",
          "shadow-[4px_0_32px_rgba(0,0,0,0.3)]",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/60 transition hover:bg-white/15 hover:text-white"
        >
          <X size={14} />
        </button>
        <SidebarContent collapsed={false} />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 md:px-7">

          <div className="flex min-w-0 items-center gap-3">
            {/* Desktop toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              className="hidden md:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            >
              <Menu size={17} />
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex md:hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            >
              <Menu size={17} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-slate-900">
                {title}
              </h1>
              {description && (
                <p className="mt-0.5 truncate text-xs text-slate-400">{description}</p>
              )}
            </div>
          </div>

          {/* Role badge */}
          {mounted && role && (
            <span
              className={[
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                role === "admin"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              {role === "admin" ? "Admin" : "Viewer"}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}