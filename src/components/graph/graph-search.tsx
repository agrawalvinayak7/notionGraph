"use client";

import { useMemo } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { colorFor } from "./graph-canvas";
import type { GraphNode } from "@/types/graph";

export function GraphSearch({
  open,
  onOpenChange,
  nodes,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: GraphNode[];
  onSelect: (id: string) => void;
}) {
  // Hubs (most connections) first.
  const sorted = useMemo(
    () => [...nodes].sort((a, b) => b.degree - a.degree),
    [nodes],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search nodes"
      description="Find a page or database in your graph"
    >
      <Command>
        <CommandInput placeholder="Search pages, databases…" />
        <CommandList>
          <CommandEmpty>No matching nodes.</CommandEmpty>
          <CommandGroup heading={`${nodes.length} nodes`}>
            {sorted.map((n) => (
              <CommandItem
                key={n.id}
                value={`${n.title} ${n.id}`}
                onSelect={() => {
                  onSelect(n.id);
                  onOpenChange(false);
                }}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: colorFor(n) }}
                />
                <span className="truncate">{n.title}</span>
                <span className="text-muted-foreground ml-auto font-mono text-xs">
                  {n.degree}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
