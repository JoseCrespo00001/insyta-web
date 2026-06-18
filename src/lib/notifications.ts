/**
 * Notificaciones mock para el menú de la campana.
 * TODO(api): reemplazar por el feed real del backend.
 */
export type NotifKind = "audit" | "suspicious" | "update" | "improvement";

export type Notification = {
  id: string;
  kind: NotifKind;
  title: string;
  detail: string;
  at: string;
  read: boolean;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    kind: "audit",
    title: "Auditoría completada",
    detail: "Bot Ventas 001 · 12 conversaciones analizadas.",
    at: "2026-06-17T17:00:00Z",
    read: false,
  },
  {
    id: "n2",
    kind: "suspicious",
    title: "Conversación sospechosa",
    detail: "Juan Pérez · frustración alta, score 34.",
    at: "2026-06-16T11:00:00Z",
    read: false,
  },
  {
    id: "n3",
    kind: "improvement",
    title: "3 sugerencias nuevas",
    detail: "Bot Ventas 001 · mejoras propuestas para el flujo.",
    at: "2026-06-16T06:00:00Z",
    read: true,
  },
  {
    id: "n4",
    kind: "update",
    title: "Nueva versión disponible",
    detail: "Mejoras en el grafo de flujos y el reporte por conversación.",
    at: "2026-06-15T09:00:00Z",
    read: true,
  },
];

export const UNREAD_COUNT = NOTIFICATIONS.filter((n) => !n.read).length;
