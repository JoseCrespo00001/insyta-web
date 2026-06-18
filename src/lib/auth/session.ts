/**
 * Stub de sesión para el MVP.
 *
 * El auth real (Supabase) se agrega como slice aparte. Mientras tanto, todo el
 * dashboard usa este usuario/org fijo para no bloquear el desarrollo del flujo
 * principal (subir CSV → analizar → ver sugerencias).
 *
 * TODO(auth): reemplazar por la sesión real de Supabase cuando se recupere el
 * slice de autenticación. Buscar usos de STUB_USER para encontrar los puntos
 * que dependen de la sesión.
 */
export type SessionUser = {
  name: string;
  email: string;
  orgName: string;
};

export const STUB_USER: SessionUser = {
  name: "Jose Crespo",
  email: "jose@insyta.io",
  orgName: "Insyta Demo",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
