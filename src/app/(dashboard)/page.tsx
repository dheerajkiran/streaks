import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/ChatPanel";
import type { ChatMessage } from "@/lib/types";

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.split(/[._+]/)[0] || local;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default async function AssistantPage() {
  const supabase = await createClient();
  const [{ data: userData }, { data: messageData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("chat_messages").select("*").order("created_at", { ascending: true }),
  ]);

  const messages = (messageData ?? []) as ChatMessage[];
  const name = nameFromEmail(userData.user?.email ?? "");

  return (
    <div className="max-w-3xl mx-auto">
      <ChatPanel messages={messages} name={name} />
    </div>
  );
}
