"use client";

import { useRef, useState } from "react";
import { clearChatHistory, sendChatMessage } from "@/app/actions/chat";
import type { ChatMessage } from "@/lib/types";

export function ChatPanel({ messages }: { messages: ChatMessage[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Ask about your time, spending, or to-dos — e.g. &ldquo;where am I spending the most this
          month?&rdquo;
        </p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="text-sm">
              <div className="text-xs font-medium text-neutral-400 mb-0.5">
                {m.role === "user" ? "You" : "Assistant"}
              </div>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        action={async (formData) => {
          setPending(true);
          const result = await sendChatMessage(formData);
          setPending(false);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setError(null);
          formRef.current?.reset();
        }}
        className="flex items-end gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
      >
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-neutral-500 mb-1">Message</label>
          <input
            name="message"
            placeholder="Ask something about your data"
            required
            disabled={pending}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Thinking..." : "Send"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {messages.length > 0 && (
        <form action={clearChatHistory}>
          <button type="submit" className="text-xs text-neutral-400 hover:text-red-500">
            Clear history
          </button>
        </form>
      )}
    </div>
  );
}
