# PRD summary (from docs/projectflow.md)

**Goal:** students find UNIRAJ previous-year papers (and notes) by course -> part/semester -> subject -> year.
Primary KPI: every paper/subject/course page is indexable and ranks ("BCA 1st year question papers Rajasthan University").

## Frontend scope
- Routes (spec section 9): `/`, `/universities[/{university}[/{course}[/{term}[/{subject}]]]]`, `/papers/{slug}`,
  `/notes[/{slug}]`, `/search`, `/login /signup /forgot-password /account /bookmarks /downloads /upload`,
  `/about /contact /privacy /terms /takedown`, `/admin/**`, `/sitemap.xml`, `/sitemaps/{type}/{n}.xml`, `/robots.txt`.
- ISR: `fetch(..., { next: { revalidate: 86400, tags } })`. Tags: `paper:{slug}`, `subject:{id}`, `term:{id}`,
  `course:{id}`, `home`. Backend calls `POST /api/revalidate` with header `x-revalidate-secret`.
- SEO templates and JSON-LD per page type: spec section 10 (implemented in `src/lib/seo.ts`).
- Auth: Supabase (email+password, Google); API calls send `Authorization: Bearer <jwt>`; admin routes guarded in
  `src/proxy.ts` and again by the API.
- Content-rights rule: `link_only` papers show our page but the download button goes to the original URL.
  Takedown page + form required.

## Edge cases to remember
- API down at build or runtime: home/university degrade to empty states; other pages throw to `error.tsx`
  (never cache a bad render).
- Search results and account pages are `noindex`; `/search`, `/admin`, `/api`, `/account` are disallowed in robots.txt.
- Sitemaps max 40,000 URLs each; the index omits a type if the API is unreachable.

## Status
See `module_index.md` (per route) and `handover.md` (what is next).
