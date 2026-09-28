"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  ClipboardCheck,
  Wrench,
  Shield,
  History,
  FileBarChart,
  Bell,
  Settings,
  Activity,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Executive Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Operations Center", href: "/operations", icon: Activity },
  { name: "Asset Register", href: "/assets", icon: Building2 },
  { name: "GIS Live Map", href: "/map", icon: MapPin },
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
  { name: "Maintenance / Work Orders", href: "/maintenance", icon: Wrench },
  { name: "Policies & SLAs", href: "/policies", icon: Shield },
  { name: "Lifecycle Tracking", href: "/lifecycle", icon: History },
  { name: "Alerts & Warnings", href: "/alerts", icon: Bell },
  { name: "Reports & Analytics", href: "/reports", icon: FileBarChart },
  { name: "Administration", href: "/administration", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 text-slate-100 z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-900/30">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
            InfraGov
          </h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wide">
            Govt. Asset Lifecycle Platform
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Government Badge Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live System</span>
          </span>
          <span className="text-slate-400 text-[10px]">v1.0 (Gujarat Region)</span>
        </div>
      </div>
    </aside>
  );
}
