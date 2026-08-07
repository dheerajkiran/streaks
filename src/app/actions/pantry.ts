"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPantryItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = quantityRaw ? Number(quantityRaw) : null;
  if (quantity !== null && !Number.isFinite(quantity)) {
    return { error: "Enter a valid quantity." };
  }

  const unit = String(formData.get("unit") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const expiryDate = String(formData.get("expiry_date") ?? "") || null;

  const { error } = await supabase.from("pantry_items").insert({
    user_id: user.id,
    name,
    quantity,
    unit,
    category,
    expiry_date: expiryDate,
  });
  if (error) return { error: error.message };

  revalidatePath("/pantry");
}

export async function updatePantryItem(itemId: string, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = quantityRaw ? Number(quantityRaw) : null;
  if (quantity !== null && !Number.isFinite(quantity)) {
    return { error: "Enter a valid quantity." };
  }

  const unit = String(formData.get("unit") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const expiryDate = String(formData.get("expiry_date") ?? "") || null;

  const { error } = await supabase
    .from("pantry_items")
    .update({
      name,
      quantity,
      unit,
      category,
      expiry_date: expiryDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/pantry");
}

export async function adjustPantryQuantity(itemId: string, delta: number) {
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("pantry_items")
    .select("quantity")
    .eq("id", itemId)
    .maybeSingle();

  const current = Number(item?.quantity ?? 0);
  const next = Math.max(current + delta, 0);

  await supabase
    .from("pantry_items")
    .update({ quantity: next, updated_at: new Date().toISOString() })
    .eq("id", itemId);

  revalidatePath("/pantry");
}

export async function deletePantryItem(itemId: string) {
  const supabase = await createClient();
  await supabase.from("pantry_items").delete().eq("id", itemId);
  revalidatePath("/pantry");
}
