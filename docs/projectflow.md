# Project Spec: Rajasthan University PYQ Platform

> **Audience: an AI coding assistant (or developer) that will build this project.** This file is the single
> source of truth. Build it phase by phase (section 17), run the tests after each phase, and do not skip
> ahead. If something is ambiguous, pick the simplest option that fits this spec and note it in `docs/DECISIONS.md`.

---

## 1. Goal

A fast, searchable, **SEO-first** website where students find previous-year question papers (and notes)
for Rajasthan University (UNIRAJ) by course, part/semester, subject and year. Example search it must win:
*"BCA 1st year question papers Rajasthan University"*.

- **Primary KPI:** every paper / subject / course page is indexable and ranks on Google.
- Everything is searchable. Users can sign up, log in, bookmark, download, upload.
- The backend is mostly **automation**: it crawls sources daily, detects new/changed papers, downloads them,
  stores them, extracts text, cleans metadata, saves to the DB, publishes pages, and reports.
- An **admin dashboard** controls everything and shows insights.
- Later: more universities, exams, notes, quizzes, AI features (section 18).

## 2. Hard rules (must follow)

1. **Content rights.** We do not own `uoronline.com` or `pyqonline.com`; they forbid bots in robots.txt and
   the papers belong to the universities. Therefore:
   - Every source is a **pluggable adapter** with a `rights_status` (`owned | permitted | link_only | unknown`).
   - Adapters for `uoronline` / `pyqonline` are created but **`enabled = false` by default** and ship with
     `respect_robots = true`. They may only be enabled by an admin who confirms written permission
     (checkbox + note stored in `sources.permission_note`).
   - Papers with `rights_status = link_only` show our page + metadata but the download button goes to the
     original URL; the file is not copied to our storage.
   - Preferred sources: official university site, user uploads, permitted partners.
   - Provide `/takedown` page + one-click **unpublish** in admin + audit log.
2. **Respect robots.txt and rate limits** in every crawler (default on). Identify with a clear User-Agent.
3. **Never delete published content automatically.** Removals are only flagged for admin review.
4. **Idempotent jobs.** Re-running any job must not create duplicates or corrupt data.
5. **No secrets in the repo.** Use `.env` and provide `.env.example`.
6. Public pages must work with JavaScript disabled (full server-rendered HTML).

## 3. Final tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | **Python 3.12 + FastAPI**, Pydantic v2, SQLAlchemy 2 (async), Alembic migrations |
| Worker / automation | Python, same codebase as API (`apps/api`), run as a CLI by **GitHub Actions** (scheduled + manual). No always-on worker process |
| Database | PostgreSQL 15+ (Supabase free tier), extensions `pg_trgm`, `unaccent`, `pgcrypto` |
| Auth | Supabase Auth (email+password, Google). FastAPI verifies the Supabase JWT |
| File storage | **Cloudflare R2** (S3-compatible, use `boto3`) for PDFs and thumbnails |
| Optional backup | Private Telegram channel via bot (backup only, never served to users) |
| Search | Postgres full-text (`tsvector`) + `pg_trgm` typo tolerance. Interface is abstract so Typesense/Meilisearch can replace it later |
| PDF processing | `pypdf`/`pdfplumber` (text), `pdf2image` + Tesseract (OCR fallback), thumbnails of page 1 |
| HTTP crawling | `requests` / `httpx` + stdlib `html.parser` (port of existing `crawler.py`) |
| Email / alerts | Resend (email), Telegram bot (alerts) |
| Hosting | Frontend: **Cloudflare** (Workers/Pages via `@opennextjs/cloudflare`). API: **Render** free web service. Database/Auth: **Supabase**. Files: **Cloudflare R2**. Automation: **GitHub Actions**. See section 5A |
| CI | GitHub Actions: lint, tests, build (`ci.yml`) |
| Analytics | Google Search Console API + Plausible (or GA4) |

