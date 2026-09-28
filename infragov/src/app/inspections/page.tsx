"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClipboardCheck, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inspections")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setInspections(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" />
              <span>Field Inspection Management</span>
            </h1>
            <p className="text-xs text-slate-400">Scheduled and completed physical asset condition audits</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Inspection History Log</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Loading Inspections...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Asset Code / Name</th>
                    <th className="px-4 py-3">Inspection Date</th>
                    <th className="px-4 py-3">Inspector</th>
                    <th className="px-4 py-3">Overall Score</th>
                    <th className="px-4 py-3">Observations</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        <Link href={`/assets/${insp.assetId}`}>{insp.asset?.assetCode}</Link>
                        <span className="block text-slate-200 text-xs font-normal">{insp.asset?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(insp.inspectionDate)}</td>
                      <td className="px-4 py-3 text-slate-300">{insp.inspector?.name || "System"}</td>
                      <td className="px-4 py-3 font-bold text-slate-100">{insp.overallScore}/100</td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{insp.observations || "None"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/assets/${insp.assetId}`} className="text-emerald-400 hover:underline">
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
