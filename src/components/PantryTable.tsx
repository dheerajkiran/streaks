"use client";

import { useRef, useState } from "react";
import {
  adjustPantryQuantity,
  createPantryItem,
  deletePantryItem,
  updatePantryItem,
} from "@/app/actions/pantry";
import { todayISO } from "@/lib/todos";
import type { PantryItem } from "@/lib/types";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const today = todayISO();
  const [ty, tm, td] = today.split("-").map(Number);
  const [dy, dm, dd] = dateStr.split("-").map(Number);
  const diffMs = Date.UTC(dy, dm - 1, dd) - Date.UTC(ty, tm - 1, td);
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function PantryTable({ items }: { items: PantryItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  const expiringSoon = [...items]
    .filter((i) => i.expiry_date && daysUntil(i.expiry_date) <= 3)
    .sort((a, b) => (a.expiry_date ?? "").localeCompare(b.expiry_date ?? ""));

  const expiringSoonIds = new Set(expiringSoon.map((i) => i.id));

  const byCategory = new Map<string, PantryItem[]>();
  for (const item of items) {
    if (expiringSoonIds.has(item.id)) continue;
    const key = item.category?.trim() || "Uncategorized";
    byCategory.set(key, [...(byCategory.get(key) ?? []), item]);
  }
  const categories = Array.from(byCategory.keys()).sort((a, b) => a.localeCompare(b));

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
      <h2 className="text-sm font-medium text-neutral-500">Pantry</h2>

      <form
        ref={formRef}
        action={async (formData) => {
          const result = await createPantryItem(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setError(null);
          formRef.current?.reset();
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[8rem]">
          <label className="block text-xs font-medium text-neutral-500 mb-1">Item</label>
          <input
            name="name"
            placeholder="e.g. Eggs"
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Qty</label>
          <input
            name="quantity"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            className="w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Unit</label>
          <input
            name="unit"
            placeholder="e.g. cups"
            className="w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Category</label>
          <input
            name="category"
            placeholder="e.g. Produce"
            className="w-28 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Expires</label>
          <input
            name="expiry_date"
            type="date"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium"
        >
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing in your pantry yet.</p>
      ) : (
        <div className="space-y-4">
          {expiringSoon.length > 0 && (
            <PantrySection title="Expiring soon" titleClassName="text-red-500" items={expiringSoon} />
          )}
          {categories.map((cat) => (
            <PantrySection key={cat} title={cat} items={byCategory.get(cat) ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}

function PantrySection({
  title,
  items,
  titleClassName,
}: {
  title: string;
  items: PantryItem[];
  titleClassName?: string;
}) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <p className={`text-xs font-medium mb-1 ${titleClassName ?? "text-neutral-400"}`}>{title}</p>
      <ul className="space-y-1">
        {sorted.map((item) => (
          <PantryRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function PantryRow({ item }: { item: PantryItem }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <li className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 space-y-2">
        <form
          action={async (formData) => {
            const result = await updatePantryItem(item.id, formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            setError(null);
            setEditing(false);
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <input
            name="name"
            defaultValue={item.name}
            required
            autoFocus
            className="flex-1 min-w-[7rem] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
          <input
            name="quantity"
            type="number"
            step="any"
            min="0"
            defaultValue={item.quantity ?? ""}
            className="w-16 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
          <input
            name="unit"
            defaultValue={item.unit ?? ""}
            placeholder="unit"
            className="w-16 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
          <input
            name="category"
            defaultValue={item.category ?? ""}
            placeholder="category"
            className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
          <input
            name="expiry_date"
            type="date"
            defaultValue={item.expiry_date ?? ""}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
          <button type="submit" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-neutral-400">
            Cancel
          </button>
        </form>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </li>
    );
  }

  const expired = item.expiry_date ? daysUntil(item.expiry_date) < 0 : false;

  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm">
      <span className="w-36 shrink-0 truncate font-medium">{item.name}</span>

      <span className="flex w-32 shrink-0 items-center gap-1 text-neutral-400">
        {item.quantity !== null && (
          <>
            <button
              type="button"
              onClick={() => adjustPantryQuantity(item.id, -1)}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-1.5 hover:border-neutral-500"
            >
              -
            </button>
            <span className="w-10 shrink-0 truncate text-center tabular-nums text-neutral-600 dark:text-neutral-300">
              {item.quantity} {item.unit ?? ""}
            </span>
            <button
              type="button"
              onClick={() => adjustPantryQuantity(item.id, 1)}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-1.5 hover:border-neutral-500"
            >
              +
            </button>
          </>
        )}
      </span>

      <span className="w-24 shrink-0 text-[10px]" suppressHydrationWarning>
        {item.expiry_date && (
          <span className={expired ? "text-red-500" : "text-neutral-400"}>
            {expired ? "expired " : "exp. "}
            {formatDate(item.expiry_date)}
          </span>
        )}
      </span>

      <span className="flex-1" />

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 shrink-0"
      >
        Edit
      </button>
      <form action={deletePantryItem.bind(null, item.id)} className="shrink-0">
        <button type="submit" className="text-xs text-neutral-400 hover:text-red-500">
          Delete
        </button>
      </form>
    </li>
  );
}
