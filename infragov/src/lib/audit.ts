import { prisma } from "./db";

export async function createAuditLog(params: {
  entityType: string;
  entityId: string;
  action: string;
  performedById?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason?: string;
}) {
  return prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      performedById: params.performedById || null,
      oldValuesJson: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValuesJson: params.newValues ? JSON.stringify(params.newValues) : null,
      reason: params.reason || null,
    },
  });
}
