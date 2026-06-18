"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Subtle scroll-reveal wrapper for landing sections.
 * Fades + lifts content into view once. Respects "marcado pero sobrio":
 * short distance, short duration, no bounce.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
