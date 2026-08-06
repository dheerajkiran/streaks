"use client";

import { deleteTransaction } from "@/app/actions/finance";
import type { TransactionWithCategory } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function TransactionList({
  transactions,
}: {
  transactions: TransactionWithCategory[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-neutral-400">No expenses yet. Add your first one above.</p>
    );
  }

  return (
    <ul className="space-y-1">
      {transactions.map((t) => (
        <li
          key={t.id}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            <span className="text-neutral-400 tabular-nums shrink-0">
              {formatDate(t.occurred_on)}
            </span>
            <span className="font-medium truncate min-w-0">
              {t.item || t.place || "Untitled"}
            </span>
            {t.place && t.item && (
              <span className="text-neutral-400 truncate min-w-0">{t.place}</span>
            )}
            {t.finance_categories && (
              <span className="shrink-0 rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
                {t.finance_categories.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-semibold tabular-nums">{currency.format(t.amount)}</span>
            <form action={deleteTransaction.bind(null, t.id)}>
              <button type="submit" className="text-xs text-neutral-400 hover:text-red-500">
                Delete
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
