import { About } from "@/components/landing/about";
import { AiIntelligence } from "@/components/landing/ai-intelligence";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Insights } from "@/components/landing/insights";
import { Problems } from "@/components/landing/problems";
import { ReportCta } from "@/components/landing/report-cta";

/**
 * The landing page is a composition, nothing more — each section owns its own copy,
 * data and motion. Only the sections that need the browser (`ai-intelligence`,
 * `dashboard-preview`, `insights`) are client components; the rest render on the server.
 *
 * The order tells the story once: what it is → what it covers → how it works → what the
 * AI actually produces → what you get → what the data shows → what it does not do →
 * report something.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Problems />
      <HowItWorks />
      <AiIntelligence />
      <Features />
      <DashboardPreview />
      <Insights />
      <About />
      <ReportCta />
    </>
  );
}
