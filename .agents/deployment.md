# Deployment (frontend)

Last updated: 2026-10-19. Read this before changing anything about hosting.

## Status

| Part | State |
|---|---|
| Frontend | **Live** on Cloudflare Workers: https://notes-and-papers.thecodinggiant.workers.dev |
| Backend (FastAPI) + Postgres | **Not hosted yet.** They run only on the developer's PC. The live site therefore shows no data (empty lists, error page on course/paper pages). |
| Custom domain | None yet (only the free `workers.dev` address). |
| `NEXT_PUBLIC_SITE_URL` baked into the live build | Still the placeholder `https://notes-and-papers.workers.dev`, so canonical links, sitemap and share previews use the wrong address. Fix: set it to the real address in `.env.production` and redeploy. |

## Why Cloudflare

* Free tier that allows commercial use (the site will run ads; Vercel's free Hobby plan forbids that, Vercel Pro costs about $20/month).
* Global CDN, free HTTPS, DNS, and the domain registrar are all in one place; the PDFs are served from Backblaze B2 by the backend (60-second signed links).
* Cheap to scale: the paid Workers plan is about $5/month.
* SEO is unaffected by the host. Pages are rendered on the server with real HTML, titles, descriptions, canonical links and a sitemap.

## Which approach, and why (decision record)

| Option | Decision |
|---|---|
| `@cloudflare/next-on-pages` | **Rejected.** Deprecated; its npm page tells you to use OpenNext. |
| Static export (`output: "export"`) | **Impossible for this app.** It needs a server: login cookies, the request proxy (`src/proxy.ts`), route handlers (`/api/*`, `/papers/<slug>/download`, sitemaps), server actions, and ISR cached pages. |
| **`@opennextjs/cloudflare` (OpenNext adapter) on Cloudflare Workers** | **Chosen.** The supported way to run Next.js on Cloudflare. It compiles the Next.js build into one Worker plus a folder of static assets. |

Versions: Next.js 16.4.1 (the adapter needs >= 16.4.1), `@opennextjs/cloudflare` 1.20.x, `wrangler` 4.x.

## How it works

```
Browser -> Cloudflare edge -> Worker (.open-next/worker.js)
                               |- static files (JS, CSS, fonts, icons)  from .open-next/assets
                               |- server-rendered pages / route handlers (Next.js inside the Worker)
                               |- page cache (ISR) + tag cache           in Workers KV
                               '- data                                    fetched from the backend API (NEXT_PUBLIC_API_URL)
```

* **Page cache:** pages with `revalidate: N` are stored in KV (`NEXT_INC_CACHE_KV`). Tags used by `revalidateTag` live in KV too (`NEXT_TAG_CACHE_KV`). Both bindings use the **same** KV namespace (`d642f541c5dc4c8a9c8ea3f1747bb1de`). R2 was *not* used because it needs a payment method; to move the page cache to R2 later, switch `open-next.config.ts` to `r2-incremental-cache` and add an `r2_buckets` binding `NEXT_INC_CACHE_R2_BUCKET`.
* **Refreshing cached pages after a data import:** the backend calls `POST <site>/api/revalidate` with header `x-revalidate-secret`. The frontend then revalidates the shared tag `catalog` (added to every cached API fetch in `src/lib/api/client.ts`) and the given paths. Needs `REVALIDATE_SECRET` set on both sides (see Secrets).
* **Images:** `next/image` optimisation is switched off (`images.unoptimized` in `next.config.ts`), because Workers has no optimiser without an extra paid product. The site only shows a few small icons.
* **Login:** HttpOnly cookies `np_access` / `np_refresh`; `src/proxy.ts` renews the access token. It runs as **Node.js middleware, which OpenNext marks experimental on Cloudflare**. It works in testing (verified in `wrangler dev`), and the API re-checks every request anyway.

## Files that control deployment

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Worker name (`notes-and-papers`), entry (`.open-next/worker.js`), assets folder, KV bindings, self-reference service binding, compatibility flags. |
| `open-next.config.ts` | Which cache implementations OpenNext uses (KV for pages and tags). |
| `next.config.ts` | `initOpenNextCloudflareForDev()`, `images.unoptimized`. |
| `.env.production` | Values baked into the build: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, optional contact email/phone. Template: `.env.production.example`. Git-ignored. |
| `public/_headers` | Cache headers for icons and the default share image. |
| `package.json` scripts | `cf:build`, `cf:preview` (build + run locally on :8787), `cf:deploy` (build + deploy), `cf:typegen`. |
| `docs/DEPLOY-CLOUDFLARE.md` | Step-by-step guide. |

`NEXT_PUBLIC_*` values are **compiled into the JavaScript at build time**. Changing them means rebuilding and redeploying; editing them in the Cloudflare dashboard does nothing for those.

## How to manage it

### Deploy / redeploy
```powershell
cd E:\Learning\NotesAndPapers\notes-and-papers-frontend-repo
ren .env.local .env.local.bak     # IMPORTANT, see Pitfalls
npm run cf:deploy                 # build + upload; prints the live address
ren .env.local.bak .env.local
```
Alternative (recommended long term, builds on Linux): Cloudflare dashboard -> Workers & Pages -> Create -> Import a Git repository. Build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`, and add the `NEXT_PUBLIC_*` values as *build* variables. Then every push to the main branch redeploys.

### Test the Cloudflare build locally (no deploy)
```powershell
npm run cf:preview     # http://localhost:8787, runs on the real Workers runtime (workerd)
```
Stop it with Ctrl+C. A leftover preview process locks `.open-next` (see Pitfalls).

### Secrets (never commit these)
```powershell
npx wrangler secret put REVALIDATE_SECRET   # must equal the backend's REVALIDATE_SECRET
npx wrangler secret put INDEXNOW_KEY        # must equal the backend's INDEXNOW_KEY
npx wrangler secret list
```
Not set yet (needed once the backend is hosted).

### Logs and monitoring
* Live logs: `npx wrangler tail notes-and-papers`
* Dashboard: Workers & Pages -> `notes-and-papers` -> Logs / Metrics (observability is enabled in `wrangler.jsonc`).

### Roll back a bad deploy
```powershell
npx wrangler deployments list
npx wrangler rollback            # to the previous version, or pass a version id
```
(Also: dashboard -> the worker -> Deployments -> pick an older version -> Rollback.)

### Domain
* Free address: `https://notes-and-papers.thecodinggiant.workers.dev` (the `thecodinggiant` part is the account's single workers.dev subdomain; it can be renamed in the dashboard but not removed).
* Own domain (needed for ads/AdSense): buy one (Cloudflare Registrar sells at cost), then worker -> Settings -> Domains & Routes -> add `yourdomain.com` and `www.yourdomain.com` (redirect www to the apex). Then set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` and redeploy. Submit `https://yourdomain.com/sitemap.xml` in Google Search Console.

### Cache control
* Clear everything from the app side: call the backend import (admin -> Data imports), which triggers `/api/revalidate`.
* Manual: KV namespace `d642f541c5dc4c8a9c8ea3f1747bb1de` in the dashboard (Storage & Databases -> KV) holds the cached pages and tags.

### Account facts
* Cloudflare account email: thecodinggiant@gmail.com (wrangler is logged in through OAuth on the developer's PC; `npx wrangler whoami` shows it).
* Worker name: `notes-and-papers`.

## Going to production: remaining checklist

1. Host the backend (FastAPI) and Postgres online (for example Render + Neon/Supabase, or a small VPS). Same parent domain as the site is simplest (`api.yourdomain.com`).
2. Set `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1` in `.env.production`, redeploy.
3. Backend `.env`: `ENVIRONMENT=production`, site URL = the real site address, CORS allowed origin = the site, `REVALIDATE_SECRET` / `INDEXNOW_KEY` matching the Worker secrets, a new `SUPABASE_JWT_SECRET`/JWT secret (not the dev one), and a real admin password (the local `admin@example.com` account must not exist in production).
4. Run `alembic upgrade head`, then `python -m app.cli import all` against the production database (or use admin -> Data imports).
5. Buy a domain, attach it, update `NEXT_PUBLIC_SITE_URL`, redeploy.
6. Serve PDFs from Backblaze B2 with 60-second signed links (planned; Drive and Telegram as backups).
7. Before ads: cookie-consent banner and ad slots with reserved space (see AdSense notes in the chat history).

## Pitfalls we already hit (so you do not repeat them)

* **`.env.local` overrides `.env.production` in a local `next build`.** A local deploy would bake in `localhost` URLs. Rename `.env.local` before deploying from the PC (Git-based builds on Cloudflare do not have this file).
* **`EPERM ... .open-next` when building:** a leftover `cf:preview` / `wrangler dev` / `workerd` process was holding the folder. Stop those processes (or close the terminals) and delete `.open-next`.
* **R2 error 10042 "Please enable R2":** R2 needs a payment method on the account. Avoided by using KV for the page cache.
* **wrangler prompt "binding name":** when `wrangler kv namespace create` asks whether to add the binding for you, answering the name prompt wrongly (for example `y`) writes a stray binding. Edit `wrangler.jsonc` by hand instead (the correct bindings are already there).
* **workers.dev subdomain names:** short names are taken; use a longer unique one.
* **OpenNext warns "not fully compatible with Windows".** Builds worked here, but prefer Cloudflare's Git builds or WSL for production deploys.
* **Build needs the API to be optional.** Pages degrade gracefully (the build also succeeds with the API offline: `generateStaticParams` falls back to on-demand pages), but individual course/exam/paper pages show the error page until the API answers.
