import { prisma } from "../db";
import { getConditionLabel } from "../utils";
import { createAuditLog } from "../audit";
import { recalculateAndUpdateRisk } from "./risk";
import { evaluateAlerts } from "./alert";

export async function submitInspection(data: {
  assetId: string;
  inspectorId: string;
  inspectionDate: string;
  physicalConditionScore: number;
  operationalConditionScore: number;
  safetyScore: number;
  observations?: string;
  recommendation?: string;
}) {
  const asset = await prisma.asset.findUnique({
    where: { id: data.assetId },
  });

  if (!asset) throw new Error("ASSET_NOT_FOUND");

  const overallScore = Math.round(
    data.physicalConditionScore * 0.4 +
    data.operationalConditionScore * 0.4 +
    data.safetyScore * 0.2
  );

  const conditionLabel = getConditionLabel(overallScore);

  // 1. Create inspection record
  const inspection = await prisma.inspection.create({
    data: {
      assetId: data.assetId,
      inspectorId: data.inspectorId,
      inspectionDate: new Date(data.inspectionDate),
      physicalConditionScore: data.physicalConditionScore,
      operationalConditionScore: data.operationalConditionScore,
      safetyScore: data.safetyScore,
      overallScore,
      observations: data.observations || null,
      recommendation: data.recommendation || null,
    },
  });

  // 2. Update asset condition score and label
  const newLifecycle = overallScore < 40 && asset.lifecycleStatus === "OPERATIONAL" 
    ? "UNDER_MAINTENANCE" 
    : asset.lifecycleStatus;

  await prisma.asset.update({
    where: { id: data.assetId },
    data: {
      conditionScore: overallScore,
      conditionLabel,
      lifecycleStatus: newLifecycle,
      operationalStatus: overallScore < 40 ? "DEGRADED" : asset.operationalStatus,
    },
  });

  // 3. Recalculate risk using full engine (failure history + overdue + condition + criticality)
  const { score: riskScore, label: riskLabel } = await recalculateAndUpdateRisk(data.assetId);

  // 4. Create lifecycle event
  await prisma.lifecycleEvent.create({
    data: {
      assetId: data.assetId,
      eventType: "INSPECTION_SUBMITTED",
      eventDate: new Date(data.inspectionDate),
      performedById: data.inspectorId,
      oldStatus: asset.conditionLabel,
      newStatus: conditionLabel,
      description: `Inspection score: ${overallScore}/100. ${data.observations || ""}`,
    },
  });

  // 5. Evaluate and trigger alerts with deduplication
  await evaluateAlerts(data.assetId);

  // 6. Audit log
  await createAuditLog({
    entityType: "INSPECTION",
    entityId: inspection.id,
    action: "SUBMIT",
    performedById: data.inspectorId,
    oldValues: { conditionScore: asset.conditionScore, riskScore: asset.riskScore },
    newValues: { conditionScore: overallScore, riskScore },
    reason: "Submitted field condition assessment",
  });

  const updatedAsset = await prisma.asset.findUnique({
    where: { id: data.assetId },
  });

  return { inspection, updatedAsset };
}

export async function getInspections(filters?: { assetId?: string; inspectorId?: string }) {
  const where: any = {};
  if (filters?.assetId) where.assetId = filters.assetId;
  if (filters?.inspectorId) where.inspectorId = filters.inspectorId;

  return prisma.inspection.findMany({
    where,
    include: {
      asset: { select: { id: true, name: true, assetCode: true } },
      inspector: { select: { id: true, name: true, email: true } },
    },
    orderBy: { inspectionDate: "desc" },
  });
}
