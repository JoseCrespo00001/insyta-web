"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useCreateProject, useDeleteProject, useProjects } from "@/lib/queries";

export function ProjectsView() {
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  function handleDeleteProject(id: string, name: string) {
    if (
      !window.confirm(
        `¿Eliminar el proyecto "${name}"? Se borran sus conversaciones, flujos y auditorías. No se puede deshacer.`,
      )
    )
      return;
    deleteProject.mutate(id, {
      onSuccess: () => toast.success("Proyecto eliminado"),
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "No se pudo eliminar"),
    });
  }

  function addProject(name: string) {
    createProject.mutate(
      { name },
      {
        onSuccess: () => toast.success(`Proyecto "${name}" creado`),
        onError: (err) =>
          toast.error(
            err instanceof ApiError && err.status === 401
              ? "Iniciá sesión para crear proyectos"
              : `No se pudo crear el proyecto: ${(err as Error).message}`,
          ),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">
            Cada proyecto agrupa las conversaciones de un agente.
          </p>
        </div>
        <NewProjectDialog onCreate={addProject} />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Cargando proyectos…
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Todavía no tenés proyectos</p>
              <p className="text-sm text-muted-foreground">
                Creá tu primer proyecto y subí un CSV para empezar a analizar.
              </p>
            </div>
            <NewProjectDialog onCreate={addProject} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.publicId}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <ScoreBadge score={project.score} />
                </div>
                <CardDescription>
                  {project.agentCount} agentes · {project.conversationCount}{" "}
                  conversaciones
                </CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter className="gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/projects/${project.publicId}`}>Ver</Link>
                </Button>
                <Button asChild size="sm">
                  <Link
                    href={`/projects/${project.publicId}?tab=conversaciones`}
                  >
                    Subir CSV
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                  disabled={deleteProject.isPending}
                  onClick={() =>
                    handleDeleteProject(project.publicId, project.name)
                  }
                  aria-label={`Eliminar proyecto ${project.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NewProjectDialog({ onCreate }: { onCreate: (name: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>
            Un proyecto agrupa las conversaciones de un agente (ej: &ldquo;Bot
            Ventas Q1&rdquo;).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="project-name">Nombre</Label>
          <Input
            id="project-name"
            placeholder="Bot Ventas Q1"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>
            Crear proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
