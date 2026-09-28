"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Building2,
  AlertTriangle,
  Activity,
  Wrench,
  ShieldAlert,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  Layers,
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

const COLORS = ["#10b981", "#3b82f6", "#eab308", "#f97316", "#ef4444"];

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
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-slate-800 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-xl border border-slate-800"></div>
            ))}
          </div>
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Executive Operations Dashboard</h1>
            <p className="text-xs text-slate-400">Gujarat Municipal Infrastructure Asset Control Center</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/assets/new"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>+ Register Asset</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/assets" className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Total Registered Assets</span>
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-2">{kpis.totalAssets}</div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium">100% Monitored</div>
          </Link>

          <Link href="/assets?status=OPERATIONAL" className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Operational Assets</span>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-2">{kpis.operationalAssets}</div>
            <div className="text-[11px] text-blue-400 mt-1 font-medium">
              {Math.round((kpis.operationalAssets / (kpis.totalAssets || 1)) * 100)}% Operational
            </div>
          </Link>

          <Link href="/maintenance" className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Under Maintenance</span>
              <Wrench className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-2">{kpis.underMaintenance}</div>
            <div className="text-[11px] text-yellow-400 mt-1 font-medium">{kpis.openWorkOrders} Open Work Orders</div>
          </Link>

          <Link href="/alerts" className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Critical Risk Alerts</span>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-2">{kpis.highRiskAssets}</div>
            <div className="text-[11px] text-rose-400 mt-1 font-medium">{kpis.openAlerts} Actionable Alerts</div>
          </Link>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Assets by Municipal Category</span>
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.categories || []}>
                  <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }}
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
                <span>Asset Physical Condition Distribution</span>
              </h3>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
