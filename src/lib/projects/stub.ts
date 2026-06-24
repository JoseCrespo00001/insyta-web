// DEAD-CODE 2026-06-24: archivo sin importadores (audit). Verificado: 0 imports de
// "@/lib/projects/stub". Candidato a borrar — se deja anotado para tu revisión.
import type { Project } from "./types";

/**
 * Datos stub de Projects para el MVP.
 *
 * TODO(api): reemplazar por GET /api/v1/projects (backend insyta-api) usando
 * React Query. Hoy la lista vive en estado de cliente (ver projects-view.tsx)
 * para poder construir la UI sin backend.
 */
export const STUB_PROJECTS: Project[] = [
  {
    publicId: "proj_8dJ7Kw2nGfL5HsBp",
    name: "Bot Ventas 001",
    agentCount: 1,
    conversationCount: 12,
    score: 58,
    updatedAt: "2026-06-16T20:00:00Z",
  },
  {
    publicId: "proj_3MnK9Wp2LfH6Bs8d",
    name: "Bot Soporte 24h",
    agentCount: 1,
    conversationCount: 0,
    score: null,
    updatedAt: "2026-05-10T14:00:00Z",
  },
];

let counter = 0;

/** Genera un public_id estilo `proj_xxx` para proyectos creados en el cliente. */
export function makeProjectId(): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 10);
  return `proj_${rand}${counter}`;
}
