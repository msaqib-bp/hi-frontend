import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeading } from "@/components/landing/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Stating the limits on the public page, not buried in a report. A system that triages
 * public-safety complaints should be candid about being fallible, because the reader is
 * the person affected by the mistake.
 */
const LIMITS = [
  {
    title: "It can be wrong.",
    body: "Every complaint is reviewed by staff, who can correct the category and priority. Nothing is closed automatically.",
  },
  {
    title: "It reads tone.",
    body: "Urgency is inferred from how the complaint is written, so a calm report of a serious problem may be under-rated. Say plainly if something is dangerous.",
  },
  {
    title: "English works best.",
    body: "Complaints written mainly in other languages are classified less reliably.",
  },
  {
    title: "It cannot verify anything.",
    body: "It sorts what you tell it; a crew still has to visit and check.",
  },
];

export function About() {
  return (
    <Section id="about">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="start"
            eyebrow="About"
            title="What the AI does — and what it does not"
            className="max-w-none"
          />

          <Reveal className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Smart Civic Services does three things to a complaint: it predicts the
              service category it belongs to, it predicts how urgent it is, and it writes
              a short brief a field crew can act on. It also checks whether the same
              problem has already been reported nearby, so one pothole does not become
              six work orders.
            </p>
            <p>
              That is the whole of it. There is no camera network, no sensor grid and no
              tracking of the people who report — a description and a location are all it
              ever sees.
            </p>
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap gap-3" delay={80}>
            <Link
              href="/admin/ai"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5",
              )}
            >
              See how the model performs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <Reveal
          delay={120}
          className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-7"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/8 text-brand ring-1 ring-brand/15">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <h3 className="font-semibold">Honest limitations</h3>
          </div>

          <ul className="mt-5 space-y-4">
            {LIMITS.map(({ title, body }) => (
              <li key={title} className="flex gap-3 text-sm leading-relaxed">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50"
                />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-foreground">{title}</strong>{" "}
                  {body}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
