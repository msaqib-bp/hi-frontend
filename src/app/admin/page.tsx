"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  TrendingDown,
  TrendingUp,
  Wand2,
} from "lucide-react";

import { DepartmentChart } from "@/components/charts/department-chart";
import { DistributionBarChart } from "@/components/charts/distribution-bar-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { Interpretation } from "@/components/interpretation";
import { ResolutionStatsPanel } from "@/components/resolution-stats-panel";
import { StatTile } from "@/components/stat-tile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatHours, formatPercent } from "@/lib/domain";

export default function DashboardPage() {
  const overview = useQuery({ queryKey: ["overview"], queryFn: () => api.overview() });
  const trends = useQuery({ queryKey: ["trends", 30], queryFn: () => api.trends(30) });
  const departments = useQuery({
    queryKey: ["departments-performance"],
    queryFn: () => api.departmentPerformance(),
  });
  const resolution = useQuery({
    queryKey: ["resolution-time"],
    queryFn: () => api.resolutionTime(),
  });

  if (overview.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (overview.isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Could not load the dashboard</AlertTitle>
        <AlertDescription>
          {overview.error instanceof Error
            ? overview.error.message
            : "Unknown error."}
        </AlertDescription>
      </Alert>
    );
  }

  const data = overview.data!;
  const { kpis } = data;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ headline */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-lg font-medium">{data.headline}</p>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total complaints"
          value={kpis.total_complaints}
          icon={FileText}
          hint={`${kpis.submitted_last_7_days} in the last 7 days`}
        />
        <StatTile
          label="Awaiting action"
          value={kpis.open_complaints}
          icon={Inbox}
          hint={`${kpis.in_progress} in progress`}
        />
        <StatTile
          label="Resolved"
          value={kpis.resolved_complaints}
          icon={CheckCircle2}
          hint={`${formatPercent(kpis.resolution_rate, 1)} resolution rate`}
        />
        <StatTile
          label="Median resolution"
          value={formatHours(kpis.median_resolution_hours)}
          icon={Clock}
          hint={`mean ${formatHours(kpis.mean_resolution_hours)}`}
        />

        <StatTile
          label="Critical & open"
          value={kpis.critical_open}
          icon={AlertTriangle}
          emphasis={kpis.critical_open > 0 ? "critical" : "none"}
          hint="target: within 6 hours"
        />
        <StatTile
          label="Past target time"
          value={kpis.overdue_open}
          icon={Clock}
          emphasis={kpis.overdue_open > 0 ? "warning" : "none"}
          hint="open beyond their SLA"
        />
        <StatTile
          label="Closed this week"
          value={kpis.resolved_last_7_days}
          icon={
            kpis.resolved_last_7_days >= kpis.submitted_last_7_days
              ? TrendingUp
              : TrendingDown
          }
          hint={`vs ${kpis.submitted_last_7_days} received`}
        />
        {/* The honest accuracy metric: how often a human disagreed with the model on
            real complaints, as opposed to on a held-out test split. */}
        <StatTile
          label="AI corrected by staff"
          value={formatPercent(kpis.ai_override_rate, 1)}
          icon={Wand2}
          hint="real-world error signal"
        />
      </div>

      <Interpretation text={data.interpretation} />

      {/* ------------------------------------------------------------ charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaints by category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DistributionBarChart distribution={data.by_category} />
            <Interpretation text={data.by_category.interpretation} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaints by priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ordinal ramp: colour depth encodes severity, low → critical. */}
            <DistributionBarChart distribution={data.by_priority} priorityRamp />
            <Interpretation text={data.by_priority.interpretation} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daily volume — submitted vs resolved (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trends.isLoading ? (
            <Skeleton className="h-64" />
          ) : trends.data ? (
            <>
              <TrendChart trend={trends.data} />
              <Interpretation text={trends.data.interpretation} />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Median resolution time by department
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {departments.isLoading ? (
            <Skeleton className="h-64" />
          ) : departments.data ? (
            <>
              <DepartmentChart departments={departments.data.departments} />
              <Interpretation text={departments.data.interpretation} />
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* ------------------------------------------- descriptive statistics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Statistical analysis</h2>
        {resolution.isLoading ? (
          <Skeleton className="h-96" />
        ) : resolution.data ? (
          <ResolutionStatsPanel report={resolution.data} />
        ) : null}
      </div>
    </div>
  );
}
