// DEAD-CODE 2026-06-24: carpeta src/lib/mock/ sin importadores (audit). Verificado:
// 0 imports de "@/lib/mock". Candidato a borrar la carpeta — anotado para tu revisión.
/**
 * Datos mock sembrados de TODO el data model, con IDs y relaciones cruzadas.
 * Fuente de verdad de ejemplo para entender el flujo completo de datos.
 * (La UI usa un subconjunto alineado en src/lib/projects/mock.ts.)
 */
import type {
  Agent,
  AgentPromptVersion,
  Alert,
  ApiKey,
  AuditLog,
  Conversation,
  CreditPurchase,
  CreditTransaction,
  Evaluation,
  Improvement,
  Message,
  Organization,
  OrgMembership,
  Project,
  Upload,
  User,
  WebhookEvent,
} from "./entities";

// ── Organization ──
export const organizations: Organization[] = [
  {
    id: "o1",
    publicId: "org_2k4Rxqz9V8mNp3Yt",
    slug: "pyme-maria",
    name: "Pyme María",
    orgType: "customer",
    billingMode: "prepaid_credits",
    paygEnabled: false,
    stripeCustomerId: "cus_Qabc123",
    whiteLabelConfig: {},
    createdAt: "2026-04-20T10:00:00Z",
  },
];

// ── Users + Memberships ──
export const users: User[] = [
  {
    id: "u1",
    publicId: "usr_4HnP8VxL2bMqK6Yt",
    email: "maria@pymemaria.com",
    emailVerifiedAt: "2026-04-20T10:05:00Z",
    fullName: "María González",
    avatarUrl: null,
    supabaseUserId: "sb_11111111",
    lastLoginAt: "2026-06-16T08:30:00Z",
    createdAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "u2",
    publicId: "usr_7KpQ2WmL9bVnT3Hs",
    email: "jose@pymemaria.com",
    emailVerifiedAt: "2026-04-21T12:00:00Z",
    fullName: "José Crespo",
    avatarUrl: null,
    supabaseUserId: "sb_22222222",
    lastLoginAt: "2026-06-17T22:00:00Z",
    createdAt: "2026-04-21T11:50:00Z",
  },
];

export const memberships: OrgMembership[] = [
  {
    id: "m1",
    userId: "u1",
    orgId: "o1",
    role: "owner",
    allowedProjectIds: null,
    invitedAt: null,
    acceptedAt: "2026-04-20T10:00:00Z",
    createdAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "m2",
    userId: "u2",
    orgId: "o1",
    role: "editor",
    allowedProjectIds: ["p1"],
    invitedAt: "2026-04-21T11:00:00Z",
    acceptedAt: "2026-04-21T11:50:00Z",
    createdAt: "2026-04-21T11:00:00Z",
  },
];

// ── Projects + Agents ──
export const projects: Project[] = [
  {
    id: "p1",
    publicId: "proj_8dJ7Kw2nGfL5HsBp",
    orgId: "o1",
    slug: "bot-ventas-q2",
    name: "Bot Ventas 001",
    description: "Bot de ventas de WhatsApp",
    environment: "live",
    retentionDays: 90,
    alertThresholds: { score_min: 60, frustration_max_pct: 0.15 },
    createdAt: "2026-04-22T09:00:00Z",
  },
  {
    id: "p2",
    publicId: "proj_3MnK9Wp2LfH6Bs8d",
    orgId: "o1",
    slug: "bot-soporte-24h",
    name: "Bot Soporte 24h",
    description: "Soporte automatizado",
    environment: "live",
    retentionDays: 90,
    alertThresholds: { score_min: 55 },
    createdAt: "2026-05-10T14:00:00Z",
  },
];

export const agents: Agent[] = [
  {
    id: "a1",
    publicId: "agt_3NhQp9XmK2vT6jWy",
    projectId: "p1",
    orgId: "o1",
    slug: "ventas-wpp",
    name: "Bot de ventas",
    platform: "wati",
    systemPrompt: "Sos un asistente de ventas de una tienda de ropa…",
    enabled: true,
    createdAt: "2026-04-22T09:10:00Z",
  },
  {
    id: "a2",
    publicId: "agt_6FsK3WhP8mQzL2Yn",
    projectId: "p2",
    orgId: "o1",
    slug: "soporte-wpp",
    name: "Bot de soporte",
    platform: "respondio",
    systemPrompt: "Sos un agente de soporte 24/7…",
    enabled: true,
    createdAt: "2026-05-10T14:10:00Z",
  },
];

