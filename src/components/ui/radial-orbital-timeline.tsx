"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

// Geometría del isotipo (logo_verde.svg): 6 puntas a 60°, la primera a -75.5°,
// la punta a ~248.67 del centro sobre un viewBox de 598 → ratio de escala.
const TIP_OFFSET = -75.5;
const SVG_RATIO = 598 / 248.67;

export default function RadialOrbitalTimeline({
  timelineData,
}: {
  timelineData: TimelineItem[];
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [radius, setRadius] = useState(200);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  // Render del contenido orbital solo en cliente (evita mismatch de hidratación).
  useEffect(() => setMounted(true), []);

  // Radio responsive: lo más grande que entre en el contenedor.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const m = Math.min(el.clientWidth, el.clientHeight);
      setRadius(Math.max(130, Math.min(215, m / 2 - 52)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((p) => Number(((p + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const reset = () => {
    setActiveId(null);
    setAutoRotate(true);
  };

  // Al clickear: NO recentra. Se congela en su lugar y muestra la carta.
  const toggle = (id: number) => {
    if (activeId === id) {
      reset();
      return;
    }
    setActiveId(id);
    setAutoRotate(false);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      reset();
    }
  };

  const nodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + TIP_OFFSET + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian),
      zIndex: Math.round(100 + 50 * Math.cos(radian)),
      opacity: Math.max(
        0.45,
        Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2)),
      ),
    };
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative flex h-[32rem] w-full items-center justify-center md:h-[42rem]"
    >
      {mounted ? (
        <div
          ref={orbitRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          {/* Isotipo de Insyta = esqueleto del ciclo. Gira en sync con los nodos. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo_verde.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 select-none opacity-90"
            style={{
              width: radius * SVG_RATIO,
              transform: `translate(-50%, -50%) rotate(${rotationAngle}deg)`,
            }}
          />

          {timelineData.map((item, index) => {
            const pos = nodePosition(index, timelineData.length);
            const isActive = activeId === item.id;
            const Icon = item.icon;
            const below = pos.y < 0; // nodo arriba → carta abajo; abajo → arriba

            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 cursor-pointer"
                style={{
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: isActive ? 300 : pos.zIndex,
                  // Todos los chips del mismo color (sin atenuar por profundidad).
                  opacity: 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(item.id);
                }}
              >
                {/* Chip botón: fondo + sombra + ring para que se note clickeable */}
                <div
                  className={cn(
                    "relative flex size-12 items-center justify-center rounded-full ring-1 transition-all duration-300",
                    isActive
                      ? "scale-125 bg-primary text-primary-foreground shadow-xl shadow-primary/50 ring-primary"
                      : "bg-background/90 text-foreground shadow-md ring-border/70 backdrop-blur-sm hover:scale-110 hover:bg-background hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary",
                  )}
                >
                  <Icon size={18} />
                </div>

                {isActive && (
                  <div
                    className={cn(
                      "absolute left-1/2 z-[300] w-60 -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-4 text-center shadow-xl backdrop-blur",
                      below ? "top-[4.25rem]" : "bottom-[4.25rem]",
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                      {item.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
