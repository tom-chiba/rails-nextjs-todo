"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, signOut as apiSignOut } from "../api/auth";
import type { MeResponse } from "../types";

// TODO: useAuth() は呼び出しごとに独立して getMe() を実行するため、
// 複数コンポーネントで使用すると N 回 API コールが発生する。
// 使用箇所が増えた場合は React Context または SWR で重複排除すること。
// See: https://github.com/tom-chiba/rails-nextjs-todo/issues/59
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return {
    email: user?.email_address ?? null,
    loading,
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
