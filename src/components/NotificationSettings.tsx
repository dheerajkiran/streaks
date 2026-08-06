"use client";

import { useEffect, useState } from "react";
import { removeSubscription, saveReminderSettings, saveSubscription } from "@/app/actions/settings";
import type { NotificationSettings as NotificationSettingsType } from "@/lib/types";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function formatHour(h: number) {
  const suffix = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${suffix}`;
}

export function NotificationSettings({
  settings,
  vapidPublicKey,
}: {
  settings: NotificationSettingsType | null;
  vapidPublicKey: string;
}) {
  const [supported, setSupported] = useState(true);
  const [checking, setChecking] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(settings?.enabled ?? true);
  const [reminderHour, setReminderHour] = useState(settings?.reminder_hour ?? 18);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      setChecking(false);
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  async function enablePush() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notification permission was not granted.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = sub.toJSON();
      const result = await saveSubscription({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSubscribed(true);
    } catch {
      setError("Couldn't enable reminders on this device.");
    } finally {
      setBusy(false);
    }
  }

  async function disablePush() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removeSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch {
      setError("Couldn't disable reminders on this device.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-sm font-medium text-neutral-500 mb-1">Reminders</h2>
        <p className="text-sm text-neutral-400">
          Push notifications aren&rsquo;t supported in this browser. On iPhone/iPad, add
          this site to your Home Screen first (Share &rarr; Add to Home Screen), then
          open it from there and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
      <h2 className="text-sm font-medium text-neutral-500">Reminders</h2>

      {checking ? (
        <p className="text-sm text-neutral-400">Checking...</p>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={subscribed ? disablePush : enablePush}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
              subscribed
                ? "border border-neutral-300 dark:border-neutral-700 text-neutral-500"
                : "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900"
            }`}
          >
            {subscribed ? "Disable on this device" : "Enable on this device"}
          </button>
          {subscribed && <span className="text-xs text-neutral-400">Enabled here</span>}
        </div>
      )}

      <form
        action={async (formData) => {
          setError(null);
          const result = await saveReminderSettings(formData);
          if (result?.error) setError(result.error);
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Remind me if tasks are still open
        </label>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Around</label>
          <select
            name="reminder_hour"
            value={reminderHour}
            onChange={(e) => setReminderHour(Number(e.target.value))}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {formatHour(h)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
        >
          Save
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
