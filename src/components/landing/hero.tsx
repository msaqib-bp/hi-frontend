import {
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/landing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** One stop on the pipeline, drawn as an icon rail plus a labelled body. */
function FlowNode({
  icon: Icon,
  step,
  title,
  children,
  tone = "default",
}: {
  icon: typeof Sparkles;
  step: string;
  title: string;
  children?: React.ReactNode;
  tone?: "default" | "ai" | "done";
}) {
  return (
    <div className="flex gap-3.5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
          tone === "ai" && "bg-brand text-white ring-brand/30",
          tone === "done" && "bg-success/12 text-success ring-success/25",
          tone === "default" && "bg-muted text-muted-foreground ring-border",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {step}
        </p>
        <p className="mt-0.5 text-sm font-semibold">{title}</p>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

/** The animated segment between two nodes. */
function FlowConnector() {
  return (
    <div
      aria-hidden
      className="civic-flow-line ml-[calc(1.125rem-1px)] h-6 w-0.5 rounded-full"
    />
  );
}

function Chip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs",
        tone === "warn"
          ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200"
          : "border-border bg-muted/60 text-foreground",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

/**
 * The hero visual: the complaint pipeline as a working diagram.
 *
 * A stock photograph of a pothole would say "civic"; it would not say what the product
 * does. This shows the actual transformation — free text in, a category, a priority and
 * a crew brief out — which is the entire claim of the page.
 */
function PipelineVisual() {
  return (
    <div className="relative">
      <div aria-hidden className="civic-grid absolute -inset-8 -z-10" />

      <div className="rounded-2xl bg-card p-5 shadow-xl ring-1 ring-foreground/10 sm:p-6 lg:pb-12">
        <div className="mb-5 flex items-center justify-between gap-3 border-b pb-4">
          <p className="text-sm font-semibold">Complaint pipeline</p>
          {/* Labelled "Example" rather than "Live": this is a worked illustration, and a
              status pill that implies a real feed would be claiming something untrue. */}
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Example
          </span>
        </div>

        <FlowNode icon={MessageSquareText} step="Step 01" title="Citizen complaint">
          <p className="rounded-lg bg-muted/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            “There is a large water leak near the main road and traffic is becoming
            difficult.”
          </p>
        </FlowNode>

        <FlowConnector />

        <FlowNode icon={Sparkles} step="Step 02" title="AI analysis" tone="ai">
          <div className="flex flex-wrap gap-1.5">
            <Chip label="Category" value="Water / Drainage" />
            <Chip label="Priority" value="High" tone="warn" />
          </div>
        </FlowNode>

        <FlowConnector />

        <FlowNode icon={Truck} step="Step 03" title="Service team">
          <p className="text-xs text-muted-foreground">
            Routed to Water &amp; Drainage, then reviewed by staff.
          </p>
        </FlowNode>

        <FlowConnector />

        <FlowNode icon={CheckCircle2} step="Step 04" title="Resolved" tone="done">
          <p className="text-xs text-muted-foreground">
            Status and every step stay visible under your reference code.
          </p>
        </FlowNode>
      </div>

      {/* Layered rather than free-floating: negative margins tuck the card under the
          panel's bottom edge and out to the left, which reads as depth without covering
          any of the pipeline. Absolute positioning here would sit on top of steps 2–4. */}
      <div className="relative z-10 mt-4 rounded-2xl bg-card p-4 shadow-xl ring-1 ring-foreground/10 lg:-ml-12 lg:-mt-6 lg:mr-10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <p className="text-sm font-semibold">AI Analysis</p>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Category</dt>
            <dd className="mt-0.5 font-semibold">Water / Drainage</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Priority</dt>
            <dd className="mt-0.5 font-semibold text-amber-700 dark:text-amber-300">
              High
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">AI Summary</dt>
            <dd className="mt-0.5 leading-relaxed text-foreground/90">
              “Major water leakage reported near the main road causing traffic
              disruption.”
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="civic-hero-wash relative overflow-x-clip border-b">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="civic-ping relative h-1.5 w-1.5 rounded-full bg-brand text-brand" />
              AI-Powered Civic Service Platform
            </p>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Smarter Cities Start With{" "}
              <span className="text-brand">Smarter Complaints</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Report local problems, let AI understand them, and help service teams
              prioritize what matters most.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#report"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 px-5 text-[0.95rem] shadow-sm transition-transform hover:-translate-y-0.5",
                )}
              >
                Report a Problem
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-5 text-[0.95rem]",
                )}
              >
                Explore How It Works
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t pt-6 text-sm">
              {[
                ["No account", "needed to report"],
                ["Reference code", "to follow progress"],
                ["Staff reviewed", "before anything closes"],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="font-semibold">{term}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="lg:pl-6">
            <PipelineVisual />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
