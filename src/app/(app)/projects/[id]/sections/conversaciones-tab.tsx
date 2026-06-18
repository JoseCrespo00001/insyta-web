import * as React from "react";
import { MessagesSquare, Search, Upload } from "lucide-react";

import { ConversationDetailBody } from "@/components/shared/conversation-detail-body";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

export function ConversacionesTab({
  conversations,
  onUploadCsv,
  onToggle,
  onToggleAll,
}: {
  conversations: Conversation[];
  onUploadCsv: () => void;
  onToggle: (id: string) => void;
  onToggleAll: (selectAll: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [viewing, setViewing] = React.useState<Conversation | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

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
  const filtered = q
    ? conversations.filter(
        (c) =>
          c.externalId.includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.preview.toLowerCase().includes(q),
      )
    : conversations;

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

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin resultados para &ldquo;{query}&rdquo;.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox
                  checked={c.selected}
                  onCheckedChange={() => onToggle(c.id)}
                  aria-label={`Seleccionar ${c.contactName}`}
                />
                <button
                  type="button"
                  onClick={() => setViewing(c)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-medium">{c.contactName}</span>
                    <span className="text-xs text-muted-foreground">
                      #{c.externalId}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.preview}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.messageCount} mensajes · {c.userMessages} usuario ·{" "}
                    {c.botMessages} bot
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <SatisfactionBadge value={c.satisfaction} />
                  <ScoreBadge score={c.score} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat transcript */}
      <Sheet
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{viewing?.contactName}</SheetTitle>
            <SheetDescription>
              #{viewing?.externalId} · {viewing?.messageCount} mensajes
            </SheetDescription>
          </SheetHeader>
          {viewing ? <ConversationDetailBody conversation={viewing} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
