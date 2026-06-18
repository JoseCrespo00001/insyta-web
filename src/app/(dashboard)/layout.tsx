import { TopNav } from "@/components/layout/top-nav";

// TODO(auth): re-agregar el gate de sesión (redirect a /login) cuando se
// recupere el slice de Supabase auth. Por ahora el dashboard es abierto y usa
// STUB_USER (ver src/lib/auth/session.ts).
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
