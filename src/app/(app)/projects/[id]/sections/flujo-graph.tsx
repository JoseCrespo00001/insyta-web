"use client";

import * as React from "react";
import {
  Background,
  Controls,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Flujo } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

const TYPE_ACCENT: Record<string, string> = {
  Agent: "hsl(137 72% 66%)",
  ChatInput: "hsl(199 89% 60%)",
  ChatOutput: "hsl(199 89% 60%)",
  Prompt: "hsl(259 80% 70%)",
  ConditionalRouter: "hsl(41 96% 60%)",
  IfElse: "hsl(41 96% 60%)",
};

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

function fields(template?: Record<string, LFField>) {
  if (!template) return [] as { label: string; value: string }[];
  const out: { label: string; value: string }[] = [];
  for (const key of SHOWN_FIELDS) {
    const v = template[key]?.value;
    if (typeof v === "string" && v.trim()) {
      out.push({
        label: template[key]?.display_name || key,
        value: v.length > 200 ? `${v.slice(0, 200)}…` : v,
      });
    }
  }
  return out;
}

function nodeLabel(
  title: string,
  type: string,
  accent: string | undefined,
  fs: { label: string; value: string }[],
) {
  return (
    <div style={{ textAlign: "left", width: 270 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: fs.length ? 6 : 0,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 9,
            background: accent ?? "#5b6b85",
            display: "inline-block",
          }}
        />
        <strong style={{ fontSize: 13 }}>{title}</strong>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            opacity: 0.6,
          }}
        >
          {type}
        </span>
      </div>
      {fs.map((f) => (
        <div key={f.label} style={{ marginTop: 6 }}>
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              opacity: 0.5,
            }}
          >
            {f.label}
          </div>
          <div
            style={{
              fontSize: 11,
              lineHeight: 1.35,
              opacity: 0.85,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {f.value}
          </div>
        </div>
      ))}
    </div>
  );
}

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
    const accent = TYPE_ACCENT[type];
    return {
      id: n.id ?? `n${i}`,
      position: { x: n.position?.x ?? i * 360, y: n.position?.y ?? 0 },
      data: {
        label: nodeLabel(
          n.data?.node?.display_name ?? type,
          type,
          accent,
          fields(n.data?.node?.template),
        ),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: "hsl(217 33% 12%)",
        color: "white",
        border: `1px solid ${accent ?? "hsl(215 40% 22%)"}`,
        borderRadius: 12,
        padding: 12,
        width: 300,
      },
    };
  });

  const ids = new Set(nodes.map((n) => n.id));
  const edges: Edge[] = (data?.edges ?? [])
    .filter(
      (e) => e.source && e.target && ids.has(e.source) && ids.has(e.target),
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

export function FlujoGraph({
  flujo,
  className,
}: {
  flujo: Flujo;
  className?: string;
}) {
  const graph = React.useMemo(() => buildGraph(flujo.json ?? ""), [flujo.json]);
  // Si el caller pasa className (ej. h-full) usa eso; si no, alto fijo 78vh.
  const sizing = className
    ? { className: cn("w-full", className), style: undefined }
    : { className: "w-full", style: { height: "78vh" } as React.CSSProperties };

  if (!graph) {
    return (
      <div
        style={sizing.style}
        className={cn(
          "flex items-center justify-center rounded-md border bg-[hsl(215_100%_5%)] text-sm text-muted-foreground",
          sizing.className,
        )}
      >
        No se pudo leer el grafo del flujo (JSON sin nodos).
      </div>
    );
  }

  return (
    <div
      style={sizing.style}
      className={cn(
        "overflow-hidden rounded-md border bg-[hsl(215_100%_5%)]",
        sizing.className,
      )}
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        minZoom={0.05}
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
