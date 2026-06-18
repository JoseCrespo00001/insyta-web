/**
 * Modelo mínimo de Project para la UI del dashboard.
 * Alineado con el data model (ver 04-technical/processes/02_data_model.md).
 */
export type Project = {
  publicId: string; // 'proj_xxx'
  name: string;
  agentCount: number;
  conversationCount: number;
  score: number | null; // null si todavía no se evaluó ninguna conversación
  updatedAt: string; // ISO date
};
