import { Check, CircleDot, Clock } from "lucide-react";

import { STATUS_LABELS } from "@/lib/domain";
import { formatDateTime, formatRelative } from "@/lib/domain";
import type { StatusEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Vertical timeline of a complaint's lifecycle.
 *
 * This is the payoff for issuing a reference code: "we received it, we assigned it to
 * Water Supply, a crew started, it was resolved" — with dates. That narrative is the
 * thing citizens actually want, far more than a status word.
 */
export function StatusTimeline({ events }: { events: StatusEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const isTerminal =
          event.to_status === "resolved" || event.to_status === "rejected";

        return (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line, drawn behind the dot and stopped on the last item. */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[11px] top-6 h-full w-px bg-border"
              />
            )}

            <span
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-background",
                isTerminal
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : isLast
                    ? "border-primary text-primary"
                    : "border-muted-foreground/40 text-muted-foreground",
              )}
            >
              {isTerminal ? (
                <Check className="h-3 w-3" />
              ) : isLast ? (
                <Clock className="h-3 w-3" />
              ) : (
                <CircleDot className="h-3 w-3" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="font-medium">{STATUS_LABELS[event.to_status]}</p>
                <time
                  dateTime={event.created_at}
                  className="text-xs text-muted-foreground"
                  title={formatDateTime(event.created_at)}
                >
                  {formatRelative(event.created_at)}
                </time>
              </div>

              {event.note && (
                <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
              )}

              <p className="mt-1 text-xs text-muted-foreground">
                by {event.actor} · {formatDateTime(event.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
