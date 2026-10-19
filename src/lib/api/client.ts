import { API_URL } from "@/lib/env";
import type { ErrorBody } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

export interface ApiOptions {
  query?: Query;
  /** ISR window in seconds. `false` disables caching (dynamic). */
  revalidate?: number | false;
  /** Cache tags used by `POST /api/revalidate`. See docs/projectflow.md section 9. */
  tags?: string[];
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { query, revalidate = 86400, tags, method = "GET", body, token, signal } = opts;
  const res = await fetch(buildUrl(path, query), {
    method,
    signal,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(revalidate === false || process.env.NODE_ENV !== "production"
      ? { cache: "no-store" as const }
      : { next: { revalidate, tags: [...(tags ?? []), "catalog"] } }),
  });

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const data = (await res.json()) as ErrorBody;
      message = data.error?.message ?? data.detail ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Like `apiFetch` but resolves to `null` on 404 so pages can call `notFound()`. Other errors still throw. */
export async function apiFetchOrNull<T>(path: string, opts?: ApiOptions): Promise<T | null> {
  try {
    return await apiFetch<T>(path, opts);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
