import { BarChart3, Clock, MapPin, Search } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/landing/reveal";
import { ReportForm } from "@/components/report-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ASSURANCES = [
  { icon: Clock, text: "Takes under a minute — no account needed." },
  { icon: MapPin, text: "A street, landmark or ward is enough for a location." },
  { icon: Search, text: "You get a reference code to follow every step." },
];

/**
 * The closing call to action *is* the form.
 *
 * A CTA that scrolls to a form somewhere else adds a step for no reason; putting the
 * real submission flow here means "Report a Problem" anywhere on the page lands on the
 * thing it names. This is the existing `ReportForm` — same component, same endpoint,
 * same validation as before.
 */
export function ReportCta() {
  return (
    <section
      id="report"
      className="civic-hero-wash border-t py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Report a problem
            </p>

            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              See a Problem? Report It.
            </h2>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Your report can help service teams understand what is happening in your
              community and prioritize the issues that need attention.
            </p>

            <ul className="mt-8 space-y-3.5">
              {ASSURANCES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/70 text-brand ring-1 ring-brand/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/track"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 bg-background/70 px-5",
                )}
              >
                <Search className="mr-2 h-4 w-4" />
                Track a complaint
              </Link>
              <Link
                href="/admin"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-11 px-5",
                )}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ReportForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
