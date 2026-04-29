// Schemas alineados con el OpenAPI REAL del backend (insyta-api Wave 2A).
// Regenerar `src/lib/api/types.gen.ts` con `pnpm generate-types` cuando el
// backend cambie. Este archivo expone tipos que SI consume la UI; muchos
// campos quedan opcionales porque el backend aun no los expone:
//
// - `Project.name | slug | description | created_at`: NO los devuelve aun
//   (solo /me con allowed_project_ids + /projects/{id}/score con score agregado).
// - `ProjectMetrics.{resolution_rate, avg_satisfaction, frustration_rate,
//   escalation_rate, trend_7d, top_topics}`: NO los devuelve aun.
//   Tracking en Linear como tech debt → backend extendera /score en Wave 4.
// - `Agent`, `ConversationSummary.{agent_name, topic, message_count, ended_at}`:
//   NO los devuelve aun.
// - `Evaluation.{frustration, escalated, efficiency, scope_violation, topic,
//   tokens_used, cost_usd, model_used, phoenix_span_id, evaluated_at}`:
//   NO los devuelve aun. La eval real expone solo {score, resolution,
//   satisfaction, tone, summary}.

import type { components } from "@/lib/api/types.gen";

// Re-exports tipados del OpenAPI generado (para mutaciones tipadas):
export type ApiProjectCreate = components["schemas"]["ProjectCreate"];
export type ApiProjectCreateResponse =
  components["schemas"]["ProjectCreateResponse"];
export type ApiProjectScoreResponse =
  components["schemas"]["ProjectScoreResponse"];
export type ApiConversationSummary =
  components["schemas"]["ConversationSummary"];
export type ApiConversationDetail = components["schemas"]["ConversationDetail"];
export type ApiMessageOut = components["schemas"]["MessageOut"];
export type ApiEvaluationOut = components["schemas"]["EvaluationOut"];
export type ApiUploadStatusResponse =
  components["schemas"]["UploadStatusResponse"];
export type ApiUploadCreatedResponse =
  components["schemas"]["UploadCreatedResponse"];
export type ApiMeResponse = components["schemas"]["MeResponse"];

// Tipos de dominio que la UI usa. Mapeados desde el backend en `fetchers.ts`.
// Lo que el backend aun no devuelve queda opcional con default null/[].

export type Platform = "wati" | "respond_io" | "manychat" | "sdk" | string;

export type UploadStatus = "pending" | "processing" | "completed" | "failed";

export type ConversationStatus =
  | "active"
  | "completed"
  | "abandoned"
  | "escalated"
  | string;

export type ConversationRole = "user" | "assistant" | "system" | string;

export interface Project {
  public_id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  created_at?: string;
  // Stats — el backend solo expone score y evaluation_count via /score.
  conversations_count?: number;
  evaluations_count?: number;
  avg_score?: number | null;
  // No-op hasta que backend expanda /score con tendencia.
  score_trend?: Array<{ date: string; score: number }>;
}

export interface ProjectCreatePayload {
  name: string;
  slug: string;
  description?: string;
}

export interface ProjectCreateResponse {
  public_id: string;
  name: string;
  slug: string;
  webhook_secret: string;
}

export interface Agent {
  public_id: string;
  project_id: string;
  name: string;
  platform: Platform;
}

export interface Upload {
  public_id: string;
  project_id: string;
  status: UploadStatus;
  rows_total: number | null;
  rows_processed: number | null;
  error_message: string | null;
  // Campos opcionales que el backend aun no devuelve — la UI los muestra
  // con fallback ("—" / valor inferido) si vienen undefined.
  filename?: string;
  size_bytes?: number;
  agent_id?: string;
  platform?: Platform;
  created_at?: string;
  completed_at?: string | null;
}

export interface ProjectMetrics {
  // Lo que el backend SI devuelve hoy:
  avg_score: number | null;
  evaluations_count: number;
  // Lo que el backend NO devuelve aun — ver TODO en /score (Wave 4):
  resolution_rate: number | null;
  avg_satisfaction: number | null;
  frustration_rate: number | null;
  escalation_rate: number | null;
  trend_7d: Array<{ date: string; score: number }>;
  top_topics: Array<{ topic: string; count: number }>;
}

export interface ConversationSummary {
  public_id: string;
  platform: Platform;
  started_at: string | null;
  status: ConversationStatus;
  score: number | null;
  // Backend aun no expone estos:
  external_id?: string;
  agent_id?: string;
  agent_name?: string;
  topic?: string | null;
  message_count?: number;
  ended_at?: string | null;
}

export interface Message {
  public_id: string;
  role: ConversationRole;
  content_anonymized: string | null;
  timestamp: string;
}

export interface Evaluation {
  // Devuelto por el backend:
  score: number | null;
  resolution: boolean | null;
  satisfaction: number | null;
  tone: "positive" | "neutral" | "negative" | string | null;
  summary: string | null;
  // No devuelto aun:
  public_id?: string;
  conversation_id?: string;
  frustration?: boolean;
  escalated?: boolean;
  efficiency?: number;
  scope_violation?: boolean;
  topic?: string | null;
  model_used?: string;
  tokens_used?: number;
  cost_usd?: number;
  phoenix_span_id?: string | null;
  evaluated_at?: string;
}

export interface ConversationDetail {
  public_id: string;
  platform: Platform;
  status: ConversationStatus;
  started_at: string | null;
  messages: Message[];
  evaluation: Evaluation | null;
  // No devuelto aun por el backend:
  agent_id?: string;
  agent_name?: string;
  project_id?: string;
  message_count?: number;
  external_id?: string;
  ended_at?: string | null;
}

export type Paginated<T> = {
  items: T[];
  next_cursor: string | null;
  total?: number;
};

export interface MeResponse {
  user_id: string;
  email: string;
  org_id: string;
  allowed_project_ids: string[];
}
