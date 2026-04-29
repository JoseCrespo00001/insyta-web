"use client";

import {
  AlertTriangle,
  CheckCircle2,
  PhoneOutgoing,
  Smile,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPercent } from "@/lib/format";
import type { ProjectMetrics } from "@/lib/api/schemas";

const ITEMS: Array<{
  key: keyof Pick<
    ProjectMetrics,
    | "resolution_rate"
    | "avg_satisfaction"
    | "frustration_rate"
    | "escalation_rate"
  >;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  format: "percent" | "rating5";
  inverted?: boolean;
}> = [
  {
    key: "resolution_rate",
    label: "Resolucion",
    description: "% conversaciones con consulta resuelta.",
    icon: CheckCircle2,
    format: "percent",
  },
  {
    key: "avg_satisfaction",
    label: "Satisfaccion",
    description: "Promedio 1-5 detectado por la evaluacion.",
    icon: Smile,
    format: "rating5",
  },
  {
    key: "frustration_rate",
    label: "Frustracion",
    description: "% conversaciones con frustracion detectada.",
    icon: AlertTriangle,
    format: "percent",
    inverted: true,
  },
  {
    key: "escalation_rate",
    label: "Escalado",
    description: "% conversaciones que pidieron humano.",
    icon: PhoneOutgoing,
    format: "percent",
    inverted: true,
  },
];

function formatValue(
  value: number | null,
  format: "percent" | "rating5",
): string {
  if (value === null || value === undefined) return "—";
  if (format === "rating5") return value.toFixed(1);
  return formatPercent(value);
}

function valueColor(
  value: number | null,
  format: "percent" | "rating5",
  inverted?: boolean,
): string {
  if (value === null || value === undefined) return "text-muted-foreground";
  let normalized = value;
  if (format === "rating5") normalized = value / 5;
  if (inverted) normalized = 1 - normalized;
  if (normalized >= 0.8) return "text-emerald-600 dark:text-emerald-400";
  if (normalized >= 0.5) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function BreakdownCards({ metrics }: { metrics: ProjectMetrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const value = metrics[item.key];
        return (
          <Card key={item.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{item.label}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <CardTitle
                className={`text-3xl tabular-nums ${valueColor(value, item.format, item.inverted)}`}
              >
                {formatValue(value, item.format)}
                {item.format === "rating5" ? (
                  <span className="ml-1 text-sm text-muted-foreground">/5</span>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {item.description}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
