import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Disconnects Notion and deletes all of the user's graph data: the connection
// (encrypted token), nodes, edges, and sync history. The user account itself
// (Clerk) is untouched. Deleting nodes cascades edges, but we delete explicitly
// for clarity and to clear sync_runs too.
export async function POST() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  for (const table of [
    "edges",
    "sync_runs",
    "nodes",
    "notion_connections",
  ] as const) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq("user_id", user.id);
    if (error) {
      return NextResponse.json(
        { error: `Failed clearing ${table}: ${error.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
