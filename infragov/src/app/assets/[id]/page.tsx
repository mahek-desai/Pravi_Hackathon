"use client";

import { use, useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Building2,
  MapPin,
  ClipboardCheck,
  Wrench,
  Shield,
  History,
  FileText,
  Activity,
  Layers,
  ArrowLeft,
  Plus,
  ArrowRightLeft,
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
        <div className="p-8 text-center text-slate-400 animate-pulse text-xs select-none">
          Loading Asset Lifecycle Profile...
        </div>
      </MainLayout>
    );
  }

  if (!asset) {
    return (
      <MainLayout>
        <div className="p-12 text-center space-y-4 select-none">
          <h2 className="text-lg font-bold text-slate-200">Asset Not Found</h2>
          <Link href="/assets" className="text-xs text-emerald-400 underline">
            &larr; Return to Asset Register
          </Link>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "condition", label: "Condition & Risk", icon: Activity },
    { id: "location", label: "Location / GIS", icon: MapPin },
    { id: "lifecycle", label: `Lifecycle History (${asset.lifecycleEvents?.length || 0})`, icon: History },
    { id: "inspections", label: `Inspections (${asset.inspections?.length || 0})`, icon: ClipboardCheck },
    { id: "maintenance", label: `Maintenance (${asset.workOrders?.length || 0})`, icon: Wrench },
    { id: "policies", label: `Policies (${asset.policies?.length || 0})`, icon: Shield },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 select-none">
        {/* Header Navigation */}
        <Link href="/assets" className="inline-flex items-center text-xs text-slate-400 hover:text-emerald-400 space-x-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assets Inventory</span>
        </Link>

        {/* Profile Banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                <span>{asset.category?.name}</span>
                <span>&bull;</span>
                <span className="text-slate-300">{asset.assetCode}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mt-1">{asset.name}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {asset.department?.name} &bull; {asset.location?.locality || asset.location?.city || "Ahmedabad"}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowInspectionModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-900/30"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>+ Inspect Asset</span>
              </button>

              <button
                onClick={() => setShowWorkOrderModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-all border border-slate-700"
              >
                <Wrench className="w-4 h-4 text-yellow-400" />
                <span>+ Work Order</span>
              </button>

              <button
                onClick={() => {
                  setNewStatus(asset.lifecycleStatus);
                  setShowLifecycleModal(true);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-all border border-slate-700"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>Transition Stage</span>
              </button>
            </div>
          </div>

          {/* Badges Strip */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(asset.lifecycleStatus)}`}>
              Status: {asset.lifecycleStatus}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getConditionColor(asset.conditionLabel)}`}>
              Condition: {asset.conditionScore}/100 ({asset.conditionLabel})
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getRiskColor(asset.riskLabel)}`}>
              Risk Score: {asset.riskScore}/100 ({asset.riskLabel})
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getCriticalityColor(asset.criticality)}`}>
              Criticality: {asset.criticality}
            </span>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="border-b border-slate-800 flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-slate-900/60"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Administrative & Governance Data</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 block">Department</span><span className="font-semibold text-slate-200">{asset.department?.name}</span></div>
                <div><span className="text-slate-500 block">Division / Unit</span><span className="font-semibold text-slate-200">{asset.division?.name || "N/A"}</span></div>
                <div><span className="text-slate-500 block">Responsible Inspector</span><span className="font-semibold text-slate-200">{asset.responsibleUser?.name || "Unassigned"}</span></div>
                <div><span className="text-slate-500 block">Contractor / Vendor</span><span className="font-semibold text-slate-200">{asset.vendor?.name || "L&T Infra Contractors"}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Procurement & Specifications</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 block">Installation Date</span><span className="font-semibold text-slate-200">{formatDate(asset.installationDate)}</span></div>
                <div><span className="text-slate-500 block">Commissioning Date</span><span className="font-semibold text-slate-200">{formatDate(asset.commissioningDate)}</span></div>
                <div><span className="text-slate-500 block">Expected Useful Life</span><span className="font-semibold text-slate-200">{asset.expectedLifeYears ? `${asset.expectedLifeYears} Years` : "N/A"}</span></div>
                <div><span className="text-slate-500 block">Purchase Cost</span><span className="font-semibold text-slate-200">{formatCurrency(asset.purchaseCost)}</span></div>
                <div><span className="text-slate-500 block">Manufacturer</span><span className="font-semibold text-slate-200">{asset.manufacturer || "N/A"}</span></div>
                <div><span className="text-slate-500 block">Model & Serial</span><span className="font-semibold text-slate-200">{asset.model || "N/A"} / {asset.serialNumber || "N/A"}</span></div>
              </div>
            </div>

            {asset.description && (
              <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 text-xs">
                <h3 className="text-xs font-bold text-slate-300">Functional Description</h3>
                <p className="text-slate-400 leading-relaxed">{asset.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Condition & Risk */}
        {activeTab === "condition" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Explainable Asset Risk & Condition Engine</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-500">Physical Condition Score</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{asset.conditionScore}/100</div>
                <p className="text-[11px] text-slate-400 mt-2">Weighted average of physical, operational and safety inspection ratings.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-500">Calculated Risk Index</div>
                <div className="text-2xl font-bold text-rose-400 mt-1">{asset.riskScore}/100</div>
                <p className="text-[11px] text-slate-400 mt-2">Dynamic risk combining condition decay, failure history, criticality weight, and inspection overdue days.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-500">Infrastructure Criticality</div>
                <div className="text-2xl font-bold text-yellow-400 mt-1">{asset.criticality}</div>
                <p className="text-[11px] text-slate-400 mt-2">System criticality level determining response urgency and SLA threshold.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Location / GIS */}
        {activeTab === "location" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">GIS Coordinates & Municipal Territory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong className="text-slate-400">Address:</strong> {asset.location?.address || "N/A"}</div>
              <div><strong className="text-slate-400">Zone / Ward:</strong> {asset.location?.zone} ({asset.location?.ward})</div>
              <div><strong className="text-slate-400">Latitude & Longitude:</strong> {asset.location?.latitude}, {asset.location?.longitude}</div>
              <div><strong className="text-slate-400">City / District / State:</strong> {asset.location?.city}, {asset.location?.district}, {asset.location?.state}</div>
            </div>
          </div>
        )}

        {/* Tab 4: Lifecycle History */}
        {activeTab === "lifecycle" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Audit-Stamped Lifecycle Stage Audit Log</h3>
            <div className="space-y-3">
              {(asset.lifecycleEvents || []).map((ev: any) => (
                <div key={ev.id} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-emerald-400">{ev.eventType}</span>
                      {ev.oldStatus && ev.newStatus && (
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                          {ev.oldStatus} &rarr; {ev.newStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 mt-1">{ev.description}</p>
                  </div>
                  <div className="text-right text-slate-500 text-[11px] shrink-0 ml-4">
                    {formatDateTime(ev.eventDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Inspections */}
        {activeTab === "inspections" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-100">Physical Inspection History Log</h3>
              <button
                onClick={() => setShowInspectionModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded text-xs"
              >
                + New Inspection
              </button>
            </div>
            <div className="space-y-3">
              {(asset.inspections || []).map((insp: any) => (
                <div key={insp.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span className="text-emerald-400 font-bold">Overall Score: {insp.overallScore}/100</span>
                    <span className="text-slate-500 text-[11px]">{formatDate(insp.inspectionDate)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <div>Physical: {insp.physicalConditionScore}/100</div>
                    <div>Operational: {insp.operationalConditionScore}/100</div>
                    <div>Safety: {insp.safetyScore}/100</div>
                  </div>
                  <p className="text-slate-300 font-normal">Observations: {insp.observations || "None"}</p>
                  {insp.recommendation && <p className="text-yellow-400 font-normal">Recommendation: {insp.recommendation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Maintenance */}
        {activeTab === "maintenance" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-100">Work Orders & Maintenance Log</h3>
              <button
                onClick={() => setShowWorkOrderModal(true)}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-3 py-1.5 rounded text-xs"
              >
                + New Work Order
              </button>
            </div>
            <div className="space-y-3">
              {(asset.workOrders || []).map((wo: any) => (
                <div key={wo.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-400">{wo.workOrderNumber}</span> - <span className="text-slate-200 font-semibold">{wo.issue}</span>
                    <p className="text-slate-400 mt-1">{wo.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(wo.status)}`}>
                    {wo.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Policies */}
        {activeTab === "policies" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-100">Vendor Warranties, AMCs & SLAs</h3>
              <button
                onClick={() => setShowPolicyModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded text-xs"
              >
                + Add Policy / AMC
              </button>
            </div>
            <div className="space-y-3">
              {(asset.policies || []).map((pol: any) => (
                <div key={pol.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-slate-200">{pol.policyType} - {pol.provider || "L&T Maintenance"}</div>
                  <p className="text-slate-400 mt-1">Coverage: {pol.coverage || "Standard Coverage"}</p>
                  <p className="text-slate-500 text-[11px] mt-1">Valid until: {formatDate(pol.endDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Documents */}
        {activeTab === "documents" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Attached Documents & Invoices</h3>
            <p className="text-slate-400">No documents attached to this asset record yet.</p>
          </div>
        )}

        {/* Submit Inspection Modal */}
        {showInspectionModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100">Submit Field Inspection Report</h3>
              <form onSubmit={handleSubmitInspection} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Physical Condition (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inspectionForm.physicalConditionScore}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, physicalConditionScore: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
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
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
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
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inspector Observations</label>
                  <textarea
                    rows={3}
                    value={inspectionForm.observations}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, observations: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowInspectionModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Work Order Modal */}
        {showWorkOrderModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100">Issue Maintenance Work Order</h3>
              <form onSubmit={handleCreateWorkOrder} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issue Summary *</label>
                  <input
                    type="text"
                    required
                    value={workOrderForm.issue}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, issue: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={workOrderForm.priority}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, priority: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Repair Cost (INR)</label>
                  <input
                    type="number"
                    value={workOrderForm.estimatedCost}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, estimatedCost: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowWorkOrderModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded">Issue Work Order</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100">Add Asset Policy / AMC Contract</h3>
              <form onSubmit={handleAddPolicy} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Policy Type *</label>
                  <select
                    value={policyForm.policyType}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyType: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  >
                    <option value="WARRANTY">Warranty</option>
                    <option value="AMC">Annual Maintenance Contract (AMC)</option>
                    <option value="SLA">Service Level Agreement (SLA)</option>
                    <option value="INSPECTION_POLICY">Inspection Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contractor / Provider *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. L&T Infrastructure Services"
                    value={policyForm.provider}
                    onChange={(e) => setPolicyForm({ ...policyForm, provider: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Coverage Scope</label>
                  <input
                    type="text"
                    placeholder="e.g. Full mechanical & electronic component replacement"
                    value={policyForm.coverage}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverage: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contract End Date</label>
                  <input
                    type="date"
                    value={policyForm.endDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowPolicyModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded">Add Policy</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transition Lifecycle Modal */}
        {showLifecycleModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-100">Transition Lifecycle Status</h3>
              <form onSubmit={handleTransitionLifecycle} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Lifecycle Stage *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200 font-semibold"
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
                    className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowLifecycleModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded">Apply Transition</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
