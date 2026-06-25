"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Flujo } from "@/lib/projects/types";

// ── Flows ─────────────────────────────────────────────────────────────────
export function useFlows(projectId: string) {
  return useQuery({
    queryKey: ["flows", projectId],
    queryFn: () => api.get<Flujo[]>(`/api/v1/projects/${projectId}/flows`),
    enabled: !!projectId,
  });
}

// Auditoría del flujo en sí (LLM experto en Langflow). Es acción (cuesta tokens)
// -> mutación, no query.
export type FlowAuditResult = {
  completeness: number;
  summary: string;
  mode: string;
  suggestions: Array<{
    type: string;
    title: string;
    detail: string;
    target: string;
    severity: string;
    impact: string;
    node_json?: string | null;
    prompt?: string | null;
  }>;
};

export function useAuditFlow(flowId: string) {
  return useMutation({
    mutationFn: (mode: "standard" | "deep") =>
      api.post<FlowAuditResult>(`/api/v1/flows/${flowId}/audit`, { mode }),
  });
}

// Todos los flujos del tenant (vista global de Mejoras).
export function useAllFlows() {
  return useQuery({
    queryKey: ["flows", "all"],
    queryFn: () => api.get<Flujo[]>("/api/v1/flows"),
  });
}

export function useCreateFlow(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      version?: string;
      flowJson: unknown;
    }) => api.post<Flujo>(`/api/v1/projects/${projectId}/flows`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flows", projectId] }),
  });
}

export function useFlow(flowId: string, enabled = true) {
  return useQuery({
    queryKey: ["flow", flowId],
    queryFn: () => api.get<Flujo>(`/api/v1/flows/${flowId}`),
    enabled: enabled && !!flowId,
  });
}

export function useDeleteFlow(_projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flowId: string) => api.del<void>(`/api/v1/flows/${flowId}`),
    // Invalida todas las listas de flujos (por proyecto + global).
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flows"] }),
  });
}

export function useUpdateFlow(_projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; flowJson?: unknown; name?: string }) =>
      api.put<Flujo>(`/api/v1/flows/${input.id}`, {
        name: input.name,
        flowJson: input.flowJson,
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["flows"] });
      qc.invalidateQueries({ queryKey: ["flow", vars.id] });
    },
  });
}