## 4. Repository layout (monorepo)

```
/
├─ apps/
│  ├─ web/                    Next.js site + /admin
│  │  ├─ app/                 routes (see section 9)
│  │  ├─ components/
│  │  ├─ lib/                 api client, seo helpers, supabase client
│  │  └─ public/
│  └─ api/                    FastAPI + pipeline CLI (one Python package)
│     ├─ app/
│     │  ├─ main.py
│     │  ├─ core/             config, security (JWT), logging, deps
│     │  ├─ db/               models.py, session.py, migrations/ (alembic)
│     │  ├─ routers/          public.py, me.py, admin.py, internal.py
│     │  ├─ schemas/          pydantic models
│     │  ├─ services/         search.py, storage.py, seo.py, notify.py, revalidate.py
│     │  └─ pipeline/
│     │     ├─ adapters/      base.py, generic_site.py, uniraj.py, uoronline.py, pyqonline.py, uploads.py
│     │     ├─ crawl.py  diff.py  download.py  extract.py  normalize.py  publish.py  report.py
│     │     └─ runner.py      orchestrates one run
│     ├─ cli.py               entrypoints for GitHub Actions: `run --due`, `run --source ID`, `seo-sync`, `weekly-report`, `link-check`
│     └─ tests/               pytest, fixtures/ (saved HTML samples)
├─ legacy/                    existing crawler.py, scraper.py (reference only, port logic into adapters)
├─ docs/                      projectflow.md (this), DECISIONS.md, RUNBOOK.md
├─ docker-compose.yml         LOCAL DEV ONLY: api + postgres
├─ render.yaml                Render service definition for the API
├─ .github/workflows/         ci.yml, daily-crawl.yml, weekly-report.yml, keepalive.yml
└─ .env.example
```

## 5. Existing code to reuse

`crawler.py` (repo root today) already: crawls a whole site with a polite rate limiter, respects robots.txt,
retries, extracts meta/SEO/Open Graph/JSON-LD/headings, finds PDF links, joins a paper page to its PDF by the
shared URL stem (`/papers/x-2026.html` <-> `/papers/x-2026.pdf`), and writes `papers.jsonl` with fields:

`title, page_url, pdf_url, pdf_status, pdf_size_bytes, slug, year, category, listing_page, h1,
meta_description, meta_keywords, canonical, og_image, lang`

Port its logic into `pipeline/adapters/generic_site.py`; keep its tests (fake local site) as adapter tests.
Example slugs to support in the normalizer: `bsc-part-1-optics-1170-3-2023`,
`babed-bscbed-part-1-childhood-and-growing-up-102-152-2026`.

## 5A. Hosting and infrastructure (free tier)

| Part | Service | How it is used |
|---|---|---|
| Frontend + admin UI | Cloudflare (Workers/Pages) with `@opennextjs/cloudflare` | Static + ISR pages. Configure the adapter's incremental cache (R2 or KV) so tag revalidation works. If a Next.js feature does not work on Cloudflare, document it in `docs/DECISIONS.md` |
| API | Render free web service (Docker or native Python) | FastAPI only. **Sleeps after ~15 min idle** and has 512 MB RAM, so it must never run long jobs or OCR |
| Keep-alive | UptimeRobot or cron-job.org pinging `GET /healthz` every 10 min | Avoids cold starts for dynamic calls (search, auth). Public pages are static and do not depend on it |
| Database + Auth | Supabase free (500 MB DB) | Use the **pooled** connection string for the API. Daily automation also prevents the 1-week inactivity pause |
| Files | Cloudflare R2 (10 GB free) | PDFs, thumbnails. Private bucket, signed URLs |
| Automation | **GitHub Actions** | Daily crawl/pipeline, SEO sync, weekly report, link check. ~7 GB RAM, 6 h job limit |
| Secrets | GitHub Actions secrets, Render env vars, Cloudflare env vars | Same names as section 16 |

