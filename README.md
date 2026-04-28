# insyta-web

Next.js 15 dashboard para Insyta.

## Stack

- **Next.js 15** (App Router, React 19, Turbopack)
- **TypeScript 5.7+**
- **Tailwind CSS 3.4 + shadcn/ui**
- **Supabase Auth + SSR**
- **TanStack Query** para fetching
- **react-hook-form + zod** para forms
- **next-themes** para dark mode

## Quickstart

```bash
# 1. Instalar deps
npm install

# 2. Configurar env
cp .env.example .env.local
# editar .env.local con SUPABASE_URL + SUPABASE_ANON_KEY

# 3. Levantar dev server
npm run dev

# 4. Abrir
open http://localhost:3000
```

## Estructura (planificada)

```
src/
├── app/
│   ├── (marketing)/      Landing, pricing, blog
│   ├── (auth)/           Login, register, reset
│   ├── (dashboard)/      App principal con sidebar
│   └── onboarding/       Wizard post-registro
├── components/
│   ├── ui/               shadcn/ui base
│   ├── layout/           Sidebar, topbar, navbar
│   ├── dashboard/        Score cards, charts, feeds
│   └── shared/           Data tables, empty states, etc
├── hooks/                use-sse, use-auth, use-tenant
├── lib/                  api-client, supabase, utils, types
├── providers/            Auth, theme, query providers
└── styles/               globals.css con CSS variables
```

Plan completo en `/insyta/04-technical/architecture.md` (seccion "Repo 2: insyta-web").

## Pre-commit hooks

```bash
# 1. Instalar pre-commit (una sola vez)
pipx install pre-commit  # o: brew install pre-commit

# 2. Activar hooks en este repo
pre-commit install

# 3. Correr todos los hooks contra el repo entero (opcional)
pre-commit run --all-files
```

Los hooks corren prettier, eslint y `pnpm type-check` en cada commit.

## Convencion de commits

```
[INSYTA-N] descripcion             # comenta en issue
closes INSYTA-N: descripcion        # cierra issue
[wip INSYTA-N] descripcion          # marca en progreso
```
