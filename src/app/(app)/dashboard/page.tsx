"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  ClipboardList,
  FileUp,
  Loader2,
  MessageSquare,
  Smile,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
  Workflow,
} from "lucide-react";

import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/format";
import { useDashboard } from "@/lib/queries";

type ActivityKind = "audit" | "improvement" | "alert" | "upload";

type DashboardData = {
  overview: {
    conversationsEvaluated: number;
    avgScore: number | null;
    auditsRun: number;
    improvementsApplied: number;
    suggestionsOpen: number;
    satisfaction: {
      satisfecho?: number;
      neutral?: number;
      insatisfecho?: number;
    };
  };
  quality?: {
    hallucinations: number;
    flaggedMessages: number;
    conversationsWithIssues: number;
    leads: number;
    unresolved: number;
    issuesByType: Record<string, number>;
    topics: Array<{ topic: string; count: number }>;
  };
  projectSummaries: Array<{
    publicId: string;
    name: string;
    score: number | null;
    conversations: number;
    flujos: number;
    suggestionsOpen: number;
    auditStatus: "idle" | "running";
    lastAuditAt: string | null;
  }>;
  recentActivity: Array<{
    id: string;
    kind: ActivityKind;
    text: string;
    at: string;
  }>;
};

const SAT_META = [
  { key: "satisfecho", label: "Satisfecho", bar: "bg-score-good" },
  { key: "neutral", label: "Neutral", bar: "bg-score-risk" },
  { key: "insatisfecho", label: "Insatisfecho", bar: "bg-score-critical" },
] as const;

const ACTIVITY_ICON: Record<ActivityKind, typeof Bell> = {
  alert: Bell,
  audit: ClipboardList,
  improvement: Sparkles,
  upload: Upload,
};

function ScoreDelta({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const up = delta >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        up ? "text-score-good" : "text-score-critical"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {delta}
    </span>
  );
}

const EMPTY: DashboardData = {
  overview: {
    conversationsEvaluated: 0,
    avgScore: null,
    auditsRun: 0,
    improvementsApplied: 0,
    suggestionsOpen: 0,
    satisfaction: {},
  },
  quality: {
    hallucinations: 0,
    flaggedMessages: 0,
    conversationsWithIssues: 0,
    leads: 0,
    unresolved: 0,
    issuesByType: {},
    topics: [],
  },
  projectSummaries: [],
  recentActivity: [],
};

