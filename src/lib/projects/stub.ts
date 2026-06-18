import type { Project } from "./types";

/**
 * Datos stub de Projects para el MVP.
 *
 * TODO(api): reemplazar por GET /api/v1/projects (backend insyta-api) usando
 * React Query. Hoy la lista vive en estado de cliente (ver projects-view.tsx)
 * para poder construir la UI sin backend.
 */
export const STUB_PROJECTS: Project[] = [];

let counter = 0;

/** Genera un public_id estilo `proj_xxx` para proyectos creados en el cliente. */
export function makeProjectId(): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 10);
  return `proj_${rand}${counter}`;
}
