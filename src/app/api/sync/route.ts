import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import type { syncWorkspace } from "@/trigger/sync";
import { getOrCreateCurrentUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Kicks off a background sync via Trigger.dev. We pre-create a queued sync_run
// so the client can poll /api/sync/status?id=... for progress, then return its id.
export async function POST() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: connection } = await supabaseAdmin
    .from("notion_connections")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!connection) {
    return NextResponse.json(
      { error: "No Notion workspace connected" },
      { status: 400 },
    );
  }

  const { data: run, error } = await supabaseAdmin
    .from("sync_runs")
    .insert({
      user_id: user.id,
      connection_id: connection.id,
      status: "queued",
      kind: "initial",
    })
    .select("id")
    .single();
  if (error || !run) {
    return NextResponse.json(
      { error: error?.message ?? "Could not start sync" },
      { status: 500 },
    );
  }

  try {
    await tasks.trigger<typeof syncWorkspace>("sync-workspace", {
      userId: user.id,
      syncRunId: run.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not queue sync";
    await supabaseAdmin
      .from("sync_runs")
      .update({ status: "failed", error: message })
      .eq("id", run.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, runId: run.id });
}
