"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ApiError } from "./lib/api-client";

function handle401(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    window.location.href = "/login";
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: false,
        // Todo アプリでは同一ユーザーが単一タブで操作する想定のため無効化。
        // 複数デバイス間の同期が必要になった場合は有効化を検討する。
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!query.meta?.skipRedirectOn401) handle401(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => handle401(error),
    }),
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
