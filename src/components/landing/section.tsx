import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

/**
 * Shared shell for a landing section.
 *
 * Every section on the page uses the same container width, the same vertical rhythm and
 * the same heading scale. Centralising it is what keeps the page reading as one document
 * rather than as a stack of independently designed blocks.
 */
export function Section({
  id,
  children,
  className,
  containerClassName,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    // No `scroll-mt-*` here: `scroll-padding-top` on <html> already clears the sticky
    // header for every anchor, and adding both offsets the target twice.
    <section id={id} className={cn("py-16 sm:py-20 lg:py-24", className)}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/** Eyebrow + title + subtitle, centred by default. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl",
          eyebrow && "mt-3",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
