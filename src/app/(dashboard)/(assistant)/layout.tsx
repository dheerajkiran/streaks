import { createClient } from "@/lib/supabase/server";
import { ChatSidebar } from "@/components/ChatSidebar";
import { TodayObjectives } from "@/components/TodayObjectives";
import { AssistantUsageWidget } from "@/components/AssistantUsageWidget";
import { getTodayInUserTimeZone } from "@/lib/timezone";
import { fetchAssistantSpendUsd } from "@/lib/anthropicCost";
import type { AssistantUsage, ChatConversation, Todo } from "@/lib/types";

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const today = await getTodayInUserTimeZone();

  const [{ data: conversationData }, { data: todoData }, { data: usageData }] = await Promise.all([
    supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("todos")
      .select("*")
      .eq("due_date", today)
      .eq("is_done", false)
      .order("created_at", { ascending: true }),
    supabase.from("assistant_usage").select("*").maybeSingle(),
  ]);

  const conversations = (conversationData ?? []) as ChatConversation[];
  const todayTodos = (todoData ?? []) as Todo[];
  const usage = usageData as AssistantUsage | null;

  const spentUsd = usage ? await fetchAssistantSpendUsd(usage.credited_at) : null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 md:h-full">
      <ChatSidebar conversations={conversations} />
      <div className="flex-1 min-w-0 md:h-full">{children}</div>
      <div className="w-full md:w-64 md:shrink-0 space-y-6">
        <TodayObjectives todos={todayTodos} />
        <AssistantUsageWidget creditedUsd={usage ? Number(usage.credited_usd) : 5} spentUsd={spentUsd} />
      </div>
    </div>
  );
}
