/**
 * Tipos de TODAS las entidades del data model (front-facing, camelCase).
 * Espejo de 04-technical/processes/02_data_model.md. Los datos sembrados con
 * IDs y relaciones cruzadas viven en `data.ts`.
 */

// ── Enums ──
export type OrgType = "customer" | "agency";
export type BillingMode = "prepaid_credits" | "payg" | "hybrid";
export type MemberRole = "owner" | "admin" | "editor" | "viewer";
export type Environment = "live" | "test";
export type Platform =
  | "wati"
  | "respondio"
  | "manychat"
  | "twilio"
  | "custom_sdk";
export type MessageRole = "user" | "assistant" | "system";
export type ConversationStatus =
  | "active"
  | "completed"
  | "abandoned"
  | "escalated";
export type Tone = "positive" | "neutral" | "negative";
export type ImprovementStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "applied"
  | "measured";
export type AlertType =
  | "frustration_spike"
  | "score_drop"
  | "new_topic"
  | "escalation_rate"
  | "abandon_rate"
  | "volume_anomaly";
export type AlertSeverity = "info" | "warning" | "critical";
export type ApiKeyScope = "full" | "track_only" | "read_only";
export type CreditTxnType =
  | "purchase"
  | "consumption"
  | "refund"
  | "adjustment"
  | "expiry"
  | "payg_overage";

// ── Cuentas ──
export type Organization = {
  id: string;
  publicId: string; // org_xxx
  slug: string;
  name: string;
  orgType: OrgType;
  billingMode: BillingMode;
  paygEnabled: boolean;
  stripeCustomerId: string | null;
  whiteLabelConfig: Record<string, unknown>;
  createdAt: string;
};

export type User = {
  id: string;
  publicId: string; // usr_xxx
  email: string;
  emailVerifiedAt: string | null;
  fullName: string;
  avatarUrl: string | null;
  supabaseUserId: string;
  lastLoginAt: string | null;
  createdAt: string;
};

export type OrgMembership = {
  id: string;
  userId: string;
  orgId: string;
  role: MemberRole;
  allowedProjectIds: string[] | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
};

// ── Workspace ──
export type Project = {
  id: string;
  publicId: string; // proj_xxx
  orgId: string;
  slug: string;
  name: string;
  description: string | null;
  environment: Environment;
  retentionDays: number;
  alertThresholds: Record<string, number>;
  createdAt: string;
};

export type Agent = {
  id: string;
  publicId: string; // agt_xxx
  projectId: string;
  orgId: string;
  slug: string;
  name: string;
  platform: Platform;
  systemPrompt: string;
  enabled: boolean;
  createdAt: string;
};

export type AgentPromptVersion = {
  id: string;
  agentId: string;
  version: number;
  systemPrompt: string;
  changedBy: string | null;
  changeReason: string;
  appliedAt: string;
};

export type ApiKey = {
  id: string;
  publicId: string; // key_xxx
  projectId: string;
  orgId: string;
  name: string;
  prefix: string; // isy_live_sk_
  keyLast4: string;
  environment: Environment;
  scope: ApiKeyScope;
  lastUsedAt: string | null;
  createdAt: string;
};

// ── Ingesta ──
export type Upload = {
  id: string;
  publicId: string; // upload_xxx
  projectId: string;
  orgId: string;
  agentId: string;
  filename: string;
  sizeBytes: number;
  platform: Platform;
  status: "pending" | "processing" | "done" | "failed";
  rowsTotal: number;
  rowsProcessed: number;
  createdAt: string;
};

export type Conversation = {
  id: string;
  publicId: string; // conv_xxx
  projectId: string;
  orgId: string;
  agentId: string;
  uploadId: string | null;
  externalId: string;
  platform: Platform;
  contactName: string | null; // se muestra, nunca al LLM
  contactPhone: string | null;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
  status: ConversationStatus;
  phoenixTraceId: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  publicId: string; // msg_xxx
  conversationId: string;
  projectId: string;
  orgId: string;
  role: MessageRole;
  contentRaw: string; // real, nunca al LLM
  contentAnonymized: string; // lo que ve el LLM
  timestamp: string;
};

export type Evaluation = {
  id: string;
  publicId: string; // eval_xxx
  conversationId: string;
  projectId: string;
  orgId: string;
  agentId: string;
  score: number;
  resolution: boolean;
  satisfaction: number; // 1-5
  tone: Tone;
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
  phoenixTraceId: string | null;
  phoenixSpanId: string | null;
  evaluatedAt: string;
};

// ── Optimization Loop ──
export type Improvement = {
  id: string;
  publicId: string; // imp_xxx
  projectId: string;
  orgId: string;
  agentId: string;
  patternDetected: string;
  conversationsAffected: number;
  severity: "low" | "medium" | "high" | "critical";
  suggestion: string;
  promptBefore: string;
  promptAfter: string;
  status: ImprovementStatus;
  scoreBefore: number | null;
  scoreAfter: number | null;
  createdAt: string;
};

export type Alert = {
  id: string;
  publicId: string; // alrt_xxx
  projectId: string;
  orgId: string;
  agentId: string | null;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  readAt: string | null;
  createdAt: string;
};

// ── Operacional ──
export type AuditLog = {
  id: string;
  orgId: string;
  projectId: string | null;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
};

export type WebhookEvent = {
  id: string;
  projectId: string;
  orgId: string;
  eventType: string;
  targetUrl: string;
  deliveredAt: string | null;
  responseStatus: number | null;
  createdAt: string;
};

// ── Billing pay-as-you-use ──
export type CreditTransaction = {
  id: string;
  publicId: string; // ctxn_xxx
  orgId: string;
  type: CreditTxnType;
  amount: number; // + compra | - consumo
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string;
  createdAt: string;
};

export type CreditPurchase = {
  id: string;
  publicId: string; // cpur_xxx
  orgId: string;
  packName: "mini" | "pro" | "scale" | "custom";
  creditsPurchased: number;
  amountUsd: number;
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
};
