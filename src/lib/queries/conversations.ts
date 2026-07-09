"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ConversationEvaluation } from "@/lib/projects/types";

// ── Conversations ─────────────────────────────────────────────────────────
// Trae TODAS las conversaciones del proyecto recorriendo la cursor-pagination
// (el endpoint pagina de a 50 por default; el composer necesita verlas todas
// para seleccionar cuáles auditar). Devuelve el mismo shape { items, next_cursor }.
export function useConversations(projectId: string) {
  return useQuery({
    queryKey: ["conversations", projectId],
    queryFn: async () => {
      const all: unknown[] = [];
      let cursor: string | null = null;
      do {
        const qs = new URLSearchParams({ limit: "200" });
        if (cursor) qs.set("cursor", cursor);
        const page = await api.get<{
          items: unknown[];
          next_cursor: string | null;
        }>(`/api/v1/projects/${projectId}/conversations?${qs.toString()}`);
        all.push(...page.items);
        cursor = page.next_cursor;
      } while (cursor);
      return { items: all, next_cursor: null as string | null };
    },
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
