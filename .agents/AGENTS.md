# Frontend agent rules (notes-and-papers-frontend-repo)

Read first: `frontend_master_template.md` (house rules), `docs/projectflow.md` (product spec: sections 2, 9, 10, 11, 13),
then this folder. Update these files as you work; write `handover.md` before stopping.

## Project in one line
SEO-first Next.js site for Rajasthan University previous-year papers. Talks to the separate FastAPI repo
(`notes-and-papers-backend-repo`) over `NEXT_PUBLIC_API_URL`.

## Non-negotiables
- Public pages are server-rendered and work with JavaScript disabled (plain links, GET forms, `<details>`).
- Every public route has `generateMetadata`/`metadata` via `buildMetadata()` in `src/lib/seo.ts`
  (title <= 60, description <= 155, canonical, OG, Twitter). Thin or empty pages get `noindex`.
- Never invent API shapes: edit `src/lib/api/types.ts` and note it in `decisions.md` (ADR-004).
- No secrets in the client bundle. Only `NEXT_PUBLIC_*` is public; `REVALIDATE_SECRET` is server-only.
- Reuse components from `component_registry.md` before writing new ones. Mobile-first, dark mode via semantic tokens.
- Forms follow `ux_standards.md`: red `*`, inline errors after blur, disabled submit until valid, backend errors as
  toasts, textareas capped at 500 with a counter.
- This is Next.js 16: `params`/`searchParams` are Promises, `middleware` is `proxy.ts`, `revalidateTag(tag, "max")`.
  Bundled docs: `node_modules/next/dist/docs/`.

## Commands
`npm run dev` · `npm run lint` · `npx next typegen && npx tsc --noEmit` · `npm run build`
