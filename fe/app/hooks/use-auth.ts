"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  deleteApiV1AuthSignOut,
  useGetApiV1Me,
} from "../generated/api-client/todoAPIV1";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetApiV1Me({
    query: { meta: { skipRedirectOn401: true } },
  });

  const user = data as { id: number; email_address: string } | undefined;

  return {
    email: user?.email_address ?? null,
    loading: isLoading,
    async signOut() {
      try {
        await deleteApiV1AuthSignOut();
      } finally {
        queryClient.clear();
        router.push("/login");
      }
    },
  };
}
