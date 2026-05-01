"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, BarChart3, FileText, Calendar, MessageSquare, Bell, HelpCircle, LogOut, MapPin } from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/schools-map", label: "Schools Map", icon: MapPin },
  { href: "/data-visualization", label: "Data Visualization", icon: BarChart3 },
  { href: "/construction-data", label: "Construction Data", icon: FileText },
  { href: "/planning-parameters", label: "Planning Parameters", icon: Calendar },
  { href: "/progress-monitoring", label: "Progress Monitoring", icon: MessageSquare },
  { href: "/admin-panel", label: "Admin Panel", icon: Bell },
  { href: "/reports", label: "Reports", icon: HelpCircle },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function SidebarLayout({ children, title, description }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-100 border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="h-20 flex items-center justify-start px-4 border-b border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#1a3a6b] flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              {sidebarOpen && <span className="font-bold text-gray-800">SCMS</span>}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-[#1a3a6b] text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}
