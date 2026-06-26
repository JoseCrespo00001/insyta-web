import * as React from "react";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  MessagesSquare,
  Workflow,
} from "lucide-react";

import { ReportActions } from "./report-actions";
import { ReportView } from "./report-view";
import { ConversationWorkspace } from "@/components/shared/conversation-workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { useAudit, useFlow } from "@/lib/queries";
import type { Audit, Conversation, Flujo, Report } from "@/lib/projects/types";

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Workflow;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export function ResumenTab({
  flujos,
  conversations,
  audits,
  onArchiveAudit,
  onDeleteAudit,
}: {
  flujos: Flujo[];
  conversations: Conversation[];
  audits: Audit[];
  onArchiveAudit: (id: string) => void;
  onDeleteAudit: (id: string) => void;
}) {
  const [viewing, setViewing] = React.useState<Audit | null>(null);
  const [viewingConv, setViewingConv] = React.useState<Conversation | null>(
    null,
  );
  // Detalle real (conversaciones + evals); la lista trae el report vacío.
  const { data: auditDetail } = useAudit(viewing?.id ?? "");
  const viewingReport = ((auditDetail as { report?: Report } | undefined)
    ?.report ?? viewing?.report) as Report;
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

  // Vista dedicada: reporte de la auditoría (full-width, con la data).
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
              Resumen
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {viewing.name}
              </h2>
              {viewing.status === "archived" ? (
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
        <ReportView
          report={viewingReport}
          onSelectConversation={setViewingConv}
          flowJson={viewingFlow?.json}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Flujos" value={flujos.length} icon={Workflow} />
        <Stat
          label="Conversaciones cargadas"
          value={conversations.length}
          icon={MessagesSquare}
        />
        <Stat label="Auditorías" value={audits.length} icon={ClipboardList} />
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Auditorías recientes</h3>
        {audits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Todavía no hay auditorías. Corré una en la pestaña Auditorías.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {audits.map((a) => (
              <Card
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() => setViewing(a)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setViewing(a);
                  }
                }}
                className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      {a.name}
                      {a.status === "archived" ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          Archivada
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {a.flujoName} · {a.conversationCount} conversaciones ·{" "}
                      {formatDateTime(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex gap-2 text-xs">
                      <span className="rounded-full bg-score-good/15 px-2 py-0.5 font-medium">
                        {a.report.satisfaction.satisfecho} satisfechas
                      </span>
                      <span className="rounded-full bg-score-risk/15 px-2 py-0.5 font-medium">
                        {a.report.satisfaction.neutral} neutrales
                      </span>
                      <span className="rounded-full bg-score-critical/15 px-2 py-0.5 font-medium">
                        {a.report.satisfaction.insatisfecho} insatisfechas
                      </span>
                    </div>
                    <span className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex">
                      Ver reporte
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
