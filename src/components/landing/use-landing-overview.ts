"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { SAMPLE_OVERVIEW } from "@/lib/sample-analytics";

/**
 * Overview figures for the landing page, live where possible.
 *
 * `/analytics/overview` is a public endpoint — the same one the staff dashboard uses —
 * so the marketing page can show the real service instead of invented numbers. When the
 * API is unreachable (a sleeping free-tier instance is the common case) or the database
 * is still empty, it falls back to the illustrative snapshot and reports `live: false`,
 * which every caller must surface to the reader.
 */
export function useLandingOverview() {
  const query = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.overview(),
    staleTime: 60_000,
  });

  const live = Boolean(query.data && query.data.kpis.total_complaints > 0);

  return {
    overview: live ? query.data! : SAMPLE_OVERVIEW,
    live,
    isLoading: query.isLoading,
  };
}
