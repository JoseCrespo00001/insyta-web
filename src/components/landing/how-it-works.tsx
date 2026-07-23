"use client";

import {
  Activity,
  BadgeCheck,
  Gauge,
  Plug,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Reveal } from "@/components/landing/reveal";
import RadialOrbitalTimeline, {
  type TimelineItem,
} from "@/components/ui/radial-orbital-timeline";

// Loop de Insyta como timeline orbital (detectar → diagnosticar → mejorar → verificar).
const TIMELINE: TimelineItem[] = [
  {
    id: 1,
    title: "Conectar",
    date: "En minutos",
    category: "Conexión",
    icon: Plug,
    status: "completed",
    energy: 100,
    relatedIds: [2, 6],
    content:
      "Conectá WhatsApp, Instagram, WATI o el SDK. Sin tocar tu bot, en minutos.",
  },
  {
    id: 2,
    title: "Evaluar",
    date: "Tiempo real",
    category: "Evaluación",
    icon: Gauge,
    status: "completed",
    energy: 95,
    relatedIds: [1, 3],
    content:
      "Un LLM-as-judge puntúa cada conversación de 0 a 100: resolución, tono, satisfacción y frustración.",
  },
  {
    id: 3,
    title: "Detectar",
    date: "Continuo",
    category: "Monitoreo",
    icon: Activity,
    status: "in-progress",
    energy: 82,
    relatedIds: [2, 4],
    content:
      "Control estadístico de procesos (SPC): detectamos desvíos y avisamos cuando el agente empieza a degradarse.",
  },
  {
    id: 4,
    title: "Diagnosticar",
    date: "Semanal",
    category: "Diagnóstico",
    icon: ScanSearch,
    status: "in-progress",
    energy: 74,
    relatedIds: [3, 5],
    content:
      "Agrupamos las conversaciones malas por tema: alucinaciones, fallos de automatización y fugas de flujo.",
  },
  {
    id: 5,
    title: "Mejorar",
    date: "Semanal",
    category: "Optimización",
    icon: Sparkles,
    status: "pending",
    energy: 66,
    relatedIds: [4, 6],
    content:
      "Proponemos cambios al prompt y al flujo, validados con regresión semántica antes de aplicarlos.",
  },
  {
    id: 6,
    title: "Verificar",
    date: "Cada mejora",
    category: "Verificación",
    icon: BadgeCheck,
    status: "pending",
    energy: 88,
    relatedIds: [5, 1],
    content:
      "Medimos el impacto comparando auditorías antes y después de cada mejora, y cerramos el loop.",
  },
];

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    // bg-background opaco: tapa los blobs del fondo global solo en esta sección
    // para que no se confundan con el isotipo del ciclo.
    <section id="como-funciona" className="bg-background py-24">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-4">
          <Reveal className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-5 text-balance text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Tocá cada etapa del loop para ver el detalle.
            </p>
          </Reveal>

          <RadialOrbitalTimeline timelineData={TIMELINE} />
        </div>
      </div>
    </section>
  );
}
