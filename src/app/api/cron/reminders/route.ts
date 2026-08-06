import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }
  webpush.setVapidDetails("mailto:admin@streaks.app", vapidPublicKey, vapidPrivateKey);

  const supabase = createAdminClient();
  const now = new Date();

  const { data: settingsRows } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("enabled", true);

  let notified = 0;

  for (const settings of settingsRows ?? []) {
    const tz = settings.timezone || "UTC";
    const localHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        hour12: false,
      }).format(now)
    );
    const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);

    if (localHour !== settings.reminder_hour) continue;
    if (settings.last_reminded_date === localDate) continue;

    const { data: openTodos } = await supabase
      .from("todos")
      .select("id")
      .eq("user_id", settings.user_id)
      .eq("is_done", false)
      .lte("due_date", localDate);

    const count = openTodos?.length ?? 0;
    if (count === 0) continue;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", settings.user_id);

    if (!subs || subs.length === 0) continue;

    const payload = JSON.stringify({
      title: "Streaks",
      body: `You have ${count} task${count === 1 ? "" : "s"} left today.`,
      url: "/todos",
    });

    let sentAny = false;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sentAny = true;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    if (sentAny) {
      await supabase
        .from("notification_settings")
        .update({ last_reminded_date: localDate })
        .eq("user_id", settings.user_id);
      notified++;
    }
  }

  return NextResponse.json({ ok: true, notified });
}
