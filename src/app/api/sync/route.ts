import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/user";
import { syncWorkspaceForUser } from "@/lib/sync";

// Runs the sync inline — fast and simple, no background worker needed locally.
// For very large workspaces in production we can switch to the Trigger.dev job
// in src/trigger/sync.ts (avoids the serverless timeout); revisit at deploy.
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
