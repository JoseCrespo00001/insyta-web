"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-14 flex-row items-center gap-2 border-b px-5">
          <Activity className="h-5 w-5 text-primary" aria-hidden />
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="font-semibold"
          >
            <SheetTitle>Insyta</SheetTitle>
          </Link>
        </SheetHeader>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
