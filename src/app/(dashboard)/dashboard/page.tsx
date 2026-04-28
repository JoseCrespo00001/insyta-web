import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

/* UX Review — DashboardPage
 * User: Cliente que recien firmo y aterrizo en el dashboard.
 * Goal: Entender que ve, donde estan sus proyectos y cual es el siguiente paso.
 * Flow: login -> /dashboard -> ve KPIs vacios + CTAs claros.
 * States: empty (default mientras endpoints no estan listos), loading futuro, error futuro.
 * Edge cases: sin proyectos -> redirige a /onboarding (manejado por API en Wave 3).
 * Friction points: ninguno por ahora — placeholder honesto en lugar de mock data falso.
 * Benchmark: Vercel Dashboard empty state pattern.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido a Insyta
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui veras la salud de tus agentes en tiempo real. Empieza por subir
          una conversacion o conectar un webhook.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Score promedio</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Disponible cuando subas tu primera conversacion.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Conversaciones evaluadas</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Conecta tu agente o sube un CSV para empezar.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Mejoras sugeridas</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Las recomendaciones aparecen tras evaluar 50+ conversaciones.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
