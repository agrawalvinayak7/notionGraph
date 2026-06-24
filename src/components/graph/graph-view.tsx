"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { GraphCanvas, type GraphCanvasHandle } from "./graph-canvas";
import { NodePanel } from "./node-panel";
import { GraphSearch } from "./graph-search";
import {
  GraphFilters,
  DEFAULT_FILTERS,
  type GraphFilterState,
} from "./graph-filters";
import type { GraphData } from "@/types/graph";
import type { SyncStats } from "@/lib/sync";

async function fetchGraph(): Promise<GraphData> {
  const res = await fetch("/api/graph", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load graph");
  return res.json();
}
async function runSyncRequest(): Promise<SyncStats> {
  const res = await fetch("/api/sync", { method: "POST" });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Sync failed");
  return body.stats as SyncStats;
}

type LinkEnd = string | { id: string };
const endId = (e: LinkEnd): string => (typeof e === "object" ? e.id : e);

export function GraphView() {
  const queryClient = useQueryClient();
  const canvasRef = useRef<GraphCanvasHandle>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<GraphFilterState>(DEFAULT_FILTERS);

  const { data, isLoading } = useQuery({
    queryKey: ["graph"],
    queryFn: fetchGraph,
  });

  const sync = useMutation({
    mutationFn: runSyncRequest,
    onMutate: () => toast.loading("Syncing your Notion…", { id: "sync" }),
    onSuccess: (stats) => {
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

  // ⌘K / Ctrl+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Apply filters → the data the graph actually renders.
  const filtered = useMemo<GraphData>(() => {
    if (!data) return { nodes: [], links: [] };
    const visible = new Set<string>();
    const nodes = data.nodes.filter((n) => {
      const ok =
        filters.types[n.type] && !(filters.hideOrphans && n.degree === 0);
      if (ok) visible.add(n.id);
      return ok;
    });
    const links = data.links.filter(
      (l) =>
        visible.has(endId(l.source as LinkEnd)) &&
        visible.has(endId(l.target as LinkEnd)),
    );
    return { nodes, links };
  }, [data, filters]);

  const selectedNode = selectedId
    ? (filtered.nodes.find((n) => n.id === selectedId) ?? null)
    : null;

  const focusNode = (id: string) => {
    setSelectedId(id);
    canvasRef.current?.focusNode(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0b0d12]">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  const isEmpty = !data || data.nodes.length === 0;

  if (isEmpty) {
    return (
      <div className="relative flex-1 overflow-hidden bg-[#0b0d12]">
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
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-[#0b0d12]">
      <GraphCanvas
        ref={canvasRef}
        data={filtered}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {selectedNode && (
        <NodePanel
          node={selectedNode}
          onClose={() => setSelectedId(null)}
          onFocus={() => canvasRef.current?.focusNode(selectedNode.id)}
        />
      )}

      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className="bg-surface/80 text-muted-foreground border-border rounded-md border px-2.5 py-1 font-mono text-xs backdrop-blur">
          {filtered.nodes.length} nodes · {filtered.links.length} links
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-3.5" />
          Search
          <kbd className="bg-muted text-muted-foreground ml-1 rounded px-1 font-mono text-[10px]">
            ⌘K
          </kbd>
        </Button>
        <GraphFilters value={filters} onChange={setFilters} />
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
        ⌘K to search · scroll to zoom · click a node for details
      </div>

      <GraphSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        nodes={filtered.nodes}
        onSelect={focusNode}
      />
    </div>
  );
}
