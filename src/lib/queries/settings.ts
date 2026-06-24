"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

// ── Settings · API key del proveedor LLM ────────────────────────────────────
export type LlmKeyStatus = {
  provider: string;
  configured: boolean;
  masked: string | null;
};

// Lista de keys por proveedor (anthropic, deepseek).
export function useLlmKeys() {
  return useQuery({
    queryKey: ["llm-keys"],
    queryFn: () => api.get<LlmKeyStatus[]>("/api/v1/settings/llm-keys"),
  });
}

export function useSetLlmKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { provider: string; apiKey: string }) =>
      api.put<LlmKeyStatus>(`/api/v1/settings/llm-keys/${input.provider}`, {
        apiKey: input.apiKey,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["llm-keys"] }),
  });
}

export function useDeleteLlmKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) =>
      api.del<LlmKeyStatus>(`/api/v1/settings/llm-keys/${provider}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["llm-keys"] }),
  });
}
