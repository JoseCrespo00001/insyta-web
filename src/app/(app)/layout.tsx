import { BootstrapGate } from "@/components/layout/bootstrap-gate";
import { TopNav } from "@/components/layout/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-background">
      <BootstrapGate />
      <TopNav />
      <main className="w-full min-w-0 max-w-full flex-1 overflow-x-hidden px-4 py-6 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
