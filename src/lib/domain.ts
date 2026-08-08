/**
 * Domain display helpers — labels, colours and formatters.
 *
 * Centralised so a category badge looks identical on the citizen result card, the admin
 * table and the charts. Colours are chosen to survive both light and dark themes and to
 * stay distinguishable for the most common colour-vision deficiencies (no red/green pair
 * carries meaning on its own — the label always accompanies it).
 */

import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "./types";

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road: "Road & Footpath",
  water: "Water Supply",
  waste: "Waste & Sanitation",
  electricity: "Electricity & Streetlights",
  drainage: "Drainage & Sewerage",
  safety: "Public Safety",
  other: "Other Services",
};

export const CATEGORY_SHORT: Record<ComplaintCategory, string> = {
  road: "Road",
  water: "Water",
  waste: "Waste",
  electricity: "Electricity",
  drainage: "Drainage",
  safety: "Safety",
  other: "Other",
};

/** Chart palette. Ordered to maximise adjacent-slice contrast in pie charts. */
export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  road: "#f59e0b",
  water: "#0ea5e9",
  waste: "#84cc16",
  electricity: "#a855f7",
  drainage: "#14b8a6",
  safety: "#ef4444",
  other: "#64748b",
};

export const PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const PRIORITY_COLORS: Record<ComplaintPriority, string> = {
  low: "#64748b",
  medium: "#0ea5e9",
  high: "#f59e0b",
  critical: "#ef4444",
};

/** Tailwind classes for priority badges. */
export const PRIORITY_BADGE: Record<ComplaintPriority, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  medium:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
  high: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  critical:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const STATUS_BADGE: Record<ComplaintStatus, string> = {
  open: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  assigned:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  in_progress:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
  resolved:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  rejected:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  open: "#64748b",
  assigned: "#3b82f6",
  in_progress: "#8b5cf6",
  resolved: "#10b981",
  rejected: "#f43f5e",
};

/** Response-time target per priority, mirroring the backend's SLA definition. */
export const PRIORITY_TARGET_HOURS: Record<ComplaintPriority, number> = {
  critical: 6,
  high: 24,
  medium: 72,
  low: 168,
};

// ------------------------------------------------------------------ formatters

/** Hours as something a person reads: "3.2h", "2d 4h", "45m". */
export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  const days = Math.floor(hours / 24);
  const remainder = Math.round(hours % 24);
  return remainder ? `${days}d ${remainder}h` : `${days}d`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "2 hours ago" / "in 3 days" — relative to now. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSeconds = (then - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const thresholds: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of thresholds) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "just now";
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

/**
 * Confidence expressed in words.
 *
 * Percentages alone invite false precision — "74%" reads as more exact than a calibrated
 * classifier warrants. The word is what tells an operator whether to look closer.
 */
export function confidenceLabel(confidence: number | null | undefined): {
  label: string;
  tone: "high" | "medium" | "low";
} {
  if (confidence === null || confidence === undefined) {
    return { label: "not reported", tone: "low" };
  }
  if (confidence >= 0.75) return { label: "high confidence", tone: "high" };
  if (confidence >= 0.5) return { label: "moderate confidence", tone: "medium" };
  return { label: "low confidence — review", tone: "low" };
}

/** Display name for an LLM vendor. */
export function providerLabel(provider: string | null | undefined): string {
  switch (provider) {
    case "anthropic":
      return "Claude";
    case "deepseek":
      return "DeepSeek";
    case "openai-compatible":
      return "language model";
    case "local":
    case "none":
    case null:
    case undefined:
      return "language model";
    default:
      return provider;
  }
}

/**
 * How the AI engine that produced a result should be described in the UI.
 *
 * The vendor is named rather than hard-coded, because the deployment may be running on
 * Claude, on DeepSeek, or on no language model at all — and an operator reading a
 * prediction should be able to tell which, without checking the server config.
 */
export function engineLabel(
  engine: string | null | undefined,
  provider?: string | null,
): string {
  switch (engine) {
    case "ml":
      return "Local ML model";
    case "llm":
      return providerLabel(provider);
    case "hybrid":
      return `ML + ${providerLabel(provider)}`;
    case "fallback":
      return "Keyword rules (models unavailable)";
    default:
      return "Unknown";
  }
}
