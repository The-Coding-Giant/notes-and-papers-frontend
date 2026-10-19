import { getSitemapPage } from "@/lib/api/public";
import { SITE_URL } from "@/lib/env";
import { API_SITEMAP_TYPES, sitemapIndexXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  const now = new Date().toISOString();
  const items = [{ loc: `${SITE_URL}/sitemaps/static/1.xml`, lastmod: now }];

  const results = await Promise.allSettled(API_SITEMAP_TYPES.map((t) => getSitemapPage(t, 1)));
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return; // API down: omit that type rather than fail the whole index
    const pages = Math.max(1, r.value.total_pages);
    for (let n = 1; n <= pages; n++) {
      items.push({ loc: `${SITE_URL}/sitemaps/${API_SITEMAP_TYPES[i]}/${n}.xml`, lastmod: now });
    }
  });

  return xmlResponse(sitemapIndexXml(items));
}
