import type {
  Audit,
  ChatMessage,
  Conversation,
  ConversationEvaluation,
  EmphasisOption,
  Flujo,
  FlujoImprovement,
  FlujoRun,
  Report,
  RunStep,
  Satisfaction,
  Suggestion,
  UploadGroup,
} from "./types";

/**
 * Datos mock para el detalle del proyecto.
 *
 * TODO(api): reemplazar por datos reales del backend (parseo de CSV, flujos
 * subidos, auditorías corridas con LLM). Acá todo es estático para poder
 * construir y navegar la UI.
 */

// ── Flujos ──

const SAMPLE_JSON = JSON.stringify(
  {
    name: "Bot Ventas",
    version: "1.4.0",
    entrypoint: "supervisor",
    agents: [
      {
        id: "supervisor",
        role: "router",
        routes: ["ventas", "soporte", "pagos"],
      },
      { id: "ventas", model: "claude-haiku-4-5", tools: ["catalogo", "stock"] },
      {
        id: "soporte",
        model: "claude-haiku-4-5",
        tools: ["tracking", "devoluciones"],
      },
      { id: "pagos", model: "claude-haiku-4-5", tools: ["mercadopago"] },
    ],
    fallback: { escalate_to_human: true, after_idle_minutes: 30 },
  },
  null,
  2,
);

export const SAMPLE_FLUJOS: Flujo[] = [
  {
    id: "flj_ventas_v14",
    name: "Bot Ventas",
    version: "1.4.0",
    sizeBytes: 184_320,
    agentCount: 4,
    createdAt: "2026-05-28T14:00:00Z",
    json: SAMPLE_JSON,
  },
  {
    id: "flj_soporte_v09",
    name: "Bot Soporte 24h",
    version: "0.9.2",
    sizeBytes: 96_240,
    agentCount: 3,
    createdAt: "2026-06-02T10:30:00Z",
    json: SAMPLE_JSON,
  },
];

// ── Conversaciones (lo que saldría de parsear un CSV) ──

type RawConversation = Omit<
  Conversation,
  | "uploadGroupId"
  | "pinned"
  | "userMessages"
  | "botMessages"
  | "messages"
  | "evaluation"
>;

const RAW_CONVERSATIONS: RawConversation[] = [
  {
    id: "c1",
    externalId: "5491155550001",
    contactName: "Juan Pérez",
    preview: "¿Dónde está mi pedido? El bot derivó a soporte.",
    messageCount: 7,
    score: 34,
    satisfaction: "insatisfecho",
    resolved: false,
    selected: true,
  },
  {
    id: "c2",
    externalId: "5491155550002",
    contactName: "María López",
    preview: "Quería agendar una visita, todo perfecto.",
    messageCount: 5,
    score: 89,
    satisfaction: "satisfecho",
    resolved: true,
    selected: true,
  },
  {
    id: "c3",
    externalId: "5491155550003",
    contactName: "Carlos Gómez",
    preview: "Consulta de precio de la remera negra talle L.",
    messageCount: 4,
    score: 76,
    satisfaction: "neutral",
    resolved: true,
    selected: true,
  },
  {
    id: "c4",
    externalId: "5491155550004",
    contactName: "Ana Torres",
    preview: "No pude completar la compra, me dio error y se fue.",
    messageCount: 9,
    score: 28,
    satisfaction: "insatisfecho",
    resolved: false,
    selected: true,
  },
  {
    id: "c5",
    externalId: "5491155550005",
    contactName: "Diego Ruiz",
    preview: "Pidió cambio de talle, resuelto rápido.",
    messageCount: 6,
    score: 82,
    satisfaction: "satisfecho",
    resolved: true,
    selected: true,
  },
  {
    id: "c6",
    externalId: "5491155550006",
    contactName: "Lucía Fernández",
    preview: "Pregunta sobre envío a Córdoba, respuesta genérica.",
    messageCount: 5,
    score: 58,
    satisfaction: "neutral",
    resolved: true,
    selected: true,
  },
  {
    id: "c7",
    externalId: "5491155550007",
    contactName: "Pedro Sánchez",
    preview: "Reclamo por producto fallado, el bot no supo qué hacer.",
    messageCount: 11,
    score: 22,
    satisfaction: "insatisfecho",
    resolved: false,
    selected: true,
  },
  {
    id: "c8",
    externalId: "5491155550008",
    contactName: "Sofía Díaz",
    preview: "Compró 2 productos, upsell exitoso.",
    messageCount: 8,
    score: 94,
    satisfaction: "satisfecho",
    resolved: true,
    selected: true,
  },
  {
    id: "c9",
    externalId: "5491155550009",
    contactName: "Martín Castro",
    preview: "Tracking del pedido, dio el link correcto.",
    messageCount: 3,
    score: 71,
    satisfaction: "neutral",
    resolved: true,
    selected: true,
  },
  {
    id: "c10",
    externalId: "5491155550010",
    contactName: "Valentina Romero",
    preview: "Devolución express, el bot derivó en loop.",
    messageCount: 10,
    score: 31,
    satisfaction: "insatisfecho",
    resolved: false,
    selected: true,
  },
  {
    id: "c11",
    externalId: "5491155550011",
    contactName: "Tomás Herrera",
    preview: "Consulta de horarios, OK.",
    messageCount: 2,
    score: 80,
    satisfaction: "satisfecho",
    resolved: true,
    selected: true,
  },
  {
    id: "c12",
    externalId: "5491155550012",
    contactName: "Camila Vega",
    preview: "Preguntó por descuento Black Friday, no estaba cargado.",
    messageCount: 6,
    score: 45,
    satisfaction: "insatisfecho",
    resolved: false,
    selected: true,
  },
];

