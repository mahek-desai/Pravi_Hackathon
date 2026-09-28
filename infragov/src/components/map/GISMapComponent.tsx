"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { getConditionColor, getRiskColor, getStatusColor } from "@/lib/utils";

// Custom Leaflet Icons based on Asset Condition / Risk
const createCustomMarker = (conditionScore: number, riskLabel: string) => {
  let color = "#10b981"; // emerald-500
  if (conditionScore < 40 || riskLabel === "Critical") color = "#ef4444"; // red-500
  else if (conditionScore < 60 || riskLabel === "High") color = "#f97316"; // orange-500
  else if (conditionScore < 75 || riskLabel === "Medium") color = "#eab308"; // yellow-500

  const svgMarker = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: svgMarker,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface GISMapProps {
  assets: any[];
}

export default function GISMapComponent({ assets }: GISMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400">
        Loading GIS Map Engine...
      </div>
    );
  }

  // Filter assets with valid lat/lng
  const mapAssets = assets.filter(
    (a) => a.location?.latitude && a.location?.longitude
  );

  // Default center around Ahmedabad / Gandhinagar
  const centerLat = mapAssets.length > 0 ? mapAssets[0].location.latitude : 23.0225;
  const centerLng = mapAssets.length > 0 ? mapAssets[0].location.longitude : 72.5714;

  return (
    <div className="w-full h-[650px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative z-10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapAssets.map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.location.latitude, asset.location.longitude]}
            icon={createCustomMarker(asset.conditionScore, asset.riskLabel)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-3 min-w-[220px] text-slate-900 font-sans">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                  {asset.category?.name || "Asset"} &bull; {asset.assetCode}
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug mb-2">
                  {asset.name}
                </h4>

                <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Condition</span>
                    <span className="font-semibold text-emerald-700">{asset.conditionScore}/100 ({asset.conditionLabel})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Risk</span>
                    <span className="font-semibold text-rose-700">{asset.riskLabel}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Location</span>
                    <span className="text-slate-800 text-[11px] truncate block">
                      {asset.location.locality}, {asset.location.zone}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/assets/${asset.id}`}
                  className="block w-full text-center bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                >
                  View Full Profile &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
