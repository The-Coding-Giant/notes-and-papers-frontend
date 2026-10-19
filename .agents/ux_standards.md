# UX standards

## Six states per screen
Loading, Skeleton, Success (toast), Error (`error.tsx` / EmptyState + retry), No permission, Offline
(`OfflineBanner`; submit buttons disable via `useOnline`).
Implemented: skeleton (`loading.tsx`), error (`error.tsx`), not-found, offline, empty states.
No-permission screen lands with the admin dashboard (phase 3).

## Input Validation Rules
Rules live in `src/lib/validation.ts` (Zod). Validate on blur, then on change.

| Type | Rule |
|---|---|
| Email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Text/name | not an email, not a pure number |
| Number | digits, `.`, optional `-` only |
| Phone | `/^[+\d\s\-()\[\]]{7,15}$/` |
| URL | `z.string().url()` |
| Password | >= 8 chars, 1 uppercase, 1 digit, 1 symbol; show strength meter |
| Textarea | max 500, live `X / 500`, amber at 450, red at 500 |

Form checklist: red `*` after label + `aria-required`; inline error below the field (icon + red text) shown only after
the field is touched; submit `disabled` until valid and not submitting; Enter submits; backend errors surface as
`toast.error`, never inline.
