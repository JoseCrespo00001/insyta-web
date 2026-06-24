"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Project } from "@/lib/projects/types";

// ── Projects ──────────────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/api/v1/projects"),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      name?: string;
      companyContext?: string;
    }) =>
      api.patch<Project>(`/api/v1/projects/${input.id}`, {
        name: input.name,
        companyContext: input.companyContext,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
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
