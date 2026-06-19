"use client";

import { AtSign, MessageCircle } from "lucide-react";

import { DisplayCard } from "@/components/ui/display-cards";
import { ScoreBadge } from "@/components/shared/score-badge";
import { cn } from "@/lib/utils";
import { CONVERSATIONS, type Conversation } from "@/lib/landing/conversations";

const CHANNEL_ICON = { whatsapp: MessageCircle, instagram: AtSign } as const;

// Abanico diagonal: cada card baja ~4.5rem, así el header (icono+tema+score) queda
// expuesto y clickeable. La del frente, nítida; las de atrás, levemente tenues.
const STACK = [
  "[grid-area:stack] translate-x-0 translate-y-0 opacity-85 hover:-translate-y-1 hover:opacity-100",
  "[grid-area:stack] translate-x-5 translate-y-[6rem] opacity-90 hover:translate-y-[5.5rem] hover:opacity-100",
  "[grid-area:stack] translate-x-10 translate-y-[12rem] hover:translate-y-[11.5rem]",
];

export function ConversationCards({
  onSelect,
  selectedId,
}: {
  onSelect: (c: Conversation) => void;
  selectedId?: string | null;
}) {
  return (
    <div className="grid min-h-[24rem] [grid-template-areas:'stack'] place-items-start pt-2">
      {CONVERSATIONS.map((c, i) => {
        const Icon = CHANNEL_ICON[c.channel];
        return (
          <DisplayCard
            key={c.id}
            className={cn(
              STACK[i] ?? STACK[STACK.length - 1],
              selectedId === c.id && "border-primary/60 opacity-100",
            )}
            icon={<Icon className="size-4 text-primary" />}
            title={c.topic}
            description={`${c.person} · ${c.status}`}
            date={c.date}
            trailing={<ScoreBadge score={c.score} />}
            onClick={() => onSelect(c)}
          />
        );
      })}
    </div>
  );
}
