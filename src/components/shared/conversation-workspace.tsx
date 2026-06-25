import * as React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Pin,
  PinOff,
  Sparkles,
  Trash2,
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
  // Veredicto real del judge (si la conversación fue auditada).
  const judged = Boolean(m.label || m.issueType || m.note);
  const isError = m.label === "error";
  const isWarn = m.label === "warning";
  const isHallu = m.issueType === "alucinacion";
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

        {/* Veredicto del judge (real) */}
        {judged ? (
          <div
            className={cn(
              "rounded-lg border p-3",
              isError && "border-score-critical/40 bg-score-critical/5",
              isWarn && "border-score-risk/40 bg-score-risk/5",
              !isError && !isWarn && "border-score-good/40 bg-score-good/5",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isError
                    ? "bg-score-critical/15 text-score-critical"
                    : isWarn
                      ? "bg-score-risk/15 text-score-risk"
                      : "bg-score-good/15 text-score-good",
                )}
              >
                {m.label === "error"
                  ? "Error"
                  : m.label === "warning"
                    ? "Advertencia"
                    : "OK"}
              </span>
              {m.issueType ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                  {m.issueType.replace(/_/g, " ")}
                </span>
              ) : null}
              {m.severity ? (
                <span className="text-xs text-muted-foreground">
                  severidad: {m.severity}
                </span>
              ) : null}
              {isHallu ? (
                <span className="rounded-full bg-score-critical/15 px-2 py-0.5 text-xs font-semibold text-score-critical">
                  ⚠ Alucinación
                </span>
              ) : null}
            </div>
            {m.note ? (
              <p className="mt-2 text-sm text-muted-foreground">{m.note}</p>
            ) : null}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Veredicto del judge (auditoría)
            </p>
          </div>
        ) : null}

        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Sentimiento</p>
            <p className="mt-0.5 text-sm font-semibold capitalize">
              {a.sentiment}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">¿Alucinación?</p>
            <p className="mt-0.5 text-sm font-semibold">
              {judged ? yesNo(isHallu) : "—"}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">span_id</p>
            <code className="mt-0.5 block truncate text-xs">
              {conversation.evaluation.phoenixSpanId || "—"}_m{index}
            </code>
          </div>
        </div>
        {!judged ? (
          <p className="text-muted-foreground">
            {a.note} (análisis rápido — corré una auditoría para el veredicto
            del judge)
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

const IMAGE_RE =
  /(<media omitted>|imagen|foto|📷|🖼|image|\.(jpg|jpeg|png|webp))/i;

function computeInsights(conversation: Conversation) {
  const msgs = conversation.messages;
  const userMsgs = msgs.filter((m) => m.role === "user");
  const botMsgs = msgs.filter((m) => m.role === "bot");
  const avgUserLen = userMsgs.length
    ? Math.round(
        userMsgs.reduce((a, m) => a + m.content.length, 0) / userMsgs.length,
      )
    : 0;
  const verbosity =
    avgUserLen === 0
      ? "—"
      : avgUserLen < 40
        ? "Poco texto"
        : avgUserLen < 120
          ? "Medio"
          : "Mucho texto";
  const images = msgs.filter((m) => IMAGE_RE.test(m.content)).length;

  // Mejor hora: hora con más mensajes del usuario.
  const hourCount: Record<number, number> = {};
  for (const m of userMsgs) {
    const h = new Date(m.at).getHours();
    if (!Number.isNaN(h)) hourCount[h] = (hourCount[h] ?? 0) + 1;
  }
  const bestHourEntry = Object.entries(hourCount).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const bestHour = bestHourEntry ? `${bestHourEntry[0]}:00 hs` : "—";

  // Cadencia: tiempo promedio entre mensajes consecutivos (minutos).
  let deltas = 0;
  let n = 0;
  for (let i = 1; i < msgs.length; i++) {
    const d =
      (new Date(msgs[i].at).getTime() - new Date(msgs[i - 1].at).getTime()) /
      60000;
    if (d >= 0 && d < 60 * 48) {
      deltas += d;
      n += 1;
    }
  }
  const cadence = n ? Math.round(deltas / n) : 0;
  const cadenceLabel = n ? (cadence < 1 ? "<1 min" : `${cadence} min`) : "—";

  const judged = msgs.some((m) => m.label || m.issueType);
  const hallucinations = msgs.filter(
    (m) => m.issueType === "alucinacion",
  ).length;

  // Potencial de cliente (heurístico): resolución + satisfacción + intención.
  const e = conversation.evaluation;
  const intent = /(agend|turno|compr|precio|cotiz|reserv|si dale|quiero)/i.test(
    userMsgs.map((m) => m.content).join(" "),
  );
  let lead: "Alto" | "Medio" | "Bajo" = "Medio";
  if (conversation.resolved && (e.satisfaction >= 4 || intent)) lead = "Alto";
  else if (conversation.resolved === false && !intent) lead = "Bajo";

  return {
    userMsgs: userMsgs.length,
    botMsgs: botMsgs.length,
    verbosity,
    avgUserLen,
    images,
    bestHour,
    cadenceLabel,
    judged,
    hallucinations,
    lead,
    intent,
  };
}

function InsightTile({
  label,
  value,
  icon: Icon,
  intent,
}: {
  label: string;
  value: string;
  icon?: typeof Clock;
  intent?: "good" | "bad" | "neutral";
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold",
          intent === "good" && "text-score-good",
          intent === "bad" && "text-score-critical",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ConversationInsights({
  conversation,
}: {
  conversation: Conversation;
}) {
  const i = computeInsights(conversation);
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Insights de la conversación</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <InsightTile
            label="Mensajes"
            value={`${i.userMsgs} usuario · ${i.botMsgs} bot`}
            icon={MessageSquare}
          />
          <InsightTile
            label="Estilo del usuario"
            value={`${i.verbosity}${i.avgUserLen ? ` (~${i.avgUserLen})` : ""}`}
          />
          <InsightTile
            label="Imágenes"
            value={String(i.images)}
            icon={ImageIcon}
          />
          <InsightTile
            label="Cadencia de respuesta"
            value={i.cadenceLabel}
            icon={Clock}
          />
          <InsightTile label="Mejor hora" value={i.bestHour} icon={Clock} />
          <InsightTile
            label="Alucinaciones"
            value={i.judged ? String(i.hallucinations) : "—"}
            icon={AlertTriangle}
            intent={
              i.hallucinations > 0 ? "bad" : i.judged ? "good" : "neutral"
            }
          />
          <InsightTile
            label="Potencial cliente"
            value={i.lead}
            intent={
              i.lead === "Alto" ? "good" : i.lead === "Bajo" ? "bad" : "neutral"
            }
          />
          <InsightTile
            label="Intención de compra"
            value={i.intent ? "Sí" : "No"}
            intent={i.intent ? "good" : "neutral"}
          />
          <InsightTile
            label="Recomendación"
            value={i.lead === "Bajo" ? "No re-contactar" : "Volver a hablarle"}
          />
        </div>
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
    // Preferimos el detalle (trae contenido real + veredictos del judge por
    // mensaje); si no cargó, usamos lo que vino en la prop.
    const messages: ChatMessage[] = detail?.messages?.length
      ? detail.messages.map((m) => ({
          role: m.role === "assistant" ? "bot" : "user",
          content: m.content,
          at: m.timestamp,
          label: m.label,
          issueType: m.issue_type,
          severity: m.severity,
          note: m.note,
        }))
      : conversationProp.messages;
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
          <ConversationInsights conversation={conversation} />
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
