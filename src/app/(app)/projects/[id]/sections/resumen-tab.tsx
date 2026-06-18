import { ClipboardList, MessagesSquare, Workflow } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { Audit, Conversation, Flujo } from "@/lib/projects/types";

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
}: {
  flujos: Flujo[];
  conversations: Conversation[];
  audits: Audit[];
}) {
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
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.flujoName} · {a.conversationCount} conversaciones ·{" "}
                      {formatDateTime(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 text-xs">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
