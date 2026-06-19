import { cn } from "@/lib/utils";

type Node = {
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number;
};

// A hand-placed mini knowledge graph that hints at the real product.
const NODES: Node[] = [
  { x: 250, y: 240, r: 13, color: "var(--node-page)", delay: 0 }, // hub
  { x: 140, y: 150, r: 8, color: "var(--node-database)", delay: 0.15 },
  { x: 370, y: 160, r: 9, color: "var(--node-database)", delay: 0.25 },
  { x: 110, y: 300, r: 6, color: "var(--node-row)", delay: 0.35 },
  { x: 200, y: 360, r: 7, color: "var(--node-row)", delay: 0.4 },
  { x: 360, y: 330, r: 7, color: "var(--node-tag)", delay: 0.5 },
  { x: 410, y: 250, r: 5, color: "var(--node-row)", delay: 0.55 },
  { x: 70, y: 210, r: 5, color: "var(--node-tag)", delay: 0.6 },
  { x: 300, y: 90, r: 6, color: "var(--node-row)", delay: 0.65 },
  { x: 440, y: 130, r: 4, color: "var(--node-orphan)", delay: 0.8 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [1, 7],
  [1, 8],
  [2, 8],
  [2, 6],
  [5, 4],
];

export function HeroConstellation({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 440"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      {/* edges draw themselves in */}
      <g stroke="var(--node-page)" strokeWidth="1" fill="none">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            strokeOpacity="0.22"
            strokeDasharray="200"
            style={{
              animation: `ng-draw 0.9s ease ${0.3 + i * 0.08}s forwards`,
              opacity: 0,
            }}
          />
        ))}
      </g>

      {/* nodes: glow halo + core, gently pulsing */}
      {NODES.map((n, i) => (
        <g
          key={i}
          style={{
            animation: `ng-fade 0.5s ease ${n.delay}s forwards`,
            opacity: 0,
          }}
        >
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r * 2.6}
            fill={n.color}
            opacity="0.12"
          />
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={n.color}
            style={{
              transformOrigin: `${n.x}px ${n.y}px`,
              animation: `ng-pulse ${3 + (i % 4)}s ease-in-out ${n.delay}s infinite`,
            }}
          />
        </g>
      ))}
    </svg>
  );
}
