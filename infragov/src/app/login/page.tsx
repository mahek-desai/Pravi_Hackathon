"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@govdemo.local");
  const [password, setPassword] = useState("Demo@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/");
      } else {
        setError(data.error?.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError("Login error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-900/40">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">InfraGov Platform</h1>
          <p className="text-xs text-emerald-400 font-medium">Government Infrastructure Lifecycle Management</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-1 text-slate-300">
          <div className="font-semibold text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Demo Portal Access</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
            <div><strong className="text-slate-400">Admin:</strong> admin@govdemo.local</div>
            <div><strong className="text-slate-400">Manager:</strong> manager@govdemo.local</div>
            <div><strong className="text-slate-400">Inspector:</strong> inspector@govdemo.local</div>
            <div><strong className="text-slate-400">Technician:</strong> technician@govdemo.local</div>
          </div>
          <div className="text-[10px] text-slate-500 pt-1">Password for all accounts: <code className="text-slate-300">Demo@123</code></div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Secure Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 transition-all"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Control Center"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
