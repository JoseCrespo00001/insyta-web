"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Trash2, Upload, Workflow } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/format";
import { useCreateFlow, useDeleteFlow } from "@/lib/queries";
import type { Flujo } from "@/lib/projects/types";

export function FlujosTab({
  flujos,
  projectId,
}: {
  flujos: Flujo[];
  projectId: string;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
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
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/flows/${flujo.id}`}>
                    <Eye className="h-4 w-4" />
                    Ver flujo
                  </Link>
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
