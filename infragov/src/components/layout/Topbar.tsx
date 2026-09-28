"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut, Plus, Building2, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        } else {
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

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            setSearchResults(res.data);
            setShowDropdown(true);
          }
        })
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/assets?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 text-slate-100 select-none shadow-xl">
      {/* Global Search Bar with Live Recommendations Dropdown */}
      <div ref={searchRef} className="flex-1 max-w-md relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search asset code, name, locality, category..."
            className="w-full bg-slate-900/90 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
          />
        </form>

        {/* Live Search Recommendations */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-3.5 text-xs text-slate-400 text-center font-mono animate-pulse">Searching GIS Database...</div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-slate-800/60">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/assets/${item.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center justify-between p-3 hover:bg-slate-800/70 text-xs transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">
                          <span className="text-emerald-400 font-mono font-bold mr-1.5">{item.assetCode}</span>
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.category?.name} &bull; {item.location?.locality || "Ahmedabad Region"}
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/30 shrink-0">
                      {item.lifecycleStatus}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-3 text-xs text-slate-500 text-center">No matching assets found</div>
            )}
          </div>
        )}
      </div>

      {/* Center Command HUD Telemetry */}
      <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>GUJARAT GOVT INFRASTRUCTURE COMMAND</span>
      </div>

      {/* Actions & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Add Asset Button with ambient glow */}
        <Link
          href="/assets/new"
          className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-900/30 border border-emerald-400/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Asset Wizard</span>
        </Link>

        {/* Notifications Feed Link */}
        <Link href="/alerts" title="Alert Feed" className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full radar-live" />
        </Link>

        {/* User Profile */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-950 to-slate-900 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
              {user.name ? user.name[0] : "A"}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-200 flex items-center space-x-1">
                <span className="truncate max-w-[120px]">{user.name}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {user.role}
                </span>
              </div>
              <div className="text-slate-400 text-[10px] truncate max-w-[140px]">
                {user.departmentName || user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout session"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
