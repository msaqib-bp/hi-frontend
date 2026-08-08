"use client";

import { useEffect, useRef, useState } from "react";

import { DistributionBarChart } from "@/components/charts/distribution-bar-chart";
import { DataSourcePill } from "@/components/landing/data-source-pill";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeading } from "@/components/landing/section";
import { useLandingOverview } from "@/components/landing/use-landing-overview";
import { cn } from "@/lib/utils";

/**
 * Count a figure up once, when it first comes into view.
 *
 * Motion is doing a job here rather than decorating: the point of the section is that
 * these are accumulating totals. It is skipped entirely under `prefers-reduced-motion`,
 * where the final value is rendered immediately.
 */
function useCountUp(target: number, start: boolean, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = setTimeout(() => setValue(target));
      return () => clearTimeout(id);
    }

    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      // Ease-out: the number decelerates into its final value instead of stopping dead.
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration]);

  return value;
}

function StatFigure({
  value,
  label,
  hint,
  format,
  start,
  emphasis,
}: {
  value: number;
  label: string;
  hint: string;
  format: (value: number) => string;
  start: boolean;
  emphasis?: boolean;
}) {
  const animated = useCountUp(value, start);

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5 shadow-sm ring-1 transition-shadow duration-300 hover:shadow-md",
        emphasis ? "ring-brand/25" : "ring-foreground/10",
      )}
    >
      <p
        className={cn(
          "text-3xl font-bold tabular-nums tracking-tight sm:text-4xl",
          emphasis && "text-brand",
        )}
      >
        {format(animated)}
      </p>
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function Insights() {
  const { overview, live } = useLandingOverview();
  const { kpis } = overview;

  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setStarted(true));
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const integer = (value: number) => Math.round(value).toLocaleString();
  const percent = (value: number) => `${Math.round(value)}%`;

  return (
    <Section id="insights" className="border-y bg-muted/40">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            align="start"
            eyebrow="Insights"
            title="Turn Civic Complaints Into Better Decisions"
            subtitle="One complaint is a repair request. A thousand of them, classified and timed, show which problems are most common, which are most urgent, and which are taking too long to close."
            className="max-w-none"
          />

          <Reveal className="mt-8" delay={80}>
            <div ref={ref} className="grid grid-cols-2 gap-4">
              <StatFigure
                value={kpis.total_complaints}
                label="Total Complaints"
                hint={`${kpis.submitted_last_7_days} received in the last 7 days`}
                format={integer}
                start={started}
              />
              <StatFigure
                value={kpis.resolved_complaints}
                label="Resolved"
                hint={`${kpis.resolved_last_7_days} closed in the last 7 days`}
                format={integer}
                start={started}
              />
              <StatFigure
                value={kpis.critical_open}
                label="Critical"
                hint="open now — target response within 6 hours"
                format={integer}
                start={started}
              />
              <StatFigure
                value={kpis.resolution_rate * 100}
                label="Resolution Progress"
                hint="share of all complaints closed"
                format={percent}
                start={started}
                emphasis
              />
            </div>
          </Reveal>

          <Reveal className="mt-6 flex items-center gap-3">
            <DataSourcePill live={live} />
            <p className="text-xs text-muted-foreground">
              {live
                ? "Read from the service's public analytics endpoint."
                : "Shown while the analytics service is unreachable."}
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
            <h3 className="text-sm font-semibold">Complaints by category</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Which civic problems the city is actually reporting.
            </p>

            <div className="mt-5">
              <DistributionBarChart distribution={overview.by_category} height={300} />
            </div>

            <p className="mt-4 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
              {overview.by_category.interpretation}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
