"use client";

import { useRef, useState } from "react";
import { createTracker } from "@/app/actions/trackers";
import { SWATCHES } from "@/lib/colors";
import type { TrackerType } from "@/lib/types";

export function TrackerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<TrackerType>("duration");
  const [color, setColor] = useState(SWATCHES[0]);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const result = await createTracker(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setError(null);
        formRef.current?.reset();
        setType("duration");
        setColor(SWATCHES[0]);
      }}
      className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
    >
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Name
        </label>
        <input
          name="name"
          required
          placeholder="e.g. Studying, Water"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Type
        </label>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="type"
              value="duration"
              checked={type === "duration"}
              onChange={() => setType("duration")}
            />
            Duration (minutes)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="type"
              value="quantity"
              checked={type === "quantity"}
              onChange={() => setType("quantity")}
            />
            Quantity
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="type"
              value="time"
              checked={type === "time"}
              onChange={() => setType("time")}
            />
            Time of day
          </label>
        </div>
      </div>

      {type === "quantity" && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">
            Unit
          </label>
          <input
            name="unit"
            placeholder="e.g. glasses, pages"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Color
        </label>
        <input type="hidden" name="color" value={color} />
        <div className="flex gap-2">
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
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium"
      >
        Add tracker
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
