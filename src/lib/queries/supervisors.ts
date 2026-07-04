"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

// ── Supervisores ────────────────────────────────────────────────────────────
// Un Supervisor es el cerebro reusable de auditoría: bundlea flow + knowledge
// base + attached_data (fuente de verdad: precios.json/info.json) + defaults de
// objetivo/énfasis. Al crear una auditoría se elige un Supervisor.

export type Supervisor = {
  id: string;
  name: string;
  flujoId: string | null;
  flujoName: string | null;
  knowledgeBase: string | null;
  attachedData: Record<string, unknown> | null;
  attachedKeys: string[];
  defaultObjective: string | null;
  defaultEmphasis: string[] | null;
  defaultFreeText: string | null;
  createdAt: string;
};

export type SupervisorInput = {
  name: string;
  flujoId?: string | null;
  knowledgeBase?: string | null;
  attachedData?: Record<string, unknown> | null;
  defaultObjective?: string | null;
  defaultEmphasis?: string[] | null;
  defaultFreeText?: string | null;
};

export function useSupervisors(projectId: string) {
  return useQuery({
    queryKey: ["supervisors", projectId],
    queryFn: () =>
      api.get<Supervisor[]>(`/api/v1/projects/${projectId}/supervisors`),
    enabled: !!projectId,
  });
}

export function useSupervisor(supervisorId: string | null) {
  return useQuery({
    queryKey: ["supervisor", supervisorId],
    queryFn: () => api.get<Supervisor>(`/api/v1/supervisors/${supervisorId}`),
    enabled: !!supervisorId,
  });
}

export function useCreateSupervisor(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupervisorInput) =>
      api.post<Supervisor>(`/api/v1/projects/${projectId}/supervisors`, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["supervisors", projectId] }),
  });
}

export function useUpdateSupervisor(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string } & SupervisorInput) => {
      const { id, ...body } = input;
      return api.put<Supervisor>(`/api/v1/supervisors/${id}`, body);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["supervisors", projectId] });
      qc.invalidateQueries({ queryKey: ["supervisor", vars.id] });
    },
  });
}

export function useDeleteSupervisor(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (supervisorId: string) =>
      api.del<void>(`/api/v1/supervisors/${supervisorId}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["supervisors", projectId] }),
  });
}
