"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createEntry } from "@/app/actions/entries";
import type { Tracker } from "@/lib/types";

function today() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

type LogMode = "value" | "range" | "time";

export function QuickAddEntry({ trackers }: { trackers: Tracker[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [trackerId, setTrackerId] = useState(trackers[0]?.id ?? "");
  const [logMode, setLogMode] = useState<LogMode>("value");

  const selected = useMemo(
    () => trackers.find((t) => t.id === trackerId),
    [trackers, trackerId]
  );

  useEffect(() => {
    if (selected?.type === "time") setLogMode("time");
    else if (selected?.type === "quantity") setLogMode("value");
    else if (selected?.type === "duration") setLogMode((m) => (m === "time" ? "value" : m));
  }, [selected?.type]);

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
        setLogMode(selected?.type === "time" ? "time" : "value");
      }}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <input type="hidden" name="log_mode" value={logMode} />

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

      {selected?.type === "duration" && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">
            How
          </label>
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
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Start
            </label>
            <input
              name="start_time"
              type="time"
              required
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              End
            </label>
            <input
              name="end_time"
              type="time"
              required
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>
        </>
      ) : logMode === "time" ? (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">
            Time
          </label>
          <input
            name="time_value"
            type="time"
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
            required
            className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
      )}

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
