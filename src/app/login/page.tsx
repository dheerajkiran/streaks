"use client";

import { useActionState } from "react";
import { sendMagicLink, type SendMagicLinkState } from "@/app/actions/auth";

const initialState: SendMagicLinkState = { status: "idle" };

export default function LoginPage() {
  const [state, action, pending] = useActionState(sendMagicLink, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">Streaks</h1>
        <p className="text-sm text-center text-neutral-500 mb-8">
          Track your day, your way.
        </p>

        <form action={action} className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {state.status === "sent" && (
          <p className="mt-4 text-sm text-center text-green-600 dark:text-green-400">
            {state.message}
          </p>
        )}
        {state.status === "error" && (
          <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400">
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