export const promptVersions: AgentPromptVersion[] = [
  {
    id: "pv1",
    agentId: "a1",
    version: 1,
    systemPrompt: "v1: Sos un asistente de ventas…",
    changedBy: "u1",
    changeReason: "manual_edit",
    appliedAt: "2026-04-22T09:10:00Z",
  },
  {
    id: "pv2",
    agentId: "a1",
    version: 2,
    systemPrompt: "v2: …ahora ofrecé tomar el pedido por WhatsApp.",
    changedBy: "u2",
    changeReason: "improvement_imp1_applied",
    appliedAt: "2026-06-12T10:00:00Z",
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: "k1",
    publicId: "key_9KfM3WzQ8bVnL5Ht",
    projectId: "p1",
    orgId: "o1",
    name: "Producción",
    prefix: "isy_live_sk_",
    keyLast4: "a3f2",
    environment: "live",
    scope: "full",
    lastUsedAt: "2026-06-16T20:00:00Z",
    createdAt: "2026-04-22T09:20:00Z",
  },
  {
    id: "k2",
    publicId: "key_2BxN7VtL5kRqM9Pj",
    projectId: "p2",
    orgId: "o1",
    name: "Webhook",
    prefix: "isy_live_pk_",
    keyLast4: "9b1c",
    environment: "live",
    scope: "track_only",
    lastUsedAt: null,
    createdAt: "2026-05-10T14:20:00Z",
  },
];

// ── Uploads (CSV) ──
export const uploads: Upload[] = [
  {
    id: "up1",
    publicId: "upload_9KfM3WzQ8bVnL5Ht",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    filename: "conversaciones-mayo.csv",
    sizeBytes: 240_512,
    platform: "wati",
    status: "done",
    rowsTotal: 6,
    rowsProcessed: 6,
    createdAt: "2026-05-28T16:20:00Z",
  },
  {
    id: "up2",
    publicId: "upload_2BxN7VtL5kRqM9Pj",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    filename: "conversaciones-junio.csv",
    sizeBytes: 130_048,
    platform: "wati",
    status: "done",
    rowsTotal: 3,
    rowsProcessed: 3,
    createdAt: "2026-06-10T11:05:00Z",
  },
];

// ── Conversations + Messages + Evaluations ──
export const conversations: Conversation[] = [
  {
    id: "cv1",
    publicId: "conv_5RtY8ZbLmKpN2qHd",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    uploadId: "up1",
    externalId: "5491155550001",
    platform: "wati",
    contactName: "Juan Pérez",
    contactPhone: "+5491155550001",
    startedAt: "2026-05-27T14:30:00Z",
    endedAt: "2026-05-27T14:38:00Z",
    messageCount: 7,
    status: "abandoned",
    phoenixTraceId: "trace_8a1f2c",
    createdAt: "2026-05-28T16:20:00Z",
  },
  {
    id: "cv2",
    publicId: "conv_7HpL4WxQ2bVnK8Yt",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    uploadId: "up1",
    externalId: "5491155550002",
    platform: "wati",
    contactName: "María López",
    contactPhone: "+5491155550002",
    startedAt: "2026-05-27T15:00:00Z",
    endedAt: "2026-05-27T15:05:00Z",
    messageCount: 5,
    status: "completed",
    phoenixTraceId: "trace_3b9e1d",
    createdAt: "2026-05-28T16:20:00Z",
  },
];

