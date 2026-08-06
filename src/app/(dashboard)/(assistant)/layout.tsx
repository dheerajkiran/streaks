import { createClient } from "@/lib/supabase/server";
import { ChatSidebar } from "@/components/ChatSidebar";
import type { ChatConversation } from "@/lib/types";

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  const conversations = (data ?? []) as ChatConversation[];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
      <ChatSidebar conversations={conversations} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
