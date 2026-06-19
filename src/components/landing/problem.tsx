import { useTranslations } from "next-intl";
import { Check, EyeOff, ScanEye, X } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";

export function Problem() {
  const t = useTranslations("problem");
  const before = t.raw("before") as string[];
  const after = t.raw("after") as string[];

  return (
    <section id="problema" className="py-24">
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

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Antes: canal opaco */}
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-score-critical/10 text-score-critical">
                  <EyeOff className="size-5" />
                </div>
                <h3 className="font-semibold">{t("beforeTitle")}</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {before.map((item) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <X className="mt-0.5 size-4 shrink-0 text-score-critical" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Después: canal medible */}
          <Reveal delay={0.08}>
            <div className="h-full rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ScanEye className="size-5" />
                </div>
                <h3 className="font-semibold">{t("afterTitle")}</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {after.map((item) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
