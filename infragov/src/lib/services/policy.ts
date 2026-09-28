import { prisma } from "../db";
import { createAuditLog } from "../audit";

/**
 * Create a new policy for an asset
 */
export async function createPolicy(data: {
  assetId: string;
  policyType: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  frequencyDays?: number;
  coverage?: string;
  slaResponseHours?: number;
  slaResolutionHours?: number;
  notes?: string;
}, userId: string) {
  const policy = await prisma.policy.create({
    data: {
      assetId: data.assetId,
      policyType: data.policyType,
      provider: data.provider || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      frequencyDays: data.frequencyDays || null,
      coverage: data.coverage || null,
      slaResponseHours: data.slaResponseHours || null,
      slaResolutionHours: data.slaResolutionHours || null,
      notes: data.notes || null,
      status: "ACTIVE",
    },
  });

  await createAuditLog({
    entityType: "POLICY",
    entityId: policy.id,
    action: "CREATE",
    performedById: userId,
    newValues: policy as any,
    reason: `New ${data.policyType} policy created for asset`,
  });

  return policy;
}

/**
 * Get all policies with optional filters
 */
export async function getPolicies(filters?: {
  assetId?: string;
  policyType?: string;
  status?: string;
  departmentId?: string;
}) {
  const where: any = {};
  if (filters?.assetId) where.assetId = filters.assetId;
  if (filters?.policyType) where.policyType = filters.policyType;
  if (filters?.status) where.status = filters.status;
  if (filters?.departmentId) {
    where.asset = { departmentId: filters.departmentId };
  }

  return prisma.policy.findMany({
    where,
    include: {
      asset: {
        select: {
          id: true,
          name: true,
          assetCode: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update policy status
 */
export async function updatePolicy(
  policyId: string,
  data: {
    status?: string;
    provider?: string;
    coverage?: string;
    endDate?: string;
    notes?: string;
  },
  userId: string
) {
  const existing = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!existing) throw new Error("POLICY_NOT_FOUND");

  const updated = await prisma.policy.update({
    where: { id: policyId },
    data: {
      status: data.status || existing.status,
      provider: data.provider !== undefined ? data.provider : existing.provider,
      coverage: data.coverage !== undefined ? data.coverage : existing.coverage,
      endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    },
  });

  await createAuditLog({
    entityType: "POLICY",
    entityId: policyId,
    action: "UPDATE",
    performedById: userId,
    oldValues: { status: existing.status },
    newValues: { status: updated.status },
  });

  return updated;
}
