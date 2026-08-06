"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessage } from "@/app/actions/chat";
import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Where am I spending the most this month?",
  "How productive was I this week?",
  "What's overdue on my to-do list?",
  "Where am I wasting time lately?",
];

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 5) return `Up late, ${name}?`;
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  if (hour < 21) return `Good evening, ${name}`;
  return `Up late, ${name}?`;
}

export function ChatPanel({
  messages,
  name,
  conversationId,
}: {
  messages: ChatMessage[];
  name: string;
  conversationId?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const hasMessages = messages.length > 0 || optimisticMessage !== null;

  async function submit(formData: FormData) {
    const content = String(formData.get("message") ?? "").trim();
    if (!content) return;

    if (conversationId) formData.set("conversation_id", conversationId);
    setOptimisticMessage(content);
    setPending(true);
    const result = await sendChatMessage(formData);
    setPending(false);
    setOptimisticMessage(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setInput("");
    formRef.current?.reset();
    if (!conversationId && result?.conversationId) {
      router.push(`/chats/${result.conversationId}`);
    }
  }

  async function submitSuggestion(text: string) {
    const formData = new FormData();
    formData.set("message", text);
    await submit(formData);
  }

  const inputBox = (
    <form
      ref={formRef}
      action={submit}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 shadow-sm"
    >
      <input
        name="message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !pending && input.trim()) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        placeholder="How can I help you today?"
        required
        disabled={pending}
        className="w-full bg-transparent px-2 py-2 text-base outline-none placeholder:text-neutral-400 disabled:opacity-50"
      />
      <div className="flex items-center justify-end px-1">
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-1.5 text-sm font-medium disabled:opacity-40"
        >
          {pending ? "Thinking..." : "Send"}
        </button>
      </div>
    </form>
  );

  if (!hasMessages) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl sm:text-5xl font-serif text-center">{getGreeting(name)}</h1>

        <div className="w-full max-w-xl">{inputBox}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => submitSuggestion(s)}
              className="text-left rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-600 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex"}>
            {m.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 text-sm whitespace-pre-wrap">
                {m.content}
              </div>
            ) : (
              <div className="max-w-[80%] text-sm whitespace-pre-wrap">{m.content}</div>
            )}
          </li>
        ))}
        {optimisticMessage !== null && (
          <li className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-2 text-sm whitespace-pre-wrap opacity-70">
              {optimisticMessage}
            </div>
          </li>
        )}
        {pending && <li className="text-sm text-neutral-400">Thinking...</li>}
      </ul>

      {inputBox}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
