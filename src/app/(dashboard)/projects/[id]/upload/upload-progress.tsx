"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { uploadsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";
import { formatBytes } from "@/lib/format";
import type { Upload, UploadStatus } from "@/lib/api/schemas";

type Props = {
  uploadPublicId: string;
  onSettled: (upload: Upload) => void;
  onReset: () => void;
};

const STATUS_META: Record<
  UploadStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: "default" | "secondary" | "destructive" | "success" | "warning";
  }
> = {
  pending: { label: "En cola", icon: Clock, badge: "secondary" },
  processing: { label: "Procesando", icon: Loader2, badge: "default" },
  completed: { label: "Completo", icon: CheckCircle2, badge: "success" },
  failed: { label: "Fallido", icon: AlertCircle, badge: "destructive" },
};

export function UploadProgress({ uploadPublicId, onSettled, onReset }: Props) {
  const query = useQuery({
    queryKey: queryKeys.uploads.detail(uploadPublicId),
    queryFn: () => uploadsApi.get(uploadPublicId),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (!status) return 3_000;
      return status === "completed" || status === "failed" ? false : 3_000;
    },
    refetchIntervalInBackground: true,
  });

  const settledRef = React.useRef(false);
  React.useEffect(() => {
    const upload = query.data;
    if (!upload || settledRef.current) return;
    if (upload.status === "completed" || upload.status === "failed") {
      settledRef.current = true;
      onSettled(upload);
    }
  }, [query.data, onSettled]);

  if (query.isLoading || !query.data) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-card p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Conectando con el servidor...
      </div>
    );
  }

  const upload = query.data;
  const meta = STATUS_META[upload.status];
  const Icon = meta.icon;

  const percent =
    upload.rows_total && upload.rows_total > 0
      ? Math.min(
          100,
          Math.round(((upload.rows_processed ?? 0) / upload.rows_total) * 100),
        )
      : upload.status === "completed"
        ? 100
        : upload.status === "processing"
          ? undefined
          : 0;

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium">{upload.filename}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(upload.size_bytes)}
          </p>
        </div>
        <Badge variant={meta.badge} className="gap-1">
          <Icon
            className={
              upload.status === "processing"
                ? "h-3 w-3 animate-spin"
                : "h-3 w-3"
            }
          />
          {meta.label}
        </Badge>
      </div>

      <div className="space-y-1">
        <Progress
          value={percent ?? 0}
          className={
            upload.status === "processing" && percent === undefined
              ? "animate-pulse"
              : undefined
          }
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
          <span>
            {upload.rows_processed?.toLocaleString("es-AR") ?? 0}
            {upload.rows_total
              ? ` / ${upload.rows_total.toLocaleString("es-AR")} filas`
              : " filas"}
          </span>
          {percent !== undefined ? <span>{percent}%</span> : null}
        </div>
      </div>

      {upload.status === "failed" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-destructive">
            {upload.error_message ?? "El procesamiento fallo sin detalle."}
          </p>
          <Button size="sm" variant="outline" onClick={onReset}>
            Subir otro archivo
          </Button>
        </div>
      ) : null}

      {upload.status === "completed" ? (
        <p className="text-xs text-muted-foreground">
          Listo. Te llevamos al dashboard del proyecto...
        </p>
      ) : null}
    </div>
  );
}
