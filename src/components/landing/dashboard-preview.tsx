import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowRight,
  AtSign,
  Bell,
  MessageCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Card, CardContent } from "@/components/ui/card";

type Kpi = { label: string; value: string; sub?: string; delta?: number };
type Attention = { text: string };
type Row = {
  channel: "whatsapp" | "instagram";
  text: string;
  status: string;
  intent: "good" | "bad" | "warn";
  score: number;
};

const CHANNEL_ICON = {
  whatsapp: MessageCircle,
  instagram: AtSign,
} as const;

const STATUS_CLASSES: Record<Row["intent"], string> = {
  good: "bg-score-good/15 text-score-good",
  bad: "bg-score-critical/15 text-score-critical",
  warn: "bg-score-risk/15 text-score-risk",
};

const KPI_ICONS = [MessageSquare, TrendingUp, Bell, Sparkles];

export function DashboardPreview() {
  const t = useTranslations("dashboardPreview");
  const kpis = t.raw("kpis") as Kpi[];
  const attention = t.raw("attention") as Attention[];
  const rows = t.raw("rows") as Row[];

  return (
    <section id="dashboard" className="py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </Reveal>

        {/* Marco tipo app: ventana con barra superior + contenido del dashboard */}
        <Reveal delay={0.1} className="mt-14">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {/* Barra de ventana */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
              <span className="size-3 rounded-full bg-score-critical/70" />
              <span className="size-3 rounded-full bg-score-risk/70" />
              <span className="size-3 rounded-full bg-score-good/70" />
              <span className="ml-3 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                {t("windowUrl")}
              </span>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* KPIs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => {
                  const Icon = KPI_ICONS[i] ?? MessageSquare;
                  return (
                    <div
                      key={kpi.label}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {kpi.label}
                        </p>
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <p className="mt-2 text-2xl font-bold tracking-tight">
                        {kpi.value}
                      </p>
                      {typeof kpi.delta === "number" ? (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-score-good">
                          <TrendingUp className="size-3.5" />+{kpi.delta}
                        </span>
                      ) : (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {kpi.sub}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Últimas conversaciones */}
                <div className="rounded-xl border border-border bg-background p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    {t("conversationsTitle")}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {rows.map((row) => {
                      const Channel = CHANNEL_ICON[row.channel];
                      return (
                        <li
                          key={row.text}
                          className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5"
                        >
                          <Channel className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-sm">
                            {row.text}
                          </span>
                          <span
                            className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline ${STATUS_CLASSES[row.intent]}`}
                          >
                            {row.status}
                          </span>
                          <ScoreBadge score={row.score} />
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Requiere atención + propuesta de mejora */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="size-4 text-muted-foreground" />
                      {t("attentionTitle")}
                    </h3>
                    <div className="mt-3 space-y-2">
                      {attention.map((a) => (
                        <div
                          key={a.text}
                          className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5"
                        >
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-score-critical/15 text-score-critical">
                            <Bell className="size-3.5" />
                          </div>
                          <span className="min-w-0 flex-1 text-sm">
                            {a.text}
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles className="size-4" />
                        {t("improvementTitle")}
                      </div>
                      <p className="mt-2 text-sm text-foreground/90">
                        {t("improvementText")}
                      </p>
                      <span className="mt-3 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                        {t("improvementDelta")}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
