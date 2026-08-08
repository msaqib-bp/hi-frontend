"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  OverdueBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/complaint-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { CATEGORY_LABELS, formatHours, formatRelative } from "@/lib/domain";

const ANY = "__any__";

const STATUS_OPTIONS = [
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"] as const;
const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[];

export default function ComplaintsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>(ANY);
  const [priority, setPriority] = useState<string>(ANY);
  const [category, setCategory] = useState<string>(ANY);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);

  const filters = {
    q: query || undefined,
    status: status === ANY ? undefined : status,
    priority: priority === ANY ? undefined : priority,
    category: category === ANY ? undefined : category,
    overdue_only: overdueOnly || undefined,
    page,
    page_size: 20,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["complaints", filters],
    queryFn: () => api.listComplaints(filters),
  });

  const hasFilters =
    query || status !== ANY || priority !== ANY || category !== ANY || overdueOnly;

  const resetFilters = () => {
    setSearch("");
    setQuery("");
    setStatus(ANY);
    setPriority(ANY);
    setCategory(ANY);
    setOverdueOnly(false);
    setPage(1);
  };

  // Any filter change invalidates the current page number — staying on page 4 of a
  // now-2-page result set shows an empty table.
  // The Select emits `string | null` (null when cleared), so coerce back to "any".
  const withPageReset =
    (setter: (value: string) => void) => (value: string | null) => {
      setter(value ?? ANY);
      setPage(1);
    };

  return (
    <div className="space-y-4">
      {/* Filters in one row above the table. */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(search);
                setPage(1);
              }}
              className="flex min-w-[220px] flex-1 gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search description, reference or location…"
                  className="pl-8"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </form>

            <Select value={status} onValueChange={withPageReset(setStatus)}>
              <SelectTrigger className="w-[145px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All statuses</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={withPageReset(setPriority)}>
              <SelectTrigger className="w-[135px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All priorities</SelectItem>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={withPageReset(setCategory)}>
              <SelectTrigger className="w-[175px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All categories</SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {CATEGORY_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={overdueOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setOverdueOnly((current) => !current);
                setPage(1);
              }}
            >
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Overdue
            </Button>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load complaints."}
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Wide table on a narrow screen scrolls inside its own container so the
                page body never scrolls horizontally. */}
            <div className="overflow-x-auto">
              <Table className="min-w-[880px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Reference</TableHead>
                    <TableHead>Complaint</TableHead>
                    <TableHead className="w-[150px]">Category</TableHead>
                    <TableHead className="w-[110px]">Priority</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[110px]">Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        No complaints match these filters.
                      </TableCell>
                    </TableRow>
                  )}

                  {data?.items.map((complaint) => (
                    <TableRow key={complaint.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Link
                          href={`/admin/complaints/${complaint.id}`}
                          className="font-mono text-xs font-medium underline-offset-4 hover:underline"
                        >
                          {complaint.reference_code}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[380px]">
                        <Link
                          href={`/admin/complaints/${complaint.id}`}
                          className="block"
                        >
                          <span className="line-clamp-1 text-sm font-medium">
                            {complaint.ai_summary ?? complaint.description}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {complaint.location}
                            {complaint.assigned_department &&
                              ` · ${complaint.assigned_department.name}`}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {CATEGORY_LABELS[complaint.category]}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={complaint.priority} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge status={complaint.status} />
                          {complaint.is_overdue && <OverdueBadge />}
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-xs text-muted-foreground"
                        title={formatRelative(complaint.created_at)}
                      >
                        {formatHours(complaint.age_hours)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(data.page - 1) * data.page_size + 1}–
            {Math.min(data.page * data.page_size, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">
              {data.page} / {data.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
