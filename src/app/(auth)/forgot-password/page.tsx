import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  title: "Recuperar contraseña",
};

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">¿Olvidaste tu contraseña?</CardTitle>
        <CardDescription>
          Te enviamos un link para crear una nueva.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@email.com" />
        </div>

        <Button className="w-full">Enviar link de recuperación</Button>

        <Button
          asChild
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Volver a iniciar sesión
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
