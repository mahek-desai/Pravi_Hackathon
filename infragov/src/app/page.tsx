"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Building2,
  Activity,
  Wrench,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Building,
  Clock,
  ArrowRight,
  Plus,
  Radio,
  FileCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { formatDateTime, getRiskColor, getStatusColor } from "@/lib/utils";

const CONDITION_COLORS = ["#10b981", "#3b82f6", "#eab308", "#f97316", "#ef4444"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-pulse select-none">
          <div className="h-8 w-64 bg-slate-800 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-xl border border-slate-800"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-900 rounded-xl border border-slate-800"></div>
        </div>
      </MainLayout>
    );
  }

  const kpis = data?.kpis || {
    totalAssets: 0,
    operationalAssets: 0,
    underMaintenance: 0,
    criticalAssets: 0,
    highRiskAssets: 0,
    openWorkOrders: 0,
    openAlerts: 0,
  };

  const priorityQueue = data?.priorityActionQueue || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Government Infrastructure Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Live Feed</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time asset health monitoring, risk engine alerts, and operational maintenance oversight
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/assets/new"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Asset Wizard</span>
            </Link>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/assets"
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium group-hover:text-slate-200">Total Infrastructure Assets</span>
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-2">{kpis.totalAssets}</div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center space-x-1">
              <span>100% GIS Indexed</span>
            </div>
          </Link>

          <Link
            href="/assets?status=OPERATIONAL"
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium group-hover:text-slate-200">Operational Rate</span>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-2">{kpis.operationalAssets}</div>
            <div className="text-[11px] text-blue-400 mt-1 font-medium">
              {Math.round((kpis.operationalAssets / (kpis.totalAssets || 1)) * 100)}% Serviceable Capacity
            </div>
          </Link>

          <Link
            href="/maintenance"
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium group-hover:text-slate-200">Under Maintenance</span>
              <Wrench className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-2">{kpis.underMaintenance}</div>
            <div className="text-[11px] text-yellow-400 mt-1 font-medium">
              {kpis.openWorkOrders} Active Repair Orders
            </div>
          </Link>

          <Link
            href="/alerts"
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium group-hover:text-slate-200">Critical Risk Alerts</span>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-2">{kpis.highRiskAssets}</div>
            <div className="text-[11px] text-rose-400 mt-1 font-medium">
              {kpis.openAlerts} Action Required Triggers
            </div>
          </Link>
        </div>

        {/* Priority Action Queue Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Priority Action Queue (High & Critical Risk Triggers)</span>
            </h2>
            <Link href="/operations" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center space-x-1">
              <span>View Full Operations Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {priorityQueue.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-lg border border-slate-800">
              No pending critical action triggers. System operating within normal thresholds.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {priorityQueue.map((alt: any) => (
                <div
                  key={alt.id}
                  className="p-3.5 bg-slate-950/90 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2 text-xs"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-rose-400 leading-tight">{alt.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
                        {alt.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">{alt.description}</p>
                    <div className="text-[10px] text-slate-500 mt-2 flex items-center space-x-1">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {alt.asset?.name} ({alt.asset?.assetCode})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Risk: <strong className="text-rose-400">{alt.asset?.riskScore}/100</strong>
                    </span>
                    <Link
                      href={`/assets/${alt.assetId}`}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1"
                    >
                      <span>Action Asset</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visual Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Municipal Infrastructure Categories</span>
              </h3>
              <span className="text-[11px] text-slate-500">Asset Distribution</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.categories || []}>
                  <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Condition Health Pie Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Asset Condition Index Breakdown</span>
              </h3>
              <span className="text-[11px] text-slate-500">Field Audit Scores</span>
            </div>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.conditionDistribution || []}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry: any) => `${entry.label}: ${entry.count}`}
                  >
                    {(data?.conditionDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CONDITION_COLORS[index % CONDITION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lower Grid: Department Breakdown & Recent Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Departmental Asset Distribution</span>
            </h3>
            <div className="space-y-3 text-xs">
              {(data?.departmentDistribution || []).map((dept: any) => (
                <div key={dept.code} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{dept.name}</span>
                    <span className="text-slate-500 ml-2">({dept.code})</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-bold text-emerald-400">
                    {dept.count} Assets
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Activity Log */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Recent Operational Audit Feed</span>
              </h3>
              <Link href="/lifecycle" className="text-xs text-emerald-400 hover:underline">
                View Full Timeline
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              {recentActivities.map((act: any) => (
                <div key={act.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-slate-200">{act.asset?.name}</span>
                    <span className="text-emerald-400 font-bold ml-1.5">({act.asset?.assetCode})</span>
                    <p className="text-slate-400 mt-0.5">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                    {formatDateTime(act.eventDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
