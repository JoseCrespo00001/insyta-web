import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Download,
  Gauge,
  Hash,
  MessagesSquare,
  ShieldAlert,
  Smile,
  Sparkles,
  Tag,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { ScoreBadge } from "@/components/shared/score-badge";
import { SuggestionExtras } from "@/components/shared/suggestion-extras";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadAuditServerCsv } from "@/lib/projects/export";
import { formatCurrency, scoreColor } from "@/lib/format";
import type {
  Conversation,
  ConversationSegment,
  Report,
  Satisfaction,
} from "@/lib/projects/types";
import { cn } from "@/lib/utils";

const SEGMENT_LABELS: Record<ConversationSegment, string> = {
  cliente_ideal: "Cliente ideal",
  satisfecho: "Satisfecho",
  neutral: "Neutral",
  insatisfecho: "Insatisfecho",
  potencial_lead: "Potencial lead",
  problematico: "Problemático",
};

const SAT_META: Record<Satisfaction, { label: string; bar: string }> = {
  satisfecho: { label: "Satisfecho", bar: "bg-score-good" },
  neutral: { label: "Neutral", bar: "bg-score-risk" },
  insatisfecho: { label: "Insatisfecho", bar: "bg-score-critical" },
};

const SAT_ORDER: Satisfaction[] = ["satisfecho", "neutral", "insatisfecho"];

function MetricCard({
  label,
  value,
  sub,
  valueClass,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
  icon: typeof Gauge;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className={cn("text-2xl font-bold tracking-tight", valueClass)}>
          {value}
        </p>
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  className,
}: {
  icon: typeof Gauge;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn("flex items-center gap-2 text-sm font-semibold", className)}
    >
      <Icon className="h-4 w-4" />
      {children}
    </h3>
  );
}

