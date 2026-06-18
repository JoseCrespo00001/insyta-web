import Link from "next/link";
import {
  Bell,
  ClipboardList,
  FileUp,
  Loader2,
  MessageSquare,
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
  },
  {
    label: "Score promedio",
    value: DASHBOARD_OVERVIEW.avgScore,
    icon: TrendingUp,
  },
  {
    label: "Auditorías corridas",
    value: DASHBOARD_OVERVIEW.auditsRun,
    icon: ClipboardList,
  },
  {
    label: "Mejoras aplicadas",
    value: DASHBOARD_OVERVIEW.improvementsApplied,
    icon: Sparkles,
  },
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
        {OVERVIEW.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
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
