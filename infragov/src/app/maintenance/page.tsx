"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Wrench, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Link from "next/link";

export default function MaintenancePage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState("COMPLETED");
  const [completionNotes, setCompletionNotes] = useState("");
  const [actualCost, setActualCost] = useState("");

  const fetchWorkOrders = () => {
    setLoading(true);
    fetch("/api/work-orders")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setWorkOrders(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleUpdateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;

    try {
      const res = await fetch(`/api/work-orders/${selectedWO.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateStatus,
          completionNotes,
          actualCost: actualCost ? parseFloat(actualCost) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedWO(null);
        fetchWorkOrders();
      } else {
        alert(data.error?.message || "Failed to update work order");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <span>Maintenance & Work Order Operations</span>
          </h1>
          <p className="text-xs text-slate-400">Track, assign, and complete corrective asset repairs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Work Orders Master Register</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse text-xs">Loading Work Orders...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">WO Number</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Issue</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Est. Cost</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {workOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-emerald-400">{wo.workOrderNumber}</td>
                      <td className="px-4 py-3 text-slate-200">
                        <Link href={`/assets/${wo.assetId}`} className="hover:underline">{wo.asset?.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{wo.issue}</td>
                      <td className="px-4 py-3 font-semibold text-yellow-400">{wo.priority}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(wo.status)}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatCurrency(wo.estimatedCost)}</td>
                      <td className="px-4 py-3 text-right">
                        {wo.status !== "COMPLETED" ? (
                          <button
                            onClick={() => {
                              setSelectedWO(wo);
                              setCompletionNotes(wo.completionNotes || "");
                              setActualCost(wo.actualCost ? wo.actualCost.toString() : "");
                            }}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded"
                          >
                            Update Status
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[11px] font-semibold">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Work Order Modal */}
        {selectedWO && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100">Update {selectedWO.workOrderNumber}</h3>
              <form onSubmit={handleUpdateWorkOrder} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Update Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  >
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Completion Notes *</label>
                  <textarea
                    rows={3}
                    required
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Actual Repair Cost (INR) *</label>
                  <input
                    type="number"
                    required
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setSelectedWO(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded">Save Update</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
