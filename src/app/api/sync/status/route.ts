import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Reports the status of a sync run (polled by the client during a background sync).
export async function GET(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing run id" }, { status: 400 });
  }

  const { data: run, error } = await supabaseAdmin
    .from("sync_runs")
    .select("status, stats, error")
    .eq("id", id)
    .eq("user_id", user.id) // scope to the owner
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json(run);
}
