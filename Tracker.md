# Tracker.md — NotionGraph Build Tracker

> **⚠️ AGENTS: This file is auto-maintained. You MUST update it as you work.**
> See `RULES.md` §1. Move items To-Do → In Progress (when you start) → Complete (when done,
> verified). Date every change (`YYYY-MM-DD`). Newest completions at the top of Complete.
> If you finished work and didn't touch this file, you are not done.

**Last updated:** 2026-06-20 · **Current phase:** Phases 1–4 done (core loop works end to
end). Now in Phase 5 — Search/Filter/Settings polish.

Legend: `[P0]`–`[P7]` = roadmap phase (see `docs/ROADMAP.md`). Priority: 🔴 Must · 🟡 Should · 🟢 Could

> **Snapshot:** Sign in → connect Notion → sync → explore a solid, interactive graph with
> minimap — all working against real data. What's left is depth (search/filter, node panel,
> background sync) and ship (settings actions, tests, deploy).

---

## 🟦 To-Do

### Phase 2 — Supabase & Data Model
- 🔴 `[P2]` Write per-user RLS **policies** (currently RLS-on/no-policy = locked) — pairs with
  Clerk ↔ Supabase third-party auth so the browser client can read own rows under RLS
- 🔴 `[P2]` RLS isolation tests (user A cannot read user B) once policies exist

### Phase 3 — Notion Connect & Sync Engine
- 🔴 `[P3]` Edge extraction: add `@mention` edges from block content (nesting + relations done)
- 🟡 `[P3]` Move sync to a Trigger.dev background job (idempotent, rate-limited) — currently
  synchronous in `/api/sync`, fine for now but will hit serverless timeouts on big workspaces
- 🟡 `[P3]` Incremental sync (diff) + live progress streaming (currently full re-sync + toast)

### Phase 4 — The Graph View (hero)
- 🟡 `[P4]` Performance pass: profile + verify fps targets up to ~5k nodes
- 🟡 `[P4]` First-run coachmarks (basic hint bar shipped)

### Phase 5 — Search, Filter & Re-Sync
- 🟡 `[P5]` Extend filters: by specific database + depth/focus (N-hop neighborhood)
  (node-type toggles + orphans done)
- 🟡 `[P5]` Trigger.dev `incremental-sync` (diff add/update/remove) + schedule
- 🟡 `[P5]` "Re-sync now" button, last-synced display, sync toasts + failure handling
- 🟢 `[P5]` Optional light/dark theme toggle (app is dark-first by design; deferred)

### Phase 6 — Polish, Test & Ship
- 🟡 `[P6]` Empty/error/edge-case states (USER_FLOW §7)
- 🟡 `[P6]` Framer Motion polish (panels, transitions, reduced-motion)
- 🟡 `[P6]` Accessibility pass (contrast, focus rings, keyboard)
- 🟡 `[P6]` Vitest unit tests (graph-build/edge-extraction) + Playwright e2e (connect→graph)
- 🟡 `[P6]` Lighthouse ≥90 on landing; final perf check
- 🟡 `[P6]` Deploy to Vercel; wire env; live demo URL
- 🟢 `[P6]` Docs/README pass; record demo GIF

### Phase 7 — AI Semantic Links (later / Could-have)
- 🟢 `[P7]` Enable pgvector; `embeddings` table + RLS
- 🟢 `[P7]` Trigger.dev `embed-content` job
- 🟢 `[P7]` Cosine-similarity "suggested" edges; toggleable violet layer in graph
- 🟢 `[P7]` (If graphs exceed ~5k nodes) evaluate Cosmograph/WebGL renderer migration

---

## 🟨 In Progress
- _(nothing actively in progress — core product loop works end to end. Next candidates:
  node side-panel on click, ⌘K search/filters (Phase 5), Trigger.dev background sync.)_

---

## 🟩 Complete

### 2026-06-22
- ✅ `[P5]` **Settings page is real.** Shows live Notion connection (workspace, last-synced,
  node count), **recent sync history** (status + stats per run), and account email. Danger
  zone: **"Disconnect & delete my data"** (two-step confirm) → `/api/notion/disconnect` wipes
  connection + nodes + edges + sync_runs (account kept), redirects to `/connect`. Reusable
  `ConfirmAction` client component.

### 2026-06-21
- ✅ `[P4]` **Node side-panel**: clicking a node now selects it (white ring) and opens a panel
  (top-left) with type chip, title, connection count, orphan badge, plus **Focus** (fly-to) and
  **Open in Notion**. Background click deselects.
- ✅ `[P5]` **⌘K search** (`graph-search.tsx`): command palette over all visible nodes
  (hubs first), selecting one flies the camera to it and selects it. Toolbar Search button too.
- ✅ `[P5]` **Filters** (`graph-filters.tsx`): popover to toggle node types + show/hide orphans;
  the graph + search + counts all respect the filter (links to hidden nodes drop out).
- ✅ `[P4]` Canvas refactored to `forwardRef` exposing `focusNode(id)`; hover/selection share
  highlight logic.

