import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GraphData, NodeType, EdgeType } from "@/types/graph";

// Returns the signed-in user's graph as { nodes, links } for the renderer.
export async function GET() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [{ data: nodes, error: nErr }, { data: edges, error: eErr }] =
    await Promise.all([
      supabaseAdmin
        .from("nodes")
        .select("id, title, type, url, degree")
        .eq("user_id", user.id),
      supabaseAdmin
        .from("edges")
        .select("source_node_id, target_node_id, type")
        .eq("user_id", user.id),
    ]);

  if (nErr || eErr) {
    return NextResponse.json(
      { error: nErr?.message ?? eErr?.message },
      { status: 500 },
    );
  }

  const graph: GraphData = {
    nodes: (nodes ?? []).map((n) => ({
      id: n.id,
      title: n.title ?? "Untitled",
      type: n.type as NodeType,
      url: n.url,
      degree: n.degree,
    })),
    links: (edges ?? []).map((e) => ({
      source: e.source_node_id,
      target: e.target_node_id,
      type: e.type as EdgeType,
    })),
  };

  return NextResponse.json(graph);
}
