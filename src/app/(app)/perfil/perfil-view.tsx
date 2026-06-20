"use client";

import * as React from "react";
import { Bell, CreditCard, Plug, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/auth/session";
import { useSessionUser } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "perfil", label: "Perfil", icon: User },
  { key: "extensiones", label: "Extensiones", icon: Plug },
  { key: "notificaciones", label: "Notificaciones", icon: Bell },
  { key: "facturacion", label: "Facturación", icon: CreditCard },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export function PerfilView() {
  const [section, setSection] = React.useState<SectionKey>("perfil");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Gestioná tu cuenta, integraciones y preferencias.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Menú (1/3) */}
        <nav className="lg:col-span-1">
          <div className="space-y-1">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  section === key
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Contenido (3/4) */}
        <div className="lg:col-span-3">
          {section === "perfil" ? <PerfilSection /> : null}
          {section === "extensiones" ? <ExtensionesSection /> : null}
          {section === "notificaciones" ? <NotificacionesSection /> : null}
          {section === "facturacion" ? <FacturacionSection /> : null}
        </div>
      </div>
    </div>
  );
}

function PerfilSection() {
  const user = useSessionUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del usuario</CardTitle>
        <CardDescription>
          Tu información personal y de la cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/15 text-lg font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            Cambiar foto
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input key={`n-${user.name}`} id="name" defaultValue={user.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              key={`e-${user.email}`}
              id="email"
              type="email"
              defaultValue={user.email}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org">Organización</Label>
            <Input
              key={`o-${user.orgName}`}
              id="org"
              defaultValue={user.orgName}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Input
              key={`r-${user.role}`}
              id="role"
              defaultValue={user.role || "owner"}
              disabled
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="pwd">Contraseña</Label>
          <Input id="pwd" type="password" placeholder="••••••••" />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Cambios guardados")}>
            Guardar cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const EXTENSIONS = [
  { name: "WATI", detail: "WhatsApp Business (LATAM)", connected: true },
  { name: "Respond.io", detail: "Multi-canal", connected: false },
  { name: "Manychat", detail: "WhatsApp + Instagram", connected: false },
  { name: "Slack", detail: "Alertas en tu canal", connected: false },
];

function ExtensionesSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Extensiones</h2>
        <p className="text-sm text-muted-foreground">
          Conectá tus plataformas para ingestar conversaciones.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {EXTENSIONS.map((e) => (
          <Card key={e.name}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{e.name}</p>
                <p className="text-sm text-muted-foreground">{e.detail}</p>
              </div>
              <Button variant={e.connected ? "outline" : "default"} size="sm">
                {e.connected ? "Conectado" : "Conectar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const NOTIF_PREFS = [
  { key: "audit", label: "Auditoría completada", defaultOn: true },
  { key: "suspicious", label: "Conversación sospechosa", defaultOn: true },
  {
    key: "improvement",
    label: "Nuevas sugerencias de mejora",
    defaultOn: true,
  },
  { key: "update", label: "Novedades del producto", defaultOn: false },
];

function NotificacionesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
        <CardDescription>Elegí qué querés recibir.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {NOTIF_PREFS.map((p) => (
          <label
            key={p.key}
            className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
          >
            <span>{p.label}</span>
            <Checkbox defaultChecked={p.defaultOn} />
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

function FacturacionSection() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Créditos</CardTitle>
          <CardDescription>
            Pay-as-you-use · 1 crédito = 1 conversación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">7.474</p>
          <p className="text-sm text-muted-foreground">créditos disponibles</p>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { name: "Mini", credits: "2.000", price: "$50" },
          { name: "Pro", credits: "7.500", price: "$150" },
          { name: "Scale", credits: "30.000", price: "$500" },
        ].map((pack) => (
          <Card key={pack.name}>
            <CardContent className="space-y-2 p-4 text-center">
              <p className="font-medium">{pack.name}</p>
              <p className="text-2xl font-bold">{pack.price}</p>
              <p className="text-sm text-muted-foreground">
                {pack.credits} créditos
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Comprar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
