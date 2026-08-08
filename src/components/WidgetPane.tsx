"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "streaks-widget-order";

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="4" cy="3" r="1.3" />
      <circle cx="10" cy="3" r="1.3" />
      <circle cx="4" cy="7" r="1.3" />
      <circle cx="10" cy="7" r="1.3" />
      <circle cx="4" cy="11" r="1.3" />
      <circle cx="10" cy="11" r="1.3" />
    </svg>
  );
}

export function WidgetPane({ widgets }: { widgets: { key: string; node: React.ReactNode }[] }) {
  const [order, setOrder] = useState<string[]>(widgets.map((w) => w.key));
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const storedOrder: string[] = JSON.parse(stored);
      const validKeys = widgets.map((w) => w.key);
      const filtered = storedOrder.filter((k) => validKeys.includes(k));
      const missing = validKeys.filter((k) => !filtered.includes(k));
      setOrder([...filtered, ...missing]);
    } catch {
      // ignore malformed storage
    }
    // Only sync from storage once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDrop(targetKey: string) {
    setDragOverKey(null);
    if (!dragKey || dragKey === targetKey) {
      setDragKey(null);
      return;
    }
    const next = [...order];
    const fromIdx = next.indexOf(dragKey);
    const toIdx = next.indexOf(targetKey);
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, dragKey);
    setOrder(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDragKey(null);
  }

  const nodesByKey = new Map(widgets.map((w) => [w.key, w.node]));

  return (
    <div className="space-y-6">
      {order.map((key) => {
        const node = nodesByKey.get(key);
        if (!node) return null;
        return (
          <div
            key={key}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOverKey !== key) setDragOverKey(key);
            }}
            onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
            onDrop={() => handleDrop(key)}
            className={`rounded-xl transition-shadow ${
              dragOverKey === key && dragKey !== key ? "ring-2 ring-neutral-400 dark:ring-neutral-600" : ""
            }`}
          >
            <div
              draggable
              onDragStart={() => setDragKey(key)}
              onDragEnd={() => {
                setDragKey(null);
                setDragOverKey(null);
              }}
              aria-label="Drag to reorder"
              className="flex cursor-grab justify-center py-0.5 text-neutral-300 hover:text-neutral-500 active:cursor-grabbing dark:text-neutral-700 dark:hover:text-neutral-500"
            >
              <GripIcon />
            </div>
            {node}
          </div>
        );
      })}
    </div>
  );
}
