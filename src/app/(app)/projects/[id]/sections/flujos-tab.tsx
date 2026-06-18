import * as React from "react";
import { ArrowLeft, Eye, Upload, Workflow } from "lucide-react";

import { FlujoGraph } from "./flujo-graph";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBytes, formatDate } from "@/lib/format";
import { makeFlujoId } from "@/lib/projects/mock";
import type { Flujo } from "@/lib/projects/types";

export function FlujosTab({
  flujos,
  onAddFlujo,
}: {
  flujos: Flujo[];
  onAddFlujo: (flujo: Flujo) => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = React.useState<Flujo | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // Mock: el backend parsea el JSON real. Acá solo registramos metadata.
    onAddFlujo({
      id: makeFlujoId(),
      name: file.name.replace(/\.json$/i, ""),
      version: "1.0.0",
      sizeBytes: file.size,
      agentCount: 0,
      createdAt: new Date().toISOString(),
      json: "// El backend procesará este flujo.\n// (mock: el contenido no se parsea en el front)",
    });
    event.target.value = "";
  }

  // Vista dedicada: flujo (grafo / JSON), full-width.
  if (viewing) {
    return (
      <div className="space-y-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 h-8 text-muted-foreground"
            onClick={() => setViewing(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Flujos
          </Button>
          <h2 className="text-xl font-semibold tracking-tight">
            {viewing.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            v{viewing.version} · {viewing.agentCount} agentes ·{" "}
            {formatBytes(viewing.sizeBytes)} · {formatDate(viewing.createdAt)}
          </p>
        </div>
        <Tabs defaultValue="grafo" className="space-y-3">
          <TabsList>
            <TabsTrigger value="grafo">Grafo</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="grafo">
            <FlujoGraph flujo={viewing} />
          </TabsContent>
          <TabsContent value="json">
            <pre className="max-h-[72vh] overflow-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
              {viewing.json}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Un flujo es el JSON completo del agente (los agentes y cómo
          responden). Subí varios para testearlos y mejorarlos.
        </p>
        <Button onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Subir flujo
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {flujos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Workflow className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Todavía no subiste ningún flujo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flujos.map((flujo) => (
            <Card key={flujo.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{flujo.name}</CardTitle>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    v{flujo.version}
                  </span>
                </div>
                <CardDescription>
                  {flujo.agentCount} agentes · {formatBytes(flujo.sizeBytes)} ·{" "}
                  {formatDate(flujo.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewing(flujo)}
                >
                  <Eye className="h-4 w-4" />
                  Ver flujo
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
