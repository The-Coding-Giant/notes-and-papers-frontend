import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { isAllowedPath, isSameOrigin } from "@/lib/bff";
import { API_URL } from "@/lib/env";

/**
 * Backend-for-frontend proxy. The browser never sees the access token: it calls `/api/backend/<path>` on this
 * origin, and this handler adds the Authorization header from the HttpOnly session cookie and forwards to FastAPI.
 * Redirects (signed R2 URLs) are passed back to the browser untouched.
 */

const SAFE_METHODS = new Set(["GET", "HEAD"]);
const FORWARD_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
  "location",
  "retry-after",
];

async function handle(req: Request, ctx: RouteContext<"/api/backend/[...path]">) {
  const { path } = await ctx.params;
  if (!isAllowedPath(path))
    return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
  if (!SAFE_METHODS.has(req.method) && !isSameOrigin(req)) {
    return NextResponse.json({ error: { message: "Cross-site request blocked" } }, { status: 403 });
  }

  const url = new URL(`${API_URL}/${path.map(encodeURIComponent).join("/")}`);
  url.search = new URL(req.url).search;

  const headers = new Headers();
  const token = await getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const ctype = req.headers.get("content-type");
  if (ctype) headers.set("Content-Type", ctype);
  headers.set("Accept", req.headers.get("accept") ?? "application/json");
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) headers.set("X-Forwarded-For", fwd);

  const hasBody = !SAFE_METHODS.has(req.method);
  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
    cache: "no-store",
  }).catch(() => null);
  if (!upstream) {
    return NextResponse.json(
      { error: { message: "The service is unreachable. Please try again." } },
      { status: 502 },
    );
  }

  const out = new Headers();
  for (const h of FORWARD_HEADERS) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  out.set("Cache-Control", "no-store");
  return new Response(upstream.status === 204 || upstream.status === 304 ? null : upstream.body, {
    status: upstream.status,
    headers: out,
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
