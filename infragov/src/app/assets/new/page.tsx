"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { AssetCreationWizard } from "@/components/assets/AssetCreationWizard";

export default function NewAssetPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Infrastructure Asset Creation Wizard</h1>
          <p className="text-xs text-slate-400">Progressive multi-step registration for new government assets</p>
        </div>
        <AssetCreationWizard />
      </div>
    </MainLayout>
  );
}
