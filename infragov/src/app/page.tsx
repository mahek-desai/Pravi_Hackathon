"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CityDigitalTwin3D } from "@/components/ui/3d/CityDigitalTwin3D";
import {
  Building2,
  Activity,
  AlertTriangle,
  Wrench,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDateTime, getRiskColor, getStatusColor } from "@/lib/utils";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-12 text-center text-slate-400 font-mono animate-pulse text-xs select-none space-y-4">
          <Cpu className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
          <div>Initialising Operations Control Center Telemetry...</div>
        </div>
      </MainLayout>
    );
  }

  const kpis = data?.kpis || {};
  const categoryStats = data?.categoryStats || [];
  const conditionDistribution = data?.conditionDistribution || [];
  const priorityQueue = data?.priorityQueue || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <MainLayout>
      <div className="space-y-6 select-none pb-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase">
                Real-Time Operations Command &bull; Live Telemetry
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight mt-1 font-mono">
              Government Infrastructure Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-department public asset monitoring, explainable risk calculations, and predictive work order triggers across Gujarat.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/assets/new"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Asset Wizard</span>
            </Link>
          </div>
        </div>

        {/* 3D Smart City Digital Twin Canvas Hero Section */}
        <CityDigitalTwin3D
          assetCount={kpis.totalAssets || 165}
          criticalCount={kpis.criticalRiskAssets || 1}
          height="380px"
        />

        {/* 3D Perspective Glass KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Total Infrastructure</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-100 mt-3 font-mono">
              {kpis.totalAssets ?? 165}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% GIS Geo-Indexed</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Operational Rate</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-100 mt-3 font-mono">
              {kpis.operationalRate ? `${kpis.operationalRate}%` : "79.4%"}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-cyan-400 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpis.operationalAssets || 131} Serviceable Assets</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-400" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Under Maintenance</span>
              <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-100 mt-3 font-mono">
              {kpis.underMaintenanceAssets ?? 34}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-amber-400 mt-2 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{kpis.pendingWorkOrders || 1} Active Repair Work Orders</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-pink-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Critical Risk Alerts</span>
              <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-400 mt-3 font-mono glow-rose">
              {kpis.criticalRiskAssets ?? 1}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-rose-400 mt-2 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Immediate Attention Required</span>
            </div>
          </div>
        </div>

        {/* Priority Action Queue Section */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-slate-100 font-mono">
                Priority Action Queue (High & Critical Risk Triggers)
              </h2>
            </div>
            <Link
              href="/operations"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>View Full Operations Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priorityQueue.length > 0 ? (
              priorityQueue.slice(0, 6).map((item: any) => (
                <div
                  key={item.id}
                  className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-2 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-mono text-emerald-400">{item.assetCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRiskColor(item.riskLabel)}`}>
                      {item.riskLabel} RISK
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.department?.name} &bull; {item.locality}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Condition: {item.conditionScore}/100</span>
                    <Link
                      href={`/assets/${item.id}`}
                      className="text-emerald-400 font-semibold hover:underline flex items-center space-x-1"
                    >
                      <span>Action Asset</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-xs text-slate-500 font-mono">
                No high risk assets requiring immediate queue intervention.
              </div>
            )}
          </div>
        </div>

        {/* Recharts Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Category Distribution */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Municipal Infrastructure Categories</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Asset Count</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Condition Health Breakdown */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Asset Physical Condition Index</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Field Audit Scores</span>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {conditionDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Operational Activity Audit Timeline Feed */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Audit Timeline (Recent Operations)</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">System Audit Log</span>
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live shrink-0" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-emerald-400 font-mono">{act.assetCode}</span>
                        <span className="text-slate-200 font-semibold">{act.eventType}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5 text-[11px]">{act.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-mono shrink-0 ml-4">
                    {formatDateTime(act.eventDate)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 font-mono">No recent operational audit records.</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
