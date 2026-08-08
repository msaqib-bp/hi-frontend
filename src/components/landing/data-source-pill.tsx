import { cn } from "@/lib/utils";

/**
 * Says where the numbers beside it came from.
 *
 * The landing page shows live service figures when the API answers and an illustrative
 * snapshot when it does not. Which one is on screen has to be visible, not inferred.
 */
export function DataSourcePill({
  live,
  className,
}: {
  live: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        live
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "relative h-1.5 w-1.5 rounded-full bg-current",
          live && "civic-ping",
        )}
      />
      {live ? "Live service data" : "Sample data"}
    </span>
  );
}
