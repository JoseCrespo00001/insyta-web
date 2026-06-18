import { Phone, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/**
 * Styleguide en vivo — catálogo visual de la marca Insyta.
 * Brand dark-first: charcoal #000B1A + verde #6BE78E + glass + glow + Urbanist.
 * El canvas es oscuro a propósito (donde vive el glass). Ver 08-branding/.
 */

function Swatch({
  name,
  className,
  hex,
}: {
  name: string;
  className: string;
  hex?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={`h-16 w-full rounded-md border border-white/10 ${className}`}
      />
      <div className="text-xs">
        <p className="font-medium text-white">{name}</p>
        {hex ? <p className="text-white/50">{hex}</p> : null}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <Separator className="bg-white/10" />
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="dark relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* glow verde ambiental de fondo */}
      <div className="pointer-events-none fixed -left-24 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative mx-auto max-w-5xl space-y-12 py-12">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Insyta — Styleguide
          </h1>
          <p className="text-white/60">
            Brand dark-first: verde #6BE78E · charcoal #000B1A · glass ·
            Urbanist
          </p>
        </header>

        {/* Colores de marca */}
        <Section title="Colores de marca">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch
              name="primary (verde)"
              className="bg-primary"
              hex="#6BE78E"
            />
            <Swatch
              name="charcoal"
              className="bg-[hsl(215_100%_5%)]"
              hex="#000B1A"
            />
            <Swatch name="background" className="bg-background" />
            <Swatch name="card" className="bg-card" />
            <Swatch name="muted" className="bg-muted" />
            <Swatch name="accent" className="bg-accent" />
            <Swatch
              name="destructive"
              className="bg-destructive"
              hex="#EF4444"
            />
            <Swatch name="border" className="bg-border" />
          </div>
        </Section>

        {/* Colores de score */}
        <Section title="Colores de score (0-100)">
          <div className="grid grid-cols-3 gap-4">
            <Swatch name="good (>80)" className="bg-score-good" hex="#6BE78E" />
            <Swatch
              name="risk (50-80)"
              className="bg-score-risk"
              hex="#F59E0B"
            />
            <Swatch
              name="critical (<50)"
              className="bg-score-critical"
              hex="#EF4444"
            />
          </div>
          <div className="flex gap-2">
            <Badge className="bg-score-good text-black">92 · Bien</Badge>
            <Badge className="bg-score-risk text-black">63 · En riesgo</Badge>
            <Badge className="bg-score-critical text-white">34 · Crítico</Badge>
          </div>
        </Section>

        {/* Tipografía */}
        <Section title="Tipografía (Urbanist)">
          <div className="space-y-2 text-white">
            <p className="text-4xl font-bold">Aa — text-4xl bold (hero)</p>
            <p className="text-2xl font-semibold">
              Aa — text-2xl semibold (título)
            </p>
            <p className="text-xl font-medium">
              Aa — text-xl medium (subtítulo)
            </p>
            <p className="text-base">Aa — text-base (body)</p>
            <p className="text-sm text-white/60">Aa — text-sm (metadata)</p>
            <p className="text-xs text-white/50">
              Aa — text-xs (badges, timestamps)
            </p>
          </div>
        </Section>

        {/* Botones */}
        <Section title="Botones">
          <p className="text-sm text-white/60">Glass + glow (landing):</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="glow" size="pill">
              Analizar
            </Button>
            <Button variant="glass" size="pill">
              Set up your workspace
            </Button>
            <Button variant="glass" size="icon" className="rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
          <p className="pt-2 text-sm text-white/60">Sobrios (dashboard):</p>
          <div className="flex flex-wrap gap-3">
            <Button>Analizar</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Borrar</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Cards (glass) */}
        <Section title="Cards (glass)">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Conversación crítica */}
            <div className="glass space-y-4 rounded-2xl p-6">
              <div>
                <p className="text-lg font-semibold text-white">
                  Conversación #4821
                </p>
                <p className="text-sm text-white/60">Tracking · hace 30 seg</p>
              </div>
              <p className="text-sm text-white/70">
                &ldquo;¿Dónde está mi pedido?&rdquo; → el bot derivó a soporte.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-score-critical text-white">34</Badge>
                <Badge variant="secondary">Frustración alta</Badge>
              </div>
            </div>

            {/* Uploader */}
            <div className="glass space-y-4 rounded-2xl p-6">
              <div>
                <p className="text-lg font-semibold text-white">
                  Subir conversaciones
                </p>
                <p className="text-sm text-white/60">
                  CSV exportado de WATI / Respond.io
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file" className="text-white/80">
                  Archivo
                </Label>
                <Input
                  id="file"
                  type="file"
                  className="border-white/15 bg-white/5"
                />
              </div>
              <Button variant="glow" size="pill" className="w-full">
                Analizar lote
              </Button>
            </div>

            {/* Compliance (referencia) */}
            <div className="glass rounded-2xl p-6">
              <div className="mb-10 flex items-center gap-2 text-sm text-white/70">
                <Users className="h-4 w-4" /> 4
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-white">
                  Compliance
                </span>
                <span className="text-sm text-white/60">12 Doc</span>
              </div>
            </div>

            {/* Score (glass verde) */}
            <div className="glass-green rounded-2xl p-6">
              <p className="text-sm text-white/70">Score del agente</p>
              <p className="mt-2 text-4xl font-bold text-white">87%</p>
              <p className="mt-1 text-xs text-white/60">
                Corporate · Jan 01 – Mar 31
              </p>
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="glass border-white/20 text-white">Glass</Badge>
          </div>
        </Section>
      </div>
    </main>
  );
}
