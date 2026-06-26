"use client";

import * as React from "react";
import { Check, Copy, History, Loader2, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatBytes, formatDateTime } from "@/lib/format";
import {
  type FlowVersionSummary,
  useFlowVersion,
  useFlowVersions,
  useRenameFlowVersion,
  useRestoreFlowVersion,
} from "@/lib/queries";

const SOURCE_LABEL: Record<string, string> = {
  initial: "Inicial",
  improvement: "Mejora",
  manual: "Manual",
  restore: "Restaurada",
  upload: "Re-subida",
};

function VersionJson({
  flowId,
  versionId,
}: {
  flowId: string;
  versionId: string;
}) {
  const { data, isLoading } = useFlowVersion(flowId, versionId);
  const [copied, setCopied] = React.useState(false);
  if (isLoading) {
    return (
      <p className="px-3 pb-3 text-xs text-muted-foreground">Cargando JSON…</p>
    );
  }
  if (!data) return null;
  return (
    <div className="space-y-2 px-3 pb-3">
      <pre className="max-h-72 overflow-auto rounded bg-muted p-2 font-mono text-[11px] leading-relaxed">
        {data.json}
      </pre>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 gap-1.5 text-xs"
        onClick={() => {
          void navigator.clipboard.writeText(data.json);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-score-good" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copiado" : "Copiar JSON"}
      </Button>
    </div>
  );
}

function VersionRow({ flowId, v }: { flowId: string; v: FlowVersionSummary }) {
  const restore = useRestoreFlowVersion(flowId);
  const rename = useRenameFlowVersion(flowId);
  const [editing, setEditing] = React.useState(false);
  const [label, setLabel] = React.useState(v.label);

  function saveLabel() {
    const next = label.trim();
    if (!next) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    rename.mutate(
      { versionId: v.id, label: next },
      {
        onSuccess: () => {
          toast.success("Versión renombrada");
          setEditing(false);
        },
        onError: (e) =>
          toast.error(`No se pudo renombrar: ${(e as Error).message}`),
      },
    );
  }

  function doRestore() {
    if (
      !window.confirm(
        `¿Volver a "${v.label}" (v${v.versionNumber})? Se guarda como una versión nueva, no se borra nada.`,
      )
    )
      return;
    restore.mutate(v.id, {
      onSuccess: () => toast.success(`Restaurado a v${v.versionNumber}`),
      onError: (e) =>
        toast.error(`No se pudo restaurar: ${(e as Error).message}`),
    });
  }

  return (
    <div className="rounded-lg border">
      <div className="flex items-start gap-3 p-3">
        <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold">
          v{v.versionNumber}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveLabel();
                  if (e.key === "Escape") setEditing(false);
                }}
              />
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={saveLabel}
                disabled={rename.isPending}
              >
                Guardar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{v.label}</p>
              {v.isCurrent ? (
                <span className="shrink-0 rounded-full bg-score-good/15 px-2 py-0.5 text-xs font-medium text-score-good">
                  Activa
                </span>
              ) : null}
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {SOURCE_LABEL[v.source] ?? v.source}
              </span>
            </div>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDateTime(v.createdAt)} · {v.agentCount} agentes ·{" "}
            {formatBytes(v.sizeBytes)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!editing ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Renombrar"
              onClick={() => {
                setLabel(v.label);
                setEditing(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          {!v.isCurrent ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={doRestore}
              disabled={restore.isPending}
            >
              {restore.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Restaurar
            </Button>
          ) : null}
        </div>
      </div>
      <details className="border-t">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground">
          Ver JSON de esta versión
        </summary>
        <VersionJson flowId={flowId} versionId={v.id} />
      </details>
    </div>
  );
}

export function FlowVersionHistory({
  flowId,
  embedded = false,
}: {
  flowId: string;
  // embedded=true: sin Card propia (vive dentro de otra card, ej. una tab).
  embedded?: boolean;
}) {
  const { data: versions = [], isLoading } = useFlowVersions(flowId);
  const body = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">
          Historial de versiones · {versions.length}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Cada cambio del flujo (mejora aplicada, edición manual o restaurar)
        queda guardado acá. La versión activa es la que usa el flujo; podés
        volver a cualquiera.
      </p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando historial…</p>
      ) : versions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay versiones guardadas.
        </p>
      ) : (
        <div className="space-y-2">
          {versions.map((v) => (
            <VersionRow key={v.id} flowId={flowId} v={v} />
          ))}
        </div>
      )}
    </div>
  );
  if (embedded) return body;
  return (
    <Card>
      <CardContent className="p-4">{body}</CardContent>
    </Card>
  );
}
