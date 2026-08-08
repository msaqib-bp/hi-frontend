import { Suspense } from "react";

import { TrackClient } from "@/components/track-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Track a complaint",
  description: "Check the status of a civic complaint using its reference code.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Track your complaint</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the reference code you received when you submitted it — for example{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            CIV-8F3K2A
          </code>
          .
        </p>
      </div>

      {/* useSearchParams needs a Suspense boundary in the App Router, otherwise the
          whole route opts out of static rendering. */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <TrackClient />
      </Suspense>
    </div>
  );
}
