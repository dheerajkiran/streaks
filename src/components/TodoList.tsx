"use client";

import { useRef, useState } from "react";
import { createTodo, deleteTodo, setTodoDone, updateTodoText } from "@/app/actions/todos";
import type { Todo } from "@/lib/types";

export function TodoList({ todos }: { todos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const open = todos.filter((t) => !t.is_done);
  const done = todos.filter((t) => t.is_done);

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
      <h2 className="text-sm font-medium text-neutral-500">To-do</h2>

      <form
        ref={formRef}
        action={async (formData) => {
          await createTodo(formData);
          formRef.current?.reset();
        }}
        className="flex gap-2"
      >
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
      </form>

      {todos.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing on your list yet.</p>
      ) : (
        <ul className="space-y-1">
          {open.map((todo) => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
          {done.map((todo) => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TodoRow({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <li>
        <form
          action={async (formData) => {
            const result = await updateTodoText(todo.id, formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            setError(null);
            setEditing(false);
          }}
          className="flex gap-2"
        >
          <input
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            autoFocus
            className="flex-1 min-w-0 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
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
              setError(null);
              setEditing(false);
            }}
            className="text-xs text-neutral-400"
          >
            Cancel
          </button>
        </form>
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={todo.is_done}
        onChange={(e) => setTodoDone(todo.id, e.target.checked)}
        className="shrink-0"
      />
      <span
        className={`flex-1 min-w-0 text-sm truncate ${
          todo.is_done ? "line-through text-neutral-400" : ""
        }`}
      >
        {todo.text}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 shrink-0"
      >
        Edit
      </button>
      <form action={deleteTodo.bind(null, todo.id)} className="shrink-0">
        <button type="submit" className="text-xs text-neutral-400 hover:text-red-500">
          Delete
        </button>
      </form>
    </li>
  );
}
