import * as React from "react";
import { ArrowLeft, ClipboardList, Play, Plus } from "lucide-react";

import { ReportActions } from "./report-actions";
import { ReportView } from "./report-view";
import { ConversationWorkspace } from "@/components/shared/conversation-workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { EMPHASIS_OPTIONS } from "@/lib/projects/mock";
import type { Audit, Conversation, Flujo } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

export function AuditoriasTab({
  flujos,
  conversations,
  audits,
  onCreateAudit,
  onArchiveAudit,
  onDeleteAudit,
}: {
  flujos: Flujo[];
  conversations: Conversation[];
  audits: Audit[];
  onCreateAudit: (config: {
    flujoId: string;
    emphasis: string[];
    freeText: string;
  }) => void;
  onArchiveAudit: (id: string) => void;
  onDeleteAudit: (id: string) => void;
}) {
  const selected = conversations.filter((c) => c.selected);

  const [open, setOpen] = React.useState(false);
  const [flujoId, setFlujoId] = React.useState(flujos[0]?.id ?? "");
  const [emphasis, setEmphasis] = React.useState<string[]>([]);
  const [freeText, setFreeText] = React.useState("");
  const [viewing, setViewing] = React.useState<Audit | null>(null);
  const [viewingConv, setViewingConv] = React.useState<Conversation | null>(
    null,
  );

  function toggleEmphasis(key: string) {
    setEmphasis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  const canRun = Boolean(flujoId) && selected.length > 0;

  // Payload que se enviaría al backend.
  const payload = {
    flujoId,
    conversationIds: selected.map((c) => c.id),
    emphasis,
    freeText,
  };

  function run() {
    if (!canRun) return;
    onCreateAudit({ flujoId, emphasis, freeText });
    setEmphasis([]);
    setFreeText("");
    setOpen(false);
  }

  // Vista dedicada: conversación (desde una fallida del reporte).
  if (viewingConv) {
    return (
      <ConversationWorkspace
        conversation={viewingConv}
        onBack={() => setViewingConv(null)}
      />
    );
  }

  // Vista dedicada: reporte de la auditoría (full-width).
  if (viewing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-1 h-8 text-muted-foreground"
              onClick={() => setViewing(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Auditorías
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {viewing.name}
              </h2>
              {viewing.status === "archived" ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Archivada
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {viewing.flujoName} · {viewing.conversationCount} conversaciones ·{" "}
              {formatDateTime(viewing.createdAt)}
            </p>
          </div>
          <ReportActions
            audit={viewing}
            onArchive={(id) => {
              onArchiveAudit(id);
              setViewing(null);
            }}
            onDelete={(id) => {
              onDeleteAudit(id);
              setViewing(null);
            }}
          />
        </div>
        <ReportView
          report={viewing.report}
          onSelectConversation={setViewingConv}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Corré una auditoría sobre un flujo y las conversaciones seleccionadas.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Nueva auditoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva auditoría</DialogTitle>
              <DialogDescription>
                Elegí el flujo, qué conversaciones auditar y en qué hacer
                énfasis. Esto se envía al backend para correr el análisis.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Flujo */}
              <div className="space-y-2">
                <Label>Flujo a auditar</Label>
                {flujos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay flujos cargados. Subí uno en la pestaña Flujos.
                  </p>
                ) : (
                  <Select value={flujoId} onValueChange={setFlujoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elegí un flujo" />
                    </SelectTrigger>
                    <SelectContent>
                      {flujos.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} · v{f.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Conversaciones */}
              <div className="space-y-1">
                <Label>Conversaciones</Label>
                <p className="text-sm text-muted-foreground">
                  {selected.length} seleccionadas
                  {conversations.length > 0
                    ? ` de ${conversations.length}`
                    : ""}
                  . Ajustá la selección en la pestaña Conversaciones.
                </p>
              </div>

              {/* Énfasis */}
              <div className="space-y-2">
                <Label>En qué hacer énfasis</Label>
                <div className="flex flex-wrap gap-2">
                  {EMPHASIS_OPTIONS.map((opt) => {
                    const on = emphasis.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleEmphasis(opt.key)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors",
                          on
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <Textarea
                  placeholder="Algo específico de tu negocio en lo que quieras que se enfoque…"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Payload preview */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Se enviará al backend
                </Label>
                <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={run} disabled={!canRun}>
                <Play className="h-4 w-4" />
                Correr auditoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Historial */}
      {audits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Todavía no corriste ninguna auditoría.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {audits.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {a.name}
                  {a.status === "archived" ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                      Archivada
                    </span>
                  ) : null}
                </CardTitle>
                <CardDescription>
                  {a.flujoName} · {a.conversationCount} conversaciones ·{" "}
                  {formatDateTime(a.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {a.report.satisfaction.satisfecho} satisfechas ·{" "}
                  {a.report.failing.length} fallidas
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewing(a)}
                >
                  Ver reporte
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
