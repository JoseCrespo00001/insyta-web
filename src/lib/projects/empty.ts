import type { Conversation, ConversationEvaluation } from "./types";

/** Evaluation "vacía" — placeholder hasta que el judge corra (o el detalle real
 * la complete vía /conversations/{id}). */
export const EMPTY_EVAL: ConversationEvaluation = {
  resolution: false,
  satisfaction: 0,
  tone: "neutral",
  frustration: false,
  escalated: false,
  efficiency: 0,
  scopeViolation: false,
  topic: "",
  summary: "",
  modelUsed: "",
  tokensInput: 0,
  tokensOutput: 0,
  costUsd: 0,
  latencyMs: 0,
  phoenixTraceId: "",
  phoenixSpanId: "",
  evaluatedAt: "",
};

/** Construye una Conversation a partir de datos mínimos (id + cabecera). El
 * transcript y la evaluation se hidratan en ConversationWorkspace vía
 * useConversation(id), así sirve para abrir desde reportes/mejoras. */
export function makeConversationStub(partial: {
  id: string;
  externalId?: string | null;
  contactName?: string | null;
  preview?: string | null;
  score?: number | null;
}): Conversation {
  return {
    id: partial.id,
    uploadGroupId: "",
    externalId: partial.externalId ?? "",
    contactName: partial.contactName ?? "—",
    preview: partial.preview ?? "",
    messageCount: 0,
    userMessages: 0,
    botMessages: 0,
    messages: [],
    score: partial.score ?? null,
    satisfaction: null,
    resolved: null,
    evaluation: EMPTY_EVAL,
    selected: false,
    pinned: false,
  };
}
