"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { type ChartMode, chartColors } from "@/lib/chart-theme";

/**
 * Resolve the chart palette for the active theme.
 *
 * Dark mode is a *selected* palette — steps re-chosen for the dark surface and
 * validated against it — not an automatic inversion of the light one.
 *
 * Before mount the theme is unknown (the server cannot read it), so this returns the
 * light palette. Charts are client-only and render after hydration, so no flash occurs.
 */
/** Nothing to subscribe to: the value differs only between server and client render. */
const NO_SUBSCRIBE = () => () => {};

export function useChartMode() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => true,
    () => false,
  );

  const mode: ChartMode = mounted && resolvedTheme === "dark" ? "dark" : "light";
  return { mode, colors: chartColors(mode), mounted };
}
