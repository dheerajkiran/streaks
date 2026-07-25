"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const trackerId = String(formData.get("tracker_id") ?? "");
  const value = Number(formData.get("value"));
  const entryDate = String(formData.get("entry_date") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!trackerId || !Number.isFinite(value) || value <= 0 || !entryDate) return;

  await supabase.from("entries").insert({
    user_id: user.id,
    tracker_id: trackerId,
    value,
    entry_date: entryDate,
    note: note || null,
  });

  revalidatePath("/");
}

export async function deleteEntry(entryId: string) {
  const supabase = await createClient();
  await supabase.from("entries").delete().eq("id", entryId);

  revalidatePath("/");
}
