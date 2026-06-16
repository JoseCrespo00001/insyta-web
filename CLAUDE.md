# insyta-web — public site (Next.js App Router)

Scoped guide. Domain glossary in `../CONTEXT.md`, cross-cutting rules in `../CLAUDE.md`.

> **State:** stripped down to the **public site** only. Auth, the dashboard, onboarding,
> Supabase, the typed `lib/api` client and the app-shell components were removed. Re-add them
> as vertical slices when the product surface comes back.

## Stack

Next.js (App Router, **Turbopack**) · React · TypeScript · Tailwind · **shadcn/ui** ·
next-themes (dark mode) · react-query (provider wired, no fetchers yet). Package manager: **pnpm**.

## Layout (`src/`)

- `app/` — App Router. `layout.tsx` (root) + `page.tsx` (landing). No route groups, no middleware.
- `components/ui/` — shadcn primitives (the design-system kit).
- `lib/` — `utils.ts` (`cn`), `format.ts`.
- `providers/` — theme + react-query + tooltip + toaster.
- `styles/` — `globals.css`.

## Iron rules (web-specific)

- **shadcn first.** Before hand-writing a primitive, check the shadcn registry
  (`mcp__shadcn__*`). Anti-pattern: copying JSX from docs when an install tool exists.
- **Server Components by default.** Add `"use client"` only when you need interactivity.
- **i18n + dark mode** must hold — no hardcoded user-facing strings, respect theme tokens.

## Commands (run from `insyta-web/`)

```bash
pnpm install
pnpm dev         # next dev --turbopack
pnpm build
pnpm lint        # next lint (eslint)
pnpm type-check  # tsc --noEmit
```

## Don'ts

- Don't ship `console.log` (a hook flags it) or hardcoded user-facing strings.
- Don't re-add auth/dashboard/api ad hoc — bring them back as full vertical slices.
