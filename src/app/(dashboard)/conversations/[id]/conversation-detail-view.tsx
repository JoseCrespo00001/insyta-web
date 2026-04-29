"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ChatTranscript } from "@/app/(dashboard)/conversations/[id]/chat-transcript";
import { EvaluationSidebar } from "@/app/(dashboard)/conversations/[id]/evaluation-sidebar";
import { conversationsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";
import { formatDateTime } from "@/lib/format";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  active: "default",
  completed: "success",
  abandoned: "warning",
  escalated: "destructive",
};

/* UX Review — ConversationDetailView
 * User: Operador que clickeo desde la tabla "Top problematicas" para entender que paso.
 * Goal: Leer el chat anonimizado + ver el por que del score, en <30s. Decidir si es falso positivo.
 * Flow: /conversations/{id} -> chat scrollable a la izquierda, eval sidebar a la derecha. Mobile: stacked.
 * States: loading | error | empty (sin evaluation -> chat sin sidebar) | success.
 * Edge cases:
 *  - Sin evaluation aun (esta procesando) -> mensaje "Esta conversacion aun no fue evaluada".
 *  - Mensajes 0 -> empty state en chat.
 *  - phoenix_span_id null -> link no se muestra.
 *  - Boton "Marcar falso positivo" disabled (placeholder).
 *  - 1000+ mensajes -> scroll virtualizado seria ideal, por ahora overflow-auto basico.
 * Friction points: badges con tooltip explicando cada dimension. Cost info compacta abajo (no es lo principal).
 * Benchmark: Linear issue detail (split layout) / Phoenix span detail.
 */
export function ConversationDetailView({
  conversationPublicId,
}: {
  conversationPublicId: string;
}) {
  const query = useQuery({
    queryKey: queryKeys.conversations.detail(conversationPublicId),
    queryFn: () => conversationsApi.get(conversationPublicId),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-[480px] w-full" />
          <Skeleton className="h-[480px] w-full" />
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="No pudimos cargar la conversacion"
        message={query.error instanceof Error ? query.error.message : undefined}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const conv = query.data;

  return (
    <div className="space-y-4">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/projects/${conv.project_id}`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al proyecto
          </Link>
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Conversacion
            </h1>
            <Badge variant={STATUS_VARIANT[conv.status] ?? "secondary"}>
              {conv.status}
            </Badge>
            <Badge variant="outline">{conv.platform}</Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {conv.public_id}
          </p>
          <p className="text-xs text-muted-foreground">
            Inicio {formatDateTime(conv.started_at)}
            {conv.ended_at ? ` · fin ${formatDateTime(conv.ended_at)}` : ""}
            {" · "}
            {conv.message_count} mensajes
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="min-h-[480px]">
          <CardContent className="p-0">
            {conv.messages.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Sin mensajes"
                description="Esta conversacion no tiene mensajes registrados."
                className="border-0"
              />
            ) : (
              <ChatTranscript messages={conv.messages} />
            )}
          </CardContent>
        </Card>

        <EvaluationSidebar evaluation={conv.evaluation} />
      </div>
    </div>
  );
}
