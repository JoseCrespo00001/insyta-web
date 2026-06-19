"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AtSign, MessageCircle, Sparkles, TrendingUp, X } from "lucide-react";

import { ScoreBadge } from "@/components/shared/score-badge";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/landing/conversations";

const INTENT_PILL = {
  good: "bg-score-good/15 text-score-good",
  bad: "bg-score-critical/15 text-score-critical",
  warn: "bg-score-risk/15 text-score-risk",
} as const;

const CHANNEL_ICON = { whatsapp: MessageCircle, instagram: AtSign } as const;

export function ConversationExpediente({
  conversation,
  onClose,
}: {
  conversation: Conversation | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {conversation ? (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden"
          style={{ perspective: 1200 }}
        >
          <motion.div
            initial={{ rotateX: 18, scale: 0.94, y: -28, opacity: 0 }}
            animate={{ rotateX: 0, scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "top center",
            }}
            className="mx-auto mt-12 max-w-5xl rounded-[28px] border-4 border-border bg-card p-2 shadow-2xl md:p-3"
          >
            <div className="grid gap-3 rounded-2xl bg-background/50 p-3 md:grid-cols-2 md:p-4">
              {/* CHAT */}
              <ChatPane conversation={conversation} onClose={onClose} />
              {/* REPORTE */}
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
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Channel className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">{conversation.person}</p>
            <p className="text-xs text-muted-foreground">
              {conversation.channel === "whatsapp" ? "WhatsApp" : "Instagram"} ·{" "}
              {conversation.date}
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
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-score-risk">{score}</span>
          <ScoreBadge score={score} />
        </div>
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
                "mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                INTENT_PILL[d.intent],
              )}
            >
              {d.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "rounded-lg border p-3",
          report.patternIntent === "good"
            ? "border-score-good/30 bg-score-good/5"
            : report.patternIntent === "warn"
              ? "border-score-risk/30 bg-score-risk/5"
              : "border-score-critical/30 bg-score-critical/5",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-semibold",
            report.patternIntent === "good"
              ? "text-score-good"
              : report.patternIntent === "warn"
                ? "text-score-risk"
                : "text-score-critical",
          )}
        >
          <Sparkles className="size-3.5" />
          Patrón detectado
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{report.pattern}</p>
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
