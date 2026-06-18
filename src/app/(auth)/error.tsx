"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-xl">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-score-critical/15">
        <AlertTriangle className="h-6 w-6 text-score-critical" />
      </div>
      <h1 className="text-lg font-semibold tracking-tight">Algo salió mal</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        No pudimos cargar esta pantalla. Probá de nuevo.
      </p>
      <Button className="mt-4 w-full" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
