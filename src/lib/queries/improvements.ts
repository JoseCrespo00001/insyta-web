"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

// ── Improvements ──────────────────────────────────────────────────────────
export type ImprovementDto = {
  id: string;
  title: string;
  detail: string;
  impact: string;
  why: string;
  status: string;
  nodeJson?: string | null;
  prompt?: string | null;
  conversations: Array<{
    id: string;
    externalId: string;
    contactName: string | null;
    preview: string | null;
    score: number | null;
  }>;
};

export function useFlowImprovements(flowId: string | null) {
  return useQuery({
    queryKey: ["improvements", flowId],
    queryFn: () =>
      api.get<ImprovementDto[]>(`/api/v1/flows/${flowId}/improvements`),
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
