"use client";

import { useState } from "react";
import { deleteEntry, updateEntry } from "@/app/actions/entries";
import type { Entry, Tracker } from "@/lib/types";

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

type LogMode = "value" | "range" | "time";

function initialLogMode(tracker: Tracker, entry: Entry): LogMode {
  if (tracker.type === "time") return "time";
  if (entry.start_time && entry.end_time) return "range";
  return "value";
}

export function EntryLog({
  trackers,
  entries,
  tz,
  isToday,
}: {
  trackers: Tracker[];
  entries: Entry[];
  tz: string;
  isToday: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const trackerById = new Map(trackers.map((t) => [t.id, t]));

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        No entries logged {isToday ? "yet today" : "on this day"}.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {entries.map((entry) => {
        const tracker = trackerById.get(entry.tracker_id);
        if (!tracker) return null;

        return editingId === entry.id ? (
          <EntryEditRow
            key={entry.id}
            tracker={tracker}
            entry={entry}
            onCancel={() => setEditingId(null)}
            onSaved={() => setEditingId(null)}
          />
        ) : (
          <EntryViewRow
            key={entry.id}
            tracker={tracker}
            entry={entry}
            tz={tz}
            onEdit={() => setEditingId(entry.id)}
          />
        );
      })}
    </ul>
  );
}

function EntryViewRow({
  tracker,
  entry,
  tz,
  onEdit,
}: {
  tracker: Tracker;
  entry: Entry;
  tz: string;
  onEdit: () => void;
}) {
  const unit = tracker.type === "duration" ? "min" : tracker.unit ?? "";
  const loggedAt = new Date(entry.created_at);

  return (
    <li className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-neutral-500">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: tracker.color }}
          />
          {tracker.name}
        </span>
        <span className="text-neutral-400 tabular-nums" suppressHydrationWarning>
          {loggedAt.toLocaleString("en-US", {
            timeZone: tz,
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
        <span className="font-medium" suppressHydrationWarning>
          {tracker.type === "time" && entry.start_time
            ? formatTime(entry.start_time)
            : entry.start_time && entry.end_time
            ? `${formatTime(entry.start_time)}–${formatTime(entry.end_time)} (${entry.value} ${unit})`
            : `${entry.value} ${unit}`}
        </span>
        {entry.note && <span className="text-neutral-400">{entry.note}</span>}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={onEdit}
          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Edit
        </button>
        <form action={deleteEntry.bind(null, entry.id)}>
          <button type="submit" className="text-neutral-400 hover:text-red-500">
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}

function EntryEditRow({
  tracker,
  entry,
  onCancel,
  onSaved,
}: {
  tracker: Tracker;
  entry: Entry;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [logMode, setLogMode] = useState<LogMode>(initialLogMode(tracker, entry));
  const [value, setValue] = useState(String(entry.value));
  const [startTime, setStartTime] = useState(entry.start_time?.slice(0, 5) ?? "");
  const [endTime, setEndTime] = useState(entry.end_time?.slice(0, 5) ?? "");
  const [timeValue, setTimeValue] = useState(entry.start_time?.slice(0, 5) ?? "");
  const [entryDate, setEntryDate] = useState(entry.entry_date);
  const [note, setNote] = useState(entry.note ?? "");
  const [error, setError] = useState<string | null>(null);

  const unitLabel = tracker.type === "duration" ? "minutes" : tracker.unit || "";

  return (
    <li className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
      <span className="flex items-center gap-1.5 text-xs text-neutral-500">
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: tracker.color }}
        />
        {tracker.name}
      </span>
      <form
        action={async (formData) => {
          const result = await updateEntry(entry.id, formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          onSaved();
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <input type="hidden" name="log_mode" value={logMode} />

        {tracker.type === "duration" && (
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">How</label>
            <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setLogMode("value")}
                className={`px-2 py-1 rounded-md ${
                  logMode === "value"
                    ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900"
                    : "text-neutral-500"
                }`}
              >
                Minutes
              </button>
              <button
                type="button"
                onClick={() => setLogMode("range")}
                className={`px-2 py-1 rounded-md ${
                  logMode === "range"
                    ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900"
                    : "text-neutral-500"
                }`}
              >
                Start–end
              </button>
            </div>
          </div>
        )}

        {logMode === "range" ? (
          <>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Start</label>
              <input
                name="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">End</label>
              <input
                name="end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />
            </div>
          </>
        ) : logMode === "time" ? (
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Time</label>
            <input
              name="time_value"
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              required
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Value {unitLabel && `(${unitLabel})`}
            </label>
            <input
              name="value"
              type="number"
              step="any"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Date</label>
          <input
            name="entry_date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>

        <div className="flex-1 min-w-[8rem]">
          <label className="block text-xs font-medium text-neutral-500 mb-1">Note</label>
          <input
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium"
          >
            Save
          </button>
          <button type="button" onClick={onCancel} className="text-sm text-neutral-500">
            Cancel
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </li>
  );
}
