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
  AlertTriangle,
  Layers,
  ArrowLeft,
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

  const fetchAsset = () => {
    setLoading(true);
    fetch(`/api/assets/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setAsset(res.data);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-slate-400 animate-pulse text-xs">
          Loading Asset Lifecycle Profile...
        </div>
      </MainLayout>
    );
  }

  if (!asset) {
    return (
      <MainLayout>
        <div className="p-12 text-center space-y-4">
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
    { id: "lifecycle", label: "Lifecycle History", icon: History },
    { id: "inspections", label: `Inspections (${asset.inspections?.length || 0})`, icon: ClipboardCheck },
    { id: "maintenance", label: `Maintenance (${asset.workOrders?.length || 0})`, icon: Wrench },
    { id: "policies", label: `Policies (${asset.policies?.length || 0})`, icon: Shield },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "audit", label: "Audit Logs", icon: Layers },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
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
              <p className="text-xs text-slate-400 mt-1">{asset.department?.name} &bull; {asset.location?.locality || asset.location?.city}</p>
            </div>

            {/* Quick Actions */}
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

        {/* 9 Profile Tabs */}
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
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Administrative & Departmental Data</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 block">Department</span><span className="font-semibold text-slate-200">{asset.department?.name}</span></div>
                <div><span className="text-slate-500 block">Division</span><span className="font-semibold text-slate-200">{asset.division?.name || "N/A"}</span></div>
                <div><span className="text-slate-500 block">Responsible Officer</span><span className="font-semibold text-slate-200">{asset.responsibleUser?.name || "N/A"}</span></div>
                <div><span className="text-slate-500 block">Vendor / Contractor</span><span className="font-semibold text-slate-200">{asset.vendor?.name || "N/A"}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Procurement & Useful Life</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 block">Installation Date</span><span className="font-semibold text-slate-200">{formatDate(asset.installationDate)}</span></div>
                <div><span className="text-slate-500 block">Commissioning Date</span><span className="font-semibold text-slate-200">{formatDate(asset.commissioningDate)}</span></div>
                <div><span className="text-slate-500 block">Expected Life</span><span className="font-semibold text-slate-200">{asset.expectedLifeYears ? `${asset.expectedLifeYears} Years` : "N/A"}</span></div>
                <div><span className="text-slate-500 block">Purchase Cost</span><span className="font-semibold text-slate-200">{formatCurrency(asset.purchaseCost)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Condition & Risk */}
        {activeTab === "condition" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Explainable Risk & Health Calculation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-500">Condition Score</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{asset.conditionScore}/100</div>
                <p className="text-[11px] text-slate-400 mt-2">Health based on physical, operational and safety inspection evaluations.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-500">Risk Score</div>
                <div className="text-2xl font-bold text-rose-400 mt-1">{asset.riskScore}/100</div>
                <p className="text-[11px] text-slate-400 mt-2">Formula: (100 - Condition)*0.5 + Criticality*0.3 + FailureHistory*0.1 + InspectionOverdue*0.1</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-slate-500">Criticality Weight</div>
                <div className="text-2xl font-bold text-yellow-400 mt-1">{asset.criticality}</div>
                <p className="text-[11px] text-slate-400 mt-2">Importance level of asset if complete functional failure occurs.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Location */}
        {activeTab === "location" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">GIS Location Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><strong className="text-slate-400">Address:</strong> {asset.location?.address || "N/A"}</div>
              <div><strong className="text-slate-400">Zone / Ward:</strong> {asset.location?.zone} ({asset.location?.ward})</div>
              <div><strong className="text-slate-400">Coordinates:</strong> {asset.location?.latitude}, {asset.location?.longitude}</div>
              <div><strong className="text-slate-400">City / State:</strong> {asset.location?.city}, {asset.location?.state}</div>
            </div>
          </div>
        )}

        {/* Tab 4: Lifecycle History */}
        {activeTab === "lifecycle" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Lifecycle Audit Timeline</h3>
            <div className="space-y-3">
              {(asset.lifecycleEvents || []).map((ev: any) => (
                <div key={ev.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-emerald-400">{ev.eventType}</span>
                    <p className="text-slate-300 mt-0.5">{ev.description}</p>
                  </div>
                  <div className="text-right text-slate-500 text-[11px]">
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
            <h3 className="text-sm font-bold text-slate-100">Submitted Inspections</h3>
            <div className="space-y-3">
              {(asset.inspections || []).map((insp: any) => (
                <div key={insp.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Overall Score: {insp.overallScore}/100</span>
                    <span className="text-slate-500">{formatDate(insp.inspectionDate)}</span>
                  </div>
                  <p className="text-slate-400 mt-2 font-normal">Observations: {insp.observations || "None"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Maintenance */}
        {activeTab === "maintenance" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Work Orders & Maintenance History</h3>
            <div className="space-y-3">
              {(asset.workOrders || []).map((wo: any) => (
                <div key={wo.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-400">{wo.workOrderNumber}</span> - {wo.issue}
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
            <h3 className="text-sm font-bold text-slate-100">Active AMC & Warranty Policies</h3>
            <div className="space-y-3">
              {(asset.policies || []).map((pol: any) => (
                <div key={pol.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-bold text-slate-200">{pol.policyType} - {pol.provider}</div>
                  <p className="text-slate-400 mt-1">Coverage: {pol.coverage}</p>
                  <p className="text-slate-500 text-[11px] mt-1">Valid until: {formatDate(pol.endDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Documents */}
        {activeTab === "documents" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Attached Documents</h3>
            <p className="text-slate-400">No documents uploaded yet.</p>
          </div>
        )}

        {/* Tab 9: Audit */}
        {activeTab === "audit" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Append-Only Audit History</h3>
            <p className="text-slate-400">All historical asset mutations are securely logged.</p>
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
      </div>
    </MainLayout>
  );
}
