"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

// ── Dashboard ─────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<unknown>("/api/v1/dashboard"),
  });
}
