import { getSitemapPage } from "@/lib/api/public";
import { STATIC_PATHS, isSitemapType, urlsetXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET(_req: Request, ctx: RouteContext<"/sitemaps/[type]/[file]">) {
  const { type, file } = await ctx.params;
  const match = /^(\d+)\.xml$/.exec(file);
  if (!match || !isSitemapType(type)) return new Response("Not found", { status: 404 });
  const page = Number(match[1]);

  if (type === "static") {
    const lastmod = new Date().toISOString();
    return xmlResponse(urlsetXml(STATIC_PATHS.map((path) => ({ path, lastmod }))));
  }

  try {
    const data = await getSitemapPage(type, page);
    return xmlResponse(urlsetXml(data.items));
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503 });
  }
}
