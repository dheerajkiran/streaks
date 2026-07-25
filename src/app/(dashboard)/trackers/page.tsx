import { createClient } from "@/lib/supabase/server";
import { TrackerForm } from "@/components/TrackerForm";
import { setTrackerArchived, deleteTracker } from "@/app/actions/trackers";
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
    <div className="max-w-lg space-y-8">
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
          <li
            key={tracker.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: tracker.color }}
              />
              <span className="text-sm font-medium">{tracker.name}</span>
              <span className="text-xs text-neutral-400">
                {tracker.type === "duration" ? "minutes" : tracker.unit}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <form action={setTrackerArchived.bind(null, tracker.id, !tracker.is_archived)}>
                <button type="submit" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
                  {tracker.is_archived ? "Restore" : "Archive"}
                </button>
              </form>
              <form action={deleteTracker.bind(null, tracker.id)}>
                <button type="submit" className="text-red-500 hover:text-red-700">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