export function ReportView({
  report,
  onSelectConversation,
  flowJson,
  auditId,
}: {
  report: Report;
  onSelectConversation?: (conversation: Conversation) => void;
  // JSON del flujo auditado: habilita "Copiar flujo completo (con el nodo)".
  flowJson?: string | null;
  // id de la auditoría: habilita el export CSV del servidor por segmento.
  auditId?: string;
}) {
  const convs = report.conversations;
  const [segmentFilter, setSegmentFilter] =
    React.useState<ConversationSegment | null>(null);
  const [downloading, setDownloading] = React.useState(false);

  // Segmentos presentes en el reporte (para los chips).
  const presentSegments = Array.from(
    new Set(
      convs
        .map((c) => c.evaluation.segment)
        .filter((s): s is ConversationSegment => !!s),
    ),
  );
  const filteredConvs = segmentFilter
    ? convs.filter((c) => c.evaluation.segment === segmentFilter)
    : convs;

  async function handleCsv() {
    if (!auditId) return;
    setDownloading(true);
    try {
      await downloadAuditServerCsv(auditId, segmentFilter);
    } catch {
      toast.error("No se pudo exportar el CSV");
    } finally {
      setDownloading(false);
    }
  }
  const n = report.total || convs.length || 1;
  const pct = (x: number) => Math.round((x / n) * 100);

  const scored = convs.filter((c) => c.score != null);
  const avgScore = scored.length
    ? Math.round(
        scored.reduce((a, c) => a + (c.score as number), 0) / scored.length,
      )
    : null;
  const resolved = convs.filter((c) => c.evaluation.resolution).length;
  const escalated = convs.filter((c) => c.evaluation.escalated).length;
  const frustration = convs.filter((c) => c.evaluation.frustration).length;
  const scopeViol = convs.filter((c) => c.evaluation.scopeViolation).length;
  const toneNeg = convs.filter((c) => c.evaluation.tone === "negative").length;
  const avgSat = convs.length
    ? convs.reduce((a, c) => a + c.evaluation.satisfaction, 0) / convs.length
    : 0;
  const avgEff = convs.length
    ? convs.reduce((a, c) => a + c.evaluation.efficiency, 0) / convs.length
    : 0;
  const totalCost = convs.reduce((a, c) => a + c.evaluation.costUsd, 0);
  const totalTokens = convs.reduce(
    (a, c) => a + c.evaluation.tokensInput + c.evaluation.tokensOutput,
    0,
  );
  const avgLatency = convs.length
    ? Math.round(
        convs.reduce((a, c) => a + c.evaluation.latencyMs, 0) / convs.length,
      )
    : 0;
  const model = convs[0]?.evaluation.modelUsed ?? "—";

  const topicCounts = convs.reduce<Record<string, number>>((acc, c) => {
    acc[c.evaluation.topic] = (acc[c.evaluation.topic] ?? 0) + 1;
    return acc;
  }, {});
  const topics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

  const signals = [
    { label: "Frustración detectada", count: frustration, icon: AlertTriangle },
    { label: "Escaladas a humano", count: escalated, icon: ArrowUpRight },
    { label: "Tono negativo", count: toneNeg, icon: Smile },
    { label: "Fuera de scope", count: scopeViol, icon: AlertTriangle },
  ];

  // ── Capa de riesgo / intervención ──
  const VETO_LABELS: Record<string, string> = {
    A1_alucinacion: "Alucinación factual",
    A2_riesgo_legal: "Riesgo legal",
    A3_pii: "Fuga de datos (PII)",
    A4_scope: "Fuera de alcance",
    A5_cbu_invalido: "CBU inválido",
  };
  const ISSUE_LABELS: Record<string, string> = {
    alucinacion: "Alucinación",
    alcance: "Fuera de alcance",
    contradiccion: "Contradicción",
    error_politica: "Error de política",
    frustracion: "Frustración",
  };
  const humanVeto = (f: string) => VETO_LABELS[f] ?? f.replace(/_/g, " ");
  const reasonFor = (c: Conversation): string => {
    const ev = c.evaluation;
    if (ev.hasVeto && ev.vetoFlags?.length)
      return ev.vetoFlags.map(humanVeto).join(" · ");
    const sev = (c.messageEvaluations ?? []).filter(
      (v) => v.severity === "critica" || v.severity === "alta",
    );
    if (sev.length) {
      const it = sev[0].issueType;
      const label = it ? (ISSUE_LABELS[it] ?? it) : "problema";
      return `${sev.length} ${label} (${sev[0].severity})`;
    }
    if (ev.requiereRevisionHumana) return "Requiere revisión humana";
    if (ev.segment === "problematico") return "Conversación problemática";
    return "Revisar";
  };
  // El backend ya marca needsIntervention y ordena por riesgo.
  const critical = convs.filter((c) => c.needsIntervention);
  const bySeverity = report.risk?.bySeverity ?? {
    critica: 0,
    alta: 0,
    media: 0,
    baja: 0,
  };
  const severityRows = [
    { key: "critica" as const, label: "Crítica", cls: "bg-score-critical" },
    { key: "alta" as const, label: "Alta", cls: "bg-score-critical/70" },
    { key: "media" as const, label: "Media", cls: "bg-score-risk" },
    { key: "baja" as const, label: "Baja", cls: "bg-muted-foreground/40" },
  ];
  const sevTotal = severityRows.reduce((a, s) => a + bySeverity[s.key], 0);
  const sevMax = Math.max(1, ...severityRows.map((s) => bySeverity[s.key]));

  return (
    <div className="space-y-5">
      {/* ── Requieren tu intervención (capa de riesgo, arriba de todo) ── */}
      {critical.length > 0 ? (
        <Card className="border-score-critical/40">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle icon={ShieldAlert} className="text-score-critical">
                Requieren tu intervención · {critical.length}
              </SectionTitle>
              {report.risk ? (
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{report.risk.withVeto} con VETO</span>
                  <span>·</span>
                  <span>{report.risk.needsReview} revisión humana</span>
                </div>
              ) : null}
            </div>
            <div className="space-y-1.5">
              {critical.slice(0, 12).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={!onSelectConversation}
                  onClick={() => onSelectConversation?.(c)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border border-score-critical/20 bg-score-critical/5 p-2.5 text-left",
                    onSelectConversation &&
                      "transition-colors hover:bg-score-critical/10",
                  )}
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-score-critical" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {c.contactName || c.externalId}
                      </span>
                      {c.evaluation.hasVeto ? (
                        <span className="rounded-full bg-score-critical/15 px-2 py-0.5 text-[11px] font-medium text-score-critical">
                          VETO
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-score-critical">
                      {reasonFor(c)}
                    </p>
                  </div>
                  <ScoreBadge score={c.score} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Problemas por severidad (Pareto) ── */}
      {sevTotal > 0 ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            <SectionTitle icon={AlertTriangle}>
              Problemas por severidad · {sevTotal}
            </SectionTitle>
            <div className="space-y-1.5">
              {severityRows.map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">
                    {s.label}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", s.cls)}
                      style={{
                        width: `${(bySeverity[s.key] / sevMax) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums">
                    {bySeverity[s.key]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPIs */}
        <MetricCard
          label="Score promedio"
          value={avgScore == null ? "—" : String(avgScore)}
          sub={`${scored.length} evaluadas`}
          valueClass={scoreColor(avgScore)}
          icon={Gauge}
        />
        <MetricCard
          label="Resolución"
          value={`${pct(resolved)}%`}
          sub={`${resolved} de ${n} resueltas`}
          valueClass="text-foreground"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Satisfacción media"
          value={`${avgSat.toFixed(1)}/5`}
          sub={`Eficiencia ${avgEff.toFixed(1)}/5`}
          icon={Smile}
        />
        <MetricCard
          label="Latencia media"
          value={`${avgLatency} ms`}
          sub={`${convs.length} conversaciones`}
          icon={Clock}
        />

        {/* Satisfacción breakdown */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-3 p-4">
            <SectionTitle icon={Smile}>
              Satisfacción · {n} conversaciones
            </SectionTitle>
            <div className="space-y-2.5">
              {SAT_ORDER.map((key) => {
                const count = report.satisfaction[key];
                const p = pct(count);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{SAT_META[key].label}</span>
                      <span className="text-muted-foreground">
                        {count} ({p}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", SAT_META[key].bar)}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por tema */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-3 p-4">
            <SectionTitle icon={Tag}>Temas detectados</SectionTitle>
            <div className="space-y-2.5">
              {topics.map(([topic, count]) => {
                const p = pct(count);
                return (
                  <div key={topic} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{topic}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Operación / costo */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-3 p-4">
            <SectionTitle icon={Cpu}>Operación</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Coins className="h-3.5 w-3.5" />
                  Costo total
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(totalCost)}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  Tokens
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {totalTokens.toLocaleString("es-AR")}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  Latencia media
                </div>
                <p className="mt-1 text-lg font-semibold">{avgLatency} ms</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Cpu className="h-3.5 w-3.5" />
                  Modelo
                </div>
                <p className="mt-1 truncate text-sm font-semibold">{model}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Señales de riesgo */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-3 p-4">
            <SectionTitle icon={AlertTriangle}>Señales de riesgo</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {signals.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      s.count > 0
                        ? "bg-score-critical/15 text-score-critical"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-none">
                      {s.count}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* No resueltas */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-3 p-4">
            <SectionTitle icon={XCircle} className="text-score-critical">
              <span className="text-foreground">
                No resueltas · {report.failing.length}
              </span>
            </SectionTitle>
            {report.failing.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ninguna conversación quedó sin resolver.
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {report.failing.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!onSelectConversation}
                    onClick={() => onSelectConversation?.(c)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border p-3 text-left",
                      onSelectConversation &&
                        "transition-colors hover:bg-muted",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {c.contactName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{c.externalId}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {c.preview}
                      </p>
                    </div>
                    <ScoreBadge score={c.score} />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sugerencias de mejora */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-3 p-4">
            <SectionTitle icon={Sparkles} className="text-primary">
              <span className="text-foreground">Sugerencias de mejora</span>
            </SectionTitle>
            <div className="space-y-2.5">
              {report.suggestions.map((s, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{s.title}</p>
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {s.impact}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.detail}
                  </p>
                  <SuggestionExtras
                    nodeJson={s.node_json}
                    prompt={s.prompt}
                    flowJson={flowJson}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Todas las conversaciones auditadas (al final, para entrar a cada una) */}
        <Card className="sm:col-span-2 lg:col-span-4">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle icon={MessagesSquare}>
                Conversaciones auditadas · {filteredConvs.length}
              </SectionTitle>
              {auditId ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCsv}
                  disabled={downloading}
                >
                  <Download className="mr-1 h-4 w-4" />
                  {segmentFilter
                    ? `CSV · ${SEGMENT_LABELS[segmentFilter]}`
                    : "Descargar CSV"}
                </Button>
              ) : null}
            </div>

            {presentSegments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSegmentFilter(null)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    !segmentFilter
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  Todas ({convs.length})
                </button>
                {presentSegments.map((seg) => {
                  const count = convs.filter(
                    (c) => c.evaluation.segment === seg,
                  ).length;
                  return (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setSegmentFilter(seg)}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                        segmentFilter === seg
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {SEGMENT_LABELS[seg]} ({count})
                    </button>
                  );
                })}
              </div>
            ) : null}

            {filteredConvs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin conversaciones en este segmento.
              </p>
            ) : (
              <div className="space-y-1.5">
                {filteredConvs.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!onSelectConversation}
                    onClick={() => onSelectConversation?.(c)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border p-3 text-left",
                      onSelectConversation &&
                        "transition-colors hover:bg-muted",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {c.contactName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{c.externalId}
                        </span>
                        {c.resolved === false ? (
                          <span className="rounded-full bg-score-critical/15 px-2 py-0.5 text-xs font-medium text-score-critical">
                            no resuelta
                          </span>
                        ) : null}
                        {c.evaluation.segment ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-foreground">
                            {SEGMENT_LABELS[c.evaluation.segment]}
                          </span>
                        ) : null}
                        {c.evaluation.hasVeto ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-score-critical/15 px-2 py-0.5 text-xs font-medium text-score-critical">
                            <ShieldAlert className="h-3 w-3" /> VETO
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {c.preview}
                      </p>
                    </div>
                    <ScoreBadge score={c.score} />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
