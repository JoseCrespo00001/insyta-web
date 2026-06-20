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
      return api.postForm<{ uploadId: string; status: string }>(
        "/api/v1/uploads/csv",
        form,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads", projectId] }),
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

// ── Audits ────────────────────────────────────────────────────────────────
export type AuditPayload = {
  flujoId?: string;
  conversationIds: string[];
  emphasis: string[];
  freeText: string;
};

export function useAudits(projectId: string) {
  return useQuery({
    queryKey: ["audits", projectId],
    queryFn: () => api.get<unknown[]>(`/api/v1/projects/${projectId}/audits`),
    enabled: !!projectId,
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
    queryFn: () => api.get<unknown>(`/api/v1/audits/${auditId}`),
    enabled: !!auditId,
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
