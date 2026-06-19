"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AtSign,
  Brain,
  Check,
  MessageCircle,
  Scale,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScoreBadge } from "@/components/shared/score-badge";
import { cn } from "@/lib/utils";
import type { Conversation, ProblemFlag } from "@/lib/landing/conversations";

const INTENT_PILL = {
  good: "bg-score-good/15 text-score-good",
  bad: "bg-score-critical/15 text-score-critical",
  warn: "bg-score-risk/15 text-score-risk",
} as const;

const CHANNEL_ICON = { whatsapp: MessageCircle, instagram: AtSign } as const;

const FLAG_STYLE: Record<
  ProblemFlag["kind"],
  { icon: typeof Brain; box: string; text: string }
> = {
  hallucination: {
    icon: Brain,
    box: "border-score-critical/30 bg-score-critical/5",
    text: "text-score-critical",
  },
  legal: {
    icon: Scale,
    box: "border-score-critical/30 bg-score-critical/5",
    text: "text-score-critical",
  },
  automation: {
    icon: Zap,
    box: "border-score-risk/30 bg-score-risk/5",
    text: "text-score-risk",
  },
  ok: {
    icon: Check,
    box: "border-score-good/30 bg-score-good/5",
    text: "text-score-good",
  },
};

// Easing suave (easeOutExpo-ish) para una entrada más fluida.
const EASE = [0.22, 1, 0.36, 1] as const;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ConversationExpediente({
  conversation,
  onClose,
}: {
  conversation: Conversation | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation) return;
    const id = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 220);
    return () => window.clearTimeout(id);
  }, [conversation]);

  return (
    <AnimatePresence initial={false}>
      {conversation ? (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="overflow-hidden"
          style={{ perspective: 1400 }}
        >
          <motion.div
            ref={ref}
            initial={{ rotateX: 14, scale: 0.96, y: -20, opacity: 0 }}
            animate={{ rotateX: 0, scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.12 }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "top center",
            }}
            className="mx-auto mt-12 max-w-5xl rounded-[28px] border-4 border-border bg-card p-2 shadow-2xl md:p-3"
          >
            <div className="grid gap-3 rounded-2xl bg-background/50 p-3 md:grid-cols-2 md:p-4">
              <ChatPane conversation={conversation} onClose={onClose} />
              <ReportPane conversation={conversation} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ChatPane({
  conversation,
  onClose,
}: {
  conversation: Conversation;
  onClose: () => void;
}) {
  const Channel = CHANNEL_ICON[conversation.channel];
  return (
    <div className="flex flex-col rounded-xl border bg-card/70 p-4">
      <div className="flex items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {initials(conversation.name)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-card text-foreground">
              <Channel className="size-2.5" />
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold">{conversation.name}</p>
            <p className="text-xs text-muted-foreground">
              {conversation.handle} · {conversation.date}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar expediente"
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
        {conversation.chat.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.from === "agente" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                m.from === "agente"
                  ? "rounded-br-sm bg-primary/15 text-foreground"
                  : "rounded-bl-sm bg-muted text-foreground",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPane({ conversation }: { conversation: Conversation }) {
  const { report, score } = conversation;
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Reporte de la conversación
        </h3>
        <ScoreBadge score={score} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {report.dimensions.map((d) => (
          <div
            key={d.label}
            className="rounded-lg border bg-background/40 p-2 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {d.label}
            </p>
            <p
              className={cn(
                "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                INTENT_PILL[d.intent],
              )}
            >
              {d.value}
            </p>
          </div>
        ))}
      </div>

      {/* Problemas detectados */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Problemas detectados
        </p>
        {report.flags.map((f) => {
          const s = FLAG_STYLE[f.kind];
          const Icon = s.icon;
          return (
            <div key={f.label} className={cn("rounded-lg border p-3", s.box)}>
              <div
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold",
                  s.text,
                )}
              >
                <Icon className="size-3.5" />
                {f.label}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{f.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <TrendingUp className="size-3.5" />
          Mejora propuesta
        </div>
        <p className="mt-1.5 text-sm text-foreground/90">
          {report.improvement}
        </p>
        <span className="mt-2 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
          {report.delta}
        </span>
      </div>
    </div>
  );
}
