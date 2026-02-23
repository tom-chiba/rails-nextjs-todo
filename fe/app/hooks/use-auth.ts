"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, signOut as apiSignOut } from "../api/auth";
import type { MeResponse } from "../types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return {
    email: user?.email_address ?? null,
    async signOut() {
      try {
        await apiSignOut();
      } finally {
        setUser(null);
        router.push("/login");
      }
    },
  };
}
