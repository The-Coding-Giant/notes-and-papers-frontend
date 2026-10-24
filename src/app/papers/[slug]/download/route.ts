import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { API_URL } from "@/lib/env";

/**
 * GET /papers/<slug>/download
 * Downloads need an account. Signed-out visitors go to /login and come back to the paper page afterwards; signed-in
 * visitors get the PDF itself. The API either sends the file (papers stored without their cover pages are put together
 * there) or points at a short-lived storage link; both end here as one plain PDF response, so the browser never needs
 * permission to talk to the storage service and the source address is never exposed.
 */
export async function GET(req: Request, ctx: RouteContext<"/papers/[slug]/download">) {
  const { slug } = await ctx.params;
  const token = await getAccessToken();
  if (!token) return toLogin(req, slug);

  const upstream = await fetch(`${API_URL}/papers/${encodeURIComponent(slug)}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "manual",
    cache: "no-store",
  }).catch(() => null);

  if (upstream?.status === 200 && upstream.body) return pdf(upstream.body, slug);

  const target = upstream?.headers.get("location");
  if (upstream && upstream.status >= 300 && upstream.status < 400 && target) {
    // Older papers: the API hands out a signed storage link (no login header goes to the storage service).
    const file = await fetch(target, { cache: "no-store" }).catch(() => null);
    if (file?.ok && file.body) return pdf(file.body, slug);
    return unavailable();
  }
  if (upstream?.status === 404) {
    return new NextResponse("This PDF is still being prepared. Please try again later.", {
      status: 404,
    });
  }
  if (upstream?.status === 401) return toLogin(req, slug);
  return unavailable();
}

function toLogin(req: Request, slug: string) {
  const login = new URL("/login", req.url);
  login.searchParams.set("next", `/papers/${slug}`);
  return NextResponse.redirect(login);
}

function unavailable() {
  return new NextResponse("The file is temporarily unavailable. Please try again.", {
    status: 502,
  });
}

function pdf(body: ReadableStream<Uint8Array>, slug: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