const ISSUE_LABELS: Record<string, string> = {
  alucinacion: "Alucinación",
  error_politica: "Error de política",
  alcance: "Fuera de alcance",
  no_resuelve: "No resuelve",
  contradiccion: "Contradicción",
  tono: "Tono",
};

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const d = (data as DashboardData | undefined) ?? EMPTY;
  const ov = d.overview;

  const overviewCards = [
    {
      label: "Conversaciones evaluadas",
      value: ov.conversationsEvaluated,
      icon: MessageSquare,
      sub: "evaluadas en total",
    },
    {
      label: "Score promedio",
      value: ov.avgScore ?? "—",
      icon: TrendingUp,
      delta: null as number | null,
    },
    {
      label: "Auditorías corridas",
      value: ov.auditsRun,
      icon: ClipboardList,
      sub: `${d.projectSummaries.filter((p) => p.auditStatus === "running").length} en curso`,
    },
    {
      label: "Mejoras aplicadas",
      value: ov.improvementsApplied,
      icon: Sparkles,
      sub: `${ov.suggestionsOpen} sugerencias abiertas`,
    },
  ] as const;

  const running = d.projectSummaries.filter((p) => p.auditStatus === "running");
  const sat = {
    satisfecho: ov.satisfaction.satisfecho ?? 0,
    neutral: ov.satisfaction.neutral ?? 0,
    insatisfecho: ov.satisfaction.insatisfecho ?? 0,
  };
  const satTotal = sat.satisfecho + sat.neutral + sat.insatisfecho || 1;
  const totalSuggestions = ov.suggestionsOpen;
  const q = d.quality ?? EMPTY.quality!;
  const qualityCards = [
    {
      label: "Alucinaciones",
      value: q.hallucinations,
      icon: AlertTriangle,
      intent: q.hallucinations > 0 ? ("bad" as const) : ("neutral" as const),
      sub: "mensajes con dato inventado",
    },
    {
      label: "Mensajes marcados",
      value: q.flaggedMessages,
      icon: MessageSquare,
      intent: q.flaggedMessages > 0 ? ("warn" as const) : ("neutral" as const),
      sub: `${q.conversationsWithIssues} conversaciones afectadas`,
    },
    {
      label: "Potenciales clientes",
      value: q.leads,
      icon: TrendingUp,
      intent: "good" as const,
      sub: "resueltas + satisfechas",
    },
    {
      label: "Sin resolver",
      value: q.unresolved,
      icon: TrendingDown,
      intent: q.unresolved > 0 ? ("bad" as const) : ("neutral" as const),
      sub: "el agente no cerró",
    },
  ];
  const topIssues = Object.entries(q.issuesByType).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tus agentes, auditorías y mejoras.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects">
            <FileUp className="h-4 w-4" />
            Subir conversaciones
          </Link>
        </Button>
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{item.label}</CardDescription>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">{item.value}</p>
              {"delta" in item && item.delta !== null ? (
                <ScoreDelta delta={item.delta} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  {"sub" in item ? item.sub : ""}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Datos clave de calidad (agregados de los veredictos del judge) */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Datos clave de calidad
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {qualityCards.map((item) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{item.label}</CardDescription>
                <item.icon
                  className={`h-4 w-4 ${
                    item.intent === "bad"
                      ? "text-score-critical"
                      : item.intent === "warn"
                        ? "text-score-risk"
                        : item.intent === "good"
                          ? "text-score-good"
                          : "text-muted-foreground"
                  }`}
                />
              </CardHeader>
              <CardContent className="space-y-1">
                <p
                  className={`text-3xl font-bold tracking-tight ${
                    item.intent === "bad" && item.value > 0
                      ? "text-score-critical"
                      : item.intent === "good" && item.value > 0
                        ? "text-score-good"
                        : ""
                  }`}
                >
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {(topIssues.length > 0 || q.topics.length > 0) && (
          <div className="grid gap-4 lg:grid-cols-2">
            {topIssues.length > 0 && (
              <Card>
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-sm font-semibold">
                    Problemas detectados
                  </h3>
                  {topIssues.map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{ISSUE_LABELS[type] ?? type}</span>
                      <span className="font-semibold text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {q.topics.length > 0 && (
              <Card>
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-sm font-semibold">
                    Temas más frecuentes
                  </h3>
                  {q.topics.map((t) => (
                    <div
                      key={t.topic}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate">{t.topic}</span>
                      <span className="font-semibold text-muted-foreground">
                        {t.count}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Satisfacción global + Requiere atención */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Smile className="h-4 w-4 text-muted-foreground" />
              Satisfacción global · {satTotal} conversaciones
            </h2>
            <div className="space-y-2.5">
              {SAT_META.map(({ key, label, bar }) => {
                const count = sat[key];
                const pct = Math.round((count / satTotal) * 100);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Requiere atención
            </h2>
            <div className="space-y-2">
              {totalSuggestions > 0 ? (
                <AttentionRow
                  icon={Sparkles}
                  intent="primary"
                  text={`${totalSuggestions} sugerencias de mejora sin revisar`}
                  href="/improvements"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? "Cargando…"
                    : "Todo en orden. No hay nada que requiera atención."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auditorías en curso */}
      {running.length > 0 ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {running.length} auditoría{running.length > 1 ? "s" : ""} en curso
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Por proyecto */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Por proyecto</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {d.projectSummaries.map((p) => (
            <Card key={p.publicId}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    <Link
                      href={`/projects/${p.publicId}`}
                      className="hover:underline"
                    >
                      {p.name}
                    </Link>
                  </CardTitle>
                  <ScoreBadge score={p.score} />
                </div>
                <CardDescription>
                  {p.auditStatus === "running" ? (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Auditoría en curso
                    </span>
                  ) : p.lastAuditAt ? (
                    <>Última auditoría: {formatDate(p.lastAuditAt)}</>
                  ) : (
                    <>Sin auditorías todavía</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                  <Metric
                    icon={MessageSquare}
                    value={p.conversations}
                    label="Conv."
                  />
                  <Metric icon={Workflow} value={p.flujos} label="Flujos" />
                  <Metric
                    icon={Sparkles}
                    value={p.suggestionsOpen}
                    label="Sugerencias"
                  />
                </div>
                {p.suggestionsOpen > 0 ? (
                  <Link
                    href="/improvements"
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                  >
                    {p.suggestionsOpen} sugerencias de mejora abiertas →
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {d.projectSummaries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {isLoading
                  ? "Cargando proyectos…"
                  : "Todavía no hay proyectos. Creá uno y subí un CSV."}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      {/* Actividad reciente */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Actividad reciente</h2>
        <Card>
          <CardContent className="divide-y p-0">
            {d.recentActivity.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Sin actividad aún.
              </p>
            ) : (
              d.recentActivity.map((a) => {
                const Icon = ACTIVITY_ICON[a.kind] ?? Bell;
                return (
                  <div key={a.id} className="flex items-start gap-3 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm">{a.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(a.at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function AttentionRow({
  icon: Icon,
  text,
  href,
  intent,
}: {
  icon: typeof Bell;
  text: string;
  href: string;
  intent: "bad" | "primary";
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          intent === "bad"
            ? "bg-score-critical/15 text-score-critical"
            : "bg-primary/15 text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm">{text}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  highlight,
}: {
  icon: typeof Bell;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        className={`h-4 w-4 ${highlight ? "text-score-critical" : "text-muted-foreground"}`}
      />
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
