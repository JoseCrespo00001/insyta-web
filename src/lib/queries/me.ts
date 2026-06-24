"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

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
