import { prisma } from "../db";
import { calculateRiskScore, getRiskLabel, getConditionLabel } from "../utils";

/**
 * Calculate the full risk score for an asset using real data from the database
 * - conditionRisk: 50% weight (100 - conditionScore)
 * - criticality: 30% weight  
 * - failureHistory: 10% weight (corrective maintenance / work orders in last 12mo)
 * - inspectionOverdue: 10% weight (days since last inspection was due)
 */
export async function calculateAssetRisk(assetId: string) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      policies: {
        where: { policyType: "INSPECTION_POLICY", status: "ACTIVE" },
        take: 1,
      },
      inspections: {
        orderBy: { inspectionDate: "desc" },
        take: 1,
      },
    },
  });

  if (!asset) throw new Error("ASSET_NOT_FOUND");

  // Get failure count from last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const failureCount = await prisma.workOrder.count({
    where: {
      assetId,
      createdAt: { gte: twelveMonthsAgo },
    },
  });

  // Calculate inspection overdue days
  let inspectionOverdueDays = 0;
  const lastInspection = asset.inspections[0];
  const inspectionPolicy = asset.policies[0];

  if (inspectionPolicy && inspectionPolicy.frequencyDays) {
    if (lastInspection) {
      const nextDueDate = new Date(lastInspection.inspectionDate);
      nextDueDate.setDate(nextDueDate.getDate() + inspectionPolicy.frequencyDays);
      const now = new Date();
      if (now > nextDueDate) {
        inspectionOverdueDays = Math.floor((now.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    } else {
      // Never been inspected – consider overdue from installation/creation
      const refDate = asset.commissioningDate || asset.installationDate || asset.createdAt;
      const nextDueDate = new Date(refDate);
      nextDueDate.setDate(nextDueDate.getDate() + inspectionPolicy.frequencyDays);
      const now = new Date();
      if (now > nextDueDate) {
        inspectionOverdueDays = Math.floor((now.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
  }

  const { score, label } = calculateRiskScore(
    asset.conditionScore,
    asset.criticality,
    failureCount,
    inspectionOverdueDays
  );

  return { score, label, failureCount, inspectionOverdueDays };
}

/**
 * Recalculate and persist risk score for an asset
 */
export async function recalculateAndUpdateRisk(assetId: string) {
  const { score, label } = await calculateAssetRisk(assetId);

  await prisma.asset.update({
    where: { id: assetId },
    data: { riskScore: score, riskLabel: label },
  });

  return { score, label };
}
