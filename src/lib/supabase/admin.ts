import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * ⚠️ This bypasses Row-Level Security — it has full database access. Only ever
 * import it in server code (route handlers, server actions, Trigger.dev jobs),
 * never in a client component. The `server-only` import above makes a build fail
 * loudly if that rule is broken.
 *
 * Because it bypasses RLS, every insert/update MUST set `user_id` correctly —
 * RLS is the safety net, correct `user_id` is the contract (see docs/SCHEMA.md §4).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase admin env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
