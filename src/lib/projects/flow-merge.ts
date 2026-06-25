/**
 * Mergea el nodo sugerido por el judge dentro del JSON completo del flujo
 * Langflow, para poder copiar el flujo "nuevo" listo para pegar en el builder.
 *
 * El snippet (`nodeJson`) puede venir en varias formas (un nodo completo, un
 * `{nodes,edges}`, o solo el `data` del nodo); lo normalizamos a nodos Langflow
 * válidos (con id + position) y los agregamos a `data.nodes`. Los edges del
 * snippet (si trae) se suman; el cableado fino se hace después en el builder.
 */

type LangNode = {
  id?: string;
  type?: string;
  position?: { x?: number; y?: number };
  data?: Record<string, unknown>;
  [k: string]: unknown;
};

function _rand(): string {
  // id estable-ish para el nodo nuevo (no necesita crypto).
  return Math.floor(Math.random() * 1e8).toString(36);
}

function _nodeName(n: LangNode): string {
  const data = (n.data ?? {}) as Record<string, unknown>;
  const inner = (data.node ?? {}) as Record<string, unknown>;
  return (
    (inner.display_name as string) ||
    (data.type as string) ||
    (n.type as string) ||
    "Custom"
  );
}

function _normalizeNode(raw: LangNode, x: number, y: number): LangNode {
  // Si ya parece un nodo Langflow (tiene data), respetamos; si no, envolvemos.
  let node: LangNode;
  if (raw.data && typeof raw.data === "object") {
    node = { ...raw };
  } else if ((raw as Record<string, unknown>).node || raw.type) {
    // viene como el "data" del nodo
    node = { data: raw as Record<string, unknown> };
  } else {
    node = { data: raw as Record<string, unknown> };
  }
  const baseType =
    ((node.data as Record<string, unknown>)?.type as string) || "Custom";
  if (!node.id) node.id = `${baseType}-${_rand()}`;
  if (!node.type) node.type = "genericNode";
  if (!node.position || typeof node.position !== "object")
    node.position = { x, y };
  return node;
}

export type MergeResult = { json: string; added: string[] };

export function mergeNodeIntoFlow(
  flowJson: string,
  nodeJson: string,
): MergeResult {
  const flow = JSON.parse(flowJson);
  const data = (flow.data ?? flow) as Record<string, unknown>;
  if (!Array.isArray(data.nodes)) data.nodes = [];
  if (!Array.isArray(data.edges)) data.edges = [];
  const nodes = data.nodes as LangNode[];
  const edges = data.edges as unknown[];

  const snippet = JSON.parse(nodeJson);

  // Posición: a la derecha del nodo más a la derecha.
  const maxX = nodes.reduce(
    (m, n) => Math.max(m, Number(n.position?.x ?? 0)),
    0,
  );
  let nextX = maxX + 320;

  // Extraer nodos + edges del snippet según su forma.
  let rawNodes: LangNode[] = [];
  let rawEdges: unknown[] = [];
  if (Array.isArray(snippet.nodes)) {
    rawNodes = snippet.nodes as LangNode[];
    if (Array.isArray(snippet.edges)) rawEdges = snippet.edges;
  } else if (Array.isArray(snippet)) {
    rawNodes = snippet as LangNode[];
  } else {
    rawNodes = [snippet as LangNode];
  }

  const added: string[] = [];
  for (const raw of rawNodes) {
    const node = _normalizeNode(raw, nextX, 200);
    nodes.push(node);
    added.push(_nodeName(node));
    nextX += 320;
  }
  for (const e of rawEdges) edges.push(e);

  return { json: JSON.stringify(flow, null, 2), added };
}
