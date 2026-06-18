"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

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
import { STUB_PROJECTS, makeProjectId } from "@/lib/projects/stub";
import type { Project } from "@/lib/projects/types";

export function ProjectsView() {
  // TODO(api): reemplazar por React Query contra GET/POST /api/v1/projects.
  const [projects, setProjects] = React.useState<Project[]>(STUB_PROJECTS);

  function addProject(name: string) {
    setProjects((prev) => [
      {
        publicId: makeProjectId(),
        name,
        agentCount: 0,
        conversationCount: 0,
        score: null,
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
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

      {projects.length === 0 ? (
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
                  <Link href={`/projects/${project.publicId}/upload`}>
                    Subir CSV
                  </Link>
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
