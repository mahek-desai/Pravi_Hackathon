"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { History, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LifecyclePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Asset Lifecycle Stages Timeline</span>
          </h1>
          <p className="text-xs text-slate-400">Complete historical timeline from Procurement to Commissioning & Retirement</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-100">Standard Public Infrastructure Lifecycle Stages</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            {["PLANNED", "PROCURED", "INSTALLED", "COMMISSIONED", "OPERATIONAL", "UNDER_MAINTENANCE", "REPAIRED", "RENEWED", "RETIRED", "DISPOSED"].map((st, i) => (
              <div key={st} className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-bold text-emerald-400">
                {st}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400">Select any asset from the <Link href="/assets" className="text-emerald-400 underline">Asset Register</Link> to view its audit-stamped lifecycle event timeline.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
