"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  GitBranch,
  Lightbulb,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { FlujoPlayground } from "@/app/(app)/improvements/flujo-playground";
import { FlujoGraph } from "@/app/(app)/projects/[id]/sections/flujo-graph";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBytes, formatDate } from "@/lib/format";
import {
  analyzeFlow,
  type FlowSuggestion,
  type FlowSuggestionKind,
} from "@/lib/projects/flow-analysis";
import {
  useDeleteFlow,
  useFlow,
  useFlowImprovements,
  useUpdateFlow,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<FlowSuggestionKind, typeof Sparkles> = {
  agent: Users,
  condition: GitBranch,
  structure: AlertTriangle,
  io: AlertTriangle,
};

function SuggestionCard({ s }: { s: FlowSuggestion }) {
  const Icon = KIND_ICON[s.kind] ?? Lightbulb;
  const warn = s.severity === "warning";
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3",
        warn && "border-score-risk/30 bg-score-risk/5",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          warn
            ? "bg-score-risk/15 text-score-risk"
            : "bg-primary/15 text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{s.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>
      </div>
    </div>
  );
}

export function FlowDetailView({ flowId }: { flowId: string }) {
  const router = useRouter();
  const { data: flujo, isLoading } = useFlow(flowId);
  const updateFlow = useUpdateFlow();
  const deleteFlow = useDeleteFlow();
  const { data: improvements = [] } = useFlowImprovements(flowId);

  const [draft, setDraft] = React.useState("");
  React.useEffect(() => {
    if (flujo?.json) setDraft(flujo.json);
  }, [flujo?.json]);

  const analysis = React.useMemo(
    () => analyzeFlow(flujo?.json ?? ""),
    [flujo?.json],
  );

  function saveJson() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
    } catch {
      toast.error("El JSON no es válido");
      return;
    }
    updateFlow.mutate(
      { id: flowId, flowJson: parsed },
      {
        onSuccess: () => toast.success("Flujo actualizado"),
        onError: (err) =>
          toast.error(`No se pudo guardar: ${(err as Error).message}`),
      },
    );
  }

  function handleDelete() {
    if (!flujo) return;
    if (!window.confirm(`¿Eliminar el flujo "${flujo.name}"?`)) return;
    deleteFlow.mutate(flowId, {
      onSuccess: () => {
        toast.success("Flujo eliminado");
        router.back();
      },
      onError: (err) =>
        toast.error(`No se pudo eliminar: ${(err as Error).message}`),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 h-8 text-muted-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {flujo?.name ?? "Flujo"}
          </h1>
          {flujo ? (
            <p className="text-sm text-muted-foreground">
              v{flujo.version} · {flujo.agentCount} agentes ·{" "}
              {formatBytes(flujo.sizeBytes)} · {formatDate(flujo.createdAt)}
            </p>
          ) : null}
        </div>
        {flujo ? (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        ) : null}
      </div>

      {isLoading || !flujo ? (
        <div className="flex h-[60vh] items-center justify-center rounded-md border text-sm text-muted-foreground">
          Cargando flujo…
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Izquierda: grafo + JSON (toggle dentro de la card) */}
          <Card>
            <CardContent className="p-3">
              <Tabs defaultValue="grafo" className="space-y-3">
                <TabsList>
                  <TabsTrigger value="grafo">Grafo</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="grafo">
                  <FlujoGraph flujo={flujo} />
                </TabsContent>
                <TabsContent value="json" className="space-y-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    spellCheck={false}
                    className="min-h-[78vh] w-full resize-y rounded-md border bg-muted p-4 font-mono text-xs leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDraft(flujo.json ?? "")}
                    >
                      Revertir
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveJson}
                      disabled={updateFlow.isPending || draft === flujo.json}
                    >
                      {updateFlow.isPending ? "Guardando…" : "Guardar JSON"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Derecha: probar + sugerencias + mejoras */}
          <div className="space-y-5">
            <FlujoPlayground flujoName={flujo.name} />

            {/* Sugerencias estructurales (heurística sobre el grafo) */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    Sugerencias del flujo
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis.stats.nodeCount} nodos · {analysis.stats.edgeCount}{" "}
                  conexiones · {analysis.stats.agentCount} agentes ·{" "}
                  {analysis.stats.hasRouter ? "con ruteo" : "sin ruteo"}
                </p>
                <div className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <SuggestionCard key={i} s={s} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mejoras de auditorías */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    Mejoras de auditorías · {improvements.length}
                  </h3>
                </div>
                {improvements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todavía no hay mejoras. Corré una auditoría sobre las
                    conversaciones de este flujo para generarlas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {improvements.map((imp) => (
                      <div key={imp.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{imp.title}</p>
                          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                            {imp.impact}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {imp.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
