import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrCreateCurrentUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ConfirmAction } from "@/components/settings/confirm-action";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type Stats = { nodes?: number; edges?: number };

export default async function SettingsPage() {
  const user = await getOrCreateCurrentUser();

  const [{ data: connection }, { count: nodeCount }, { data: runs }] =
    await Promise.all([
      supabaseAdmin
        .from("notion_connections")
        .select("workspace_name, last_synced_at")
        .eq("user_id", user?.id ?? "")
        .maybeSingle(),
      supabaseAdmin
        .from("nodes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user?.id ?? ""),
      supabaseAdmin
        .from("sync_runs")
        .select("id, status, kind, stats, started_at")
        .eq("user_id", user?.id ?? "")
        .order("started_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <div className="bg-background min-h-full px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/graph"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to graph
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your Notion connection and data.
        </p>

        {/* Connection */}
        <section className="border-border bg-surface/60 mt-8 rounded-xl border p-5">
          <h2 className="text-sm font-medium">Notion connection</h2>
          {connection ? (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Workspace</span>
                <span className="font-medium">
                  {connection.workspace_name ?? "Connected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last synced</span>
                <span className="font-mono text-xs">
                  {timeAgo(connection.last_synced_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nodes in graph</span>
                <span className="font-mono text-xs">{nodeCount ?? 0}</span>
              </div>
              <Link
                href="/graph"
                className={cn(buttonVariants({ size: "sm" }), "mt-2")}
              >
                <RefreshCw className="size-3.5" />
                Go to graph to re-sync
              </Link>
            </div>
          ) : (
            <div className="mt-3 text-sm">
              <p className="text-muted-foreground">
                No Notion workspace connected.
              </p>
              <Link
                href="/connect"
                className={cn(buttonVariants({ size: "sm" }), "mt-3")}
              >
                Connect Notion
              </Link>
            </div>
          )}
        </section>

        {/* Sync history */}
        <section className="border-border bg-surface/60 mt-6 rounded-xl border p-5">
          <h2 className="text-sm font-medium">Recent syncs</h2>
          {runs && runs.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {runs.map((r) => {
                const stats = (r.stats ?? {}) as Stats;
                const ok = r.status === "success";
                const failed = r.status === "failed";
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {ok ? (
                        <CheckCircle2 className="text-success size-4" />
                      ) : failed ? (
                        <XCircle className="text-destructive size-4" />
                      ) : (
                        <RefreshCw className="text-muted-foreground size-4" />
                      )}
                      <span className="capitalize">{r.kind}</span>
                      <span className="text-muted-foreground">{r.status}</span>
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {ok && stats.nodes != null
                        ? `${stats.nodes} nodes · ${stats.edges} links · `
                        : ""}
                      {timeAgo(r.started_at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm">No syncs yet.</p>
          )}
        </section>

        {/* Account */}
        <section className="border-border bg-surface/60 mt-6 rounded-xl border p-5">
          <h2 className="text-sm font-medium">Account</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {user?.email} — manage your profile and sign out from the avatar
            menu in the graph header.
          </p>
        </section>

        {/* Danger zone */}
        <section className="border-destructive/30 bg-destructive/5 mt-6 rounded-xl border p-5">
          <h2 className="text-destructive text-sm font-medium">Danger zone</h2>
          <p className="text-muted-foreground mt-1 mb-3 text-sm">
            Disconnect Notion and permanently delete your graph, sync history,
            and stored token. Your account stays. This cannot be undone.
          </p>
          <ConfirmAction
            label="Disconnect & delete my data"
            confirmText="Permanently delete everything?"
            successText="Disconnected and cleared your data."
            endpoint="/api/notion/disconnect"
            redirectTo="/connect"
          />
        </section>
      </div>
    </div>
  );
}
