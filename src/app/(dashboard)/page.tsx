import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QuickAddEntry } from "@/components/QuickAddEntry";
import { Heatmap } from "@/components/Heatmap";
import { EntryLog } from "@/components/EntryLog";
import { TodayPanel } from "@/components/TodayPanel";
import { DayTimeline } from "@/components/DayTimeline";
import { getTodayInUserTimeZone, getUserTimeZone } from "@/lib/timezone";
import type { Entry, Tracker } from "@/lib/types";

const PRODUCTIVITY_PSEUDO_TRACKER: Pick<Tracker, "type" | "unit" | "color"> = {
  type: "duration",
  unit: null,
  color: "#008300",
};

function shiftDateStr(dateStr: string, delta: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + delta));
  return shifted.toISOString().slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; day?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [tz, todayStr] = await Promise.all([getUserTimeZone(), getTodayInUserTimeZone()]);
  const currentYear = Number(todayStr.slice(0, 4));

  const selectedDay = params.day ?? todayStr;
  const isToday = selectedDay === todayStr;

  function buildHref(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    if (params.year) sp.set("year", params.year);
    if (params.day) sp.set("day", params.day);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) sp.delete(key);
      else sp.set(key, value);
    }
    return `/?${sp.toString()}`;
  }

  const { data: trackerData } = await supabase
    .from("trackers")
    .select("*")
    .order("created_at", { ascending: true });

  const trackers = (trackerData ?? []) as Tracker[];
  const activeTrackers = trackers.filter((t) => !t.is_archived);
  const productiveTrackers = trackers.filter((t) => t.is_productive);

  const selectedYear = Number(params.year) || currentYear;

  const dailyTotals: Record<string, number> = {};
  const productiveIds = productiveTrackers.map((t) => t.id);
  if (productiveIds.length > 0) {
    const { data: entries } = await supabase
      .from("entries")
      .select("entry_date, value")
      .in("tracker_id", productiveIds)
      .gte("entry_date", `${selectedYear}-01-01`)
      .lte("entry_date", `${selectedYear}-12-31`);

    for (const e of entries ?? []) {
      dailyTotals[e.entry_date] = (dailyTotals[e.entry_date] ?? 0) + Number(e.value);
    }
  }

  const dayTotals: Record<string, number> = {};
  const dayLatestTime: Record<string, string> = {};
  let dayEntries: Entry[] = [];
  if (activeTrackers.length > 0) {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .in(
        "tracker_id",
        activeTrackers.map((t) => t.id)
      )
      .eq("entry_date", selectedDay)
      .order("created_at", { ascending: true });

    dayEntries = (data ?? []) as Entry[];
    for (const e of dayEntries) {
      dayTotals[e.tracker_id] = (dayTotals[e.tracker_id] ?? 0) + Number(e.value);
      if (e.start_time) dayLatestTime[e.tracker_id] = e.start_time;
    }
  }

  const isCurrentYear = selectedYear === currentYear;
  const prevDayStr = shiftDateStr(selectedDay, -1);
  const nextDayStr = shiftDateStr(selectedDay, 1);
  const [dayY, dayM, dayD] = selectedDay.split("-").map(Number);
  const dayLabel = new Date(Date.UTC(dayY, dayM - 1, dayD)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1 min-w-0 space-y-8">
        <div>
          <h1 className="text-lg font-semibold mb-4">Log an entry</h1>
          <QuickAddEntry trackers={activeTrackers} />
        </div>

        {activeTrackers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-500">
                {isToday ? "Today" : dayLabel}
              </span>
              <div className="flex items-center gap-3 text-sm">
                <Link href={buildHref({ day: prevDayStr })}>‹</Link>
                {!isToday && (
                  <Link href={buildHref({ day: undefined })} className="text-xs underline">
                    Today
                  </Link>
                )}
                {isToday ? (
                  <span className="text-neutral-300">›</span>
                ) : (
                  <Link href={buildHref({ day: nextDayStr })}>›</Link>
                )}
              </div>
            </div>
            <DayTimeline trackers={activeTrackers} entries={dayEntries} isToday={isToday} />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-sm font-medium text-neutral-500">Productivity</h2>
            <div className="flex items-center gap-3 text-sm">
              <Link href={buildHref({ year: String(selectedYear - 1) })}>‹</Link>
              <span className="w-16 text-center">{selectedYear}</span>
              {isCurrentYear ? (
                <span className="text-neutral-300">›</span>
              ) : (
                <Link href={buildHref({ year: String(selectedYear + 1) })}>›</Link>
              )}
            </div>
          </div>

          {productiveTrackers.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No trackers are marked as productive yet. Edit a tracker on the{" "}
              <Link href="/trackers" className="underline">
                Trackers
              </Link>{" "}
              page and check &ldquo;counts toward productivity&rdquo; (work, studying,
              upskilling) to see how productive you&rsquo;ve been each day.
            </p>
          ) : (
            <Heatmap tracker={PRODUCTIVITY_PSEUDO_TRACKER} year={selectedYear} dailyTotals={dailyTotals} />
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-neutral-500 mb-2">
            Entries {isToday ? "today" : `on ${dayLabel}`}
          </h2>
          <EntryLog
            trackers={activeTrackers}
            entries={[...dayEntries].reverse()}
            tz={tz}
            isToday={isToday}
          />
        </div>
      </div>

      <div className="w-full lg:w-72 shrink-0">
        <TodayPanel
          trackers={activeTrackers}
          totals={dayTotals}
          latestTimes={dayLatestTime}
          dayLabel={dayLabel}
          isToday={isToday}
        />
      </div>
    </div>
  );
}
