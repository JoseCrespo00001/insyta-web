"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

function initials(email: string | undefined): string {
  if (!email) return "??";
  const local = email.split("@")[0];
  return local.slice(0, 2).toUpperCase();
}

export function UserMenu({ user }: { user: User | null }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Sesion cerrada");
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("[DEBUG] signOut failed", err);
      toast.error("No pudimos cerrar tu sesion. Intenta de nuevo.");
      setSigningOut(false);
    }
  };

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="/login">Iniciar sesion</a>
      </Button>
    );
  }

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ?? undefined;
  const name =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          aria-label="Abrir menu de usuario"
        >
          <Avatar className="h-9 w-9">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback>{initials(user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Mi cuenta
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Configuracion
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void handleSignOut();
          }}
          disabled={signingOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {signingOut ? "Cerrando..." : "Cerrar sesion"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
