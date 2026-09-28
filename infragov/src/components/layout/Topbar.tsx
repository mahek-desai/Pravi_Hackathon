"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut, Plus, Building2 } from "lucide-react";
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
          // Default session user for demo environment
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
    <header className="h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 text-slate-100 select-none">
      {/* Global Search Bar with Live Recommendations Dropdown */}
      <div ref={searchRef} className="flex-1 max-w-md relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search asset code, name, locality, category..."
            className="w-full bg-slate-950/80 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </form>

        {/* Live Search Recommendations */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-xs text-slate-400 text-center animate-pulse">Searching assets...</div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-slate-800/60">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/assets/${item.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center justify-between p-3 hover:bg-slate-800/60 text-xs transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-200">
                          <span className="text-emerald-400 font-bold mr-1.5">{item.assetCode}</span>
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.category?.name} &bull; {item.location?.locality || "Ahmedabad"}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 shrink-0">
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

      {/* Actions & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Add Asset Button */}
        <Link
          href="/assets/new"
          className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Asset Wizard</span>
        </Link>

        {/* Notifications Feed Link */}
        <Link href="/alerts" title="Alert Feed" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </Link>

        {/* User Profile */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              {user.name ? user.name[0] : "A"}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-200 flex items-center space-x-1">
                <span className="truncate max-w-[120px]">{user.name}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30">
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
