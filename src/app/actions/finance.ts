"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFinanceCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const { error } = await supabase
    .from("finance_categories")
    .insert({ user_id: user.id, name });
  if (error) return { error: error.message };

  revalidatePath("/finance");
}

export async function deleteFinanceCategory(categoryId: string) {
  const supabase = await createClient();
  await supabase.from("finance_categories").delete().eq("id", categoryId);
  revalidatePath("/finance");
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const amount = Number(formData.get("amount"));
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;
  const place = String(formData.get("place") ?? "").trim() || null;
  const item = String(formData.get("item") ?? "").trim() || null;
  const occurredOn =
    String(formData.get("occurred_on") ?? "") || new Date().toISOString().slice(0, 10);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount,
    category_id: categoryId,
    place,
    item,
    occurred_on: occurredOn,
  });
  if (error) return { error: error.message };

  revalidatePath("/finance");
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", transactionId);
  revalidatePath("/finance");
}
