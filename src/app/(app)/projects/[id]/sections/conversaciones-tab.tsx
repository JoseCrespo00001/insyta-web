import * as React from "react";
import {
  Check,
  ChevronDown,
  FileText,
  Minus,
  MessagesSquare,
  Pin,
  Search,
  Upload,
} from "lucide-react";

import { ConversationWorkspace } from "@/components/shared/conversation-workspace";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { CSV_GROUPS } from "@/lib/projects/mock";
import type { Conversation, Satisfaction } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

const SAT_CLASS: Record<Satisfaction, string> = {
  satisfecho: "bg-score-good/15 text-foreground",
  neutral: "bg-muted text-muted-foreground",
  insatisfecho: "bg-score-critical/15 text-foreground",
};

function SatisfactionBadge({ value }: { value: Satisfaction | null }) {
  if (!value) return null;
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

type TriState = "all" | "some" | "none";

/** Checkbox tri-estado para el header del CSV (todas / algunas / ninguna). */
function GroupCheck({
  state,
  onToggle,
  label,
}: {
  state: TriState;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={
        state === "all" ? "true" : state === "some" ? "mixed" : "false"
      }
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "grid h-4 w-4 shrink-0 place-content-center rounded-sm border border-primary shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        state !== "none"
          ? "bg-primary text-primary-foreground"
          : "bg-transparent",
      )}
    >
      {state === "all" ? (
        <Check className="h-3.5 w-3.5" />
      ) : state === "some" ? (
        <Minus className="h-3.5 w-3.5" />
      ) : null}
    </button>
  );
}

export function ConversacionesTab({
  conversations,
  onUploadCsv,
  onToggle,
  onToggleAll,
  onToggleGroup,
  onTogglePin,
  onDeleteConversation,
}: {
  conversations: Conversation[];
  onUploadCsv: () => void;
  onToggle: (id: string) => void;
  onToggleAll: (selectAll: boolean) => void;
  onToggleGroup: (groupId: string, selectAll: boolean) => void;
  onTogglePin: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Buscamos la conversación viva por id (refleja pin/delete en tiempo real).
  const viewing = conversations.find((c) => c.id === viewingId) ?? null;

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.[0]) return;
    onUploadCsv(); // mock: el backend parsea el CSV de verdad
    event.target.value = "";
  }

  const hidden = (
    <input
      ref={fileRef}
      type="file"
      accept=".csv,text/csv"
      className="hidden"
      onChange={handleFile}
    />
  );

  if (viewing) {
    return (
      <ConversationWorkspace
        conversation={viewing}
        onBack={() => setViewingId(null)}
        onTogglePin={onTogglePin}
        onDelete={onDeleteConversation}
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <MessagesSquare className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Todavía no hay conversaciones</p>
            <p className="text-sm text-muted-foreground">
              Subí un CSV: lo leemos y mostramos cada conversación como una card
              para que elijas cuáles testear.
            </p>
          </div>
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Subir CSV
          </Button>
          {hidden}
        </CardContent>
      </Card>
    );
  }

  const q = query.trim().toLowerCase();
  const matches = (c: Conversation) =>
    !q ||
    c.externalId.includes(q) ||
    c.contactName.toLowerCase().includes(q) ||
    c.preview.toLowerCase().includes(q);

  // Agrupar por CSV de origen, respetando el orden de CSV_GROUPS.
  // Dentro de cada grupo, las fijadas van primero.
  const byPinned = (a: Conversation, b: Conversation) =>
    Number(b.pinned) - Number(a.pinned);
  const groups = CSV_GROUPS.map((meta) => {
    const all = conversations.filter((c) => c.uploadGroupId === meta.id);
    return {
      meta,
      all,
      visible: all.filter(matches).sort(byPinned),
    };
  }).filter((g) => g.all.length > 0 && g.visible.length > 0);

  const selectedCount = conversations.filter((c) => c.selected).length;
  const allSelected = selectedCount === conversations.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por número o texto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleAll(!allSelected)}
        >
          {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedCount} de {conversations.length} seleccionadas
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Recargar CSV
        </Button>
        {hidden}
      </div>

      {/* Grupos por CSV */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin resultados para &ldquo;{query}&rdquo;.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map(({ meta, all, visible }) => {
            const selectedInGroup = all.filter((c) => c.selected).length;
            const state: TriState =
              selectedInGroup === 0
                ? "none"
                : selectedInGroup === all.length
                  ? "all"
                  : "some";
            const isCollapsed = collapsed[meta.id] ?? false;

            const toggleCollapse = () =>
              setCollapsed((prev) => ({ ...prev, [meta.id]: !isCollapsed }));

            return (
              <div
                key={meta.id}
                className="overflow-hidden rounded-lg border border-l-4"
                style={{ borderLeftColor: `hsl(${meta.accent})` }}
              >
                {/* Header del CSV — clickable entero para colapsar */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={toggleCollapse}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCollapse();
                    }
                  }}
                  aria-expanded={!isCollapsed}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:brightness-95"
                  style={{ backgroundColor: `hsl(${meta.accent} / 0.10)` }}
                >
                  <span
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <GroupCheck
                      state={state}
                      onToggle={() => onToggleGroup(meta.id, state !== "all")}
                      label={`Seleccionar todas las de ${meta.filename}`}
                    />
                  </span>
                  <FileText
                    className="h-4 w-4 shrink-0"
                    style={{ color: `hsl(${meta.accent})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {meta.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(meta.loadedAt)} · {all.length} conversaciones
                      · {selectedInGroup} seleccionadas
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {selectedInGroup}/{all.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isCollapsed && "-rotate-90",
                    )}
                  />
                </div>

                {/* Conversaciones del CSV */}
                {!isCollapsed && (
                  <div className="divide-y">
                    {visible.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Checkbox
                          checked={c.selected}
                          onCheckedChange={() => onToggle(c.id)}
                          aria-label={`Seleccionar ${c.contactName}`}
                        />
                        <button
                          type="button"
                          onClick={() => setViewingId(c.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {c.pinned ? (
                              <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            ) : null}
                            <span className="font-medium">{c.contactName}</span>
                            <span className="text-xs text-muted-foreground">
                              #{c.externalId}
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {c.preview}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {c.messageCount} mensajes · {c.userMessages} usuario
                            · {c.botMessages} bot
                          </p>
                        </button>
                        <div className="flex shrink-0 items-center gap-2">
                          <SatisfactionBadge value={c.satisfaction} />
                          <ScoreBadge score={c.score} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
