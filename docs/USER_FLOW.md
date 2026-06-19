# User Flow — NotionGraph

**Last updated:** 2026-06-19

This document describes the end-to-end journeys a user takes. Each flow lists the steps,
the system's job at each step, and the screens/routes involved.

---

## 0. Route Map
```
/                     Landing (marketing)
/sign-in /sign-up     Clerk auth
/connect              Connect Notion (OAuth start + status)
/api/notion/callback  Notion OAuth callback (server)
/graph                The graph view (the product)
/settings             Connections, re-sync, account, danger zone
```

---

## 1. First-Time User — Landing → Graph (the golden path)

**Goal:** A new visitor sees their own Notion graph as fast as possible.

```
Landing (/)
  → "See your Notion as a graph" hero + live demo graph animation
  → CTA: "Connect your Notion"
        │
        ▼
Sign up (Clerk)  ──────────────► account created (users row via webhook)
        │
        ▼
Connect Notion (/connect)
  → Explains: "We read your pages & links. We never edit anything."
  → Button: "Authorize with Notion"
        │
        ▼
Notion OAuth (notion.so)
  → User picks which pages/databases to share (Notion's native picker)
  → Authorizes
        │
        ▼
Callback (/api/notion/callback)
  → Exchange code → access token
  → Encrypt + store token in notion_connections
  → Enqueue initial-sync job (Trigger.dev)
        │
        ▼
Syncing state (/graph with loading)
  → Animated "constellation forming" skeleton
  → Live progress: "Fetched 142 pages… building edges…"
        │
        ▼
Graph ready (/graph)
  → Force-directed graph animates into place
  → First-run coachmarks: scroll=zoom, drag=move, click=details, ⌘K=search
```

**System responsibilities**
- Create/sync the `users` row on Clerk sign-up (webhook).
- Securely complete Notion OAuth and store an encrypted token.
- Run `initial-sync` in the background; stream progress to the client.
- Render the graph only after nodes+edges are persisted.

---

## 2. Returning User — Sign in → Graph

```
Landing or /sign-in → Clerk session restored
  → /graph loads instantly from Supabase (already-synced nodes/edges)
  → Top bar shows "Last synced 2h ago" + "Re-sync now"
```

If the workspace was never connected → redirect to `/connect`.

---

## 3. Exploring the Graph (core interaction loop)

```
On /graph:
  ┌─────────────────────────────────────────────┐
  │ Pan      → drag empty canvas                 │
  │ Zoom     → scroll / pinch (labels fade in)   │
  │ Hover    → node + neighbors highlight,       │
  │            rest dims; tooltip shows title     │
  │ Click    → right side panel opens with:      │
  │            title, type chip, # connections,   │
  │            "Open in Notion ↗"                 │
  │ Drag node→ reposition; physics settles       │
  │ ⌘K / search → fuzzy find → camera flies to it │
  └─────────────────────────────────────────────┘
```

**Filters (left rail / top bar)**
- Toggle node types (pages / databases / rows / tags).
- Filter to a single Notion database.
- "Orphans only" — show notes with no connections (cleanup insight).
- Focus mode — isolate a node + its N-hop neighborhood.

**Click "Open in Notion"** → opens the real Notion page in a new tab (deep link via stored URL).

---

## 4. Re-Sync Flow

```
User clicks "Re-sync now" (top bar)  OR  scheduled trigger fires
        │
        ▼
incremental-sync job (Trigger.dev)
  → Re-fetch workspace, diff against stored nodes/edges
  → Add new, update changed, remove deleted
  → Update last_synced_at + write a sync_runs record
        │
        ▼
Graph updates
  → New nodes fade/spring in, removed nodes fade out
  → Toast: "Synced — 12 new pages, 3 removed"
```

Failure path: job retries (Trigger.dev); on repeated failure → toast + `sync_runs.status=failed`,
"Last sync failed — retry" shown in UI. Previous graph remains visible (never blank).

---

## 5. Settings & Account

```
/settings
  → Notion connection: workspace name, last synced, "Disconnect"
  → "Re-sync now" with history of recent sync_runs
  → Account (Clerk profile)
  → Theme toggle (dark default / light)
  → Danger zone: "Delete my data" (purges nodes/edges/connection)
```

**Disconnect Notion** → revoke + delete token, keep account; graph route prompts to reconnect.
**Delete my data** → cascade delete all user-owned rows (RLS-scoped), confirmation required.

---

## 6. AI Semantic Links (later phase)

```
On /graph, toggle "Show related (AI)"
  → Reveals lighter violet edges between thematically-similar notes
  → Computed from embeddings (pgvector cosine similarity)
  → Tooltip on such an edge: "Suggested connection (87% similar)"
```

---

## 7. Edge Cases & States
| Situation | Behavior |
|-----------|----------|
| No pages shared in Notion | Empty state: "No pages found — share pages with the integration" + retry |
| Very large workspace | Cap initial render, "Showing 5,000 of 8,200 nodes" + filter prompt |
| Notion token expired/revoked | Banner: "Reconnect Notion", graph shows last-synced cache |
| Sync in progress on revisit | Show cached graph + subtle "syncing…" indicator |
| Network/API failure | Non-blocking toast; never lose the existing graph |
| Not signed in | Protected routes redirect to `/sign-in` (Clerk middleware) |

---

## 8. Flow Summary (one-liner)
**Sign up → connect Notion → we sync in the background → explore a smooth, beautiful graph
of your knowledge → it stays fresh automatically.**