const USER_LINES = [
  "No me quedó claro, ¿me lo explicás?",
  "¿Y si eso no funciona?",
  "Pero eso no me ayuda…",
  "¿Hay otra opción?",
  "Ok, gracias.",
];

const BOT_LINES = [
  "¡Hola! Claro, ¿en qué te puedo ayudar?",
  "Te paso la información enseguida.",
  "Para eso, te recomiendo contactar a soporte.",
  "Entiendo, dejame revisar…",
  "¿Hay algo más en lo que pueda ayudarte?",
];

/**
 * Genera un transcript mock de `messageCount` turnos con horarios.
 * El primer mensaje (usuario) es el preview; los horarios arrancan en una base
 * por conversación y avanzan ~75s por mensaje (como vendrían del CSV).
 */
function buildMessages(c: RawConversation, index: number): ChatMessage[] {
  const start = Date.parse("2026-06-10T09:00:00-03:00") + index * 1_800_000;
  const out: ChatMessage[] = [];
  for (let i = 0; i < c.messageCount; i += 1) {
    const isBot = i % 2 === 1;
    const content =
      i === 0 ? c.preview : (isBot ? BOT_LINES : USER_LINES)[i % 5];
    out.push({
      role: isBot ? "bot" : "user",
      content,
      at: new Date(start + i * 75_000).toISOString(),
    });
  }
  return out;
}

const SAT_TO_NUM = { satisfecho: 5, neutral: 3, insatisfecho: 2 } as const;
const SAT_TO_TONE = {
  satisfecho: "positive",
  neutral: "neutral",
  insatisfecho: "negative",
} as const;

/** Deriva el reporte de evaluación (lo medido + trace) de una conversación. */
function buildEvaluation(
  c: RawConversation,
  index: number,
): ConversationEvaluation {
  const sat = c.satisfaction ?? "neutral";
  const hex = (index + 10).toString(16).padStart(6, "0");
  return {
    resolution: c.resolved ?? false,
    satisfaction: SAT_TO_NUM[sat],
    tone: SAT_TO_TONE[sat],
    frustration: sat === "insatisfecho",
    escalated: c.resolved === false && index % 2 === 0,
    efficiency: Math.max(1, Math.min(5, Math.round(6 - c.messageCount / 3))),
    scopeViolation: sat === "insatisfecho" && index % 3 === 0,
    topic: c.preview.split(" ").slice(0, 2).join(" ").toLowerCase(),
    summary: c.preview,
    modelUsed: "claude-haiku-4-5",
    tokensInput: 400 + c.messageCount * 60,
    tokensOutput: 120 + c.messageCount * 25,
    costUsd: Number((0.0008 + c.messageCount * 0.00005).toFixed(5)),
    latencyMs: 600 + index * 30,
    phoenixTraceId: `trace_${hex}`,
    phoenixSpanId: `span_eval_${hex}`,
    evaluatedAt: new Date(
      Date.parse("2026-06-10T09:00:00-03:00") + index * 1_800_000 + 600_000,
    ).toISOString(),
  };
}

// ── Metadata de cada CSV cargado + rango de conversaciones que aporta ──
// (el backend real las relaciona por upload_id; acá lo derivamos por índice)

export type CsvGroupMeta = {
  id: string;
  projectName: string;
  filename: string;
  loadedAt: string; // ISO date de la carga
  accent: string; // HSL triplet para identificar el CSV por color
  range: readonly [number, number]; // [from, to) sobre RAW_CONVERSATIONS
};

