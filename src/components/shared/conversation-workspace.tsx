import * as React from "react";
import {
  ArrowLeft,
  Pin,
  PinOff,
  Sparkles,
  Trash2,
  Workflow,
  X,
} from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import {
  CSV_GROUPS,
  FLUJO_IMPROVEMENTS,
  SAMPLE_FLUJOS,
} from "@/lib/projects/mock";
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

/** Contexto de análisis: flujo auditado + mejoras que esta conversación motivó. */
function ConversationContext({ conversation }: { conversation: Conversation }) {
  const group = CSV_GROUPS.find((g) => g.id === conversation.uploadGroupId);
  const flujo =
    SAMPLE_FLUJOS.find((f) => group?.projectName.includes(f.name)) ??
    SAMPLE_FLUJOS[0];
  const improvements = FLUJO_IMPROVEMENTS.filter((imp) =>
    imp.conversations.some((c) => c.id === conversation.id),
  );

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Workflow className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Flujo auditado</p>
              <p className="text-sm font-medium">
                {flujo.name} · v{flujo.version}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {flujo.agentCount} agentes
          </span>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Mejoras vinculadas · {improvements.length}
          </p>
          {improvements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Esta conversación no motivó ninguna mejora del flujo.
            </p>
          ) : (
            <div className="space-y-2">
              {improvements.map((imp, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{imp.title}</p>
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {imp.impact}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {imp.why}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversationWorkspace({
  conversation,
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

      <div className="grid gap-5 lg:grid-cols-5 lg:items-start">
        {/* Izquierda: chat (burbujas) — sticky para no perderlo al scrollear */}
        <div className="lg:sticky lg:top-4 lg:col-span-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Chat · tocá un mensaje para analizarlo
          </p>
          <div className="space-y-2.5 overflow-y-auto rounded-xl border bg-muted/20 p-3 lg:max-h-[calc(100vh-7rem)] lg:min-h-[34rem]">
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

        {/* Derecha: análisis del mensaje + contexto + reporte */}
        <div className="space-y-4 lg:col-span-3">
          {selected !== null ? (
            <MessageAnalysis
              conversation={conversation}
              index={selected}
              onClear={() => setSelected(null)}
            />
          ) : null}
          <ConversationContext conversation={conversation} />
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
