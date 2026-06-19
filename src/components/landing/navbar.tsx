"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "problema", key: "problem" },
  { id: "dashboard", key: "dashboard" },
  { id: "como-funciona", key: "howItWorks" },
  { id: "producto", key: "features" },
  { id: "integraciones", key: "integrations" },
  { id: "faq", key: "faq" },
] as const;

// Estilo "isla": chip flotante redondeado con blur (coherente con el dashboard).
const island =
  "rounded-full border border-border/60 bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60";

function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 md:px-6">
      {/* Isla: logo (chip charcoal fijo → el wordmark blanco se ve siempre) */}
      <Link
        href="/"
        className="flex h-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[hsl(215_100%_5%)] px-3 shadow-sm"
        aria-label="Insyta"
      >
        <Image
          src="/logos/logo_wordmark_white.svg"
          alt="Insyta"
          width={72}
          height={24}
          className="h-6 w-auto"
          unoptimized
          priority
        />
      </Link>

      {/* Isla: navegación (desktop) */}
      <nav className={cn("hidden items-center gap-1 p-1 md:flex", island)}>
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="flex h-9 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t(s.key)}
          </a>
        ))}
      </nav>

      {/* Isla: acciones */}
      <div className={cn("ml-auto flex items-center gap-1 p-1", island)}>
        <ThemeToggle label={t("toggleTheme")} />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden rounded-full sm:inline-flex"
        >
          <Link href="/login">{t("login")}</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="hidden rounded-full sm:inline-flex"
        >
          <Link href="/login">{t("cta")}</Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              aria-label={t("openMenu")}
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Insyta</SheetTitle>
            <nav className="mt-8 flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {t(s.key)}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Button asChild variant="outline">
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">{t("cta")}</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
