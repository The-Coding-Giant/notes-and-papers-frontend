"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-fetches the server data every few seconds while `active` (e.g. a job is running). */
export function AutoRefresh({ active, seconds = 4 }: { active: boolean; seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [active, seconds, router]);
  return null;
}
