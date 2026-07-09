"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

// ── Audits ────────────────────────────────────────────────────────────────
export type AuditPayload = {
  name?: string;
  objective?: string;
  provider?: string;
  flujoId?: string;
  supervisorId?: string;
  conversationIds: string[];
  emphasis: string[];
  freeText: string;
};

// El detalle/lista de auditorías ya viene en camelCase desde el backend y
// calza con el tipo `Audit` del front (status incluye "running" mientras corre
// el judge). Se tipa laxo acá y se castea en la vista.
export type AuditDto = {
  id: string;
  name: string;
  flujoId: string | null;
  flujoName: string | null;
  conversationCount: number;
  evaluatedCount: number;
  emphasis: string[];
  freeText: string;
  createdAt: string;
  status: string;
  errorMessage: string | null;
  report: {
    total: number;
    satisfaction: Record<string, number>;
    avgScore?: number | null;
    adversarial?: {
      total: number;
      repelled: number;
      ceded: number;
      byType: Record<string, number>;
    } | null;
    resolution?: {
      resolved: number;
      legitimate: number;
      pct: number | null;
    } | null;
    failing: unknown[];
    conversations: unknown[];
    suggestions: unknown[];
  };
};

export function useAudits(projectId: string) {
  return useQuery({
    queryKey: ["audits", projectId],
    queryFn: () => api.get<AuditDto[]>(`/api/v1/projects/${projectId}/audits`),
    enabled: !!projectId,
    // Mientras alguna auditoría esté "running", repoll para reflejar cuando el
    // judge termina (status -> active + report poblado).
    refetchInterval: (q) => {
      const data = q.state.data as AuditDto[] | undefined;
      return data?.some((a) => a.status === "running") ? 2500 : false;
    },
  });
}

export function useCreateAudit(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AuditPayload) =>
      api.post<{ auditId: string; status: string }>(
        `/api/v1/projects/${projectId}/audits`,
        payload,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audits", projectId] }),
  });
}

export function useAudit(auditId: string) {
  return useQuery({
    queryKey: ["audit", auditId],
    queryFn: () => api.get<AuditDto>(`/api/v1/audits/${auditId}`),
    enabled: !!auditId,
    // Si el reporte se abre mientras el judge corre, repoll hasta que termine.
    refetchInterval: (q) =>
      (q.state.data as AuditDto | undefined)?.status === "running"
        ? 2500
        : false,
  });
}
