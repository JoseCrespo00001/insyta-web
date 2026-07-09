import * as React from "react";
import { ArrowLeft, ClipboardList, Plus } from "lucide-react";

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
import { formatDateTime } from "@/lib/format";
import { useAudit, useFlow } from "@/lib/queries";
import type { Audit, Conversation, Report } from "@/lib/projects/types";

export function AuditoriasTab({
  audits,
  onNewAudit,
  onArchiveAudit,
  onDeleteAudit,
}: {
  audits: Audit[];
  onNewAudit: () => void;
  onArchiveAudit: (id: string) => void;
  onDeleteAudit: (id: string) => void;
}) {
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
  // Flujo auditado: su JSON habilita "Copiar flujo completo (con el nodo)".
  const { data: viewingFlow } = useFlow(
    viewing?.flujoId ?? "",
    Boolean(viewing?.flujoId),
  );

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
            flowJson={viewingFlow?.json}
            auditId={viewing?.id}
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
          Corré una auditoría sobre un flujo y las conversaciones que elijas.
        </p>
        <Button onClick={onNewAudit}>
          <Plus className="h-4 w-4" />
          Nueva auditoría
        </Button>
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
              <CardContent className="space-y-3">
                {a.status === "running" ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>El judge está evaluando…</span>
                      <span className="tabular-nums">
                        {a.evaluatedCount}/{a.conversationCount}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{
                          width: `${
                            a.conversationCount
                              ? Math.max(
                                  4,
                                  Math.round(
                                    (a.evaluatedCount / a.conversationCount) *
                                      100,
                                  ),
                                )
                              : 4
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ) : a.status === "failed" ? (
                  <p className="text-sm text-score-critical">
                    {/key|api|llm/i.test(a.errorMessage ?? "")
                      ? "Falta la API key del motor. Configurala en Perfil → Extensiones y volvé a correr la auditoría."
                      : a.errorMessage ||
                        "El judge no pudo completar la auditoría"}
                  </p>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {`${a.report.satisfaction?.satisfecho ?? 0} satisfechas · ${
                      a.report.total ?? a.conversationCount
                    } auditadas`}
                  </span>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewing(a)}
                  >
                    Ver reporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
