import { createClient } from "@/lib/supabase/server";
import { ChatSidebar } from "@/components/ChatSidebar";
import { TodayObjectives } from "@/components/TodayObjectives";
import { MonthlySpending } from "@/components/MonthlySpending";
import { WidgetPane } from "@/components/WidgetPane";
import { getTodayInUserTimeZone } from "@/lib/timezone";
import type { ChatConversation, Todo } from "@/lib/types";

type MonthTransaction = {
  amount: number;
  my_share: number | null;
  occurred_on: string;
  finance_categories: { name: string } | null;
};

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const today = await getTodayInUserTimeZone();
  const currentMonth = today.slice(0, 7);

  const [{ data: conversationData }, { data: todoData }, { data: transactionData }] = await Promise.all([
    supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("todos")
      .select("*")
      .eq("due_date", today)
      .eq("is_done", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("amount, my_share, occurred_on, finance_categories(name)")
      .gte("occurred_on", `${currentMonth}-01`),
  ]);

  const conversations = (conversationData ?? []) as ChatConversation[];
  const todayTodos = (todoData ?? []) as Todo[];

  const monthTransactions = (transactionData ?? []) as unknown as MonthTransaction[];

  const mySpend = (t: MonthTransaction) => Number(t.my_share ?? t.amount);
  const monthlyTotal = monthTransactions.reduce((sum, t) => sum + mySpend(t), 0);

  const categorySpend = new Map<string, number>();
  for (const t of monthTransactions) {
    const key = t.finance_categories?.name ?? "Uncategorized";
    categorySpend.set(key, (categorySpend.get(key) ?? 0) + mySpend(t));
  }
  const categoryBreakdown = Array.from(categorySpend.entries())
    .map(([name, amount]) => ({ name, amount }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:h-full">
      <ChatSidebar conversations={conversations} />
      <div className="flex-1 min-w-0 md:h-full">{children}</div>
      <div className="w-full md:w-64 md:shrink-0">
        <WidgetPane
          widgets={[
            { key: "today", node: <TodayObjectives todos={todayTodos} /> },
            { key: "spending", node: <MonthlySpending total={monthlyTotal} breakdown={categoryBreakdown} /> },
          ]}
        />
      </div>
    </div>
  );
}
