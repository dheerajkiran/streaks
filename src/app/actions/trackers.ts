"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TrackerType } from "@/lib/types";

export async function createTracker(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as TrackerType;
  const unit = String(formData.get("unit") ?? "").trim();
  const color = String(formData.get("color") ?? "#22c55e");
  const isProductive = formData.get("is_productive") === "on";

  if (!name) return { error: "Name is required." };
  if (type !== "duration" && type !== "quantity" && type !== "time") {
    return { error: "Invalid tracker type." };
  }

  const { error } = await supabase.from("trackers").insert({
    user_id: user.id,
    name,
    type,
    unit: type === "quantity" ? unit || "count" : type === "duration" ? "minutes" : null,
    color,
    is_productive: isProductive,
  });

  if (error) return { error: error.message };

  revalidatePath("/trackers");
  revalidatePath("/");
}

export async function updateTracker(trackerId: string, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as TrackerType;
  const unit = String(formData.get("unit") ?? "").trim();
  const color = String(formData.get("color") ?? "#22c55e");
  const isProductive = formData.get("is_productive") === "on";

  if (!name) return { error: "Name is required." };
  if (type !== "duration" && type !== "quantity" && type !== "time") {
    return { error: "Invalid tracker type." };
  }

  const { error } = await supabase
    .from("trackers")
    .update({
      name,
      type,
      unit: type === "quantity" ? unit || "count" : type === "duration" ? "minutes" : null,
      color,
      is_productive: isProductive,
    })
    .eq("id", trackerId);

  if (error) return { error: error.message };

  revalidatePath("/trackers");
  revalidatePath("/");
}

export async function setTrackerArchived(trackerId: string, archived: boolean) {
  const supabase = await createClient();
  await supabase
    .from("trackers")
    .update({ is_archived: archived })
    .eq("id", trackerId);

  revalidatePath("/trackers");
  revalidatePath("/");
}

export async function deleteTracker(trackerId: string) {
  const supabase = await createClient();
  await supabase.from("trackers").delete().eq("id", trackerId);

  revalidatePath("/trackers");
  revalidatePath("/");
}
