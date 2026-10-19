# Design Debt Log

## Debt: no Lighthouse CI / Turnstile yet
- **Added:** 2026-10-14
- **Location:** .github/workflows (frontend repo, to be created), signup/upload/report forms
- **Proper Fix:** Lighthouse CI job with the spec budgets; Cloudflare Turnstile on the public write forms
- **Target Resolution:** Phase 4

## Debt: admin tables are server-driven only
- **Added:** 2026-10-14
- **Location:** src/components/admin/data-table.tsx
- **Current Workaround:** search/sort/page are links and GET forms (work without JS) but each change reloads the table
- **Proper Fix:** optional client enhancement with TanStack Query for instant filtering
- **Target Resolution:** when admin usage justifies it
