import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/ChatPanel";
import type { ChatMessage } from "@/lib/types";

const USER_NAME = "Dheeraj";

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const messages = (data ?? []) as ChatMessage[];
  if (messages.length === 0) notFound();

  return (
    <div className="max-w-3xl mx-auto md:h-full">
      <ChatPanel messages={messages} name={USER_NAME} conversationId={id} />
    </div>
  );
}
