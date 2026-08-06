import { createClient } from "@/lib/supabase/server";
import { TodoList } from "@/components/TodoList";
import type { Todo } from "@/lib/types";

export default async function TodosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: true });

  const todos = (data ?? []) as Todo[];

  return (
    <div className="max-w-2xl mx-auto">
      <TodoList todos={todos} />
    </div>
  );
}
