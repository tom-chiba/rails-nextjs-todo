"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthApiError } from "./lib/api-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (
          error instanceof AuthApiError &&
          error.status === 401 &&
          !query.meta?.skipRedirectOn401
        ) {
          window.location.href = "/login";
        }
      },
    }),
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
