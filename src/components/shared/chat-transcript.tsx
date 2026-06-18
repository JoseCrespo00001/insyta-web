import type { Conversation } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatTranscript({
  conversation,
}: {
  conversation: Conversation;
}) {
  if (conversation.messages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Esta conversación no tiene mensajes.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {conversation.messages.map((m, i) => (
        <div
          key={i}
          className={cn(
            "flex",
            m.role === "user" ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
              m.role === "user"
                ? "bg-primary/15 text-foreground"
                : "bg-muted text-foreground",
            )}
          >
            <span className="mb-0.5 flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {m.role === "user" ? "Usuario" : "Bot"}
              <span className="tabular-nums">{time(m.at)}</span>
            </span>
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}
