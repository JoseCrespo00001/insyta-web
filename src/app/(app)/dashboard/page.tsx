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
import {
  DASHBOARD_OVERVIEW,
  PROJECT_SUMMARIES,
  RECENT_ACTIVITY,
  type ActivityKind,
} from "@/lib/projects/dashboard";

const OVERVIEW = [
  {
    label: "Conversaciones evaluadas",
    value: DASHBOARD_OVERVIEW.conversationsEvaluated,
    icon: MessageSquare,
    sub: `+${DASHBOARD_OVERVIEW.conversationsThisWeek} esta semana`,
  },
  {
    label: "Score promedio",
    value: DASHBOARD_OVERVIEW.avgScore,
    icon: TrendingUp,
    delta: DASHBOARD_OVERVIEW.avgScoreDelta,
  },
  {
    label: "Auditorías corridas",
    value: DASHBOARD_OVERVIEW.auditsRun,
    icon: ClipboardList,
    sub: DASHBOARD_OVERVIEW.auditsRunning
      ? `${DASHBOARD_OVERVIEW.auditsRunning} en curso`
      : "Ninguna en curso",
  },
  {
    label: "Mejoras aplicadas",
    value: DASHBOARD_OVERVIEW.improvementsApplied,
    icon: Sparkles,
    sub: `${DASHBOARD_OVERVIEW.suggestionsOpen} sugerencias abiertas`,
  },
] as const;

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

export default function DashboardPage() {
  const running = PROJECT_SUMMARIES.filter((p) => p.auditStatus === "running");

  const sat = DASHBOARD_OVERVIEW.satisfaction;
  const satTotal = sat.satisfecho + sat.neutral + sat.insatisfecho || 1;
  const totalAlerts = PROJECT_SUMMARIES.reduce((a, p) => a + p.openAlerts, 0);
  const totalSuggestions = PROJECT_SUMMARIES.reduce(
    (a, p) => a + p.suggestionsOpen,
    0,
  );
  const dropping = PROJECT_SUMMARIES.filter((p) => (p.scoreDelta ?? 0) < 0);

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
        {OVERVIEW.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{item.label}</CardDescription>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">{item.value}</p>
              {"delta" in item ? (
                <ScoreDelta delta={item.delta} />
              ) : (
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
              {totalAlerts > 0 ? (
                <AttentionRow
                  icon={Bell}
                  intent="bad"
                  text={`${totalAlerts} alerta${totalAlerts > 1 ? "s" : ""} abierta${totalAlerts > 1 ? "s" : ""}`}
                  href="/projects"
                />
              ) : null}
              {totalSuggestions > 0 ? (
                <AttentionRow
                  icon={Sparkles}
                  intent="primary"
                  text={`${totalSuggestions} sugerencias de mejora sin revisar`}
                  href="/improvements"
                />
              ) : null}
              {dropping.map((p) => (
                <AttentionRow
                  key={p.publicId}
                  icon={TrendingDown}
                  intent="bad"
                  text={`${p.name} · score ${p.scoreDelta} esta semana`}
                  href={`/projects/${p.publicId}`}
                />
              ))}
              {totalAlerts === 0 &&
              totalSuggestions === 0 &&
              dropping.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todo en orden. No hay nada que requiera atención.
                </p>
              ) : null}
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
            {running.map((p) => (
              <div key={p.publicId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.auditProgress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${p.auditProgress ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Por proyecto */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Por proyecto</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {PROJECT_SUMMARIES.map((p) => (
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
                  <div className="flex items-center gap-2">
                    <ScoreDelta delta={p.scoreDelta} />
                    <ScoreBadge score={p.score} />
                  </div>
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
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  <Metric
                    icon={MessageSquare}
                    value={p.conversations}
                    label="Conv."
                  />
                  <Metric icon={Workflow} value={p.flujos} label="Flujos" />
                  <Metric
                    icon={Sparkles}
                    value={p.improvementsApplied}
                    label="Mejoras"
                  />
                  <Metric
                    icon={Bell}
                    value={p.openAlerts}
                    label="Alertas"
                    highlight={p.openAlerts > 0}
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
        </div>
      </section>

      {/* Actividad reciente */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Actividad reciente</h2>
        <Card>
          <CardContent className="divide-y p-0">
            {RECENT_ACTIVITY.map((a) => {
              const Icon = ACTIVITY_ICON[a.kind];
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
            })}
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
