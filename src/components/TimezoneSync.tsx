"use client";

import { useEffect } from "react";
import { saveTimezone } from "@/app/actions/settings";

export function TimezoneSync() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cookieTz = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tz="))
      ?.split("=")[1];

    if (cookieTz !== tz) {
      document.cookie = `tz=${tz}; path=/; max-age=31536000; SameSite=Lax`;
      saveTimezone(tz);
      if (!sessionStorage.getItem("tz-synced")) {
        sessionStorage.setItem("tz-synced", "1");
        window.location.reload();
      }
    }
  }, []);

  return null;
}
