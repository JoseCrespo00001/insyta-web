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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { useAudit } from "@/lib/queries";
import type { Audit, Conversation, Flujo, Report } from "@/lib/projects/types";
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
    conversationIds: string[];
    emphasis: string[];
    freeText: string;
  }) => void;
  onArchiveAudit: (id: string) => void;
  onDeleteAudit: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [flujoId, setFlujoId] = React.useState(flujos[0]?.id ?? "");
  const [emphasis, setEmphasis] = React.useState<string[]>([]);
  const [freeText, setFreeText] = React.useState("");
  // Selección de conversaciones a auditar (dentro del diálogo).
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const selected = conversations.filter((c) => picked.has(c.id));
  const [convQuery, setConvQuery] = React.useState("");

  // Al abrir, sembrar con lo que ya esté seleccionado en la pestaña.
  function openDialog(next: boolean) {
    if (next) {
      setPicked(
        new Set(conversations.filter((c) => c.selected).map((c) => c.id)),
      );
      setConvQuery("");
    }
    setOpen(next);
  }

  function togglePick(id: string) {
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const convMatches = (c: Conversation) => {
    const q = convQuery.trim().toLowerCase();
    return (
      !q ||
      c.contactName.toLowerCase().includes(q) ||
      c.externalId.includes(q) ||
      c.preview.toLowerCase().includes(q)
    );
  };
  const visibleConvs = conversations.filter(convMatches);
  const allVisiblePicked =
    visibleConvs.length > 0 && visibleConvs.every((c) => picked.has(c.id));

  function toggleAllVisible() {
    setPicked((prev) => {
      const n = new Set(prev);
      if (allVisiblePicked) visibleConvs.forEach((c) => n.delete(c.id));
      else visibleConvs.forEach((c) => n.add(c.id));
      return n;
    });
  }
  const [viewing, setViewing] = React.useState<Audit | null>(null);
  const [viewingConv, setViewingConv] = React.useState<Conversation | null>(
    null,
  );
  // Detalle real: GET /audits/{id} compone el report completo (conversaciones +
  // evaluations + verdicts por mensaje). La lista solo trae el resumen.
  const { data: auditDetail } = useAudit(viewing?.id ?? "");
  const viewingReport: Report = ((
    auditDetail as { report?: Report } | undefined
  )?.report ?? viewing?.report) as Report;

  function toggleEmphasis(key: string) {
    setEmphasis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  const canRun = Boolean(flujoId) && selected.length > 0;

  function run() {
    if (!canRun) return;
    onCreateAudit({
      flujoId,
      conversationIds: selected.map((c) => c.id),
      emphasis,
      freeText,
    });
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
              {viewing.status === "running" ? (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  En curso…
                </span>
              ) : viewing.status === "failed" ? (
                <span className="rounded-full bg-score-critical/15 px-2 py-0.5 text-xs font-medium text-score-critical">
                  Falló
                </span>
              ) : viewing.status === "archived" ? (
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
        {viewingReport ? (
          <ReportView
            report={viewingReport}
            onSelectConversation={setViewingConv}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Cargando reporte…</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Corré una auditoría sobre un flujo y las conversaciones seleccionadas.
        </p>
        <Dialog open={open} onOpenChange={openDialog}>
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
                Elegí el flujo, seleccioná qué conversaciones auditar y en qué
                hacer énfasis. El judge las analiza y arma el reporte.
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

              {/* Conversaciones — selección dentro del diálogo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>
                    Conversaciones a auditar · {selected.length}/
                    {conversations.length}
                  </Label>
                  {conversations.length > 0 ? (
                    <button
                      type="button"
                      onClick={toggleAllVisible}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {allVisiblePicked
                        ? "Deseleccionar todas"
                        : "Seleccionar todas"}
                    </button>
                  ) : null}
                </div>
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay conversaciones cargadas. Subí un CSV en la pestaña
                    Conversaciones.
                  </p>
                ) : (
                  <>
                    <Input
                      placeholder="Buscar contacto, número o texto…"
                      value={convQuery}
                      onChange={(e) => setConvQuery(e.target.value)}
                      className="h-8"
                    />
                    <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-1">
                      {visibleConvs.length === 0 ? (
                        <p className="px-2 py-3 text-sm text-muted-foreground">
                          Sin resultados.
                        </p>
                      ) : (
                        visibleConvs.map((c) => (
                          <label
                            key={c.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                          >
                            <Checkbox
                              checked={picked.has(c.id)}
                              onCheckedChange={() => togglePick(c.id)}
                            />
                            <span className="min-w-0 flex-1 truncate text-sm">
                              <span className="font-medium">
                                {c.contactName}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                #{c.externalId}
                                {c.preview ? ` — ${c.preview}` : ""}
                              </span>
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </>
                )}
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
                  {a.status === "running" ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-normal text-primary">
                      En curso…
                    </span>
                  ) : a.status === "failed" ? (
                    <span className="rounded-full bg-score-critical/15 px-2 py-0.5 text-xs font-normal text-score-critical">
                      Falló
                    </span>
                  ) : a.status === "archived" ? (
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
                  {a.status === "running"
                    ? "El judge está evaluando…"
                    : a.status === "failed"
                      ? "El judge no pudo completar la auditoría"
                      : `${a.report.satisfaction?.satisfecho ?? 0} satisfechas · ${
                          a.report.total ?? a.conversationCount
                        } auditadas`}
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
