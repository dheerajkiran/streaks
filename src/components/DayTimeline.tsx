import { HOUR_MARKS, hourMarkLabel, rangeSpanMinutes, timeToMinutes } from "@/lib/timeline";
import type { Entry, Tracker } from "@/lib/types";

function formatClock(time: string) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function DayTimeline({
  trackers,
  entries,
  isToday,
}: {
  trackers: Tracker[];
  entries: Entry[];
  isToday: boolean;
}) {
  const trackerById = new Map(trackers.map((t) => [t.id, t]));

  const blocks = entries
    .filter((e) => e.start_time && e.end_time && trackerById.has(e.tracker_id))
    .map((e) => {
      const tracker = trackerById.get(e.tracker_id)!;
      const { start, end } = rangeSpanMinutes(e.start_time!, e.end_time!);
      return { entry: e, tracker, start, end };
    });

  const markers = entries
    .filter((e) => e.start_time && !e.end_time && trackerById.has(e.tracker_id))
    .map((e) => {
      const tracker = trackerById.get(e.tracker_id)!;
      return { entry: e, tracker, at: timeToMinutes(e.start_time!) };
    });

  const legendTrackers = [...trackerById.values()].filter(
    (t) =>
      blocks.some((b) => b.tracker.id === t.id) || markers.some((m) => m.tracker.id === t.id)
  );

  if (blocks.length === 0 && markers.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-sm font-medium text-neutral-500 mb-1">Timeline</h2>
        <p className="text-sm text-neutral-400">
          No timed activity {isToday ? "yet" : "on this day"}. Log a duration as a
          start&ndash;end time (or a time-of-day tracker) to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
      <h2 className="text-sm font-medium text-neutral-500 mb-4">Timeline</h2>

      <div className="relative h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {HOUR_MARKS.slice(1, -1).map((hour) => (
          <div
            key={hour}
            className="absolute top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700"
            style={{ left: `${(hour / 24) * 100}%` }}
          />
        ))}
        {blocks.map(({ entry, tracker, start, end }) => (
          <div
            key={entry.id}
            title={`${tracker.name}: ${formatClock(entry.start_time!)}–${formatClock(entry.end_time!)}`}
            className="absolute top-0.5 bottom-0.5 rounded-[4px]"
            style={{
              left: `${(start / 1440) * 100}%`,
              width: `${Math.max(0.4, ((end - start) / 1440) * 100)}%`,
              backgroundColor: tracker.color,
            }}
          />
        ))}
      </div>

      {markers.length > 0 && (
        <div className="relative h-4 mt-1">
          {markers.map(({ entry, tracker, at }) => (
            <div
              key={entry.id}
              title={`${tracker.name}: ${formatClock(entry.start_time!)}`}
              className="absolute top-0 h-3 w-3 -ml-1.5 rounded-full ring-2 ring-white dark:ring-neutral-950"
              style={{ left: `${(at / 1440) * 100}%`, backgroundColor: tracker.color }}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between text-[10px] text-neutral-400 mt-2 px-0.5">
        {HOUR_MARKS.map((hour) => (
          <span key={hour}>{hourMarkLabel(hour)}</span>
        ))}
      </div>

      {legendTrackers.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-neutral-500">
          {legendTrackers.map((tracker) => (
            <span key={tracker.id} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: tracker.color }}
              />
              {tracker.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
