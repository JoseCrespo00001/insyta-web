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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/shared/error-state";
import { CsvDropzone } from "@/app/(dashboard)/projects/[id]/upload/csv-dropzone";
import { UploadProgress } from "@/app/(dashboard)/projects/[id]/upload/upload-progress";
import { projectsApi, uploadsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";
import type { Platform, Upload } from "@/lib/api/schemas";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "wati", label: "WATI" },
  { value: "respond_io", label: "Respond.io" },
  { value: "manychat", label: "Manychat" },
  { value: "sdk", label: "SDK / Webhook" },
];

const MAX_BYTES = 50 * 1024 * 1024;

/* UX Review — UploadView
 * User: Operador con un CSV de conversaciones que quiere evaluarlas.
 * Goal: Subir el archivo en <1 minuto y ver progreso hasta completar.
 * Flow: /projects/{id}/upload -> elegir agent + platform -> drop CSV -> POST -> ver progress polling -> redirect /projects/{id} al completar.
 * States: idle (sin file) | submitting (subiendo) | tracking (polling) | completed (toast + redirect) | failed (error message + retry).
 * Edge cases:
 *  - >50MB -> rechazado en cliente con mensaje claro.
 *  - !.csv -> rechazado.
 *  - Sin agents en el project -> empty state con link a configurar agente.
 *  - Polling se detiene cuando status in completed/failed.
 *  - Doble drop -> reemplaza el primer archivo (react-dropzone maxFiles=1).
 *  - Connection lost mid-upload -> toast con error.
 * Friction points: el form (agent + platform) esta ARRIBA del dropzone para no scrollear despues de soltar.
 * Benchmark: Vercel CSV import / Stripe data uploads.
 */
export function UploadView({ projectPublicId }: { projectPublicId: string }) {
  const router = useRouter();
  const [agentId, setAgentId] = React.useState<string>("");
  const [platform, setPlatform] = React.useState<Platform>("wati");
  const [activeUploadId, setActiveUploadId] = React.useState<string | null>(
    null,
  );

  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(projectPublicId),
    queryFn: () => projectsApi.get(projectPublicId),
  });

  const agentsQuery = useQuery({
    queryKey: queryKeys.projects.agents(projectPublicId),
    queryFn: () => projectsApi.agents(projectPublicId),
  });

  React.useEffect(() => {
    if (!agentId && agentsQuery.data?.items.length) {
      setAgentId(agentsQuery.data.items[0].public_id);
      setPlatform(agentsQuery.data.items[0].platform);
    }
  }, [agentId, agentsQuery.data]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadsApi.create(projectPublicId, { file, agentId, platform }),
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
    if (!agentId) {
      toast.error("Elegi un agente antes de subir.");
      return;
    }
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
          {projectQuery.data
            ? `Proyecto: ${projectQuery.data.name}`
            : "Subi un CSV con tus conversaciones para evaluarlas con IA."}
        </p>
      </header>

      {agentsQuery.isLoading || projectQuery.isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : agentsQuery.isError || projectQuery.isError ? (
        <ErrorState onRetry={() => void agentsQuery.refetch()} />
      ) : !agentsQuery.data || agentsQuery.data.items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Falta configurar un agente
            </CardTitle>
            <CardDescription>
              Antes de subir conversaciones necesitas crear el agente al que
              pertenecen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/projects/${projectPublicId}/settings/agents`}>
                Configurar agente
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del archivo</CardTitle>
            <CardDescription>
              Decinos a que agente pertenecen las conversaciones y de que
              plataforma vienen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agent">Agente</Label>
                <Select
                  value={agentId}
                  onValueChange={setAgentId}
                  disabled={uploadMutation.isPending || !!activeUploadId}
                >
                  <SelectTrigger id="agent">
                    <SelectValue placeholder="Elegi un agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentsQuery.data.items.map((a) => (
                      <SelectItem key={a.public_id} value={a.public_id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Plataforma origen</Label>
                <Select
                  value={platform}
                  onValueChange={(v) => setPlatform(v as Platform)}
                  disabled={uploadMutation.isPending || !!activeUploadId}
                >
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
