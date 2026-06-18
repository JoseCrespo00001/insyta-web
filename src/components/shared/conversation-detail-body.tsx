import { ChatTranscript } from "@/components/shared/chat-transcript";
import { ConversationReport } from "@/components/shared/conversation-report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Conversation } from "@/lib/projects/types";

/** Contenido del panel de una conversación: reporte de evaluación + chat. */
export function ConversationDetailBody({
  conversation,
}: {
  conversation: Conversation;
}) {
  return (
    <Tabs defaultValue="reporte" className="mt-4 flex min-h-0 flex-1 flex-col">
      <TabsList>
        <TabsTrigger value="reporte">Reporte</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="reporte" className="flex-1 overflow-y-auto pr-1">
        <ConversationReport conversation={conversation} />
      </TabsContent>
      <TabsContent value="chat" className="flex-1 overflow-y-auto pr-1">
        <ChatTranscript conversation={conversation} />
      </TabsContent>
    </Tabs>
  );
}
