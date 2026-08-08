/**
 * Chart palette and shared chart configuration.
 *
 * Every palette below was checked with the data-viz validator (lightness band, chroma
 * floor, colour-vision-deficiency separation, normal-vision separation, surface
 * contrast) in **both** light and dark mode. Do not substitute colours by eye — re-run
 * the validator if you change them.
 *
 * Form choices, and why:
 *
 * - **Category distribution → ranked horizontal bars, one hue.** Seven categories in a
 *   pie would need seven distinguishable colours *and* a legend round-trip to read.
 *   Bars carry identity in the axis label, so colour has no identity job at all and
 *   magnitude is directly comparable along a shared baseline.
 * - **Priority → single-hue ordinal ramp (light→dark = low→critical).** Priority is
 *   ordered magnitude, not identity. An earlier attempt mapped it onto the status
 *   palette; the validator failed it — warning-yellow and serious-orange sit at
 *   normal-vision ΔE 13.6, below the 15 floor, so full-colour readers could not
 *   reliably tell High from Critical. A one-hue ramp encodes the ordering honestly.
 * - **Trend → two-series line.** Two genuinely independent series, so two categorical
 *   hues (slots 1 and 2), which validate cleanly as a pair in both modes.
 * - **Department performance → horizontal bars, one hue.** Same reasoning as category.
 */

/** Categorical slots 1–2, used only where there are genuinely two series. */
export const SERIES = {
  light: { primary: "#2a78d6", secondary: "#eb6834" },
  dark: { primary: "#3987e5", secondary: "#d95926" },
} as const;

/** Single hue for magnitude comparisons (bar charts). */
export const MAGNITUDE_HUE = {
  light: "#2a78d6",
  dark: "#3987e5",
} as const;

/**
 * Ordinal severity ramp for priority: low → critical, light → dark.
 * Validated with `--ordinal`: monotone lightness, ΔL gaps ≥ 0.06, single hue (3° spread),
 * light end clears 2:1 against the surface.
 */
export const PRIORITY_RAMP = {
  light: {
    low: "#86b6ef",
    medium: "#3987e5",
    high: "#256abf",
    critical: "#104281",
  },
  dark: {
    low: "#b7d3f6",
    medium: "#86b6ef",
    high: "#3987e5",
    critical: "#184f95",
  },
} as const;

/** Recessive grid and axis ink — never competes with the data. */
export const CHART_INK = {
  light: { grid: "#e7e5e4", axis: "#78716c", text: "#52514e" },
  dark: { grid: "#2a2a28", axis: "#8a8a80", text: "#c3c2b7" },
} as const;

export type ChartMode = "light" | "dark";

export function chartColors(mode: ChartMode) {
  return {
    series: SERIES[mode],
    magnitude: MAGNITUDE_HUE[mode],
    priority: PRIORITY_RAMP[mode],
    ink: CHART_INK[mode],
  };
}
