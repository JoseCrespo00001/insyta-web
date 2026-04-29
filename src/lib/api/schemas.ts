// Schemas alineados con architecture.md hasta que se corra `pnpm generate-types`
// contra el backend (EQUIP-60). Cuando esto pase, estos types se reemplazan por
// los de types.gen.ts; los componentes deberian compilar con un mapping minimo.

export type Platform = "wati" | "respond_io" | "manychat" | "sdk";

export type UploadStatus = "pending" | "processing" | "completed" | "failed";

export type ConversationStatus =
  | "active"
  | "completed"
  | "abandoned"
  | "escalated";

export type ConversationRole = "user" | "assistant" | "system";

export interface Project {
  public_id: string;
  org_id: string;
  slug: string;
  name: string;
  description: string | null;
  environment: "live" | "test";
  retention_days: number;
  created_at: string;
  updated_at: string;
  // Stats agregados (server-side, opcionales segun endpoint)
  conversations_count?: number;
  evaluations_count?: number;
  avg_score?: number | null;
  score_trend?: Array<{ date: string; score: number }>;
}

export interface ProjectCreatePayload {
  name: string;
  slug: string;
  description?: string;
}

export interface ProjectCreateResponse extends Project {
  // El backend devuelve el secret raw UNA SOLA VEZ.
  webhook_secret: string;
}

export interface Agent {
  public_id: string;
  project_id: string;
  name: string;
  platform: Platform;
  system_prompt?: string | null;
  created_at: string;
}

export interface Upload {
  public_id: string;
  project_id: string;
  agent_id: string;
  platform: Platform;
  filename: string;
  size_bytes: number;
  status: UploadStatus;
  rows_total: number | null;
  rows_processed: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ProjectMetrics {
  avg_score: number | null;
  resolution_rate: number | null;
  avg_satisfaction: number | null;
  frustration_rate: number | null;
  escalation_rate: number | null;
  evaluations_count: number;
  trend_7d: Array<{ date: string; score: number }>;
  top_topics: Array<{ topic: string; count: number }>;
}

export interface ConversationSummary {
  public_id: string;
  agent_id: string;
  agent_name?: string;
  platform: Platform;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  status: ConversationStatus;
  score: number | null;
  topic: string | null;
}

export interface Message {
  public_id: string;
  role: ConversationRole;
  content_anonymized: string;
  timestamp: string;
}

export interface Evaluation {
  public_id: string;
  conversation_id: string;
  score: number;
  resolution: boolean;
  satisfaction: number;
  tone: "positive" | "neutral" | "negative";
  frustration: boolean;
  escalated: boolean;
  efficiency: number;
  scope_violation: boolean;
  topic: string;
  summary: string;
  model_used: string;
  tokens_used: number;
  cost_usd: number;
  phoenix_span_id: string | null;
  evaluated_at: string;
}

export interface ConversationDetail {
  public_id: string;
  agent_id: string;
  agent_name?: string;
  project_id: string;
  platform: Platform;
  started_at: string;
  ended_at: string | null;
  status: ConversationStatus;
  message_count: number;
  messages: Message[];
  evaluation: Evaluation | null;
}

export type Paginated<T> = {
  items: T[];
  next_cursor: string | null;
  total: number;
};
