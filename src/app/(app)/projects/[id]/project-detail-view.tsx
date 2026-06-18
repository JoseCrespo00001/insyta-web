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
import { formatDate } from "@/lib/format";
import {
  SAMPLE_AUDITS,
  SAMPLE_CONVERSATIONS,
  SAMPLE_FLUJOS,
  buildReport,
  makeAuditId,
} from "@/lib/projects/mock";
import type { Audit, Conversation, Flujo } from "@/lib/projects/types";

export function ProjectDetailView({
  projectId,
  initialTab = "resumen",
}: {
  projectId: string;
  initialTab?: string;
}) {
  // Estado compartido del proyecto (mock; el backend persiste de verdad).
  const [flujos, setFlujos] = React.useState<Flujo[]>(SAMPLE_FLUJOS);
  const [conversations, setConversations] = React.useState<Conversation[]>(() =>
    SAMPLE_CONVERSATIONS.map((c) => ({ ...c })),
  );
  const [audits, setAudits] = React.useState<Audit[]>(SAMPLE_AUDITS);

  function uploadCsv() {
    // Mock: el backend parsea el CSV real. Acá poblamos con datos de ejemplo.
    setConversations(SAMPLE_CONVERSATIONS.map((c) => ({ ...c })));
    toast.success("Conversaciones cargadas desde el CSV");
  }

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
    setConversations((prev) => prev.filter((c) => c.id !== id));
    toast.success("Conversación eliminada");
  }

  function createAudit(config: {
    flujoId: string;
    emphasis: string[];
    freeText: string;
  }) {
    const flujo = flujos.find((f) => f.id === config.flujoId);
    const selected = conversations.filter((c) => c.selected);
    const now = new Date().toISOString();
    const audit: Audit = {
      id: makeAuditId(),
      name: `Auditoría ${formatDate(now)}`,
      flujoId: config.flujoId,
      flujoName: flujo?.name ?? "—",
      conversationCount: selected.length,
      emphasis: config.emphasis,
      freeText: config.freeText,
      createdAt: now,
      status: "active",
      report: buildReport(selected),
    };
    setAudits((prev) => [audit, ...prev]);
    toast.success(`Auditoría corrida sobre ${selected.length} conversaciones`);
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
          Bot Ventas 001
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
          <FlujosTab
            flujos={flujos}
            onAddFlujo={(f) => setFlujos((prev) => [f, ...prev])}
          />
        </TabsContent>

        <TabsContent value="conversaciones">
          <ConversacionesTab
            conversations={conversations}
            onUploadCsv={uploadCsv}
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
