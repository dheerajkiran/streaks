import type { Tracker } from "@/lib/types";

function formatDuration(minutes: number) {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function TodayPanel({
  trackers,
  totals,
  latestTimes,
}: {
  trackers: Tracker[];
  totals: Record<string, number>;
  latestTimes: Record<string, string>;
}) {
  const durationTrackers = trackers.filter((t) => t.type === "duration");
  const quantityTrackers = trackers.filter((t) => t.type === "quantity");
  const timeTrackers = trackers.filter((t) => t.type === "time");

  const totalMinutesToday = durationTrackers.reduce(
    (sum, t) => sum + (totals[t.id] ?? 0),
    0
  );
  const maxDuration = Math.max(1, ...durationTrackers.map((t) => totals[t.id] ?? 0));

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (trackers.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-sm font-medium text-neutral-500">Today</h2>
        <p className="text-sm text-neutral-400 mt-2">
          Create a tracker to see today&rsquo;s progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-6">
      <div>
        <h2 className="text-sm font-medium text-neutral-500">Today</h2>
        <p className="text-xs text-neutral-400">{todayLabel}</p>
      </div>

      {durationTrackers.length > 0 && (
        <div>
          <div className="text-2xl font-semibold">{formatDuration(totalMinutesToday)}</div>
          <p className="text-xs text-neutral-400 mb-4">tracked today</p>

          <ul className="space-y-3">
            {[...durationTrackers]
              .sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0))
              .map((tracker) => {
                const value = totals[tracker.id] ?? 0;
                const pct = Math.round((value / maxDuration) * 100);
                return (
                  <li key={tracker.id}>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-neutral-500">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: tracker.color }}
                        />
                        {tracker.name}
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatDuration(value)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: tracker.color }}
                        title={`${tracker.name}: ${formatDuration(value)}`}
                      />
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {(quantityTrackers.length > 0 || timeTrackers.length > 0) && (
        <div>
          <p className="text-xs text-neutral-400 mb-2">Also today</p>
          <div className="grid grid-cols-2 gap-2">
            {quantityTrackers.map((tracker) => (
              <div
                key={tracker.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2"
              >
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: tracker.color }}
                  />
                  {tracker.name}
                </div>
                <div className="text-lg font-semibold mt-0.5">
                  {totals[tracker.id] ?? 0}
                  <span className="text-xs font-normal text-neutral-400 ml-1">
                    {tracker.unit}
                  </span>
                </div>
              </div>
            ))}
            {timeTrackers.map((tracker) => (
              <div
                key={tracker.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2"
              >
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: tracker.color }}
                  />
                  {tracker.name}
                </div>
                <div className="text-lg font-semibold mt-0.5">
                  {tracker.id in latestTimes ? formatTime(latestTimes[tracker.id]) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
