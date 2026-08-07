"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteConversation } from "@/app/actions/chat";
import type { ChatConversation } from "@/lib/types";

const STORAGE_KEY = "streaks-chat-sidebar-collapsed";

function SidebarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <line x1="6" y1="2.5" x2="6" y2="13.5" />
    </svg>
  );
}

export function ChatSidebar({ conversations }: { conversations: ChatConversation[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function handleDelete(id: string) {
    await deleteConversation(id);
    if (pathname === `/chats/${id}`) {
      router.push("/");
    }
  }

  if (collapsed) {
    return (
      <div className="flex items-center gap-2 md:w-10 md:shrink-0 md:flex-col md:border-r md:border-neutral-200 md:pr-2 dark:md:border-neutral-800">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Open sidebar"
          title="Open sidebar"
          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <SidebarIcon />
        </button>
        <Link
          href="/"
          aria-label="New chat"
          className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-2 py-2 text-sm hover:border-neutral-400 dark:hover:border-neutral-600"
        >
          +
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full md:w-60 md:shrink-0 md:border-r md:border-neutral-200 dark:md:border-neutral-800 md:pr-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-serif text-lg">Streaks</span>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Close sidebar"
          title="Close sidebar"
          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <SidebarIcon />
        </button>
      </div>

      <Link
        href="/"
        className="mb-3 block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-center text-sm font-medium hover:border-neutral-400 dark:hover:border-neutral-600"
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
                  className={`block max-w-[12rem] truncate rounded-lg px-3 py-2 text-sm md:max-w-none md:pr-6 ${
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
                  className="absolute right-1 top-1/2 hidden -translate-y-1/2 px-1 text-xs text-neutral-400 hover:text-red-500 md:group-hover:block"
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
