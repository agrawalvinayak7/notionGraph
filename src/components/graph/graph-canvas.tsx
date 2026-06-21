"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type Ref,
} from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/types/graph";

const CANVAS_BG = "#0b0d12";

interface ForceGraphInstance {
  screen2GraphCoords(x: number, y: number): { x: number; y: number };
  centerAt(x?: number, y?: number, durationMs?: number): void;
  zoom(k?: number, durationMs?: number): number;
}
interface ForceGraphProps {
  ref?: Ref<ForceGraphInstance>;
  width?: number;
  height?: number;
  graphData: GraphData;
  backgroundColor?: string;
  nodeRelSize?: number;
  nodeLabel?: (n: unknown) => string;
  onNodeHover?: (n: unknown) => void;
  onNodeClick?: (n: unknown) => void;
  onBackgroundClick?: () => void;
  linkColor?: (l: unknown) => string;
  linkWidth?: (l: unknown) => number;
  nodeCanvasObject?: (
    n: unknown,
    ctx: CanvasRenderingContext2D,
    scale: number,
  ) => void;
}

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
}) as unknown as ComponentType<ForceGraphProps>;

export const NODE_COLORS: Record<string, string> = {
  page: "#7c8cf8",
  database: "#2dd4bf",
  row: "#38bdf8",
  tag: "#a78bfa",
};
export const ORPHAN_COLOR = "#5b6573";

