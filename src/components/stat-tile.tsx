import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A single headline number.
 *
 * The number is the mark, so it gets the visual weight; the label sits above it in
 * muted ink and the optional hint below. Emphasis is reserved for tiles that genuinely
 * need attention (open criticals, overdue work) — if everything is highlighted, nothing
 * reads as urgent.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  emphasis = "none",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  emphasis?: "none" | "warning" | "critical";
}) {
  return (
    <Card
      className={cn(
        emphasis === "critical" &&
          "border-red-200 bg-red-50/40 dark:border-red-900/60 dark:bg-red-950/20",
        emphasis === "warning" &&
          "border-amber-200 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                emphasis === "critical"
                  ? "text-red-600 dark:text-red-400"
                  : emphasis === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground",
              )}
            />
          )}
        </div>
        <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
