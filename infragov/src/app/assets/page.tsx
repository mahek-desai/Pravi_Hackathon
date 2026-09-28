"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Building2,
  Search,
  Filter,
  Eye,
  Plus,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { getConditionColor, getRiskColor, getStatusColor, getCriticalityColor } from "@/lib/utils";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [criticality, setCriticality] = useState("");

  const fetchAssets = (page = 1) => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: "25",
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(departmentId && { departmentId }),
      ...(criticality && { criticality }),
    });

    fetch(`/api/assets?${query.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setAssets(res.data.assets);
          setPagination(res.data.pagination);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets(1);
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/departments").then((res) => res.json()),
    ]).then(([catRes, deptRes]) => {
      if (catRes.success) setCategories(catRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    });
  }, []);

  const handleFilterChange = () => {
    fetchAssets(1);
  };

  return (
    <MainLayout>
      <div className="space-y-6 select-none pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
                Central Inventory &bull; State Infrastructure Index
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 font-mono tracking-tight mt-1">
              Central Infrastructure Register
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Master inventory of government public assets across Gujarat with real-time risk index ratings.
            </p>
          </div>

          <Link
            href="/assets/new"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all self-start sm:self-auto hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Asset Wizard</span>
          </Link>
        </div>

        {/* Glassmorphic Search & Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative col-span-1 lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, name, locality..."
              className="w-full bg-slate-950/90 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-slate-950/90 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none font-mono"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="bg-slate-950/90 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none font-mono"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <button
            onClick={handleFilterChange}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-700"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apply Filters</span>
          </button>
        </div>

        {/* Asset Table Container */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-mono animate-pulse text-xs space-y-3">
              <Cpu className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <div>Fetching Asset Register Records...</div>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-300">No assets found</h3>
              <p className="text-xs text-slate-500 font-mono">Try adjusting your filter search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-sans">
                <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Asset Code / Name</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Locality</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Condition</th>
                    <th className="px-4 py-3.5">Risk</th>
                    <th className="px-4 py-3.5">Criticality</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/assets/${asset.id}`} className="text-emerald-400 font-mono font-bold hover:underline block">
                          {asset.assetCode}
                        </Link>
                        <span className="text-slate-200 block text-xs font-normal truncate max-w-[200px] group-hover:text-emerald-300">
                          {asset.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{asset.category?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-400">{asset.department?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono">
                        {asset.location?.locality || asset.location?.city || "N/A"}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(asset.lifecycleStatus)}`}>
                          {asset.lifecycleStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getConditionColor(asset.conditionLabel)}`}>
                          {asset.conditionScore}/100 ({asset.conditionLabel})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRiskColor(asset.riskLabel)}`}>
                          {asset.riskLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCriticalityColor(asset.criticality)}`}>
                          {asset.criticality}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="inline-flex items-center p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
                          title="View Asset Lifecycle Record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 font-mono">
              <span>Showing Page {pagination.page} of {pagination.totalPages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchAssets(pagination.page - 1)}
                  className="px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchAssets(pagination.page + 1)}
                  className="px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
