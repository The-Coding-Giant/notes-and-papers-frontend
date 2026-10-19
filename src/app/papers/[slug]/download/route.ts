import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { API_URL } from "@/lib/env";

/**
 * GET /papers/<slug>/download
 * Downloads need an account. Signed-out visitors go to /login and come back to the paper page afterwards;
 * signed-in visitors are redirected to the PDF (the API records the download first). The source URL only ever
 * travels in this redirect, it is not written into any HTML page.
 */
export async function GET(req: Request, ctx: RouteContext<"/papers/[slug]/download">) {
  const { slug } = await ctx.params;
  const token = await getAccessToken();
  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", `/papers/${slug}`);
    return NextResponse.redirect(login);
  }
  const upstream = await fetch(`${API_URL}/papers/${encodeURIComponent(slug)}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "manual",
    cache: "no-store",
  }).catch(() => null);

  const target = upstream?.headers.get("location");
  if (upstream && upstream.status >= 300 && upstream.status < 400 && target) {
    return NextResponse.redirect(target, { headers: { "Cache-Control": "no-store" } });
  }
  if (upstream?.status === 404) return new NextResponse("Paper not found", { status: 404 });
  if (upstream?.status === 401) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", `/papers/${slug}`);
    return NextResponse.redirect(login);
  }
  return new NextResponse("The file is temporarily unavailable. Please try again.", {
    status: 502,
  });
}