export const CSV_GROUPS: CsvGroupMeta[] = [
  {
    id: "up_ventas_mayo",
    projectName: "Bot Ventas 001",
    filename: "conversaciones-mayo.csv",
    loadedAt: "2026-05-28T16:20:00Z",
    accent: "137 72% 66%", // verde de marca
    range: [0, 6],
  },
  {
    id: "up_ventas_junio",
    projectName: "Bot Ventas 001",
    filename: "conversaciones-junio.csv",
    loadedAt: "2026-06-10T11:05:00Z",
    accent: "165 58% 45%", // teal (familia verde)
    range: [6, 9],
  },
  {
    id: "up_soporte_junio",
    projectName: "Bot Soporte 24h",
    filename: "soporte-junio.csv",
    loadedAt: "2026-06-12T09:40:00Z",
    accent: "210 55% 52%", // azul charcoal aclarado (familia 215)
    range: [9, 12],
  },
];

function groupIdForIndex(index: number): string {
  const group = CSV_GROUPS.find(
    ({ range }) => index >= range[0] && index < range[1],
  );
  return group?.id ?? CSV_GROUPS[0].id;
}

export const SAMPLE_CONVERSATIONS: Conversation[] = RAW_CONVERSATIONS.map(
  (c, index) => {
    const messages = buildMessages(c, index);
    return {
      ...c,
      uploadGroupId: groupIdForIndex(index),
      pinned: false,
      messages,
      userMessages: messages.filter((m) => m.role === "user").length,
      botMessages: messages.filter((m) => m.role === "bot").length,
      evaluation: buildEvaluation(c, index),
    };
  },
);

// ── Grupos de CSV cargados (vista /conversations) ──

export const SAMPLE_UPLOAD_GROUPS: UploadGroup[] = CSV_GROUPS.map((g) => ({
  id: g.id,
  projectName: g.projectName,
  filename: g.filename,
  loadedAt: g.loadedAt,
  conversations: SAMPLE_CONVERSATIONS.slice(g.range[0], g.range[1]),
}));

// ── Énfasis para la auditoría ──

export const EMPHASIS_OPTIONS: EmphasisOption[] = [
  { key: "resolucion", label: "Resolución" },
  { key: "tono", label: "Tono" },
  { key: "frustracion", label: "Frustración" },
  { key: "escalacion", label: "Escalación a humano" },
  { key: "tiempo", label: "Tiempo de respuesta" },
  { key: "scope", label: "Dentro de scope" },
  { key: "upsell", label: "Oportunidades de venta" },
];

// ── Sugerencias de mejora del flujo ──

const SAMPLE_SUGGESTIONS: Suggestion[] = [
  {
    title: "Tomar el pedido por WhatsApp cuando la web falla",
    detail:
      "El 28% de las conversaciones de checkout fallan porque el bot deriva a 'soporte' siendo él mismo el canal. Agregar al prompt: si el cliente no puede comprar en la web, pedir producto, talle, dirección y forma de pago, y enviar link de MercadoPago.",
    impact: "+12% satisfacción estimada · ~140 conv/mes",
  },
  {
    title: "Manejar la objeción de devolución express",
    detail:
      "Las devoluciones entran en loop de derivación. Definir un sub-flujo de devoluciones con pasos claros (motivo → opción de reembolso o cambio → confirmación).",
    impact: "+8% resolución en devoluciones",
  },
  {
    title: "Sincronizar promociones activas",
    detail:
      "Conversaciones sobre 'descuento Black Friday' quedaron sin responder porque la promo no estaba en el contexto del agente. Inyectar las promos vigentes en el system prompt.",
    impact: "Evita ~45 conv/mes sin respuesta",
  },
];

// ── Construcción del reporte a partir de las conversaciones seleccionadas ──

export function buildReport(conversations: Conversation[]): Report {
  const satisfaction: Record<Satisfaction, number> = {
    satisfecho: 0,
    neutral: 0,
    insatisfecho: 0,
  };
  for (const c of conversations) {
    if (c.satisfaction) satisfaction[c.satisfaction] += 1;
  }
  return {
    total: conversations.length,
    satisfaction,
    failing: conversations.filter((c) => c.resolved === false),
    conversations,
    suggestions: SAMPLE_SUGGESTIONS,
  };
}

// ── Auditorías sembradas (para que el historial/reporte aparezca cargado) ──

export const SAMPLE_AUDITS: Audit[] = [
  {
    id: "aud_seed1",
    name: "Auditoría 28 may 2026",
    flujoId: "flj_ventas_v14",
    flujoName: "Bot Ventas",
    conversationCount: SAMPLE_CONVERSATIONS.length,
    evaluatedCount: SAMPLE_CONVERSATIONS.length,
    emphasis: ["resolucion", "frustracion"],
    freeText: "Foco en por qué se pierden ventas en checkout.",
    createdAt: "2026-05-28T17:00:00Z",
    status: "active",
    errorMessage: null,
    report: buildReport(SAMPLE_CONVERSATIONS),
  },
];

// ── Mejoras por flujo (vista /improvements) ──

