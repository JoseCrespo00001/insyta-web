"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  Download,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Radio,
  Settings,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/auth/session";
import { useSessionUser } from "@/lib/auth/use-session";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/utils/supabase/client";
import {
  NOTIFICATIONS,
  UNREAD_COUNT,
  type NotifKind,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const NOTIF_ICON: Record<NotifKind, typeof Bell> = {
  audit: ClipboardList,
  suspicious: AlertTriangle,
  improvement: Sparkles,
  update: Download,
};

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
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const user = useSessionUser();

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex w-full items-center gap-2 px-4 py-3 sm:gap-3 md:px-6">
      {/* Isla: logo (chip charcoal fijo → el wordmark blanco se ve en light y dark) */}
      {/* Logo: oculto en mobile para liberar espacio del header; wordmark en desktop */}
      <Link
        href="/dashboard"
        className="hidden h-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[hsl(215_100%_5%)] px-3 shadow-sm sm:flex"
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
      <nav
        className={cn(
          "flex min-w-0 items-center gap-1 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          island,
        )}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors sm:px-4",
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
      <div
        className={cn("ml-auto flex shrink-0 items-center gap-1 p-1", island)}
      >
        {/* Notificaciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              {UNREAD_COUNT > 0 ? (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificaciones
              {UNREAD_COUNT > 0 ? (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium">
                  {UNREAD_COUNT} nuevas
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => {
              const Icon = NOTIF_ICON[n.kind];
              return (
                <DropdownMenuItem
                  key={n.id}
                  className="flex items-start gap-3 py-2.5"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      {n.title}
                      {!n.read ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">{n.detail}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDateTime(n.at)}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tema */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
          aria-label="Cambiar tema"
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </button>

        {/* Avatar → menú de perfil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Perfil"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Solo mobile: tema + notificaciones (en desktop van sueltos en el header) */}
            <DropdownMenuItem
              className="sm:hidden"
              onSelect={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
              Cambiar tema
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="sm:hidden">
                <Bell className="h-4 w-4" />
                Notificaciones
                {UNREAD_COUNT > 0 ? (
                  <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium">
                    {UNREAD_COUNT}
                  </span>
                ) : null}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-72">
                {NOTIFICATIONS.map((n) => {
                  const Icon = NOTIF_ICON[n.kind];
                  return (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex items-start gap-3 py-2.5"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                          {n.title}
                          {!n.read ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {n.detail}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDateTime(n.at)}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem asChild>
              <Link href="/perfil">
                <User className="h-4 w-4" />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/perfil">
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
