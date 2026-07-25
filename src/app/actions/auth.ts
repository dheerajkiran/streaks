"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type SendMagicLinkState = { status: "idle" | "sent" | "error"; message?: string };

export async function sendMagicLink(
  _prevState: SendMagicLinkState,
  formData: FormData
): Promise<SendMagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { status: "error", message: "Enter an email address." };
  }

  const supabase = await createClient();
  const originHeader = (await headers()).get("origin");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${originHeader}/auth/confirm`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "sent", message: `Check ${email} for a login link.` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
