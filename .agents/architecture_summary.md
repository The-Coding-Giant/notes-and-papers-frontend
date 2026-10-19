# Architecture summary

```
Browser --> Next.js (Cloudflare, later) --RSC fetch + ISR tags--> FastAPI (Render) --> Supabase Postgres / R2
                |  ^                                                  ^
                |  +-- POST /api/revalidate (x-revalidate-secret) <-- GitHub Actions pipeline (backend repo)
                +-- Supabase Auth (cookie session via @supabase/ssr)
```

- `src/lib/api/`: typed fetch wrapper (`client.ts`), contract (`types.ts`), endpoint helpers + cache tags (`public.ts`).
- `src/lib/seo.ts`: metadata builders, title/description templates, JSON-LD builders.
- `src/lib/routes.ts`: the only place that builds internal URLs.
- `src/proxy.ts`: session refresh + auth gate. Real authorisation (roles) is in the API.
- Paper page data flow: `getPaper(slug)` (tag `paper:{slug}`, 24h) is shared by `generateMetadata` and the page.
