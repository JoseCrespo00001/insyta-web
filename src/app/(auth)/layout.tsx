import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Isotipo de fondo (marca de agua) — claro y oscuro según el tema. */
function BgMark({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute select-none", className)}>
      <Image
        src="/logos/logo_oscuro.svg"
        alt=""
        width={320}
        height={320}
        className="h-full w-full opacity-[0.04] dark:hidden"
        unoptimized
      />
      <Image
        src="/logos/logo_verde.svg"
        alt=""
        width={320}
        height={320}
        className="hidden h-full w-full opacity-[0.07] dark:block"
        unoptimized
      />
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Grilla de puntos */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Glows verdes */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      {/* Isotipos como marca de agua */}
      <BgMark className="-left-20 -top-16 h-64 w-64 rotate-12" />
      <BgMark className="-bottom-24 -right-24 h-80 w-80 -rotate-12" />
      <BgMark className="left-[12%] top-1/2 hidden h-32 w-32 -rotate-6 lg:block" />
      <BgMark className="right-[14%] top-[14%] hidden h-28 w-28 rotate-6 lg:block" />

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 mb-6 flex h-11 items-center justify-center rounded-full border border-white/10 bg-[hsl(215_100%_5%)] px-5 shadow-lg"
        aria-label="Insyta"
      >
        <Image
          src="/logos/logo_wordmark_white.svg"
          alt="Insyta"
          width={84}
          height={28}
          className="h-6 w-auto"
          unoptimized
          priority
        />
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm [&>*]:shadow-xl [&>*]:shadow-black/5 [&>*]:backdrop-blur-sm">
        {children}
      </div>

      <p className="relative z-10 mt-6 text-xs text-muted-foreground">
        © 2026 Insyta · Mejora continua para agentes de IA
      </p>
    </div>
  );
}
