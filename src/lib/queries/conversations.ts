"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ConversationEvaluation } from "@/lib/projects/types";

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

export type GlobalUploadGroup = {
  id: string;
  project_name: string;
  filename: string;
  loaded_at: string;
  conversations: Array<{
    public_id: string;
    external_id: string;
    contact_name: string | null;
    preview: string | null;
    message_count: number;
    score: number | null;
    satisfaction: string | null;
    resolved: boolean | null;
  }>;
};

// Vista global /conversations: todos los CSV del tenant con sus conversaciones.
export function useGlobalConversations() {
  return useQuery({
    queryKey: ["conversations", "all"],
    queryFn: () => api.get<GlobalUploadGroup[]>("/api/v1/conversations"),
  });
}

export function useDeleteConversation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.del<void>(`/api/v1/conversations/${conversationId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations", projectId] });
      qc.invalidateQueries({ queryKey: ["conversations", "all"] });
    },
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
    label?: string | null;
    issue_type?: string | null;
    severity?: string | null;
    note?: string | null;
  }[];
  evaluation: ConversationEvaluation | null;
};

export function useConversation(convId: string | null) {
  return useQuery({
    queryKey: ["conversation", convId],
    queryFn: () =>
      api.get<ConversationDetail>(`/api/v1/conversations/${convId}`),
    enabled: !!convId,
  });
}
