import { useTranslations } from "next-intl";

import { Reveal } from "@/components/landing/reveal";

type Integration = { name: string; tag: string };

export function Integrations() {
  const t = useTranslations("integrations");
  const items = t.raw("items") as Integration[];

  return (
    <section id="integraciones" className="border-t border-border py-24">
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

        <div className="mt-14 flex flex-wrap justify-center gap-4">
          {items.map((it, i) => (
            <Reveal key={it.name} delay={(i % 5) * 0.06}>
              <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 transition-colors hover:border-primary/40">
                <span className="size-2 rounded-full bg-primary" />
                <span className="font-semibold">{it.name}</span>
                <span className="text-xs text-muted-foreground">{it.tag}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
