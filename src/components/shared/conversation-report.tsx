import { formatCurrency, scoreColor } from "@/lib/format";
import type { Conversation } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

type Intent = "good" | "bad" | "warn" | "neutral";

const INTENT_BG: Record<Intent, string> = {
  good: "border-score-good/30 bg-score-good/5",
  bad: "border-score-critical/30 bg-score-critical/5",
  warn: "border-score-risk/30 bg-score-risk/5",
  neutral: "",
};
const INTENT_TEXT: Record<Intent, string> = {
  good: "text-score-good",
  bad: "text-score-critical",
  warn: "text-score-risk",
  neutral: "text-foreground",
};

function DimTile({
  label,
  value,
  intent = "neutral",
}: {
  label: string;
  value: string;
  intent?: Intent;
}) {
  return (
    <div className={cn("rounded-lg border p-3", INTENT_BG[intent])}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold capitalize",
          INTENT_TEXT[intent],
        )}
      >
        {value}
      </p>
    </div>
  );
}

const yesNo = (b: boolean) => (b ? "Sí" : "No");
const TONE_ES: Record<string, string> = {
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
};
const ratingIntent = (v: number): Intent =>
  v >= 4 ? "good" : v <= 2 ? "bad" : "warn";

function scoreLabel(score: number | null): { text: string; intent: Intent } {
  if (score == null) return { text: "Sin evaluar", intent: "neutral" };
  if (score >= 80) return { text: "Bueno", intent: "good" };
  if (score >= 50) return { text: "En riesgo", intent: "warn" };
  return { text: "Crítico", intent: "bad" };
}

const CHIP: Record<Intent, string> = {
  good: "bg-score-good/15 text-score-good",
  bad: "bg-score-critical/15 text-score-critical",
  warn: "bg-score-risk/15 text-score-risk",
  neutral: "bg-muted text-muted-foreground",
};

export function ConversationReport({
  conversation,
}: {
  conversation: Conversation;
}) {
  const e = conversation.evaluation;

  return (
    <div className="space-y-4">
      {/* Score + resumen */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Score de la conversación
            </p>
            <p className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-4xl font-bold tracking-tight",
                  scoreColor(conversation.score),
                )}
              >
                {conversation.score ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold",
              CHIP[scoreLabel(conversation.score).intent],
            )}
          >
            {scoreLabel(conversation.score).text}
          </span>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium text-muted-foreground">Cómo fue</p>
          <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
        </div>
      </div>

      {/* Dimensiones medidas */}
      <section className="space-y-2">
        <h4 className="text-sm font-semibold">Dimensiones medidas</h4>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          <DimTile
            label="Resolución"
            value={yesNo(e.resolution)}
            intent={e.resolution ? "good" : "bad"}
          />
          <DimTile
            label="Satisfacción"
            value={`${e.satisfaction} / 5`}
            intent={ratingIntent(e.satisfaction)}
          />
          <DimTile
            label="Eficiencia"
            value={`${e.efficiency} / 5`}
            intent={ratingIntent(e.efficiency)}
          />
          <DimTile
            label="Tono"
            value={TONE_ES[e.tone] ?? e.tone}
            intent={
              e.tone === "negative"
                ? "bad"
                : e.tone === "positive"
                  ? "good"
                  : "neutral"
            }
          />
          <DimTile
            label="Frustración"
            value={yesNo(e.frustration)}
            intent={e.frustration ? "bad" : "neutral"}
          />
          <DimTile
            label="Escaló a humano"
            value={yesNo(e.escalated)}
            intent={e.escalated ? "warn" : "neutral"}
          />
          <DimTile
            label="Fuera de scope"
            value={yesNo(e.scopeViolation)}
            intent={e.scopeViolation ? "bad" : "neutral"}
          />
          <DimTile label="Tema" value={e.topic} />
        </div>
      </section>

      {/* Traza técnica */}
      <section className="space-y-2">
        <h4 className="text-sm font-semibold">Traza</h4>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <DimTile label="Modelo" value={e.modelUsed} />
          <DimTile label="Tokens" value={`${e.tokensInput + e.tokensOutput}`} />
          <DimTile label="Costo" value={formatCurrency(e.costUsd)} />
          <DimTile label="Latencia" value={`${e.latencyMs} ms`} />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-xs text-muted-foreground">trace_id</span>
            <code className="truncate rounded bg-muted px-1.5 py-0.5 text-xs">
              {e.phoenixTraceId}
            </code>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-xs text-muted-foreground">span_id</span>
            <code className="truncate rounded bg-muted px-1.5 py-0.5 text-xs">
              {e.phoenixSpanId}
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}
