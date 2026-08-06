"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { deleteConversation } from "@/app/actions/chat";
import type { ChatConversation } from "@/lib/types";

export function ChatSidebar({ conversations }: { conversations: ChatConversation[] }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteConversation(id);
    if (pathname === `/chats/${id}`) {
      router.push("/");
    }
  }

  return (
    <div className="w-full md:w-60 md:shrink-0 md:border-r md:border-neutral-200 dark:md:border-neutral-800 md:pr-4">
      <Link
        href="/"
        className="mb-3 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-medium hover:border-neutral-400 dark:hover:border-neutral-600"
      >
        + New chat
      </Link>

      {conversations.length > 0 && (
        <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {conversations.map((c) => {
            const href = `/chats/${c.id}`;
            const active = pathname === href;
            return (
              <div key={c.id} className="group relative shrink-0 md:shrink">
                <Link
                  href={href}
                  className={`block max-w-[12rem] truncate rounded-lg px-3 py-2 pr-6 text-sm md:max-w-none ${
                    active
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                >
                  {c.title || "New chat"}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  aria-label="Delete chat"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-1 text-xs text-neutral-400 hover:text-red-500 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
