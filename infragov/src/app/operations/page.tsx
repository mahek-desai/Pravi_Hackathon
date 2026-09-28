"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Activity, AlertTriangle, Clock, Wrench, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getStatusColor, getRiskColor } from "@/lib/utils";

export default function OperationsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/alerts").then((res) => res.json()),
      fetch("/api/work-orders").then((res) => res.json()),
    ])
      .then(([alertRes, woRes]) => {
        if (alertRes.success) setAlerts(alertRes.data);
        if (woRes.success) setWorkOrders(woRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Operations Command Center</span>
          </h1>
          <p className="text-xs text-slate-400">Actionable operational task queue and emergency response alerts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actionable Alerts Queue */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Critical Risk & Overdue Alerts ({alerts.length})</span>
            </h3>

            <div className="space-y-3">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-start text-xs">
                  <div>
                    <span className="font-semibold text-rose-400">{alt.title}</span>
                    <p className="text-slate-300 mt-1">{alt.description}</p>
                    <div className="text-[11px] text-slate-500 mt-1">Asset: {alt.asset?.name} ({alt.asset?.assetCode})</div>
                  </div>
                  <Link
                    href={`/assets/${alt.assetId}`}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                  >
                    Action &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Open Maintenance Work Orders */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-yellow-400" />
              <span>Active Work Orders Queue ({workOrders.length})</span>
            </h3>

            <div className="space-y-3">
              {workOrders.map((wo) => (
                <div key={wo.id} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-emerald-400">{wo.workOrderNumber}</span> - <span className="text-slate-200 font-semibold">{wo.issue}</span>
                    <p className="text-slate-400 mt-1">Asset: {wo.asset?.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(wo.status)}`}>
                    {wo.status}
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
