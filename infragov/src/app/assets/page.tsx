"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Building2,
  Search,
  Filter,
  Eye,
  Wrench,
  ClipboardCheck,
  Plus,
  AlertTriangle,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Central Infrastructure Register</h1>
            <p className="text-xs text-slate-400">Master inventory of government public assets across Gujarat</p>
          </div>
          <Link
            href="/assets/new"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Asset Wizard</span>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative col-span-1 lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, name, locality..."
              className="w-full bg-slate-950 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-3 py-2 border border-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 rounded-lg px-3 py-2 border border-slate-800 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 rounded-lg px-3 py-2 border border-slate-800 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <button
            onClick={handleFilterChange}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apply Filters</span>
          </button>
        </div>

        {/* Asset Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 animate-pulse text-xs">
              Loading Infrastructure Register...
            </div>
          ) : assets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-300">No assets found</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or create a new asset.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Asset Code / Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Locality</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Condition</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Criticality</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/assets/${asset.id}`} className="text-emerald-400 hover:underline font-semibold block">
                          {asset.assetCode}
                        </Link>
                        <span className="text-slate-200 block text-xs font-normal truncate max-w-[200px]">
                          {asset.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{asset.category?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-400">{asset.department?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {asset.location?.locality || asset.location?.city || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(asset.lifecycleStatus)}`}>
                          {asset.lifecycleStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getConditionColor(asset.conditionLabel)}`}>
                          {asset.conditionScore}/100 ({asset.conditionLabel})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRiskColor(asset.riskLabel)}`}>
                          {asset.riskLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCriticalityColor(asset.criticality)}`}>
                          {asset.criticality}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="inline-flex items-center p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="View Details"
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
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950">
              <span>Showing Page {pagination.page} of {pagination.totalPages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchAssets(pagination.page - 1)}
                  className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchAssets(pagination.page + 1)}
                  className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50"
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
