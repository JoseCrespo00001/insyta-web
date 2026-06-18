import * as React from "react";
import { ArrowLeft, X } from "lucide-react";

import { ConversationReport } from "@/components/shared/conversation-report";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sentimiento</span>
            <span className="font-medium capitalize">{a.sentiment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Contribuyó a frustración
            </span>
            <span className="font-medium">
              {yesNo(a.contributesFrustration)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">span_id</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
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
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <h2 className="text-xl font-semibold tracking-tight">
            {conversation.contactName}
          </h2>
          <p className="text-sm text-muted-foreground">
            #{conversation.externalId} · {conversation.messageCount} mensajes ·{" "}
            {conversation.userMessages} usuario · {conversation.botMessages} bot
          </p>
        </div>
        <ScoreBadge score={conversation.score} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Izquierda: chat (burbujas) */}
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Chat · tocá un mensaje para analizarlo
          </p>
          <div className="max-h-[72vh] space-y-2.5 overflow-y-auto rounded-xl border bg-muted/20 p-3">
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

        {/* Derecha: análisis del mensaje + reporte */}
        <div className="space-y-4 lg:col-span-3">
          {selected !== null ? (
            <>
              <MessageAnalysis
                conversation={conversation}
                index={selected}
                onClear={() => setSelected(null)}
              />
              <Separator />
            </>
          ) : null}
          <ConversationReport conversation={conversation} />
        </div>
      </div>
    </div>
  );
}
