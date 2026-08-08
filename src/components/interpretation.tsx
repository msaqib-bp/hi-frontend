import { Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The backend's generated reading of a statistic.
 *
 * Every analytics endpoint returns an `interpretation` string explaining what the
 * numbers mean — mean-vs-median skew, outliers past the upper fence, whether
 * prioritisation is actually working. Rendering it next to each chart is the point:
 * a dashboard that only plots numbers leaves the reader to do the analysis.
 */
export function Interpretation({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
