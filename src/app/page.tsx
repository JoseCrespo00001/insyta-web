import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("landing");

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-6 py-24">
      <h1 className="text-balance text-center text-4xl font-bold tracking-tight md:text-6xl">
        {t("title")}
      </h1>
      <p className="text-balance text-center text-lg text-muted-foreground md:text-xl">
        {t("tagline")}
      </p>
      <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
    </main>
  );
}
