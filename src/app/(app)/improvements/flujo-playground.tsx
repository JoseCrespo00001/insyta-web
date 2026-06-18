import * as React from "react";
import { AlertTriangle, CheckCircle2, Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { runFlujo, TEST_CASES } from "@/lib/projects/mock";
import type { FlujoRun, RunStep } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

type Status = "idle" | "running" | "done";

function StepIcon({ status }: { status: RunStep["status"] }) {
  if (status === "ok") {
    return <CheckCircle2 className="h-4 w-4 text-score-good" />;
  }
  return <AlertTriangle className="h-4 w-4 text-score-risk" />;
}

export function FlujoPlayground({ flujoName }: { flujoName: string }) {
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [run, setRun] = React.useState<FlujoRun | null>(null);

  function correr() {
    if (!message.trim()) return;
    setStatus("running");
    setRun(null);
    // Mock: el backend ejecuta el flujo real. Acá simulamos los pasos.
    window.setTimeout(() => {
      setRun(runFlujo(message));
      setStatus("done");
    }, 1100);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Probar el flujo</CardTitle>
        <CardDescription>
          Inventá un problema o mensaje y corré {flujoName} para ver paso a paso
          qué hace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Casos inventados */}
        <div className="flex flex-wrap gap-2">
          {TEST_CASES.map((tc) => (
            <button
              key={tc.id}
              type="button"
              onClick={() => setMessage(tc.message)}
              className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              {tc.label}
            </button>
          ))}
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribí un mensaje del usuario…"
          rows={2}
        />

        <Button
          onClick={correr}
          disabled={!message.trim() || status === "running"}
        >
          {status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Correr flujo
        </Button>

        {status === "running" ? (
          <p className="text-sm text-muted-foreground">
            Ejecutando el flujo paso a paso…
          </p>
        ) : null}

        {status === "done" && run ? (
          <div className="space-y-4 pt-1">
            {/* Pasos */}
            <div>
              {run.steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <StepIcon status={s.status} />
                    {i < run.steps.length - 1 ? (
                      <div className="w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">{s.node}</p>
                    <p className="text-sm text-muted-foreground">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resultado */}
            <div
              className={cn(
                "space-y-1 rounded-md border p-3 text-sm",
                run.resolved ? "bg-score-good/10" : "bg-score-critical/10",
              )}
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ruta</span>
                <span className="font-medium capitalize">{run.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resuelto</span>
                <span className="font-medium">
                  {run.resolved ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Satisfacción estimada
                </span>
                <span className="font-medium capitalize">
                  {run.predictedSatisfaction}
                </span>
              </div>
              <p className="pt-1 text-muted-foreground">
                Respuesta: &ldquo;{run.response}&rdquo;
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
