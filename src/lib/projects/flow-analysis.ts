/**
 * Análisis heurístico de un flujo Langflow (client-side, sin LLM).
 * Lee el JSON exportado (data.nodes/edges) y propone sugerencias estructurales:
 * agregar un agente, un router/condición, conectar nodos sueltos, etc.
 *
 * No reemplaza al judge — es una primera capa que funciona sin API key.
 */

export type FlowSuggestionKind = "agent" | "condition" | "structure" | "io";
export type FlowSuggestionSeverity = "info" | "warning";

export type FlowSuggestion = {
  kind: FlowSuggestionKind;
  title: string;
  detail: string;
  severity: FlowSuggestionSeverity;
};

type LangNode = {
  id?: string;
  type?: string;
  data?: {
    id?: string;
    type?: string;
    node?: { display_name?: string };
  };
};

type LangEdge = { source?: string; target?: string };

function nodeLabel(n: LangNode): string {
  return (
    n.data?.node?.display_name ||
    n.data?.type ||
    n.type ||
    n.data?.id ||
    n.id ||
    ""
  );
}

const RE_AGENT = /agent|assistant|llm|model/i;
const RE_ROUTER = /router|supervis|condition|if|switch|branch|route|clasif/i;
const RE_INPUT = /chat\s*input|input|trigger|webhook/i;
const RE_OUTPUT = /chat\s*output|output|response|respuesta|reply/i;

export type FlowStats = {
  nodeCount: number;
  edgeCount: number;
  agentCount: number;
  hasRouter: boolean;
  hasInput: boolean;
  hasOutput: boolean;
  isolated: string[];
};

export function analyzeFlow(jsonString: string): {
  stats: FlowStats;
  suggestions: FlowSuggestion[];
} {
  let parsed: { data?: { nodes?: LangNode[]; edges?: LangEdge[] } } = {};
  try {
    parsed = JSON.parse(jsonString || "{}");
  } catch {
    return {
      stats: {
        nodeCount: 0,
        edgeCount: 0,
        agentCount: 0,
        hasRouter: false,
        hasInput: false,
        hasOutput: false,
        isolated: [],
      },
      suggestions: [
        {
          kind: "structure",
          title: "JSON no parseable",
          detail: "No se pudo leer el flujo para analizarlo.",
          severity: "warning",
        },
      ],
    };
  }

  const data = parsed.data ?? {};
  const nodes = data.nodes ?? [];
  const edges = data.edges ?? [];

  let agentCount = 0;
  let hasRouter = false;
  let hasInput = false;
  let hasOutput = false;
  for (const n of nodes) {
    const label = nodeLabel(n);
    if (RE_AGENT.test(label)) agentCount += 1;
    if (RE_ROUTER.test(label)) hasRouter = true;
    if (RE_INPUT.test(label)) hasInput = true;
    if (RE_OUTPUT.test(label)) hasOutput = true;
  }

  // Nodos sin ninguna arista conectada.
  const connected = new Set<string>();
  for (const e of edges) {
    if (e.source) connected.add(e.source);
    if (e.target) connected.add(e.target);
  }
  const isolated = nodes
    .map((n) => n.id || n.data?.id || "")
    .filter((id) => id && !connected.has(id) && nodes.length > 1);

  const stats: FlowStats = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    agentCount,
    hasRouter,
    hasInput,
    hasOutput,
    isolated,
  };

  const suggestions: FlowSuggestion[] = [];

  if (agentCount <= 1) {
    suggestions.push({
      kind: "agent",
      title: "Considerá especializar en más de un agente",
      detail:
        "El flujo resuelve todo con un solo agente. Separar por dominio " +
        "(ventas, soporte, postventa) suele subir la tasa de resolución y bajar " +
        "respuestas fuera de scope.",
      severity: "info",
    });
  }

  if (!hasRouter && agentCount >= 2) {
    suggestions.push({
      kind: "condition",
      title: "Agregá un router / condición",
      detail:
        "Hay varios agentes pero ningún nodo de ruteo o condición que decida a " +
        "cuál derivar según el tema. Un supervisor/router evita que el mensaje " +
        "caiga en el agente equivocado.",
      severity: "warning",
    });
  }

  if (!hasRouter && agentCount <= 1 && nodes.length > 0) {
    suggestions.push({
      kind: "condition",
      title: "Sin lógica de ramificación",
      detail:
        "El flujo es lineal: no hay condiciones que cambien el camino según el " +
        "caso (ej. derivar a humano, pedir datos faltantes). Una condición puede " +
        "manejar los casos borde.",
      severity: "info",
    });
  }

  if (!hasInput) {
    suggestions.push({
      kind: "io",
      title: "No se detecta nodo de entrada",
      detail:
        "No hay un Chat Input / trigger claro. Verificá por dónde entra el " +
        "mensaje del usuario.",
      severity: "warning",
    });
  }

  if (!hasOutput) {
    suggestions.push({
      kind: "io",
      title: "No se detecta nodo de respuesta",
      detail:
        "No hay un Chat Output / Response explícito. Asegurate de que el flujo " +
        "devuelva algo al usuario.",
      severity: "warning",
    });
  }

  if (isolated.length > 0) {
    suggestions.push({
      kind: "structure",
      title: `${isolated.length} nodo(s) sin conectar`,
      detail:
        "Hay nodos que no tienen ninguna conexión (entrada o salida). " +
        "Probablemente no se ejecutan; conectalos o eliminalos.",
      severity: "warning",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      kind: "structure",
      title: "Estructura sólida",
      detail:
        "El flujo tiene entrada, ruteo, agentes y salida. No se detectan huecos " +
        "estructurales evidentes — afinalo con las mejoras de las auditorías.",
      severity: "info",
    });
  }

  return { stats, suggestions };
}
