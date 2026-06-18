import type { Metadata } from "next";

import { PerfilView } from "./perfil-view";

export const metadata: Metadata = {
  title: "Perfil",
};

export default function PerfilPage() {
  return <PerfilView />;
}
