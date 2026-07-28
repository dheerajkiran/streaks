"use client";

import { useState } from "react";
import { deleteTracker, setTrackerArchived, updateTracker } from "@/app/actions/trackers";
import { SWATCHES } from "@/lib/colors";
import type { Tracker, TrackerType } from "@/lib/types";

function typeLabel(tracker: Tracker) {
  if (tracker.type === "duration") return "minutes";
  if (tracker.type === "time") return "time of day";
  return tracker.unit;
}

export function TrackerRow({ tracker }: { tracker: Tracker }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tracker.name);
  const [type, setType] = useState<TrackerType>(tracker.type);
  const [unit, setUnit] = useState(tracker.unit ?? "");
  const [color, setColor] = useState(tracker.color);
  const [isProductive, setIsProductive] = useState(tracker.is_productive);
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: tracker.color }}
          />
          <span className="text-sm font-medium truncate">{tracker.name}</span>
          <span className="text-xs text-neutral-400 shrink-0">{typeLabel(tracker)}</span>
          {tracker.is_productive && (
            <span className="text-xs text-neutral-400 shrink-0">· productive</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Edit
          </button>
          <form action={setTrackerArchived.bind(null, tracker.id, !tracker.is_archived)}>
            <button
              type="submit"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              {tracker.is_archived ? "Restore" : "Archive"}
            </button>
          </form>
          <form action={deleteTracker.bind(null, tracker.id)}>
            <button type="submit" className="text-red-500 hover:text-red-700">
              Delete
            </button>
          </form>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-3">
      <form
        action={async (formData) => {
          const result = await updateTracker(tracker.id, formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setError(null);
          setEditing(false);
        }}
        className="space-y-3"
      >
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Type</label>
          <div className="flex gap-2 flex-wrap">
            {(["duration", "quantity", "time"] as TrackerType[]).map((t) => (
              <label key={t} className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                />
                {t === "duration" ? "Duration (minutes)" : t === "quantity" ? "Quantity" : "Time of day"}
              </label>
            ))}
          </div>
        </div>

        {type === "quantity" && (
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Unit</label>
            <input
              name="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. glasses, pages"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Color</label>
          <input type="hidden" name="color" value={color} />
          <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                className="h-6 w-6 rounded-full"
                style={{
                  backgroundColor: swatch,
                  outline: color === swatch ? "2px solid currentColor" : "none",
                  outlineOffset: 2,
                }}
                aria-label={swatch}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 p-0 cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
              aria-label="Choose any color"
              title="Choose any color"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_productive"
            checked={isProductive}
            onChange={(e) => setIsProductive(e.target.checked)}
          />
          Counts toward productivity (work, studying, upskilling)
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setName(tracker.name);
              setType(tracker.type);
              setUnit(tracker.unit ?? "");
              setColor(tracker.color);
              setIsProductive(tracker.is_productive);
              setError(null);
              setEditing(false);
            }}
            className="text-sm text-neutral-500"
          >
            Cancel
          </button>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </li>
  );
}