Rules:
- The API only reads/writes the database and triggers jobs. **All heavy work (crawl, download, OCR, normalize) runs in GitHub Actions.**
- The pipeline connects directly to Supabase and R2 using its own credentials, so it works even when the Render API is asleep.
- Jobs keep no local state between runs; everything persists in Supabase/R2.
- The API and the GitHub Actions jobs use the same codebase (`apps/api`) and the same Alembic-managed schema.

### GitHub Actions workflows
| File | Trigger | Does |
|---|---|---|
| `ci.yml` | push / PR | lint, pytest, web build, Lighthouse CI |
| `daily-crawl.yml` | `cron: "30 20 * * *"` (UTC = 02:00 IST) + `workflow_dispatch` (inputs: `source_id` optional, `force` optional) | `python -m app.cli run --due` (or `--source $ID`), then `seo-sync`, then send the daily digest |
| `weekly-report.yml` | weekly cron | `python -m app.cli weekly-report`; also `link-check` of stored PDFs |
| `keepalive.yml` | monthly cron | prevents GitHub from disabling scheduled workflows after 60 days of repo inactivity (re-enable via API or `liskin/gh-workflow-keepalive`) |

Workflow requirements: `timeout-minutes: 300`; `concurrency: { group: crawl-${{ inputs.source_id || 'all' }}, cancel-in-progress: false }`
so two crawls never overlap; cache pip and Tesseract installs; upload the run log as an artifact; exit non-zero on failure so GitHub emails you.
Scheduled runs can start 5-30 min late, so never depend on exact timing.

## 6. Database schema (PostgreSQL)

Create via Alembic. Use `uuid` PKs (`gen_random_uuid()`), `created_at/updated_at timestamptz`.

