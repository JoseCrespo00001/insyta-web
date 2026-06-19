# TAREAS TFG — Cierre Insyta (TP4 vence 28-jun-2026)

> Checklist maestro del cierre del TFG. Fuente única de verdad. Marcá `[x]` a medida que
> avanzás. Prioridad global: **demo deployado end-to-end** > documento. Hoy = 18-jun (10 días).

---

## Estado de notas (contexto)

- TP1 = 10 · TP2 = 10 · **TP3 = sin corregir** (se entregó en Pages, ilegible) · **TP4 vence 28-jun**.
- El TP4 exige sistema **corriendo y deployado**: §9 Pruebas (golden set 50 conv), §10
  Resultados (métricas reales + screenshots), §13 Anexos (link demo + zip).

---

## 3 bloqueantes críticos (matar primero — verificados a mano)

- [ ] **B1 — `GET /api/v1/projects` NO existe** (`insyta-api/app/routers/projects.py:57` solo
  tiene `@router.post`). El front lo necesita para dashboard y `/projects`. **P0.**
- [ ] **B2 — JWT sin `org_id` → 403** (`insyta-api/app/core/auth.py:152-161`). Supabase no
  pone `org_id` solo → escribir `app_metadata.org_id` (+ `allowed_project_ids`) en la cuenta
  demo vía Admin API. **Punto más probable de falla del demo.**
- [ ] **B3 — Anonimización sin cablear** (`insyta-api/app/workers/processor.py` no llama a
  `anonymize()` → `content_anonymized` queda null → el front lee null en
  `conversations.py:226` → transcript vacío en el demo).

---

## Inventario insyta-web (qué existe / agregar / cambiar)

### EXISTE — no tocar, reusar
- UI pulida completa: dashboard, projects, projects/[id] (tabs), conversations, improvements,
  perfil, supervisor, auth pages, error/not-found.
- 22 primitives shadcn en `components/ui/`.
- `components/shared/*` (conversation-workspace, conversation-report, score-badge, iconos).
- React Query provider (`providers/query-provider.tsx`) — montado pero vacío.
- Utils puros: `lib/format.ts`, `lib/utils.ts`, `lib/projects/export.ts`.

### AGREGAR — archivos nuevos
- [ ] `src/lib/api.ts` — fetch wrapper (`NEXT_PUBLIC_API_URL` + `Authorization: Bearer`, 401→/login).
- [ ] `src/lib/api-types.ts` — tipos espejo Pydantic (snake_case) + mappers a
  `lib/projects/types.ts` (camelCase, `content_anonymized`→`content`).
- [ ] `src/lib/queries.ts` — hooks React Query.
- [ ] `src/lib/supabase/{client,server,middleware}.ts` (`@supabase/ssr`).
- [ ] `src/middleware.ts` — gate de sesión.
- [ ] `.env.example`, `vercel.json`.
- [ ] Deps: `pnpm add @supabase/ssr @supabase/supabase-js`.

### CAMBIAR — existentes (reemplazar fuente de datos, mantener UI)
- [ ] `lib/auth/session.ts` (STUB_USER → sesión Supabase).
- [ ] `(app)/layout.tsx:3-5` (re-habilitar gate).
- [ ] `top-nav.tsx` (usuario real `/me`; notificaciones recortadas).
- [ ] `dashboard/page.tsx` (← dashboard.ts).
- [ ] `projects/projects-view.tsx` (← stub.ts).
- [ ] `projects/[id]/project-detail-view.tsx` + `sections/*` (← mock.ts).
- [ ] `conversations/conversations-view.tsx` (← mock.ts).
- [ ] `improvements/improvements-view.tsx:37-46` (quitar setTimeout mock).
- [ ] `(auth)/login/page.tsx` login real (register/forgot quedan stub).

---

## Gap de endpoints (backend debe crear)

| Front necesita | Endpoint | ¿Existe? | Prioridad |
|---|---|---|---|
| Lista de proyectos | `GET /api/v1/projects` | NO | **P0 bloqueante** |
| Conversaciones / detalle / score / upload / feed / me | varios | SÍ | consumir ya |
| Dashboard overview (agregados) | `GET /api/v1/dashboard/overview` | NO | P1 (mínimo: score+conteos) |
| Reporte agregado auditoría | `GET /projects/{id}/report` | NO | P2 (o derivar client-side) |
| Improvements list + accept/reject | `GET /projects/{id}/improvements` | NO | P3 — candidato a recorte |
| Notificaciones / recent-activity | — | NO | recortar / estático |

---

## Workstreams

### W0 — Higiene (hoy)
- [ ] Reenviar **TP3 en .docx + PDF** + avisar al tutor que el anterior era Pages. *(nota perdida si no se hace ya)*
- [x] Crear `insyta-web/TAREAS_TFG.md`.
- [ ] Unificar carpeta duplicada `Trabajos Practicos ` (con espacio) vs `Trabajos Practicos`.

