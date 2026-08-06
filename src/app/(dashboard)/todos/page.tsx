import { createClient } from "@/lib/supabase/server";
import { TodoList } from "@/components/TodoList";
import { NotificationSettings } from "@/components/NotificationSettings";
import type { NotificationSettings as NotificationSettingsType, Todo } from "@/lib/types";

export default async function TodosPage() {
  const supabase = await createClient();
  const [{ data: todoData }, { data: settingsData }] = await Promise.all([
    supabase.from("todos").select("*").order("created_at", { ascending: true }),
    supabase.from("notification_settings").select("*").maybeSingle(),
  ]);

  const todos = (todoData ?? []) as Todo[];
  const settings = (settingsData ?? null) as NotificationSettingsType | null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <TodoList todos={todos} />
      <NotificationSettings
        settings={settings}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
      />
    </div>
  );
}