```sql
create extension if not exists pg_trgm;  create extension if not exists unaccent;  create extension if not exists pgcrypto;

create type rights_status as enum ('owned','permitted','link_only','unknown');
create type paper_status  as enum ('pending_review','published','unpublished','rejected');
create type user_role     as enum ('user','moderator','admin');
create type run_status    as enum ('queued','running','succeeded','partial','failed','cancelled');
create type scheme_kind   as enum ('annual','semester');
create type term_kind     as enum ('part','semester');

create table universities (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
  website text, description text, created_at timestamptz default now());

create table courses (id uuid primary key default gen_random_uuid(), university_id uuid references universities,
  name text not null, slug text not null, level text check (level in ('UG','PG','DIPLOMA','OTHER')), scheme scheme_kind,
  description text, aliases text[] default '{}', unique (university_id, slug));

create table terms (id uuid primary key default gen_random_uuid(), course_id uuid references courses,
  kind term_kind not null, number int not null, slug text not null, unique (course_id, slug));      -- part-1, semester-3

create table subjects (id uuid primary key default gen_random_uuid(), term_id uuid references terms,
  name text not null, slug text not null, paper_code text, aliases text[] default '{}', unique (term_id, slug));

create table sources (id uuid primary key default gen_random_uuid(), name text not null, adapter text not null,
  base_url text not null, enabled boolean default false, rights_status rights_status default 'unknown',
  respect_robots boolean default true, permission_note text, schedule_cron text default '0 2 * * *',
  rate_per_sec numeric default 2, config jsonb default '{}', last_run_at timestamptz);

create table files (id uuid primary key default gen_random_uuid(), sha256 text unique not null, r2_key text not null,
  size_bytes bigint, pages int, mime text default 'application/pdf', thumbnail_key text, text_extracted boolean default false,
  backup_telegram_file_id text);

create table papers (id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects, course_id uuid references courses, term_id uuid references terms,
  source_id uuid references sources, source_url text not null, original_pdf_url text,
  file_id uuid references files, title text not null, slug text unique not null,
  year int, session text, paper_code text, kind text default 'question_paper' check (kind in ('question_paper','solution','syllabus','notes')),
  rights_status rights_status default 'unknown', status paper_status default 'pending_review',
  confidence numeric, content_text text, meta_title text, meta_description text,
  source_hash text, download_count int default 0, view_count int default 0, published_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,'')),'A') || setweight(to_tsvector('simple', coalesce(content_text,'')),'C')) stored,
  unique (source_id, source_url));
create index papers_fts on papers using gin (search_vector);
create index papers_title_trgm on papers using gin (title gin_trgm_ops);
create index papers_lookup on papers (subject_id, year desc) where status='published';

create table notes (id uuid primary key default gen_random_uuid(), subject_id uuid references subjects, title text not null,
  slug text unique not null, file_id uuid references files, author_id uuid, status paper_status default 'pending_review',
  description text, created_at timestamptz default now());

create table crawl_runs (id uuid primary key default gen_random_uuid(), source_id uuid references sources,
  status run_status default 'queued', trigger text default 'schedule', started_at timestamptz, finished_at timestamptz,
  pages_crawled int default 0, new_count int default 0, changed_count int default 0, removed_count int default 0,
  failed_count int default 0, bytes_stored bigint default 0, error text, log jsonb default '[]');

create table jobs (id uuid primary key default gen_random_uuid(), type text not null,  -- crawl_source|reprocess_paper|rebuild_sitemap|revalidate
  payload jsonb default '{}', status run_status default 'queued', attempts int default 0, run_after timestamptz default now(),
  locked_at timestamptz, created_by uuid, created_at timestamptz default now(), last_error text);

create table profiles (id uuid primary key,   -- = supabase auth.users.id
  display_name text, role user_role default 'user', created_at timestamptz default now());
create table bookmarks (user_id uuid, paper_id uuid references papers, created_at timestamptz default now(), primary key (user_id, paper_id));
create table downloads (id bigserial primary key, user_id uuid, paper_id uuid references papers, created_at timestamptz default now(), ip_hash text);
create table search_logs (id bigserial primary key, query text, filters jsonb, results_count int, user_id uuid, created_at timestamptz default now());
create table reports (id uuid primary key default gen_random_uuid(), paper_id uuid references papers, reason text, details text,
  email text, status text default 'open', created_at timestamptz default now());
create table seo_pages (url text primary key, page_type text, indexed boolean, last_checked timestamptz,
  clicks int, impressions int, ctr numeric, position numeric, issues text[] default '{}');
create table settings (key text primary key, value jsonb);
create table audit_log (id bigserial primary key, actor_id uuid, action text, entity text, entity_id text, diff jsonb, created_at timestamptz default now());
```

Security: enable **Row Level Security** on `profiles, bookmarks, downloads, reports, notes`; users only see their own rows.
Seed script: Rajasthan University + common courses (BA, BSc, BCom, BCA, BBA, BEd, MA, MSc, MCom, MBA, LLB…) with
`scheme` and terms (annual: Part 1-3; semester: Sem 1-8).

## 7. Source adapters

```python
class SourceAdapter(Protocol):
    name: str
    def discover(self, source: Source, since: datetime | None) -> Iterator[RawPaper]: ...
    # RawPaper: source_url, title, pdf_url, page_meta (dict), listing_context (course/term hints), content_hash
```

| Adapter | Behaviour | Default |
|---|---|---|
| `uniraj` | Official university paper pages (inspect site, honour robots/terms) | enabled once built |
| `uploads` | User submissions from the moderation queue | enabled |
| `generic_site` | Configurable crawler (ported `crawler.py`) | disabled |
| `uoronline`, `pyqonline` | Thin configs over `generic_site` for those site layouts | **disabled** (rule 2.1) |

Adding a new source = one new adapter file + a row in `sources`. The rest of the pipeline never changes.

## 8. Automation pipeline (runs every 24h per source, also "Run now" from admin)

