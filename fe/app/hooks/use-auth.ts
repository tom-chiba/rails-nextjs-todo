"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  deleteApiV1AuthSignOut,
  useGetApiV1Me,
} from "../generated/api-client/todoAPIV1";
import { selectData } from "../lib/api-client";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetApiV1Me({
    query: {
      meta: { skipRedirectOn401: true },
      select: selectData,
    },
  });

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
