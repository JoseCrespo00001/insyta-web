"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "default" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
};

export function CopyButton({
  value,
  label = "Copiar",
  className,
  size = "sm",
  variant = "outline",
}: Props) {
  const [copied, setCopied] = React.useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copiado al portapapeles");
      window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("[DEBUG] copy failed", err);
      toast.error("No pudimos copiar. Selecciona y copia manualmente.");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn("gap-1.5", className)}
      aria-label={`Copiar ${label}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}
