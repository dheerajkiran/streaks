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

function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

function titleFromMessage(content: string) {
  const oneLine = content.replace(/\s+/g, " ").trim();
  return oneLine.length > 60 ? `${oneLine.slice(0, 60)}...` : oneLine;
}

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

  let conversationId = String(formData.get("conversation_id") ?? "").trim() || null;

  if (!conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: titleFromMessage(content) })
      .select("id")
      .single();
    if (conversationError) return { error: conversationError.message };
    conversationId = conversation.id;
  }

  const { error: insertError } = await supabase
    .from("chat_messages")
    .insert({ user_id: user.id, conversation_id: conversationId, role: "user", content });
  if (insertError) return { error: insertError.message };

  const { data: historyData, error: historyError } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
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

  const listTrackers = betaTool({
    name: "list_trackers",
    description:
      "List the user's active trackers with their id, name, type (duration/quantity/time), and unit. Call this before log_entry to find the right tracker_name and see what value it expects.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => {
      const { data, error } = await supabase
        .from("trackers")
        .select("name, type, unit")
        .eq("user_id", user.id)
        .eq("is_archived", false);
      if (error) return `Error: ${error.message}`;
      return JSON.stringify(data ?? []);
    },
  });

  const logEntry = betaTool({
    name: "log_entry",
    description:
      "Log a new entry for one of the user's existing trackers. For a 'time' tracker (e.g. Wake up), pass time as HH:MM 24-hour. For a 'duration' tracker, pass either value in minutes, or start_time and end_time (HH:MM) to have it computed. For a 'quantity' tracker, pass value. Only logs against trackers that already exist - if list_trackers doesn't have a matching name, tell the user no such tracker exists instead of guessing.",
    inputSchema: {
      type: "object",
      properties: {
        tracker_name: { type: "string", description: "Exact or close match of an existing tracker's name." },
        date: { type: "string", description: "Entry date as YYYY-MM-DD. Defaults to today if omitted." },
        value: { type: "number", description: "Numeric value - minutes for duration, count for quantity." },
        time: { type: "string", description: "Clock time as HH:MM (24-hour), for 'time' type trackers." },
        start_time: { type: "string", description: "Start clock time as HH:MM (24-hour), for duration range." },
        end_time: { type: "string", description: "End clock time as HH:MM (24-hour), for duration range." },
        note: { type: "string", description: "Optional short note." },
      },
      required: ["tracker_name"],
      additionalProperties: false,
    },
    run: async ({ tracker_name, date, value, time, start_time, end_time, note }) => {
      const { data: trackers, error: trackerError } = await supabase
        .from("trackers")
        .select("id, name, type")
        .eq("user_id", user.id)
        .eq("is_archived", false);
      if (trackerError) return `Error: ${trackerError.message}`;

      const needle = tracker_name.trim().toLowerCase();
      const tracker =
        (trackers ?? []).find((t) => t.name.toLowerCase() === needle) ??
        (trackers ?? []).find((t) => t.name.toLowerCase().includes(needle));
      if (!tracker) {
        return `Error: No active tracker named "${tracker_name}" exists. Available trackers: ${(trackers ?? [])
          .map((t) => t.name)
          .join(", ")}.`;
      }

      const entryDate = date || (await getTodayInUserTimeZone());
      let entryValue: number;
      let entryStart: string | null = null;
      let entryEnd: string | null = null;

      if (tracker.type === "time") {
        if (!time) return "Error: This is a 'time' tracker - pass a time (HH:MM).";
        const [h, m] = time.split(":").map(Number);
        entryValue = h * 60 + m;
        entryStart = time;
      } else if (tracker.type === "duration") {
        if (start_time && end_time) {
          entryValue = minutesBetween(start_time, end_time);
          entryStart = start_time;
          entryEnd = end_time;
        } else if (typeof value === "number") {
          entryValue = value;
        } else {
          return "Error: This is a 'duration' tracker - pass value in minutes, or start_time and end_time.";
        }
      } else {
        if (typeof value !== "number") return "Error: This is a 'quantity' tracker - pass a numeric value.";
        entryValue = value;
      }

      const { error: insertEntryError } = await supabase.from("entries").insert({
        user_id: user.id,
        tracker_id: tracker.id,
        entry_date: entryDate,
        value: entryValue,
        note: note || null,
        start_time: entryStart,
        end_time: entryEnd,
      });
      if (insertEntryError) return `Error: ${insertEntryError.message}`;

      wroteData = true;
      return JSON.stringify({ logged: true, tracker: tracker.name, entry_date: entryDate, value: entryValue });
    },
  });

  const addTodo = betaTool({
    name: "add_todo",
    description: "Add a new to-do item for the user.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The to-do text." },
        priority: { type: "string", enum: ["low", "medium", "high"], description: "Optional priority." },
        category: { type: "string", description: "Optional free-text category/label." },
        due_date: { type: "string", description: "Optional due date as YYYY-MM-DD." },
      },
      required: ["text"],
      additionalProperties: false,
    },
    run: async ({ text, priority, category, due_date }) => {
      const { error } = await supabase.from("todos").insert({
        user_id: user.id,
        text,
        priority: priority ?? null,
        category: category ?? null,
        due_date: due_date ?? null,
      });
      if (error) return `Error: ${error.message}`;
      wroteData = true;
      return JSON.stringify({ added: true, text });
    },
  });

  const listFinanceCategories = betaTool({
    name: "list_finance_categories",
    description: "List the user's existing finance categories. Call before add_transaction to pick a valid category_name.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => {
      const { data, error } = await supabase.from("finance_categories").select("name").eq("user_id", user.id);
      if (error) return `Error: ${error.message}`;
      return JSON.stringify((data ?? []).map((c) => c.name));
    },
  });

  const addTransaction = betaTool({
    name: "add_transaction",
    description:
      "Log a new expense/transaction for the user. category_name must match an existing category from list_finance_categories - if none fits, omit it and the transaction is left uncategorized rather than inventing a new category.",
    inputSchema: {
      type: "object",
      properties: {
        amount: { type: "number", description: "Amount spent, positive number." },
        place: { type: "string", description: "Optional place/merchant." },
        item: { type: "string", description: "Optional description of what was bought." },
        category_name: { type: "string", description: "Optional, must match an existing finance category name." },
        occurred_on: { type: "string", description: "Date as YYYY-MM-DD. Defaults to today if omitted." },
      },
      required: ["amount"],
      additionalProperties: false,
    },
    run: async ({ amount, place, item, category_name, occurred_on }) => {
      let categoryId: string | null = null;
      if (category_name) {
        const { data: categories, error: categoryError } = await supabase
          .from("finance_categories")
          .select("id, name")
          .eq("user_id", user.id);
        if (categoryError) return `Error: ${categoryError.message}`;
        const needle = category_name.trim().toLowerCase();
        categoryId = (categories ?? []).find((c) => c.name.toLowerCase() === needle)?.id ?? null;
      }

      const occurredOn = occurred_on || (await getTodayInUserTimeZone());
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount,
        place: place || null,
        item: item || null,
        category_id: categoryId,
        occurred_on: occurredOn,
      });
      if (error) return `Error: ${error.message}`;
      wroteData = true;
      return JSON.stringify({ added: true, amount, occurred_on: occurredOn });
    },
  });

  const today = await getTodayInUserTimeZone();
  const timeZone = await getUserTimeZone();
  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  const systemPrompt = `You are a personal assistant inside a private activity, finance, and to-do tracking app. Today's date is ${today} and the current local time is ${currentTime} (timezone: ${timeZone}).

Use the read tools to look up the user's real data before answering questions about their time, spending, or tasks - never guess or make up numbers. Give concise, plain-prose answers. Prefer natural phrasing for time periods (e.g. "this week", "last month") when explaining your reasoning, but pass actual YYYY-MM-DD dates to tools.

You can also act directly on the user's behalf using the write tools (log_entry, add_todo, add_transaction) whenever they describe something that happened or something to remember - e.g. "I just woke up", "log 30 minutes of reading", "add a todo to call mom tomorrow", "I spent $12 on lunch at Chipotle". Don't ask for confirmation first - just do it, then briefly confirm what you recorded. Call list_trackers or list_finance_categories first if you need to match a name. If a tracker doesn't exist, say so and suggest the user create it on the Trackers page rather than guessing which one they meant. When the user says something like "just now" or "just woke up" without a specific time, use the current local time above.`;

  let wroteData = false;
  let finalMessage;
  try {
    finalMessage = await client.beta.messages.toolRunner({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: systemPrompt,
      tools: [
        getTrackerTotals,
        getSpendingByCategory,
        getOpenTodos,
        listTrackers,
        logEntry,
        addTodo,
        listFinanceCategories,
        addTransaction,
      ],
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
      .insert({ user_id: user.id, conversation_id: conversationId, role: "assistant", content: reply });
    if (replyError) return { error: replyError.message };
  }

  await supabase
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/");
  revalidatePath(`/chats/${conversationId}`);
  if (wroteData) {
    revalidatePath("/activity");
    revalidatePath("/todos");
    revalidatePath("/finance");
  }

  return { conversationId };
}

export async function deleteConversation(conversationId: string) {
  const supabase = await createClient();
  await supabase.from("chat_conversations").delete().eq("id", conversationId);
  revalidatePath("/");
}
