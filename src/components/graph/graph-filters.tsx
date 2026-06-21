"use client";

import { Check, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NODE_COLORS } from "./graph-canvas";
import type { NodeType } from "@/types/graph";

export interface GraphFilterState {
  types: Record<NodeType, boolean>;
  hideOrphans: boolean;
}

export const DEFAULT_FILTERS: GraphFilterState = {
  types: { page: true, database: true, row: true, tag: true },
  hideOrphans: false,
};

const TYPES: { key: NodeType; label: string }[] = [
  { key: "page", label: "Pages" },
  { key: "database", label: "Databases" },
  { key: "row", label: "Database rows" },
  { key: "tag", label: "Tags" },
];

function Row({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm"
    >
      {color ? (
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color, opacity: active ? 1 : 0.3 }}
        />
      ) : (
        <span className="size-2.5" />
      )}
      <span className={active ? "" : "text-muted-foreground"}>{label}</span>
      {active && <Check className="text-primary ml-auto size-3.5" />}
    </button>
  );
}

export function GraphFilters({
  value,
  onChange,
}: {
  value: GraphFilterState;
  onChange: (v: GraphFilterState) => void;
}) {
  const allOn = Object.values(value.types).every(Boolean) && !value.hideOrphans;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          !allOn && "ring-primary/50 ring-1",
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        Filters
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-1.5">
        <p className="text-muted-foreground px-2 py-1 text-xs font-medium">
          Node types
        </p>
        {TYPES.map((t) => (
          <Row
            key={t.key}
            active={value.types[t.key]}
            label={t.label}
            color={NODE_COLORS[t.key]}
            onClick={() =>
              onChange({
                ...value,
                types: { ...value.types, [t.key]: !value.types[t.key] },
              })
            }
          />
        ))}
        <div className="bg-border my-1 h-px" />
        <Row
          active={!value.hideOrphans}
          label="Show orphans"
          onClick={() =>
            onChange({ ...value, hideOrphans: !value.hideOrphans })
          }
        />
      </PopoverContent>
    </Popover>
  );
}
