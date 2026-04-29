import type { Metadata } from "next";

import { ProjectDetailView } from "@/app/(dashboard)/projects/[id]/project-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalle de proyecto",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailView projectPublicId={id} />;
}
