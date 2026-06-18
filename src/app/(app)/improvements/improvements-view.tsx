"use client";

import * as React from "react";
import { Loader2, Sparkles, Workflow } from "lucide-react";

import { ConversationDetailBody } from "@/components/shared/conversation-detail-body";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FLUJO_IMPROVEMENTS, SAMPLE_FLUJOS } from "@/lib/projects/mock";
import type { Conversation, FlujoImprovement } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done";

export function ImprovementsView() {
  const [flujoId, setFlujoId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [improvements, setImprovements] = React.useState<FlujoImprovement[]>(
    [],
  );
  const [viewing, setViewing] = React.useState<Conversation | null>(null);

  function selectFlujo(id: string) {
    setFlujoId(id);
    setStatus("idle");
    setImprovements([]);
  }

  function analyze() {
    if (!flujoId) return;
    setStatus("loading");
    setImprovements([]);
    // Mock: corre en background. El backend hará el análisis real con Sonnet.
    window.setTimeout(() => {
      setImprovements(FLUJO_IMPROVEMENTS);
      setStatus("done");
    }, 1800);
  }

  const selectedFlujo = SAMPLE_FLUJOS.find((f) => f.id === flujoId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mejoras</h1>
        <p className="text-muted-foreground">
          Elegí un flujo y generá sugerencias de mejora, con el porqué y las
          conversaciones que las motivaron.
        </p>
      </div>

      {/* Selector de flujo */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_FLUJOS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => selectFlujo(f.id)}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors",
              flujoId === f.id
                ? "border-primary bg-primary/10"
                : "hover:bg-muted",
            )}
          >
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{f.name}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              v{f.version} · {f.agentCount} agentes
            </p>
          </button>
        ))}
      </div>

      {/* Acción / estado */}
      {!flujoId ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Elegí un flujo para analizar.
          </CardContent>
        </Card>
      ) : status === "idle" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={analyze}>
            <Sparkles className="h-4 w-4" />
            Analizar flujo
          </Button>
          <span className="text-sm text-muted-foreground">
            Corre en background sobre {selectedFlujo?.name}.
          </span>
        </div>
      ) : status === "loading" ? (
        <Card>
          <CardContent className="space-y-3 py-10">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium">
                Analizando {selectedFlujo?.name}…
              </span>
            </div>
            <ul className="space-y-1 pl-8 text-sm text-muted-foreground">
              <li>Recolectando conversaciones del flujo…</li>
              <li>Agrupando patrones de fallo por tema…</li>
              <li>Analizando con Claude Sonnet…</li>
              <li>Generando sugerencias de mejora…</li>
            </ul>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {improvements.map((imp, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{imp.title}</CardTitle>
                <CardDescription className="text-primary">
                  {imp.impact}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{imp.detail}</p>

                <div className="rounded-md border-l-2 border-primary bg-muted/40 p-3 text-sm">
                  <span className="font-medium">Por qué: </span>
                  {imp.why}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Conversaciones que lo necesitaron (
                    {imp.conversations.length})
                  </p>
                  <div className="space-y-1.5">
                    {imp.conversations.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setViewing(c)}
                        className="flex w-full items-center justify-between gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted"
                      >
                        <span className="min-w-0 truncate">
                          <span className="font-medium">{c.contactName}</span>{" "}
                          <span className="text-muted-foreground">
                            #{c.externalId} — {c.preview}
                          </span>
                        </span>
                        <ScoreBadge score={c.score} />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detalle de conversación */}
      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{viewing?.contactName}</SheetTitle>
            <SheetDescription>
              #{viewing?.externalId} · {viewing?.messageCount} mensajes
            </SheetDescription>
          </SheetHeader>
          {viewing ? <ConversationDetailBody conversation={viewing} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
