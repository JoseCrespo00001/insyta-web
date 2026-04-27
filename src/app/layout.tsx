import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Insyta — Mejora continua para agentes LLM",
    template: "%s · Insyta",
  },
  description:
    "Conecta tu agente, ve donde falla, y deja que nuestra IA lo mejore automaticamente.",
  metadataBase: new URL("https://insyta.io"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
