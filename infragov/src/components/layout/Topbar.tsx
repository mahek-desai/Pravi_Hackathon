"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LogOut, ShieldCheck, Plus } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data.user);
        } else {
          // Default fallback demo user for preview
          setUser({
            name: "Rajesh Kumar",
            email: "admin@govdemo.local",
            role: "ADMIN",
            departmentName: "Roads & Buildings Department",
          });
        }
      })
      .catch(() => {
        setUser({
          name: "Rajesh Kumar",
          email: "admin@govdemo.local",
          role: "ADMIN",
          departmentName: "Roads & Buildings Department",
        });
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/assets?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 text-slate-100">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search asset ID, name, ward, location, category..."
          className="w-full bg-slate-950/80 text-sm text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
        />
      </form>

      {/* Actions & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Add Asset Button */}
        <Link
          href="/assets/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Asset Wizard</span>
        </Link>

        {/* Notifications Icon */}
        <Link href="/alerts" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </Link>

        {/* User Badge */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {user.name ? user.name[0] : "A"}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-200 flex items-center space-x-1">
                <span>{user.name}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {user.role}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] truncate max-w-[150px]">
                {user.departmentName || user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
