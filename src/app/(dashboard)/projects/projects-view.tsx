"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ScoreBadge } from "@/components/shared/score-badge";
import { NewProjectDialog } from "@/app/(dashboard)/projects/new-project-dialog";
import { ScoreSparkline } from "@/app/(dashboard)/projects/score-sparkline";
import { projectsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";
import { formatDate } from "@/lib/format";

/* UX Review — ProjectsView
 * User: Operador que entra a /projects para abrir un proyecto o crear uno nuevo.
 * Goal: Ver el listado en <2s, identificar el proyecto con peor score y abrir, o crear uno.
 * Flow: /projects -> grid de cards -> click card abre /projects/{id}; click "Nuevo proyecto" abre modal.
 * States: loading (skeleton 6 cards), empty (CTA prominente), error (retry preserva intent), success.
 * Edge cases: 100+ proyectos -> grid se ajusta. Sin score (proyecto recien creado) -> "—". Sin sparkline -> espacio reservado.
 * Friction points: card entera clickeable, no solo el titulo. Score con color para escaneo rapido.
 * Benchmark: Vercel projects list pattern.
 */
export function ProjectsView() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => projectsApi.list(),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
          <p className="text-sm text-muted-foreground">
            Workspaces logicos. Cada proyecto agrupa agentes, conversaciones y
            evaluaciones.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Intenta recargar en unos segundos."
          }
          onRetry={() => void refetch()}
        />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="Aun no tenes proyectos"
          description="Cada proyecto representa un workspace de un cliente o flujo de bot. Crea el primero para empezar a evaluar conversaciones."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear primer proyecto
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((project) => (
            <Link
              key={project.public_id}
              href={`/projects/${project.public_id}`}
              className="group rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-colors group-hover:bg-accent/50">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="truncate text-base">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="truncate font-mono text-xs">
                        {project.slug}
                      </CardDescription>
                    </div>
                    <ScoreBadge value={project.avg_score ?? null} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                  <div className="flex items-end justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Conversaciones
                      </p>
                      <p className="text-sm font-medium tabular-nums">
                        {project.conversations_count?.toLocaleString("es-AR") ??
                          "0"}
                      </p>
                    </div>
                    <ScoreSparkline data={project.score_trend ?? []} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Creado {formatDate(project.created_at)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <CardTitle className="text-sm">Tip</CardTitle>
          </div>
          <CardDescription>
            Cuando creas un proyecto te damos un webhook secret. Lo mostramos
            UNA sola vez — guardalo en un manager seguro antes de cerrar la
            ventana.
          </CardDescription>
        </CardHeader>
      </Card>

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
