"use client";

import * as React from "react";
import { ArrowLeft, Eye, Trash2, Upload, Workflow } from "lucide-react";
import { toast } from "sonner";

import { FlujoGraph } from "./flujo-graph";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/format";
import {
  useCreateFlow,
  useDeleteFlow,
  useFlow,
  useUpdateFlow,
} from "@/lib/queries";
import type { Flujo } from "@/lib/projects/types";

export function FlujosTab({
  flujos,
  projectId,
}: {
  flujos: Flujo[];
  projectId: string;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const createFlow = useCreateFlow(projectId);
  const deleteFlow = useDeleteFlow(projectId);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    let flowJson: unknown;
    try {
      flowJson = JSON.parse(await file.text());
    } catch {
      toast.error("El archivo no es un JSON válido");
      return;
    }
    const parsed = flowJson as { name?: string; last_tested_version?: string };
    createFlow.mutate(
      {
        name: parsed.name || file.name.replace(/\.json$/i, ""),
        version: parsed.last_tested_version || "1.0",
        flowJson,
      },
      {
        onSuccess: (f) =>
          toast.success(`Flujo "${f.name}" subido (${f.agentCount} agentes)`),
        onError: (err) =>
          toast.error(
            err instanceof ApiError && err.status === 401
              ? "Iniciá sesión para subir flujos"
              : `No se pudo subir el flujo: ${(err as Error).message}`,
          ),
      },
    );
  }

  function handleDelete(flujo: Flujo) {
    if (!window.confirm(`¿Eliminar el flujo "${flujo.name}"?`)) return;
    deleteFlow.mutate(flujo.id, {
      onSuccess: () => toast.success("Flujo eliminado"),
      onError: (err) =>
        toast.error(`No se pudo eliminar: ${(err as Error).message}`),
    });
  }

  if (viewingId) {
    return (
      <FlujoDetail
        flowId={viewingId}
        projectId={projectId}
        onBack={() => setViewingId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Un flujo es el JSON completo del agente (los agentes y cómo
          responden). Subí varios para testearlos y mejorarlos.
        </p>
        <Button onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Subir flujo
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {flujos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Workflow className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Todavía no subiste ningún flujo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flujos.map((flujo) => (
            <Card key={flujo.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{flujo.name}</CardTitle>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    v{flujo.version}
                  </span>
                </div>
                <CardDescription>
                  {flujo.agentCount} agentes · {formatBytes(flujo.sizeBytes)} ·{" "}
                  {formatDate(flujo.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingId(flujo.id)}
                >
                  <Eye className="h-4 w-4" />
                  Ver flujo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(flujo)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FlujoDetail({
  flowId,
  projectId,
  onBack,
}: {
  flowId: string;
  projectId: string;
  onBack: () => void;
}) {
  const { data: flujo, isLoading } = useFlow(flowId);
  const updateFlow = useUpdateFlow(projectId);
  const [draft, setDraft] = React.useState<string>("");

  React.useEffect(() => {
    if (flujo?.json) setDraft(flujo.json);
  }, [flujo?.json]);

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

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-1 h-8 text-muted-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Flujos
        </Button>
        <h2 className="text-xl font-semibold tracking-tight">
          {flujo?.name ?? "Flujo"}
        </h2>
        {flujo ? (
          <p className="text-sm text-muted-foreground">
            v{flujo.version} · {flujo.agentCount} agentes ·{" "}
            {formatBytes(flujo.sizeBytes)} · {formatDate(flujo.createdAt)}
          </p>
        ) : null}
      </div>

      {isLoading || !flujo ? (
        <div className="flex h-[60vh] items-center justify-center rounded-md border text-sm text-muted-foreground">
          Cargando flujo…
        </div>
      ) : (
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
      )}
    </div>
  );
}
