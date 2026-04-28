"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/auth/schemas";

/* UX Review — SignupForm
 * User: Founder/operador que descubrio Insyta y quiere probar el producto.
 * Goal: Crear cuenta + organizacion en <30 segundos para llegar al wizard.
 * Flow: /signup -> form (email + pwd + org_name) -> submit -> Supabase signUp -> magic link OR direct session -> /onboarding.
 * States: idle | submitting | success (email-confirmation pending) | error (email taken, weak pwd).
 * Edge cases: email ya existe -> mensaje claro + link a /login. Magic link no llega -> link "reenviar" (Wave 3). Doble click -> button disabled.
 * Friction points: org_name explicado con FormDescription para que no parezca arbitrario.
 * Benchmark: Vercel/Supabase signup pattern (single page, no multi-step).
 */
export function SignupForm() {
  const router = useRouter();
  const [emailSent, setEmailSent] = React.useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", org_name: "", full_name: "" },
  });

  const onSubmit = async (values: SignupInput) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          org_name: values.org_name,
          full_name: values.full_name ?? "",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      console.error("[DEBUG] signup failed", error);
      const msg = error.message.includes("already registered")
        ? "Ese email ya tiene una cuenta. Inicia sesion."
        : error.message.includes("Password")
          ? "La contrasena es muy debil. Usa al menos 8 caracteres."
          : "No pudimos crear tu cuenta. Intenta de nuevo.";
      form.setError("root", { message: msg });
      toast.error(msg);
      return;
    }

    if (data.session) {
      toast.success("Cuenta creada");
      router.replace("/onboarding");
      router.refresh();
      return;
    }

    setEmailSent(values.email);
    toast.success("Te enviamos un email para confirmar tu cuenta.");
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="mb-2 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl">Revisa tu email</CardTitle>
          <CardDescription>
            Te enviamos un link de confirmacion a{" "}
            <span className="font-medium text-foreground">{emailSent}</span>.
            Hace clic para activar tu cuenta y continuar al onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-xs text-muted-foreground">
          No te llego? Revisa spam o vuelve a intentar en unos minutos.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => setEmailSent(null)}>
            Usar otro email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Conecta tu primer agente en menos de 5 minutos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder="Jane Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de trabajo</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="tu@empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrasena</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Minimo 8 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="org_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de tu organizacion</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme S.A." {...field} />
                  </FormControl>
                  <FormDescription>
                    Lo usamos para crear tu workspace. Podes cambiarlo despues.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Ya tenes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Iniciar sesion
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
