"use client";

import { ExternalLink, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, scoreColor } from "@/lib/format";
import type { Evaluation } from "@/lib/api/schemas";

const PHOENIX_ENDPOINT =
  process.env.NEXT_PUBLIC_PHOENIX_ENDPOINT ?? "http://localhost:6006";

type Dimension = {
  key: string;
  label: string;
  hint: string;
  render: (e: Evaluation) => React.ReactNode;
};

const DIMENSIONS: Dimension[] = [
  {
    key: "resolution",
    label: "Resolucion",
    hint: "Si la consulta del cliente fue resuelta antes de cerrar la conversacion.",
    render: (e) =>
      e.resolution === null || e.resolution === undefined ? (
        <Badge variant="secondary">—</Badge>
      ) : (
        <Badge variant={e.resolution ? "success" : "destructive"}>
          {e.resolution ? "Resuelta" : "Sin resolver"}
        </Badge>
      ),
  },
  {
    key: "satisfaction",
    label: "Satisfaccion",
    hint: "Estimacion 1-5 en base al lenguaje del cliente al final del chat.",
    render: (e) => (
      <Badge variant="outline" className="tabular-nums">
        {e.satisfaction !== null && e.satisfaction !== undefined
          ? `${e.satisfaction.toFixed(1)} / 5`
          : "—"}
      </Badge>
    ),
  },
  {
    key: "tone",
    label: "Tono",
    hint: "Tono general del agente: positive / neutral / negative.",
    render: (e) => (
      <Badge
        variant={
          e.tone === "positive"
            ? "success"
            : e.tone === "negative"
              ? "destructive"
              : "secondary"
        }
      >
        {e.tone ?? "—"}
      </Badge>
    ),
  },
  {
    key: "frustration",
    label: "Frustracion",
    hint: "Si el cliente expreso frustracion en algun mensaje. (Pendiente: backend aun no devuelve este campo.)",
    render: (e) =>
      e.frustration === undefined ? (
        <Badge variant="secondary">—</Badge>
      ) : (
        <Badge variant={e.frustration ? "destructive" : "secondary"}>
          {e.frustration ? "Detectada" : "No detectada"}
        </Badge>
      ),
  },
  {
    key: "escalated",
    label: "Escalado",
    hint: "Si el cliente pidio hablar con un humano o el flujo lo derivo. (Pendiente: backend aun no devuelve este campo.)",
    render: (e) =>
      e.escalated === undefined ? (
        <Badge variant="secondary">—</Badge>
      ) : (
        <Badge variant={e.escalated ? "warning" : "secondary"}>
          {e.escalated ? "Si" : "No"}
        </Badge>
      ),
  },
  {
    key: "efficiency",
    label: "Eficiencia",
    hint: "Que tan eficiente fue el agente en mensajes/tiempo (1-5). (Pendiente: backend aun no devuelve este campo.)",
    render: (e) => (
      <Badge variant="outline" className="tabular-nums">
        {e.efficiency !== undefined ? `${e.efficiency} / 5` : "—"}
      </Badge>
    ),
  },
];

export function EvaluationSidebar({
  evaluation,
}: {
  evaluation: Evaluation | null;
}) {
  if (!evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evaluacion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta conversacion aun no fue evaluada. Vuelve en unos minutos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-5xl font-semibold tabular-nums ${scoreColor(
                evaluation.score,
              )}`}
            >
              {evaluation.score !== null && evaluation.score !== undefined
                ? Math.round(evaluation.score)
                : "—"}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          {evaluation.scope_violation ? (
            <Badge variant="destructive">
              Fuera de scope del system prompt
            </Badge>
          ) : null}
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            {DIMENSIONS.map((dim) => (
              <Tooltip key={dim.key}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col gap-1 rounded-md border bg-card p-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {dim.label}
                    </span>
                    {dim.render(evaluation)}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px]">
                  {dim.hint}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>

      {evaluation.topic || evaluation.summary ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {evaluation.topic ? (
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tema
                </p>
                <Badge variant="secondary">{evaluation.topic}</Badge>
              </div>
            ) : null}
            {evaluation.summary ? (
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Resumen
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {evaluation.summary}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {evaluation.tokens_used !== undefined ||
      evaluation.cost_usd !== undefined ||
      evaluation.model_used !== undefined ||
      evaluation.phoenix_span_id ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Costo del LLM</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-2 text-xs">
              <dt className="text-muted-foreground">Modelo</dt>
              <dd className="text-right font-mono">
                {evaluation.model_used ?? "—"}
              </dd>
              <dt className="text-muted-foreground">Tokens</dt>
              <dd className="text-right tabular-nums">
                {evaluation.tokens_used !== undefined
                  ? evaluation.tokens_used.toLocaleString("es-AR")
                  : "—"}
              </dd>
              <dt className="text-muted-foreground">Costo</dt>
              <dd className="text-right tabular-nums">
                {formatCurrency(evaluation.cost_usd)}
              </dd>
            </dl>
            {evaluation.phoenix_span_id ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                <a
                  href={`${PHOENIX_ENDPOINT}/v1/traces/${evaluation.phoenix_span_id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver en Phoenix
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              disabled
              aria-label="Marcar como falso positivo (proximamente)"
            >
              <Flag className="h-3.5 w-3.5" />
              Marcar falso positivo
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Disponible en la proxima iteracion.</TooltipContent>
      </Tooltip>
    </div>
  );
}
