/**
 * Typed API client.
 *
 * One place that knows the base URL, attaches the admin token, and unwraps the backend's
 * error envelope into a real `Error` with a usable message. Components never call `fetch`
 * directly — otherwise error handling and auth drift between pages.
 */

import type {
  AIStatus,
  AnalyticsOverview,
  ApiErrorBody,
  AssistantResponse,
  Complaint,
  ComplaintCreateResponse,
  DepartmentPerformanceReport,
  DepartmentSummary,
  DuplicateCandidate,
  FrequencyDistribution,
  PaginatedComplaints,
  ResolutionTimeReport,
  TokenResponse,
  TrendSeries,
  User,
} from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

const API_PREFIX = "/api/v1";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

function targetsTheViewersOwnMachine(base: string): boolean {
  try {
    return LOCAL_HOSTNAMES.has(new URL(base).hostname);
  } catch {
    return false;
  }
}

/**
 * True when this bundle is asking the *visitor's* computer for the API.
 *
 * `NEXT_PUBLIC_*` values are inlined by the compiler, so a deployment built without
 * `NEXT_PUBLIC_API_URL` carries the literal string `http://localhost:8000` inside its
 * JavaScript. Every request then goes to whoever opened the page, and fails at the
 * network layer — which is indistinguishable from a sleeping backend unless we check.
 *
 * Worth naming explicitly because the remedy is counter-intuitive: setting the variable
 * in the hosting dashboard changes nothing on its own. The value is fixed at build time,
 * so the deployment has to be rebuilt.
 */
export function apiTargetIsMisconfigured(): boolean {
  if (typeof window === "undefined") return false;
  return (
    targetsTheViewersOwnMachine(API_BASE_URL) &&
    !LOCAL_HOSTNAMES.has(window.location.hostname)
  );
}
const TOKEN_STORAGE_KEY = "civic_admin_token";

/** An API failure carrying the backend's structured detail. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly type: string = "error",
    readonly detail: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** True when the session is missing or expired — callers redirect to login. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

// ------------------------------------------------------------------ token store
// localStorage rather than an httpOnly cookie: the API is on a different origin
// (Render) from the app (Vercel), so a cookie would need SameSite=None plus a shared
// parent domain. For an admin dashboard on a hackathon deployment this is the right
// trade-off; a production system with real citizen data should use httpOnly cookies.

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};

// ---------------------------------------------------------------------- request

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, query, headers, ...rest } = options;

  const url = new URL(`${API_BASE_URL}${API_PREFIX}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const requestHeaders = new Headers(headers);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = tokenStore.get();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...rest,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // A network-level failure has two very different causes, and the cold-start message
    // below is actively misleading for the other one — it sends you to check a backend
    // that is fine.
    if (apiTargetIsMisconfigured()) {
      throw new ApiError(
        `This deployment is calling ${API_BASE_URL}, which is your own computer, not the API. ` +
          "Set NEXT_PUBLIC_API_URL to the API's public URL and redeploy — the value is " +
          "compiled into the bundle, so changing it without a rebuild has no effect.",
        0,
        "configuration_error",
      );
    }

    // On a free Render instance this is usually a cold start (~50s to wake) rather than
    // an outage, so say so instead of "failed to fetch".
    throw new ApiError(
      "Could not reach the server. If it has been idle it may be waking up — retry in a few seconds.",
      0,
      "network_error",
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const envelope = payload as ApiErrorBody | null;
    if (envelope?.error) {
      throw new ApiError(
        envelope.error.message,
        response.status,
        envelope.error.type,
        envelope.error.detail ?? {},
      );
    }
    throw new ApiError(
      `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return payload as T;
}

// ------------------------------------------------------------------------- api

export const api = {
  // ---- complaints (public) ----
  submitComplaint(input: {
    description: string;
    location: string;
    reporter_name?: string;
    reporter_contact?: string;
    image_url?: string;
  }): Promise<ComplaintCreateResponse> {
    return request("/complaints", { method: "POST", body: input });
  },

  trackComplaint(referenceCode: string): Promise<Complaint> {
    return request(`/complaints/track/${encodeURIComponent(referenceCode.trim())}`);
  },

  // ---- complaints (admin) ----
  listComplaints(params: {
    status?: string;
    category?: string;
    priority?: string;
    department_id?: string;
    location?: string;
    q?: string;
    overdue_only?: boolean;
    page?: number;
    page_size?: number;
    sort?: string;
  } = {}): Promise<PaginatedComplaints> {
    return request("/complaints", { auth: true, query: params });
  },

  getComplaint(id: string): Promise<Complaint> {
    return request(`/complaints/${id}`, { auth: true });
  },

  updateComplaint(
    id: string,
    changes: {
      status?: string;
      category?: string;
      priority?: string;
      assigned_department_id?: string;
      resolution_note?: string;
      note?: string;
    },
  ): Promise<Complaint> {
    return request(`/complaints/${id}`, { method: "PATCH", auth: true, body: changes });
  },

  complaintDuplicates(id: string): Promise<DuplicateCandidate[]> {
    return request(`/complaints/${id}/duplicates`, { auth: true });
  },

  reanalyze(id: string): Promise<{ reference_code: string; changed: boolean }> {
    return request(`/ai/complaints/${id}/reanalyze`, { method: "POST", auth: true });
  },

  // ---- analytics (public) ----
  overview(): Promise<AnalyticsOverview> {
    return request("/analytics/overview");
  },

  distribution(dimension: string): Promise<FrequencyDistribution> {
    return request(`/analytics/distribution/${dimension}`);
  },

  resolutionTime(): Promise<ResolutionTimeReport> {
    return request("/analytics/resolution-time");
  },

  trends(days = 30): Promise<TrendSeries> {
    return request("/analytics/trends", { query: { days } });
  },

  departmentPerformance(): Promise<DepartmentPerformanceReport> {
    return request("/analytics/departments");
  },

  departments(): Promise<DepartmentSummary[]> {
    return request("/departments");
  },

  // ---- ai ----
  aiStatus(): Promise<AIStatus> {
    return request("/ai/status");
  },

  askAssistant(question: string): Promise<AssistantResponse> {
    return request("/ai/assistant", { method: "POST", body: { question } });
  },

  // ---- auth ----
  async login(email: string, password: string): Promise<TokenResponse> {
    const result = await request<TokenResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    tokenStore.set(result.access_token);
    return result;
  },

  me(): Promise<User> {
    return request("/auth/me", { auth: true });
  },

  logout(): void {
    tokenStore.clear();
  },
};
