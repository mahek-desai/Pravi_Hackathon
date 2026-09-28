import { prisma } from "../db";
import { calculateRiskScore, getConditionLabel } from "../utils";
import { createAuditLog } from "../audit";

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
  const { score: riskScore, label: riskLabel } = calculateRiskScore(overallScore, asset.criticality);

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

  // 2. Update asset condition & risk score
  const updatedAsset = await prisma.asset.update({
    where: { id: data.assetId },
    data: {
      conditionScore: overallScore,
      conditionLabel,
      riskScore,
      riskLabel,
      lifecycleStatus: overallScore < 40 ? "UNDER_MAINTENANCE" : asset.lifecycleStatus,
    },
  });

  // 3. Create lifecycle event
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

  // 4. Create Alert if score drops low or risk is critical
  if (overallScore < 40 || riskScore > 75) {
    await prisma.alert.create({
      data: {
        assetId: data.assetId,
        alertType: overallScore < 40 ? "POOR_CONDITION" : "CRITICAL_RISK",
        severity: riskScore > 80 ? "CRITICAL" : "HIGH",
        title: `Low Condition Alert: ${asset.name}`,
        description: `Condition score updated to ${overallScore}/100. Recommendation: ${data.recommendation || "Needs inspection & work order."}`,
        status: "OPEN",
      },
    });
  }

  // 5. Audit log
  await createAuditLog({
    entityType: "INSPECTION",
    entityId: inspection.id,
    action: "SUBMIT",
    performedById: data.inspectorId,
    oldValues: { conditionScore: asset.conditionScore, riskScore: asset.riskScore },
    newValues: { conditionScore: overallScore, riskScore },
    reason: "Submitted field condition assessment",
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
