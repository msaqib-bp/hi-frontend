import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  CATEGORY_LABELS,
  PRIORITY_BADGE,
  PRIORITY_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
} from "@/lib/domain";
import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  category,
  className,
}: {
  category: ComplaintCategory;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: ComplaintPriority;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", PRIORITY_BADGE[priority], className)}
    >
      {/* Critical carries an icon as well as colour, so it is not conveyed by hue alone. */}
      {priority === "critical" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: ComplaintStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_BADGE[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-red-200 bg-red-100 font-medium text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
        className,
      )}
    >
      <AlertTriangle className="mr-1 h-3 w-3" />
      Overdue
    </Badge>
  );
}
