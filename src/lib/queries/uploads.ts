"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

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

export function useDeleteUpload(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uploadId: string) =>
      api.del<void>(`/api/v1/uploads/${uploadId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations", projectId] });
      qc.invalidateQueries({ queryKey: ["conversations", "all"] });
      qc.invalidateQueries({ queryKey: ["uploads", projectId] });
    },
  });
}
