"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { api } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  // Cuando Supabase requiere confirmación por email no hay sesión todavía:
  // pasamos a un estado "revisá tu correo" en vez de navegar al dashboard.
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const canSubmit = name.trim() !== "" && email !== "" && password !== "";

  // Ensure an org+user exist para el usuario recién autenticado.
  async function bootstrapAndGo() {
    try {
      await api.post("/api/v1/auth/bootstrap");
    } catch {
      // Non-fatal: /me surfaces a clear error si algo falta.
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSignup() {
    if (!canSubmit) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Con confirmación de email activada, signUp no devuelve session.
    if (data.session) {
      await bootstrapAndGo();
    } else {
      setSentTo(email);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) toast.error(error.message);
  }

  // Estado post-registro: confirmación pendiente por email.
  if (sentTo) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Revisá tu correo</CardTitle>
          <CardDescription>
            Te enviamos un enlace de confirmación a{" "}
            <span className="font-medium text-foreground">{sentTo}</span>. Hacé
            clic en él para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            ¿No lo ves? Revisá spam o{" "}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="text-primary hover:underline"
            >
              probá con otro email
            </button>
            .
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Volver a iniciar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("google")}
          >
            <GoogleIcon className="h-4 w-4" />
            Registrarse con Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth("github")}
          >
            <GithubIcon className="h-4 w-4" />
            Registrarse con GitHub
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
          <Input
            id="name"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSignup();
            }}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSignup}
          disabled={loading || !canSubmit}
        >
          {loading ? "Creando cuenta…" : "Crear cuenta"}
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
