import Link from "next/link";
import { Activity } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          aria-label="Ir a inicio"
        >
          <Activity className="h-5 w-5 text-primary" aria-hidden />
          <span>Insyta</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
