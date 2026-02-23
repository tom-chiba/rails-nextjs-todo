"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { signOut as apiSignOut } from "../api/auth";
import { clearUserEmail, getUserEmail } from "../lib/auth-cookie";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("auth-change", onStoreChange);
  return () => window.removeEventListener("auth-change", onStoreChange);
}

function useEmail(): string | null {
  return useSyncExternalStore(subscribe, getUserEmail, () => null);
}

export function useAuth() {
  const router = useRouter();
  const email = useEmail();

  return {
    email,
    async signOut() {
      try {
        await apiSignOut();
      } finally {
        clearUserEmail();
        router.push("/login");
      }
    },
  };
}
