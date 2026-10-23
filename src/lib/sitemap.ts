import { SITE_URL } from "@/lib/env";
import { routes } from "@/lib/routes";
import type { SitemapEntry } from "@/lib/api/types";

/** Sitemap types served from the backend (`GET /seo/sitemap/{type}?page=`), max 40,000 URLs each. */
export const API_SITEMAP_TYPES = ["papers", "subjects", "courses", "exams", "notes"] as const;
export const SITEMAP_TYPES = ["static", ...API_SITEMAP_TYPES] as const;
export type SitemapType = (typeof SITEMAP_TYPES)[number];

export const isSitemapType = (v: string): v is SitemapType =>
  (SITEMAP_TYPES as readonly string[]).includes(v);

export const STATIC_PATHS = [
  "/",
  routes.universities,
  routes.exams,
  "/notes",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/takedown",
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function urlsetXml(entries: SitemapEntry[]) {
  const body = entries
    .map(
      (e) =>
        `<url><loc>${esc(SITE_URL + (e.path === "/" ? "" : e.path))}</loc><lastmod>${esc(e.lastmod)}</lastmod></url>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function sitemapIndexXml(items: { loc: string; lastmod: string }[]) {
  const body = items
    .map((i) => `<sitemap><loc>${esc(i.loc)}</loc><lastmod>${esc(i.lastmod)}</lastmod></sitemap>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export const xmlResponse = (xml: string) =>
  new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
