"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectScoreHeader } from "@/app/(dashboard)/projects/[id]/sections/project-score-header";
import { BreakdownCards } from "@/app/(dashboard)/projects/[id]/sections/breakdown-cards";
import { TopProblematicTable } from "@/app/(dashboard)/projects/[id]/sections/top-problematic-table";
import { TopicsDonut } from "@/app/(dashboard)/projects/[id]/sections/topics-donut";
import { ProjectFilters } from "@/app/(dashboard)/projects/[id]/sections/project-filters";
import { projectsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";

export type ProjectDetailFilters = {
  from?: string;
  to?: string;
  agent_id?: string;
};

/* UX Review — ProjectDetailView
 * User: Operador que entra a un proyecto para ver su salud y tomar accion.
 * Goal: Identificar score actual + tendencia + tema problematico + top conv malas, en <10s.
 * Flow: /projects/{id} -> ve score 0-100 + sparkline 7d + 4 cards breakdown + tabla top + donut topics.
 *   Filtros (date range + agent) recargan secciones SIN recargar la pagina.
 * States: loading (skeletons por seccion), error (retry por seccion sin perder filtros), empty (sin evaluations -> CTA "subir CSV"), success.
 * Edge cases:
 *  - Sin evaluations -> empty state con CTA a /upload, no se renderizan tarjetas vacias.
 *  - Filtros aplicados que no devuelven datos -> empty state con boton "Limpiar filtros".
 *  - Score null en periodo elegido -> "—" en cards, sparkline vacia.
 * Friction points: filtros stickeados arriba, link upload destacado para que el operador no dude.
 * Benchmark: Stripe dashboard / Vercel analytics layout.
 */
export function ProjectDetailView({
  projectPublicId,
}: {
  projectPublicId: string;
}) {
  const [filters, setFilters] = React.useState<ProjectDetailFilters>({});

  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(projectPublicId),
    queryFn: () => projectsApi.get(projectPublicId),
  });

  const agentsQuery = useQuery({
    queryKey: queryKeys.projects.agents(projectPublicId),
    queryFn: () => projectsApi.agents(projectPublicId),
  });

  const metricsQuery = useQuery({
    queryKey: queryKeys.projects.metrics(projectPublicId, filters),
    queryFn: () => projectsApi.metrics(projectPublicId, filters),
  });

  if (projectQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <ErrorState
        title="No pudimos cargar el proyecto"
        message={
          projectQuery.error instanceof Error
            ? projectQuery.error.message
            : undefined
        }
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  const metrics = metricsQuery.data;
  const hasFilters = Boolean(filters.from || filters.to || filters.agent_id);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            Todos los proyectos
          </Link>
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name ?? project.public_id}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            {project.public_id}
            {project.slug ? ` · ${project.slug}` : null}
          </p>
          {project.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          ) : null}
        </div>
        <Button asChild>
          <Link href={`/projects/${project.public_id}/upload`}>
            <UploadCloud className="h-4 w-4" />
            Subir CSV
          </Link>
        </Button>
      </header>

      <ProjectFilters
        agents={agentsQuery.data?.items ?? []}
        value={filters}
        onChange={setFilters}
      />

      {metricsQuery.isLoading ? (
        <Skeleton className="h-44 w-full rounded-lg" />
      ) : metricsQuery.isError ? (
        <ErrorState
          message={
            metricsQuery.error instanceof Error
              ? metricsQuery.error.message
              : undefined
          }
          onRetry={() => void metricsQuery.refetch()}
        />
      ) : !metrics || metrics.evaluations_count === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title={
            hasFilters
              ? "No hay evaluaciones en este periodo"
              : "Aun no hay evaluaciones"
          }
          description={
            hasFilters
              ? "Probá con otro rango de fechas o agente."
              : "Sube un CSV o conecta el webhook para empezar a evaluar conversaciones."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={() => setFilters({})}>
                Limpiar filtros
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/projects/${project.public_id}/upload`}>
                  <UploadCloud className="h-4 w-4" />
                  Subir primer CSV
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <ProjectScoreHeader metrics={metrics} />

          {/* Breakdown deshabilitado hasta que backend extienda /score con
              resolution_rate, avg_satisfaction, frustration_rate, escalation_rate
              (Wave 4). Mostramos las cards con "—" para que el operador sepa
              que esta planeado, pero no inventamos datos. */}
          <BreakdownCards metrics={metrics} />
          {metrics.resolution_rate === null &&
          metrics.avg_satisfaction === null &&
          metrics.frustration_rate === null &&
          metrics.escalation_rate === null ? (
            <p className="text-xs text-muted-foreground">
              El breakdown detallado se habilita cuando el backend exponga las
              dimensiones (Wave 4).
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Top conversaciones problematicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopProblematicTable
                  projectPublicId={project.public_id}
                  filters={filters}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 temas</CardTitle>
              </CardHeader>
              <CardContent>
                <TopicsDonut topics={metrics.top_topics} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
