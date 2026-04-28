import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <Activity className="h-5 w-5 text-primary" aria-hidden />
          <span>Insyta</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
