"use client";

import { deleteEntry } from "@/app/actions/entries";
import type { Entry, Tracker } from "@/lib/types";

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function EntryLog({ tracker, entries }: { tracker: Tracker; entries: Entry[] }) {
  const unit = tracker.type === "duration" ? "min" : tracker.unit ?? "";

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        No entries logged for {tracker.name} yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {entries.map((entry) => {
        const loggedAt = new Date(entry.created_at);
        return (
          <li
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-neutral-400 tabular-nums">
                {loggedAt.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span className="font-medium">
                {entry.start_time && entry.end_time
                  ? `${formatTime(entry.start_time)}–${formatTime(entry.end_time)} (${entry.value} ${unit})`
                  : `${entry.value} ${unit}`}
              </span>
              {entry.note && <span className="text-neutral-400">{entry.note}</span>}
            </div>
            <form action={deleteEntry.bind(null, entry.id)}>
              <button
                type="submit"
                className="text-xs text-neutral-400 hover:text-red-500"
              >
                Delete
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
