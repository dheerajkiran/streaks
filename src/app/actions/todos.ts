"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTodo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const { error } = await supabase.from("todos").insert({ user_id: user.id, text });
  if (error) return { error: error.message };

  revalidatePath("/");
}

export async function setTodoDone(todoId: string, isDone: boolean) {
  const supabase = await createClient();
  await supabase
    .from("todos")
    .update({ is_done: isDone, completed_at: isDone ? new Date().toISOString() : null })
    .eq("id", todoId);

  revalidatePath("/");
}

export async function updateTodoText(todoId: string, formData: FormData) {
  const supabase = await createClient();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Enter some text." };

  const { error } = await supabase.from("todos").update({ text }).eq("id", todoId);
  if (error) return { error: error.message };

  revalidatePath("/");
}

export async function deleteTodo(todoId: string) {
  const supabase = await createClient();
  await supabase.from("todos").delete().eq("id", todoId);

  revalidatePath("/");
}
