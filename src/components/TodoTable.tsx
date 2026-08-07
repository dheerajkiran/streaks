"use client";

import { useRef, useState } from "react";
import { createTodo, deleteTodo, setTodoDone, setTodoDueDate, updateTodo } from "@/app/actions/todos";
import { TodoRow } from "@/components/TodoList";
import { PRIORITY, sortTodos, todayISO, tomorrowISO } from "@/lib/todos";
import type { Todo, TodoPriority } from "@/lib/types";

function QuickDateButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded-md text-xs border ${
        active
          ? "border-neutral-500 text-neutral-900 dark:text-neutral-100"
          : "border-neutral-300 dark:border-neutral-700 text-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const COLUMNS = ["", "Topic", "Due date", "Category", "Urgency", ""];

export function TodoTable({ todos }: { todos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [quickDate, setQuickDate] = useState<"" | "today" | "tomorrow">("");
  const [isDragOver, setIsDragOver] = useState(false);

  const today = todayISO();
  const tomorrow = tomorrowISO();

  const openTodos = todos.filter((t) => !t.is_done);
  const overdue = sortTodos(openTodos.filter((t) => t.due_date && t.due_date < today));
  const dueToday = sortTodos(openTodos.filter((t) => t.due_date === today));
  const dueTomorrow = sortTodos(openTodos.filter((t) => t.due_date === tomorrow));
  const upcoming = sortTodos(openTodos.filter((t) => t.due_date && t.due_date > tomorrow));
  const unscheduled = sortTodos(openTodos.filter((t) => !t.due_date));
  const done = sortTodos(todos.filter((t) => t.is_done));

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const id = e.dataTransfer.getData("text/plain");
          if (id) setTodoDueDate(id, today);
        }}
        className={`rounded-xl border p-4 space-y-2 transition-colors ${
          isDragOver
            ? "border-neutral-500 bg-neutral-50 dark:bg-neutral-900"
            : "border-neutral-200 dark:border-neutral-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Today&rsquo;s focus</h2>
          <span className="text-xs text-neutral-400">Drag a task here to pin it to today</span>
        </div>
        {dueToday.length === 0 ? (
          <p className="text-sm text-neutral-400">Nothing pinned to today yet.</p>
        ) : (
          <ul className="space-y-1">
            {dueToday.map((todo) => (
              <TodoRow key={todo.id} todo={todo} />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
      <h2 className="text-sm font-medium text-neutral-500">To-do</h2>

      <form
        ref={formRef}
        action={async (formData) => {
          await createTodo(formData);
          formRef.current?.reset();
          setQuickDate("");
        }}
        className="space-y-2"
      >
        <div className="flex gap-2">
          <input
            name="text"
            placeholder="Something to remember..."
            required
            className="flex-1 min-w-0 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium shrink-0"
          >
            Add
          </button>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="hidden"
            name="due_date"
            value={quickDate === "today" ? today : quickDate === "tomorrow" ? tomorrow : ""}
          />
          <QuickDateButton label="No date" active={quickDate === ""} onClick={() => setQuickDate("")} />
          <QuickDateButton
            label="Today"
            active={quickDate === "today"}
            onClick={() => setQuickDate("today")}
          />
          <QuickDateButton
            label="Tomorrow"
            active={quickDate === "tomorrow"}
            onClick={() => setQuickDate("tomorrow")}
          />
        </div>
      </form>

      {todos.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing on your list yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                {COLUMNS.map((col, i) => (
                  <th key={i} className="py-2 px-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <GroupRows title="Overdue" todos={overdue} titleClassName="text-red-500" draggable />
              <GroupRows title="Tomorrow" todos={dueTomorrow} draggable />
              <GroupRows title="Upcoming" todos={upcoming} draggable />
              <GroupRows title="Unscheduled" todos={unscheduled} draggable />
              <GroupRows title="Done" todos={done} />
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}

function GroupRows({
  title,
  todos,
  titleClassName,
  draggable,
}: {
  title: string;
  todos: Todo[];
  titleClassName?: string;
  draggable?: boolean;
}) {
  if (todos.length === 0) return null;

  return (
    <>
      <tr>
        <td colSpan={COLUMNS.length} className={`pt-3 pb-1 px-2 text-xs font-medium ${titleClassName ?? "text-neutral-400"}`}>
          {title}
        </td>
      </tr>
      {todos.map((todo) => (
        <TodoTableRow key={todo.id} todo={todo} draggable={draggable} />
      ))}
    </>
  );
}

function TodoTableRow({ todo, draggable }: { todo: Todo; draggable?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const [priority, setPriority] = useState<TodoPriority | "">(todo.priority ?? "");
  const [category, setCategory] = useState(todo.category ?? "");
  const [dueDate, setDueDate] = useState(todo.due_date ?? "");
  const [error, setError] = useState<string | null>(null);

  const cellClass = "py-2 px-2 border-b border-neutral-100 dark:border-neutral-900";

  if (editing) {
    return (
      <tr>
        <td colSpan={COLUMNS.length} className={cellClass}>
          <form
            action={async (formData) => {
              const result = await updateTodo(todo.id, formData);
              if (result?.error) {
                setError(result.error);
                return;
              }
              setError(null);
              setEditing(false);
            }}
            className="space-y-2"
          >
            <input
              name="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              autoFocus
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
            />

            <div className="flex flex-wrap items-center gap-1">
              <input type="hidden" name="priority" value={priority} />
              <button
                type="button"
                onClick={() => setPriority("")}
                className={`px-2 py-0.5 rounded-md text-xs border ${
                  priority === ""
                    ? "border-neutral-500 text-neutral-900 dark:text-neutral-100"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-400"
                }`}
              >
                None
              </button>
              {(Object.keys(PRIORITY) as TodoPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${
                    priority === p
                      ? "border-neutral-500 text-neutral-900 dark:text-neutral-100"
                      : "border-neutral-300 dark:border-neutral-700 text-neutral-400"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: PRIORITY[p].color }}
                  />
                  {PRIORITY[p].label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <QuickDateButton
                label="Today"
                active={dueDate === todayISO()}
                onClick={() => setDueDate(todayISO())}
              />
              <QuickDateButton
                label="Tomorrow"
                active={dueDate === tomorrowISO()}
                onClick={() => setDueDate(tomorrowISO())}
              />
              <QuickDateButton label="Clear" active={false} onClick={() => setDueDate("")} />
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g. Work)"
                className="flex-1 min-w-[7rem] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs outline-none focus:border-neutral-500"
              />
              <input
                name="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs outline-none focus:border-neutral-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(todo.text);
                  setPriority(todo.priority ?? "");
                  setCategory(todo.category ?? "");
                  setDueDate(todo.due_date ?? "");
                  setError(null);
                  setEditing(false);
                }}
                className="text-xs text-neutral-400"
              >
                Cancel
              </button>
            </div>
          </form>
          {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
        </td>
      </tr>
    );
  }

  const isOverdue = !todo.is_done && !!todo.due_date && todo.due_date < todayISO();

  return (
    <tr
      draggable={draggable}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", todo.id)}
      className={draggable ? "cursor-grab active:cursor-grabbing" : ""}
    >
      <td className={cellClass}>
        <input
          type="checkbox"
          checked={todo.is_done}
          onChange={(e) => setTodoDone(todo.id, e.target.checked)}
        />
      </td>
      <td className={`${cellClass} max-w-[24rem]`}>
        <span className={todo.is_done ? "line-through text-neutral-400" : ""}>{todo.text}</span>
      </td>
      <td className={cellClass}>
        {todo.due_date ? (
          <span className={isOverdue ? "text-red-500" : ""} suppressHydrationWarning>
            {formatDate(todo.due_date)}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </td>
      <td className={cellClass}>
        {todo.category ? (
          <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-500">
            {todo.category}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </td>
      <td className={cellClass}>
        {todo.priority ? (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: PRIORITY[todo.priority].color }}
            />
            {PRIORITY[todo.priority].label}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </td>
      <td className={cellClass}>
        <div className="flex items-center gap-3 text-xs whitespace-nowrap">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Edit
          </button>
          <form action={deleteTodo.bind(null, todo.id)}>
            <button type="submit" className="text-neutral-400 hover:text-red-500">
              Delete
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
