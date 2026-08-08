"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  Loader2,
  MapPin,
  RefreshCw,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AIResultCard } from "@/components/ai-result-card";
import {
  OverdueBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/complaint-badges";
import { StatusTimeline } from "@/components/status-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api";
import {
  CATEGORY_LABELS,
  formatDateTime,
  formatHours,
  formatRelative,
} from "@/lib/domain";
import type { ComplaintStatus } from "@/lib/types";

/**
 * Which transitions the backend will accept from each status.
 *
 * Mirrored here so the UI only offers legal moves rather than letting a user pick one
 * and receive a 409. The backend remains the authority — this is not a substitute for
 * its check, just a way to avoid presenting an action that cannot work.
 */
const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  open: ["assigned", "in_progress", "rejected"],
  assigned: ["in_progress", "resolved", "rejected", "open"],
  in_progress: ["resolved", "rejected", "assigned"],
  resolved: ["in_progress"],
  rejected: ["open"],
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export function ComplaintDetail({ complaintId }: { complaintId: string }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  const { data: complaint, isLoading, isError, error } = useQuery({
    queryKey: ["complaint-detail", complaintId],
    queryFn: () => api.getComplaint(complaintId),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.departments(),
    staleTime: 10 * 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["complaint-detail", complaintId] });
    // The dashboard aggregates change too, so let them refetch on next view.
    queryClient.invalidateQueries({ queryKey: ["overview"] });
    queryClient.invalidateQueries({ queryKey: ["complaints"] });
    queryClient.invalidateQueries({ queryKey: ["resolution-time"] });
  };

  const update = useMutation({
    mutationFn: (changes: Parameters<typeof api.updateComplaint>[1]) =>
      api.updateComplaint(complaintId, changes),
    onSuccess: () => {
      toast.success("Complaint updated");
      setNote("");
      setResolutionNote("");
      invalidate();
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof ApiError
          ? mutationError.message
          : "Could not update the complaint.",
      );
    },
  });

  const reanalyze = useMutation({
    mutationFn: () => api.reanalyze(complaintId),
    onSuccess: (result) => {
      toast.success(
        result.changed
          ? "Re-analysed — the AI changed its classification."
          : "Re-analysed — the AI reached the same conclusion.",
      );
      invalidate();
    },
    onError: () => toast.error("Could not re-run the analysis."),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Could not load this complaint</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Unknown error."}
        </AlertDescription>
      </Alert>
    );
  }

  const allowedNext = ALLOWED_TRANSITIONS[complaint.status] ?? [];

  return (
    <div className="space-y-5">
      <Link
        href="/admin/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to complaints
      </Link>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ------------------------------------------------------- main column */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-mono text-lg tracking-wide">
                      {complaint.reference_code}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy reference"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(complaint.reference_code)
                          .then(() => toast.success("Reference copied"))
                          .catch(() => toast.info(complaint.reference_code));
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted {formatRelative(complaint.created_at)} ·{" "}
                    {formatDateTime(complaint.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  {complaint.is_overdue && <OverdueBadge />}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm">{complaint.description}</p>

              <div className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{complaint.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Reported by</p>
                    <p className="truncate font-medium">
                      {complaint.reporter_name ?? "Anonymous"}
                      {complaint.reporter_contact && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {complaint.reporter_contact}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{formatHours(complaint.age_hours)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolution time</p>
                  <p className="font-medium">
                    {formatHours(complaint.resolution_hours)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {complaint.assigned_department?.name ?? "Unassigned"}
                  </p>
                </div>
              </div>

              {complaint.resolution_note && (
                <div className="rounded-lg border-l-2 border-emerald-500 bg-emerald-50/50 px-3 py-2 dark:bg-emerald-950/20">
                  <p className="text-xs font-medium text-muted-foreground">Outcome</p>
                  <p className="text-sm">{complaint.resolution_note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">History</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline events={complaint.events} />
            </CardContent>
          </Card>
        </div>

        {/* --------------------------------------------------------- side column */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Move to status</Label>
                <div className="flex flex-wrap gap-2">
                  {allowedNext.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No further transitions available.
                    </p>
                  )}
                  {allowedNext.map((next) => (
                    <Button
                      key={next}
                      size="sm"
                      variant={next === "resolved" ? "default" : "outline"}
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          status: next,
                          note: note || undefined,
                          resolution_note:
                            next === "resolved" || next === "rejected"
                              ? resolutionNote || undefined
                              : undefined,
                        })
                      }
                    >
                      {STATUS_LABEL[next]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note for the timeline (optional)</Label>
                <Textarea
                  id="note"
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. Crew dispatched this morning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Outcome note (when closing)</Label>
                <Textarea
                  id="resolution"
                  rows={2}
                  value={resolutionNote}
                  onChange={(event) => setResolutionNote(event.target.value)}
                  placeholder="e.g. Pipeline repaired and road restored"
                />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Reassign department</Label>
                <Select
                  value={complaint.assigned_department?.id ?? ""}
                  onValueChange={(value) => {
                    if (value) update.mutate({ assigned_department_id: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Correcting the AI is a first-class action, not an edge case: the override
              rate it feeds is the dashboard's real-world accuracy metric. */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Correct the AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={complaint.category}
                  onValueChange={(value) => {
                    if (value) update.mutate({ category: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={complaint.priority}
                  onValueChange={(value) => {
                    if (value) update.mutate({ priority: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["low", "medium", "high", "critical"].map((value) => (
                      <SelectItem key={value} value={value} className="capitalize">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={reanalyze.isPending}
                onClick={() => reanalyze.mutate()}
              >
                {reanalyze.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                )}
                Re-run AI analysis
              </Button>

              {complaint.ai_overridden && (
                <p className="text-xs text-muted-foreground">
                  This complaint has been manually corrected. Re-running the analysis
                  will not overwrite your correction.
                </p>
              )}
            </CardContent>
          </Card>

          <AIResultCard complaint={complaint} />
        </div>
      </div>
    </div>
  );
}