function convsById(...ids: string[]): Conversation[] {
  return SAMPLE_CONVERSATIONS.filter((c) => ids.includes(c.id));
}

/** Mock: el backend analiza el flujo y devuelve mejoras con su justificación. */
export const FLUJO_IMPROVEMENTS: FlujoImprovement[] = [
  {
    title: "Tomar el pedido por WhatsApp cuando la web falla",
    detail:
      "Cuando el cliente no puede comprar en la web, ofrecé tomar el pedido por WhatsApp (producto, talle, dirección, pago) y enviá el link de MercadoPago, en vez de derivar a soporte.",
    impact: "+12% satisfacción estimada · ~140 conv/mes",
    why: "El 28% de las conversaciones de checkout terminan sin compra porque el bot deriva a 'soporte' siendo él mismo el canal (loop).",
    conversations: convsById("c1", "c4"),
  },
  {
    title: "Sub-flujo de devolución express",
    detail:
      "Definí un sub-flujo de devoluciones con pasos claros: motivo → reembolso o cambio → confirmación. Hoy entra en loop de derivación.",
    impact: "+8% resolución en devoluciones",
    why: "Las conversaciones de devolución tienen 0% de resolución y alta frustración: el agente no sabe cómo proceder.",
    conversations: convsById("c10", "c7"),
  },
  {
    title: "Inyectar promociones vigentes en el contexto",
    detail:
      "Cargá las promos activas en el system prompt para que el agente pueda responder sobre descuentos sin quedar mudo.",
    impact: "Evita ~45 conv/mes sin respuesta",
    why: "Conversaciones sobre 'descuento Black Friday' quedaron sin responder porque la promo no estaba en el contexto del agente.",
    conversations: convsById("c12"),
  },
];

// ── Playground: correr el flujo con mensajes inventados ──

export const TEST_CASES = [
  {
    id: "t1",
    label: "Tracking de pedido",
    message: "Hola, ¿dónde está mi pedido?",
  },
  {
    id: "t2",
    label: "Compra",
    message: "Quiero comprar la remera negra talle L",
  },
  {
    id: "t3",
    label: "Pago fallido",
    message: "No puedo pagar, me da error en la tarjeta",
  },
  {
    id: "t4",
    label: "Devolución",
    message: "Quiero devolver un producto que compré",
  },
  {
    id: "t5",
    label: "Reclamo",
    message: "El producto vino fallado, ¿qué hago?",
  },
] as const;

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Mock: corre el flujo sobre un mensaje y devuelve los pasos que dio. */
export function runFlujo(message: string): FlujoRun {
  const t = message.toLowerCase();

  // Routing por keywords + qué rutas fallan (los "problemas").
  let route = "ventas";
  let resolved = true;
  let response = "Te ayudo con eso ahora mismo.";

  if (/pedido|tracking|d[oó]nde est[aá]/.test(t)) {
    route = "soporte";
    resolved = false;
    response = "Para eso contactá a soporte.";
  } else if (/comprar|precio|talle|remera|producto/.test(t)) {
    route = "ventas";
    response = "¡Genial! Te paso el link de pago de MercadoPago.";
  } else if (/pagar|pago|tarjeta|mercadopago|cobr/.test(t)) {
    route = "pagos";
    response = "Reintentá el pago con este link nuevo.";
  } else if (/devolver|devoluci[oó]n|reembolso|cambio/.test(t)) {
    route = "soporte";
    resolved = false;
    response = "Contactá a soporte para devoluciones.";
  } else if (/reclamo|fallado|roto|defect/.test(t)) {
    route = "soporte";
    resolved = false;
    response = "No estoy seguro, contactá a soporte.";
  }

  const steps: RunStep[] = [
    {
      node: "Chat Input",
      detail: `Recibe el mensaje del usuario`,
      status: "ok",
    },
    {
      node: "Supervisor · router",
      detail: `Clasifica el tema y rutea al agente "${route}"`,
      status: "ok",
    },
    {
      node: `Agente ${cap(route)}`,
      detail: resolved
        ? "Resuelve la consulta con sus tools."
        : "Deriva a 'soporte' sin resolver (loop / fuera de scope).",
      status: resolved ? "ok" : "warning",
    },
    {
      node: "Response",
      detail: `Responde: "${response}"`,
      status: resolved ? "ok" : "warning",
    },
  ];

  return {
    input: message,
    route,
    steps,
    resolved,
    response,
    predictedSatisfaction: resolved ? "satisfecho" : "insatisfecho",
  };
}

// ── Generadores de id (cliente) ──

export function makeFlujoId(): string {
  return `flj_${Math.random().toString(36).slice(2, 10)}`;
}

export function makeAuditId(): string {
  return `aud_${Math.random().toString(36).slice(2, 10)}`;
}

export type { Audit };
