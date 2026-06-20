"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Link2, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const STATUS_LABEL: Record<TimelineItem["status"], string> = {
  completed: "EN VIVO",
  "in-progress": "EN CURSO",
  pending: "PROGRAMADO",
};

const STATUS_STYLE: Record<TimelineItem["status"], string> = {
  completed: "border-primary/40 bg-primary/15 text-primary",
  "in-progress": "border-score-risk/40 bg-score-risk/15 text-score-risk",
  pending: "border-border bg-muted text-muted-foreground",
};

// Geometría del isotipo (isotipo-cycle.svg): 6 puntas a 60°, la primera a -75.5°.
// La punta está a ~248.67 del centro sobre un viewBox de 598 → ratio de escala.
const TIP_OFFSET = -75.5;
const SVG_RATIO = 598 / 248.67;

export default function RadialOrbitalTimeline({
  timelineData,
}: {
  timelineData: TimelineItem[];
}) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {},
  );
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [radius, setRadius] = useState(200);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  // Evita mismatch de hidratación: el contenido orbital (posiciones dinámicas)
  // se renderiza solo en cliente.
  useEffect(() => setMounted(true), []);

  // Radio responsive según el ancho disponible.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setRadius(Math.max(110, Math.min(200, w / 2 - 80)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const next: Record<number, boolean> = {};
      Object.keys(prev).forEach((k) => (next[Number(k)] = false));
      next[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const related = timelineData.find((i) => i.id === id)?.relatedIds ?? [];
        const pulse: Record<number, boolean> = {};
        related.forEach((r) => (pulse[r] = true));
        setPulseEffect(pulse);
        const idx = timelineData.findIndex((i) => i.id === id);
        // Lleva el nodo arriba (-90°) teniendo en cuenta el offset del isotipo.
        setRotationAngle(-90 - (idx / timelineData.length) * 360 - TIP_OFFSET);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return next;
    });
  };

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const nodePosition = (index: number, total: number) => {
    // TIP_OFFSET alinea el nodo 0 con la primera punta del isotipo (-75.5°).
    const angle = ((index / total) * 360 + TIP_OFFSET + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)),
    );
    return { x, y, zIndex, opacity };
  };

  const isRelatedToActive = (id: number) => {
    if (!activeNodeId) return false;
    return (
      timelineData
        .find((i) => i.id === activeNodeId)
        ?.relatedIds.includes(id) ?? false
    );
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative flex h-[34rem] w-full items-center justify-center overflow-hidden md:h-[40rem]"
    >
      {mounted ? (
        <div
          ref={orbitRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          {/* Isotipo de Insyta = esqueleto del ciclo. Gira en sync con los nodos
              (los nodos caen sobre las 6 puntas del molecule). */}
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
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 cursor-pointer"
                style={{
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: isExpanded ? 200 : pos.zIndex,
                  opacity: isExpanded ? 1 : pos.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={cn(
                    "relative flex size-11 items-center justify-center rounded-full transition-all duration-300",
                    isExpanded
                      ? "scale-150 bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-2 ring-primary"
                      : isRelated
                        ? "scale-110 bg-primary/30 text-foreground ring-2 ring-primary"
                        : "text-primary-foreground",
                    isPulsing && "animate-pulse",
                  )}
                >
                  <Icon size={18} />
                </div>

                <div
                  className={cn(
                    "absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300",
                    isExpanded
                      ? "scale-110 text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute left-1/2 top-20 w-64 -translate-x-1/2 overflow-visible border-border bg-card/95 shadow-xl backdrop-blur-lg">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-border" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 text-[10px]",
                            STATUS_STYLE[item.status],
                          )}
                        >
                          {STATUS_LABEL[item.status]}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="mt-2 text-sm">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      <p>{item.content}</p>

                      <div className="mt-4 border-t border-border pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center text-foreground">
                            <Zap size={10} className="mr-1" />
                            Cobertura
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {item.energy}%
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(160_60%_45%)]"
                            style={{ width: `${item.energy}%` }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <div className="mb-2 flex items-center">
                            <Link2
                              size={10}
                              className="mr-1 text-muted-foreground"
                            />
                            <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Etapas conectadas
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relId) => {
                              const rel = timelineData.find(
                                (i) => i.id === relId,
                              );
                              return (
                                <Button
                                  key={relId}
                                  variant="outline"
                                  size="sm"
                                  className="flex h-6 items-center px-2 py-0 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relId);
                                  }}
                                >
                                  {rel?.title}
                                  <ArrowRight size={8} className="ml-1" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
