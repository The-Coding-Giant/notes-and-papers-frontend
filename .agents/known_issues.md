# Known issues

- With the API down, home and `/rajasthan-university` show empty states and deeper pages show the error page (500); intended (ADR-007).
- Privacy and Terms are drafts and need legal review before launch.
- The production build downloads Google Fonts (Geist), so it needs network access.
- Supabase Auth is untested locally (no project); the developer login exercises everything after the token.
- Next.js writes its own managed block into the repo-root `AGENTS.md`; project rules live in `.agents/AGENTS.md`.
