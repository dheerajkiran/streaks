"use client";

import { useMemo, useRef, useState } from "react";
import { createEntry } from "@/app/actions/entries";
import type { Tracker } from "@/lib/types";

function today() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function QuickAddEntry({ trackers }: { trackers: Tracker[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [trackerId, setTrackerId] = useState(trackers[0]?.id ?? "");

  const selected = useMemo(
    () => trackers.find((t) => t.id === trackerId),
    [trackers, trackerId]
  );

  if (trackers.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        No trackers yet. Add one on the Trackers page to start logging.
      </p>
    );
  }

  const unitLabel = selected?.type === "duration" ? "minutes" : selected?.unit || "";

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createEntry(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Tracker
        </label>
        <select
          name="tracker_id"
          value={trackerId}
          onChange={(e) => setTrackerId(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        >
          {trackers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Value {unitLabel && `(${unitLabel})`}
        </label>
        <input
          name="value"
          type="number"
          step="any"
          min="0"
          required
          className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Date
        </label>
        <input
          name="entry_date"
          type="date"
          defaultValue={today()}
          max={today()}
          required
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex-1 min-w-[10rem]">
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Note (optional)
        </label>
        <input
          name="note"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium"
      >
        Log it
      </button>
    </form>
  );
}
