"use client";

// AUD-1.3 — CRUD de Supervisores (cerebro reusable de auditoría).
// NECESITA REVIEW VISUAL: generado sin render en vivo; matchea los componentes
// existentes (Card/Button/Input/Textarea/Select/Checkbox) pero conviene revisarlo.

import * as React from "react";
import { FileJson, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
  useCreateSupervisor,
  useDeleteSupervisor,
  useFlows,
  useProjects,
  useSupervisors,
  useUpdateSupervisor,
  type Supervisor,
  type SupervisorInput,
} from "@/lib/queries";
import { EMPHASIS_OPTIONS } from "@/lib/projects/mock";

const OBJECTIVES = [
  { key: "leads", label: "Recaudar datos / Leads" },
  { key: "ventas", label: "Vender / Conversión" },
  { key: "awareness", label: "Que conozcan la marca" },
  { key: "soporte", label: "Soporte / Atención" },
  { key: "agendar", label: "Agendar / Reservar" },
];

type FormState = {
  name: string;
  flujoId: string; // "" = sin flujo
  knowledgeBase: string;
  attachedData: Record<string, unknown>;
  defaultObjective: string; // "" = ninguno
  defaultEmphasis: string[];
  defaultFreeText: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  flujoId: "",
  knowledgeBase: "",
  attachedData: {},
  defaultObjective: "",
  defaultEmphasis: [],
  defaultFreeText: "",
};

function toInput(f: FormState): SupervisorInput {
  return {
    name: f.name.trim(),
    flujoId: f.flujoId || null,
    knowledgeBase: f.knowledgeBase.trim() || null,
    attachedData: Object.keys(f.attachedData).length ? f.attachedData : null,
    defaultObjective: f.defaultObjective || null,
    defaultEmphasis: f.defaultEmphasis.length ? f.defaultEmphasis : null,
    defaultFreeText: f.defaultFreeText.trim() || null,
  };
}

function fromSupervisor(s: Supervisor): FormState {
  return {
    name: s.name,
    flujoId: s.flujoId ?? "",
    knowledgeBase: s.knowledgeBase ?? "",
    attachedData: (s.attachedData as Record<string, unknown>) ?? {},
    defaultObjective: s.defaultObjective ?? "",
    defaultEmphasis: s.defaultEmphasis ?? [],
    defaultFreeText: s.defaultFreeText ?? "",
  };
}

