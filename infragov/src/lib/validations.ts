import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const assetCreateSchema = z.object({
  name: z.string().min(1, "Asset name is required").max(200),
  categoryId: z.string().min(1, "Category is required"),
  assetTypeId: z.string().min(1, "Asset type is required"),
  departmentId: z.string().min(1, "Department is required"),
  divisionId: z.string().optional(),
  responsibleUserId: z.string().optional(),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  operationalStatus: z.string().default("ACTIVE"),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseCost: z.number().min(0, "Cost cannot be negative").optional(),
  expectedLifeYears: z.number().min(1).optional(),
  installationDate: z.string().optional(),
  commissioningDate: z.string().optional(),
  vendorId: z.string().optional(),
  technicalMetadataJson: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    zone: z.string().optional(),
    ward: z.string().optional(),
    locality: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
});

export const inspectionSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  physicalConditionScore: z.number().min(0).max(100),
  operationalConditionScore: z.number().min(0).max(100),
  safetyScore: z.number().min(0).max(100),
  observations: z.string().optional(),
  recommendation: z.string().optional(),
});

export const workOrderSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  issue: z.string().min(1, "Issue is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedCost: z.number().min(0).optional(),
});

export const workOrderUpdateSchema = z.object({
  status: z.string().optional(),
  assignedToId: z.string().optional(),
  completionNotes: z.string().optional(),
  actualCost: z.number().min(0).optional(),
});

export const policySchema = z.object({
  assetId: z.string().min(1),
  policyType: z.enum(["WARRANTY", "AMC", "INSPECTION_POLICY", "SLA", "SAFETY_POLICY", "REGULATORY"]),
  provider: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  frequencyDays: z.number().min(1).optional(),
  coverage: z.string().optional(),
  slaResponseHours: z.number().min(0).optional(),
  slaResolutionHours: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AssetCreateInput = z.infer<typeof assetCreateSchema>;
export type InspectionInput = z.infer<typeof inspectionSchema>;
export type WorkOrderInput = z.infer<typeof workOrderSchema>;
export type WorkOrderUpdateInput = z.infer<typeof workOrderUpdateSchema>;
export type PolicyInput = z.infer<typeof policySchema>;
