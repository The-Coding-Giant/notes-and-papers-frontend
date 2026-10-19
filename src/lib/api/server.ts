import "server-only";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth/session";
import { ApiError, apiFetch, type ApiOptions } from "./client";
import type { Me } from "./types";

/** Authenticated, uncached API call for Server Components. Redirects to /login when signed out. */
export async function authedFetch<T>(
  path: string,
  opts: ApiOptions = {},
  next?: string,
): Promise<T> {
  const token = await getAccessToken();
  if (!token) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  try {
    return await apiFetch<T>(path, { ...opts, token, revalidate: false });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
    throw e;
  }
}

/** The signed-in user, or null (also null when the API rejects the token). */
export async function getMe(): Promise<Me | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await apiFetch<Me>("/me", { token, revalidate: false });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null;
    throw e;
  }
}
