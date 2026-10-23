# Deploying the frontend on Cloudflare

## Which approach, and why

| Option | Verdict |
|---|---|
| `@cloudflare/next-on-pages` | **Deprecated** (its npm page says to use OpenNext). Do not use. |
| Static export (`output: "export"`) | **Not possible** here. The site needs a server: per-request cookies and login, the request proxy (`src/proxy.ts`), route handlers (`/api/*`, `/papers/<slug>/download`, sitemaps), server actions and cached pages that refresh (ISR). A static export drops all of that. |
| **`@opennextjs/cloudflare` on Workers** | **Use this.** It is the supported way to run Next.js on Cloudflare. Already set up in this repo. |

Verified locally on the Workers runtime (`wrangler dev`): home, exams, courses, paper pages, search, sitemap, manifest, social image, login redirect for private pages, `/api/me`, the login-gated download redirect, and analytics events all work. Bundle: about 6.7 MB, 1.7 MB gzipped.

Known caveats:
* Next.js `proxy.ts` runs as **Node.js middleware, which OpenNext marks experimental on Cloudflare**. It works in testing. It only renews the login token and redirects signed-out visitors away from private pages; the API re-checks every request anyway.
* OpenNext warns that building on **Windows** can be unreliable. It worked here, but let Cloudflare build it (below) or use WSL.
* Needs Next.js >= 16.4.1 (already upgraded).

## One-time setup

```bash
# 1. log in
npx wrangler login

# 2. page cache storage (names must match wrangler.jsonc)

npx wrangler kv namespace create NEXT_TAG_CACHE_KV
#    copy the printed id into wrangler.jsonc -> kv_namespaces[0].id

# 3. secrets (must equal the backend's values)
npx wrangler secret put REVALIDATE_SECRET
npx wrangler secret put INDEXNOW_KEY
```

## Settings baked into the build (`NEXT_PUBLIC_*`)

Copy `.env.production.example` to `.env.production` and fill it in:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_CONTACT_EMAIL=you@yourdomain.com      # optional, shows clickable mailto: link
NEXT_PUBLIC_CONTACT_PHONE=+91 98765 43210         # optional, shows clickable tel: link
```

## Deploy

From your machine:

```bash
npm run cf:deploy        # builds and deploys
npm run cf:preview       # builds and runs locally on http://localhost:8787 with the Workers runtime
```

Or let Cloudflare build it (recommended, builds on Linux): Workers & Pages -> Create -> Import a Git repository, then
* Build command: `npx opennextjs-cloudflare build`
* Deploy command: `npx opennextjs-cloudflare deploy`
* Add the `NEXT_PUBLIC_*` values above as **build** variables.

## Domain

Workers -> your worker -> Settings -> Domains & Routes -> add `yourdomain.com` (and `www.yourdomain.com`, redirect it to the apex).
Host the backend at `api.yourdomain.com` (same parent domain so cookies and CORS stay simple).

## Backend settings to change for production

* `NEXT_PUBLIC_SITE_URL` / site URL = `https://yourdomain.com` (sitemaps, redirects after an import)
* `REVALIDATE_SECRET` = same value as the Worker secret (the backend calls `https://yourdomain.com/api/revalidate` after each import)
* CORS allowed origin = `https://yourdomain.com`
* `ENVIRONMENT=production`
