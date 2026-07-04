"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

// Feed real de notificaciones (reemplaza el mock lib/notifications.ts). Las emite
// el worker de auditoría: auditoría completada, conversación crítica, sugerencias.
export type NotifKind = "audit" | "suspicious" | "improvement" | "update";

export type Notification = {
  id: string;
  kind: NotifKind;
  title: string;
  detail: string | null;
  link: string | null;
  read: boolean;
  at: string;
};

export type NotificationsPage = {
  items: Notification[];
  unreadCount: number;
};

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<NotificationsPage>("/api/v1/notifications"),
    // Polling: el feed se refresca solo mientras la pestaña está abierta.
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<{ marked: number }>("/api/v1/notifications/read"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
