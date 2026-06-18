import { ScoreBadge } from "@/components/shared/score-badge";
import { Separator } from "@/components/ui/separator";
import type { Conversation } from "@/lib/projects/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

const yesNo = (b: boolean) => (b ? "Sí" : "No");

export function ConversationReport({
  conversation,
}: {
  conversation: Conversation;
}) {
  const e = conversation.evaluation;
  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold tracking-tight">
            {conversation.score ?? "—"}
          </p>
        </div>
        <ScoreBadge score={conversation.score} />
      </div>

      {/* Dimensiones medidas */}
      <section className="space-y-2">
        <h4 className="text-sm font-semibold">Dimensiones medidas</h4>
        <div className="space-y-1.5">
          <Row label="Resolución" value={yesNo(e.resolution)} />
          <Row label="Satisfacción" value={`${e.satisfaction} / 5`} />
          <Row
            label="Tono"
            value={<span className="capitalize">{e.tone}</span>}
          />
          <Row label="Frustración" value={yesNo(e.frustration)} />
          <Row label="Escaló a humano" value={yesNo(e.escalated)} />
          <Row label="Eficiencia" value={`${e.efficiency} / 5`} />
          <Row label="Fuera de scope" value={yesNo(e.scopeViolation)} />
          <Row
            label="Tema"
            value={<span className="capitalize">{e.topic}</span>}
          />
        </div>
      </section>

      {/* Cómo fue */}
      <section className="space-y-1">
        <h4 className="text-sm font-semibold">Cómo fue</h4>
        <p className="text-sm text-muted-foreground">{e.summary}</p>
      </section>

      <Separator />

      {/* Traza técnica */}
      <section className="space-y-1.5">
        <h4 className="text-sm font-semibold">Traza</h4>
        <Row label="Modelo" value={e.modelUsed} />
        <Row
          label="Tokens"
          value={`${e.tokensInput} in · ${e.tokensOutput} out`}
        />
        <Row label="Costo" value={`$${e.costUsd}`} />
        <Row label="Latencia" value={`${e.latencyMs} ms`} />
        <Row
          label="trace_id"
          value={
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {e.phoenixTraceId}
            </code>
          }
        />
        <Row
          label="span_id"
          value={
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {e.phoenixSpanId}
            </code>
          }
        />
      </section>
    </div>
  );
}
