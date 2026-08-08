import {
  Droplets,
  Lightbulb,
  ShieldAlert,
  Trash2,
  TrafficCone,
  Waves,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeading } from "@/components/landing/section";

/**
 * The six service categories the classifier actually predicts, in the same order and
 * with the same names the admin UI uses. Nothing here is aspirational: if a card is
 * listed, a complaint can be routed to it today.
 */
const PROBLEMS = [
  {
    icon: TrafficCone,
    title: "Roads",
    body: "Potholes, damaged roads and unsafe road conditions.",
  },
  {
    icon: Droplets,
    title: "Water",
    body: "Leaks, broken pipelines and water supply problems.",
  },
  {
    icon: Trash2,
    title: "Waste",
    body: "Overflowing bins and unmanaged garbage.",
  },
  {
    icon: Waves,
    title: "Drainage",
    body: "Blocked drains, sewer overflow and flooding.",
  },
  {
    icon: Lightbulb,
    title: "Electricity",
    body: "Broken streetlights and electrical hazards.",
  },
  {
    icon: ShieldAlert,
    title: "Public Safety",
    body: "Unsafe public areas, open manholes and damaged infrastructure.",
  },
];

export function Problems() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="One Platform for Everyday Civic Problems"
        subtitle="Report local issues and help service teams respond faster."
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROBLEMS.map(({ icon: Icon, title, body }, index) => (
          <Reveal
            as="li"
            key={title}
            delay={index * 60}
            className="group rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand/30"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/8 text-brand ring-1 ring-brand/15 transition-colors duration-300 group-hover:bg-brand group-hover:text-white group-hover:ring-brand">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </Reveal>
        ))}
      </ul>

      <Reveal className="mt-8 text-center text-sm text-muted-foreground">
        Something that does not fit these? Report it anyway — anything unmatched is
        routed to <span className="font-medium text-foreground">Other Services</span> for
        a person to read.
      </Reveal>
    </Section>
  );
}
