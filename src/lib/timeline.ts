export function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Start/end minutes for a timeline block, clipped to the 0-1440 (single day) window. */
export function rangeSpanMinutes(start: string, end: string) {
  const s = timeToMinutes(start);
  let e = timeToMinutes(end);
  if (e <= s) e = 24 * 60;
  return { start: s, end: Math.min(e, 24 * 60) };
}

export const HOUR_MARKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

export function hourMarkLabel(hour: number) {
  const h = hour % 24;
  const suffix = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${suffix}`;
}
