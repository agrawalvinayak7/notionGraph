// The stable shape the graph renderer consumes (decoupled from DB storage).
// See docs/SCHEMA.md §5.

export type NodeType = "page" | "database" | "row" | "tag";
export type EdgeType = "child" | "mention" | "relation" | "semantic";

export interface GraphNode {
  id: string;
  title: string;
  type: NodeType;
  url: string | null;
  degree: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: EdgeType;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