### 2026-06-20 (later)
- ✅ `[P4]` **Visual redesign → professional/solid.** Removed the gradient "observatory"
  backdrop, dotted grid, gradient text, and float animation across all screens (solid
  `bg-background`; graph canvas solid `#0b0d12`). Nodes now solid-filled with a crisp dark
  outline + cool palette (indigo/teal/sky/violet), glow/ring only on hover. DESIGN.md updated.
- ✅ `[P4]` **Minimap** added (bottom-right of the graph): all nodes scaled down + a live
  viewport box; click to recenter the main view.
- ✅ `[P3]` Fixed sync crash: pinned Notion API to `2022-06-28` + hardened title parsing.

### 2026-06-20 (evening)
- ✅ `[P4]` **The graph renders!** `react-force-graph-2d` canvas (`graph-canvas.tsx`): nodes
  sized by degree, colored by type + orphan color, glow, hover highlights node + neighbors
  (dims rest), zoom-based labels, click opens the Notion page, pan/zoom/drag. `graph-view.tsx`
  loads `/api/graph` and drives sync via **TanStack Query** (added `Providers`). `/graph` shows
  empty state + "Sync my Notion" or the live graph + re-sync toolbar.
- ✅ `[P3]` **Sync engine** (`lib/sync.ts`): paginated Notion `search`, builds `nodes`
  (page/database/row, titles, urls, degree) and `edges` (parent nesting → `child`, relation
  props → `relation`), full re-sync into Supabase, writes `sync_runs`. `/api/sync` (run) +
  `/api/graph` (serve `GraphData`). **Verified end to end**: decrypts the real token, Notion
  returns 146 objects.

### 2026-06-20
- ✅ `[P3]` **Notion OAuth connect flow** (runtime-smoke-tested). `/api/notion/start` (CSRF
  state cookie → Notion authorize) + `/api/notion/callback` (verify state → exchange code →
  encrypt token → store `notion_connections`, one per user). `lib/notion.ts` (authorize URL +
  Zod-validated token exchange). `/connect` now functional: shows connected workspace or a
  working "Authorize with Notion" button + error states. Added `zod`.
- ✅ `[P1]` **Clerk → Supabase user sync** done (first-login upsert). `lib/user.ts`
  `getOrCreateCurrentUser()` upserts a `users` row by `clerk_user_id`; called from the new
  `(app)/layout.tsx` so every authed route guarantees the row. `/connect` moved into `(app)`.
- ✅ `[P2]` **Database schema is LIVE in Supabase.** Dropped the abandoned earlier attempt's 5
  empty tables, created `users`/`notion_connections`/`nodes`/`edges`/`sync_runs` per
  `SCHEMA.md` (UUIDs, checks, unique constraints, indexes), RLS enabled on all (locked, no
  policies yet). Generated `database.types.ts`; both Supabase clients are now typed. Security
  advisor: prior critical "RLS disabled" cleared.
- ✅ `[P2]` Supabase client modules (`lib/supabase/admin.ts` service-role/server-only +
  `lib/supabase/client.ts` anon/browser) and `lib/crypto.ts` (AES-256-GCM token encryption,
  round-trip verified with the real key). Trigger.dev wired: `trigger.config.ts` + a
  `health-check` example task. Build + lint green.
- ✅ `[P1]` **Clerk auth integrated and runtime-verified.** ClerkProvider (dark theme),
  `proxy.ts` gatekeeper protecting `/graph` `/settings` `/connect`, `/sign-in` + `/sign-up`
  pages, auth-aware site header + `UserButton`. Smoke test: logged-out `/graph` → 307 to
  `/sign-in`. Notes for future agents: this Clerk v7 build has **no `<SignedIn>/<SignedOut>`**
  (use `auth()` from `@clerk/nextjs/server`); Next 16 uses **`proxy.ts`** not `middleware.ts`;
  appearance uses **`theme:`** not `baseTheme:`.

### 2026-06-19
- ✅ `[P1]` Built landing page (hero + animated constellation + how-it-works) and app screens:
  `/connect`, `/graph`, `/settings` — all styled to the design system. Build + lint green.
- ✅ `[P1]` Design system wired in `globals.css` (Tailwind v4 `@theme`, dark default, full
  palette + graph node colors, glow/observatory utilities, entrance animations).
- ✅ `[P1]` Fonts: Geist Sans/Mono + Instrument Serif via `next/font`.
- ✅ `[P1]` Tooling: ESLint, Prettier (+ tailwind plugin), strict TS, `@/*` alias, format scripts.
- ✅ `[P1]` shadcn/ui initialized + core components (button, card, badge, separator, tooltip,
  sonner, skeleton, input, dropdown-menu); Tooltip + Toaster providers in root layout.
- ✅ `[P1]` Scaffolded **Next.js 16** + TypeScript + Tailwind v4 (note: latest is v16/v4, not
  the v14/v3 our plan assumed — docs updated to match).
- ✅ `[P0]` `docs/SCHEMA.md` authored — tables, ER diagram, Notion→edge mapping, RLS, `GraphData` contract.
- ✅ `[P0]` Planning docs authored: `README`, `PRD`, `TECH_STACK`, `DESIGN`, `USER_FLOW`,
  `ROADMAP`, `RULES`, `Tracker` — stack & scope locked (Notion API · Clerk · Supabase ·
  Trigger.dev · react-force-graph).
