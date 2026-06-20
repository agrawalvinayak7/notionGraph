import "server-only";
import { randomUUID } from "node:crypto";
import { Client } from "@notionhq/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import type { Database } from "@/lib/supabase/database.types";

type NodeInsert = Database["public"]["Tables"]["nodes"]["Insert"];
type EdgeInsert = Database["public"]["Tables"]["edges"]["Insert"];

// A loose view of the Notion objects we care about (the SDK's full types are a
// large union; we narrow to the fields we use).
type RichText = { plain_text: string };
type NotionProperty = {
  type: string;
  title?: RichText[];
  relation?: { id: string }[];
};
type NotionObject = {
  object: "page" | "database";
  id: string;
  url?: string;
  parent?: {
    type: string;
    page_id?: string;
    database_id?: string;
  };
  properties?: Record<string, NotionProperty>;
  title?: RichText[];
};

function richTextToPlain(rt: RichText[] | undefined): string {
  return (rt ?? [])
    .map((t) => t.plain_text)
    .join("")
    .trim();
}

function getTitle(obj: NotionObject): string {
  if (obj.object === "database") {
    return richTextToPlain(obj.title) || "Untitled database";
  }
  for (const prop of Object.values(obj.properties ?? {})) {
    if (prop.type === "title") return richTextToPlain(prop.title) || "Untitled";
  }
  return "Untitled";
}

function getType(obj: NotionObject): "page" | "database" | "row" {
  if (obj.object === "database") return "database";
  if (obj.parent?.type === "database_id") return "row";
  return "page";
}

function getParentId(obj: NotionObject): string | null {
  const p = obj.parent;
  if (!p) return null;
  if (p.type === "page_id") return p.page_id ?? null;
  if (p.type === "database_id") return p.database_id ?? null;
  return null; // workspace or block parent — no edge
}

function getRelationTargets(obj: NotionObject): string[] {
  const ids: string[] = [];
  for (const prop of Object.values(obj.properties ?? {})) {
    if (prop.type === "relation" && prop.relation) {
      for (const r of prop.relation) ids.push(r.id);
    }
  }
  return ids;
}

/** Page through Notion `search` to get every page + database the integration can see. */
async function fetchAllObjects(notion: Client): Promise<NotionObject[]> {
  const objects: NotionObject[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res = await notion.search({
      page_size: 100,
      start_cursor: cursor,
    });
    for (const r of res.results) {
      // Skip "partial" objects that lack the fields we need.
      if ("parent" in r || "properties" in r || "title" in r) {
        objects.push(r as unknown as NotionObject);
      }
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return objects;
}

const CHUNK = 500;

async function insertNodes(rows: NodeInsert[]): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabaseAdmin
      .from("nodes")
      .insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error(`Insert nodes failed: ${error.message}`);
  }
}

async function insertEdges(rows: EdgeInsert[]): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabaseAdmin
      .from("edges")
      .insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error(`Insert edges failed: ${error.message}`);
  }
}

export type SyncStats = {
  pages: number;
  databases: number;
  rows: number;
  nodes: number;
  edges: number;
};

/**
 * Full re-sync of a user's connected Notion workspace into nodes + edges.
 * Builds the graph from parent nesting (child edges) and relation properties
 * (relation edges). Inline @mention edges are a later enhancement.
 */
export async function syncWorkspaceForUser(userId: string): Promise<SyncStats> {
  // 1) Load + decrypt the user's Notion token.
  const { data: connection, error: connErr } = await supabaseAdmin
    .from("notion_connections")
    .select("id, access_token_encrypted")
    .eq("user_id", userId)
    .maybeSingle();
  if (connErr) throw new Error(connErr.message);
  if (!connection) throw new Error("No Notion connection for this user");

  const token = decrypt(connection.access_token_encrypted);
  const notion = new Client({ auth: token });

  // 2) Record a running sync.
  const { data: run } = await supabaseAdmin
    .from("sync_runs")
    .insert({
      user_id: userId,
      connection_id: connection.id,
      status: "running",
      kind: "initial",
    })
    .select("id")
    .single();

  try {
    // 3) Fetch everything.
    const objects = await fetchAllObjects(notion);

    // 4) Build nodes with pre-generated UUIDs so edges can reference them.
    const idByNotionId = new Map<string, string>();
    const nodes: NodeInsert[] = [];
    const stats: SyncStats = {
      pages: 0,
      databases: 0,
      rows: 0,
      nodes: 0,
      edges: 0,
    };

    for (const obj of objects) {
      if (idByNotionId.has(obj.id)) continue;
      const uuid = randomUUID();
      idByNotionId.set(obj.id, uuid);
      const type = getType(obj);
      if (type === "page") stats.pages++;
      else if (type === "database") stats.databases++;
      else stats.rows++;
      nodes.push({
        id: uuid,
        user_id: userId,
        notion_id: obj.id,
        type,
        title: getTitle(obj),
        url: obj.url ?? null,
        parent_notion_id: getParentId(obj),
      });
    }

    // 5) Build edges (deduped, no self-loops, both endpoints must exist).
    const degree = new Map<string, number>();
    const seen = new Set<string>();
    const edges: EdgeInsert[] = [];
    const addEdge = (
      srcNotion: string,
      tgtNotion: string,
      type: "child" | "relation",
    ) => {
      const source = idByNotionId.get(srcNotion);
      const target = idByNotionId.get(tgtNotion);
      if (!source || !target || source === target) return;
      const key = `${source}|${target}|${type}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({
        user_id: userId,
        source_node_id: source,
        target_node_id: target,
        type,
      });
      degree.set(source, (degree.get(source) ?? 0) + 1);
      degree.set(target, (degree.get(target) ?? 0) + 1);
    };

    for (const obj of objects) {
      const parentId = getParentId(obj);
      if (parentId) addEdge(parentId, obj.id, "child");
      for (const targetId of getRelationTargets(obj)) {
        addEdge(obj.id, targetId, "relation");
      }
    }

    // Apply degree to nodes (drives node size in the graph).
    for (const node of nodes) {
      if (node.id) node.degree = degree.get(node.id) ?? 0;
    }

    // 6) Replace the user's graph (full re-sync). Deleting nodes cascades edges.
    await supabaseAdmin.from("nodes").delete().eq("user_id", userId);
    await insertNodes(nodes);
    await insertEdges(edges);

    stats.nodes = nodes.length;
    stats.edges = edges.length;

    // 7) Mark the run + connection done.
    if (run) {
      await supabaseAdmin
        .from("sync_runs")
        .update({
          status: "success",
          stats,
          finished_at: new Date().toISOString(),
        })
        .eq("id", run.id);
    }
    await supabaseAdmin
      .from("notion_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", connection.id);

    return stats;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (run) {
      await supabaseAdmin
        .from("sync_runs")
        .update({
          status: "failed",
          error: message,
          finished_at: new Date().toISOString(),
        })
        .eq("id", run.id);
    }
    throw err;
  }
}
