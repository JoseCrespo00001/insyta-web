"use client";

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

// Estilo de nodo (dark, alineado a la marca).
const nodeStyle: React.CSSProperties = {
  background: "hsl(217 33% 12%)",
  color: "white",
  border: "1px solid hsl(215 40% 22%)",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 12,
  width: 150,
};

const agentStyle: React.CSSProperties = {
  ...nodeStyle,
  border: "1px solid hsl(137 72% 66% / 0.5)",
};

function node(
  id: string,
  x: number,
  y: number,
  label: string,
  style: React.CSSProperties,
): Node {
  return {
    id,
    position: { x, y },
    data: { label },
    style,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
}

// Grafo de muestra del flujo (supervisor → agentes). Mock: estático.
// TODO(api): construir nodos/edges desde el JSON real del flujo.
const NODES: Node[] = [
  node("input", 0, 140, "Chat Input", nodeStyle),
  node("supervisor", 220, 140, "Supervisor · router", nodeStyle),
  node("ventas", 470, 20, "Agente Ventas", agentStyle),
  node("soporte", 470, 140, "Agente Soporte", agentStyle),
  node("pagos", 470, 260, "Agente Pagos", agentStyle),
  node("response", 720, 140, "Response", nodeStyle),
];

const EDGES: Edge[] = [
  { id: "e-input-sup", source: "input", target: "supervisor", animated: true },
  { id: "e-sup-ventas", source: "supervisor", target: "ventas" },
  { id: "e-sup-soporte", source: "supervisor", target: "soporte" },
  { id: "e-sup-pagos", source: "supervisor", target: "pagos" },
  { id: "e-ventas-resp", source: "ventas", target: "response" },
  { id: "e-soporte-resp", source: "soporte", target: "response" },
  { id: "e-pagos-resp", source: "pagos", target: "response" },
];

export function FlujoGraph(_props: { flujo: Flujo }) {
  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-md border bg-[hsl(215_100%_5%)]">
      <ReactFlow
        nodes={NODES}
        edges={EDGES}
        fitView
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
