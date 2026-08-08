import {
  BarChart3,
  FileText,
  Filter,
  Gauge,
  Route,
  Tags,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeading } from "@/components/landing/section";

const FEATURES = [
  {
    icon: Tags,
    title: "AI Complaint Classification",
    body: "Automatically categorize complaints into relevant civic departments.",
  },
  {
    icon: Gauge,
    title: "Priority Prediction",
    body: "Identify Low, Medium, High and Critical complaints.",
  },
  {
    icon: FileText,
    title: "AI Summarization",
    body: "Convert lengthy citizen complaints into short actionable summaries.",
  },
  {
    icon: Route,
    title: "Complaint Tracking",
    body: "Track complaints from Open to Assigned, In Progress and Resolved.",
  },
  {
    icon: Filter,
    title: "Smart Search & Filters",
    body: "Filter complaints by category, priority, status, location and department.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    body: "Understand complaint patterns, priorities and trends.",
  },
];

export function Features() {
  return (
    <Section id="features" className="border-y bg-muted/40">
      <SectionHeading
        eyebrow="Features"
        title="Everything the Service Needs, in One Place"
        subtitle="Built around what the platform actually does today — classification, prioritisation, summarisation and the tools to work the queue."
      />

      <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }, index) => (
          <Reveal
            as="li"
            key={title}
            delay={index * 50}
            className="group bg-card p-7 transition-colors duration-300 hover:bg-accent/50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/8 text-brand ring-1 ring-brand/15 transition-transform duration-300 group-hover:scale-105">
              <Icon className="h-[1.15rem] w-[1.15rem]" />
            </span>
            <h3 className="mt-5 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
