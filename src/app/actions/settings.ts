"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveTimezone(tz: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notification_settings")
    .upsert({ user_id: user.id, timezone: tz }, { onConflict: "user_id" });
}

export async function saveSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { error: error.message };
}

export async function removeSubscription(endpoint: string) {
  const supabase = await createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function saveReminderSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const enabled = formData.get("enabled") === "on";
  const reminderHour = Number(formData.get("reminder_hour"));
  if (!Number.isInteger(reminderHour) || reminderHour < 0 || reminderHour > 23) {
    return { error: "Invalid reminder hour." };
  }

  const { error } = await supabase.from("notification_settings").upsert(
    { user_id: user.id, enabled, reminder_hour: reminderHour },
    { onConflict: "user_id" }
  );
  if (error) return { error: error.message };

  revalidatePath("/todos");
}