export function colorFor(node: GraphNode): string {
  if (node.degree === 0) return ORPHAN_COLOR;
  return NODE_COLORS[node.type] ?? NODE_COLORS.page;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

type Positioned = GraphNode & { x?: number; y?: number };
type LinkEnd = string | { id: string };
const endId = (e: LinkEnd): string => (typeof e === "object" ? e.id : e);

export interface GraphCanvasHandle {
  focusNode: (id: string) => void;
}

interface GraphCanvasProps {
  data: GraphData;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas({ data, selectedId, onSelect }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<ForceGraphInstance | null>(null);
    const miniRef = useRef<HTMLCanvasElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [hoverId, setHoverId] = useState<string | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        focusNode: (id: string) => {
          const node = (data.nodes as Positioned[]).find((n) => n.id === id);
          const fg = fgRef.current;
          if (node && node.x != null && node.y != null && fg) {
            fg.centerAt(node.x, node.y, 600);
            fg.zoom(3.5, 600);
          }
        },
      }),
      [data.nodes],
    );

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

    const focusId = hoverId ?? selectedId;
    const focusNeighbors = focusId ? neighbors.get(focusId) : undefined;

    // ── Minimap ──
    const MM_W = 200;
    const MM_H = 132;
    const PAD = 10;
    useEffect(() => {
      let raf = 0;
      const draw = () => {
        raf = requestAnimationFrame(draw);
        const canvas = miniRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== MM_W * dpr) {
          canvas.width = MM_W * dpr;
          canvas.height = MM_H * dpr;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, MM_W, MM_H);
        ctx.fillStyle = "#10131a";
        ctx.fillRect(0, 0, MM_W, MM_H);

        const nodes = data.nodes as Positioned[];
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        for (const n of nodes) {
          if (n.x == null || n.y == null) continue;
          minX = Math.min(minX, n.x);
          minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x);
          maxY = Math.max(maxY, n.y);
        }
        if (!isFinite(minX)) return;
        const gw = maxX - minX || 1;
        const gh = maxY - minY || 1;
        const scale = Math.min((MM_W - 2 * PAD) / gw, (MM_H - 2 * PAD) / gh);
        const offX = PAD + (MM_W - 2 * PAD - gw * scale) / 2;
        const offY = PAD + (MM_H - 2 * PAD - gh * scale) / 2;
        const toMM = (x: number, y: number): [number, number] => [
          offX + (x - minX) * scale,
          offY + (y - minY) * scale,
        ];

        for (const n of nodes) {
          if (n.x == null || n.y == null) continue;
          const [mx, my] = toMM(n.x, n.y);
          ctx.fillStyle = colorFor(n);
          ctx.fillRect(mx - 1, my - 1, 2, 2);
        }

        const fg = fgRef.current;
        if (fg && size.width > 0) {
          const tl = fg.screen2GraphCoords(0, 0);
          const br = fg.screen2GraphCoords(size.width, size.height);
          const [ax, ay] = toMM(tl.x, tl.y);
          const [bx, by] = toMM(br.x, br.y);
          ctx.strokeStyle = "rgba(124,140,248,0.9)";
          ctx.lineWidth = 1;
          ctx.strokeRect(
            Math.min(ax, bx),
            Math.min(ay, by),
            Math.abs(bx - ax),
            Math.abs(by - ay),
          );
        }
      };
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    }, [data.nodes, size.width, size.height]);

    const onMiniClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const fg = fgRef.current;
      const canvas = miniRef.current;
      if (!fg || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const nodes = data.nodes as Positioned[];
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const n of nodes) {
        if (n.x == null || n.y == null) continue;
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x);
        maxY = Math.max(maxY, n.y);
      }
      if (!isFinite(minX)) return;
      const gw = maxX - minX || 1;
      const gh = maxY - minY || 1;
      const scale = Math.min((MM_W - 2 * PAD) / gw, (MM_H - 2 * PAD) / gh);
      const offX = PAD + (MM_W - 2 * PAD - gw * scale) / 2;
      const offY = PAD + (MM_H - 2 * PAD - gh * scale) / 2;
      const gx = (mx - offX) / scale + minX;
      const gy = (my - offY) / scale + minY;
      fg.centerAt(gx, gy, 400);
    };

    return (
      <div ref={containerRef} className="absolute inset-0">
        {size.width > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={size.width}
            height={size.height}
            graphData={data}
            backgroundColor={CANVAS_BG}
            nodeRelSize={4}
            nodeLabel={(n) => (n as GraphNode).title}
            onNodeHover={(n) => setHoverId(n ? (n as GraphNode).id : null)}
            onNodeClick={(n) => onSelect((n as GraphNode).id)}
            onBackgroundClick={() => onSelect(null)}
            linkColor={(l) => {
              const s = endId((l as { source: LinkEnd }).source);
              const t = endId((l as { target: LinkEnd }).target);
              if (focusId && (s === focusId || t === focusId))
                return "rgba(124,140,248,0.7)";
              return focusId
                ? "rgba(120,130,150,0.06)"
                : "rgba(120,130,150,0.22)";
            }}
            linkWidth={(l) => {
              const s = endId((l as { source: LinkEnd }).source);
              const t = endId((l as { target: LinkEnd }).target);
              return focusId && (s === focusId || t === focusId) ? 1.4 : 0.5;
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const n = node as Positioned;
              if (n.x == null || n.y == null) return;
              const deg = n.degree ?? 0;
              const r = 3 + Math.sqrt(deg) * 1.5;
              const isHover = hoverId === n.id;
              const isSelected = selectedId === n.id;
              const isNeighbor = focusNeighbors?.has(n.id) ?? false;
              const active = !focusId || isHover || isSelected || isNeighbor;
              const color = colorFor(n);

              ctx.globalAlpha = active ? 1 : 0.16;

              ctx.beginPath();
              ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = isHover || isSelected ? "#ffffff" : color;
              ctx.fill();
              ctx.lineWidth = 0.6;
              ctx.strokeStyle = "rgba(11,13,18,0.85)";
              ctx.stroke();

              if (isHover || isSelected) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, r + 2.5, 0, 2 * Math.PI);
                ctx.lineWidth = isSelected ? 1.8 : 1.2;
                ctx.strokeStyle = color;
                ctx.stroke();
              }

              const showLabel =
                globalScale > 1.6 || deg >= 5 || isHover || isSelected;
              if (showLabel && active) {
                const fontSize = Math.max(10 / globalScale, 1.5);
                ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = "rgba(226,229,236,0.9)";
                ctx.fillText(truncate(n.title, 26), n.x, n.y + r + 1.5);
              }
              ctx.globalAlpha = 1;
            }}
          />
        )}

        {/* Minimap */}
        <div className="border-border absolute right-4 bottom-4 z-10 overflow-hidden rounded-lg border shadow-lg">
          <canvas
            ref={miniRef}
            onClick={onMiniClick}
            style={{
              width: MM_W,
              height: MM_H,
              cursor: "pointer",
              display: "block",
            }}
          />
        </div>
      </div>
    );
  },
);
