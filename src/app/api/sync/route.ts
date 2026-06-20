import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/user";
import { syncWorkspaceForUser } from "@/lib/sync";

// Runs a full sync of the user's Notion workspace into nodes + edges.
// Synchronous for now (fine for typical workspaces); a Trigger.dev background
// version is the Phase 3 follow-up for large workspaces.
export const maxDuration = 300;

export async function POST() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const stats = await syncWorkspaceForUser(user.id);
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("Sync failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
