"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AuditoriasTab } from "./sections/auditorias-tab";
import { ConversacionesTab } from "./sections/conversaciones-tab";
import { FlujosTab } from "./sections/flujos-tab";
import { ResumenTab } from "./sections/resumen-tab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAudits,
  useConversations,
  useCreateAudit,
  useDeleteConversation,
  useFlows,
  useProjects,
} from "@/lib/queries";
import type {
  Audit,
  Conversation,
  ConversationEvaluation,
  Flujo,
} from "@/lib/projects/types";

const EMPTY_EVAL: ConversationEvaluation = {
  resolution: false,
  satisfaction: 0,
  tone: "neutral",
  frustration: false,
  escalated: false,
  efficiency: 0,
  scopeViolation: false,
  topic: "",
  summary: "",
  modelUsed: "",
  tokensInput: 0,
  tokensOutput: 0,
  costUsd: 0,
  latencyMs: 0,
  phoenixTraceId: "",
  phoenixSpanId: "",
  evaluatedAt: "",
};

type ConvSummary = {
  public_id: string;
  external_id: string;
  contact_name: string | null;
  preview: string | null;
  message_count: number;
  upload_group_id: string | null;
  score: number | null;
  satisfaction: Conversation["satisfaction"];
  resolved: boolean | null;
};

export function ProjectDetailView({
  projectId,
  initialTab = "resumen",
}: {
  projectId: string;
  initialTab?: string;
}) {
  // Datos reales del proyecto desde el backend.
  const { data: projects } = useProjects();
  const project = projects?.find((p) => p.publicId === projectId);
  const { data: flowsData } = useFlows(projectId);
  const { data: auditsData } = useAudits(projectId);
  const { data: convData } = useConversations(projectId);
  const createAuditMut = useCreateAudit(projectId);
  const deleteConvMut = useDeleteConversation(projectId);

  // Estado local (las tabs mutan/seleccionan); se siembra desde el backend.
  const [flujos, setFlujos] = React.useState<Flujo[]>([]);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [audits, setAudits] = React.useState<Audit[]>([]);

  React.useEffect(() => {
    if (flowsData) setFlujos(flowsData as Flujo[]);
  }, [flowsData]);
  React.useEffect(() => {
    if (auditsData) setAudits(auditsData as unknown as Audit[]);
  }, [auditsData]);
  React.useEffect(() => {
    const items = (convData?.items as ConvSummary[] | undefined) ?? [];
    setConversations((prev) => {
      const sel = new Set(prev.filter((c) => c.selected).map((c) => c.id));
      const pin = new Set(prev.filter((c) => c.pinned).map((c) => c.id));
      return items.map((c) => ({
        id: c.public_id,
        uploadGroupId: c.upload_group_id ?? "sin-grupo",
        externalId: c.external_id,
        contactName: c.contact_name ?? "—",
        preview: c.preview ?? "",
        messageCount: c.message_count ?? 0,
        userMessages: 0,
        botMessages: 0,
        messages: [],
        score: c.score ?? null,
        satisfaction: c.satisfaction ?? null,
        resolved: c.resolved ?? null,
        evaluation: EMPTY_EVAL,
        selected: sel.has(c.public_id),
        pinned: pin.has(c.public_id),
      }));
    });
  }, [convData]);

  function toggleConversation(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
    );
  }

  function toggleAllConversations(selectAll: boolean) {
    setConversations((prev) =>
      prev.map((c) => ({ ...c, selected: selectAll })),
    );
  }

  function toggleGroup(groupId: string, selectAll: boolean) {
    setConversations((prev) =>
      prev.map((c) =>
        c.uploadGroupId === groupId ? { ...c, selected: selectAll } : c,
      ),
    );
  }

  function togglePinConversation(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
    const willPin = !conversations.find((c) => c.id === id)?.pinned;
    toast.success(willPin ? "Conversación fijada" : "Conversación desfijada");
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id)); // optimista
    deleteConvMut.mutate(id, {
      onSuccess: () => toast.success("Conversación eliminada"),
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "No se pudo eliminar"),
    });
  }

  function createAudit(config: {
    flujoId: string;
    emphasis: string[];
    freeText: string;
  }) {
    const selected = conversations.filter((c) => c.selected);
    if (selected.length === 0) {
      toast.error("Seleccioná al menos una conversación");
      return;
    }
    // POST real -> el backend crea la auditoría en "running" y encola el judge
    // (run_audit). La lista (useAudits) hace polling y refleja el resultado.
    createAuditMut.mutate(
      {
        flujoId: config.flujoId,
        conversationIds: selected.map((c) => c.id),
        emphasis: config.emphasis,
        freeText: config.freeText,
      },
      {
        onSuccess: () =>
          toast.success(
            `Auditoría en curso sobre ${selected.length} conversaciones`,
          ),
        onError: (e) =>
          toast.error(
            e instanceof Error ? e.message : "No se pudo crear la auditoría",
          ),
      },
    );
  }

  function archiveAudit(id: string) {
    const willArchive = audits.find((a) => a.id === id)?.status !== "archived";
    setAudits((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "archived" ? "active" : "archived" }
          : a,
      ),
    );
    toast.success(
      willArchive ? "Auditoría archivada" : "Auditoría desarchivada",
    );
  }

  function deleteAudit(id: string) {
    setAudits((prev) => prev.filter((a) => a.id !== id));
    toast.success("Auditoría eliminada");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 text-muted-foreground"
        >
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            Proyectos
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {project?.name ?? "Proyecto"}
        </h1>
        <p className="text-sm text-muted-foreground">{projectId}</p>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="flujos">Flujos</TabsTrigger>
          <TabsTrigger value="conversaciones">Conversaciones</TabsTrigger>
          <TabsTrigger value="auditorias">Auditorías</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <ResumenTab
            flujos={flujos}
            conversations={conversations}
            audits={audits}
            onArchiveAudit={archiveAudit}
            onDeleteAudit={deleteAudit}
          />
        </TabsContent>

        <TabsContent value="flujos">
          <FlujosTab flujos={flujos} projectId={projectId} />
        </TabsContent>

        <TabsContent value="conversaciones">
          <ConversacionesTab
            conversations={conversations}
            projectId={projectId}
            onToggle={toggleConversation}
            onToggleAll={toggleAllConversations}
            onToggleGroup={toggleGroup}
            onTogglePin={togglePinConversation}
            onDeleteConversation={deleteConversation}
          />
        </TabsContent>

        <TabsContent value="auditorias">
          <AuditoriasTab
            flujos={flujos}
            conversations={conversations}
            audits={audits}
            onCreateAudit={createAudit}
            onArchiveAudit={archiveAudit}
            onDeleteAudit={deleteAudit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
