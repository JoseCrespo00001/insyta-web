"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  MessagesSquare,
  RefreshCw,
  Search,
} from "lucide-react";

import { ConversationWorkspace } from "@/components/shared/conversation-workspace";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { makeConversationStub } from "@/lib/projects/empty";
import { useGlobalConversations } from "@/lib/queries";
import type {
  Conversation,
  Satisfaction,
  UploadGroup,
} from "@/lib/projects/types";
import { cn } from "@/lib/utils";

const SAT_CLASS: Record<Satisfaction, string> = {
  satisfecho: "bg-score-good/15",
  neutral: "bg-muted",
  insatisfecho: "bg-score-critical/15",
};

function SatisfactionBadge({ value }: { value: Satisfaction | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        SAT_CLASS[value],
      )}
    >
      {value}
    </span>
  );
}

export function ConversationsView() {
  const { data, isLoading, refetch, isFetching } = useGlobalConversations();
  const [viewing, setViewing] = React.useState<Conversation | null>(null);
  const [query, setQuery] = React.useState("");

  // Mapeo del payload del backend al contrato UploadGroup del front. El
  // transcript de cada conversación se hidrata en el workspace al abrirla.
  const groups: UploadGroup[] = React.useMemo(
    () =>
      (data ?? []).map((g) => ({
        id: g.id,
        projectName: g.project_name,
        filename: g.filename,
        loadedAt: g.loaded_at,
        conversations: g.conversations.map((c) => ({
          ...makeConversationStub({
            id: c.public_id,
            externalId: c.external_id,
            contactName: c.contact_name,
            preview: c.preview,
            score: c.score,
          }),
          messageCount: c.message_count,
          satisfaction: (c.satisfaction as Satisfaction | null) ?? null,
          resolved: c.resolved,
        })),
      })),
    [data],
  );

  // Filtro: por texto de la conversación, nombre del contacto, número, o CSV.
  const q = query.trim().toLowerCase();

  function convMatches(c: Conversation): boolean {
    return (
      c.contactName.toLowerCase().includes(q) ||
      c.externalId.includes(q) ||
      c.preview.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }

  const visibleGroups: UploadGroup[] = q
    ? groups
        .map((g) => {
          const filenameMatch = g.filename.toLowerCase().includes(q);
          return {
            ...g,
            conversations: filenameMatch
              ? g.conversations
              : g.conversations.filter(convMatches),
          };
        })
        .filter((g) => g.conversations.length > 0)
    : groups;

  // Agrupar por proyecto.
  const byProject = new Map<string, UploadGroup[]>();
  for (const g of visibleGroups) {
    const arr = byProject.get(g.projectName) ?? [];
    arr.push(g);
    byProject.set(g.projectName, arr);
  }

  if (viewing) {
    return (
      <ConversationWorkspace
        conversation={viewing}
        onBack={() => setViewing(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Conversaciones
          </h1>
          <p className="text-muted-foreground">
            Conversaciones por proyecto, agrupadas por cada CSV cargado.
          </p>
        </div>
        <div className="relative w-full min-w-[240px] sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por texto, contacto o CSV…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Cargando conversaciones…
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <MessagesSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No hay conversaciones cargadas. Subí un CSV desde un proyecto.
            </p>
          </CardContent>
        </Card>
      ) : byProject.size === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin resultados para &ldquo;{query}&rdquo;.
          </CardContent>
        </Card>
      ) : (
        [...byProject.entries()].map(([projectName, projectGroups]) => (
          <section key={projectName} className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {projectName}
            </h2>

            {projectGroups.map((group) => (
              <Card key={group.id} className="overflow-hidden">
                {/* Cabecera del grupo de CSV */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{group.filename}</span>
                    <span className="text-sm text-muted-foreground">
                      · cargado {formatDateTime(group.loadedAt)} ·{" "}
                      {group.conversations.length} conversaciones
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                    onClick={() => refetch()}
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", isFetching && "animate-spin")}
                    />
                    Actualizar
                  </Button>
                </div>

                {/* Tabla de conversaciones */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contacto</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Mensajes</TableHead>
                      <TableHead>Satisfacción</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.conversations.map((c) => (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => setViewing(c)}
                      >
                        <TableCell className="font-medium">
                          {c.contactName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          #{c.externalId}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.messageCount}
                        </TableCell>
                        <TableCell>
                          <SatisfactionBadge value={c.satisfaction} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ScoreBadge score={c.score} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