`runner.run(source_id)` executes these stages and writes progress to `crawl_runs`:

1. **Lock**: skip if a run for this source is already `running` (and not stale >2h).
2. **Discover** (adapter): yields `RawPaper`s.
3. **Diff** against `papers` by `(source_id, source_url)` and `source_hash`: classify `new | changed | unchanged`; papers not seen are only **flagged** `missing_from_source` (never deleted).
4. **Download** new/changed PDFs: stream, verify `%PDF` magic, max 50 MB, retries with backoff, polite rate limit. Skip when `rights_status = link_only`.
5. **Dedupe**: SHA-256; if the hash exists in `files`, reuse it.
6. **Store**: upload to R2 `papers/{sha256[:2]}/{sha256}.pdf`; generate page-1 thumbnail `thumbs/{sha256}.webp`; optional Telegram backup.
7. **Extract text**: `pdfplumber`; if < 50 chars/page, OCR with Tesseract (`eng+hin`). Save to `papers.content_text`.
8. **Normalize** (`normalize.py`): derive `course, term, subject, paper_code, year, session, kind` from title, slug, URL path, listing page and PDF text. Rules first (regexes + alias tables), compute `confidence` in 0..1 (share of fields resolved with certainty). Create missing subjects automatically.
   - `confidence >= 0.8` -> `published`; otherwise `pending_review` (shows in admin review queue).
   - Generate unique `slug` (`{course}-{term}-{subject}-{year}-question-paper`), `meta_title`, `meta_description` (templates in section 10).
9. **Persist**: upsert in one transaction per paper.
10. **Publish**: `services/revalidate.py` calls the Next.js endpoint `POST /api/revalidate` (secret header) with cache tags for affected pages; rebuild sitemap data; ping IndexNow.
11. **Report**: update `crawl_runs` counts, send daily digest, send alert on failure or on anomalies (e.g. discovered count drops >50% vs previous run, which suggests the source layout changed).

Scheduling: `daily-crawl.yml` runs once a day and calls `app.cli run --due`, which runs every enabled source whose `schedule_cron` is due (compare with `sources.last_run_at`). Admin "Run now" makes the API call GitHub's `workflow_dispatch` endpoint (`POST /repos/{owner}/{repo}/actions/workflows/daily-crawl.yml/dispatches`, input `source_id`) using `GITHUB_TOKEN_DISPATCH`; the API first inserts a `crawl_runs` row with status `queued` so the admin UI can show progress, and the pipeline updates that same row.
The `jobs` table records admin-requested actions (crawl, reprocess paper, rebuild sitemap) for status display and audit; GitHub Actions executes them.
Other jobs: daily Search Console sync (`seo-sync`), weekly report, weekly link check of our own PDFs, storage-usage check.

## 9. Frontend (Next.js)

### Routes
```
/                                              home: hero search, popular courses, latest papers
/rajasthan-university                          university page
/rajasthan-university/{course}                 course page (all terms)
/rajasthan-university/{course}/{term}          term page (subjects + years)
/rajasthan-university/{course}/{term}/{subject}  subject page (all years, newest first)
/papers/{slug}                                 paper page
/notes   /notes/{slug}                         notes listing / page
/search                                        search with filters + pagination
/login /signup /forgot-password /account /bookmarks /downloads /upload
/about /contact /privacy /terms /takedown
/admin/**                                      dashboard (role = admin|moderator)
/sitemap.xml (index)  /sitemaps/{type}/{n}.xml  /robots.txt
```

### Rendering and caching
- Server Components fetch from the FastAPI public endpoints using `fetch(..., { next: { revalidate: 86400, tags: [...] } })`.
- Tags: `paper:{slug}`, `subject:{id}`, `term:{id}`, `course:{id}`, `home`. The pipeline (GitHub Actions) revalidates by tag via the Next.js revalidate endpoint.
- `generateStaticParams` for universities/courses/terms/top subjects; other pages use on-demand ISR (`dynamicParams: true`).
- Search page and account pages are dynamic (client fetch to API).

