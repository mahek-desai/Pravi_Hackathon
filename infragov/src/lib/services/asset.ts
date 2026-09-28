import { prisma } from "../db";
import { calculateRiskScore, generateAssetCode, getConditionLabel } from "../utils";
import { createAuditLog } from "../audit";

export async function getAssets(filters?: {
  search?: string;
  categoryId?: string;
  assetTypeId?: string;
  departmentId?: string;
  conditionLabel?: string;
  criticality?: string;
  riskLabel?: string;
  status?: string;
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
      { location: { address: { contains: filters.search } } },
      { location: { locality: { contains: filters.search } } },
    ];
  }

  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.assetTypeId) where.assetTypeId = filters.assetTypeId;
  if (filters?.departmentId) where.departmentId = filters.departmentId;
  if (filters?.conditionLabel) where.conditionLabel = filters.conditionLabel;
  if (filters?.criticality) where.criticality = filters.criticality;
  if (filters?.riskLabel) where.riskLabel = filters.riskLabel;
  if (filters?.status) where.operationalStatus = filters.status;

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        category: true,
        assetType: true,
        department: true,
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
      assetType: true,
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

export async function createAsset(data: any, userId?: string) {
  const assetType = await prisma.assetType.findUnique({
    where: { id: data.assetTypeId },
  });

  const typeCode = assetType?.code || "AST";
  const count = await prisma.asset.count({ where: { assetTypeId: data.assetTypeId } });
  const assetCode = generateAssetCode(typeCode, "AHM", count + 1);

  let locationId = undefined;
  if (data.location) {
    const loc = await prisma.location.create({
      data: data.location,
    });
    locationId = loc.id;
  }

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
      operationalStatus: data.operationalStatus || "ACTIVE",
      lifecycleStatus: "OPERATIONAL",
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

  // Create initial Lifecycle Event
  await prisma.lifecycleEvent.create({
    data: {
      assetId: asset.id,
      eventType: "COMMISSIONED",
      eventDate: new Date(),
      performedById: userId || null,
      newStatus: "OPERATIONAL",
      description: "Asset created and commissioned into active inventory.",
    },
  });

  // Audit log
  await createAuditLog({
    entityType: "ASSET",
    entityId: asset.id,
    action: "CREATE",
    performedById: userId,
    newValues: asset as any,
    reason: "New asset registration via Creation Wizard",
  });

  return asset;
}
