"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export async function createEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const trackerId = String(formData.get("tracker_id") ?? "");
  const entryDate = String(formData.get("entry_date") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const logMode = String(formData.get("log_mode") ?? "value");

  if (!trackerId || !entryDate) return;

  let value: number;
  let startTime: string | null = null;
  let endTime: string | null = null;

  if (logMode === "range") {
    startTime = String(formData.get("start_time") ?? "");
    endTime = String(formData.get("end_time") ?? "");
    if (!startTime || !endTime) return;
    value = minutesBetween(startTime, endTime);
  } else if (logMode === "time") {
    startTime = String(formData.get("time_value") ?? "");
    if (!startTime) return;
    const [h, m] = startTime.split(":").map(Number);
    value = h * 60 + m;
  } else {
    value = Number(formData.get("value"));
    if (!Number.isFinite(value) || value <= 0) return;
  }

  await supabase.from("entries").insert({
    user_id: user.id,
    tracker_id: trackerId,
    value,
    entry_date: entryDate,
    note: note || null,
    start_time: startTime,
    end_time: endTime,
  });

  revalidatePath("/");
}

export async function deleteEntry(entryId: string) {
  const supabase = await createClient();
  await supabase.from("entries").delete().eq("id", entryId);

  revalidatePath("/");
}
