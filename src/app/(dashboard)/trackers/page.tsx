import { createClient } from "@/lib/supabase/server";
import { TrackerForm } from "@/components/TrackerForm";
import { TrackerRow } from "@/components/TrackerRow";
import type { Tracker } from "@/lib/types";

export default async function TrackersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trackers")
    .select("*")
    .order("created_at", { ascending: true });

  const trackers = (data ?? []) as Tracker[];
  const active = trackers.filter((t) => !t.is_archived);
  const archived = trackers.filter((t) => t.is_archived);

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">New tracker</h1>
        <TrackerForm />
      </div>

      <TrackerList title="Active" trackers={active} />
      {archived.length > 0 && <TrackerList title="Archived" trackers={archived} />}
    </div>
  );
}

function TrackerList({ title, trackers }: { title: string; trackers: Tracker[] }) {
  if (trackers.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-2">{title}</h2>
        <p className="text-sm text-neutral-400">No trackers yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-neutral-500 mb-2">{title}</h2>
      <ul className="space-y-2">
        {trackers.map((tracker) => (
          <TrackerRow key={tracker.id} tracker={tracker} />
        ))}
      </ul>
    </div>
  );
}
