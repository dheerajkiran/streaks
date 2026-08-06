import { createClient } from "@/lib/supabase/server";
import { getTodayInUserTimeZone } from "@/lib/timezone";
import { FinanceSummary } from "@/components/FinanceSummary";
import { CategoryManager } from "@/components/CategoryManager";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import type { FinanceCategory, TransactionWithCategory } from "@/lib/types";

export default async function FinancePage() {
  const supabase = await createClient();
  const todayStr = await getTodayInUserTimeZone();
  const currentMonth = todayStr.slice(0, 7);

  const [{ data: categoryData }, { data: transactionData }] = await Promise.all([
    supabase.from("finance_categories").select("*").order("name"),
    supabase
      .from("transactions")
      .select("*, finance_categories(id, name)")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const categories = (categoryData ?? []) as FinanceCategory[];
  const transactions = (transactionData ?? []) as TransactionWithCategory[];

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const thisMonth = transactions
    .filter((t) => t.occurred_on.slice(0, 7) === currentMonth)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Finance</h1>
        <FinanceSummary total={total} thisMonth={thisMonth} />
      </div>

      <TransactionForm categories={categories} />
      <CategoryManager categories={categories} />

      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-2">Transactions</h2>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
