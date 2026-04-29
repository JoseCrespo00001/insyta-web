"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/shared/score-badge";
import { ErrorState } from "@/components/shared/error-state";
import { projectsApi } from "@/lib/api/fetchers";
import { queryKeys } from "@/lib/api/keys";
import { formatDateTime } from "@/lib/format";

type Filters = {
  from?: string;
  to?: string;
  agent_id?: string;
};

export function TopProblematicTable({
  projectPublicId,
  filters,
}: {
  projectPublicId: string;
  filters: Filters;
}) {
  const query = useQuery({
    queryKey: queryKeys.projects.topProblematic(projectPublicId, filters),
    queryFn: () =>
      projectsApi.topProblematicConversations(projectPublicId, {
        ...filters,
        limit: 10,
      }),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : undefined}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data?.items ?? [];
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
        No hay conversaciones con score bajo en este periodo. Buen trabajo.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Score</TableHead>
          <TableHead>Tema</TableHead>
          <TableHead className="hidden md:table-cell">Agente</TableHead>
          <TableHead className="hidden md:table-cell">Inicio</TableHead>
          <TableHead className="text-right">Mensajes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((conv) => (
          <TableRow key={conv.public_id} className="cursor-pointer">
            <TableCell>
              <ScoreBadge value={conv.score} />
            </TableCell>
            <TableCell>
              <Link
                href={`/conversations/${conv.public_id}`}
                className="font-medium hover:underline"
              >
                {conv.topic ?? "Sin tema detectado"}
              </Link>
            </TableCell>
            <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
              {conv.agent_name ?? conv.agent_id}
            </TableCell>
            <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
              {formatDateTime(conv.started_at)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {conv.message_count}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
