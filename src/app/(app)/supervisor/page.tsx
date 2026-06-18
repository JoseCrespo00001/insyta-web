import type { Metadata } from "next";
import { Eye, PauseCircle, Radio, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Supervisor en vivo",
};

const FEATURES = [
  {
    icon: Eye,
    title: "Ver el output antes de enviarlo",
    detail:
      "Cada respuesta del agente pasa por Insyta antes de llegar al cliente.",
  },
  {
    icon: PauseCircle,
    title: "Pausar o corregir en el momento",
    detail:
      "Si una respuesta va mal, la frenás o la ajustás antes de que se envíe.",
  },
  {
    icon: ShieldCheck,
    title: "Reglas y umbrales en vivo",
    detail:
      "Definí límites (tono, scope, score) y el supervisor actúa solo cuando se cruzan.",
  },
];

export default function SupervisorPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <Card className="overflow-hidden">
        <CardContent className="relative flex flex-col items-center gap-5 px-6 py-16 text-center">
          {/* glow verde ambiental */}
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

          <span className="relative inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Próximamente
          </span>

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
            <Radio className="h-8 w-8 text-primary" />
          </div>

          <div className="relative space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Supervisor en vivo
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Supervisá las respuestas de tu agente en tiempo real — antes de
              que el mensaje llegue al cliente. Vas a poder ver, pausar o
              corregir cada output.
            </p>
            <p className="text-sm text-muted-foreground">
              Disponible cuando conectes tu agente en producción.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, detail }) => (
          <Card key={title}>
            <CardContent className="space-y-2 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
