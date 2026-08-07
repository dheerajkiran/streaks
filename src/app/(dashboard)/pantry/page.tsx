import { createClient } from "@/lib/supabase/server";
import { PantryTable } from "@/components/PantryTable";
import type { PantryItem } from "@/lib/types";

export default async function PantryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pantry_items")
    .select("*")
    .order("created_at", { ascending: true });

  const items = (data ?? []) as PantryItem[];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PantryTable items={items} />
    </div>
  );
}
