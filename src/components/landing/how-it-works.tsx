import { ClipboardList, Gauge, Sparkles, Wrench } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeading } from "@/components/landing/section";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: ClipboardList,
    number: "01",
    title: "Report",
    body: "Citizens submit a complaint with description and location.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI Understands",
    body: "AI analyzes the complaint and identifies the civic problem.",
  },
  {
    icon: Gauge,
    number: "03",
    title: "Prioritize",
    body: "The system estimates the urgency and priority.",
  },
  {
    icon: Wrench,
    number: "04",
    title: "Take Action",
    body: "Service teams manage, assign and resolve the complaint.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="border-y bg-muted/40">
      <SectionHeading
        eyebrow="How It Works"
        title="From Complaint to Action"
        subtitle="Four steps, from a sentence typed on a phone to a job on a crew's list."
      />

      <ol className="mt-14 grid gap-10 lg:grid-cols-4 lg:gap-6">
        {STEPS.map(({ icon: Icon, number, title, body }, index) => {
          const isLast = index === STEPS.length - 1;

          return (
            <Reveal
              as="li"
              key={number}
              delay={index * 90}
              className="relative pl-[4.25rem] lg:pl-0"
            >
              {/* The connector runs between the step markers — horizontally once the
                  steps sit side by side, vertically while they are stacked. */}
              {!isLast && (
                <span
                  aria-hidden
                  className="civic-flow-line absolute -bottom-10 left-6 top-14 w-0.5 -translate-x-1/2 rounded-full lg:hidden"
                />
              )}
              {!isLast && (
                <span
                  aria-hidden
                  className="civic-flow-line-x absolute left-16 top-6 hidden h-0.5 w-[calc(100%-3rem)] -translate-y-1/2 rounded-full lg:block"
                />
              )}

              <span
                className={cn(
                  "absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1",
                  "bg-card text-brand ring-brand/20",
                  "lg:static lg:mb-6",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:mt-0">
                {number}
              </p>
              <h3 className="mt-1.5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}
