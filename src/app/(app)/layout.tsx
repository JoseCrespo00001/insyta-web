import { BootstrapGate } from "@/components/layout/bootstrap-gate";
import { TopNav } from "@/components/layout/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BootstrapGate />
      <TopNav />
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
