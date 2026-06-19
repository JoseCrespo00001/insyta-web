"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ConversationCards } from "@/components/landing/conversation-cards";
import { ConversationExpediente } from "@/components/landing/conversation-expediente";
import type { Conversation } from "@/lib/landing/conversations";

export function Hero() {
  const t = useTranslations("hero");
  const [selected, setSelected] = useState<Conversation | null>(null);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="container py-24 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start gap-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" />
              {t("badge")}
            </span>

            <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              {t("title")}
            </h1>

            <p className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="glow">
                <Link href="/login">
                  {t("ctaPrimary")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#como-funciona">{t("ctaSecondary")}</a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">{t("trust")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="flex flex-col items-center gap-4"
          >
            <ConversationCards
              onSelect={setSelected}
              selectedId={selected?.id}
            />
            <p className="text-center text-xs text-muted-foreground">
              {t("cardsHint")}
            </p>
          </motion.div>
        </div>

        <ConversationExpediente
          conversation={selected}
          onClose={() => setSelected(null)}
        />
      </div>
    </section>
  );
}
