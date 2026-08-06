import { createClient } from "@/lib/supabase/server";
import { TodoTable } from "@/components/TodoTable";
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
    <div className="max-w-6xl mx-auto space-y-8">
      <TodoTable todos={todos} />
      <NotificationSettings
        settings={settings}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
      />
    </div>
  );
}
