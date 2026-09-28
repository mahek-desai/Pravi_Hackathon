import { prisma } from "../db";
import { createAuditLog } from "../audit";
import { recalculateAndUpdateRisk } from "./risk";
import { evaluateAlerts } from "./alert";

export async function createWorkOrder(data: {
  assetId: string;
  createdById: string;
  issue: string;
  description?: string;
  priority: string;
  assignedToId?: string;
  dueDate?: string;
  estimatedCost?: number;
}) {
  const count = await prisma.workOrder.count();
  const workOrderNumber = `WO-2026-${String(count + 1).padStart(5, "0")}`;

  const workOrder = await prisma.workOrder.create({
    data: {
      workOrderNumber,
      assetId: data.assetId,
      createdById: data.createdById,
      assignedToId: data.assignedToId || null,
      issue: data.issue,
      description: data.description || null,
      priority: data.priority,
      status: "OPEN",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : null,
    },
    include: { asset: true, assignedTo: true, createdBy: true },
  });

  // Update asset status to UNDER_MAINTENANCE
  await prisma.asset.update({
    where: { id: data.assetId },
    data: { lifecycleStatus: "UNDER_MAINTENANCE", operationalStatus: "DEGRADED" },
  });

  await prisma.lifecycleEvent.create({
    data: {
      assetId: data.assetId,
      eventType: "WORK_ORDER_CREATED",
      eventDate: new Date(),
      performedById: data.createdById,
      newStatus: "UNDER_MAINTENANCE",
      description: `Work Order ${workOrderNumber} created: ${data.issue}`,
    },
  });

  // Recalculate risk (work order added affects failure history score)
  await recalculateAndUpdateRisk(data.assetId);

  await createAuditLog({
    entityType: "WORK_ORDER",
    entityId: workOrder.id,
    action: "CREATE",
    performedById: data.createdById,
    newValues: workOrder as any,
  });

  return workOrder;
}

export async function updateWorkOrder(
  id: string,
  data: {
    status?: string;
    assignedToId?: string;
    completionNotes?: string;
    actualCost?: number;
  },
  userId: string
) {
  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!wo) throw new Error("WORK_ORDER_NOT_FOUND");

  // Validation rules for completion
  if (data.status === "COMPLETED") {
    if (!data.completionNotes && !wo.completionNotes) {
      throw new Error("Completion notes required to complete work order");
    }
    if (data.actualCost === undefined && wo.actualCost === undefined) {
      throw new Error("Actual repair cost required to complete work order");
    }
  }

  const isCompleting = data.status === "COMPLETED" && wo.status !== "COMPLETED";

  const updatedWO = await prisma.workOrder.update({
    where: { id },
    data: {
      status: data.status || wo.status,
      assignedToId: data.assignedToId || wo.assignedToId,
      completionNotes: data.completionNotes || wo.completionNotes,
      actualCost: data.actualCost !== undefined ? Number(data.actualCost) : wo.actualCost,
      startedAt: data.status === "IN_PROGRESS" && !wo.startedAt ? new Date() : wo.startedAt,
      completedAt: isCompleting ? new Date() : wo.completedAt,
    },
  });

  // If completed, update asset status, create maintenance record, recalculate risk & evaluate alerts
  if (isCompleting) {
    await prisma.maintenanceRecord.create({
      data: {
        assetId: wo.assetId,
        workOrderId: wo.id,
        maintenanceType: "CORRECTIVE",
        maintenanceDate: new Date(),
        performedBy: userId,
        cost: Number(data.actualCost || wo.actualCost || 0),
        description: data.completionNotes || "Work order completed.",
        result: "SUCCESS",
      },
    });

    await prisma.asset.update({
      where: { id: wo.assetId },
      data: {
        lifecycleStatus: "OPERATIONAL",
        operationalStatus: "ACTIVE",
      },
    });

    await prisma.lifecycleEvent.create({
      data: {
        assetId: wo.assetId,
        eventType: "REPAIRED",
        eventDate: new Date(),
        performedById: userId,
        oldStatus: "UNDER_MAINTENANCE",
        newStatus: "OPERATIONAL",
        description: `Work order ${wo.workOrderNumber} completed successfully. Repair cost: ₹${data.actualCost || wo.actualCost || 0}.`,
        cost: Number(data.actualCost || wo.actualCost || 0),
      },
    });

    // Recalculate risk & evaluate alerts
    await recalculateAndUpdateRisk(wo.assetId);
    await evaluateAlerts(wo.assetId);
  }

  await createAuditLog({
    entityType: "WORK_ORDER",
    entityId: id,
    action: "UPDATE",
    performedById: userId,
    oldValues: { status: wo.status },
    newValues: { status: updatedWO.status },
  });

  return updatedWO;
}

export async function getWorkOrders(filters?: { assetId?: string; status?: string; assignedToId?: string }) {
  const where: any = {};
  if (filters?.assetId) where.assetId = filters.assetId;
  if (filters?.status) where.status = filters.status;
  if (filters?.assignedToId) where.assignedToId = filters.assignedToId;

  return prisma.workOrder.findMany({
    where,
    include: {
      asset: true,
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
