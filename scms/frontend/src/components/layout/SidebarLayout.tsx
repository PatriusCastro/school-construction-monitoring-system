"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Home, BarChart3, FileText, Calendar, MessageSquare, Bell, HelpCircle, LogOut, MapPin } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

const sidebarLinks = [
  { href: "/dashboard",             label: "Dashboard",            icon: Home,          adminOnly: false },
  { href: "/schools-map",           label: "Schools Map",          icon: MapPin,        adminOnly: false },
  { href: "/data-visualization",    label: "Data Visualization",   icon: BarChart3,     adminOnly: false },
  { href: "/construction-data",     label: "Construction Data",    icon: FileText,      adminOnly: false },
  { href: "/planning-parameters",   label: "Planning Parameters",  icon: Calendar,      adminOnly: false },
  { href: "/progress-monitoring",   label: "Progress Monitoring",  icon: MessageSquare, adminOnly: false },
  { href: "/admin-panel",           label: "Admin Panel",          icon: Bell,          adminOnly: true  },
  { href: "/reports",               label: "Reports",              icon: HelpCircle,    adminOnly: true  },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function SidebarLayout({ children, title, description }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<"admin" | "viewer" | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
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

  const visibleLinks = sidebarLinks.filter(link => !link.adminOnly || role === "admin");

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 flex flex-col transition-all duration-300`}>
        <div className="h-20 flex items-center justify-start px-4 border-b border-slate-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#1a3a6b] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              {sidebarOpen && <span className="font-semibold text-slate-900 text-sm">SCMS</span>}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#1a3a6b] text-white font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="px-3 py-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg transition">
              <Menu size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
          </div>

          {/* Role badge in top bar */}
          {role && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              role === "admin"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {role === "admin" ? "Admin" : "Viewer"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
}