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

function parseSplits(formData: FormData) {
  const names = formData.getAll("split_person").map((v) => String(v).trim());
  const amounts = formData.getAll("split_amount").map((v) => Number(v));
  return names
    .map((name, i) => ({ name, amount: amounts[i] }))
    .filter((s) => s.name && Number.isFinite(s.amount) && s.amount > 0);
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

  const splits = parseSplits(formData);
  let myShare: number | null = null;
  if (splits.length > 0) {
    const othersTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    myShare = amount - othersTotal;
    if (myShare < 0) {
      return { error: "The split amounts add up to more than the total." };
    }
  }

  const { data: inserted, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount,
      my_share: myShare,
      category_id: categoryId,
      place,
      item,
      occurred_on: occurredOn,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (splits.length > 0) {
    const { error: splitError } = await supabase.from("transaction_splits").insert(
      splits.map((s) => ({
        transaction_id: inserted.id,
        user_id: user.id,
        person_name: s.name,
        amount: s.amount,
      }))
    );
    if (splitError) return { error: splitError.message };
  }

  revalidatePath("/finance");
}

export async function updateTransaction(transactionId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const amount = Number(formData.get("amount"));
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;
  const place = String(formData.get("place") ?? "").trim() || null;
  const item = String(formData.get("item") ?? "").trim() || null;
  const occurredOn =
    String(formData.get("occurred_on") ?? "") || new Date().toISOString().slice(0, 10);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount." };
  }

  const splits = parseSplits(formData);
  let myShare: number | null = null;
  if (splits.length > 0) {
    const othersTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    myShare = amount - othersTotal;
    if (myShare < 0) {
      return { error: "The split amounts add up to more than the total." };
    }
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      amount,
      my_share: myShare,
      category_id: categoryId,
      place,
      item,
      occurred_on: occurredOn,
    })
    .eq("id", transactionId);
  if (error) return { error: error.message };

  const { error: deleteError } = await supabase
    .from("transaction_splits")
    .delete()
    .eq("transaction_id", transactionId);
  if (deleteError) return { error: deleteError.message };

  if (splits.length > 0) {
    const { error: splitError } = await supabase.from("transaction_splits").insert(
      splits.map((s) => ({
        transaction_id: transactionId,
        user_id: user.id,
        person_name: s.name,
        amount: s.amount,
      }))
    );
    if (splitError) return { error: splitError.message };
  }

  revalidatePath("/finance");
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", transactionId);
  revalidatePath("/finance");
}
