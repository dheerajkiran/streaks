import { bucketAlpha, hexToRgba, monthWeeks, toDateKey } from "@/lib/heatmap";
import type { Tracker } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Heatmap({
  tracker,
  year,
  month,
  dailyTotals,
}: {
  tracker: Tracker;
  year: number;
  month: number;
  dailyTotals: Record<string, number>;
}) {
  const weeks = monthWeeks(year, month);
  const max = Math.max(0, ...Object.values(dailyTotals));
  const unit = tracker.type === "duration" ? "min" : tracker.unit ?? "";

  return (
    <div className="inline-flex gap-2">
      <div className="flex flex-col gap-1 pt-5 text-[10px] text-neutral-400">
        {DAY_LABELS.map((label) => (
          <span key={label} className="h-4 leading-4">
            {label[0]}
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((date, j) => {
              if (!date) {
                return <div key={j} className="h-4 w-4" />;
              }
              const key = toDateKey(date);
              const value = dailyTotals[key] ?? 0;
              const alpha = bucketAlpha(value, max);
              const label = `${date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}: ${value > 0 ? `${value} ${unit}` : "no entry"}`;

              return (
                <div
                  key={j}
                  title={label}
                  className="h-4 w-4 rounded-sm bg-neutral-100 dark:bg-neutral-800"
                  style={alpha ? { backgroundColor: hexToRgba(tracker.color, alpha) } : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
