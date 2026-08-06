"use client";

import { useRef, useState } from "react";
import { createFinanceCategory, deleteFinanceCategory } from "@/app/actions/finance";
import type { FinanceCategory } from "@/lib/types";

export function CategoryManager({ categories }: { categories: FinanceCategory[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
      <h2 className="text-sm font-medium text-neutral-500">Categories</h2>

      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-neutral-400">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs"
            >
              {c.name}
              <form action={deleteFinanceCategory.bind(null, c.id)}>
                <button type="submit" className="text-neutral-400 hover:text-red-500">
                  ×
                </button>
              </form>
            </span>
          ))
        )}
      </div>

      <form
        ref={formRef}
        action={async (formData) => {
          const result = await createFinanceCategory(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setError(null);
          formRef.current?.reset();
        }}
        className="flex gap-2"
      >
        <input
          name="name"
          placeholder="New category (e.g. Groceries)"
          required
          className="flex-1 min-w-0 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium shrink-0"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
