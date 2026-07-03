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
  // "Evaluada" = el judge ya corrió (hay score o timestamp de evaluación).
  // Sin eso, no mostramos ceros/"No" que parecen datos reales.
  const evaluated = conversation.score != null || Boolean(e.evaluatedAt);

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
        {evaluated ? (
          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Cómo fue
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-xl border border-dashed p-4">
            <p className="text-sm font-medium">Sin evaluar todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Corré una auditoría sobre esta conversación para medir resolución,
              satisfacción, costo y más.
            </p>
          </div>
        )}
      </div>

      {e.rubric && e.rubric.dimensiones.length > 0 ? (
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold">Rúbrica</h4>
            {e.segment ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {e.segment.replace(/_/g, " ")}
              </span>
            ) : null}
            {e.hasVeto ? (
              <span className="rounded-full bg-score-critical/15 px-2 py-0.5 text-xs font-medium text-score-critical">
                VETO: {(e.vetoFlags ?? []).join(", ")}
              </span>
            ) : null}
            {typeof e.confidence === "number" ? (
              <span className="text-xs text-muted-foreground">
                confianza {Math.round(e.confidence * 100)}%
              </span>
            ) : null}
            {e.requiereRevisionHumana ? (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600">
                revisión humana
              </span>
            ) : null}
          </div>
          <div className="space-y-1.5">
            {e.rubric.dimensiones.map((d) => (
              <div key={d.id} className="rounded-md border p-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.id}</span>
                  <span className="text-muted-foreground">
                    {d.score != null ? `${d.score}/5` : "—"}
                    {d.turn_id != null ? ` · turno ${d.turn_id}` : ""}
                  </span>
                </div>
                {d.justificacion ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.justificacion}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!evaluated ? null : (
        <>
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
              <DimTile
                label="Tokens"
                value={`${e.tokensInput + e.tokensOutput}`}
              />
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
        </>
      )}
    </div>
  );
}
