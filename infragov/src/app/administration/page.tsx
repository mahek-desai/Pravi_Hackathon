"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Settings, Building2, Users, Layers } from "lucide-react";

export default function AdministrationPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/departments").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ]).then(([deptRes, catRes]) => {
      if (deptRes.success) setDepartments(deptRes.data);
      if (catRes.success) setCategories(catRes.data);
    });
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Government Platform Administration</span>
          </h1>
          <p className="text-xs text-slate-400">Configure departments, municipal divisions, asset categories, and user permissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Government Departments ({departments.length})</span>
            </h3>
            <div className="space-y-2">
              {departments.map((d) => (
                <div key={d.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{d.name}</span> ({d.code})
                    <p className="text-slate-500 text-[11px]">{d.divisions?.length || 0} Sub-Divisions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Asset Categories & Types ({categories.length})</span>
            </h3>
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-200">{c.name}</span> ({c.code})
                  <div className="text-slate-400 text-[11px] mt-1 flex flex-wrap gap-1">
                    {c.assetTypes?.map((t: any) => (
                      <span key={t.id} className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">{t.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
