import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function CtaBand() {
  const t = useTranslations("cta");

  return (
    <section className="py-24">
      <div className="container">
        <Reveal className="relative isolate overflow-hidden rounded-3xl bg-[#000B1A] px-6 py-16 text-center text-white md:px-16 md:py-20">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="aurora absolute -left-20 top-0 size-72 rounded-full bg-primary/25 blur-[100px]" />
            <div className="halo-pulse absolute -right-10 bottom-0 size-72 rounded-full bg-primary/15 blur-[100px]" />
          </div>

          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-white/70">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="glow">
              <Link href="/login">
                {t("primary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <a href="#como-funciona">{t("secondary")}</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
