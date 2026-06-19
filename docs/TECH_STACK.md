# Tech Stack — NotionGraph

**Last updated:** 2026-06-19

This stack is deliberately anchored to technologies Vinayak already works in (Next.js,
TypeScript, Tailwind, Shadcn, Framer Motion, Node, Postgres, Supabase, Vercel), with a few
**new** technologies added intentionally for learning (Clerk, Notion OAuth, Trigger.dev,
force-directed graph rendering, and — later — pgvector embeddings).

Legend: 🟢 already on resume · 🟡 new (learning goal)

---

## 1. Frontend

| Tech | Role | Why |
|------|------|-----|
| 🟢 **Next.js 16 (App Router)** | Framework | Already your strongest tool. App Router gives us server components, route handlers for the Notion API, and clean server/client separation. Scaffolded with Turbopack. *(Note: latest is v16, not v14 — v16 has some breaking changes; see `node_modules/next/dist/docs/` and `AGENTS.md`.)* |
| 🟢 **TypeScript** | Language | Type safety across the node/edge data model is essential for a graph app. `strict` mode on. |
| 🟢 **Tailwind CSS v4** | Styling | Fast, consistent styling; pairs with Shadcn. **v4 is CSS-first** — design tokens live in `src/app/globals.css` under `@theme`/`:root`/`.dark`, *not* in a `tailwind.config.ts`. |
| 🟢 **Shadcn UI** | Component library | Accessible, themeable primitives. *(This shadcn build is on **Base UI**, not Radix — use the `render` prop or `buttonVariants` for links, not `asChild`.)* |
| 🟢 **Framer Motion** | Animation | Page transitions, panel slides, micro-interactions. The graph itself is canvas-rendered, but the UI *around* it should feel alive. |
| 🟡 **react-force-graph** | **Graph rendering (hero)** | See section 2 — this is the core new skill. |

---

## 2. Graph Rendering (the most important decision)

The graph must be **smooth, accurate, and visually outstanding**. That ruled the choice.

### Chosen: `react-force-graph` (2D Canvas, with WebGL escape hatch)
- Uses **d3-force** under the hood for physically accurate force-directed layout
  (charge, link, collision, centering forces) — this gives the "Obsidian feel."
- Renders to **HTML5 Canvas** (and offers a WebGL/Three.js variant), so it stays smooth
  at thousands of nodes where SVG/d3 alone would stutter.
- First-class **React** bindings — fits Next.js cleanly (client component, dynamic import,
  SSR disabled for the canvas).
- Built-in pan/zoom/drag, node/link hover, custom node painting (we'll draw glowing nodes
  + adaptive labels), and `d3Force` access for tuning.

### Why not the alternatives
| Option | Verdict |
|--------|---------|
| **Raw d3-force + SVG** | Most control, but SVG gets janky past a few hundred nodes. Not smooth enough. |
| **Sigma.js** | Excellent WebGL performance at huge scale, but heavier API and less React-native. Keep as a fallback if we exceed ~5k nodes. |
| **Cosmograph (GPU)** | Insanely fast (100k+ nodes), beautiful — our **upgrade path** if graphs get huge. Slightly more specialized; overkill for v1. |
| **vis-network / cytoscape** | Capable but more "enterprise diagram" than "beautiful knowledge graph." |

> **Decision:** Build v1 on `react-force-graph`. If real workspaces routinely exceed
> ~5,000 nodes, migrate the renderer to **Cosmograph** (GPU) — the node/edge data model
> stays identical, so only the render layer changes.

Supporting libs: **d3-force** (exposed for tuning), **d3-quadtree** (already bundled),
and a small custom layer for level-of-detail labels and hover highlighting.

---

## 3. Authentication

| Tech | Role | Why |
|------|------|-----|
| 🟡 **Clerk** | Auth & user management | New to you (good learning). Drop-in sign-in/up, sessions, user profiles, and middleware that guards Next.js routes. We map `clerk_user_id` to rows in Supabase for data isolation. |

