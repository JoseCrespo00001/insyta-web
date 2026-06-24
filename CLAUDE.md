# insyta-web — landing + dashboard (Next.js App Router)

Scoped guide. Domain glossary in `../CONTEXT.md`, cross-cutting rules in `../CLAUDE.md`.
This file is web-specific only.

## What this app is

Two surfaces in one Next.js app:

- **Landing** (público): `app/page.tsx` + `components/landing/`. Marketing, sin auth.
- **Dashboard** (autenticado): el route group `app/(app)/` — el producto real donde el
  usuario sube conversaciones, ve evaluaciones, audita flujos y revisa mejoras.
- **Auth**: el route group `app/(auth)/` — login / register / forgot-password (Supabase).

## Stack

Next.js 15 (App Router, **Turbopack**) · React 19 · TypeScript 5.7 (**strict**) · Tailwind ·
**shadcn/ui** · next-themes (dark mode) · **next-intl** (i18n) · **@tanstack/react-query**
(fetchers en `lib/queries.ts`) · **Supabase** (auth SSR). Package manager: **pnpm**.

> **Sin test runner todavía** — no hay vitest/jest/playwright configurado. Setear Vitest +
> @testing-library/react es trabajo pendiente (ver el plan de audit del repo raíz).

## Layout (`src/`)

- `app/` — App Router.
  - `page.tsx` (landing), `layout.tsx` (root), `not-found.tsx`.
  - `(app)/` — dashboard autenticado: `dashboard/`, `projects/[id]/sections/`, `flows/[id]/`,
    `conversations/`, `improvements/`, `supervisor/`, `perfil/`.
  - `(auth)/` — `login/`, `register/`, `forgot-password/`.
- `middleware.ts` — refresca la sesión Supabase en cada request (usa `utils/supabase/middleware.ts`).
- `components/` — `ui/` (primitives shadcn) · `shared/` (componentes de negocio) ·
  `layout/` (app shell, bootstrap gate) · `landing/` (marketing).
- `lib/` — `api.ts` (fetch tipado al backend con Bearer JWT) · `queries.ts` (hooks React Query) ·
  `utils.ts` (`cn`) · `format.ts` · `auth/` (sesión) · `projects/` (tipos) · `landing/` ·
  `mock/` (fixtures del MVP — **candidatos a limpieza**, ver plan de audit).
- `utils/supabase/` — `client.ts`, `server.ts`, `middleware.ts`.
- `providers/` — theme + react-query + tooltip + toaster.
- `i18n/` — `request.ts` (next-intl).
- `styles/` — `globals.css`.
- `hooks/` — carpeta presente pero hoy **vacía**; los hooks viven en `lib/auth/` y `lib/queries.ts`.

## Backend

El front pega a la FastAPI (`insyta-api`) vía `lib/api.ts`. Base URL: `NEXT_PUBLIC_API_URL`
(local `http://localhost:8000` con `uv run uvicorn`; prod Railway). El token de Supabase se
adjunta como `Authorization: Bearer <jwt>` para que el backend resuelva org/projects vía RLS.

> No hay `.env.example` versionado — crear uno con `NEXT_PUBLIC_API_URL`,
> `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Iron rules (web-specific)

- **shadcn first.** Antes de escribir un primitive a mano, chequeá el registro
  (`mcp__shadcn__*`). Anti-pattern: copiar JSX de docs cuando hay tool de install.
- **Server Components by default.** `"use client"` solo cuando necesitás interactividad.
- **i18n + dark mode** no se rompen — nada de strings de usuario hardcodeados, respetar tokens de tema.
- **Solo la publishable key de Supabase en el cliente.** Nunca la `service_role`.
- **Data fetching vía `lib/api.ts` + React Query.** No hagas `fetch` crudo suelto en componentes.

## Commands (run from `insyta-web/`)

```bash
pnpm install
pnpm dev         # next dev --turbopack
pnpm build
pnpm lint        # next lint (eslint)
pnpm type-check  # tsc --noEmit
```

## Don'ts

- Don't ship `console.log` (un hook lo marca) ni strings de usuario hardcodeados.
- Don't agregar auth/dashboard/api ad hoc — traelos como vertical slices completos.
- Don't meter la `service_role` key de Supabase en el bundle del cliente.
