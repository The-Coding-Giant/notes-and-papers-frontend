# Handover (2026-10-14, second pass)

## State
Every route in docs/projectflow.md section 9 and every admin module in section 13 exists. The project has no automated tests by
decision; `npm run check` runs eslint and the typecheck. Public data (home courses and latest papers, search, suggestions, the
header user) goes through the JSON API routes in src/app/api (see README).

## Known gaps / next
1. Cloudflare deploy (`@opennextjs/cloudflare`, ADR-008) and verifying ISR tag revalidation there.
2. Lighthouse CI budget (SEO >= 95, A11y >= 90, Perf >= 85) in GitHub Actions; Turnstile on signup/upload/report (phase 4).
3. Supabase Auth was not exercised end to end (no project locally); the dev login covers the same code path after the token.
4. Privacy/Terms are drafts and need review. A Hindi/`hreflang` variant is future work.
5. The admin Settings "rate limits" are informational; the API enforces its built-in limits.

## Read first next time
`.agents/AGENTS.md`, `decisions.md`, `module_index.md`, `docs/projectflow.md`.
