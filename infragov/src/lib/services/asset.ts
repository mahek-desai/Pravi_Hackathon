import { prisma } from "../db";
import { calculateRiskScore, generateAssetCode, getConditionLabel } from "../utils";
import { createAuditLog } from "../audit";
import { v4 as uuid } from "uuid";

export async function getAssets(filters?: {
  search?: string;
  categoryId?: string;
  assetTypeId?: string;
  departmentId?: string;
  divisionId?: string;
  conditionLabel?: string;
  criticality?: string;
  riskLabel?: string;
  lifecycleStatus?: string;
  operationalStatus?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { assetCode: { contains: filters.search } },
      { description: { contains: filters.search } },
      { serialNumber: { contains: filters.search } },
      { manufacturer: { contains: filters.search } },
      { location: { address: { contains: filters.search } } },
      { location: { locality: { contains: filters.search } } },
      { location: { ward: { contains: filters.search } } },
    ];
  }

  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.assetTypeId) where.assetTypeId = filters.assetTypeId;
  if (filters?.departmentId) where.departmentId = filters.departmentId;
  if (filters?.divisionId) where.divisionId = filters.divisionId;
  if (filters?.conditionLabel) where.conditionLabel = filters.conditionLabel;
  if (filters?.criticality) where.criticality = filters.criticality;
  if (filters?.riskLabel) where.riskLabel = filters.riskLabel;
  if (filters?.lifecycleStatus) where.lifecycleStatus = filters.lifecycleStatus;
  if (filters?.operationalStatus) where.operationalStatus = filters.operationalStatus;

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        category: true,
        assetType: true,
        department: true,
        division: true,
        location: true,
        inspections: { orderBy: { inspectionDate: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    assets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAssetById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
      assetType: {
        include: {
          templates: {
            where: { status: "ACTIVE" },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      },
      department: true,
      division: true,
      responsibleUser: true,
      location: true,
      vendor: true,
      inspections: {
        include: { inspector: true },
        orderBy: { inspectionDate: "desc" },
      },
      workOrders: {
        include: { assignedTo: true, createdBy: true },
        orderBy: { createdAt: "desc" },
      },
      maintenanceRecords: {
        orderBy: { maintenanceDate: "desc" },
      },
      lifecycleEvents: {
        include: { performedBy: true },
        orderBy: { eventDate: "desc" },
      },
      policies: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      alerts: { orderBy: { createdAt: "desc" } },
    },
  });
}

/**
 * Generate a collision-safe unique asset code using retry with UUID suffix fallback
 */
async function generateUniqueAssetCode(typeCode: string, regionCode: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.asset.count({ where: { assetCode: { startsWith: `${typeCode}-${regionCode}` } } });
    const code = generateAssetCode(typeCode, regionCode, count + 1 + attempt);

    const existing = await prisma.asset.findUnique({ where: { assetCode: code } });
    if (!existing) return code;
  }

  // Fallback: use a UUID-based suffix  
  const shortId = uuid().slice(0, 5).toUpperCase();
  return `${typeCode}-${regionCode}-${shortId}`;
}