### W1 — Backend: desbloquear el front
- [ ] `GET /api/v1/projects` (P0) en `app/routers/projects.py` (reusar service existente).
- [ ] Cablear `anonymize()` en `app/workers/processor.py` antes de persistir.
- [ ] `GET /api/v1/dashboard/overview` mínimo (score + conteos; sin deltas semanales).
- [ ] (P2/P3 según tiempo) `GET /projects/{id}/report`, improvements.
- [ ] `docker compose up` + migraciones + `uv run pytest` verde.

### W2 — Golden set + métricas (alimenta TP4 §9/§10)
- [ ] Generar 50 conv con `pyme-maria-agent/scripts/generate_dataset.py` (variadas, multi-turn).
- [ ] Upload CSV → evaluar con Haiku.
- [ ] Medir: latencia/conv, throughput conv/min, costo USD, **FP rate** (etiquetar subset a mano).
- [ ] Output: tabla + CSV + capturas.

### W3 — Deploy (PRIORIDAD)
- [ ] **Supabase**: proyecto, migraciones, RLS, Auth (JWT). Setear `app_metadata.org_id` en cuenta demo (Admin API).
- [ ] **Railway**: api + Celery worker + Redis; env; ajustar `Dockerfile` (comando worker).
- [ ] **Vercel**: web; `.env.example`, `vercel.json`, env. Verificar build next-intl en primer deploy.
- [ ] Cuenta demo con golden set pre-cargado y evaluado.
- [ ] Verificar: `GET <railway>/health` 200 · Vercel carga + login + data real.

### W4 — Frontend: conexión completa
- [ ] **Fase 0** (sin deps): deps + `api.ts` + `api-types.ts`+mappers + `queries.ts` + `.env.example`.
- [ ] **Fase 1** (endpoints existen): conversations, conversation-detail, score, upload contra backend local.
- [ ] **Fase 2** (auth): supabase clients + `middleware.ts` + login real + gate + top-nav real. Cablear `org_id`.
- [ ] **Fase 3** (bloqueada por W1): projects-list, dashboard overview, report, improvements.

### W5 — Documento TP4 (PDF, 28-jun)
- [ ] Reorganizar TP1-3 a estructura M3 Tabla 3 (13 secciones).
- [ ] §8 Desarrollo (sprints, stack, decisiones — incluir sugerencias del tutor: concurrencia/ingesta masiva + rate limits con backoff/colas).
- [ ] §9 Pruebas (golden set 50 + criterios + resultados W2).
- [ ] §10 Resultados (métricas + screenshots del dashboard real deployado).
- [ ] §13 Anexos (link demo + zip código en Drive).
- [ ] Migrar APA 2010→APA 7 · portada+índice · Word→PDF · validar (~120-150 págs).

### W6 — Oral (post-entrega)
- [ ] Slidev `08_PRESENTACION_ORAL/slides.md` con screenshots+métricas reales.
- [ ] Export PDF · 3 ensayos cronometrados (30 min, 40% en Resultados).

---

## Cronograma (18→28) — deploy-first respetando dependencias

- [ ] **18**: TP3 reenvío · backend `GET /projects` + `anonymize` · front Fase 0.
- [ ] **19**: backend `dashboard/overview` mínimo + Supabase provisioning · front Fase 1 (local).
- [ ] **20**: deploy Railway (api+worker+redis, `/health` ok) · front Fase 2 (auth+login) · cablear `org_id` demo.
- [ ] **21**: deploy Vercel + Fase 1 contra Railway. **Primer end-to-end real** (login→dashboard→conversación).
- [ ] **22**: W2 golden set (50 conv en prod) + screenshots · front Fase 3 (projects-list, overview).
- [ ] **23**: métricas (latencia/throughput/FP/costo) + buffer bugs · decidir recorte improvements.
- [ ] **24**: cuenta demo congelada con 50 conv; lo no conectado → mock con disclaimer "datos de ejemplo".
- [ ] **25-27**: W5 redacción TP4 (APA7, PDF). No tocar código salvo bug que rompa el demo.
- [ ] **28**: buffer + entrega. W6 después.

---

## Qué NO va a llegar en 10 días (honesto)

- Improvements accept/reject real (modelo desajustado) → mock con disclaimer.
- Notificaciones + recent-activity reales → estáticas o se quitan.
- Dashboard overview con deltas semanales + breakdown satisfacción completo → versión mínima.
- register / forgot-password reales → solo login para la cuenta demo.
- **Lo que SÍ sostiene el §10**: deploy vivo + login + projects-list + conversación con
  evaluación real + métricas del golden set.

---

## Verificación end-to-end (criterio de "hecho")

- [ ] Backend: `docker compose up` → `pytest` verde; subir CSV → `Evaluation` reales + `content_anonymized` poblado.
- [ ] Deploy: `GET <railway>/health` 200; Vercel carga, login real con JWT que trae `org_id`, dashboard con data del backend; cuenta demo con 50 conv.
- [ ] Front: flujo login→dashboard→proyecto→conversación con data real (no mock).
- [ ] Métricas: tabla latencia/throughput/FP/costo reproducible desde el golden set.
- [ ] Doc: PDF con portada sin nº pág, índice clickeable, APA7, §9/§10 con métricas+screenshots, link demo+zip.