### Components
`SearchBar` (instant suggestions, debounce), `FilterPanel`, `PaperCard`, `PaperList`, `PdfViewer` (pdf.js, lazy loaded),
`DownloadButton` (login optional for single downloads; counts via API), `BookmarkButton`, `Breadcrumbs`, `RelatedPapers`,
`YearTabs`, `FaqAccordion`, `ReportDialog`, `UploadForm` (presigned upload), `AuthForms`, `AdSlot` (placeholder), `ThemeToggle`, admin tables and charts.

### UX requirements
Mobile-first, accessible (WCAG AA), dark mode, skeleton loaders, keyboard-friendly search, no layout shift. Core Web Vitals "good".

## 10. SEO requirements (primary goal)

| Page | `<title>` (<= 60 chars) | Meta description (<= 155) | H1 | JSON-LD |
|---|---|---|---|---|
| Course | `{Course} Question Papers {first}-{last} - Rajasthan University` | `Download {Course} previous year question papers of Rajasthan University for all {terms}. Free PDFs, subject-wise.` | `{Course} Previous Year Papers` | BreadcrumbList, CollectionPage |
| Term | `{Course} {Term} Previous Year Papers - UNIRAJ` | `{n} papers across {m} subjects for {Course} {Term}, years {range}.` | `{Course} {Term} Question Papers` | BreadcrumbList, ItemList |
| Subject | `{Subject} {Course} {Term} Question Papers {range}` | `{Subject} previous year papers for {Course} {Term}, {n} years available.` | `{Subject} Question Papers` | BreadcrumbList, ItemList, FAQPage |
| Paper | `{Subject} {Year} Question Paper - {Course} {Term} Rajasthan University` | `{Subject} {Course} {Term} {Year} question paper PDF. Paper code {code}. View online or download free.` | `{Subject} {Year} Question Paper` | BreadcrumbList, LearningResource |

Must implement:
- Canonical URL on every page; `robots` `index,follow` only when the page has content; thin pages get `noindex`.
- Open Graph + Twitter cards; auto-generated OG image per paper (`@vercel/og` or `satori`).
- `sitemap index` split by type (`papers`, `subjects`, `courses`, `notes`), max 40,000 URLs each, real `lastmod`.
- `robots.txt` with sitemap link; blocks `/admin`, `/api`, `/account`, `/search` (search result URLs noindex).
- Unique on-page content: intro paragraph (generated from data), list of papers, **extracted text excerpt**, FAQ, related links, breadcrumbs. Never publish empty pages.
- Internal linking: course -> term -> subject -> paper, related papers, "other years of this subject", popular lists.
- Redirects: keep a `slug_redirects` mechanism so renamed slugs 301 to the new one.
- Performance: image optimization, lazy PDF viewer, minimal JS on public pages, CDN caching headers.
- After each daily update: submit changed URLs via IndexNow; Search Console sitemap is submitted once manually.
- Lighthouse CI budget in CI: SEO >= 95, Accessibility >= 90, Performance >= 85 on key page types.

## 11. Auth and roles

- Sign up / login with email+password and Google through Supabase Auth; the web app stores the session; API requests send `Authorization: Bearer <jwt>`.
- FastAPI dependency verifies the JWT (Supabase JWKS / secret), loads `profiles.role`.
- Roles: `user` (bookmarks, downloads history, uploads), `moderator` (review queue, uploads, reports), `admin` (everything).
- Admin routes protected both in Next.js middleware and in the API.

## 12. API (FastAPI, prefix `/api/v1`)

