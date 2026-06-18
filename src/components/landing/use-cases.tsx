import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  HeartPulse,
  Landmark,
  HandCoins,
  Briefcase,
  Truck,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";

type UseCase = { industry: string; pain: string };

const ICONS = [ShoppingCart, HeartPulse, Landmark, HandCoins, Briefcase, Truck];

export function UseCases() {
  const t = useTranslations("useCases");
  const items = t.raw("items") as UseCase[];

  return (
    <section id="casos" className="border-t border-border py-24">
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

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => {
            const Icon = ICONS[i] ?? ShoppingCart;
            return (
              <Reveal key={c.industry} delay={(i % 3) * 0.08}>
                <div className="flex h-full gap-4 rounded-2xl border border-border bg-card p-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.industry}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {c.pain}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
