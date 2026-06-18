"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-score-critical/15">
        <AlertTriangle className="h-7 w-7 text-score-critical" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Algo salió mal</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Ocurrió un error inesperado en esta sección. Probá de nuevo; si
          persiste, recargá la página.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted-foreground">
            Código: {error.digest}
          </p>
        ) : null}
      </div>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
