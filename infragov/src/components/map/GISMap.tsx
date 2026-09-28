"use client";

import dynamic from "next/dynamic";

const GISMapComponent = dynamic(
  () => import("./GISMapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 animate-pulse">
        Initializing Spatial GIS Map...
      </div>
    ),
  }
);

export function GISMap({ assets }: { assets: any[] }) {
  return <GISMapComponent assets={assets} />;
}
