"use client";

import { useRef, useState } from "react";
import { setAssistantCredit } from "@/app/actions/chat";

export function AssistantUsageWidget({
  creditedUsd,
  spentUsd,
}: {
  creditedUsd: number;
  spentUsd: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = Math.max(creditedUsd - spentUsd, 0);

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-500">Claude usage</h2>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {editing ? (
        <form
          ref={formRef}
          action={async (formData) => {
            const result = await setAssistantCredit(formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            setError(null);
            setEditing(false);
          }}
          className="flex items-center gap-2"
        >
          <span className="text-sm text-neutral-400">$</span>
          <input
            name="credited_usd"
            type="number"
            step="0.01"
            min="0"
            defaultValue={creditedUsd}
            autoFocus
            className="w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-2 py-1 text-xs font-medium"
          >
            Save
          </button>
        </form>
      ) : (
        <>
          <p className="text-2xl font-semibold tabular-nums">${remaining.toFixed(2)}</p>
          <p className="text-xs text-neutral-400">
            remaining of ${creditedUsd.toFixed(2)} topped up · ~${spentUsd.toFixed(4)} spent
          </p>
        </>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <p className="text-[10px] text-neutral-400">Estimated from token usage - not official billing data.</p>
    </div>
  );
}
