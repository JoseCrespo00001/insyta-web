"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { CsvDropzone } from "@/app/(dashboard)/projects/[id]/upload/csv-dropzone";
import { UploadProgress } from "@/app/(dashboard)/projects/[id]/upload/upload-progress";
import { projectsApi, uploadsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";
import type { Upload } from "@/lib/api/schemas";

const MAX_BYTES = 50 * 1024 * 1024;

/* UX Review — UploadView
 * User: Operador con un CSV de conversaciones que quiere evaluarlas.
 * Goal: Subir el archivo en <1 minuto y ver progreso hasta completar.
 * Flow: /projects/{id}/upload -> drop CSV -> POST -> ver progress polling -> redirect /projects/{id}.
 * States: idle (sin file) | submitting | tracking (polling) | completed | failed.
 * Edge cases:
 *  - >50MB -> rechazado en cliente con mensaje claro.
 *  - !.csv -> rechazado.
 *  - Polling se detiene cuando status in completed/failed.
 *  - Doble drop -> reemplaza (react-dropzone maxFiles=1).
 *
 * Reconciliacion Wave 3B: el backend hoy SOLO acepta `project_public_id` +
 * `file` en POST /api/v1/uploads/csv. No acepta agent_id ni platform aun
 * (issue Linear: extender uploads/csv en Wave 4 para tomar agent_id y
 * platform). Por eso el form simplificado a solo dropzone.
 */
export function UploadView({ projectPublicId }: { projectPublicId: string }) {
  const router = useRouter();
  const [activeUploadId, setActiveUploadId] = React.useState<string | null>(
    null,
  );

  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(projectPublicId),
    queryFn: () => projectsApi.get(projectPublicId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadsApi.create(projectPublicId, { file }),
    onSuccess: (data) => {
      setActiveUploadId(data.public_id);
      toast.success("Archivo recibido. Procesando...");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : "No pudimos subir el archivo. Intenta de nuevo.";
      toast.error(msg);
    },
  });

  const handleFile = (file: File) => {
    uploadMutation.mutate(file);
  };

  const onUploadComplete = (upload: Upload) => {
    if (upload.status === "completed") {
      toast.success(
        `Procesamos ${upload.rows_processed?.toLocaleString("es-AR") ?? "?"} conversaciones.`,
      );
      router.push(`/projects/${projectPublicId}`);
    } else if (upload.status === "failed") {
      toast.error(upload.error_message ?? "El procesamiento fallo.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/projects/${projectPublicId}`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al proyecto
          </Link>
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Subir conversaciones
        </h1>
        <p className="text-sm text-muted-foreground">
          {projectQuery.data?.name
            ? `Proyecto: ${projectQuery.data.name}`
            : "Subi un CSV con tus conversaciones para evaluarlas con IA."}
        </p>
      </header>

      {projectQuery.isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : projectQuery.isError ? (
        <ErrorState onRetry={() => void projectQuery.refetch()} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Archivo CSV</CardTitle>
            <CardDescription>
              Maximo 50 MB. Aceptamos solo .csv. Cada fila debe representar un
              mensaje de la conversacion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeUploadId ? (
              <UploadProgress
                uploadPublicId={activeUploadId}
                onSettled={onUploadComplete}
                onReset={() => {
                  setActiveUploadId(null);
                  uploadMutation.reset();
                }}
              />
            ) : (
              <CsvDropzone
                onFile={handleFile}
                disabled={uploadMutation.isPending}
                maxBytes={MAX_BYTES}
              />
            )}

            {uploadMutation.isPending && !activeUploadId ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Subiendo archivo...
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
