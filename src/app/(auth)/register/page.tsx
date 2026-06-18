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
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Creá tu cuenta</CardTitle>
        <CardDescription>
          Empezá a mejorar tus agentes con Insyta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth */}
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <GoogleIcon className="h-4 w-4" />
              Registrarse con Google
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <GithubIcon className="h-4 w-4" />
              Registrarse con GitHub
            </Link>
          </Button>
        </div>

        {/* Divisor */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />o
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Form */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" placeholder="Tu nombre" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <Button asChild className="w-full">
          <Link href="/dashboard">Crear cuenta</Link>
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Al registrarte aceptás los términos y la política de privacidad.
        </p>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
