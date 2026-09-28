import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getConditionLabel(score: number): string {
  if (score >= 86) return "Excellent";
  if (score >= 71) return "Good";
  if (score >= 51) return "Fair";
  if (score >= 31) return "Poor";
  return "Critical";
}

export function getConditionColor(label: string): string {
  switch (label) {
    case "Excellent": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Good": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Fair": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Poor": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "Critical": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getRiskLabel(score: number): string {
  if (score <= 30) return "Low";
  if (score <= 60) return "Medium";
  if (score <= 80) return "High";
  return "Critical";
}

export function getRiskColor(label: string): string {
  switch (label) {
    case "Low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "Critical": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getCriticalityColor(criticality: string): string {
  switch (criticality) {
    case "LOW": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "HIGH": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "CRITICAL": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "OPERATIONAL":
    case "ACTIVE":
    case "COMPLETED":
    case "RESOLVED":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "UNDER_MAINTENANCE":
    case "IN_PROGRESS":
    case "ASSIGNED":
    case "ACKNOWLEDGED":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "PLANNED":
    case "PROCURED":
    case "OPEN":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "RETIRED":
    case "DISPOSED":
    case "CANCELLED":
    case "DISMISSED":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "FAILED":
    case "ON_HOLD":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "LOW": return "bg-blue-500/20 text-blue-400";
    case "MEDIUM": return "bg-yellow-500/20 text-yellow-400";
    case "HIGH": return "bg-orange-500/20 text-orange-400";
    case "CRITICAL": return "bg-red-500/20 text-red-400";
    default: return "bg-gray-500/20 text-gray-400";
  }
}

export function calculateRiskScore(
  conditionScore: number,
  criticality: string,
  failureCount: number = 0,
  inspectionOverdueDays: number = 0
): { score: number; label: string } {
  const conditionRisk = 100 - conditionScore;

  const criticalityScore: Record<string, number> = {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 100,
  };

  const critScore = criticalityScore[criticality] || 50;
  const failureScore = Math.min(failureCount * 25, 100);
  const inspectionScore = inspectionOverdueDays > 0 ? Math.min(inspectionOverdueDays * 3, 100) : 0;

  const score = Math.round(
    conditionRisk * 0.5 +
    critScore * 0.3 +
    failureScore * 0.1 +
    inspectionScore * 0.1
  );

  const clampedScore = Math.max(0, Math.min(100, score));
  return { score: clampedScore, label: getRiskLabel(clampedScore) };
}

export function generateAssetCode(typeCode: string, regionCode: string, sequence: number): string {
  return `${typeCode}-${regionCode}-${String(sequence).padStart(5, "0")}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
