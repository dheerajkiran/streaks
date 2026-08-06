"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TodoPriority } from "@/lib/types";

function parsePriority(value: FormDataEntryValue | null): TodoPriority | null {
  const s = String(value ?? "");
  return s === "low" || s === "medium" || s === "high" ? s : null;
}

export async function createTodo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const priority = parsePriority(formData.get("priority"));
  const category = String(formData.get("category") ?? "").trim() || null;
  const dueDate = String(formData.get("due_date") ?? "") || null;

  const { error } = await supabase.from("todos").insert({
    user_id: user.id,
    text,
    priority,
    category,
    due_date: dueDate,
  });
  if (error) return { error: error.message };

  revalidatePath("/activity");
}

export async function setTodoDone(todoId: string, isDone: boolean) {
  const supabase = await createClient();
  await supabase
    .from("todos")
    .update({ is_done: isDone, completed_at: isDone ? new Date().toISOString() : null })
    .eq("id", todoId);

  revalidatePath("/activity");
}

export async function updateTodo(todoId: string, formData: FormData) {
  const supabase = await createClient();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Enter some text." };

  const priority = parsePriority(formData.get("priority"));
  const category = String(formData.get("category") ?? "").trim() || null;
  const dueDate = String(formData.get("due_date") ?? "") || null;

  const { error } = await supabase
    .from("todos")
    .update({ text, priority, category, due_date: dueDate })
    .eq("id", todoId);
  if (error) return { error: error.message };

  revalidatePath("/activity");
}

export async function deleteTodo(todoId: string) {
  const supabase = await createClient();
  await supabase.from("todos").delete().eq("id", todoId);

  revalidatePath("/activity");
}
