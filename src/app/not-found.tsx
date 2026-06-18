import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold tracking-tight text-primary">404</p>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Página no encontrada
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          La página que buscás no existe o se movió.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/">Inicio</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Ir al dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
