"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

function ScoreCard() {
  const t = useTranslations("hero.card");

  return (
    <div className="relative w-full max-w-md rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("label")}
          </p>
          <p className="mt-1 font-mono text-sm text-foreground/80">{t("id")}</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-score-risk">42</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t("score")}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[
          { k: "resolution", v: "resolutionValue" },
          { k: "satisfaction", v: "satisfactionValue" },
          { k: "frustration", v: "frustrationValue" },
        ].map((m) => (
          <div key={m.k} className="rounded-lg border bg-muted/40 px-2 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t(m.k)}
            </p>
            <p className="mt-0.5 text-sm font-semibold">{t(m.v)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-score-critical">
            <Sparkles className="size-3.5" />
            {t("patternLabel")}
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("pattern")}</p>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <TrendingUp className="size-3.5" />
            {t("improvementLabel")}
          </div>
          <p className="mt-1.5 text-sm text-foreground/90">
            {t("improvement")}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
            {t("delta")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative isolate overflow-hidden">
      <div className="container grid items-center gap-12 py-24 md:py-32 lg:grid-cols-2 lg:gap-8">
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
          className="flex justify-center lg:justify-end"
        >
          <ScoreCard />
        </motion.div>
      </div>
    </section>
  );
}