export const messages: Message[] = [
  {
    id: "msg1",
    publicId: "msg_1",
    conversationId: "cv1",
    projectId: "p1",
    orgId: "o1",
    role: "user",
    contentRaw: "Hola soy Juan, ¿dónde está mi pedido?",
    contentAnonymized: "Hola soy [NOMBRE_1], ¿dónde está mi pedido?",
    timestamp: "2026-05-27T14:30:00Z",
  },
  {
    id: "msg2",
    publicId: "msg_2",
    conversationId: "cv1",
    projectId: "p1",
    orgId: "o1",
    role: "assistant",
    contentRaw: "Para eso, contactá a soporte.",
    contentAnonymized: "Para eso, contactá a soporte.",
    timestamp: "2026-05-27T14:31:00Z",
  },
  {
    id: "msg3",
    publicId: "msg_3",
    conversationId: "cv1",
    projectId: "p1",
    orgId: "o1",
    role: "user",
    contentRaw: "¿Pero vos no sos soporte?",
    contentAnonymized: "¿Pero vos no sos soporte?",
    timestamp: "2026-05-27T14:32:00Z",
  },
  {
    id: "msg4",
    publicId: "msg_4",
    conversationId: "cv2",
    projectId: "p1",
    orgId: "o1",
    role: "user",
    contentRaw: "Quiero agendar una visita.",
    contentAnonymized: "Quiero agendar una visita.",
    timestamp: "2026-05-27T15:00:00Z",
  },
  {
    id: "msg5",
    publicId: "msg_5",
    conversationId: "cv2",
    projectId: "p1",
    orgId: "o1",
    role: "assistant",
    contentRaw: "¡Claro! Te muestro los horarios disponibles.",
    contentAnonymized: "¡Claro! Te muestro los horarios disponibles.",
    timestamp: "2026-05-27T15:01:00Z",
  },
];

export const evaluations: Evaluation[] = [
  {
    id: "ev1",
    publicId: "eval_4TqM9ZjNbVpX3Lws",
    conversationId: "cv1",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    score: 34,
    resolution: false,
    satisfaction: 1,
    tone: "neutral",
    frustration: true,
    escalated: false,
    efficiency: 2,
    scopeViolation: true,
    topic: "tracking",
    summary:
      "El bot derivó a soporte siendo él el canal. Cliente frustrado, se fue.",
    modelUsed: "claude-haiku-4-5",
    tokensInput: 680,
    tokensOutput: 210,
    costUsd: 0.0011,
    latencyMs: 820,
    phoenixTraceId: "trace_8a1f2c",
    phoenixSpanId: "span_eval_8a1f2c01",
    evaluatedAt: "2026-05-28T16:21:00Z",
  },
  {
    id: "ev2",
    publicId: "eval_6FsK3WhP8mQzL2Yn",
    conversationId: "cv2",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    score: 89,
    resolution: true,
    satisfaction: 5,
    tone: "positive",
    frustration: false,
    escalated: false,
    efficiency: 5,
    scopeViolation: false,
    topic: "agendamiento",
    summary: "Agendó la visita rápido y sin fricción.",
    modelUsed: "claude-haiku-4-5",
    tokensInput: 520,
    tokensOutput: 180,
    costUsd: 0.0009,
    latencyMs: 650,
    phoenixTraceId: "trace_3b9e1d",
    phoenixSpanId: "span_eval_3b9e1d01",
    evaluatedAt: "2026-05-28T16:21:30Z",
  },
];

// ── Optimization Loop ──
export const improvements: Improvement[] = [
  {
    id: "im1",
    publicId: "imp_6FsK3WhP8mQzL2Yn",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    patternDetected: "Checkout fallido derivado a soporte",
    conversationsAffected: 140,
    severity: "high",
    suggestion: "Tomar el pedido por WhatsApp cuando la web falla.",
    promptBefore: "Si hay un problema técnico, contactá soporte.",
    promptAfter:
      "Si no podés comprar en la web, te tomo el pedido acá: producto, talle, dirección y pago.",
    status: "applied",
    scoreBefore: 52,
    scoreAfter: 64,
    createdAt: "2026-06-09T06:00:00Z",
  },
  {
    id: "im2",
    publicId: "imp_2BxN7VtL5kRqM9Pj",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    patternDetected: "Devolución express en loop",
    conversationsAffected: 38,
    severity: "medium",
    suggestion: "Sub-flujo de devoluciones con pasos claros.",
    promptBefore: "—",
    promptAfter: "Motivo → reembolso o cambio → confirmación.",
    status: "pending",
    scoreBefore: null,
    scoreAfter: null,
    createdAt: "2026-06-16T06:00:00Z",
  },
];

