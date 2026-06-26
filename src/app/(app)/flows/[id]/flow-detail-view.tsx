"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  GitBranch,
  History,
  Lightbulb,
  Loader2,
  Pencil,
  Play,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { FlujoPlayground } from "@/app/(app)/improvements/flujo-playground";
import { FlujoGraph } from "@/app/(app)/projects/[id]/sections/flujo-graph";
import { FlowVersionHistory } from "./flow-version-history";
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
  type ImprovementDto,
  useAuditFlow,
  useDeleteFlow,
  useFlow,
  useFlowImprovements,
  useUpdateFlow,
  useUpdateImprovement,
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
  flowJson,
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
  flowJson?: string | null;
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
        <SuggestionExtras
          nodeJson={s.node_json}
          prompt={s.prompt}
          flowJson={flowJson}
        />
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
  const updateImprovement = useUpdateImprovement();
  const flowAudit = useAuditFlow(flowId);
  const [applyingId, setApplyingId] = React.useState<string | null>(null);

  // Aplica una mejora: el nodo ya viene mergeado en el JSON completo del flujo
  // (lo arma SuggestionExtras). Lo guardamos como una versión nueva y marcamos
  // la mejora como aplicada.
  function applyImprovement(imp: ImprovementDto, mergedFlowJson: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(mergedFlowJson);
    } catch {
      toast.error("No se pudo aplicar: el JSON resultante no es válido");
      return;
    }
    setApplyingId(imp.id);
    updateFlow.mutate(
      {
        id: flowId,
        flowJson: parsed,
        versionLabel: `Mejora: ${imp.title}`,
        versionSource: "improvement",
      },
      {
        onSuccess: () => {
          updateImprovement.mutate({ id: imp.id, status: "applied" });
          toast.success("Mejora aplicada — nueva versión guardada");
          setApplyingId(null);
        },
        onError: (err) => {
          toast.error(`No se pudo aplicar: ${(err as Error).message}`);
          setApplyingId(null);
        },
      },
    );
  }

  const [draft, setDraft] = React.useState("");
  React.useEffect(() => {
    if (flujo?.json) setDraft(flujo.json);
  }, [flujo?.json]);

  // Validez del JSON en vivo (para el editor): null = válido, string = error.
  const jsonError = React.useMemo<string | null>(() => {
    if (!draft.trim()) return "Vacío";
    try {
      JSON.parse(draft);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "JSON inválido";
    }
  }, [draft]);
  const jsonValid = jsonError === null;
  const jsonDirty = flujo ? draft !== flujo.json : false;
  const jsonLines = draft ? draft.split("\n").length : 0;
  const [jsonCopied, setJsonCopied] = React.useState(false);

  function formatJson() {
    try {
      setDraft(JSON.stringify(JSON.parse(draft), null, 2));
      toast.success("JSON formateado");
    } catch {
      toast.error("No se puede formatear: el JSON no es válido");
    }
  }

  function copyJson() {
    void navigator.clipboard.writeText(draft);
    setJsonCopied(true);
    window.setTimeout(() => setJsonCopied(false), 1500);
  }

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
      {
        id: flowId,
        flowJson: parsed,
        versionLabel: "Cambio manual en el JSON",
        versionSource: "manual",
      },
      {
        onSuccess: () => toast.success("Flujo actualizado — versión guardada"),
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
    const toastId = toast.loading(`Eliminando flujo "${flujo.name}"…`);
    deleteFlow.mutate(flowId, {
      onSuccess: () => {
        toast.success(`Flujo "${flujo.name}" eliminado`, { id: toastId });
        router.back();
      },
      onError: (err) =>
        toast.error(`No se pudo eliminar: ${(err as Error).message}`, {
          id: toastId,
        }),
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
                  <TabsTrigger value="historial" className="gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    Historial
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="grafo">
                  <FlujoGraph flujo={flujo} />
                </TabsContent>
                <TabsContent value="json" className="space-y-2">
                  {/* Barra de herramientas del editor */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      {jsonValid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-score-good/15 px-2 py-0.5 font-medium text-score-good">
                          <Check className="h-3.5 w-3.5" />
                          JSON válido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-score-critical/15 px-2 py-0.5 font-medium text-score-critical">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          JSON inválido
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {jsonLines} líneas · {formatBytes(draft.length)}
                        {jsonDirty ? " · sin guardar" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={copyJson}
                      >
                        {jsonCopied ? (
                          <Check className="h-3.5 w-3.5 text-score-good" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {jsonCopied ? "Copiado" : "Copiar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={formatJson}
                        disabled={!jsonValid}
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        Formatear
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    spellCheck={false}
                    className={cn(
                      "min-h-[72vh] w-full resize-y rounded-md border bg-muted p-4 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      !jsonValid && "border-score-critical/50",
                    )}
                  />
                  {!jsonValid && draft.trim() ? (
                    <p className="text-xs text-score-critical">{jsonError}</p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDraft(flujo.json ?? "")}
                      disabled={!jsonDirty}
                    >
                      Revertir
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveJson}
                      disabled={
                        updateFlow.isPending || !jsonDirty || !jsonValid
                      }
                    >
                      {updateFlow.isPending ? "Guardando…" : "Guardar JSON"}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="historial">
                  <FlowVersionHistory flowId={flowId} embedded />
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
                      <LlmSuggestion key={i} s={s} flowJson={flujo?.json} />
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
                    Mejoras que se pueden agregar · {improvements.length}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cambios al flujo sugeridos por las auditorías. Aplicá uno y se
                  guarda como una versión nueva (la podés revertir desde el
                  Historial).
                </p>
                {improvements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todavía no hay mejoras. Corré una auditoría sobre las
                    conversaciones de este flujo para generarlas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {improvements.map((imp) => {
                      const applicable = Boolean(imp.nodeJson || imp.prompt);
                      return (
                        <div
                          key={imp.id}
                          className={cn(
                            "rounded-lg border p-3",
                            imp.status === "applied" &&
                              "border-score-good/30 bg-score-good/5",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{imp.title}</p>
                            <div className="flex shrink-0 items-center gap-1.5">
                              {imp.status === "applied" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-score-good/15 px-2 py-0.5 text-xs font-medium text-score-good">
                                  <Check className="h-3 w-3" />
                                  Aplicada
                                </span>
                              ) : (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  Pendiente
                                </span>
                              )}
                              {imp.impact ? (
                                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                                  {imp.impact}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {imp.detail}
                          </p>
                          {applicable ? (
                            <SuggestionExtras
                              nodeJson={imp.nodeJson}
                              prompt={imp.prompt}
                              flowJson={flujo?.json}
                              onApply={(merged) =>
                                applyImprovement(imp, merged)
                              }
                              applying={applyingId === imp.id}
                              applied={imp.status === "applied"}
                            />
                          ) : (
                            <p className="mt-2 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                              Esta mejora es de una auditoría vieja y no trae el
                              cambio listo para aplicar. Corré una auditoría
                              nueva para generar el JSON del nodo + el prompt.
                            </p>
                          )}
                        </div>
                      );
                    })}
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
