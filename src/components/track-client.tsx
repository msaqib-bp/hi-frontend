"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  Clock,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, api } from "@/lib/api";
import { formatDateTime, formatHours, formatRelative } from "@/lib/domain";

export function TrackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The reference lives in the URL so a tracking link can be bookmarked or shared —
  // which is how people actually keep hold of it.
  const referenceFromUrl = searchParams.get("ref") ?? "";
  const [input, setInput] = useState(referenceFromUrl);

  const query = useQuery({
    queryKey: ["complaint", referenceFromUrl],
    queryFn: () => api.trackComplaint(referenceFromUrl),
    enabled: referenceFromUrl.trim().length > 0,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim().toUpperCase();
    if (trimmed) router.push(`/track?ref=${encodeURIComponent(trimmed)}`);
  };

  const complaint = query.data;

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="CIV-XXXXXX"
          className="font-mono uppercase"
          aria-label="Reference code"
          autoComplete="off"
        />
        <Button type="submit" disabled={query.isFetching}>
          {query.isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Track</span>
        </Button>
      </form>

      {query.isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {query.isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {query.error instanceof ApiError && query.error.status === 404
              ? "No complaint found with that code"
              : "Could not load that complaint"}
          </AlertTitle>
          <AlertDescription>
            {query.error instanceof ApiError && query.error.status === 404
              ? "Check the code and try again — it looks like CIV- followed by six characters."
              : query.error instanceof Error
                ? query.error.message
                : "Something went wrong."}
          </AlertDescription>
        </Alert>
      )}

      {complaint && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-mono text-xl tracking-wide">
                    {complaint.reference_code}
                  </CardTitle>
                  <CardDescription>
                    Submitted {formatRelative(complaint.created_at)} ·{" "}
                    {formatDateTime(complaint.created_at)}
                  </CardDescription>
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

              <div className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="truncate font-medium">{complaint.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="truncate font-medium">
                      {complaint.assigned_department?.name ?? "Not yet assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {complaint.resolved_at ? "Resolved in" : "Open for"}
                    </p>
                    <p className="font-medium">
                      {formatHours(
                        complaint.resolution_hours ?? complaint.age_hours,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {complaint.resolution_note && (
                <div className="rounded-lg border-l-2 border-emerald-500 bg-emerald-50/50 px-3 py-2 dark:bg-emerald-950/20">
                  <p className="text-xs font-medium text-muted-foreground">
                    Outcome
                  </p>
                  <p className="text-sm">{complaint.resolution_note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline events={complaint.events} />
            </CardContent>
          </Card>

          <AIResultCard complaint={complaint} />
        </div>
      )}

      {!referenceFromUrl && !query.isLoading && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Enter a reference code above to see the status and full history of a
              complaint.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
