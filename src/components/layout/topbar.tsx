import type { User } from "@supabase/supabase-js";

import { MobileNav } from "@/components/layout/mobile-nav";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <MobileNav />
      <OrgSwitcher />
      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
