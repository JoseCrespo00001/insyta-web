/**
 * React Query hooks over the insyta-api backend. These replace the mock data
 * sources (stub.ts / mock.ts / dashboard.ts) as views are wired up.
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Flujo, Project } from "@/lib/projects/types";

// ── Me / identity ───────────────────────────────────────────────────────────
export type Me = {
  userId: string;
  email: string;
  fullName: string | null;
  orgId: string;
  orgName: string | null;
  role: string;
  allowedProjectIds: string[];
};

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<Me>("/api/v1/me"),
    retry: false,
  });
}

// ── Projects ──────────────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/api/v1/projects"),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      api.post<{ publicId: string; name: string; slug: string }>(
        "/api/v1/projects",
        input,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ── Flows ─────────────────────────────────────────────────────────────────
export function useFlows(projectId: string) {
  return useQuery({
    queryKey: ["flows", projectId],
    queryFn: () => api.get<Flujo[]>(`/api/v1/projects/${projectId}/flows`),
    enabled: !!projectId,
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

export function useDeleteFlow(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flowId: string) => api.del<void>(`/api/v1/flows/${flowId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flows", projectId] }),
  });
}

export function useUpdateFlow(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; flowJson?: unknown; name?: string }) =>
      api.put<Flujo>(`/api/v1/flows/${input.id}`, {
        name: input.name,
        flowJson: input.flowJson,
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["flows", projectId] });
      qc.invalidateQueries({ queryKey: ["flow", vars.id] });
    },
  });
}

// ── Uploads ───────────────────────────────────────────────────────────────
export type UploadGroupItem = {
  id: string;
  filename: string;
  loadedAt: string;
  status: string;
  conversationCount: number;
  progressPct: number;
};

export function useUploads(projectId: string) {
  return useQuery({
    queryKey: ["uploads", projectId],
    queryFn: () =>
      api.get<UploadGroupItem[]>(`/api/v1/projects/${projectId}/uploads`),
    enabled: !!projectId,
  });
}

export function useUploadCsv(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("project_public_id", projectId);
      form.append("file", file);
      // POST /uploads/csv responds snake_case (UploadCreatedResponse).
      return api.postForm<{ upload_id: string; status: string }>(
        "/api/v1/uploads/csv",
        form,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads", projectId] }),
  });
}

// GET /uploads/{id} is snake_case (UploadStatusResponse).
export type UploadStatus = {
  status: string;
  rows_total: number | null;
  rows_processed: number | null;
  progress_pct: number;
  error_message: string | null;
};

export function useUploadStatus(uploadId: string | null) {
  return useQuery({
    queryKey: ["upload", uploadId],
    queryFn: () => api.get<UploadStatus>(`/api/v1/uploads/${uploadId}`),
    enabled: !!uploadId,
    refetchInterval: (q) => {
      const s = (q.state.data as UploadStatus | undefined)?.status;
      return s === "completed" || s === "failed" ? false : 1200;
    },
  });
}

// ── Conversations ─────────────────────────────────────────────────────────
export function useConversations(projectId: string) {
  return useQuery({
    queryKey: ["conversations", projectId],
    queryFn: () =>
      api.get<{ items: unknown[]; next_cursor: string | null }>(
        `/api/v1/projects/${projectId}/conversations`,
      ),
    enabled: !!projectId,
  });
}

export type ConversationDetail = {
  public_id: string;
  external_id: string;
  platform: string;
  status: string;
  started_at: string | null;
  messages: {
    public_id: string;
    role: string;
    content: string;
    timestamp: string;
  }[];
  evaluation: Record<string, unknown> | null;
};

export function useConversation(convId: string | null) {
  return useQuery({
    queryKey: ["conversation", convId],
    queryFn: () =>
      api.get<ConversationDetail>(`/api/v1/conversations/${convId}`),
    enabled: !!convId,
  });
}

// ── Audits ────────────────────────────────────────────────────────────────
export type AuditPayload = {
  flujoId?: string;
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
  emphasis: string[];
  freeText: string;
  createdAt: string;
  status: string;
  report: {
    total: number;
    satisfaction: Record<string, number>;
    avgScore?: number | null;
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

// ── Improvements ──────────────────────────────────────────────────────────
export function useFlowImprovements(flowId: string) {
  return useQuery({
    queryKey: ["improvements", flowId],
    queryFn: () => api.get<unknown[]>(`/api/v1/flows/${flowId}/improvements`),
    enabled: !!flowId,
  });
}

export function useUpdateImprovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: string }) =>
      api.patch<{ id: string; status: string }>(
        `/api/v1/improvements/${input.id}`,
        { status: input.status },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["improvements"] }),
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<unknown>("/api/v1/dashboard"),
  });
}
