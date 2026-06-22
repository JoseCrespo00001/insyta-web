import * as React from "react";
import { ArrowLeft, Play, Workflow, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPHASIS_OPTIONS } from "@/lib/projects/mock";
import type { Conversation, Flujo } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

/**
 * Página inline para armar una auditoría (reemplaza el modal):
 * izquierda = flujo + énfasis; derecha = conversaciones a auditar.
 */
export function AuditComposer({
  flujos,
  conversations,
  initialSelectedIds,
  onCancel,
  onRun,
}: {
  flujos: Flujo[];
  conversations: Conversation[];
  initialSelectedIds: string[];
  onCancel: () => void;
  onRun: (config: {
    flujoId: string;
    conversationIds: string[];
    emphasis: string[];
    freeText: string;
  }) => void;
}) {
  const [flujoId, setFlujoId] = React.useState(flujos[0]?.id ?? "");
  const [emphasis, setEmphasis] = React.useState<string[]>([]);
  const [freeText, setFreeText] = React.useState("");
  const [picked, setPicked] = React.useState<Set<string>>(
    () => new Set(initialSelectedIds),
  );
  const [query, setQuery] = React.useState("");

  const selectedCount = picked.size;
  const canRun = Boolean(flujoId) && selectedCount > 0;

  function toggleEmphasis(key: string) {
    setEmphasis((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }
  function togglePick(id: string) {
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const q = query.trim().toLowerCase();
  const visible = conversations.filter(
    (c) =>
      !q ||
      c.contactName.toLowerCase().includes(q) ||
      c.externalId.includes(q) ||
      c.preview.toLowerCase().includes(q),
  );
  const allVisiblePicked =
    visible.length > 0 && visible.every((c) => picked.has(c.id));
  function toggleAllVisible() {
    setPicked((prev) => {
      const n = new Set(prev);
      if (allVisiblePicked) visible.forEach((c) => n.delete(c.id));
      else visible.forEach((c) => n.add(c.id));
      return n;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 h-8 text-muted-foreground"
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4" />
            Auditorías
          </Button>
          <h2 className="text-xl font-semibold tracking-tight">
            Nueva auditoría
          </h2>
          <p className="text-sm text-muted-foreground">
            Elegí el flujo y revisá las conversaciones a auditar.
          </p>
        </div>
        <Button
          onClick={() =>
            onRun({ flujoId, conversationIds: [...picked], emphasis, freeText })
          }
          disabled={!canRun}
        >
          <Play className="h-4 w-4" />
          Correr auditoría ({selectedCount})
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Izquierda: flujo + énfasis */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
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

              {flujoId
                ? (() => {
                    const f = flujos.find((x) => x.id === flujoId);
                    if (!f) return null;
                    return (
                      <div className="flex items-center gap-2.5 rounded-lg border p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                          <Workflow className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {f.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            v{f.version} · {f.agentCount} agentes
                          </p>
                        </div>
                      </div>
                    );
                  })()
                : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
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
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Derecha: conversaciones a auditar */}
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <Label>
                Conversaciones a auditar · {selectedCount}/
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8"
                />
                <div className="max-h-[60vh] space-y-1 overflow-y-auto rounded-md border p-1">
                  {visible.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      Sin resultados.
                    </p>
                  ) : (
                    visible.map((c) => {
                      const on = picked.has(c.id);
                      return (
                        <label
                          key={c.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted",
                            on && "bg-primary/5",
                          )}
                        >
                          <Checkbox
                            checked={on}
                            onCheckedChange={() => togglePick(c.id)}
                          />
                          <span className="min-w-0 flex-1 truncate text-sm">
                            <span className="font-medium">{c.contactName}</span>{" "}
                            <span className="text-muted-foreground">
                              #{c.externalId}
                              {c.preview ? ` — ${c.preview}` : ""}
                            </span>
                          </span>
                          {on ? (
                            <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          ) : null}
                        </label>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