> Note: Notion connection is a **separate** OAuth (Notion's), stored per user. Clerk =
> "who is this person." Notion OAuth = "which Notion workspace can we read."

---

## 4. Database & Backend

| Tech | Role | Why |
|------|------|-----|
| 🟢 **Supabase (Postgres)** | Primary database | Already on your resume. Stores users, Notion connections (encrypted tokens), and the synced graph (`nodes`, `edges`, `sync_runs`). |
| 🟢 **Row-Level Security (RLS)** | Data isolation | Each user only reads their own rows. Enforced at the DB, not just the app. |
| 🟡 **pgvector** (Supabase extension) | Embeddings (later phase) | Stores content embeddings for AI "semantic links." Postgres-native vector search. |
| 🟢 **Next.js Route Handlers** | API layer | `/api/notion/*`, `/api/sync/*`, `/api/graph/*`. Server-only; holds secrets. |
| 🟢 **Supabase JS client** | DB access | Typed access via generated types. |

### Data model (high level)
```
users          (id, clerk_user_id, email, created_at)
notion_connections (id, user_id, access_token[encrypted], workspace_id, workspace_name, last_synced_at)
nodes          (id, user_id, notion_id, type[page|database|row], title, url, meta jsonb)
edges          (id, user_id, source_node_id, target_node_id, type[child|mention|relation], weight)
sync_runs      (id, user_id, status, started_at, finished_at, stats jsonb)
embeddings     (node_id, user_id, vector(1536))   -- later phase
```

---

## 5. Notion Integration

| Tech | Role | Why |
|------|------|-----|
| 🟡 **Official Notion API + OAuth** | Data source | The product's input. OAuth public integration: user authorizes, we get a token, we read pages/databases/blocks/relations. |
| 🟢 **@notionhq/client** | SDK | Official typed JS client for the Notion API. Handles pagination + types. |

What we read: pages, databases, database rows (pages in a DB), block children (for inline
`@mentions` and links), and `relation` properties. We never write.

---

## 6. Background Jobs / Sync

| Tech | Role | Why |
|------|------|-----|
| 🟡 **Trigger.dev** | Background sync (your pick) | New learning. Runs long, reliable, retryable sync jobs outside the request cycle — paginating a whole workspace, respecting Notion rate limits, and updating the graph. Scheduled re-syncs + on-demand triggers. |

Job types: `initial-sync` (full crawl on first connect), `incremental-sync` (scheduled),
`embed-content` (later phase, generates embeddings).

---

## 7. AI / Embeddings (later phase — Could-have)

| Tech | Role | Why |
|------|------|-----|
| 🟡 **pgvector + an embeddings model** | Semantic links | Plays to your AI/ML background. Embed page text, store vectors, draw "related" edges via cosine similarity. Toggleable graph layer. |

We'll evaluate the embedding provider when we reach this phase; the model choice is
deferred and isolated behind a single `embed()` function so it can be swapped.

---

## 8. Hosting, Tooling & Ops

| Tech | Role | Why |
|------|------|-----|
| 🟢 **Vercel** | Hosting | Native Next.js host; you already use it. Preview deploys per branch. |
| 🟢 **Git + GitHub** | Version control | Standard. |
| 🟢 **Docker** (optional) | Local parity | Already on your resume; optional for local Supabase. |
| 🟢 **ESLint + Prettier** | Code quality | Enforced per RULES.md. |
| 🟡 **Vitest + Playwright** | Testing | Unit tests for the graph-build logic; e2e for the connect→graph flow. |
| **Zod** | Runtime validation | Validate Notion API responses and API route inputs. |
| **TanStack Query** | Client data fetching | Cache graph data, sync status polling. |

---

## 9. Environment Variables (reference)
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only

# Notion OAuth
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NOTION_REDIRECT_URI=

# Trigger.dev
TRIGGER_SECRET_KEY=

# Encryption
TOKEN_ENCRYPTION_KEY=             # for encrypting Notion tokens at rest
```

---

## 10. Summary: what's new vs familiar
- **Familiar (de-risks the build):** Next.js, TypeScript, Tailwind, Shadcn, Framer Motion, Supabase/Postgres, Vercel.
- **New (the learning):** Clerk (auth), Notion OAuth + SDK, **react-force-graph** (visualization), Trigger.dev (background jobs), and later pgvector embeddings.
