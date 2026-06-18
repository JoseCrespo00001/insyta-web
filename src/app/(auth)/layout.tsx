import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

const HIGHLIGHTS = [
  "Evaluación automática de cada conversación",
  "Detección de patrones y sugerencias de mejora",
  "Impacto medido con score delta a 14 días",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* IZQUIERDA — panel de marca (oculto en mobile) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(215_100%_5%)] p-12 lg:flex">
        {/* Gradiente de marca (mesh) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-[hsl(160_55%_8%)]/50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_15%,hsl(137_72%_66%/0.18),transparent_55%)]" />

        {/* 4 isotipos grandes — esencia de marca en todo el fondo */}
        <Image
          src="/logos/logo_verde.svg"
          alt=""
          width={640}
          height={640}
          className="pointer-events-none absolute -left-44 -top-40 h-[34rem] w-[34rem] rotate-12 opacity-[0.07]"
          unoptimized
        />
        <Image
          src="/logos/logo_verde.svg"
          alt=""
          width={560}
          height={560}
          className="pointer-events-none absolute -right-36 -top-28 h-[26rem] w-[26rem] -rotate-12 opacity-[0.05]"
          unoptimized
        />
        <Image
          src="/logos/logo_verde.svg"
          alt=""
          width={600}
          height={600}
          className="pointer-events-none absolute -bottom-48 -left-28 h-[30rem] w-[30rem] -rotate-6 opacity-[0.06]"
          unoptimized
        />
        <Image
          src="/logos/logo_verde.svg"
          alt=""
          width={680}
          height={680}
          className="pointer-events-none absolute -bottom-44 -right-44 h-[36rem] w-[36rem] rotate-6 opacity-[0.05]"
          unoptimized
        />

        {/* Aurora */}
        <div className="aurora pointer-events-none absolute -left-32 -top-24 h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-[130px]" />
        <div className="aurora pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[130px] [animation-delay:-8s]" />

        {/* Viñeta: oscurece izquierda para legibilidad del texto */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[hsl(215_100%_5%)]/60 via-transparent to-transparent" />

        {/* Wordmark arriba */}
        <Link href="/" className="relative z-10 w-fit" aria-label="Insyta">
          <Image
            src="/logos/logo_wordmark_white.svg"
            alt="Insyta"
            width={108}
            height={36}
            className="h-7 w-auto"
            unoptimized
            priority
          />
        </Link>

        {/* Centro: logo grande con halo + headline */}
        <div className="relative z-10 flex flex-col items-start gap-8">
          <div className="relative flex items-center justify-center">
            <div className="halo-pulse absolute inset-0 -z-10 rounded-full bg-primary/40 blur-3xl" />
            <Image
              src="/logos/logo_verde.svg"
              alt=""
              width={176}
              height={176}
              className="h-44 w-44 drop-shadow-[0_0_40px_hsl(137_72%_66%/0.45)]"
              unoptimized
              priority
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-white">
              Mejora continua para
              <br />
              tus agentes de IA
            </h1>
            <p className="max-w-md text-base text-white/55">
              Cada conversación evaluada, cada patrón detectado, cada mejora
              medida.
            </p>
          </div>

          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-white/75"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/40">
                  <Check className="h-3 w-3 text-primary" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-white/35">
          © 2026 Insyta · Mejora continua para agentes de IA
        </p>
      </aside>

      {/* DERECHA — formulario */}
      <main className="relative flex flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
        {/* Glow sutil detrás del form */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

        {/* Logo solo en mobile (el panel izquierdo está oculto) */}
        <Link
          href="/"
          className="relative z-10 mb-8 flex h-12 items-center justify-center rounded-full border border-white/10 bg-[hsl(215_100%_5%)] px-5 shadow-lg lg:hidden"
          aria-label="Insyta"
        >
          <Image
            src="/logos/logo_wordmark_white.svg"
            alt="Insyta"
            width={96}
            height={32}
            className="h-6 w-auto"
            unoptimized
            priority
          />
        </Link>

        <div className="relative z-10 w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
