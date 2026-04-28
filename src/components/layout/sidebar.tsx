import Link from "next/link";
import { Activity } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";

export function Sidebar() {
  return (
    <aside
      aria-label="Sidebar"
      className="hidden h-screen w-60 shrink-0 flex-col border-r bg-background md:flex"
    >
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <Activity className="h-5 w-5 text-primary" aria-hidden />
          <span>Insyta</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        v0.1.0 · MVP
      </div>
    </aside>
  );
}
