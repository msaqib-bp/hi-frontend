/**
 * Illustrative figures for the landing page.
 *
 * The landing page asks the public analytics endpoint first and renders whatever the
 * live service returns; this snapshot is what it falls back to when the API is asleep,
 * unreachable, or simply has no data yet. Wherever it is used, the UI says so — a
 * demonstration number presented as a live one is a lie, however small.
 *
 * The values are internally consistent on purpose: the category, priority and status
 * distributions each sum to the total, and the resolution rate is the quotient it claims
 * to be. A figure that does not add up is the first thing a reviewer notices.
 */

import type { AnalyticsOverview, ComplaintListItem } from "./types";

const TOTAL = 1248;

export const SAMPLE_OVERVIEW: AnalyticsOverview = {
  kpis: {
    total_complaints: TOTAL,
    open_complaints: 146,
    in_progress: 118,
    resolved_complaints: 898,
    resolution_rate: 898 / TOTAL,
    critical_open: 87,
    overdue_open: 41,
    submitted_last_7_days: 96,
    resolved_last_7_days: 88,
    mean_resolution_hours: 41.6,
    median_resolution_hours: 28.4,
    ai_override_rate: 0.083,
  },
  by_category: {
    dimension: "category",
    total: TOTAL,
    items: [
      { key: "road", label: "Road & Footpath", count: 342, percentage: 0.274 },
      { key: "water", label: "Water Supply", count: 231, percentage: 0.185 },
      { key: "waste", label: "Waste & Sanitation", count: 206, percentage: 0.165 },
      { key: "drainage", label: "Drainage & Sewerage", count: 168, percentage: 0.135 },
      {
        key: "electricity",
        label: "Electricity & Streetlights",
        count: 149,
        percentage: 0.119,
      },
      { key: "safety", label: "Public Safety", count: 92, percentage: 0.074 },
      { key: "other", label: "Other Services", count: 60, percentage: 0.048 },
    ],
    mode_label: "Road & Footpath",
    interpretation:
      "Road & Footpath is the most reported category, accounting for just over a quarter of all complaints.",
  },
  by_priority: {
    dimension: "priority",
    total: TOTAL,
    items: [
      { key: "low", label: "Low", count: 268, percentage: 0.215 },
      { key: "medium", label: "Medium", count: 512, percentage: 0.41 },
      { key: "high", label: "High", count: 331, percentage: 0.265 },
      { key: "critical", label: "Critical", count: 137, percentage: 0.11 },
    ],
    mode_label: "Medium",
    interpretation:
      "Most complaints land in the middle of the scale; roughly one in nine is critical.",
  },
  by_status: {
    dimension: "status",
    total: TOTAL,
    items: [
      { key: "open", label: "Open", count: 146, percentage: 0.117 },
      { key: "assigned", label: "Assigned", count: 60, percentage: 0.048 },
      { key: "in_progress", label: "In Progress", count: 118, percentage: 0.095 },
      { key: "resolved", label: "Resolved", count: 898, percentage: 0.719 },
      { key: "rejected", label: "Rejected", count: 26, percentage: 0.021 },
    ],
    mode_label: "Resolved",
    interpretation: "324 complaints are still awaiting action, 87 of them critical.",
  },
  headline: "1,248 complaints received · 324 awaiting action · 87 critical and open",
  interpretation:
    "Road and water problems dominate the queue, and critical complaints are concentrated in drainage after heavy rain.",
};

/**
 * Rows for the preview table. The live queue is not public — listing complaints needs a
 * staff session — so these stay illustrative even when the KPIs above are live.
 */
export const SAMPLE_RECENT: Pick<
  ComplaintListItem,
  | "id"
  | "reference_code"
  | "description"
  | "location"
  | "category"
  | "priority"
  | "status"
  | "age_hours"
>[] = [
  {
    id: "s1",
    reference_code: "CIV-8F42QA",
    description: "Large water leak near the main road, traffic is becoming difficult.",
    location: "MG Road, Ward 12",
    category: "water",
    priority: "high",
    status: "in_progress",
    age_hours: 3.5,
  },
  {
    id: "s2",
    reference_code: "CIV-7K19ZP",
    description: "Open manhole on the footpath outside the school gate.",
    location: "Nehru Nagar, Ward 4",
    category: "safety",
    priority: "critical",
    status: "assigned",
    age_hours: 1.2,
  },
  {
    id: "s3",
    reference_code: "CIV-5D77MX",
    description: "Streetlight has been off for two weeks, the lane is very dark.",
    location: "Lake View Lane, Ward 9",
    category: "electricity",
    priority: "medium",
    status: "open",
    age_hours: 26,
  },
  {
    id: "s4",
    reference_code: "CIV-3B08TR",
    description: "Garbage not collected for four days and it is starting to smell.",
    location: "Market Street, Ward 2",
    category: "waste",
    priority: "medium",
    status: "in_progress",
    age_hours: 51,
  },
  {
    id: "s5",
    reference_code: "CIV-2A55LW",
    description: "Drain blocked after the rain, water standing across the junction.",
    location: "Station Road, Ward 7",
    category: "drainage",
    priority: "high",
    status: "resolved",
    age_hours: 94,
  },
];
