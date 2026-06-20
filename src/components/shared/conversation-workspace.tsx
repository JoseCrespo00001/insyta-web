import * as React from "react";
import { ArrowLeft, Pin, PinOff, Trash2, X } from "lucide-react";

import { ConversationReport } from "@/components/shared/conversation-report";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConversation } from "@/lib/queries";
import type { ChatMessage, Conversation } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function analyzeMessage(m: ChatMessage) {
  const t = m.content.toLowerCase();
  const negative = /no |error|furioso|\?\?\?|no sos|no pude|loop|soporte/.test(
    t,
  );
  const positive = /gracias|perfecto|genial|listo|ok|claro/.test(t);
  const sentiment = negative ? "negativo" : positive ? "positivo" : "neutral";
  return {
    sentiment,
    contributesFrustration: m.role === "user" && negative,
    note:
      m.role === "bot"
        ? negative
          ? "Respuesta poco resolutiva: no avanza hacia la solución."
          : "Respuesta adecuada para el contexto."
        : negative
          ? "El usuario expresa molestia o duda sin resolver."
          : "Mensaje del usuario sin señales de fricción.",
  };
}

function yesNo(b: boolean) {
  return b ? "Sí" : "No";
}

function MessageAnalysis({
  conversation,
  index,
  onClear,
}: {
  conversation: Conversation;
  index: number;
  onClear: () => void;
}) {
  const m = conversation.messages[index];
  const a = analyzeMessage(m);
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Análisis del mensaje</CardTitle>
          <CardDescription>
            {m.role === "user" ? "Usuario" : "Bot"} · {time(m.at)}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClear}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="rounded-md bg-muted p-3">{m.content}</p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Sentimiento</p>
            <p className="mt-0.5 text-sm font-semibold capitalize">
              {a.sentiment}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">
              Contribuyó a frustración
            </p>
            <p className="mt-0.5 text-sm font-semibold">
              {yesNo(a.contributesFrustration)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">span_id</p>
            <code className="mt-0.5 block truncate text-xs">
              {conversation.evaluation.phoenixSpanId}_m{index}
            </code>
          </div>
        </div>
        <p className="text-muted-foreground">{a.note}</p>
      </CardContent>
    </Card>
  );
}

export function ConversationWorkspace({
  conversation: conversationProp,
  onBack,
  onTogglePin,
  onDelete,
}: {
  conversation: Conversation;
  onBack: () => void;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Hidratación: si la conversación viene sin transcript/eval (abierta desde un
  // reporte o desde mejoras), traemos el detalle real por id.
  const { data: detail } = useConversation(conversationProp.id);
  const conversation = React.useMemo<Conversation>(() => {
    const messages: ChatMessage[] =
      conversationProp.messages.length > 0
        ? conversationProp.messages
        : (detail?.messages ?? []).map((m) => ({
            role: m.role === "assistant" ? "bot" : "user",
            content: m.content,
            at: m.timestamp,
          }));
    const userMessages = messages.filter((m) => m.role === "user").length;
    const botMessages = messages.filter((m) => m.role === "bot").length;
    return {
      ...conversationProp,
      messages,
      userMessages: conversationProp.userMessages || userMessages,
      botMessages: conversationProp.botMessages || botMessages,
      messageCount: conversationProp.messageCount || messages.length,
      evaluation: detail?.evaluation ?? conversationProp.evaluation,
    };
  }, [conversationProp, detail]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 h-8 text-muted-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {conversation.contactName}
            </h2>
            {conversation.pinned ? (
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                <Pin className="h-3 w-3" />
                Fijada
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            #{conversation.externalId} · {conversation.messageCount} mensajes ·{" "}
            {conversation.userMessages} usuario · {conversation.botMessages} bot
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onTogglePin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTogglePin(conversation.id)}
            >
              {conversation.pinned ? (
                <>
                  <PinOff className="h-4 w-4" />
                  Desfijar
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4" />
                  Fijar
                </>
              )}
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          ) : null}
        </div>
      </div>

      {/* Dos paneles nivelados a la misma altura; cada uno scrollea aparte */}
      <div className="grid gap-5 lg:h-[calc(100vh-13rem)] lg:grid-cols-5">
        {/* Izquierda: chat (burbujas) */}
        <div className="flex min-h-0 flex-col lg:col-span-2 lg:h-full">
          <p className="mb-2 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Chat · tocá un mensaje para analizarlo
          </p>
          <div className="max-h-[70vh] min-h-0 flex-1 space-y-2.5 overflow-y-auto rounded-xl border bg-muted/20 p-3 lg:max-h-none">
            {conversation.messages.map((m, i) => {
              const isUser = m.role === "user";
              const active = selected === i;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3 py-2 text-left text-sm shadow-sm transition",
                      isUser ? "bg-primary/15" : "border bg-background",
                      active
                        ? "ring-2 ring-primary"
                        : "hover:ring-1 hover:ring-border",
                    )}
                  >
                    <span className="mb-0.5 flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {isUser ? "Usuario" : "Bot"}
                      <span className="tabular-nums">{time(m.at)}</span>
                    </span>
                    {m.content}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Derecha: análisis + contexto + reporte (scrollea aparte) */}
        <div className="space-y-4 lg:col-span-3 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          {selected !== null ? (
            <MessageAnalysis
              conversation={conversation}
              index={selected}
              onClear={() => setSelected(null)}
            />
          ) : null}
          <ConversationReport conversation={conversation} />
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar conversación</DialogTitle>
            <DialogDescription>
              Se va a eliminar la conversación de{" "}
              <span className="font-medium">{conversation.contactName}</span> (#
              {conversation.externalId}). Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.(conversation.id);
                setConfirmDelete(false);
                onBack();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
