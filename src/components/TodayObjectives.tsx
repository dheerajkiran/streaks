"use client";

import { setTodoDone } from "@/app/actions/todos";
import { PRIORITY } from "@/lib/todos";
import type { Todo } from "@/lib/types";

export function TodayObjectives({ todos }: { todos: Todo[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
      <h2 className="text-sm font-medium text-neutral-500">Today&rsquo;s objective</h2>
      {todos.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing pinned to today.</p>
      ) : (
        <ul className="space-y-1.5">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.is_done}
                onChange={(e) => setTodoDone(todo.id, e.target.checked)}
                className="shrink-0"
              />
              {todo.priority && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: PRIORITY[todo.priority].color }}
                />
              )}
              <span
                className={`flex-1 min-w-0 truncate text-sm ${
                  todo.is_done ? "line-through text-neutral-400" : ""
                }`}
              >
                {todo.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
