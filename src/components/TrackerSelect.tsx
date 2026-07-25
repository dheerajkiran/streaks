"use client";

import type { Tracker } from "@/lib/types";

export function TrackerSelect({
  trackers,
  selectedId,
  month,
}: {
  trackers: Tracker[];
  selectedId: string;
  month: string;
}) {
  return (
    <form method="get">
      <input type="hidden" name="month" value={month} />
      <select
        name="tracker"
        defaultValue={selectedId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
      >
        {trackers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
            {t.is_archived ? " (archived)" : ""}
          </option>
        ))}
      </select>
    </form>
  );
}
