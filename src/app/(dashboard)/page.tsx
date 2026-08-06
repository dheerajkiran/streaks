import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/ChatPanel";
import type { ChatMessage } from "@/lib/types";

export default async function AssistantPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });

  const messages = (data ?? []) as ChatMessage[];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-lg font-semibold">Assistant</h1>
      <ChatPanel messages={messages} />
    </div>
  );
}
