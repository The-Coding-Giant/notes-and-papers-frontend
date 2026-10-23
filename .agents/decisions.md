# Decisions (ADRs)

- **ADR-001 Next.js 16 App Router, Tailwind v4, hand-written shadcn-style UI.** The spec asks for 14+. Atoms are
  written locally (no Radix yet) to keep JS small; add Radix/shadcn primitives only when a component needs focus
  trapping (dialogs, menus).
- **ADR-002 No Redux yet.** The template's state policy says no global state until required. Server data = RSC fetch
  plus TanStack Query (client-only suggestions); UI state is local. Add Redux Toolkit when a real cross-tree store appears.
- **ADR-003 No `cacheComponents`.** The create-next-app default enabled it; it forbids `revalidate`/`dynamicParams`
  route config and changes fetch semantics. The spec's ISR + tag model uses classic caching, so it is off.
- **ADR-004 The API contract is proposed by the frontend.** The spec lists endpoints (section 12) but not response
  bodies. `src/lib/api/types.ts` defines them; backend Pydantic schemas must match (or change that file in the same PR).
  Also assumed: `GET /papers?sort=latest`, `GET /search` returns `facets` + `suggestions`,
  `GET /seo/sitemap/{type}?page=` returns `{items:[{path,lastmod}], total_pages}`,
  `POST /reports` accepts `{reason, email, details}`. `NEXT_PUBLIC_API_URL` includes `/api/v1`.
- **ADR-005 Search is server-rendered.** `/search` reads `searchParams` and fetches with `no-store`, so it works
  without JS and filters are plain GET forms. Only the suggestion dropdown is client-side.
- **ADR-006 Sitemaps are route handlers**, not `app/sitemap.ts`, to match the spec URLs
  (`/sitemap.xml` index, `/sitemaps/{type}/{n}.xml`).
- **ADR-007 Degraded rendering.** Home and `/universities/{university}` catch API failures and render empty states with a
  1h revalidate; other pages let errors reach `error.tsx` so a bad render is never cached. The pipeline should also
  send `paths` to `/api/revalidate` for these two pages.
- **ADR-008 Cloudflare deploy is pending.** `@opennextjs/cloudflare`, `wrangler.jsonc` and the R2/KV incremental
  cache are not added yet; verify Next 16.4 support first and document unsupported features here.
- **ADR-009 Auth.** `@supabase/ssr` cookie session. `src/proxy.ts` gates `/admin /account /bookmarks /downloads
  /upload`; with Supabase unconfigured it redirects to `/login` (fail closed).
- **ADR-010 No root `loading.tsx`.** With a root loading boundary Next streams the response, so `notFound()` returned HTTP 200 (a soft 404, bad for SEO). The skeleton now lives only in `/search/loading.tsx`; all other pages return real 404s.
- **ADR-011 TypeScript stays on 5.9.** TypeScript 7 is out but `typescript-eslint` (used by `eslint-config-next`) does not support it yet. Revisit when it does. eslint 10 and @types/node 26 are current.
- **ADR-012 Backend integration verified.** The proposed contract in `types.ts` (ADR-004) is now implemented by the FastAPI repo (`app/schemas/public.py`); built and smoke-tested against it with demo data. Renamed paper slugs 301 via `GET /redirects/paper/{slug}`; IndexNow key is served at `/indexnow-key.txt`.
- **ADR-013 Auth proxy (BFF).** Signed-in browser calls go to `/api/backend/*`, which adds the Bearer token from the HttpOnly session cookie. Only `me, uploads, admin, reports, contact, bookmarks` are forwardable, writes must be same-origin, redirects (signed file URLs) are passed through. Header user state is client-side (`useMe`) so public pages stay static/ISR.
- **ADR-014 Developer login.** Without a Supabase project the backend mints tokens (`POST /dev/login`, `DEV_AUTH=true`, never in production) and the site stores it in an HttpOnly cookie. Hard-disabled when `NODE_ENV=production`. `getAccessToken()` always calls `cookies()` first so private pages are never prerendered "signed out".
- **ADR-015 Port 3010** (not 3000) so the site can run next to other local apps.
- **ADR-016 PDF preview** uses the browser viewer in an `<iframe>` (`?inline=true`, not counted as a download) instead of bundling pdf.js: zero JS cost until the visitor asks, works on mobile.
- **ADR-017 Toasts** use design tokens, not Sonner's rich colours (those failed WCAG AA contrast in axe).
- **ADR-018 Link-only mode.** The backend can run without storing files (`STORE_FILES=false`). The paper page then shows "View on original site" (new tab, `nofollow noopener`), hides the PDF preview, stays indexable, and `/upload` shows "Uploads are paused" (from `GET /features`, cached 60 s). Supabase's new "publishable" key is accepted as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the old ANON name).
- **ADR-019 JSON API layer and no tests.** Public reads go through `src/app/api/{courses,papers,search,me}` (thin proxies over the backend with cache headers); the browser calls them via `src/services/queries.ts` and TanStack Query hooks (`src/hooks/use-catalog.ts`). Server-rendered `initialData` keeps SEO/no-JS content; the client refetches on mount. All automated tests were removed on purpose (they slowed work down); verify changes with `npm run check` and by hand.
