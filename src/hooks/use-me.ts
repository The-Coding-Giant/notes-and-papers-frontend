"use client";

import { useQuery } from "@tanstack/react-query";
import type { Me } from "@/lib/api/types";

/** The signed-in user, or `null` when signed out. Cached for a minute across the app. */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    staleTime: 60_000,
    retry: false,
    queryFn: async (): Promise<Me | null> => {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) return null;
      return ((await res.json()) as { user: Me | null }).user;
    },
  });
}
