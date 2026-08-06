import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for background jobs with no user session (the
 * reminder cron). Bypasses row-level security - never expose to the client
 * or use outside of trusted, server-only, secret-protected code paths.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
