"use client";

import { PRODUCTIVITY_TRACKER_ID, type Tracker } from "@/lib/types";

export function TrackerSelect({
  trackers,
  selectedId,
  year,
  day,
}: {
  trackers: Tracker[];
  selectedId: string;
  year: string;
  day?: string;
}) {
  return (
    <form method="get">
      <input type="hidden" name="year" value={year} />
      {day && <input type="hidden" name="day" value={day} />}
      <select
        name="tracker"
        defaultValue={selectedId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
      >
        <option value={PRODUCTIVITY_TRACKER_ID}>Productivity (all trackers)</option>
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
