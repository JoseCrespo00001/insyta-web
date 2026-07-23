import type { Metadata } from "next";

import { PerfilView } from "./perfil-view";

export const metadata: Metadata = {
  title: "Perfil",
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  // ?section=extensiones abre directo la sección de API keys (CTA del 402).
  const { section } = await searchParams;
  return <PerfilView initialSection={section} />;
}
