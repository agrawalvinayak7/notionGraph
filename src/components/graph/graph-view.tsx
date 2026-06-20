"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { GraphCanvas } from "./graph-canvas";
import type { GraphData } from "@/types/graph";
import type { SyncStats } from "@/lib/sync";

async function fetchGraph(): Promise<GraphData> {
  const res = await fetch("/api/graph", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load graph");
  return res.json();
}

async function runSyncRequest(): Promise<{ stats: SyncStats }> {
  const res = await fetch("/api/sync", { method: "POST" });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Sync failed");
  return body;
}

export function GraphView() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["graph"],
    queryFn: fetchGraph,
  });

  const sync = useMutation({
    mutationFn: runSyncRequest,
    onMutate: () => toast.loading("Syncing your Notion…", { id: "sync" }),
    onSuccess: ({ stats }) => {
      toast.success(
        `Synced ${stats.nodes} pages and ${stats.edges} connections.`,
        { id: "sync" },
      );
      queryClient.invalidateQueries({ queryKey: ["graph"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Sync failed", {
        id: "sync",
      }),
  });

  const syncing = sync.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  const isEmpty = !data || data.nodes.length === 0;

  return (
    <div className="bg-observatory relative flex-1 overflow-hidden">
      {isEmpty ? (
        <div className="animate-rise absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <Sparkles className="text-primary size-7" />
          <h1 className="mt-4 font-serif text-3xl tracking-tight">
            Your graph is empty
          </h1>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Sync your connected Notion workspace to build the graph from your
            pages, databases, and the links between them.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={() => sync.mutate()}
              disabled={syncing}
              className="glow-primary"
            >
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {syncing ? "Syncing…" : "Sync my Notion"}
            </Button>
            <Link
              href="/connect"
              className={buttonVariants({ variant: "ghost" })}
            >
              Connection settings
            </Link>
          </div>
        </div>
      ) : (
        <>
          <GraphCanvas data={data} />
          {/* Floating toolbar */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="bg-surface/80 text-muted-foreground border-border rounded-md border px-2.5 py-1 font-mono text-xs backdrop-blur">
              {data.nodes.length} nodes · {data.links.length} links
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => sync.mutate()}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              {syncing ? "Syncing…" : "Re-sync"}
            </Button>
          </div>
          <div className="bg-surface/70 text-muted-foreground border-border pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border px-3 py-1 text-xs backdrop-blur">
            Scroll to zoom · drag to pan · click a node to open in Notion
          </div>
        </>
      )}
    </div>
  );
}
