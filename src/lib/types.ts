/**
 * Types mirroring the backend's Pydantic schemas.
 *
 * Hand-written rather than generated from the OpenAPI spec: the surface is small, and a
 * generated client would add a build step to a hackathon project for little gain. If the
 * backend contract changes, change it here too — `npm run build` will surface every
 * mismatch as a type error.
 */

export type ComplaintCategory =
  | "road"
  | "water"
  | "waste"
  | "electricity"
  | "drainage"
  | "safety"
  | "other";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type ComplaintStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

export interface DepartmentSummary {
  id: string;
  name: string;
  slug: string;
}

export interface StatusEvent {
  id: string;
  from_status: ComplaintStatus | null;
  to_status: ComplaintStatus;
  note: string | null;
  actor: string;
  created_at: string;
}

export interface PredictionAlternative {
  label: string;
  confidence: number;
}

/** The full AI record, as persisted. Powers the "why did it decide that" panel. */
export interface AIOutput {
  category: ComplaintCategory | null;
  category_confidence: number | null;
  category_alternatives: PredictionAlternative[];
  priority: ComplaintPriority | null;
  priority_confidence: number | null;
  priority_alternatives: PredictionAlternative[];
  summary: string | null;
  recommended_department: string | null;
  keywords: string[];
  matched_terms?: string[];
  engine: string | null;
  model_version: string | null;
  processing_ms: number | null;
  notes: string[];
}

export interface Complaint {
  id: string;
  reference_code: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  reporter_name: string | null;
  reporter_contact: string | null;
  image_url: string | null;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  ai_summary: string | null;
  ai_output: AIOutput | null;
  ai_overridden: boolean;
  assigned_department: DepartmentSummary | null;
  resolution_note: string | null;
  duplicate_of_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  age_hours: number;
  resolution_hours: number | null;
  is_overdue: boolean;
  events: StatusEvent[];
}

export interface ComplaintListItem {
  id: string;
  reference_code: string;
  description: string;
  location: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  ai_summary: string | null;
  assigned_department: DepartmentSummary | null;
  created_at: string;
  resolved_at: string | null;
  age_hours: number;
  is_overdue: boolean;
}

export interface DuplicateCandidate {
  id: string;
  reference_code: string;
  description: string;
  similarity: number;
  status: ComplaintStatus;
  created_at: string;
}

export interface ComplaintCreateResponse {
  complaint: Complaint;
  possible_duplicates: DuplicateCandidate[];
  message: string;
}

export interface PaginatedComplaints {
  items: ComplaintListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ----------------------------------------------------------------- analytics

export interface DescriptiveStats {
  count: number;
  mean: number | null;
  median: number | null;
  mode: number | null;
  minimum: number | null;
  maximum: number | null;
  range: number | null;
  variance: number | null;
  std_deviation: number | null;
  interpretation: string;
}

export interface QuartileStats {
  q1: number | null;
  q2_median: number | null;
  q3: number | null;
  iqr: number | null;
  lower_fence: number | null;
  upper_fence: number | null;
  outlier_count: number;
  outlier_references: string[];
  interpretation: string;
}

export interface FrequencyItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface FrequencyDistribution {
  dimension: string;
  total: number;
  items: FrequencyItem[];
  mode_label: string | null;
  interpretation: string;
}

export interface TrendPoint {
  period: string;
  submitted: number;
  resolved: number;
  moving_average_7d: number | null;
}

export interface TrendSeries {
  points: TrendPoint[];
  total_submitted: number;
  total_resolved: number;
  direction: "rising" | "falling" | "steady";
  change_percent: number | null;
  interpretation: string;
}

export interface DepartmentPerformance {
  department: string;
  slug: string;
  total: number;
  resolved: number;
  open: number;
  resolution_rate: number;
  mean_resolution_hours: number | null;
  median_resolution_hours: number | null;
  overdue_count: number;
}

export interface DepartmentPerformanceReport {
  departments: DepartmentPerformance[];
  fastest: string | null;
  slowest: string | null;
  interpretation: string;
}

export interface ResolutionTimeReport {
  descriptive: DescriptiveStats;
  quartiles: QuartileStats;
  by_priority: Record<string, DescriptiveStats>;
  sla_breach_rate: number;
  interpretation: string;
}

export interface OverviewKPIs {
  total_complaints: number;
  open_complaints: number;
  in_progress: number;
  resolved_complaints: number;
  resolution_rate: number;
  critical_open: number;
  overdue_open: number;
  submitted_last_7_days: number;
  resolved_last_7_days: number;
  mean_resolution_hours: number | null;
  median_resolution_hours: number | null;
  ai_override_rate: number;
}

export interface AnalyticsOverview {
  kpis: OverviewKPIs;
  by_category: FrequencyDistribution;
  by_priority: FrequencyDistribution;
  by_status: FrequencyDistribution;
  headline: string;
  interpretation: string;
}

// ------------------------------------------------------------------------ ai

export interface AIStatus {
  ml_available: boolean;
  llm_available: boolean;
  active_engine: string;
  model_version: string;
  categories: string[];
  priorities: string[];
  trained_at: string | null;
  training_samples: number | null;
  macro_f1: number | null;
  notes: string[];
}

export interface AssistantResponse {
  answer: string;
  engine: string;
  grounded_on: Record<string, unknown>;
  suggestions: string[];
}

// ---------------------------------------------------------------------- auth

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff";
  is_active: boolean;
  department: DepartmentSummary | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  user: User;
}

/** The backend's uniform error envelope. */
export interface ApiErrorBody {
  error: {
    type: string;
    message: string;
    detail: Record<string, unknown>;
    request_id?: string;
  };
}
