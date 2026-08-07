"use client";

import { useState } from "react";

export type SplitRow = { name: string; amount: string };

export function TransactionSplitFields({
  amount,
  initialSplits,
}: {
  amount: string;
  initialSplits: SplitRow[];
}) {
  const [splitting, setSplitting] = useState(initialSplits.length > 0);
  const [splits, setSplits] = useState<SplitRow[]>(
    initialSplits.length > 0 ? initialSplits : [{ name: "", amount: "" }]
  );

  const total = Number(amount) || 0;
  const othersTotal = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const myShare = total - othersTotal;

  function updateSplit(index: number, patch: Partial<SplitRow>) {
    setSplits((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setSplitting((s) => !s)}
        className="text-xs text-neutral-400 underline hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        {splitting ? "Remove split" : "Split with others"}
      </button>

      {splitting && (
        <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
          {splits.map((row, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                name="split_person"
                placeholder="Name"
                value={row.name}
                onChange={(e) => updateSplit(i, { name: e.target.value })}
                className="flex-1 min-w-[6rem] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
              <input
                name="split_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={row.amount}
                onChange={(e) => updateSplit(i, { amount: e.target.value })}
                className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
              {splits.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSplits((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-neutral-400 hover:text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSplits((prev) => [...prev, { name: "", amount: "" }])}
            className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            + Add person
          </button>

          <p className={`text-xs ${myShare < 0 ? "text-red-500" : "text-neutral-400"}`}>
            Your share: ${myShare.toFixed(2)}
            {myShare < 0 && " - splits add up to more than the total"}
          </p>
        </div>
      )}
    </div>
  );
}
