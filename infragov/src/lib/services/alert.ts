import { prisma } from "../db";
import { createAuditLog } from "../audit";

/**
 * Alert evaluation service with deduplication.
 * Checks various rules and creates alerts only if no active alert of that type exists for the asset.
 */
export async function evaluateAlerts(assetId: string) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      policies: { where: { status: "ACTIVE" } },
      inspections: { orderBy: { inspectionDate: "desc" }, take: 1 },
      workOrders: { where: { createdAt: { gte: getDateMonthsAgo(12) } } },
    },
  });

  if (!asset) return;

  const alertsToCreate: Array<{
    alertType: string;
    severity: string;
    title: string;
    description: string;
    dueDate?: Date;
  }> = [];

  // Rule 1: Condition < 40
  if (asset.conditionScore < 40) {
    alertsToCreate.push({
      alertType: "POOR_CONDITION",
      severity: asset.conditionScore < 25 ? "CRITICAL" : "HIGH",
      title: `Poor Condition: ${asset.name}`,
      description: `Condition score dropped to ${asset.conditionScore}/100 (${asset.conditionLabel}). Maintenance recommended.`,
    });
  }

  // Rule 2: Risk > 80
  if (asset.riskScore > 80) {
    alertsToCreate.push({
      alertType: "CRITICAL_RISK",
      severity: "CRITICAL",
      title: `Critical Risk: ${asset.name}`,
      description: `Risk score is ${asset.riskScore}/100 (${asset.riskLabel}). Immediate attention required.`,
    });
  }

  // Rule 3: Failures >= 3 in 12 months
  if (asset.workOrders.length >= 3) {
    alertsToCreate.push({
      alertType: "REPEATED_FAILURES",
      severity: "HIGH",
      title: `Repeated Failures: ${asset.name}`,
      description: `${asset.workOrders.length} work orders created in the last 12 months. Consider replacement or overhaul.`,
    });
  }

  // Rule 4: Warranty expiry within 30 days
  const warranties = asset.policies.filter(p => p.policyType === "WARRANTY" && p.endDate);
  for (const w of warranties) {
    const daysUntilExpiry = Math.floor((new Date(w.endDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
      alertsToCreate.push({
        alertType: "WARRANTY_EXPIRY",
        severity: daysUntilExpiry <= 7 ? "HIGH" : "MEDIUM",
        title: `Warranty Expiring: ${asset.name}`,
        description: `Warranty from ${w.provider || "vendor"} expires in ${daysUntilExpiry} days.`,
        dueDate: w.endDate!,
      });
    }
  }

  // Rule 5: AMC expiry within 30 days
  const amcs = asset.policies.filter(p => p.policyType === "AMC" && p.endDate);
  for (const a of amcs) {
    const daysUntilExpiry = Math.floor((new Date(a.endDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
      alertsToCreate.push({
        alertType: "AMC_EXPIRY",
        severity: daysUntilExpiry <= 7 ? "HIGH" : "MEDIUM",
        title: `AMC Expiring: ${asset.name}`,
        description: `AMC contract from ${a.provider || "vendor"} expires in ${daysUntilExpiry} days.`,
        dueDate: a.endDate!,
      });
    }
  }

  // Rule 6: Useful life near end (within 1 year)
  if (asset.expectedLifeYears && asset.installationDate) {
    const endOfLife = new Date(asset.installationDate);
    endOfLife.setFullYear(endOfLife.getFullYear() + asset.expectedLifeYears);
    const daysUntilEOL = Math.floor((endOfLife.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilEOL >= 0 && daysUntilEOL <= 365) {
      alertsToCreate.push({
        alertType: "END_OF_LIFE",
        severity: daysUntilEOL <= 90 ? "HIGH" : "MEDIUM",
        title: `End of Life Approaching: ${asset.name}`,
        description: `Asset expected useful life ends in ${daysUntilEOL} days. Plan for replacement or renewal.`,
      });
    }
  }

  // Deduplicate: only create alerts that don't already have an active (OPEN/ACKNOWLEDGED) version
  for (const alert of alertsToCreate) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        assetId,
        alertType: alert.alertType,
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
    });

    if (!existingAlert) {
      await prisma.alert.create({
        data: {
          assetId,
          ...alert,
          status: "OPEN",
        },
      });
    }
  }
}

/**
 * Update an alert's status (acknowledge, resolve, dismiss)
 */
export async function updateAlertStatus(
  alertId: string,
  status: "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED",
  userId: string
) {
  const alert = await prisma.alert.findUnique({ where: { id: alertId } });
  if (!alert) throw new Error("Alert not found");

  const isResolving = status === "RESOLVED" || status === "DISMISSED";

  const updated = await prisma.alert.update({
    where: { id: alertId },
    data: {
      status,
      resolvedAt: isResolving ? new Date() : undefined,
      resolvedById: isResolving ? userId : undefined,
    },
  });

  await createAuditLog({
    entityType: "ALERT",
    entityId: alertId,
    action: `ALERT_${status}`,
    performedById: userId,
    oldValues: { status: alert.status },
    newValues: { status },
    reason: `Alert ${status.toLowerCase()} by user`,
  });

  return updated;
}

function getDateMonthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}