export function SupervisorManager() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const [projectId, setProjectId] = React.useState<string>("");

  // Elegí el primer proyecto por defecto.
  React.useEffect(() => {
    if (!projectId && projects && projects.length > 0) {
      setProjectId(projects[0].publicId);
    }
  }, [projects, projectId]);

  const { data: supervisors } = useSupervisors(projectId);
  const { data: flujos } = useFlows(projectId);

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const createMut = useCreateSupervisor(projectId);
  const updateMut = useUpdateSupervisor(projectId);
  const deleteMut = useDeleteSupervisor(projectId);

  const fileRef = React.useRef<HTMLInputElement>(null);

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setOpen(true);
  }

  function startEdit(s: Supervisor) {
    setForm(fromSupervisor(s));
    setEditingId(s.id);
    setOpen(true);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = { ...form.attachedData };
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const key = file.name.replace(/\.[^.]+$/, "").toLowerCase();
        next[key] = JSON.parse(text);
        added.push(key);
      } catch {
        toast.error(`No pude parsear ${file.name} (¿es JSON válido?)`);
      }
    }
    if (added.length > 0) {
      setForm((f) => ({ ...f, attachedData: next }));
      toast.success(`Data adjunta cargada: ${added.join(", ")}`);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeAttached(key: string) {
    setForm((f) => {
      const next = { ...f.attachedData };
      delete next[key];
      return { ...f, attachedData: next };
    });
  }

  function toggleEmphasis(key: string) {
    setForm((f) => ({
      ...f,
      defaultEmphasis: f.defaultEmphasis.includes(key)
        ? f.defaultEmphasis.filter((k) => k !== key)
        : [...f.defaultEmphasis, key],
    }));
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Poné un nombre al supervisor.");
      return;
    }
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...toInput(form) });
        toast.success("Supervisor actualizado.");
      } else {
        await createMut.mutateAsync(toInput(form));
        toast.success("Supervisor creado.");
      }
      setOpen(false);
    } catch {
      toast.error("No se pudo guardar el supervisor.");
    }
  }

  async function remove(s: Supervisor) {
    try {
      await deleteMut.mutateAsync(s.id);
      toast.success("Supervisor eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  }

  const attachedKeys = Object.keys(form.attachedData);
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supervisores</h1>
          <p className="text-sm text-muted-foreground">
            El cerebro reusable de auditoría: flujo + base de conocimiento +
            data adjunta (fuente de verdad) + objetivo/énfasis por defecto.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Proyecto</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Elegí un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {(projects ?? []).map((p) => (
                  <SelectItem key={p.publicId} value={p.publicId}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startNew} disabled={!projectId}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo supervisor
          </Button>
        </div>
      </div>

      {!loadingProjects && (projects ?? []).length === 0 && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            No tenés proyectos todavía. Creá uno en la sección{" "}
            <strong>Proyectos</strong> para poder armar un supervisor.
          </CardContent>
        </Card>
      )}

      {open && (
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ej: Supervisor ventas AquaClean"
              />
            </div>

            <div className="space-y-2">
              <Label>Flujo a auditar (opcional)</Label>
              <Select
                value={form.flujoId || "none"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, flujoId: v === "none" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin flujo (auditar solo con la data)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin flujo</SelectItem>
                  {(flujos ?? []).map((fl) => (
                    <SelectItem key={fl.id} value={fl.id}>
                      {fl.name} · v{fl.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Base de conocimiento (datos de la empresa)</Label>
              <Textarea
                rows={4}
                value={form.knowledgeBase}
                onChange={(e) =>
                  setForm((f) => ({ ...f, knowledgeBase: e.target.value }))
                }
                placeholder="Qué vende, tono de marca, políticas (envíos, devoluciones), info clave…"
              />
            </div>

            <div className="space-y-2">
              <Label>Data adjunta (fuente de verdad)</Label>
              <p className="text-xs text-muted-foreground">
                Subí JSONs como <code>precios.json</code> o{" "}
                <code>info.json</code>. El auditor los usa para no marcar como
                alucinación datos correctos.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {attachedKeys.map((k) => (
                  <Badge key={k} variant="secondary" className="gap-1">
                    <FileJson className="h-3 w-3" /> {k}
                    <button
                      type="button"
                      onClick={() => removeAttached(k)}
                      className="ml-1 rounded-full hover:text-destructive"
                      aria-label={`Quitar ${k}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-1 h-4 w-4" /> Subir JSON
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Objetivo por defecto</Label>
                <Select
                  value={form.defaultObjective || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      defaultObjective: v === "none" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {OBJECTIVES.map((o) => (
                      <SelectItem key={o.key} value={o.key}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Énfasis por defecto</Label>
              <div className="flex flex-wrap gap-3">
                {EMPHASIS_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={form.defaultEmphasis.includes(opt.key)}
                      onCheckedChange={() => toggleEmphasis(opt.key)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instrucción libre por defecto</Label>
              <Textarea
                rows={2}
                value={form.defaultFreeText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defaultFreeText: e.target.value }))
                }
                placeholder="Algo específico de tu negocio en lo que quieras que se enfoque…"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={saving}>
                {editingId ? "Guardar cambios" : "Crear supervisor"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loadingProjects && (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        )}
        {projectId && (supervisors ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay supervisores en este proyecto.
          </p>
        )}
        {(supervisors ?? []).map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.flujoName ? `Flujo: ${s.flujoName}` : "Sin flujo"}
                  {s.attachedKeys.length > 0 &&
                    ` · Data: ${s.attachedKeys.join(", ")}`}
                  {s.defaultObjective && ` · Objetivo: ${s.defaultObjective}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(s)}
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(s)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
