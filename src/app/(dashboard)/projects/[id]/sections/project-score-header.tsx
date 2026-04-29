"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { formatScore, scoreColor } from "@/lib/format";
import type { ProjectMetrics } from "@/lib/api/schemas";

export function ProjectScoreHeader({ metrics }: { metrics: ProjectMetrics }) {
  const score = metrics.avg_score ?? null;
  const trend = metrics.trend_7d ?? [];
  const last = trend[trend.length - 1]?.score ?? score;
  const first = trend[0]?.score ?? score;
  const delta =
    last !== null && first !== null && last !== undefined && first !== undefined
      ? Math.round(last - first)
      : null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Score promedio
          </p>
          <div className="flex items-baseline gap-3">
            <span
              className={`text-5xl font-semibold tabular-nums ${scoreColor(
                score,
              )}`}
            >
              {formatScore(score)}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
            {delta !== null ? (
              <span
                className={`text-sm font-medium tabular-nums ${
                  delta >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {delta} ult. 7d
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Basado en {metrics.evaluations_count.toLocaleString("es-AR")}{" "}
            evaluaciones del periodo seleccionado.
          </p>
        </div>

        <div className="h-24 w-full max-w-md">
          {trend.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="score-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.375rem",
                    fontSize: "12px",
                  }}
                  labelClassName="text-foreground"
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill="url(#score-grad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
              Necesitas al menos 2 dias con evaluaciones para ver tendencia
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
