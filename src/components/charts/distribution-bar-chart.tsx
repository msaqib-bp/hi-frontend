"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { useChartMode } from "@/components/charts/use-chart-mode";
import type { FrequencyDistribution } from "@/lib/types";

/**
 * Ranked horizontal bars for a categorical distribution.
 *
 * Chosen over a pie deliberately: with seven categories a pie needs seven
 * distinguishable colours and forces a legend round-trip for every slice, while
 * near-equal slices are impossible to rank by eye. Bars put identity in the axis label
 * and magnitude on a shared baseline, so colour carries no identity job and one hue
 * suffices.
 *
 * `priorityRamp` switches to the ordinal severity ramp — used only for the priority
 * distribution, where the categories are ordered rather than merely different.
 */
export function DistributionBarChart({
  distribution,
  priorityRamp = false,
  height = 260,
}: {
  distribution: FrequencyDistribution;
  priorityRamp?: boolean;
  height?: number;
}) {
  const { colors } = useChartMode();

  if (!distribution.items.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No data yet.
      </p>
    );
  }

  // Priority keeps its semantic order (low → critical); everything else ranks by
  // magnitude, which is what makes a ranked bar chart readable at a glance.
  const order = ["low", "medium", "high", "critical"];
  const data = priorityRamp
    ? [...distribution.items].sort(
        (a, b) => order.indexOf(a.key) - order.indexOf(b.key),
      )
    : [...distribution.items].sort((a, b) => b.count - a.count);

  const barColor = (key: string) =>
    priorityRamp
      ? (colors.priority[key as keyof typeof colors.priority] ?? colors.magnitude)
      : colors.magnitude;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 44, bottom: 4, left: 4 }}
        barCategoryGap="22%"
      >
        <CartesianGrid
          horizontal={false}
          stroke={colors.ink.grid}
          strokeDasharray="3 3"
        />
        <XAxis
          type="number"
          tick={{ fill: colors.ink.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fill: colors.ink.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: colors.ink.grid, fillOpacity: 0.35 }}
          content={<ChartTooltip />}
        />
        <Bar
          dataKey="count"
          name="Complaints"
          // 4px rounded ends on the data end only; the baseline end stays square so
          // bars remain anchored to the axis.
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
          label={{
            position: "right",
            fill: colors.ink.text,
            fontSize: 11,
          }}
        >
          {data.map((item) => (
            <Cell key={item.key} fill={barColor(item.key)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
