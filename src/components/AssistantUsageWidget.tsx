"use client";

import { useRef, useState } from "react";
import { setAssistantCredit } from "@/app/actions/chat";

export function AssistantUsageWidget({
  creditedUsd,
  spentUsd,
}: {
  creditedUsd: number;
  spentUsd: number | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = spentUsd !== null ? Math.max(creditedUsd - spentUsd, 0) : null;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-xs">
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
          className="flex items-center gap-1.5"
        >
          <span className="text-neutral-400">$</span>
          <input
            name="credited_usd"
            type="number"
            step="0.01"
            min="0"
            defaultValue={creditedUsd}
            autoFocus
            className="w-14 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1.5 py-0.5 text-xs outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            className="rounded bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-1.5 py-0.5 text-[10px] font-medium"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2 text-neutral-400">
          <span className="truncate">
            {remaining !== null ? (
              <>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  ${remaining.toFixed(2)}
                </span>{" "}
                left of ${creditedUsd.toFixed(2)}
              </>
            ) : (
              "Claude usage: not configured"
            )}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Edit
          </button>
        </div>
      )}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
