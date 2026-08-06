"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { createClient } from "@/lib/supabase/server";
import { getTodayInUserTimeZone, getUserTimeZone } from "@/lib/timezone";
import type { ChatMessage } from "@/lib/types";

const dateRangeSchema = {
  type: "object",
  properties: {
    start_date: { type: "string", description: "Start date, inclusive, as YYYY-MM-DD." },
    end_date: { type: "string", description: "End date, inclusive, as YYYY-MM-DD." },
  },
  required: ["start_date", "end_date"],
  additionalProperties: false,
} as const;

export async function sendChatMessage(formData: FormData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "Assistant is not configured yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const content = String(formData.get("message") ?? "").trim();
  if (!content) return { error: "Enter a message." };

  const { error: insertError } = await supabase
    .from("chat_messages")
    .insert({ user_id: user.id, role: "user", content });
  if (insertError) return { error: insertError.message };

  const { data: historyData, error: historyError } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);
  if (historyError) return { error: historyError.message };

  const history = (historyData ?? []).reverse() as Pick<ChatMessage, "role" | "content">[];

  const client = new Anthropic({ apiKey });

  const getTrackerTotals = betaTool({
    name: "get_tracker_totals",
    description:
      "Get total tracked value per tracker (e.g. minutes of study, glasses of water) for a date range, sorted highest total first.",
    inputSchema: dateRangeSchema,
    run: async ({ start_date, end_date }) => {
      const { data, error } = await supabase
        .from("entries")
        .select("value, tracker_id, trackers(name, type, unit)")
        .eq("user_id", user.id)
        .gte("entry_date", start_date)
        .lte("entry_date", end_date);
      if (error) return `Error: ${error.message}`;

      const totals = new Map<string, { name: string; type: string; unit: string | null; total: number }>();
      for (const row of data ?? []) {
        const tracker = row.trackers as unknown as { name: string; type: string; unit: string | null } | null;
        if (!tracker) continue;
        const key = row.tracker_id as string;
        const existing = totals.get(key);
        if (existing) {
          existing.total += Number(row.value);
        } else {
          totals.set(key, { name: tracker.name, type: tracker.type, unit: tracker.unit, total: Number(row.value) });
        }
      }

      const result = Array.from(totals.values())
        .filter((t) => t.total > 0)
        .sort((a, b) => b.total - a.total);
      return JSON.stringify(result);
    },
  });

  const getSpendingByCategory = betaTool({
    name: "get_spending_by_category",
    description: "Get total spending grouped by finance category for a date range, sorted highest total first.",
    inputSchema: dateRangeSchema,
    run: async ({ start_date, end_date }) => {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, category_id, finance_categories(name)")
        .eq("user_id", user.id)
        .gte("occurred_on", start_date)
        .lte("occurred_on", end_date);
      if (error) return `Error: ${error.message}`;

      const totals = new Map<string, number>();
      for (const row of data ?? []) {
        const category = row.finance_categories as unknown as { name: string } | null;
        const key = category?.name ?? "Uncategorized";
        totals.set(key, (totals.get(key) ?? 0) + Number(row.amount));
      }

      const result = Array.from(totals.entries())
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);
      return JSON.stringify(result);
    },
  });

  const getOpenTodos = betaTool({
    name: "get_open_todos",
    description: "Get the user's incomplete to-do items, ordered by due date (soonest first, no due date last).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("text, priority, category, due_date")
        .eq("user_id", user.id)
        .eq("is_done", false)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) return `Error: ${error.message}`;
      return JSON.stringify(data ?? []);
    },
  });

  const today = await getTodayInUserTimeZone();
  const timeZone = await getUserTimeZone();

  const systemPrompt = `You are a personal assistant inside a private activity, finance, and to-do tracking app. Today's date is ${today} (timezone: ${timeZone}). Use the provided tools to look up the user's real data before answering questions about their time, spending, or tasks - never guess or make up numbers. Give concise, plain-prose answers. Prefer natural phrasing for time periods (e.g. "this week", "last month") when explaining your reasoning, but pass actual YYYY-MM-DD dates to tools.`;

  let finalMessage;
  try {
    finalMessage = await client.beta.messages.toolRunner({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system: systemPrompt,
      tools: [getTrackerTotals, getSpendingByCategory, getOpenTodos],
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Assistant request failed." };
  }

  const reply = finalMessage.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (reply) {
    const { error: replyError } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: "assistant", content: reply });
    if (replyError) return { error: replyError.message };
  }

  revalidatePath("/");
}

export async function clearChatHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("chat_messages").delete().eq("user_id", user.id);
  revalidatePath("/");
}
