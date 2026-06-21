"use client";

import { ExternalLink, Crosshair, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { colorFor } from "./graph-canvas";
import type { GraphNode } from "@/types/graph";

const TYPE_LABEL: Record<string, string> = {
  page: "Page",
  database: "Database",
  row: "Database row",
  tag: "Tag",
};

export function NodePanel({
  node,
  onClose,
  onFocus,
}: {
  node: GraphNode;
  onClose: () => void;
  onFocus: () => void;
}) {
  const color = colorFor(node);
  return (
    <div className="animate-rise border-border bg-surface/95 absolute top-4 left-4 z-20 w-72 rounded-xl border p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {TYPE_LABEL[node.type] ?? node.type}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <h2 className="mt-2 text-base leading-snug font-semibold break-words">
        {node.title}
      </h2>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-foreground font-mono">{node.degree}</span>
        <span className="text-muted-foreground">
          connection{node.degree === 1 ? "" : "s"}
        </span>
        {node.degree === 0 && (
          <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
            orphan
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" onClick={onFocus}>
          <Crosshair className="size-3.5" />
          Focus
        </Button>
        {node.url && (
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button size="sm">
              <ExternalLink className="size-3.5" />
              Open in Notion
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
