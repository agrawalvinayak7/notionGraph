# Product Requirements Document — NotionGraph

**Owner:** Vinayak Agrawal
**Status:** Draft v1
**Last updated:** 2026-06-19

---

## 1. Problem Statement

Notion is excellent for *writing* and *storing* knowledge, but it is poor at helping you
**see the shape of that knowledge**. Information lives in a deep tree of nested pages and
databases. Relationships between ideas exist — a page mentions another page, a database
row relates to a project, two notes are about the same topic — but they are invisible.
You only discover a connection if you remember it and click into it.

Tools like **Obsidian** solved this with a *graph view*: a force-directed map where every
note is a node and every link is an edge. It turns a pile of documents into a navigable
mental model. You instantly spot clusters, orphaned notes, and the "hubs" that tie your
thinking together.

**Notion has no equivalent.** There is no native way to visualize your workspace as a
connected graph. Users with large workspaces (students, researchers, builders, PKM
enthusiasts) lose the big picture, forget what they've written, and can't see how their
knowledge relates.

> **NotionGraph closes this gap:** it reads a user's Notion workspace via the official API
> and renders a smooth, accurate, beautiful, interactive knowledge graph of their pages,
> databases, and the links between them.

### Who has this problem (target users)
- **PKM / second-brain users** who keep everything in Notion and want Obsidian-grade visualization.
- **Students & researchers** with large note collections who need to see topic clusters.
- **Builders / founders** running their life and projects in Notion who want a bird's-eye map.
- **Teams** wanting to understand how their docs and databases interrelate.

### Why now / why us
- Notion's official API is mature enough to read pages, databases, relations, and mentions.
- The graph-rendering ecosystem (d3-force, WebGL renderers) is production-ready.
- This is a focused, shippable, portfolio-grade product that demonstrates full-stack +
  data + visualization skill in one artifact.

---

## 2. Goals & Non-Goals

### Goals
1. Let a user connect their Notion workspace securely in under 60 seconds.
2. Render an accurate graph of pages/databases and the real links between them.
3. Make the graph **visually outstanding and buttery-smooth** — this is the product's soul.
4. Make the graph *useful*: search, filter, focus, click-through to the real Notion page.
5. Keep the graph fresh with automatic background re-sync.

### Non-Goals (v1)
- We are **not** editing Notion content. NotionGraph is read-only / view-only.
- We are **not** a Notion replacement or a note editor.
- We are **not** building real-time multiplayer in v1.
- We are **not** supporting non-Notion sources (Obsidian, Roam) in v1.

---

## 3. Core Features

### 3.1 Connect Notion (Must-have)
- OAuth connection to a user's Notion workspace via the official Notion API.
- User selects which pages/databases the integration can access (Notion's native picker).
- Clear permission + privacy messaging ("we read, we never write").

### 3.2 Graph Build Engine (Must-have)
- Fetch pages, databases, and database rows.
- Extract **edges** from:
  - Parent → child page nesting
  - Database → row containment
  - `@page` inline mentions / page links inside content
  - Notion **relation** properties between database rows
- Normalize into a `nodes[]` + `edges[]` model stored in Supabase.

### 3.3 Interactive Graph View (Must-have — the hero feature)
- Force-directed layout (d3-force) rendered on Canvas/WebGL for smoothness.
- **Smooth pan, zoom, drag** with momentum; 60fps target even at 1k+ nodes.
- Node size scaled by connection count (hubs are bigger).
- Node color by type (page / database / row) — see DESIGN.md palette.
- Hover: highlight a node and its immediate neighbors; dim the rest.
- Click a node: open a side panel with title, type, and a "Open in Notion" link.
- Labels that fade in/out based on zoom level (declutter when zoomed out).

### 3.4 Search & Filter (Must-have)
- Fuzzy search across node titles; selecting a result flies the camera to that node.
- Filter by node type, by Notion database, and by "orphans only" (no connections).
- Depth/neighborhood focus: isolate a node and its N-hop neighborhood.

### 3.5 Background Sync (Should-have)
- Scheduled re-sync of the workspace via Trigger.dev so the graph stays current.
- Manual "Re-sync now" button with progress + last-synced timestamp.

### 3.6 Auth & Accounts (Must-have)
- Sign up / sign in via Clerk.
- Each user only ever sees their own workspace graph (strict data isolation / RLS).

### 3.7 AI Semantic Links (Could-have — later phase)
- Generate embeddings (pgvector) for page content.
- Draw lighter "suggested / related" edges between notes that are *thematically* similar
  but not explicitly linked — surfacing hidden connections. Toggleable layer.

### Feature priority (MoSCoW)
| Priority | Features |
|----------|----------|
| **Must** | 3.1 Connect, 3.2 Build engine, 3.3 Graph view, 3.4 Search/filter, 3.6 Auth |
| **Should** | 3.5 Background sync |
| **Could** | 3.7 AI semantic links, shareable read-only graph link, themes |
| **Won't (v1)** | Editing Notion, non-Notion sources, multiplayer |

---

## 4. Success Criteria

### 4.1 Product / UX success
- A new user goes from landing page → connected → seeing their graph in **under 2 minutes**.
- The graph renders and stays interactive at **60fps for graphs up to ~1,000 nodes**, and
  remains usable (≥30fps) up to ~5,000 nodes.
- Initial graph view paints in **under 2 seconds** for a previously synced workspace.
- Users describe the graph as "smooth" and "beautiful" — qualitative bar, validated by
  showing it to 5+ people and getting that reaction unprompted.

### 4.2 Functional / correctness success
- ≥ 95% of explicit Notion links (mentions, relations, nesting) are represented as edges.
- No user can ever see another user's data (verified by RLS tests).
- A re-sync correctly reflects added/removed/renamed pages within one sync cycle.

### 4.3 Technical success
- Lighthouse performance ≥ 90 on the marketing/landing route.
- Sync of a 500-page workspace completes in **under 60 seconds** in the background.
- Zero secrets in client bundle; all Notion tokens encrypted at rest.

### 4.4 Project success (this being a portfolio/learning project)
- Cleanly deployed on Vercel with a live, demoable URL.
- Demonstrates: Next.js + TS, Clerk auth, Supabase data modeling, third-party OAuth (Notion),
  background jobs (Trigger.dev), and non-trivial data visualization.
- Codebase is readable and follows [RULES.md], so multiple AI agents can extend it consistently.

---

## 5. Key Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Notion API rate limits on large workspaces | Batch + paginate, cache in Supabase, sync incrementally via Trigger.dev |
| Graph performance degrades at scale | Canvas/WebGL renderer, level-of-detail labels, node capping + clustering |
| Notion content extraction misses links | Parse both block content and relation properties; measure edge coverage |
| Token security | Encrypt Notion tokens at rest; never expose to client; RLS on all tables |
| Scope creep (AI, sharing, themes) | Strict MoSCoW; AI semantic links is explicitly a later phase |

---

## 6. Open Questions
- Brand/product name: NotionGraph (working) vs Synapse / Constellation / Cortex?
- Free vs paid tiers — out of scope for v1, revisit after core ships.
- Max workspace size we officially support in v1 (proposal: soft cap ~5,000 nodes).
