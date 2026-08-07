"use client";

import { useState } from "react";
import { deleteTransaction, updateTransaction } from "@/app/actions/finance";
import { TransactionSplitFields } from "@/components/TransactionSplitFields";
import type { FinanceCategory, TransactionWithCategory } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function TransactionList({
  transactions,
  categories,
}: {
  transactions: TransactionWithCategory[];
  categories: FinanceCategory[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-neutral-400">No expenses yet. Add your first one above.</p>
    );
  }

  return (
    <ul className="space-y-1">
      {transactions.map((t) => (
        <TransactionRow key={t.id} transaction={t} categories={categories} />
      ))}
    </ul>
  );
}

function TransactionRow({
  transaction: t,
  categories,
}: {
  transaction: TransactionWithCategory;
  categories: FinanceCategory[];
}) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(t.amount));
  const [error, setError] = useState<string | null>(null);

  const hasSplit = t.transaction_splits.length > 0;

  if (editing) {
    const initialSplits = t.transaction_splits.map((s) => ({
      name: s.person_name,
      amount: String(s.amount),
      kind: s.kind,
    }));

    return (
      <li className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-sm">
        <form
          action={async (formData) => {
            const result = await updateTransaction(t.id, formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            setError(null);
            setEditing(false);
          }}
          className="space-y-3"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Amount</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Where</label>
              <input
                name="place"
                defaultValue={t.place ?? ""}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div className="flex-1 min-w-[8rem]">
              <label className="block text-xs font-medium text-neutral-500 mb-1">What</label>
              <input
                name="item"
                defaultValue={t.item ?? ""}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Category</label>
              <select
                name="category_id"
                defaultValue={t.category_id ?? ""}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Date</label>
              <input
                name="occurred_on"
                type="date"
                defaultValue={t.occurred_on}
                required
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          <TransactionSplitFields amount={amount} initialSplits={initialSplits} />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setAmount(String(t.amount));
                setError(null);
                setEditing(false);
              }}
              className="text-xs text-neutral-400"
            >
              Cancel
            </button>
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm">
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
        {hasSplit && (
          <span className="shrink-0 truncate text-[10px] text-neutral-400">
            your share {currency.format(t.my_share ?? t.amount)}
            {t.transaction_splits.some((s) => s.kind === "split") && (
              <>
                {" "}
                · split with{" "}
                {t.transaction_splits
                  .filter((s) => s.kind === "split")
                  .map((s) => s.person_name)
                  .join(", ")}
              </>
            )}
            {t.transaction_splits.some((s) => s.kind === "gift") && (
              <>
                {" "}
                · gifted to{" "}
                {t.transaction_splits
                  .filter((s) => s.kind === "gift")
                  .map((s) => s.person_name)
                  .join(", ")}
              </>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-semibold tabular-nums">{currency.format(t.amount)}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Edit
        </button>
        <form action={deleteTransaction.bind(null, t.id)}>
          <button type="submit" className="text-xs text-neutral-400 hover:text-red-500">
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
