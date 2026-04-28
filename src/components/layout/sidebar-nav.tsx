"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  MessagesSquare,
  Sparkles,
  Settings,
  Bell,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/conversations", label: "Conversaciones", icon: MessagesSquare },
  { href: "/improvements", label: "Mejoras", icon: Sparkles, badge: "AI" },
  { href: "/alerts", label: "Alertas", icon: Bell },
  { href: "/settings", label: "Configuracion", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacion principal"
      className="flex flex-col gap-1 px-3 py-4"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
