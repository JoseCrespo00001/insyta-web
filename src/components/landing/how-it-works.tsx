import { useTranslations } from "next-intl";
import { Plug, Gauge, ScanSearch, Repeat } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";

type Step = { step: string; title: string; description: string };

const ICONS = [Plug, Gauge, ScanSearch, Repeat];

export function HowItWorks() {
  const t = useTranslations("howItWorks");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="como-funciona" className="py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = ICONS[i] ?? Plug;
            return (
              <Reveal key={s.step} delay={i * 0.08}>
                <div className="group relative h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="mt-5 block font-mono text-xs text-muted-foreground">
                    {s.step}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
