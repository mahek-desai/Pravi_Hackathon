import { prisma } from "../db";

export async function getDashboardStats(departmentId?: string) {
  const where: any = {};
  if (departmentId) where.departmentId = departmentId;

  const [
    totalAssets,
    operationalAssets,
    underMaintenance,
    criticalAssets,
    highRiskAssets,
    openWorkOrders,
    openAlerts,
    categoriesCount,
    conditionStats,
    riskStats,
    departmentStats,
  ] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.count({ where: { ...where, lifecycleStatus: "OPERATIONAL" } }),
    prisma.asset.count({ where: { ...where, lifecycleStatus: "UNDER_MAINTENANCE" } }),
    prisma.asset.count({ where: { ...where, criticality: "CRITICAL" } }),
    prisma.asset.count({ where: { ...where, riskLabel: "Critical" } }),
    prisma.workOrder.count({ where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } }),
    prisma.alert.count({ where: { status: "OPEN" } }),
    prisma.assetCategory.findMany({
      include: {
        _count: { select: { assets: true } },
      },
    }),
    prisma.asset.groupBy({
      by: ["conditionLabel"],
      _count: { id: true },
      where,
    }),
    prisma.asset.groupBy({
      by: ["riskLabel"],
      _count: { id: true },
      where,
    }),
    prisma.department.findMany({
      include: {
        _count: { select: { assets: true } },
      },
    }),
  ]);

  return {
    kpis: {
      totalAssets,
      operationalAssets,
      underMaintenance,
      criticalAssets,
      highRiskAssets,
      openWorkOrders,
      openAlerts,
    },
    categories: categoriesCount.map((c) => ({
      name: c.name,
      code: c.code,
      count: c._count.assets,
    })),
    conditionDistribution: conditionStats.map((cs) => ({
      label: cs.conditionLabel,
      count: cs._count.id,
    })),
    riskDistribution: riskStats.map((rs) => ({
      label: rs.riskLabel,
      count: rs._count.id,
    })),
    departmentDistribution: departmentStats.map((d) => ({
      name: d.name,
      code: d.code,
      count: d._count.assets,
    })),
  };
}
