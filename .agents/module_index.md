# Module index

| Route | File | Status |
|---|---|---|
| `/` | src/app/page.tsx | done |
| `/rajasthan-university[/{course}[/{term}[/{subject}]]]` | src/app/rajasthan-university/ | done |
| `/papers/{slug}` (+ OG image, bookmark, report, PDF preview) | src/app/papers/[slug]/ | done |
| `/search` | src/app/search/page.tsx | done |
| `/notes`, `/notes/{slug}` | src/app/notes/ | done |
| `/login` (+ developer login locally), `/signup`, `/forgot-password` | src/app/{login,signup,forgot-password} | done |
| `/account`, `/bookmarks`, `/downloads`, `/upload` | src/app/... | done |
| `/takedown`, `/contact` | src/app/{takedown,contact} | done |
| `/about /privacy /terms` | src/app/... | draft content (legal review needed) |
| `/admin` overview, `review[/id]`, `papers`, `notes`, `reports`, `sources`, `runs[/id]`, `content`, `seo`, `insights`, `users`, `settings`, `audit` | src/app/admin/ | done |
| `/sitemap.xml`, `/sitemaps/{type}/{n}.xml`, `/robots.txt`, `/indexnow-key.txt` | src/app/ | done |
| `POST /api/revalidate` | src/app/api/revalidate/route.ts | done |
| `/api/backend/*` (auth proxy) | src/app/api/backend/[...path]/route.ts | done |

Shared logic: `src/lib/api/{client,server,public,types,urls}.ts`, `src/lib/auth/session.ts`, `src/lib/seo.ts`, `src/lib/routes.ts`,
`src/lib/bff.ts` (proxy guards), `src/lib/search-params.ts`, `src/lib/validation.ts`.
