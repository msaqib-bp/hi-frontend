"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { ApiError } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  // Created in state so the client is stable across re-renders but never shared
  // between users during SSR.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Retrying a 401 or a validation error just delays the real message.
              // A cold Render instance, on the other hand, is worth waiting for.
              if (error instanceof ApiError) {
                if (error.isAuthError || error.status === 404) return false;
                if (error.type === "network_error") return failureCount < 3;
                if (error.status >= 400 && error.status < 500) return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
