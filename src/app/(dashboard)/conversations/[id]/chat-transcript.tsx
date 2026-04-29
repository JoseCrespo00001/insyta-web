"use client";

import { Bot, User, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import type { Message } from "@/lib/api/schemas";

const ROLE_META: Record<
  Message["role"],
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bubble: string;
    align: "start" | "end";
  }
> = {
  user: {
    label: "Cliente",
    icon: User,
    bubble: "bg-muted text-foreground",
    align: "start",
  },
  assistant: {
    label: "Agente",
    icon: Bot,
    bubble: "bg-primary text-primary-foreground",
    align: "end",
  },
  system: {
    label: "Sistema",
    icon: Settings2,
    bubble: "bg-amber-500/15 text-amber-900 dark:text-amber-100",
    align: "start",
  },
};

export function ChatTranscript({ messages }: { messages: Message[] }) {
  return (
    <ol className="flex max-h-[640px] flex-col gap-3 overflow-y-auto p-4">
      {messages.map((m) => {
        const meta = ROLE_META[m.role];
        const Icon = meta.icon;
        return (
          <li
            key={m.public_id}
            className={cn(
              "flex max-w-[85%] flex-col gap-1",
              meta.align === "end" ? "items-end self-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
                meta.align === "end" && "flex-row-reverse",
              )}
            >
              <Icon className="h-3 w-3" aria-hidden />
              <span>{meta.label}</span>
              <span aria-hidden>·</span>
              <span>{formatDateTime(m.timestamp)}</span>
            </div>
            <div
              className={cn(
                "whitespace-pre-wrap rounded-lg border px-3 py-2 text-sm",
                meta.bubble,
                meta.align === "end" ? "border-primary/40" : "border-border",
              )}
            >
              {m.content_anonymized}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
