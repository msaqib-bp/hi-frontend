"use client";

import { AlertTriangle, CheckCircle2, FileText, Inbox } from "lucide-react";
import Link from "next/link";

import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/complaint-badges";
import { DataSourcePill } from "@/components/landing/data-source-pill";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeading } from "@/components/landing/section";
import { useLandingOverview } from "@/components/landing/use-landing-overview";
import { StatTile } from "@/components/stat-tile";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRIORITY_LABELS, formatHours, formatPercent } from "@/lib/domain";
import { SAMPLE_RECENT } from "@/lib/sample-analytics";
import type { ComplaintPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Priority mix as stacked proportions.
 *
 * A four-step ordinal scale on a shared 100% baseline: the question a supervisor asks
 * here is "how much of the queue is serious", which is a part-to-whole reading, not a
 * ranking. The severity ramp goes light → dark with the ordering, and every segment
 * carries its label, so hue is never the only channel.
 */
const PRIORITY_BAR: Record<ComplaintPriority, string> = {
  low: "bg-brand/25",
  medium: "bg-brand/50",
  high: "bg-brand/75",
  critical: "bg-brand",
};

function PriorityMix({
  items,
}: {
  items: { key: string; label: string; count: number; percentage: number }[];
}) {
  const order: ComplaintPriority[] = ["low", "medium", "high", "critical"];
  const sorted = order
    .map((key) => items.find((item) => item.key === key))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const total = sorted.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {sorted.map((item) => (
          <span
            key={item.key}
            className={cn(PRIORITY_BAR[item.key as ComplaintPriority])}
            style={{ width: `${(item.count / total) * 100}%` }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-4 xl:grid-cols-1">
        {sorted.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                PRIORITY_BAR[item.key as ComplaintPriority],
              )}
            />
            <dt className="text-muted-foreground">
              {PRIORITY_LABELS[item.key as ComplaintPriority] ?? item.label}
            </dt>
            <dd className="ml-auto font-semibold tabular-nums">{item.count}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function DashboardPreview() {
  const { overview, live } = useLandingOverview();
  const { kpis } = overview;

  return (
    <Section id="dashboard">
      <SectionHeading
        eyebrow="Dashboard"
        title="See What Your City Needs Most"
        subtitle="Every complaint lands in one queue with its category, priority and age already attached — so the next job to do is visible without reading the backlog."
      />

      <Reveal className="mt-12">
        {/* Window chrome frames the screenshot as a product, and makes it obvious this
            is the staff dashboard rather than another marketing panel. */}
        <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-foreground/10">
          <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            </span>
            {/* On the narrowest phones the chrome bar cannot hold the label and the
                data-source pill side by side, and the pill is the one that carries
                meaning — so the label drops out entirely rather than truncating. */}
            <span className="hidden rounded-md bg-background px-2.5 py-1 text-xs whitespace-nowrap text-muted-foreground ring-1 ring-border min-[380px]:inline-block">
              Service dashboard
              <span className="hidden sm:inline"> — /admin</span>
            </span>
            <DataSourcePill live={live} className="ml-auto shrink-0" />
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="Total complaints"
                value={kpis.total_complaints.toLocaleString()}
                icon={FileText}
                hint={`${kpis.submitted_last_7_days} in the last 7 days`}
              />
              <StatTile
                label="Open complaints"
                value={(kpis.open_complaints + kpis.in_progress).toLocaleString()}
                icon={Inbox}
                hint={`${kpis.in_progress} in progress`}
              />
              <StatTile
                label="Critical complaints"
                value={kpis.critical_open.toLocaleString()}
                icon={AlertTriangle}
                emphasis={kpis.critical_open > 0 ? "critical" : "none"}
                hint="open, target response 6 hours"
              />
              <StatTile
                label="Resolved complaints"
                value={kpis.resolved_complaints.toLocaleString()}
                icon={CheckCircle2}
                hint={`${Math.round(kpis.resolution_rate * 100)}% of all complaints`}
              />
            </div>

            {/* `min-w-0` on both tracks: a grid item defaults to `min-width: auto`, so
                the table's intrinsic width would otherwise stretch the whole row past
                the panel instead of scrolling inside its own container. */}
            {/* Side by side only from `xl`: below that the two cards stack so the
                complaints table keeps the full panel width and all five of its columns
                stay on screen, which is the whole point of showing it. */}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
              <div className="min-w-0 rounded-xl border p-5">
                <h3 className="text-sm font-semibold">Priority distribution</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Share of the queue at each urgency level.
                </p>
                <div className="mt-5">
                  <PriorityMix items={overview.by_priority.items} />
                </div>

                <dl className="mt-6 grid gap-3 border-t pt-5 text-sm sm:grid-cols-3 xl:grid-cols-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">Past target time</dt>
                    <dd className="font-semibold tabular-nums">{kpis.overdue_open}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">Median resolution</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatHours(kpis.median_resolution_hours)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">AI corrected by staff</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatPercent(kpis.ai_override_rate, 1)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="min-w-0 rounded-xl border p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Recent complaints</h3>
                  <span className="text-xs text-muted-foreground">
                    Illustrative rows
                  </span>
                </div>

                <div className="mt-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Reference</TableHead>
                        <TableHead>Complaint</TableHead>
                        <TableHead className="whitespace-nowrap">Category</TableHead>
                        <TableHead className="whitespace-nowrap">Priority</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SAMPLE_RECENT.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="whitespace-nowrap font-mono text-xs">
                            {row.reference_code}
                          </TableCell>
                          <TableCell className="min-w-[14rem] max-w-sm">
                            <p className="truncate">{row.description}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {row.location}
                            </p>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={row.category} />
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={row.priority} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={row.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
        >
          Open the dashboard
        </Link>
        <p className="text-sm text-muted-foreground">
          Staff sign-in required — complaint records are not public.
        </p>
      </Reveal>
    </Section>
  );
}
