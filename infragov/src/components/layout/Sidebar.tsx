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
  PlusCircle,
  Cpu,
  Radio,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "OPERATIONS CONTROL",
    items: [
      { name: "Command Center", href: "/", icon: LayoutDashboard, badge: "3D HUD" },
      { name: "GIS Spatial Map", href: "/map", icon: MapPin },
      { name: "Operations Queue", href: "/operations", icon: Activity },
    ],
  },
  {
    title: "ASSET INFRASTRUCTURE",
    items: [
      { name: "Asset Register", href: "/assets", icon: Building2 },
      { name: "New Asset Wizard", href: "/assets/new", icon: PlusCircle },
    ],
  },
  {
    title: "FIELD & MAINTENANCE",
    items: [
      { name: "Field Inspections", href: "/inspections", icon: ClipboardCheck },
      { name: "Work Orders", href: "/maintenance", icon: Wrench },
      { name: "Lifecycle Timeline", href: "/lifecycle", icon: History },
    ],
  },
  {
    title: "GOVERNANCE & COMPLIANCE",
    items: [
      { name: "Alert Engine Feed", href: "/alerts", icon: Bell },
      { name: "Policies & AMCs", href: "/policies", icon: Shield },
    ],
  },
  {
    title: "SYSTEM & INTELLIGENCE",
    items: [
      { name: "Reports & Export", href: "/reports", icon: FileBarChart },
      { name: "Platform Admin", href: "/administration", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 text-slate-100 z-30 shrink-0 select-none shadow-2xl">
      {/* High-Tech Futuristic Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] line-gradient-emerald" />
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0 border border-emerald-400/30">
          <Cpu className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent leading-none font-mono">
              InfraGov
            </h1>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              v2.0
            </span>
          </div>
          <p className="text-[10px] text-emerald-400 font-medium tracking-wide mt-1 flex items-center space-x-1">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-ping" />
            <span>Govt Ops Command</span>
          </p>
        </div>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[9px] font-mono font-bold text-slate-400 tracking-widest uppercase mb-1.5 flex items-center justify-between">
              <span>{group.title}</span>
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
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-emerald-950/70 to-slate-900 text-emerald-400 border border-emerald-500/40 font-semibold shadow-lg shadow-emerald-950/50"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors shrink-0",
                        isActive
                          ? "text-emerald-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Cyber Security Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] line-gradient-emerald" />
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live" />
            <span className="text-slate-200 font-mono text-[10px] font-bold">GUJARAT-NODE-01</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            SECURE
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
          <span>State Cyber Grid</span>
          <Sparkles className="w-3 h-3 text-emerald-400" />
        </div>
      </div>
    </aside>
  );
}