**Public**
| Method | Path | Purpose |
|---|---|---|
| GET | `/universities`, `/universities/{slug}` | list/detail |
| GET | `/courses/{university}/{course}` , `/terms/{...}` , `/subjects/{...}` | hierarchy pages with counts |
| GET | `/papers` | filters: `course, term, subject, year, kind, q, page, size` |
| GET | `/papers/{slug}` | paper detail + related |
| GET | `/search` | `q` + filters, returns hits, facets, suggestions; logs to `search_logs` |
| GET | `/papers/{slug}/download` | 302 to short-lived signed R2 URL (or original URL if `link_only`); increments counter |
| POST | `/reports` | report a paper (rate limited) |
| GET | `/seo/sitemap/{type}?page=` | URL lists for sitemaps |

**Authenticated user**: `GET /me`, `GET/POST/DELETE /me/bookmarks`, `GET /me/downloads`, `POST /uploads/presign`, `POST /uploads/complete`.

**Admin / moderator** (`/admin`): `GET /overview`; sources CRUD and `POST /sources/{id}/run`; `GET /runs`, `GET /runs/{id}`;
`GET /review-queue`, `PATCH /papers/{id}`, `POST /papers/{id}/publish|unpublish`, bulk actions; uploads moderation;
`GET/PATCH /reports`; `GET /seo/overview|pages|issues`; `GET /insights/searches|no-results|downloads`; users and roles; `GET/PUT /settings`; audit log.

**Health**: `GET /healthz` (no DB call, used by the keep-alive pinger).

**Internal**: `POST /internal/revalidate`, `POST /internal/indexnow` (secret token only).

Conventions: pydantic response models, pagination `{items,total,page,size}`, consistent error shape, per-IP rate limiting, CORS limited to the web origin, OpenAPI docs at `/docs`.

## 13. Admin dashboard (`/admin`)

| Module | Contents |
|---|---|
| Overview | KPIs: papers, new today/week, last run status, failures, searches, downloads, indexed pages; charts (7/30 days) |
| Sources | Table + form; toggle enabled; schedule; rights status; permission note; "Run now" (dispatches the GitHub workflow and shows live status); test connection |
| Crawl runs | History with counts, duration, expandable log, retry |
| Review queue | Side-by-side PDF preview + editable fields (course, term, subject, year, code); approve / reject / merge duplicate |
| Content | Search/edit/unpublish papers, subjects, courses, terms; bulk operations; slug redirects |
| Uploads and notes | Moderate user submissions |
| Reports | Broken / wrong / takedown requests; resolve with action |
| SEO | Indexed vs not, clicks/impressions/position (Search Console), pages with issues (missing meta, thin, 404), top and losing pages |
| Search insights | Top queries, **zero-result queries** (content gaps), trending |
| Users | List, role change, ban |
| Settings | Alert recipients, feature flags, rate limits, thresholds (auto-publish confidence) |
| Audit log | Who changed what |

## 14. Automated insights and alerts

- **Daily digest** (email + Telegram): new/changed/failed papers, review-queue size, top searches, newly (de)indexed pages.
- **Immediate alerts**: run failed, source anomaly (count drop), storage > 80 %, API error spike, takedown report received.
- **Weekly report**: traffic and ranking trends, top content, content gaps from zero-result searches.
- Search Console sync job fills `seo_pages` daily.

## 15. Security and quality

- Validate all input with Pydantic; parameterized queries only (SQLAlchemy); sanitize any HTML.
- Uploads: PDF magic check, size limit 25 MB, optional ClamAV scan, stored under random keys, moderation before publish.
- Signed URLs for R2 downloads (expire in minutes); private bucket.
- Rate limiting (login, search, report, download), bot protection (Cloudflare Turnstile on signup/upload/report).
- Structured logging, request IDs, Sentry (optional).
- Tests: `pytest` for normalizer (table-driven with real slug examples), diff logic, adapters (saved HTML fixtures + the local fake-site test from `crawler.py`), API endpoints, auth/roles; Playwright smoke tests for search, paper page, login; Lighthouse CI.

## 16. Environment variables (`.env.example`)

