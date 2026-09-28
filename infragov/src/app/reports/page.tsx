"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileBarChart, Download, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/assets?limit=500");
      const data = await res.json();
      if (data.success) {
        const assets = data.data.assets;
        const headers = ["Asset Code", "Name", "Category", "Department", "Condition Score", "Risk Label", "Status"];
        const rows = assets.map((a: any) => [
          a.assetCode,
          `"${a.name}"`,
          `"${a.category?.name}"`,
          `"${a.department?.name}"`,
          a.conditionScore,
          a.riskLabel,
          a.lifecycleStatus,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `InfraGov_Asset_Inventory_Report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e: any) {
      alert("Export failed: " + e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <FileBarChart className="w-5 h-5 text-emerald-400" />
            <span>Reports & Analytics Export</span>
          </h1>
          <p className="text-xs text-slate-400">Generate executive summary reports and export complete asset inventories to CSV</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Master Asset Inventory Export</h3>
                <p className="text-xs text-slate-400">Export complete dataset including condition, risk scores, and department assignments.</p>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={downloading}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "Exporting CSV..." : "Download Full CSV Report"}</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
