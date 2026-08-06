"use server";

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