```
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=            SUPABASE_ANON_KEY=        SUPABASE_JWT_SECRET=
R2_ACCOUNT_ID=  R2_ACCESS_KEY_ID=  R2_SECRET_ACCESS_KEY=  R2_BUCKET=  R2_PUBLIC_BASE=
TELEGRAM_BOT_TOKEN=  TELEGRAM_CHAT_ID=  TELEGRAM_BACKUP_CHANNEL_ID=
RESEND_API_KEY=  ALERT_EMAIL_TO=
NEXT_PUBLIC_SITE_URL=  NEXT_PUBLIC_API_URL=  NEXT_PUBLIC_SUPABASE_URL=  NEXT_PUBLIC_SUPABASE_ANON_KEY=
REVALIDATE_SECRET=  INTERNAL_API_TOKEN=  INDEXNOW_KEY=
GOOGLE_SC_CREDENTIALS_JSON=  GOOGLE_SC_SITE_URL=
GITHUB_REPO=owner/repo  GITHUB_WORKFLOW_FILE=daily-crawl.yml
GITHUB_TOKEN_DISPATCH=     # fine-grained token, only 'Actions: write' on this repo (used by API "Run now")
SUPABASE_DB_POOLER_URL=    # pooled connection string for Render
USER_AGENT="UniraajPYQBot/1.0 (+https://yoursite/contact)"
```

## 17. Build order and acceptance criteria

**Phase 1: Foundation**
- Monorepo, local Docker Compose (api + postgres, dev only), Alembic migrations for section 6, seed data, `cli.py` entrypoints.
- Adapter interface + `generic_site` (ported crawler) + `uploads` adapter skeleton.
- Pipeline stages 1-9 working end-to-end on the local fake-site fixture and on one permitted source.
- Done when: `pytest` green; running the pipeline twice creates no duplicates; a changed paper is detected.

**Phase 2: Public API and site**
- Public endpoints, search, download redirect. Next.js pages for all routes in section 9 with SEO templates, sitemaps, robots, JSON-LD.
- Auth (signup, login, Google), bookmarks, downloads, reports, legal pages.
- Done when: Lighthouse budgets pass; pages render with JS disabled; sitemap validates; search returns typo-tolerant results.

**Phase 3: Admin and automation**
- GitHub Actions workflows (section 5A), "Run now" via workflow_dispatch, revalidation, IndexNow, alerts, digest, review queue, content editing.
- Search Console sync + SEO and search-insight panels.
- Done when: a simulated new paper appears on the live page within minutes of a run, and failures send an alert.

**Phase 4: Hardening and deploy**
- Rate limits, Turnstile, audit log, Sentry, backups (scheduled `pg_dump` to R2 from Actions), RUNBOOK.md, CI/CD, production deploy to Render + Cloudflare, uptime pinger.

## 18. Future extensions (design for them now)

More universities and exams (new `sources` + adapters, `universities` already multi-tenant) · user notes marketplace with moderation ·
quizzes from papers (the old site has some) · AI features: summaries, answer explanations, "important questions" per subject,
chat with a paper (RAG over `content_text`) · Typesense/Meilisearch behind the `search` service interface · PWA / mobile app using the same API ·
ads and premium plans · public API with keys · multi-language (Hindi) pages with `hreflang`.

## 19. Definition of done (whole project)

- Fresh clone + `.env` + `docker compose up` runs API and DB locally; `python -m app.cli run --source <id>` runs the pipeline; `npm run dev` runs the site.
- Production: API on Render, site on Cloudflare, daily automation on GitHub Actions, all within free tiers.
- Daily automation runs unattended, is idempotent, and never overwrites good data with a failed run.
- Every public page has unique title/description/H1, canonical, structured data, and is in a sitemap.
- Admin can run a source, review low-confidence papers, unpublish content and see SEO and search insights.
- README explains setup, deployment, adding a new source adapter, and the content-rights rules in section 2.
