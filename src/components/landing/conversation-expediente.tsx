"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AtSign,
  Brain,
  Check,
  MessageCircle,
  Scale,
  Target,
  TrendingUp,
  Workflow,
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
  flow: {
    icon: Workflow,
    box: "border-border bg-muted/40",
    text: "text-foreground",
  },
  objective: {
    icon: Target,
    box: "border-score-critical/30 bg-score-critical/5",
    text: "text-score-critical",
  },
  ok: {
    icon: Check,
    box: "border-score-good/30 bg-score-good/5",
    text: "text-score-good",
  },
};

// Easing muy suave (easeOutExpo) para una entrada cinematográfica.
const EASE = [0.16, 1, 0.3, 1] as const;

// Scroll propio con easeInOutCubic: más largo y suave que el scroll nativo.
function smoothScrollTo(targetY: number, duration = 1000) {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startY = window.scrollY;
  const diff = targetY - startY;
  if (reduce || Math.abs(diff) < 4) {
    window.scrollTo(0, targetY);
    return;
  }
  const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  let start: number | null = null;
  const step = (ts: number) => {
    if (start === null) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    window.scrollTo(0, startY + diff * ease(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

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
    // Esperamos a que el panel crezca y recién ahí hacemos el paneo suave.
    const id = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 96; // offset debajo del navbar
      smoothScrollTo(targetY, 1100);
    }, 420);
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
          transition={{
            height: { duration: 1, ease: EASE },
            opacity: { duration: 0.6, ease: EASE },
          }}
          className="overflow-hidden"
          style={{ perspective: 1600 }}
        >
          <motion.div
            ref={ref}
            initial={{
              rotateX: 10,
              scale: 0.94,
              y: 48,
              opacity: 0,
              filter: "blur(12px)",
            }}
            animate={{
              rotateX: 0,
              scale: 1,
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "top center",
            }}
            className="mx-auto mt-12 max-w-5xl rounded-[28px] border-4 border-border bg-card p-2 shadow-2xl md:p-3"
          >
            <div className="grid gap-3 rounded-2xl bg-background/50 p-3 md:grid-cols-2 md:p-4">
              <motion.div
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
                className="h-full"
              >
                <ChatPane conversation={conversation} onClose={onClose} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
                className="h-full"
              >
                <ReportPane conversation={conversation} />
              </motion.div>
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
    <div className="flex h-full flex-col rounded-xl border bg-card/70 p-4">
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

      <div className="mt-3 flex flex-1 flex-col justify-center gap-2.5">
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
    <div className="flex h-full flex-col gap-3 rounded-xl border bg-card/70 p-4">
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

      {/* Objetivo de campaña (si la conversación vino de una campaña) */}
      {report.objective ? (
        <div
          className={cn(
            "rounded-lg border p-3",
            report.objective.achieved
              ? "border-score-good/30 bg-score-good/5"
              : "border-score-critical/30 bg-score-critical/5",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex items-center gap-2 text-xs font-semibold",
                report.objective.achieved
                  ? "text-score-good"
                  : "text-score-critical",
              )}
            >
              <Target className="size-3.5" />
              Objetivo de campaña
            </div>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                report.objective.achieved
                  ? "bg-score-good/15 text-score-good"
                  : "bg-score-critical/15 text-score-critical",
              )}
            >
              {report.objective.achieved ? "Cumplido" : "No cumplido"}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {report.objective.source} · {report.objective.goal}
          </p>
          <p className="mt-1 text-sm text-foreground/90">
            {report.objective.detail}
          </p>
        </div>
      ) : null}

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
