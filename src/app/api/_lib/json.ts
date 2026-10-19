import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/client";

/** JSON success response with CDN/browser cache hints (public, read-only data). */
export function ok<T>(data: T, maxAge = 60) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 5}`,
    },
  });
}

/** Maps a backend or network failure to a consistent `{ error: { message } }` body. */
export function fail(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: { message: e.message } }, { status: e.status });
  }
  return NextResponse.json(
    { error: { message: "The service is unreachable. Please try again." } },
    { status: 502 },
  );
}

export function intParam(v: string | null, fallback: number, min: number, max: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export const strParam = (v: string | null, max = 120) =>
  (v ? v.trim().slice(0, max) : undefined) || undefined;