export async function createAsset(data: any, userId?: string) {
  // Validate category exists
  const category = await prisma.assetCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new Error("Invalid category");

  // Validate asset type exists and belongs to category
  const assetType = await prisma.assetType.findUnique({ where: { id: data.assetTypeId } });
  if (!assetType) throw new Error("Invalid asset type");
  if (assetType.categoryId !== data.categoryId) throw new Error("Asset type does not belong to selected category");

  // Validate department exists
  const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
  if (!department) throw new Error("Invalid department");

  // Validate division belongs to department if provided
  if (data.divisionId) {
    const division = await prisma.division.findUnique({ where: { id: data.divisionId } });
    if (!division || division.departmentId !== data.departmentId) {
      throw new Error("Division does not belong to selected department");
    }
  }

  const typeCode = assetType.code || "AST";
  const assetCode = await generateUniqueAssetCode(typeCode, "AHM");

  let locationId = undefined;
  if (data.location) {
    const loc = await prisma.location.create({
      data: data.location,
    });
    locationId = loc.id;
  }

  // Determine initial lifecycle status
  const lifecycleStatus = data.lifecycleStatus || "PLANNED";
  const operationalStatus = data.operationalStatus || "ACTIVE";

  const conditionScore = 100;
  const conditionLabel = getConditionLabel(conditionScore);
  const { score: riskScore, label: riskLabel } = calculateRiskScore(conditionScore, data.criticality || "MEDIUM");

  const asset = await prisma.asset.create({
    data: {
      assetCode,
      name: data.name,
      categoryId: data.categoryId,
      assetTypeId: data.assetTypeId,
      departmentId: data.departmentId,
      divisionId: data.divisionId || null,
      responsibleUserId: data.responsibleUserId || null,
      locationId: locationId || null,
      vendorId: data.vendorId || null,
      criticality: data.criticality || "MEDIUM",
      operationalStatus,
      lifecycleStatus,
      conditionScore,
      conditionLabel,
      riskScore,
      riskLabel,
      description: data.description || null,
      manufacturer: data.manufacturer || null,
      model: data.model || null,
      serialNumber: data.serialNumber || null,
      purchaseCost: data.purchaseCost ? Number(data.purchaseCost) : null,
      expectedLifeYears: data.expectedLifeYears ? Number(data.expectedLifeYears) : null,
      installationDate: data.installationDate ? new Date(data.installationDate) : null,
      commissioningDate: data.commissioningDate ? new Date(data.commissioningDate) : null,
      technicalMetadataJson: data.technicalMetadataJson || null,
    },
    include: { category: true, assetType: true, department: true, location: true },
  });

  // Create initial Lifecycle Event based on selected status
  await prisma.lifecycleEvent.create({
    data: {
      assetId: asset.id,
      eventType: "CREATED",
      eventDate: new Date(),
      performedById: userId || null,
      newStatus: lifecycleStatus,
      description: `Asset registered with initial lifecycle status: ${lifecycleStatus}.`,
    },
  });

  // Create policies if provided
  if (data.policies && Array.isArray(data.policies)) {
    for (const pol of data.policies) {
      if (pol.policyType && (pol.provider || pol.coverage || pol.endDate)) {
        await prisma.policy.create({
          data: {
            assetId: asset.id,
            policyType: pol.policyType,
            provider: pol.provider || null,
            startDate: pol.startDate ? new Date(pol.startDate) : new Date(),
            endDate: pol.endDate ? new Date(pol.endDate) : null,
            frequencyDays: pol.frequencyDays || null,
            coverage: pol.coverage || null,
            slaResponseHours: pol.slaResponseHours || null,
            slaResolutionHours: pol.slaResolutionHours || null,
            notes: pol.notes || null,
            status: "ACTIVE",
          },
        });
      }
    }
  }

  // Audit log
  await createAuditLog({
    entityType: "ASSET",
    entityId: asset.id,
    action: "CREATE",
    performedById: userId,
    newValues: { assetCode: asset.assetCode, name: asset.name, lifecycleStatus },
    reason: "New asset registered via Creation Wizard",
  });

  return asset;
}

/**
 * Search assets for global topbar search with suggestions
 */
export async function searchAssets(query: string, limit = 10) {
  if (!query || query.length < 2) return [];

  return prisma.asset.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { assetCode: { contains: query } },
        { serialNumber: { contains: query } },
        { location: { address: { contains: query } } },
        { location: { locality: { contains: query } } },
        { location: { ward: { contains: query } } },
        { department: { name: { contains: query } } },
        { category: { name: { contains: query } } },
        { assetType: { name: { contains: query } } },
      ],
    },
    select: {
      id: true,
      assetCode: true,
      name: true,
      conditionLabel: true,
      riskLabel: true,
      lifecycleStatus: true,
      category: { select: { name: true } },
      department: { select: { name: true } },
      location: { select: { locality: true } },
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}
