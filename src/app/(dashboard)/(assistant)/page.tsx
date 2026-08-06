import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/ChatPanel";
import type { ChatMessage } from "@/lib/types";

const USER_NAME = "Dheeraj";

export default async function AssistantPage() {
  const supabase = await createClient();
  const { data: messageData } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });

  const messages = (messageData ?? []) as ChatMessage[];

  return (
    <div className="max-w-3xl mx-auto">
      <ChatPanel messages={messages} name={USER_NAME} />
    </div>
  );
}
