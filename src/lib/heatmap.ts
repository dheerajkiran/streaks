export function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const BUCKET_ALPHAS = [0.25, 0.45, 0.65, 1];

export function bucketAlpha(value: number, max: number) {
  if (value <= 0 || max <= 0) return null;
  const ratio = value / max;
  if (ratio > 0.75) return BUCKET_ALPHAS[3];
  if (ratio > 0.5) return BUCKET_ALPHAS[2];
  if (ratio > 0.25) return BUCKET_ALPHAS[1];
  return BUCKET_ALPHAS[0];
}

/** Weeks (Sun-Sat) covering the given calendar year, padded with nulls outside it. */
export function yearWeeks(year: number): (Date | null)[][] {
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const lastDay = new Date(Date.UTC(year, 11, 31));
  const totalDays = Math.round((lastDay.getTime() - firstDay.getTime()) / 86_400_000) + 1;
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getUTCDay(); i++) days.push(null);
  for (let d = 0; d < totalDays; d++) {
    days.push(new Date(Date.UTC(year, 0, 1 + d)));
  }
  while (days.length % 7 !== 0) days.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

/** Which week-column index each month's label should sit above. */
export function monthLabelsForWeeks(weeks: (Date | null)[][]) {
  const labels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, i) => {
    const firstDate = week.find((d): d is Date => d !== null);
    if (!firstDate) return;
    const monthIndex = firstDate.getUTCMonth();
    if (monthIndex !== lastMonth) {
      labels.push({
        weekIndex: i,
        label: firstDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      });
      lastMonth = monthIndex;
    }
  });

  return labels;
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Formats minutes-since-midnight (as stored for "time" trackers) as a clock time. */
export function minutesToClockLabel(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.round(totalMinutes % 60);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
