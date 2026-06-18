import type { Metadata } from "next";

import { ImprovementsView } from "./improvements-view";

export const metadata: Metadata = {
  title: "Mejoras",
};

export default function ImprovementsPage() {
  return <ImprovementsView />;
}
