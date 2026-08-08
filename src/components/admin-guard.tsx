"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ApiError, api, tokenStore } from "@/lib/api";
import type { User } from "@/lib/types";

/**
 * Client-side gate for the admin section.
 *
 * This is a **UX convenience, not the security boundary** — every admin API route
 * independently verifies the JWT server-side. Someone bypassing this component sees an
 * empty shell and 401s, not data.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasToken = typeof window !== "undefined" && !!tokenStore.get();

  const query = useQuery<User>({
    queryKey: ["me"],
    queryFn: () => api.me(),
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const unauthenticated =
    !hasToken || (query.isError && query.error instanceof ApiError && query.error.isAuthError);

  useEffect(() => {
    if (unauthenticated) {
      tokenStore.clear();
      router.replace("/admin/login");
    }
  }, [unauthenticated, router]);

  if (unauthenticated || query.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
