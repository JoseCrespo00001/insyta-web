// DEAD-CODE 2026-06-24: archivo sin importadores (audit). Verificado: 0 imports de
// "@/lib/projects/dashboard". Candidato a borrar — se deja anotado para tu revisión.
/**
 * Datos mock del dashboard (resumen por proyecto + overview + actividad).
 * TODO(api): reemplazar por agregados reales del backend.
 */

export type AuditStatus = "idle" | "running";

export type ProjectSummary = {
  publicId: string;
  name: string;
  score: number | null;
  scoreDelta: number | null; // vs semana anterior
  conversations: number;
  flujos: number;
  improvementsApplied: number;
  suggestionsOpen: number;
  openAlerts: number;
  lastAuditAt: string | null;
  auditStatus: AuditStatus;
  auditProgress: number | null; // 0-100 si running
};

export const PROJECT_SUMMARIES: ProjectSummary[] = [
  {
    publicId: "proj_8dJ7Kw2nGfL5HsBp",
    name: "Bot Ventas 001",
    score: 58,
    scoreDelta: -14,
    conversations: 12,
    flujos: 2,
    improvementsApplied: 1,
    suggestionsOpen: 3,
    openAlerts: 1,
    lastAuditAt: "2026-05-28T17:00:00Z",
    auditStatus: "idle",
    auditProgress: null,
  },
  {
    publicId: "proj_3MnK9Wp2LfH6Bs8d",
    name: "Bot Soporte 24h",
    score: 71,
    scoreDelta: 4,
    conversations: 34,
    flujos: 1,
    improvementsApplied: 0,
    suggestionsOpen: 2,
    openAlerts: 0,
    lastAuditAt: null,
    auditStatus: "running",
    auditProgress: 62,
  },
];

export const DASHBOARD_OVERVIEW = {
  conversationsEvaluated: 46,
  conversationsThisWeek: 8,
  avgScore: 64,
  avgScoreDelta: -3, // vs semana anterior
  auditsRun: 4,
  auditsRunning: 1,
  improvementsApplied: 1,
  suggestionsOpen: 5,
  satisfaction: { satisfecho: 21, neutral: 11, insatisfecho: 14 },
};

export type ActivityKind = "audit" | "improvement" | "alert" | "upload";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  text: string;
  at: string;
};

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "ac1",
    kind: "alert",
    text: "Bot Ventas 001 · el score bajó de 72 a 58 esta semana.",
    at: "2026-06-16T06:05:00Z",
  },
  {
    id: "ac2",
    kind: "audit",
    text: "Bot Soporte 24h · auditoría en curso sobre 34 conversaciones.",
    at: "2026-06-16T05:40:00Z",
  },
  {
    id: "ac3",
    kind: "improvement",
    text: "Bot Ventas 001 · mejora aplicada: tomar el pedido por WhatsApp.",
    at: "2026-06-12T10:00:00Z",
  },
  {
    id: "ac4",
    kind: "upload",
    text: "Bot Ventas 001 · se cargó conversaciones-junio.csv (3 conversaciones).",
    at: "2026-06-10T11:05:00Z",
  },
];