export const alerts: Alert[] = [
  {
    id: "al1",
    publicId: "alrt_2BxN7VtL5kRqM9Pj",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    type: "frustration_spike",
    severity: "warning",
    message: "5 conversaciones frustradas en la última hora.",
    readAt: null,
    createdAt: "2026-06-16T11:00:00Z",
  },
  {
    id: "al2",
    publicId: "alrt_9KfM3WzQ8bVnL5Ht",
    projectId: "p1",
    orgId: "o1",
    agentId: "a1",
    type: "score_drop",
    severity: "critical",
    message: "El score bajó de 72 a 58 esta semana.",
    readAt: "2026-06-16T12:00:00Z",
    createdAt: "2026-06-16T06:05:00Z",
  },
];

// ── Operacional ──
export const auditLogs: AuditLog[] = [
  {
    id: "log1",
    orgId: "o1",
    projectId: "p1",
    userId: "u1",
    action: "project.created",
    resourceType: "project",
    resourceId: "p1",
    createdAt: "2026-04-22T09:00:00Z",
  },
  {
    id: "log2",
    orgId: "o1",
    projectId: "p1",
    userId: "u2",
    action: "agent.prompt_updated",
    resourceType: "agent",
    resourceId: "a1",
    createdAt: "2026-06-12T10:00:00Z",
  },
  {
    id: "log3",
    orgId: "o1",
    projectId: "p1",
    userId: "u2",
    action: "improvement.approved",
    resourceType: "improvement",
    resourceId: "im1",
    createdAt: "2026-06-12T09:55:00Z",
  },
];

export const webhookEvents: WebhookEvent[] = [
  {
    id: "wh1",
    projectId: "p1",
    orgId: "o1",
    eventType: "evaluation.completed",
    targetUrl: "https://pymemaria.com/hooks/insyta",
    deliveredAt: "2026-05-28T16:22:00Z",
    responseStatus: 200,
    createdAt: "2026-05-28T16:21:30Z",
  },
  {
    id: "wh2",
    projectId: "p1",
    orgId: "o1",
    eventType: "alert.created",
    targetUrl: "https://pymemaria.com/hooks/insyta",
    deliveredAt: null,
    responseStatus: null,
    createdAt: "2026-06-16T11:00:00Z",
  },
];

// ── Billing pay-as-you-use ──
export const creditPurchases: CreditPurchase[] = [
  {
    id: "cp1",
    publicId: "cpur_9KfM3WzQ8bVnL5Ht",
    orgId: "o1",
    packName: "pro",
    creditsPurchased: 7500,
    amountUsd: 150,
    status: "paid",
    createdAt: "2026-05-01T10:00:00Z",
  },
];

export const creditTransactions: CreditTransaction[] = [
  {
    id: "ct1",
    publicId: "ctxn_1",
    orgId: "o1",
    type: "purchase",
    amount: 7500,
    balanceAfter: 7500,
    referenceType: "purchase",
    referenceId: "cp1",
    description: "Pack Pro",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "ct2",
    publicId: "ctxn_2",
    orgId: "o1",
    type: "consumption",
    amount: -1,
    balanceAfter: 7499,
    referenceType: "evaluation",
    referenceId: "ev1",
    description: "Evaluación conv_5RtY",
    createdAt: "2026-05-28T16:21:00Z",
  },
  {
    id: "ct3",
    publicId: "ctxn_3",
    orgId: "o1",
    type: "consumption",
    amount: -25,
    balanceAfter: 7474,
    referenceType: "optimization",
    referenceId: "im1",
    description: "Optimization Loop (Sonnet)",
    createdAt: "2026-06-09T06:00:00Z",
  },
];

/** Grafo completo agregado. El balance se deriva del ledger. */
export const MOCK_DB = {
  organizations,
  users,
  memberships,
  projects,
  agents,
  promptVersions,
  apiKeys,
  uploads,
  conversations,
  messages,
  evaluations,
  improvements,
  alerts,
  auditLogs,
  webhookEvents,
  creditPurchases,
  creditTransactions,
} as const;

export function creditBalance(orgId: string): number {
  return creditTransactions
    .filter((t) => t.orgId === orgId)
    .reduce((sum, t) => sum + t.amount, 0);
}
