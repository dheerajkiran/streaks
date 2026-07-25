"use client";

import { useActionState, useState } from "react";
import {
  sendMagicLink,
  signInWithPassword,
  type SendMagicLinkState,
  type PasswordSignInState,
} from "@/app/actions/auth";

const magicLinkInitialState: SendMagicLinkState = { status: "idle" };
const passwordInitialState: PasswordSignInState = { status: "idle" };

export default function LoginPage() {
  const [mode, setMode] = useState<"magic" | "password">("password");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">Streaks</h1>
        <p className="text-sm text-center text-neutral-500 mb-8">
          Track your day, your way.
        </p>

        <div className="flex mb-6 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 rounded-md py-1.5 ${
              mode === "password"
                ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900"
                : "text-neutral-500"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={`flex-1 rounded-md py-1.5 ${
              mode === "magic"
                ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900"
                : "text-neutral-500"
            }`}
          >
            Magic link
          </button>
        </div>

        {mode === "password" ? <PasswordForm /> : <MagicLinkForm />}
      </div>
    </div>
  );
}

function PasswordForm() {
  const [state, action, pending] = useActionState(
    signInWithPassword,
    passwordInitialState
  );

  return (
    <>
      <form action={action} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {state.status === "error" && (
        <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
    </>
  );
}

function MagicLinkForm() {
  const [state, action, pending] = useActionState(
    sendMagicLink,
    magicLinkInitialState
  );

  return (
    <>
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
    </>
  );
}
