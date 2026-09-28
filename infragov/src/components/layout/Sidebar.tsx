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
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Control Center", href: "/", icon: LayoutDashboard },
      { name: "GIS Spatial Map", href: "/map", icon: MapPin },
      { name: "Operations Queue", href: "/operations", icon: Activity },
    ],
  },
  {
    title: "ASSET MANAGEMENT",
    items: [
      { name: "Asset Register", href: "/assets", icon: Building2 },
      { name: "New Asset Wizard", href: "/assets/new", icon: PlusCircle },
    ],
  },
  {
    title: "INSPECTION & REPAIR",
    items: [
      { name: "Field Inspections", href: "/inspections", icon: ClipboardCheck },
      { name: "Work Orders", href: "/maintenance", icon: Wrench },
      { name: "Lifecycle Timeline", href: "/lifecycle", icon: History },
    ],
  },
  {
    title: "RISK & COMPLIANCE",
    items: [
      { name: "Alert Engine Feed", href: "/alerts", icon: Bell },
      { name: "Policies & AMCs", href: "/policies", icon: Shield },
    ],
  },
  {
    title: "SYSTEM & ADMIN",
    items: [
      { name: "Reports & Export", href: "/reports", icon: FileBarChart },
      { name: "Platform Admin", href: "/administration", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 text-slate-100 z-30 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 shrink-0">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent leading-none">
            InfraGov
          </h1>
          <p className="text-[10px] text-emerald-400 font-medium tracking-wide mt-1">
            Control Operations Platform
          </p>
        </div>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 mr-2.5 transition-colors shrink-0",
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Gujarat Infrastructure Region</span>
          </span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          Government Operations Engine
        </div>
      </div>
    </aside>
  );
}
