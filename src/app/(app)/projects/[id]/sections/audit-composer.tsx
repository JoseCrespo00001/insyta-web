import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Play,
  Target,
  Workflow,
  X,
} from "lucide-react";

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
import { useLlmKeys, useSupervisors } from "@/lib/queries";
import type { Conversation, Flujo } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

/**
 * Página inline para armar una auditoría (reemplaza el modal):
 * izquierda = flujo + énfasis; derecha = conversaciones a auditar.
 */
const OBJECTIVES = [
  { key: "todos", label: "Todos los objetivos" },
  { key: "leads", label: "Recaudar datos / Leads" },
  { key: "ventas", label: "Vender / Conversión" },
  { key: "awareness", label: "Que conozcan la marca" },
  { key: "soporte", label: "Soporte / Atención" },
  { key: "agendar", label: "Agendar / Reservar" },
];

export function AuditComposer({
  flujos,
  conversations,
  initialSelectedIds,
  projectId,
  onCancel,
  onRun,
}: {
  flujos: Flujo[];
  conversations: Conversation[];
  initialSelectedIds: string[];
  projectId: string;
  onCancel: () => void;
  onRun: (config: {
    name: string;
    objective: string;
    provider: string;
    flujoId: string;
    supervisorId: string;
    conversationIds: string[];
    emphasis: string[];
    freeText: string;
  }) => void;
}) {
  const { data: supervisors } = useSupervisors(projectId);
  const [name, setName] = React.useState("");
  const [objective, setObjective] = React.useState("");
  const [provider, setProvider] = React.useState("anthropic");
  const [flujoId, setFlujoId] = React.useState(flujos[0]?.id ?? "");
  const [supervisorId, setSupervisorId] = React.useState("");
  const [emphasis, setEmphasis] = React.useState<string[]>([]);
  const [freeText, setFreeText] = React.useState("");

  // Al elegir un supervisor, autocompleta flujo + defaults (objetivo/énfasis/free text).
  // Los datos de la empresa y la fuente de verdad viven en el supervisor, no acá.
  function applySupervisor(id: string) {
    setSupervisorId(id);
    const sup = (supervisors ?? []).find((s) => s.id === id);
    if (!sup) return;
    if (sup.flujoId) setFlujoId(sup.flujoId);
    if (sup.defaultObjective) setObjective(sup.defaultObjective);
    if (sup.defaultEmphasis?.length) setEmphasis(sup.defaultEmphasis);
    if (sup.defaultFreeText) setFreeText(sup.defaultFreeText);
  }

  const [picked, setPicked] = React.useState<Set<string>>(
    () => new Set(initialSelectedIds),
  );
  const [query, setQuery] = React.useState("");

  const selectedCount = picked.size;
  const { data: llmKeys } = useLlmKeys();
  // Si falta la key del motor elegido, correr no tiene sentido (el judge falla con
  // FatalLLMError). Mientras las keys cargan (undefined) no bloqueamos.
  const keyMissing =
    llmKeys !== undefined &&
    !llmKeys.find((k) => k.provider === provider)?.configured;
  // El flujo es OPCIONAL: se puede auditar solo con conversaciones + la data de la
  // empresa (supervisor/knowledge). Con conversaciones seleccionadas alcanza.
  const canRun = selectedCount > 0 && !keyMissing;

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

  // Agrupar las visibles por CSV de origen (uploadGroupId), como en Conversaciones.
  const groupIds = [...new Set(visible.map((c) => c.uploadGroupId))];
  const groups = groupIds.map((gid, i) => {
    const items = visible.filter((c) => c.uploadGroupId === gid);
    return {
      id: gid,
      label: gid && gid !== "sin-grupo" ? `CSV ${i + 1}` : "Sin CSV",
      items,
      allPicked: items.length > 0 && items.every((c) => picked.has(c.id)),
    };
  });
  function toggleGroup(items: Conversation[], select: boolean) {
    setPicked((prev) => {
      const n = new Set(prev);
      items.forEach((c) => (select ? n.add(c.id) : n.delete(c.id)));
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
            onRun({
              name,
              objective,
              provider,
              flujoId,
              supervisorId,
              conversationIds: [...picked],
              emphasis,
              freeText,
            })
          }
          disabled={!canRun}
        >
          <Play className="h-4 w-4" />
          Correr auditoría ({selectedCount})
        </Button>
      </div>

      {keyMissing ? (
        <div className="flex items-start gap-2 rounded-lg border border-score-critical/40 bg-score-critical/10 px-3 py-2.5 text-sm text-score-critical">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Falta la API key de <strong>{provider}</strong>. Configurala en{" "}
            <Link
              href="/perfil"
              className="font-medium underline underline-offset-2"
            >
              Perfil → Extensiones
            </Link>{" "}
            antes de correr la auditoría.
          </span>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Izquierda: flujo + énfasis */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                  Supervisor
                </Label>
                <Select
                  value={supervisorId || "none"}
                  onValueChange={(v) => applySupervisor(v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí un supervisor (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin supervisor</SelectItem>
                    {(supervisors ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Trae el flujo, los datos de la empresa y la fuente de verdad
                  (precios/info). Se gestiona en la sección Supervisor.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-name">Nombre de la auditoría</Label>
                <Input
                  id="audit-name"
                  placeholder="Ej: Auditoría ventas — junio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Si lo dejás vacío se nombra por el flujo.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Objetivo de la campaña
                </Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Qué buscás? (leads, ventas, …)" />
                  </SelectTrigger>
                  <SelectContent>
                    {OBJECTIVES.map((o) => (
                      <SelectItem key={o.key} value={o.key}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  El judge puntúa según si la conversación cumple este objetivo.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Motor del judge</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">
                      Anthropic (Claude) · recomendado
                    </SelectItem>
                    <SelectItem value="deepseek">
                      DeepSeek · más barato
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Cargá la API key del motor en Perfil → Extensiones.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Flujo a auditar (opcional)</Label>
                {flujos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin flujo: se audita solo con las conversaciones y la data
                    de la empresa. Podés subir un flujo en la pestaña Flujos.
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

          {/* AUD-1.6: la card "Datos de la empresa" se movió al Supervisor
              (knowledge base + attached_data). Se elige un Supervisor arriba. */}
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
                <div className="max-h-[60vh] space-y-2 overflow-y-auto rounded-md border p-1">
                  {visible.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      Sin resultados.
                    </p>
                  ) : (
                    groups.map((g) => {
                      const pickedInGroup = g.items.filter((c) =>
                        picked.has(c.id),
                      ).length;
                      return (
                        <div key={g.id || "sin-grupo"} className="space-y-0.5">
                          {/* Cabecera del CSV: elegir todo el grupo */}
                          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
                            <Checkbox
                              checked={g.allPicked}
                              onCheckedChange={() =>
                                toggleGroup(g.items, !g.allPicked)
                              }
                            />
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {g.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {pickedInGroup}/{g.items.length}
                            </span>
                          </div>
                          {g.items.map((c) => {
                            const on = picked.has(c.id);
                            return (
                              <label
                                key={c.id}
                                className={cn(
                                  "ml-3 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted",
                                  on && "bg-primary/5",
                                )}
                              >
                                <Checkbox
                                  checked={on}
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
                                {on ? (
                                  <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                ) : null}
                              </label>
                            );
                          })}
                        </div>
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
