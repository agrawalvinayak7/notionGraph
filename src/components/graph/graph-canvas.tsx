"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/types/graph";

// react-force-graph touches `window`, so load it client-only.
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const NODE_COLORS: Record<string, string> = {
  page: "#818cf8",
  database: "#22d3ee",
  row: "#34d399",
  tag: "#fbbf24",
};
const ORPHAN_COLOR = "#64748b";

function colorFor(node: GraphNode): string {
  if (node.degree === 0) return ORPHAN_COLOR;
  return NODE_COLORS[node.type] ?? "#818cf8";
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

type LinkEnd = string | { id: string };
const endId = (e: LinkEnd): string => (typeof e === "object" ? e.id : e);

export function GraphCanvas({ data }: { data: GraphData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Track container size so the canvas fills the area.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Adjacency for hover highlighting (built from raw ids).
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of data.links) {
      const s = endId(l.source as LinkEnd);
      const t = endId(l.target as LinkEnd);
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    }
    return map;
  }, [data.links]);

  const neighborIds = hoverId ? neighbors.get(hoverId) : undefined;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {size.width > 0 && (
        <ForceGraph2D
          width={size.width}
          height={size.height}
          graphData={data}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={4}
          nodeLabel={(n) => (n as GraphNode).title}
          onNodeHover={(n) => setHoverId(n ? (n as GraphNode).id : null)}
          onNodeClick={(n) => {
            const url = (n as GraphNode).url;
            if (url) window.open(url, "_blank", "noopener,noreferrer");
          }}
          linkColor={(l) => {
            const s = endId((l as { source: LinkEnd }).source);
            const t = endId((l as { target: LinkEnd }).target);
            if (hoverId && (s === hoverId || t === hoverId))
              return "rgba(99,102,241,0.6)";
            return hoverId
              ? "rgba(154,161,174,0.05)"
              : "rgba(154,161,174,0.18)";
          }}
          linkWidth={(l) => {
            const s = endId((l as { source: LinkEnd }).source);
            const t = endId((l as { target: LinkEnd }).target);
            return hoverId && (s === hoverId || t === hoverId) ? 1.5 : 0.6;
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n = node as GraphNode & { x: number; y: number };
            const deg = n.degree ?? 0;
            const r = 3 + Math.sqrt(deg) * 1.6;
            const isHover = hoverId === n.id;
            const isNeighbor = neighborIds?.has(n.id) ?? false;
            const active = !hoverId || isHover || isNeighbor;
            const color = colorFor(n);

            ctx.save();
            ctx.globalAlpha = active ? 1 : 0.12;
            ctx.shadowColor = color;
            ctx.shadowBlur = isHover ? 20 : 8;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = isHover ? "#ffffff" : color;
            ctx.fill();
            ctx.restore();

            const showLabel = globalScale > 1.6 || deg >= 5 || isHover;
            if (showLabel && active) {
              const fontSize = Math.max(10 / globalScale, 1.5);
              ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = "rgba(236,237,241,0.85)";
              ctx.fillText(truncate(n.title, 26), n.x, n.y + r + 1);
            }
          }}
        />
      )}
    </div>
  );
}
