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

/** Weeks (Sun-Sat) covering the given month, padded with nulls outside the month. */
export function monthWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getUTCDay(); i++) days.push(null);
  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    days.push(new Date(Date.UTC(year, month - 1, d)));
  }
  while (days.length % 7 !== 0) days.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
