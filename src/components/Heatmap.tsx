import {
  bucketAlpha,
  hexToRgba,
  minutesToClockLabel,
  monthLabelsForWeeks,
  toDateKey,
  yearWeeks,
} from "@/lib/heatmap";
import type { Tracker } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Heatmap({
  tracker,
  year,
  dailyTotals,
}: {
  tracker: Tracker;
  year: number;
  dailyTotals: Record<string, number>;
}) {
  const weeks = yearWeeks(year);
  const monthLabels = monthLabelsForWeeks(weeks);
  const max = Math.max(0, ...Object.values(dailyTotals));
  const unit = tracker.type === "duration" ? "min" : tracker.unit ?? "";

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col gap-1 w-fit">
        <div className="flex gap-1">
          <div className="w-4 shrink-0" />
          <div className="flex gap-[3px]">
            {weeks.map((week, i) => {
              const label = monthLabels.find((l) => l.weekIndex === i)?.label;
              return (
                <div key={i} className="relative w-3 shrink-0 text-[10px] text-neutral-400">
                  {label && <span className="absolute left-0 whitespace-nowrap">{label}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-1">
          <div className="flex flex-col gap-[3px] w-4 shrink-0 text-[10px] text-neutral-400">
            {DAY_LABELS.map((label) => (
              <span key={label} className="h-3 leading-3">
                {label[0]}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {week.map((date, j) => {
                  if (!date) {
                    return <div key={j} className="h-3 w-3" />;
                  }
                  const key = toDateKey(date);
                  const hasEntry = key in dailyTotals;
                  const value = dailyTotals[key] ?? 0;
                  const alpha = bucketAlpha(value, max);
                  const valueLabel =
                    tracker.type === "time" ? minutesToClockLabel(value) : `${value} ${unit}`;
                  const label = `${date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}: ${hasEntry ? valueLabel : "no entry"}`;

                  return (
                    <div
                      key={j}
                      title={label}
                      className="h-3 w-3 rounded-sm bg-neutral-100 dark:bg-neutral-800"
                      style={
                        alpha ? { backgroundColor: hexToRgba(tracker.color, alpha) } : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
