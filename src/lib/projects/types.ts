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
  companyContext?: string | null; // datos de la empresa (los usa el judge)
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
  // Veredicto real del judge para este mensaje (si ya se auditó).
  label?: string | null; // ok | warning | error
  issueType?: string | null; // alucinacion | error_politica | alcance | ...
  severity?: string | null;
  note?: string | null;
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
  // Rúbrica (AUD-7.x). Opcionales: el backend siempre los manda, pero los mocks no.
  scoreBruto?: number | null;
  scoreFinal?: number | null;
  confidence?: number | null;
  hasVeto?: boolean;
  vetoFirm?: boolean; // B7: firme (topea) vs tentativo ("a confirmar", no topea)
  vetoFlags?: string[];
  segment?: ConversationSegment | null;
  sentimentTrajectory?: string[];
  requiereRevisionHumana?: boolean;
  rubric?: Rubric | null;
};

export type ConversationSegment =
  | "cliente_ideal"
  | "satisfecho"
  | "neutral"
  | "insatisfecho"
  | "potencial_lead"
  | "problematico";

export type RubricDimension = {
  id: string; // A1..F4
  score: number | null; // 1-5
  turn_id: number | null;
  justificacion: string;
};

export type Rubric = {
  dimensiones: RubricDimension[];
  veto_flags: string[];
  confidence: number;
  sentimiento_trayectoria: string[];
  fraude_flags: string[];
  resumen: string;
  requiere_revision_humana: boolean;
};

/** Veredicto del judge por mensaje (para la capa de riesgo del reporte). */
export type MessageVerdict = {
  label: string | null; // ok | warning | error
  issueType: string | null; // alucinacion | alcance | contradiccion | ...
  issueSubtype: string | null;
  severity: string | null; // baja | media | alta | critica
  note: string | null;
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
  messageEvaluations?: MessageVerdict[]; // verdicts por mensaje (riesgo)
  needsIntervention?: boolean; // el backend ya lo computó
  reason?: string | null; // B3: motivo de intervención en lenguaje humano (backend)
  riskScore?: number; // para ordenar por urgencia
  isDuplicate?: boolean; // B4: duplicado de determinismo (visible, no cuenta en agregados)
  // B5: externalId y contactName vienen ya pseudonimizados desde el backend
  // (externalId = "cliente #<hash>", contactName = nombre o el mismo pseudónimo).
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
  node_json?: string | null; // snippet JSON del nodo a agregar al flujo
  prompt?: string | null; // prompt para pasarle a la IA del flujo
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

/** Capa de riesgo del reporte (separada del score promedio). */
export type AuditRisk = {
  withVeto: number;
  needsReview: number;
  critical: number;
  bySeverity: { critica: number; alta: number; media: number; baja: number };
};

/** Resultado de una auditoría. */
export type Report = {
  total: number;
  avgScore?: number | null; // B1: score promedio VISIBLE (topeado por VETO) — fuente back
  satisfaction: Record<Satisfaction, number>;
  risk?: AuditRisk; // capa de riesgo agregada
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
  evaluatedCount: number; // conversaciones ya procesadas (progreso)
  emphasis: string[]; // keys de EmphasisOption
  freeText: string;
  createdAt: string; // ISO
  // running = el judge corriendo · failed = el judge falló (p.ej. falta API key)
  status: "running" | "active" | "archived" | "failed";
  errorMessage: string | null; // motivo del fallo (p.ej. falta API key)
  report: Report;
};
