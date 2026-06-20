import type { Metadata } from "next";

import { FlowDetailView } from "./flow-detail-view";

export const metadata: Metadata = {
  title: "Flujo",
};

export default async function FlowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FlowDetailView flowId={id} />;
}
