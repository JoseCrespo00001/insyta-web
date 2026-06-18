import Link from "next/link";
import { FileUp, MessageSquare, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATS = [
  { label: "Conversaciones evaluadas", value: "—", icon: MessageSquare },
  { label: "Score promedio", value: "—", icon: TrendingUp },
  { label: "Sugerencias abiertas", value: "—", icon: FileUp },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tus agentes y conversaciones.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects">
            <FileUp className="h-4 w-4" />
            Subir conversaciones
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado inicial */}
      <Card>
        <CardHeader>
          <CardTitle>Todavía no hay datos</CardTitle>
          <CardDescription>
            Creá un proyecto y subí un CSV de conversaciones para ver el score y
            las sugerencias de mejora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/projects">Ir a Proyectos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
