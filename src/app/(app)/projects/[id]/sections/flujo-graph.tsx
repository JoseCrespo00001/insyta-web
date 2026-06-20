"use client";

import * as React from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Flujo } from "@/lib/projects/types";

const TYPE_ACCENT: Record<string, string> = {
  Agent: "hsl(137 72% 66%)",
  ChatInput: "hsl(199 89% 60%)",
  ChatOutput: "hsl(199 89% 60%)",
  Prompt: "hsl(259 80% 70%)",
  ConditionalRouter: "hsl(41 96% 60%)",
  IfElse: "hsl(41 96% 60%)",
};

// Campos del template de Langflow que vale la pena mostrar en el nodo.
const SHOWN_FIELDS = [
  "template",
  "system_prompt",
  "input_value",
  "model_name",
  "agent_llm",
  "match_text",
  "operator",
  "input_text",
];

type LFField = { value?: unknown; display_name?: string };
type RawNode = {
  id?: string;
  position?: { x?: number; y?: number };
  data?: {
    type?: string;
    node?: {
      display_name?: string;
      description?: string;
      template?: Record<string, LFField>;
    };
  };
};
type RawEdge = { id?: string; source?: string; target?: string };

type LFNodeData = {
  title: string;
  type: string;
  accent?: string;
  description?: string;
  fields: { label: string; value: string }[];
};

function extractFields(
  template?: Record<string, LFField>,
): LFNodeData["fields"] {
  if (!template) return [];
  const out: LFNodeData["fields"] = [];
  for (const key of SHOWN_FIELDS) {
    const f = template[key];
    const v = f?.value;
    if (typeof v === "string" && v.trim()) {
      out.push({
        label: f?.display_name || key,
        value: v.length > 220 ? `${v.slice(0, 220)}…` : v,
      });
    }
  }
  return out;
}

function LangflowNode({ data }: NodeProps) {
  const d = data as unknown as LFNodeData;
  return (
    <div
      className="rounded-xl border bg-[hsl(217_33%_12%)] text-white shadow-md"
      style={{ width: 300, borderColor: d.accent ?? "hsl(215 40% 22%)" }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: d.accent ?? "hsl(215 40% 40%)" }}
        />
        <span className="text-sm font-semibold">{d.title}</span>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
          {d.type}
        </span>
      </div>
      <div className="space-y-2 px-3 py-2">
        {d.description ? (
          <p className="text-[11px] leading-snug text-white/50">
            {d.description}
          </p>
        ) : null}
        {d.fields.length === 0 ? (
          <p className="text-[11px] text-white/40">Sin parámetros visibles.</p>
        ) : (
          d.fields.map((f) => (
            <div key={f.label} className="space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
                {f.label}
              </p>
              <p className="whitespace-pre-wrap break-words text-[11px] leading-snug text-white/80">
                {f.value}
              </p>
            </div>
          ))
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { lf: LangflowNode };

function buildGraph(jsonStr: string): { nodes: Node[]; edges: Edge[] } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return null;
  }
  const root = parsed as { data?: { nodes?: RawNode[]; edges?: RawEdge[] } };
  const data =
    root.data ?? (parsed as { nodes?: RawNode[]; edges?: RawEdge[] });
  const rawNodes = data?.nodes;
  if (!Array.isArray(rawNodes) || rawNodes.length === 0) return null;

  const nodes: Node[] = rawNodes.map((n, i) => {
    const type = n.data?.type ?? "Node";
    const nodeData: LFNodeData = {
      title: n.data?.node?.display_name ?? type,
      type,
      accent: TYPE_ACCENT[type],
      description: n.data?.node?.description,
      fields: extractFields(n.data?.node?.template),
    };
    return {
      id: n.id ?? `n${i}`,
      type: "lf",
      position: { x: n.position?.x ?? i * 360, y: n.position?.y ?? 0 },
      data: nodeData as unknown as Record<string, unknown>,
    };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: Edge[] = (data?.edges ?? [])
    .filter(
      (e) =>
        e.source && e.target && nodeIds.has(e.source) && nodeIds.has(e.target),
    )
    .map((e, i) => ({
      id: e.id ?? `e${i}`,
      source: e.source!,
      target: e.target!,
      animated: true,
      style: { stroke: "hsl(215 40% 45%)", strokeWidth: 1.5 },
    }));

  return { nodes, edges };
}

export function FlujoGraph({ flujo }: { flujo: Flujo }) {
  const graph = React.useMemo(() => buildGraph(flujo.json ?? ""), [flujo.json]);

  if (!graph) {
    return (
      <div className="flex h-[78vh] w-full items-center justify-center rounded-md border bg-[hsl(215_100%_5%)] text-sm text-muted-foreground">
        No se pudo leer el grafo del flujo (JSON sin nodos).
      </div>
    );
  }

  return (
    <div className="h-[78vh] w-full overflow-hidden rounded-md border bg-[hsl(215_100%_5%)]">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background color="hsl(215 40% 22%)" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
