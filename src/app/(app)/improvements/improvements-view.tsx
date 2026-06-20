"use client";

import * as React from "react";
import { Check, Loader2, Workflow, X } from "lucide-react";

import { FlujoPlayground } from "./flujo-playground";
import { ConversationWorkspace } from "@/components/shared/conversation-workspace";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { makeConversationStub } from "@/lib/projects/empty";
import {
  useAllFlows,
  useFlowImprovements,
  useUpdateImprovement,
} from "@/lib/queries";
import type { Conversation } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-muted text-muted-foreground" },
  approved: { label: "Aprobada", cls: "bg-score-good/15 text-score-good" },
  rejected: {
    label: "Rechazada",
    cls: "bg-score-critical/15 text-score-critical",
  },
  applied: { label: "Aplicada", cls: "bg-primary/15 text-primary" },
  measured: { label: "Medida", cls: "bg-primary/15 text-primary" },
};

export function ImprovementsView() {
  const [flujoId, setFlujoId] = React.useState<string | null>(null);
  const [viewing, setViewing] = React.useState<Conversation | null>(null);

  const { data: flows = [], isLoading: loadingFlows } = useAllFlows();
  const { data: improvements = [], isLoading: loadingImps } =
    useFlowImprovements(flujoId);
  const updateImp = useUpdateImprovement();

  const selectedFlujo = flows.find((f) => f.id === flujoId);

  if (viewing) {
    return (
      <ConversationWorkspace
        conversation={viewing}
        onBack={() => setViewing(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mejoras</h1>
        <p className="text-muted-foreground">
          Elegí un flujo para ver las mejoras propuestas por las auditorías, con
          el porqué y las conversaciones que las motivaron.
        </p>
      </div>

      {/* Selector de flujo */}
      {loadingFlows ? (
        <p className="text-sm text-muted-foreground">Cargando flujos…</p>
      ) : flows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No hay flujos cargados todavía. Subí uno en un proyecto.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFlujoId(f.id)}
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
      )}

      {/* Probar el flujo (simulador local — sin runtime de Langflow aún) */}
      {selectedFlujo ? (
        <FlujoPlayground flujoName={selectedFlujo.name} />
      ) : null}

      {/* Mejoras del flujo */}
      {!flujoId ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Elegí un flujo para ver sus mejoras.
          </CardContent>
        </Card>
      ) : loadingImps ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="font-medium">Cargando mejoras…</span>
          </CardContent>
        </Card>
      ) : improvements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Este flujo todavía no tiene mejoras. Corré una auditoría sobre sus
            conversaciones para generarlas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {improvements.map((imp) => {
            const meta = STATUS_META[imp.status] ?? STATUS_META.pending;
            const busy = updateImp.isPending;
            return (
              <Card key={imp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{imp.title}</CardTitle>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        meta.cls,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
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

                  {imp.conversations.length > 0 ? (
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
                            onClick={() => setViewing(makeConversationStub(c))}
                            className="flex w-full items-center justify-between gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted"
                          >
                            <span className="min-w-0 truncate">
                              <span className="font-medium">
                                {c.contactName}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                #{c.externalId} — {c.preview}
                              </span>
                            </span>
                            <ScoreBadge score={c.score} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {imp.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          updateImp.mutate({ id: imp.id, status: "approved" })
                        }
                      >
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          updateImp.mutate({ id: imp.id, status: "rejected" })
                        }
                      >
                        <X className="h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
