"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { GISMap } from "@/components/map/GISMap";
import { MapPin, Filter } from "lucide-react";

export default function MapPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assets?limit=200")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setAssets(res.data.assets);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>GIS Interactive Live Infrastructure Map</span>
            </h1>
            <p className="text-xs text-slate-400">Spatial visualization of government assets in Ahmedabad & Gandhinagar region</p>
          </div>
        </div>

        {loading ? (
          <div className="w-full h-[600px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 animate-pulse text-xs">
            Loading Spatial GIS Engine...
          </div>
        ) : (
          <GISMap assets={assets} />
        )}
      </div>
    </MainLayout>
  );
}
