import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/env";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessOptions,
  refreshOptions,
  secondsLeft,
  type TokenPair,
} from "@/lib/auth/cookies";

const PRIVATE = ["/admin", "/account", "/bookmarks", "/downloads", "/upload"];

/**
 * Keeps the session alive (swaps the refresh token for a new access token when the old one is about to expire)
 * and gates signed-in-only routes. Role checks (admin/moderator) are enforced again by the API and the admin layout.
 */
export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let tokens: TokenPair | null = null;

  if (secondsLeft(access) < 60 && refresh) {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    }).catch(() => null);
    if (res?.ok) tokens = (await res.json()) as TokenPair;
  }

  const signedIn = tokens !== null || secondsLeft(access) > 0;
  const path = request.nextUrl.pathname;
  if (!signedIn && PRIVATE.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    const redirect = NextResponse.redirect(url);
    if (refresh && !tokens) {
      redirect.cookies.delete(REFRESH_COOKIE);
      redirect.cookies.delete(ACCESS_COOKIE);
    }
    return redirect;
  }

  if (tokens) {
    // Visible to the page being rendered now, and stored in the browser for the next requests.
    request.cookies.set(ACCESS_COOKIE, tokens.access_token);
    const response = NextResponse.next({ request });
    response.cookies.set(ACCESS_COOKIE, tokens.access_token, accessOptions(tokens.expires_in));
    response.cookies.set(REFRESH_COOKIE, tokens.refresh_token, refreshOptions());
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap|sitemaps/|indexnow).*)"],
};
