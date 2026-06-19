import { useTranslations } from "next-intl";
import {
  Gauge,
  Activity,
  FlaskConical,
  BellRing,
  ShieldAlert,
  LayoutGrid,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";

type Feature = { title: string; description: string };

const ICONS = [
  Gauge,
  Activity,
  FlaskConical,
  BellRing,
  ShieldAlert,
  LayoutGrid,
];

export function Features() {
  const t = useTranslations("features");
  const items = t.raw("items") as Feature[];

  return (
    <section id="producto" className="py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => {
            const Icon = ICONS[i] ?? Gauge;
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {f.description}
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
