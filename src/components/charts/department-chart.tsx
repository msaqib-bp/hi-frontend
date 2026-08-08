"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { useChartMode } from "@/components/charts/use-chart-mode";
import type { DepartmentPerformance } from "@/lib/types";

/**
 * Median resolution time per department, ranked.
 *
 * **Median, not mean** — deliberately. The resolution-time distribution has a long
 * right tail (a handful of stalled jobs run to hundreds of hours), so the mean would
 * rank a department by its worst few cases rather than its typical performance. The
 * outliers are worth seeing, but they belong in the IQR panel, not in this comparison.
 *
 * One hue: the department name on the axis carries identity, so colour is free to mean
 * nothing at all.
 */
export function DepartmentChart({
  departments,
  height = 280,
}: {
  departments: DepartmentPerformance[];
  height?: number;
}) {
  const { colors } = useChartMode();

  const data = departments
    .filter((department) => department.median_resolution_hours !== null)
    .map((department) => ({
      name: department.department,
      hours: department.median_resolution_hours ?? 0,
      total: department.total,
    }))
    .sort((a, b) => a.hours - b.hours);

  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No department has resolved a complaint yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 52, bottom: 4, left: 4 }}
        barCategoryGap="22%"
      >
        <CartesianGrid horizontal={false} stroke={colors.ink.grid} strokeDasharray="3 3" />
        <XAxis
          type="number"
          tick={{ fill: colors.ink.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          unit="h"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tick={{ fill: colors.ink.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: colors.ink.grid, fillOpacity: 0.35 }}
          content={<ChartTooltip valueSuffix="h" />}
        />
        <Bar
          dataKey="hours"
          name="Median resolution"
          fill={colors.magnitude}
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
          label={{
            position: "right",
            fill: colors.ink.text,
            fontSize: 11,
            // Recharts types this as RenderableText (string | number | undefined),
            // so narrow before formatting rather than asserting a number.
            formatter: (value: unknown) =>
              typeof value === "number" ? `${value.toFixed(1)}h` : "",
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
