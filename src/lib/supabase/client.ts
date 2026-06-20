import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client using the ANON key (respects Row-Level Security).
 *
 * Safe to use in client components. Note: to read a signed-in user's own rows
 * under RLS, this client needs the Clerk session token wired in (Clerk ↔ Supabase
 * third-party auth) — that's a Phase 2 task (see docs/SCHEMA.md §4). Until then,
 * user-scoped reads go through the server using `supabaseAdmin`.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, anonKey);
}
