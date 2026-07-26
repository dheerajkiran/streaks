import { cookies } from "next/headers";

export async function getUserTimeZone() {
  const store = await cookies();
  const tz = store.get("tz")?.value;
  if (!tz) return "UTC";

  try {
    // Throws if tz isn't a valid IANA zone name.
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/** Today's date (YYYY-MM-DD) in the visitor's actual timezone, not the server's. */
export async function getTodayInUserTimeZone() {
  const tz = await getUserTimeZone();
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}
