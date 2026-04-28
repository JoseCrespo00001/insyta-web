"use client";

import * as React from "react";
import { Building2, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Placeholder org switcher. Wave 3 wires this to /me + org list endpoint.
const PLACEHOLDER_ORGS = [
  { id: "org_demo", name: "Mi organizacion", current: true },
];

export function OrgSwitcher() {
  const current =
    PLACEHOLDER_ORGS.find((o) => o.current) ?? PLACEHOLDER_ORGS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 max-w-[220px] justify-between gap-2"
          aria-label="Cambiar organizacion"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{current.name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Organizaciones
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PLACEHOLDER_ORGS.map((org) => (
          <DropdownMenuItem key={org.id} className="gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">{org.name}</span>
            {org.current ? <Check className="h-4 w-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          + Crear organizacion (proximamente)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
