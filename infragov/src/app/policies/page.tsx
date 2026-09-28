"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Shield, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function PoliciesPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assets?limit=50")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setAssets(res.data.assets);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Policies, Warranty & AMC Contracts</span>
          </h1>
          <p className="text-xs text-slate-400">Manage government vendor warranties, annual maintenance contracts, and SLAs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Active Asset Warranties & AMCs</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Loading Policies...</div>
          ) : (
            <div className="space-y-3 text-xs">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-400">{asset.assetCode}</span> - {asset.name}
                    <p className="text-slate-400 mt-1">Vendor: {asset.vendor?.name || "L&T Infrastructure Contractors Ltd."}</p>
                    <p className="text-slate-500 text-[11px]">Installation: {formatDate(asset.installationDate)}</p>
                  </div>
                  <Link href={`/assets/${asset.id}`} className="text-emerald-400 hover:underline">
                    View Policy Profile &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
