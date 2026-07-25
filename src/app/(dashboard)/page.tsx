import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QuickAddEntry } from "@/components/QuickAddEntry";
import { TrackerSelect } from "@/components/TrackerSelect";
import { Heatmap } from "@/components/Heatmap";
import { EntryLog } from "@/components/EntryLog";
import type { Entry, Tracker } from "@/lib/types";

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthBounds(monthStr: string) {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start, end, year, month };
}

function shiftMonthStr(monthStr: string, delta: number) {
  const { year, month } = monthBounds(monthStr);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tracker?: string; month?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: trackerData } = await supabase
    .from("trackers")
    .select("*")
    .order("created_at", { ascending: true });

  const trackers = (trackerData ?? []) as Tracker[];
  const activeTrackers = trackers.filter((t) => !t.is_archived);
  const selectedTracker =
    trackers.find((t) => t.id === params.tracker) ?? activeTrackers[0] ?? trackers[0];

  const monthStr = params.month ?? currentMonthStr();
  const { start, end, year, month } = monthBounds(monthStr);

  const dailyTotals: Record<string, number> = {};
  if (selectedTracker) {
    const { data: entries } = await supabase
      .from("entries")
      .select("entry_date, value")
      .eq("tracker_id", selectedTracker.id)
      .gte("entry_date", start.toISOString().slice(0, 10))
      .lte("entry_date", end.toISOString().slice(0, 10));

    for (const e of entries ?? []) {
      dailyTotals[e.entry_date] = (dailyTotals[e.entry_date] ?? 0) + Number(e.value);
    }
  }

  let recentEntries: Entry[] = [];
  if (selectedTracker) {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("tracker_id", selectedTracker.id)
      .order("created_at", { ascending: false })
      .limit(10);
    recentEntries = (data ?? []) as Entry[];
  }

  const prevMonthStr = shiftMonthStr(monthStr, -1);
  const nextMonthStr = shiftMonthStr(monthStr, 1);
  const isCurrentMonth = monthStr === currentMonthStr();
  const monthLabel = start.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Log an entry</h1>
        <QuickAddEntry trackers={activeTrackers} />
      </div>

      {trackers.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Create a tracker on the{" "}
          <Link href="/trackers" className="underline">
            Trackers
          </Link>{" "}
          page to see your heatmap.
        </p>
      ) : (
        selectedTracker && (
          <div>
            <div className="flex items-center justify-between mb-4 gap-4">
              <TrackerSelect
                trackers={trackers}
                selectedId={selectedTracker.id}
                month={monthStr}
              />
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/?tracker=${selectedTracker.id}&month=${prevMonthStr}`}>
                  ‹
                </Link>
                <span className="w-32 text-center">{monthLabel}</span>
                {isCurrentMonth ? (
                  <span className="text-neutral-300">›</span>
                ) : (
                  <Link href={`/?tracker=${selectedTracker.id}&month=${nextMonthStr}`}>
                    ›
                  </Link>
                )}
              </div>
            </div>
            <Heatmap
              tracker={selectedTracker}
              year={year}
              month={month}
              dailyTotals={dailyTotals}
            />

            <h2 className="text-sm font-medium text-neutral-500 mt-8 mb-2">
              Recent entries
            </h2>
            <EntryLog tracker={selectedTracker} entries={recentEntries} />
          </div>
        )
      )}
    </div>
  );
}
