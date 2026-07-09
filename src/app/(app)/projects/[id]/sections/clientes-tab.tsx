"use client";

import * as React from "react";
import { Clock, Download, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadClientsCsv } from "@/lib/projects/export";
import {
  type ClientProfile,
  useClient,
  useClients,
} from "@/lib/queries/clients";
import { cn } from "@/lib/utils";

const ETIQUETA_LABEL: Record<string, string> = {
  lead_calificado: "Lead calificado",
  recurrente: "Recurrente",
  neutral: "Neutral",
  problematico: "Problemático",
};

function HourHistogram({ hours }: { hours: number[] }) {
  const max = Math.max(1, ...hours);
  return (
    <div className="flex h-16 items-end gap-0.5">
      {hours.map((n, h) => (
        <div
          key={h}
          className="flex-1 rounded-sm bg-primary/70"
          style={{ height: `${Math.max(2, (n / max) * 100)}%` }}
          title={`${h}:00 UTC · ${n} mensajes`}
        />
      ))}
    </div>
  );
}

function ProfileView({ p }: { p: ClientProfile }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {p.respectful ? (
          <ShieldCheck className="h-5 w-5 text-score-good" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-score-critical" />
        )}
        <div>
          <p className="text-base font-semibold">{p.display}</p>
          <p className="text-xs text-muted-foreground">
            {p.respectful ? "Cliente respetuoso" : "Requiere cuidado"} ·{" "}
            {ETIQUETA_LABEL[p.etiqueta] ?? p.etiqueta}
            {p.fraudAttempts > 0
              ? ` · ${p.fraudAttempts} intento(s) de fraude`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border p-2">
          <p className="text-lg font-bold">{p.conversations}</p>
          <p className="text-[11px] text-muted-foreground">conversaciones</p>
        </div>
        <div className="rounded-lg border p-2">
          <p className="text-lg font-bold">{p.avgScore ?? "—"}</p>
          <p className="text-[11px] text-muted-foreground">score prom.</p>
        </div>
        <div className="rounded-lg border p-2">
          <p className="text-lg font-bold">
            {p.avgSatisfaction ?? "—"}
            <span className="text-xs text-muted-foreground">/5</span>
          </p>
          <p className="text-[11px] text-muted-foreground">satisfacción</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> A qué hora responde (UTC)
          </span>
          {p.mostActiveHourUtc != null ? (
            <span>pico ~{p.mostActiveHourUtc}:00</span>
          ) : null}
        </div>
        <HourHistogram hours={p.responseHoursUtc} />
      </div>

      {p.topics.length ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Temas</p>
          <div className="flex flex-wrap gap-1.5">
            {p.topics.slice(0, 8).map(([topic, count]) => (
              <span
                key={topic}
                className="rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                {topic} · {count}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ClientesTab({ projectId }: { projectId: string }) {
  const { data: clients = [], isLoading } = useClients(projectId);
  const [selected, setSelected] = React.useState<string | null>(null);
  const { data: profile } = useClient(projectId, selected);
  const [downloading, setDownloading] = React.useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadClientsCsv(projectId);
    } catch {
      toast.error("No se pudo exportar el CSV de clientes");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-xl text-sm text-muted-foreground">
          Perfil de cada cliente para personalizar la atención: si es
          respetuoso, su recurrencia y a qué hora responde (UTC). Se llena al
          correr auditorías.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading || clients.length === 0}
        >
          <Download className="mr-1 h-4 w-4" /> Descargar CSV
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando clientes…</p>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Todavía no hay clientes con perfil. Corré una auditoría y volvé.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-1.5">
            {clients.map((c) => (
              <button
                key={c.userKey}
                type="button"
                onClick={() => setSelected(c.userKey)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-muted",
                  selected === c.userKey && "border-primary bg-primary/5",
                )}
              >
                {c.respectful ? (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-score-good" />
                ) : (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-score-critical" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {c.display}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        c.riesgoso
                          ? "bg-score-critical/15 text-score-critical"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {ETIQUETA_LABEL[c.etiqueta] ?? c.etiqueta}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.conversations} conv · score {c.avgScore ?? "—"} · sat{" "}
                    {c.avgSatisfaction ?? "—"}/5
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              {!selected ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Elegí un cliente para ver su perfil.
                </p>
              ) : !profile ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Cargando perfil…
                </p>
              ) : (
                <ProfileView p={profile} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
