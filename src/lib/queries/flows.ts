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
    mutationFn: (input: {
      id: string;
      flowJson?: unknown;
      name?: string;
      versionLabel?: string;
      versionSource?: "improvement" | "manual" | "upload";
    }) =>
      api.put<Flujo>(`/api/v1/flows/${input.id}`, {
        name: input.name,
        flowJson: input.flowJson,
        versionLabel: input.versionLabel,
        versionSource: input.versionSource,
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["flows"] });
      qc.invalidateQueries({ queryKey: ["flow", vars.id] });
      qc.invalidateQueries({ queryKey: ["flow-versions", vars.id] });
    },
  });
}

// ── Historial de versiones del flujo ────────────────────────────────────────
export type FlowVersionSummary = {
  id: string;
  versionNumber: number;
  label: string;
  source: string; // initial | improvement | manual | restore | upload
  sizeBytes: number;
  agentCount: number;
  createdAt: string;
  isCurrent: boolean;
};

export type FlowVersionDetail = FlowVersionSummary & { json: string };

export function useFlowVersions(flowId: string) {
  return useQuery({
    queryKey: ["flow-versions", flowId],
    queryFn: () =>
      api.get<FlowVersionSummary[]>(`/api/v1/flows/${flowId}/versions`),
    enabled: !!flowId,
  });
}

export function useFlowVersion(flowId: string, versionId: string | null) {
  return useQuery({
    queryKey: ["flow-version", flowId, versionId],
    queryFn: () =>
      api.get<FlowVersionDetail>(
        `/api/v1/flows/${flowId}/versions/${versionId}`,
      ),
    enabled: !!flowId && !!versionId,
  });
}

export function useRestoreFlowVersion(flowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      api.post<Flujo>(
        `/api/v1/flows/${flowId}/versions/${versionId}/restore`,
        {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flow", flowId] });
      qc.invalidateQueries({ queryKey: ["flow-versions", flowId] });
      qc.invalidateQueries({ queryKey: ["flows"] });
    },
  });
}

export function useRenameFlowVersion(flowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { versionId: string; label: string }) =>
      api.patch<FlowVersionSummary>(
        `/api/v1/flows/${flowId}/versions/${input.versionId}`,
        { label: input.label },
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["flow-versions", flowId] }),
  });
}
