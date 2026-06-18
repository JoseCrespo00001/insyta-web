"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Radio,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, STUB_USER } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/conversations", label: "Conversaciones", icon: MessageSquare },
  { href: "/improvements", label: "Mejoras", icon: Sparkles },
  { href: "/supervisor", label: "Supervisor", icon: Radio },
] as const;

// Estilo "isla": contenedor flotante redondeado, sin barra de fondo ni borde inferior.
const island =
  "rounded-full border border-border/60 bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60";

export function TopNav() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 md:px-6">
      {/* Isla: logo (chip charcoal fijo → el wordmark blanco se ve en light y dark) */}
      <Link
        href="/dashboard"
        className="flex h-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[hsl(215_100%_5%)] px-3 shadow-sm"
        aria-label="Insyta"
      >
        <Image
          src="/logos/logo_wordmark_white.svg"
          alt="Insyta"
          width={72}
          height={24}
          className="h-6 w-auto"
          unoptimized
          priority
        />
      </Link>

      {/* Isla: navegación */}
      <nav className={cn("flex items-center gap-1 p-1", island)}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/20 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Isla: acciones */}
      <div className={cn("ml-auto flex items-center gap-1 p-1", island)}>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cambiar tema"
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold">
            {getInitials(STUB_USER.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
