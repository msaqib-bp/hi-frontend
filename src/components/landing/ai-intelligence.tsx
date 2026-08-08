"use client";

import { ArrowDown, ArrowRight, Loader2, RotateCcw, Sparkles } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeading } from "@/components/landing/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPLAINT =
  "There is a large water leak near the main road and traffic is becoming difficult.";

/** Each output block appears once the one before it has landed. */
const OUTPUTS = [
  {
    label: "AI Classification",
    value: "Water / Drainage",
    detail: "Routed to the Water & Drainage department.",
  },
  {
    label: "Priority",
    value: "High",
    detail: "Inferred from the described impact on traffic.",
    tone: "warn" as const,
  },
  {
    label: "Actionable Summary",
    value:
      "Large water leakage affecting traffic near the main road. Requires urgent inspection.",
    detail: "Written for the crew, not for a filing cabinet.",
  },
];

const STEP_MS = 700;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    // The server cannot know; assume motion is fine and let the client correct it.
    () => false,
  );
}

export function AiIntelligence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  // -1 = untouched, 0 = analysing, 1..3 = that many output blocks revealed.
  const [stage, setStage] = useState(-1);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = useCallback(() => {
    clearTimers();

    if (reducedMotion) {
      setStage(OUTPUTS.length);
      return;
    }

    setStage(0);
    for (let index = 1; index <= OUTPUTS.length; index += 1) {
      timers.current.push(
        setTimeout(() => setStage(index), STEP_MS * index),
      );
    }
  }, [reducedMotion]);

  // Start the sequence when the section is actually being looked at, so a reader who
  // lands halfway down the page still sees the transformation happen.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setStage(OUTPUTS.length));
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run();
            observer.disconnect();
          }
        }
      },
      // Deliberately low: on a short viewport a tall section may never reach a high
      // ratio, and a sequence that never starts is worse than one that starts early.
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [run]);

  const analysing = stage === 0;
  const done = stage >= OUTPUTS.length;

  return (
    <Section id="ai">
      <SectionHeading
        eyebrow="AI Intelligence"
        title="AI That Turns Complaints Into Actionable Information"
        subtitle="The same sentence a citizen would actually type, and everything the model derives from it."
      />

      <div
        ref={containerRef}
        className="mx-auto mt-14 grid max-w-5xl items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6"
      >
        {/* ------------------------------------------------ citizen complaint */}
        <Reveal className="flex flex-col rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Citizen complaint
            </p>
          </div>

          <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-pretty">
            “{COMPLAINT}”
          </blockquote>

          <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">
            Free text. No category picked, no form fields to decode, no account created.
          </p>
        </Reveal>

        {/* ----------------------------------------------------- the transform */}
        <div className="flex items-center justify-center lg:flex-col">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full shadow-sm ring-1 transition-colors duration-500",
              done
                ? "bg-brand text-white ring-brand/30"
                : "bg-card text-brand ring-brand/20",
            )}
          >
            {analysing ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <ArrowDown className="h-4.5 w-4.5 lg:hidden" />
                <ArrowRight className="hidden h-4.5 w-4.5 lg:block" />
              </>
            )}
          </span>
        </div>

        {/* -------------------------------------------------------- ai output */}
        <Reveal
          delay={100}
          className="flex flex-col rounded-2xl bg-card p-6 shadow-lg ring-1 ring-brand/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              AI Analyzed
            </span>

            <Button
              variant="ghost"
              size="xs"
              onClick={run}
              className="text-muted-foreground"
              aria-label="Replay the AI analysis animation"
            >
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Replay
            </Button>
          </div>

          <dl className="mt-5 flex-1 space-y-4">
            {OUTPUTS.map((output, index) => {
              const revealed = stage > index;

              return (
                <div
                  key={output.label}
                  // The row keeps its space from the start, so nothing below it jumps
                  // as each block lands.
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-500",
                    revealed
                      ? "border-border bg-muted/40 opacity-100"
                      : "border-dashed border-border/70 opacity-45",
                  )}
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {output.label}
                  </dt>

                  {revealed ? (
                    <dd className="civic-rise mt-2">
                      <p
                        className={cn(
                          "font-semibold leading-relaxed",
                          output.label === "Actionable Summary"
                            ? "text-sm"
                            : "text-lg",
                          output.tone === "warn" &&
                            "text-amber-700 dark:text-amber-300",
                        )}
                      >
                        {output.value}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {output.detail}
                      </p>
                    </dd>
                  ) : (
                    <dd className="mt-2 space-y-2" aria-hidden>
                      <span className="block h-4 w-2/3 animate-pulse rounded bg-muted" />
                      <span className="block h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>

          <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
            The model proposes; staff decide. Category and priority can be corrected in
            the dashboard, and nothing is closed automatically.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
