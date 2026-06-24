/**
 * React Query hooks sobre el backend insyta-api, agrupados por dominio.
 * Barrel: re-exporta todo para que `@/lib/queries` siga funcionando como antes.
 * (Split desde un único queries.ts de 450 líneas — audit 2026-06-24.)
 */
export * from "./me";
export * from "./projects";
export * from "./flows";
export * from "./uploads";
export * from "./conversations";
export * from "./audits";
export * from "./improvements";
export * from "./settings";
export * from "./dashboard";
