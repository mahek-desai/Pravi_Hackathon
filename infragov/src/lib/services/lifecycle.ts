import { prisma } from "../db";
import { createAuditLog } from "../audit";
import { LIFECYCLE_TRANSITIONS } from "@/types";

/**
 * Change an asset's lifecycle status with transition validation
 */
export async function changeLifecycleStatus(
  assetId: string,
  newStatus: string,
  userId: string,
  notes?: string,
  cost?: number
) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new Error("ASSET_NOT_FOUND");

  const currentStatus = asset.lifecycleStatus;
  const validTransitions = LIFECYCLE_TRANSITIONS[currentStatus] || [];

  if (!validTransitions.includes(newStatus)) {
    throw new Error(
      `INVALID_LIFECYCLE_TRANSITION: Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions.join(", ") || "none"}`
    );
  }

  // Derive operational status from lifecycle
  let operationalStatus = asset.operationalStatus;
  if (newStatus === "OPERATIONAL" || newStatus === "COMMISSIONED") {
    operationalStatus = "ACTIVE";
  } else if (newStatus === "UNDER_MAINTENANCE") {
    operationalStatus = "DEGRADED";
  } else if (newStatus === "RETIRED" || newStatus === "DISPOSED") {
    operationalStatus = "OUT_OF_SERVICE";
  }

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: {
      lifecycleStatus: newStatus,
      operationalStatus,
      retiredAt: newStatus === "RETIRED" ? new Date() : asset.retiredAt,
    },
  });

  // Create lifecycle event
  await prisma.lifecycleEvent.create({
    data: {
      assetId,
      eventType: "STATUS_CHANGED",
      eventDate: new Date(),
      performedById: userId,
      oldStatus: currentStatus,
      newStatus,
      description: notes || `Lifecycle changed from ${currentStatus} to ${newStatus}`,
      cost: cost || undefined,
    },
  });

  // Audit log
  await createAuditLog({
    entityType: "ASSET",
    entityId: assetId,
    action: "LIFECYCLE_CHANGE",
    performedById: userId,
    oldValues: { lifecycleStatus: currentStatus, operationalStatus: asset.operationalStatus },
    newValues: { lifecycleStatus: newStatus, operationalStatus },
    reason: notes || `Lifecycle transition: ${currentStatus} → ${newStatus}`,
  });

  return updated;
}

/**
 * Get lifecycle stage counts for all assets
 */
export async function getLifecycleStageCounts() {
  const stages = await prisma.asset.groupBy({
    by: ["lifecycleStatus"],
    _count: { id: true },
  });

  return stages.map((s) => ({
    status: s.lifecycleStatus,
    count: s._count.id,
  }));
}

/**
 * Get recently transitioned assets
 */
export async function getRecentLifecycleEvents(limit = 20) {
  return prisma.lifecycleEvent.findMany({
    include: {
      asset: { select: { id: true, name: true, assetCode: true, lifecycleStatus: true } },
      performedBy: { select: { id: true, name: true } },
    },
    orderBy: { eventDate: "desc" },
    take: limit,
  });
}
