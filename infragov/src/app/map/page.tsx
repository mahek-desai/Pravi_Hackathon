"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { GISMap } from "@/components/map/GISMap";
import { SpatialGlobe3D } from "@/components/ui/3d/SpatialGlobe3D";
import { MapPin, Globe, Layers, Cpu, ShieldCheck } from "lucide-react";

export default function MapPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

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
      <div className="space-y-6 select-none pb-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
                Spatial GIS &bull; Gujarat Infrastructure Telemetry
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 font-mono tracking-tight mt-1">
              GIS Interactive Live Infrastructure Map
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Geospatial cluster analysis and 3D spatial indexing across Ahmedabad & Gandhinagar municipal zones.
            </p>
          </div>

          {/* 2D vs 3D GIS View Switcher */}
          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-xl">
            <button
              onClick={() => setViewMode("2d")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "2d"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>2D Interactive GIS Map</span>
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "3d"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>3D Regional Spatial Mesh</span>
            </button>
          </div>
        </div>

        {/* GIS Viewport Container */}
        {loading ? (
          <div className="w-full h-[600px] glass-panel rounded-2xl flex flex-col items-center justify-center text-slate-400 animate-pulse text-xs space-y-3 font-mono">
            <Cpu className="w-8 h-8 text-emerald-400 animate-spin" />
            <div>Initializing Geospatial Spatial Engine & Clustering Telemetry...</div>
          </div>
        ) : viewMode === "3d" ? (
          <SpatialGlobe3D assetCount={assets.length || 165} height="620px" />
        ) : (
          <div className="glass-panel p-2 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <GISMap assets={assets} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
