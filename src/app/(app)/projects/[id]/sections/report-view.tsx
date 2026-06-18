import { Sparkles, XCircle } from "lucide-react";

import { ScoreBadge } from "@/components/shared/score-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Report, Satisfaction } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

const SAT_META: Record<Satisfaction, { label: string; bar: string }> = {
  satisfecho: { label: "Satisfecho", bar: "bg-score-good" },
  neutral: { label: "Neutral", bar: "bg-score-risk" },
  insatisfecho: { label: "Insatisfecho", bar: "bg-score-critical" },
};

const SAT_ORDER: Satisfaction[] = ["satisfecho", "neutral", "insatisfecho"];

export function ReportView({ report }: { report: Report }) {
  return (
    <div className="space-y-6">
      {/* Breakdown de satisfacción */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          Satisfacción · {report.total} conversaciones
        </h3>
        <div className="space-y-2.5">
          {SAT_ORDER.map((key) => {
            const count = report.satisfaction[key];
            const pct = report.total
              ? Math.round((count / report.total) * 100)
              : 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{SAT_META[key].label}</span>
                  <span className="text-muted-foreground">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", SAT_META[key].bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conversaciones que fallaron */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <XCircle className="h-4 w-4 text-score-critical" />
          No resueltas · {report.failing.length}
        </h3>
        {report.failing.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ninguna conversación quedó sin resolver.
          </p>
        ) : (
          <div className="space-y-2">
            {report.failing.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.contactName}</span>
                    <span className="text-xs text-muted-foreground">
                      #{c.externalId}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.preview}
                  </p>
                </div>
                <ScoreBadge score={c.score} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sugerencias de mejora del flujo */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Sugerencias de mejora del flujo
        </h3>
        <div className="space-y-3">
          {report.suggestions.map((s, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription className="text-primary">
                  {s.impact}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {s.detail}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
