import type { Metadata } from "next";

import { UploadView } from "@/app/(dashboard)/projects/[id]/upload/upload-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subir CSV",
};

export default async function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UploadView projectPublicId={id} />;
}
