"use client";

import { Interpretation } from "@/components/interpretation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "@/lib/domain";
import type { ResolutionTimeReport } from "@/lib/types";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

/**
 * The descriptive-statistics panel.
 *
 * This is the Statistics benchmark made visible: central tendency, dispersion,
 * quartiles and Tukey fences, each with the backend's written interpretation beneath —
 * because the requirement is to explain what the statistics mean, not to display them.
 *
 * Values the backend declines to compute (variance with n<2, quartiles with n<4) arrive
 * as `null` and render as "—". That is deliberate: showing 0 for an undefined statistic
 * would be a number someone could quote.
 */
export function ResolutionStatsPanel({ report }: { report: ResolutionTimeReport }) {
  const { descriptive, quartiles } = report;

  const fmt = (value: number | null) =>
    value === null || value === undefined ? "—" : formatHours(value);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Resolution time — central tendency &amp; spread
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <StatRow label="Resolved complaints (n)" value={String(descriptive.count)} />
            <StatRow label="Mean" value={fmt(descriptive.mean)} />
            <StatRow label="Median" value={fmt(descriptive.median)} />
            <StatRow
              label="Mode (nearest hour)"
              value={fmt(descriptive.mode)}
            />
            <StatRow label="Minimum" value={fmt(descriptive.minimum)} />
            <StatRow label="Maximum" value={fmt(descriptive.maximum)} />
            <StatRow label="Range" value={fmt(descriptive.range)} />
            <StatRow
              label="Variance"
              value={
                descriptive.variance === null
                  ? "—"
                  : `${descriptive.variance.toFixed(1)} h²`
              }
            />
            <StatRow
              label="Standard deviation"
              value={fmt(descriptive.std_deviation)}
            />
          </div>
          <Interpretation text={descriptive.interpretation} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Quartiles, IQR &amp; outliers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <StatRow label="Q1 (25th percentile)" value={fmt(quartiles.q1)} />
            <StatRow label="Q2 (median)" value={fmt(quartiles.q2_median)} />
            <StatRow label="Q3 (75th percentile)" value={fmt(quartiles.q3)} />
            <StatRow label="Interquartile range" value={fmt(quartiles.iqr)} />
            <StatRow label="Lower fence" value={fmt(quartiles.lower_fence)} />
            <StatRow label="Upper fence" value={fmt(quartiles.upper_fence)} />
            <StatRow label="Outliers" value={String(quartiles.outlier_count)} />
            <StatRow
              label="SLA breach rate"
              value={`${(report.sla_breach_rate * 100).toFixed(1)}%`}
            />
          </div>

          {quartiles.outlier_references.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Abnormally slow complaints
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quartiles.outlier_references.map((reference) => (
                  <code
                    key={reference}
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
                  >
                    {reference}
                  </code>
                ))}
              </div>
            </div>
          )}

          <Interpretation text={quartiles.interpretation} />
        </CardContent>
      </Card>

      {Object.keys(report.by_priority).length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Resolution time by priority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Wide table on a narrow screen: scroll the table, never the page. */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Priority</th>
                    <th className="py-2 pr-3 text-right font-medium">n</th>
                    <th className="py-2 pr-3 text-right font-medium">Mean</th>
                    <th className="py-2 pr-3 text-right font-medium">Median</th>
                    <th className="py-2 text-right font-medium">Std dev</th>
                  </tr>
                </thead>
                <tbody>
                  {["critical", "high", "medium", "low"]
                    .filter((key) => report.by_priority[key])
                    .map((key) => {
                      const stats = report.by_priority[key];
                      return (
                        <tr key={key} className="border-b last:border-0">
                          <td className="py-2 pr-3 capitalize">{key}</td>
                          <td className="py-2 pr-3 text-right tabular-nums">
                            {stats.count}
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums">
                            {fmt(stats.mean)}
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums">
                            {fmt(stats.median)}
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {fmt(stats.std_deviation)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <Interpretation text={report.interpretation} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
