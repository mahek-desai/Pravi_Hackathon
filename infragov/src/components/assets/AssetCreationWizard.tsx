"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Building2, MapPin, Cpu, Shield, FileCheck, Layers } from "lucide-react";

export function AssetCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: "",
    assetTypeId: "",
    name: "",
    departmentId: "",
    divisionId: "",
    criticality: "MEDIUM",
    operationalStatus: "ACTIVE",
    description: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseCost: "",
    expectedLifeYears: "10",
    installationDate: "",
    commissioningDate: "",
    location: {
      address: "",
      city: "Ahmedabad",
      state: "Gujarat",
      zone: "West Zone",
      ward: "Ward 12",
      locality: "",
      latitude: 23.0225,
      longitude: 72.5714,
    },
    technicalMetadata: {} as Record<string, any>,
    policy: {
      policyType: "WARRANTY",
      provider: "",
      coverage: "",
      endDate: "",
    },
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/departments").then((res) => res.json()),
    ])
      .then(([catRes, deptRes]) => {
        if (catRes.success) setCategories(catRes.data);
        if (deptRes.success) setDepartments(deptRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const availableAssetTypes = selectedCategory?.assetTypes || [];
  const selectedDepartment = departments.find((d) => d.id === formData.departmentId);
  const availableDivisions = selectedDepartment?.divisions || [];

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        assetTypeId: formData.assetTypeId,
        departmentId: formData.departmentId,
        divisionId: formData.divisionId || undefined,
        criticality: formData.criticality,
        operationalStatus: formData.operationalStatus,
        description: formData.description || undefined,
        manufacturer: formData.manufacturer || undefined,
        model: formData.model || undefined,
        serialNumber: formData.serialNumber || undefined,
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : undefined,
        expectedLifeYears: formData.expectedLifeYears ? parseInt(formData.expectedLifeYears) : undefined,
        installationDate: formData.installationDate || undefined,
        commissioningDate: formData.commissioningDate || undefined,
        technicalMetadataJson: JSON.stringify(formData.technicalMetadata),
        location: formData.location,
      };

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/assets/${data.data.id}`);
      } else {
        alert(data.error?.message || "Failed to create asset");
      }
    } catch (e: any) {
      alert("Error creating asset: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { title: "Category", icon: Layers },
    { title: "Asset Type", icon: Building2 },
    { title: "Basic Info", icon: Building2 },
    { title: "Location", icon: MapPin },
    { title: "Technical", icon: Cpu },
    { title: "Policies", icon: Shield },
    { title: "Review", icon: FileCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stepper Progress Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            const Icon = s.icon;

            return (
              <div key={s.title} className="flex items-center space-x-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-900/30"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`hidden md:block text-xs font-medium ${
                    isCurrent ? "text-emerald-400" : isDone ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
                {idx < steps.length - 1 && <div className="w-4 md:w-8 h-[1px] bg-slate-800"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        {/* Step 1: Select Category */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 1: Select Infrastructure Category</h2>
              <p className="text-xs text-slate-400">Choose the primary municipal or public domain category for the asset.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, categoryId: cat.id, assetTypeId: "" })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.categoryId === cat.id
                      ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-900/20"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-200">{cat.name}</div>
                  <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Asset Type */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 2: Select Asset Type</h2>
              <p className="text-xs text-slate-400">Select specific asset classification under {selectedCategory?.name}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAssetTypes.map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => setFormData({ ...formData, assetTypeId: t.id })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.assetTypeId === t.id
                      ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-900/20"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-200">{t.name}</div>
                  <p className="text-xs text-slate-400 mt-1">Type Code: {t.code}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Basic Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 3: Basic Information</h2>
              <p className="text-xs text-slate-400">Provide core identifying parameters and ownership details.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smart LED Streetlight Pole #402"
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Managing Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, divisionId: "" })}
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Division / Unit</label>
                <select
                  value={formData.divisionId}
                  onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Division</option>
                  {availableDivisions.map((div: any) => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Criticality Level</label>
                <select
                  value={formData.criticality}
                  onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="LOW">Low Criticality</option>
                  <option value="MEDIUM">Medium Criticality</option>
                  <option value="HIGH">High Criticality</option>
                  <option value="CRITICAL">Critical (System-Essential)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Useful Life (Years)</label>
                <input
                  type="number"
                  value={formData.expectedLifeYears}
                  onChange={(e) => setFormData({ ...formData, expectedLifeYears: e.target.value })}
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed functional and operational description..."
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 4: Location & Spatial Data</h2>
              <p className="text-xs text-slate-400">Specify exact GIS coordinates and municipal ward/zone boundary.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address / Landmark</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, address: e.target.value },
                    })
                  }
                  placeholder="e.g. Near SG Highway Flyover, Bodakdev"
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Zone</label>
                <input
                  type="text"
                  value={formData.location.zone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, zone: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ward Number</label>
                <input
                  type="text"
                  value={formData.location.ward}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, ward: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.location.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, latitude: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.location.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, longitude: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Technical Details */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 5: Technical & Procurement Data</h2>
              <p className="text-xs text-slate-400">Optional technical specifications and vendor details.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g. Siemens / L&T"
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Model Number</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Procurement Cost (INR)</label>
                <input
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                  placeholder="e.g. 250000"
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Policies */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 6: Warranty & AMC Coverage</h2>
              <p className="text-xs text-slate-400">Configure initial warranty or annual maintenance contract.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Policy Type</label>
                <select
                  value={formData.policy.policyType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      policy: { ...formData.policy, policyType: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="WARRANTY">Warranty</option>
                  <option value="AMC">Annual Maintenance Contract (AMC)</option>
                  <option value="SLA">Service Level Agreement (SLA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contract Provider / Vendor</label>
                <input
                  type="text"
                  value={formData.policy.provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      policy: { ...formData.policy, provider: e.target.value },
                    })
                  }
                  placeholder="e.g. L&T Maintenance Ltd"
                  className="w-full bg-slate-950 text-sm text-slate-200 rounded-lg p-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 7: Final Review & Confirmation</h2>
              <p className="text-xs text-slate-400">Review all details before commissioning into database.</p>
            </div>
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div><strong className="text-slate-400">Name:</strong> {formData.name}</div>
              <div><strong className="text-slate-400">Category:</strong> {selectedCategory?.name}</div>
              <div><strong className="text-slate-400">Department:</strong> {selectedDepartment?.name}</div>
              <div><strong className="text-slate-400">Criticality:</strong> {formData.criticality}</div>
              <div><strong className="text-slate-400">Address:</strong> {formData.location.address}, {formData.location.zone}</div>
              <div><strong className="text-slate-400">Coordinates:</strong> {formData.location.latitude}, {formData.location.longitude}</div>
              <div><strong className="text-slate-400">Cost:</strong> ₹{formData.purchaseCost || "0"}</div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 7 ? (
            <button
              disabled={
                (step === 1 && !formData.categoryId) ||
                (step === 2 && !formData.assetTypeId) ||
                (step === 3 && (!formData.name || !formData.departmentId))
              }
              onClick={() => setStep((s) => Math.min(7, s + 1))}
              className="flex items-center space-x-1 text-xs font-semibold text-white px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-900/30"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={submitting}
              onClick={handleCreate}
              className="flex items-center space-x-1 text-xs font-bold text-white px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-900/40"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? "Commissioning Asset..." : "Commission Asset Now"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
