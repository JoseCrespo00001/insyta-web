import type { Metadata } from "next";
import Link from "next/link";
import { GithubIcon } from "@/components/shared/github-icon";
import { GoogleIcon } from "@/components/shared/google-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Iniciá sesión</CardTitle>
        <CardDescription>Entrá a tu cuenta de Insyta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth */}
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <GoogleIcon className="h-4 w-4" />
              Continuar con Google
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <GithubIcon className="h-4 w-4" />
              Continuar con GitHub
            </Link>
          </Button>
        </div>

        {/* Divisor */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />o
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Email + contraseña */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@email.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>

        <Button asChild className="w-full">
          <Link href="/dashboard">Iniciar sesión</Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Crear cuenta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
