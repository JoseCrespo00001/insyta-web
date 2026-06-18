import type { Metadata } from "next";

import { ProjectDetailView } from "./project-detail-view";

export const metadata: Metadata = {
  title: "Proyecto",
};

const TABS = ["resumen", "flujos", "conversaciones", "auditorias"];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const initialTab = tab && TABS.includes(tab) ? tab : "resumen";
  return <ProjectDetailView projectId={id} initialTab={initialTab} />;
}
