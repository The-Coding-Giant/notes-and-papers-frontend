# Design system

Tokens live in `src/app/globals.css` as HSL triplets and are exposed to Tailwind via `@theme inline`.
Light = `:root`, dark = `.dark` (next-themes, `attribute="class"`).

| Token | Use |
|---|---|
| `background` / `foreground` | page surface / body text |
| `card` | raised surfaces (cards, menus) |
| `primary` / `primary-foreground` | main CTAs, links, brand |
| `secondary`, `muted`, `muted-foreground` | quiet surfaces, secondary text |
| `accent` | highlights (sparingly) |
| `destructive` | errors, danger |
| `success` | confirmations |
| `border`, `input`, `ring` | dividers, field borders, focus ring |

- Radius: `rounded-md` fields/buttons, `rounded-lg` cards. Shadow: `shadow-sm` at rest, `shadow-md` on hover.
- Spacing: page container `max-w-6xl px-4 py-8`; section gap `space-y-8` / `space-y-14`; card padding `p-4`.
- Typography: Geist Sans. h1 `text-3xl font-bold tracking-tight` (hero `md:text-5xl`), h2 `text-xl|2xl font-semibold`,
  helper text `text-sm|xs text-muted-foreground`.
- Breakpoints: 320 default, `xs` 375, `md` 768, `lg` 1024, `xl` 1440.
- Focus: global `:focus-visible` 2px ring; components add `focus-visible:ring-2`.
- Motion: <= 300ms, transform/opacity only; `prefers-reduced-motion` is honoured globally.
- Buttons: primary | secondary | outline | ghost | destructive | link; sizes sm | md | lg | icon.
  Use `buttonVariants()` to style `<Link>`s.
