"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  GitBranch,
  Lightbulb,
  Loader2,
  Pencil,
  Play,
  Sparkles,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { FlujoPlayground } from "@/app/(app)/improvements/flujo-playground";
import { FlujoGraph } from "@/app/(app)/projects/[id]/sections/flujo-graph";
import { SuggestionExtras } from "@/components/shared/suggestion-extras";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBytes, formatDate } from "@/lib/format";
import {
  analyzeFlow,
  type FlowSuggestion,
  type FlowSuggestionKind,
} from "@/lib/projects/flow-analysis";
import {
  useAuditFlow,
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

const LLM_TYPE_ICON: Record<string, typeof Sparkles> = {
  add_tool: Wrench,
  multi_agent: Users,
  split_prompt: Lightbulb,
  add_condition: GitBranch,
  add_memory: Sparkles,
  add_fallback: AlertTriangle,
  rag: Sparkles,
  structure: AlertTriangle,
};

function LlmSuggestion({
  s,
}: {
  s: {
    type: string;
    title: string;
    detail: string;
    target: string;
    severity: string;
    impact: string;
    node_json?: string | null;
    prompt?: string | null;
  };
}) {
  const Icon = LLM_TYPE_ICON[s.type] ?? Sparkles;
  const crit = s.severity === "critical";
  const warn = s.severity === "warning";
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3",
        crit && "border-score-critical/30 bg-score-critical/5",
        warn && "border-score-risk/30 bg-score-risk/5",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          crit
            ? "bg-score-critical/15 text-score-critical"
            : warn
              ? "bg-score-risk/15 text-score-risk"
              : "bg-primary/15 text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{s.title}</p>
          {s.impact ? (
            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {s.impact}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>
        {s.target && s.target !== "flujo" ? (
          <p className="mt-1 text-xs text-muted-foreground">
            En: <span className="font-medium">{s.target}</span>
          </p>
        ) : null}
        <SuggestionExtras nodeJson={s.node_json} prompt={s.prompt} />
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
  const flowAudit = useAuditFlow(flowId);

  const [draft, setDraft] = React.useState("");
  React.useEffect(() => {
    if (flujo?.json) setDraft(flujo.json);
  }, [flujo?.json]);

  const analysis = React.useMemo(
    () => analyzeFlow(flujo?.json ?? ""),
    [flujo?.json],
  );

  function runFlowAudit(mode: "standard" | "deep") {
    flowAudit.mutate(mode, {
      onError: (e) =>
        toast.error(
          e instanceof Error ? e.message : "No se pudo auditar el flujo",
        ),
    });
  }

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

  const [editingName, setEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState("");

  function startRename() {
    setNameDraft(flujo?.name ?? "");
    setEditingName(true);
  }
  function saveRename() {
    const name = nameDraft.trim();
    if (!name) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    updateFlow.mutate(
      { id: flowId, name },
      {
        onSuccess: () => {
          toast.success("Nombre actualizado");
          setEditingName(false);
        },
        onError: (err) =>
          toast.error(`No se pudo renombrar: ${(err as Error).message}`),
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
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="h-9 w-72 text-lg font-semibold"
              />
              <Button
                size="icon"
                className="h-8 w-8"
                disabled={updateFlow.isPending}
                onClick={saveRename}
                aria-label="Guardar nombre"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setEditingName(false)}
                aria-label="Cancelar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {flujo?.name ?? "Flujo"}
              </h1>
              {flujo ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={startRename}
                  aria-label="Renombrar flujo"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}
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

            {/* Auditoría del flujo (LLM experto en Langflow) */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Auditar el flujo</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={flowAudit.isPending}
                      onClick={() => runFlowAudit("standard")}
                    >
                      {flowAudit.isPending &&
                      flowAudit.variables === "standard" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Auditar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={flowAudit.isPending}
                      onClick={() => runFlowAudit("deep")}
                    >
                      {flowAudit.isPending && flowAudit.variables === "deep" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Completo (Plus)
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis.stats.nodeCount} nodos · {analysis.stats.edgeCount}{" "}
                  conexiones · {analysis.stats.agentCount} agentes ·{" "}
                  {analysis.stats.hasRouter ? "con ruteo" : "sin ruteo"}
                </p>

                {flowAudit.isPending ? (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Analizando el flujo con el experto en Langflow…
                  </div>
                ) : flowAudit.data ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Completitud
                        </span>
                        <span className="text-sm font-semibold">
                          {flowAudit.data.completeness}/100
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${flowAudit.data.completeness}%` }}
                        />
                      </div>
                      {flowAudit.data.summary ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {flowAudit.data.summary}
                        </p>
                      ) : null}
                    </div>
                    {flowAudit.data.suggestions.map((s, i) => (
                      <LlmSuggestion key={i} s={s} />
                    ))}
                  </div>
                ) : (
                  // Sin auditoría LLM aún: análisis rápido heurístico.
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Análisis rápido (sin IA). Tocá “Auditar” para el análisis
                      completo con el experto en Langflow.
                    </p>
                    {analysis.suggestions.map((s, i) => (
                      <SuggestionCard key={i} s={s} />
                    ))}
                  </div>
                )}
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
                        <SuggestionExtras
                          nodeJson={imp.nodeJson}
                          prompt={imp.prompt}
                        />
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
