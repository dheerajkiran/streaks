"use client";

import { useRef, useState } from "react";
import { addTransaction } from "@/app/actions/finance";
import type { FinanceCategory } from "@/lib/types";

function today() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function TransactionForm({ categories }: { categories: FinanceCategory[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const result = await addTransaction(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setError(null);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Amount</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          required
          className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Where</label>
        <input
          name="place"
          placeholder="e.g. Trader Joe's"
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex-1 min-w-[8rem]">
        <label className="block text-xs font-medium text-neutral-500 mb-1">What</label>
        <input
          name="item"
          placeholder="e.g. groceries"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Category</label>
        <select
          name="category_id"
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
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
          defaultValue={today()}
          max={today()}
          required
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium"
      >
        Add
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400 w-full">{error}</p>}
    </form>
  );
}
