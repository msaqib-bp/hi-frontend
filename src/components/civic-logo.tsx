import { cn } from "@/lib/utils";

/**
 * The CivicAI mark: a civic building under a small signal arc.
 *
 * Drawn inline rather than assembled from two Lucide glyphs so the two halves stay in
 * proportion at every size, and so the tile can carry the brand gradient — the one
 * place on the page where a gradient is doing identity work rather than decoration.
 */
export function CivicLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand-accent text-white shadow-sm",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[62%] w-[62%]"
      >
        {/* signal arc — the "AI listening" half of the mark */}
        <path d="M7.5 6.2a6 6 0 0 1 9 0" opacity={0.9} />
        <circle cx="12" cy="3.4" r="1.05" fill="currentColor" stroke="none" />
        {/* civic building */}
        <path d="M4 20h16" />
        <path d="M5.5 20v-7M9.8 20v-7M14.2 20v-7M18.5 20v-7" />
        <path d="M4 12.4 12 8l8 4.4" />
      </svg>
    </span>
  );
}
