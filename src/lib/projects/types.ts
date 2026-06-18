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

// ── Detalle del proyecto (mock; la lógica real la hace el backend) ──

/** Un flujo de agentes (JSON gigante). */
export type Flujo = {
  id: string;
  name: string;
  version: string;
  sizeBytes: number;
  agentCount: number;
  createdAt: string; // ISO
  json: string; // contenido pretty-printed (sample para el visor)
};

export type Satisfaction = "satisfecho" | "neutral" | "insatisfecho";

/** Una conversación cargada por CSV. */
export type ChatMessage = {
  role: "user" | "bot";
  content: string;
  at: string; // ISO timestamp del mensaje (viene del CSV)
};

/** Reporte de evaluación de una conversación (lo que se midió + trace). */
export type ConversationEvaluation = {
  resolution: boolean;
  satisfaction: number; // 1-5
  tone: "positive" | "neutral" | "negative";
  frustration: boolean;
  escalated: boolean;
  efficiency: number; // 1-5
  scopeViolation: boolean;
  topic: string;
  summary: string;
  modelUsed: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  latencyMs: number;
  phoenixTraceId: string;
  phoenixSpanId: string;
  evaluatedAt: string;
};

export type Conversation = {
  id: string;
  uploadGroupId: string; // CSV de origen (agrupa la carga)
  externalId: string; // número/identificador del chat
  contactName: string;
  preview: string; // primera línea / resumen corto
  messageCount: number;
  userMessages: number;
  botMessages: number;
  messages: ChatMessage[]; // transcript para ver el chat
  score: number | null;
  satisfaction: Satisfaction | null;
  resolved: boolean | null; // false = el agente no resolvió
  evaluation: ConversationEvaluation; // reporte detallado (lo medido + trace)
  selected: boolean; // para testear en la auditoría
  pinned: boolean; // fijada por el usuario
};

/** Aspecto a enfatizar en la auditoría. */
export type EmphasisOption = {
  key: string;
  label: string;
};

/** Sugerencia de mejora del flujo. */
export type Suggestion = {
  title: string;
  detail: string;
  impact: string; // ej: "+12% satisfacción estimada"
};

/** Un paso de la ejecución del flujo (al probarlo). */
export type RunStep = {
  node: string; // "Chat Input", "Supervisor · router", "Agente Ventas", "Response"
  detail: string;
  status: "ok" | "warning" | "error";
};

/** Resultado de correr el flujo sobre un mensaje de prueba. */
export type FlujoRun = {
  input: string;
  route: string;
  steps: RunStep[];
  resolved: boolean;
  response: string;
  predictedSatisfaction: Satisfaction;
};

/** Mejora de un flujo con su justificación y las conversaciones que la motivaron. */
export type FlujoImprovement = {
  title: string;
  detail: string;
  impact: string;
  why: string; // dato concreto que justifica la mejora
  conversations: Conversation[]; // las que necesitaron esta mejora
};

/** Resultado de una auditoría. */
export type Report = {
  total: number;
  satisfaction: Record<Satisfaction, number>;
  failing: Conversation[]; // conversaciones donde el agente no resolvió
  conversations: Conversation[]; // todas las auditadas (para métricas agregadas)
  suggestions: Suggestion[];
};

/** Un CSV cargado: agrupa las conversaciones de esa carga. */
export type UploadGroup = {
  id: string;
  projectName: string;
  filename: string;
  loadedAt: string; // ISO date de la carga
  conversations: Conversation[];
};

/** Lo que se envía al backend para correr una auditoría. */
export type AuditPayload = {
  flujoId: string;
  conversationIds: string[];
  emphasis: string[]; // keys de EmphasisOption
  freeText: string;
};

/** Una auditoría corrida sobre un flujo + conversaciones. */
export type Audit = {
  id: string;
  name: string;
  flujoId: string;
  flujoName: string;
  conversationCount: number;
  emphasis: string[]; // keys de EmphasisOption
  freeText: string;
  createdAt: string; // ISO
  status: "active" | "archived";
  report: Report;
};
