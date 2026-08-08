"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { useChartMode } from "@/components/charts/use-chart-mode";
import type { TrendSeries } from "@/lib/types";

/**
 * Daily submitted vs resolved, with the 7-day moving average of submissions.
 *
 * Two independent series on **one shared y-axis** — both are counts of complaints, so
 * they belong on the same scale. (A second y-axis would let any pair of lines be made
 * to look correlated, which is why this chart never has one.)
 *
 * The moving average is drawn dashed and thinner: it is a derived guide, not a third
 * measurement, and should read as background to the two real series.
 */
export function TrendChart({
  trend,
  height = 280,
}: {
  trend: TrendSeries;
  height?: number;
}) {
  const { colors } = useChartMode();

  if (!trend.points.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No activity in this period.
      </p>
    );
  }

  const data = trend.points.map((point) => ({
    ...point,
    label: new Date(point.period).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    }),
  }));

  // With a month of daily points, labelling every tick collides. Show roughly six.
  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
        <CartesianGrid vertical={false} stroke={colors.ink.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          interval={tickInterval}
          tick={{ fill: colors.ink.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: colors.ink.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={44}
        />
        <Tooltip
          cursor={{ stroke: colors.ink.axis, strokeWidth: 1 }}
          content={<ChartTooltip />}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: colors.ink.text, paddingTop: 8 }}
          iconType="plainline"
          iconSize={14}
        />
        <Line
          type="monotone"
          dataKey="submitted"
          name="Submitted"
          stroke={colors.series.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          name="Resolved"
          stroke={colors.series.secondary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="moving_average_7d"
          name="7-day average"
          stroke={colors.series.primary}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeOpacity={0.55}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
