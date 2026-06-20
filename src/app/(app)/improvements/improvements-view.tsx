"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useAllFlows } from "@/lib/queries";

export function ImprovementsView() {
  const { data: flows = [], isLoading } = useAllFlows();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mejoras</h1>
        <p className="text-muted-foreground">
          Elegí un flujo para abrir su detalle: grafo, JSON, probarlo y las
          mejoras propuestas por las auditorías.
        </p>
      </div>

      {isLoading ? (
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
            <Link
              key={f.id}
              href={`/flows/${f.id}`}
              className="group rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{f.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                v{f.version} · {f.agentCount} agentes
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
