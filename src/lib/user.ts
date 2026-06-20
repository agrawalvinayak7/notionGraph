import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

/**
 * Ensures a `users` row exists for the currently signed-in Clerk user, keyed by
 * `clerk_user_id`. Called from the authed app layout so every protected page can
 * rely on the row existing. Returns the row, or null if nobody is signed in.
 *
 * This is the "first-login upsert" approach from docs/ROADMAP.md (simpler than a
 * Clerk webhook, no public URL needed for local dev).
 */
export async function getOrCreateCurrentUser(): Promise<UserRow | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(
      { clerk_user_id: clerkUser.id, email },
      { onConflict: "clerk_user_id" },
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`);
  }
  return data;
}
