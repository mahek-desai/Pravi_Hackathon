"use client";

import { use, useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Asset3DViewer } from "@/components/ui/3d/Asset3DViewer";
import {
  Building2,
  MapPin,
  ClipboardCheck,
  Wrench,
  Shield,
  History,
  FileText,
  Activity,
  ArrowLeft,
  ArrowRightLeft,
  Cpu,
  Box,
} from "lucide-react";
import Link from "next/link";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getConditionColor,
  getRiskColor,
  getStatusColor,
  getCriticalityColor,
} from "@/lib/utils";

export default function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Inspection modal state
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    physicalConditionScore: 80,
    operationalConditionScore: 80,
    safetyScore: 80,
    observations: "",
    recommendation: "",
  });

  // Work order modal state
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState({
    issue: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    estimatedCost: "",
  });

  // Policy modal state
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    policyType: "WARRANTY",
    provider: "",
    coverage: "",
    startDate: "",
    endDate: "",
  });

  // Lifecycle transition modal state
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [newStatus, setNewStatus] = useState("OPERATIONAL");
  const [transitionNotes, setTransitionNotes] = useState("");

  const fetchAsset = () => {
    setLoading(true);
    fetch(`/api/assets/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setAsset(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAsset();
  }, [resolvedParams.id]);

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: resolvedParams.id,
          inspectionDate: new Date().toISOString(),
          ...inspectionForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowInspectionModal(false);
        fetchAsset();
      } else {
        alert(data.error?.message || "Failed to submit inspection");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: resolvedParams.id,
          ...workOrderForm,
          estimatedCost: workOrderForm.estimatedCost ? parseFloat(workOrderForm.estimatedCost) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowWorkOrderModal(false);
        fetchAsset();
      } else {
        alert(data.error?.message || "Failed to create work order");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: resolvedParams.id,
          ...policyForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPolicyModal(false);
        fetchAsset();
      } else {
        alert(data.error?.message || "Failed to add policy");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleTransitionLifecycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: resolvedParams.id,
          newStatus,
          notes: transitionNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLifecycleModal(false);
        fetchAsset();
      } else {
        alert(data.error?.message || "Failed to transition lifecycle status");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-12 text-center text-slate-400 font-mono animate-pulse text-xs select-none space-y-3">
          <Cpu className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <div>Loading Asset Lifecycle Telemetry...</div>
        </div>
      </MainLayout>
    );
  }

  if (!asset) {
    return (
      <MainLayout>
        <div className="p-12 text-center space-y-4 select-none">
          <h2 className="text-lg font-bold text-slate-200">Asset Record Not Found</h2>
          <Link href="/assets" className="text-xs text-emerald-400 underline">
            &larr; Return to Central Asset Register
          </Link>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "3dmodel", label: "3D Structural Model", icon: Box },
    { id: "condition", label: "Condition & Risk Engine", icon: Activity },
    { id: "location", label: "Location / GIS", icon: MapPin },
    { id: "lifecycle", label: `Lifecycle Log (${asset.lifecycleEvents?.length || 0})`, icon: History },
    { id: "inspections", label: `Inspections (${asset.inspections?.length || 0})`, icon: ClipboardCheck },
    { id: "maintenance", label: `Work Orders (${asset.workOrders?.length || 0})`, icon: Wrench },
    { id: "policies", label: `Policies & AMCs (${asset.policies?.length || 0})`, icon: Shield },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 select-none pb-8">
        {/* Navigation Breadcrumb */}
        <Link href="/assets" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-400 space-x-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Central Asset Register</span>
        </Link>

        {/* High-Tech Asset Banner */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] line-gradient-emerald" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400">
                <span>{asset.category?.name}</span>
                <span>&bull;</span>
                <span className="text-slate-300">{asset.assetCode}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mt-1 font-mono tracking-tight">{asset.name}</h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {asset.department?.name} &bull; {asset.location?.locality || asset.location?.city || "Ahmedabad"}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowInspectionModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-950/40 border border-emerald-400/30"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>+ Inspect Asset</span>
              </button>

              <button
                onClick={() => setShowWorkOrderModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all border border-slate-700 shadow-md"
              >
                <Wrench className="w-4 h-4 text-yellow-400" />
                <span>+ Work Order</span>
              </button>

              <button
                onClick={() => {
                  setNewStatus(asset.lifecycleStatus);
                  setShowLifecycleModal(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all border border-slate-700 shadow-md"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>Transition Stage</span>
              </button>
            </div>
          </div>

          {/* Badges Strip */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80 font-mono text-xs">
            <span className={`px-2.5 py-1 rounded-lg font-bold border ${getStatusColor(asset.lifecycleStatus)}`}>
              Status: {asset.lifecycleStatus}
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold border ${getConditionColor(asset.conditionLabel)}`}>
              Condition: {asset.conditionScore}/100 ({asset.conditionLabel})
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold border ${getRiskColor(asset.riskLabel)}`}>
              Risk Index: {asset.riskScore}/100 ({asset.riskLabel})
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold border ${getCriticalityColor(asset.criticality)}`}>
              Criticality: {asset.criticality}
            </span>
          </div>
        </div>

        {/* Cyber Navigation Tabs */}
        <div className="border-b border-slate-800/80 flex space-x-1 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-slate-900/80 rounded-t-xl"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: 3D Structural Model */}
        {activeTab === "3dmodel" && (
          <div className="space-y-4">
            <Asset3DViewer
              categoryCode={asset.assetType?.code || asset.category?.name}
              assetName={asset.name}
              conditionScore={asset.conditionScore}
              riskScore={asset.riskScore}
              height="450px"
            />
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono border-b border-slate-800 pb-2">
                Administrative & Governance Data
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 font-mono block">Department</span><span className="font-semibold text-slate-200">{asset.department?.name}</span></div>
                <div><span className="text-slate-500 font-mono block">Division / Unit</span><span className="font-semibold text-slate-200">{asset.division?.name || "N/A"}</span></div>
                <div><span className="text-slate-500 font-mono block">Responsible Inspector</span><span className="font-semibold text-slate-200">{asset.responsibleUser?.name || "Unassigned"}</span></div>
                <div><span className="text-slate-500 font-mono block">Contractor / Vendor</span><span className="font-semibold text-slate-200">{asset.vendor?.name || "L&T Infra Contractors"}</span></div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 font-mono border-b border-slate-800 pb-2">
                Procurement & Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 font-mono block">Installation Date</span><span className="font-semibold text-slate-200">{formatDate(asset.installationDate)}</span></div>
                <div><span className="text-slate-500 font-mono block">Commissioning Date</span><span className="font-semibold text-slate-200">{formatDate(asset.commissioningDate)}</span></div>
                <div><span className="text-slate-500 font-mono block">Expected Useful Life</span><span className="font-semibold text-slate-200">{asset.expectedLifeYears ? `${asset.expectedLifeYears} Years` : "N/A"}</span></div>
                <div><span className="text-slate-500 font-mono block">Purchase Cost</span><span className="font-semibold text-slate-200">{formatCurrency(asset.purchaseCost)}</span></div>
                <div><span className="text-slate-500 font-mono block">Manufacturer</span><span className="font-semibold text-slate-200">{asset.manufacturer || "N/A"}</span></div>
                <div><span className="text-slate-500 font-mono block">Model & Serial</span><span className="font-semibold text-slate-200">{asset.model || "N/A"} / {asset.serialNumber || "N/A"}</span></div>
              </div>
            </div>

            {asset.description && (
              <div className="col-span-1 md:col-span-2 glass-panel p-5 rounded-2xl space-y-2 text-xs">
                <h3 className="text-xs font-bold font-mono text-emerald-400">Functional Description</h3>
                <p className="text-slate-300 leading-relaxed">{asset.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Condition & Risk */}
        {activeTab === "condition" && (
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h3 className="text-sm font-bold text-slate-100 font-mono">Explainable Asset Risk & Condition Engine</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-mono">Physical Condition Score</div>
                <div className="text-3xl font-bold text-emerald-400 font-mono mt-2 glow-emerald">{asset.conditionScore}/100</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Weighted combination of physical integrity, operational metrics, and safety inspections.
                </p>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-mono">Calculated Risk Index</div>
                <div className="text-3xl font-bold text-rose-400 font-mono mt-2 glow-rose">{asset.riskScore}/100</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Dynamic risk calculation factoring decay rate, historical failures, criticality weight, and inspection overdue days.
                </p>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-mono">Infrastructure Criticality</div>
                <div className="text-3xl font-bold text-amber-400 font-mono mt-2">{asset.criticality}</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Public safety importance rating dictating inspection frequency and SLA response urgency.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Location / GIS */}
        {activeTab === "location" && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 text-xs font-mono">
            <h3 className="text-sm font-bold text-slate-100">GIS Coordinates & Municipal Territory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong className="text-slate-400">Address:</strong> {asset.location?.address || "N/A"}</div>
              <div><strong className="text-slate-400">Zone / Ward:</strong> {asset.location?.zone} ({asset.location?.ward})</div>
              <div><strong className="text-slate-400">Latitude & Longitude:</strong> {asset.location?.latitude}, {asset.location?.longitude}</div>
              <div><strong className="text-slate-400">City / District / State:</strong> {asset.location?.city}, {asset.location?.district}, {asset.location?.state}</div>
            </div>
          </div>
        )}

        {/* Tab 4: Lifecycle Log */}
        {activeTab === "lifecycle" && (
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono">Audit-Stamped Lifecycle Stage Audit Log</h3>
            <div className="space-y-3">
              {(asset.lifecycleEvents || []).map((ev: any) => (
                <div key={ev.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-emerald-400 font-mono">{ev.eventType}</span>
                      {ev.oldStatus && ev.newStatus && (
                        <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                          {ev.oldStatus} &rarr; {ev.newStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 mt-1">{ev.description}</p>
                  </div>
                  <div className="text-right text-slate-500 font-mono text-[11px] shrink-0 ml-4">
                    {formatDateTime(ev.eventDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals for Inspection, Work Order, Policy, Lifecycle Transition */}
        {showInspectionModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-panel rounded-2xl p-6 max-w-lg w-full space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 font-mono">Submit Field Inspection Report</h3>
              <form onSubmit={handleSubmitInspection} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Physical Condition (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inspectionForm.physicalConditionScore}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, physicalConditionScore: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Operational Health (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inspectionForm.operationalConditionScore}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, operationalConditionScore: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Safety Rating (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inspectionForm.safetyScore}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, safetyScore: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inspector Observations</label>
                  <textarea
                    rows={3}
                    value={inspectionForm.observations}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, observations: e.target.value })}
                    className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowInspectionModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lifecycle Stage Transition Modal */}
        {showLifecycleModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-panel rounded-2xl p-6 max-w-lg w-full space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100 font-mono">Transition Lifecycle Status</h3>
              <form onSubmit={handleTransitionLifecycle} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Lifecycle Stage *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200 font-semibold"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="PROCURED">PROCURED</option>
                    <option value="INSTALLED">INSTALLED</option>
                    <option value="COMMISSIONED">COMMISSIONED</option>
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                    <option value="REPAIRED">REPAIRED</option>
                    <option value="RENEWED">RENEWED</option>
                    <option value="RETIRED">RETIRED</option>
                    <option value="DISPOSED">DISPOSED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Transition Notes / Audit Reason</label>
                  <textarea
                    rows={3}
                    placeholder="Reason for lifecycle stage transition..."
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowLifecycleModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-xl">Apply Transition</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
