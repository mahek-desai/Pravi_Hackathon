// ==========================================
// InfraGov Shared Types & Constants
// ==========================================

// Roles
export const ROLES = ['ADMIN', 'ASSET_MANAGER', 'FIELD_INSPECTOR', 'TECHNICIAN', 'VIEWER'] as const;
export type Role = typeof ROLES[number];

// Lifecycle Statuses
export const LIFECYCLE_STATUSES = [
  'PLANNED', 'PROCURED', 'INSTALLED', 'COMMISSIONED', 'OPERATIONAL',
  'UNDER_MAINTENANCE', 'REPAIRED', 'RENEWED', 'RETIRED', 'DISPOSED',
] as const;
export type LifecycleStatus = typeof LIFECYCLE_STATUSES[number];

// Operational Statuses
export const OPERATIONAL_STATUSES = ['ACTIVE', 'DEGRADED', 'FAILED', 'OUT_OF_SERVICE'] as const;
export type OperationalStatus = typeof OPERATIONAL_STATUSES[number];

// Criticality
export const CRITICALITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type Criticality = typeof CRITICALITY_LEVELS[number];

// Work Order Statuses
export const WORK_ORDER_STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;
export type WorkOrderStatus = typeof WORK_ORDER_STATUSES[number];

// Work Order Priorities
export const WORK_ORDER_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type WorkOrderPriority = typeof WORK_ORDER_PRIORITIES[number];

// Alert Types
export const ALERT_TYPES = [
  'INSPECTION_OVERDUE', 'WARRANTY_EXPIRY', 'AMC_EXPIRY', 'POOR_CONDITION',
  'CRITICAL_RISK', 'REPEATED_FAILURES', 'END_OF_LIFE', 'SLA_RESPONSE_BREACH',
  'SLA_RESOLUTION_BREACH',
] as const;
export type AlertType = typeof ALERT_TYPES[number];

// Alert Statuses
export const ALERT_STATUSES = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'] as const;
export type AlertStatus = typeof ALERT_STATUSES[number];

// Alert Severities
export const ALERT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type AlertSeverity = typeof ALERT_SEVERITIES[number];

// Policy Types
export const POLICY_TYPES = ['WARRANTY', 'AMC', 'INSPECTION_POLICY', 'SLA', 'SAFETY_POLICY', 'REGULATORY'] as const;
export type PolicyType = typeof POLICY_TYPES[number];

// Condition Labels
export const CONDITION_LABELS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'] as const;
export type ConditionLabel = typeof CONDITION_LABELS[number];

// Risk Labels
export const RISK_LABELS = ['Low', 'Medium', 'High', 'Critical'] as const;
export type RiskLabel = typeof RISK_LABELS[number];

// Document Types
export const DOCUMENT_TYPES = [
  'INVOICE', 'WARRANTY_CERTIFICATE', 'AMC_CONTRACT', 'INSPECTION_REPORT',
  'MAINTENANCE_REPORT', 'GOVERNMENT_APPROVAL', 'SAFETY_CERTIFICATE', 'PHOTO', 'OTHER',
] as const;
export type DocumentType = typeof DOCUMENT_TYPES[number];

// Lifecycle Event Types
export const LIFECYCLE_EVENT_TYPES = [
  'CREATED', 'PROCURED', 'INSTALLED', 'COMMISSIONED', 'OPERATIONAL',
  'MAINTENANCE_TRIGGERED', 'REPAIRED', 'RENEWED', 'RETIRED', 'DISPOSED',
  'INSPECTION_SUBMITTED', 'CONDITION_CHANGED', 'RISK_CHANGED',
  'WORK_ORDER_CREATED', 'WORK_ORDER_COMPLETED', 'POLICY_ADDED',
  'ALERT_CREATED', 'STATUS_CHANGED',
] as const;
export type LifecycleEventType = typeof LIFECYCLE_EVENT_TYPES[number];

// Valid lifecycle transitions
export const LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ['PROCURED'],
  PROCURED: ['INSTALLED'],
  INSTALLED: ['COMMISSIONED'],
  COMMISSIONED: ['OPERATIONAL'],
  OPERATIONAL: ['UNDER_MAINTENANCE', 'RENEWED', 'RETIRED'],
  UNDER_MAINTENANCE: ['REPAIRED'],
  REPAIRED: ['OPERATIONAL'],
  RENEWED: ['OPERATIONAL'],
  RETIRED: ['DISPOSED'],
  DISPOSED: [],
};

// Error codes
export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ASSET_NOT_FOUND: 'ASSET_NOT_FOUND',
  ASSET_DUPLICATE_CODE: 'ASSET_DUPLICATE_CODE',
  ASSET_INVALID_TYPE: 'ASSET_INVALID_TYPE',
  LOCATION_INVALID: 'LOCATION_INVALID',
  INSPECTION_NOT_FOUND: 'INSPECTION_NOT_FOUND',
  WORK_ORDER_NOT_FOUND: 'WORK_ORDER_NOT_FOUND',
  WORK_ORDER_INVALID_STATUS: 'WORK_ORDER_INVALID_STATUS',
  INVALID_LIFECYCLE_TRANSITION: 'INVALID_LIFECYCLE_TRANSITION',
  POLICY_NOT_FOUND: 'POLICY_NOT_FOUND',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  IMPORT_VALIDATION_FAILED: 'IMPORT_VALIDATION_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// Human-readable label formatters
export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Criticality numeric scores
export const CRITICALITY_SCORES: Record<string, number> = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100,
};

// Template field types
export const TEMPLATE_FIELD_TYPES = ['text', 'number', 'date', 'select', 'boolean', 'textarea'] as const;
export type TemplateFieldType = typeof TEMPLATE_FIELD_TYPES[number];

export interface TemplateField {
  name: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  unit?: string;
  options?: string[];
  placeholder?: string;
}

export interface TemplateSchema {
  fields: TemplateField[];
}
