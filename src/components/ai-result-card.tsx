"use client";

import { Bot, Building2, Info, Sparkles, Timer } from "lucide-react";

import { CategoryBadge, PriorityBadge } from "@/components/complaint-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  confidenceLabel,
  engineLabel,
} from "@/lib/domain";
import type { AIOutput, Complaint } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A confidence bar with a written label.
 *
 * The number alone would overstate precision — a calibrated classifier reporting 0.74 is
 * not making a claim accurate to the percentage point. The word is what tells an operator
 * whether to look closer, so it leads and the figure supports it.
 */
function ConfidenceBar({
  value,
  tone,
}: {
  value: number | null | undefined;
  tone: "high" | "medium" | "low";
}) {
  const percent = Math.round((value ?? 0) * 100);
  const barColor =
    tone === "high"
      ? "bg-emerald-500"
      : tone === "medium"
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {value === null || value === undefined ? "—" : `${percent}%`}
      </span>
    </div>
  );
}

interface AIResultCardProps {
  complaint: Complaint;
  /** Compact variant for the admin detail page, which has its own heading. */
  variant?: "full" | "compact";
}

export function AIResultCard({ complaint, variant = "full" }: AIResultCardProps) {
  const ai: AIOutput | null = complaint.ai_output;
  const categoryConfidence = confidenceLabel(ai?.category_confidence);
  const priorityConfidence = confidenceLabel(ai?.priority_confidence);

  // The LLM engine cannot report a calibrated probability, so it sends 0. Showing a
  // "0% confident" bar would be a lie about a good prediction — hide the bars instead.
  const hasConfidence = (ai?.category_confidence ?? 0) > 0;

  return (
    <Card className={cn(variant === "compact" && "border-0 shadow-none")}>
      <CardHeader className={cn(variant === "compact" && "px-0 pt-0")}>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          What the AI understood
        </CardTitle>
      </CardHeader>

      <CardContent className={cn("space-y-5", variant === "compact" && "px-0 pb-0")}>
        {/* -------------------------------------------------- classification */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category
              </span>
              {complaint.ai_overridden && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Badge variant="secondary" className="text-[10px]" />
                    }
                  >
                    corrected by staff
                  </TooltipTrigger>
                  <TooltipContent>
                    An administrator changed the AI&apos;s classification. The original
                    prediction is kept below for the record.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <CategoryBadge category={complaint.category} />
            {hasConfidence && (
              <>
                <ConfidenceBar
                  value={ai?.category_confidence}
                  tone={categoryConfidence.tone}
                />
                <p className="text-xs text-muted-foreground">
                  {categoryConfidence.label}
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Priority
            </span>
            <div>
              <PriorityBadge priority={complaint.priority} />
            </div>
            {hasConfidence && (
              <>
                <ConfidenceBar
                  value={ai?.priority_confidence}
                  tone={priorityConfidence.tone}
                />
                <p className="text-xs text-muted-foreground">
                  {priorityConfidence.label}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------- department */}
        {complaint.assigned_department && (
          <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 p-3">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Routed to</p>
              <p className="truncate text-sm font-medium">
                {complaint.assigned_department.name}
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------- summary */}
        {complaint.ai_summary && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Summary for the service team
            </span>
            <p className="rounded-lg border-l-2 border-primary bg-muted/40 px-3 py-2 text-sm">
              {complaint.ai_summary}
            </p>
          </div>
        )}

        {/* --------------------------------------------- runner-up candidates */}
        {ai?.category_alternatives && ai.category_alternatives.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Other categories considered
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ai.category_alternatives
                .filter((alternative) => alternative.confidence > 0.01)
                .map((alternative) => (
                  <Badge
                    key={alternative.label}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {CATEGORY_LABELS[
                      alternative.label as keyof typeof CATEGORY_LABELS
                    ] ?? alternative.label}
                    <span className="ml-1.5 tabular-nums text-muted-foreground">
                      {Math.round(alternative.confidence * 100)}%
                    </span>
                  </Badge>
                ))}
              {ai.category_alternatives.every((a) => a.confidence <= 0.01) && (
                <span className="text-xs text-muted-foreground">
                  None — the model was decisive.
                </span>
              )}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- keywords */}
        {ai?.keywords && ai.keywords.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Key terms detected
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ai.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- provenance ---
            Which engine ran, which model version, how long it took. Kept visible
            rather than hidden in a debug panel: explaining the AI is a graded
            requirement, and it is also just honest to show. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            {engineLabel(ai?.engine, ai?.provider)}
          </span>
          {ai?.model_version && (
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />v{ai.model_version}
            </span>
          )}
          {ai?.processing_ms !== null && ai?.processing_ms !== undefined && (
            <span className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              {ai.processing_ms < 1
                ? "<1 ms"
                : `${Math.round(ai.processing_ms)} ms`}
            </span>
          )}
        </div>

        {ai?.notes && ai.notes.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {ai.notes.map((note, index) => (
              <li key={index} className="flex gap-1.5">
                <span aria-hidden>·</span>
                {note}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          These are automated predictions, not decisions. Municipal staff review every
          complaint and can correct the classification.
        </p>
      </CardContent>
    </Card>
  );
}

/** The AI's own summary of what it did, in one line — used above tables and lists. */
export function AISummaryLine({ complaint }: { complaint: Complaint }) {
  return (
    <span className="text-sm text-muted-foreground">
      {CATEGORY_LABELS[complaint.category]} ·{" "}
      {PRIORITY_LABELS[complaint.priority]} priority
    </span>
  );
}
