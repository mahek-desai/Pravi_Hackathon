"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Bell, AlertTriangle, ShieldAlert } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setAlerts(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Alerts & Rules Engine</span>
          </h1>
          <p className="text-xs text-slate-400">Automated triggers for overdue inspections, poor conditions, and high-risk assets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">System Alert Feed</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Loading Alerts...</div>
          ) : (
            <div className="space-y-3 text-xs">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-rose-400">{alt.title}</span>
                    <p className="text-slate-300 mt-1">{alt.description}</p>
                    <p className="text-slate-500 text-[11px] mt-1">Triggered: {formatDateTime(alt.createdAt)}</p>
                  </div>
                  {alt.assetId && (
                    <Link href={`/assets/${alt.assetId}`} className="text-emerald-400 hover:underline">
                      View Asset &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
