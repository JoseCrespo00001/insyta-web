"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

function ScoreCard() {
  const t = useTranslations("hero.card");

  return (
    <div className="glass relative w-full max-w-md rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            {t("label")}
          </p>
          <p className="mt-1 font-mono text-sm text-white/80">{t("id")}</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-score-risk">42</span>
          <span className="text-[10px] uppercase tracking-wider text-white/50">
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
          <div
            key={m.k}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-2.5"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/45">
              {t(m.k)}
            </p>
            <p className="mt-0.5 text-sm font-semibold">{t(m.v)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-score-critical">
            <Sparkles className="size-3.5" />
            {t("patternLabel")}
          </div>
          <p className="mt-1.5 text-sm text-white/80">{t("pattern")}</p>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <TrendingUp className="size-3.5" />
            {t("improvementLabel")}
          </div>
          <p className="mt-1.5 text-sm text-white/90">{t("improvement")}</p>
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
    <section className="relative isolate overflow-hidden bg-[#000B1A] text-white">
      {/* Aurora orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="aurora absolute -left-32 top-0 size-[28rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="halo-pulse absolute right-0 top-1/4 size-[24rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="aurora absolute bottom-0 left-1/3 size-[20rem] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="container grid items-center gap-12 py-24 md:py-32 lg:grid-cols-2 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            {t("badge")}
          </span>

          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            {t("title")}
          </h1>

          <p className="max-w-xl text-balance text-lg text-white/70 md:text-xl">
            {t("subtitle")}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="glow">
              <Link href="/login">
                {t("ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <a href="#como-funciona">{t("ctaSecondary")}</a>
            </Button>
          </div>

          <p className="text-sm text-white/45">{t("trust")}</p>
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
