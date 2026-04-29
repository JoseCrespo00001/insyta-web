import type { Metadata } from "next";

import { ConversationDetailView } from "@/app/(dashboard)/conversations/[id]/conversation-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conversacion",
};

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConversationDetailView conversationPublicId={id} />;
}
