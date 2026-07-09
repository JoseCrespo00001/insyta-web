"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

// Perfil por cliente final del agente (no el usuario logueado): reputación
// (respetuoso/etiqueta), recurrencia, temas y a qué hora responde.
// B5: identificamos al cliente por `userKey` (hash) y mostramos `display`
// (nombre o pseudónimo). Nunca el teléfono/identificador crudo (PII).
export type ClientSummary = {
  userKey: string;
  display: string;
  conversations: number;
  avgScore: number | null;
  avgSatisfaction: number | null;
  etiqueta: string;
  respectful: boolean;
  riesgoso: boolean;
  fraudAttempts: number;
  lastSeen: string | null;
};

export type ClientProfile = {
  userKey: string;
  display: string;
  conversations: number;
  avgScore: number | null;
  avgSatisfaction: number | null;
  frustratedCount: number;
  etiqueta: string;
  respectful: boolean;
  riesgoso: boolean;
  fraudAttempts: number;
  avgSentiment: number | null;
  topics: [string, number][];
  responseHoursUtc: number[]; // 24 slots
  mostActiveHourUtc: number | null;
};

export function useClients(projectId: string) {
  return useQuery({
    queryKey: ["clients", projectId],
    queryFn: () =>
      api.get<ClientSummary[]>(`/api/v1/projects/${projectId}/clients`),
    enabled: !!projectId,
  });
}

export function useClient(projectId: string, userKey: string | null) {
  return useQuery({
    queryKey: ["client", projectId, userKey],
    queryFn: () =>
      // B5: se pide por user_key (hash), no por teléfono crudo en la URL.
      api.get<ClientProfile>(
        `/api/v1/projects/${projectId}/clients/profile?client=${encodeURIComponent(
          userKey ?? "",
        )}`,
      ),
    enabled: !!projectId && !!userKey,
  });
}
