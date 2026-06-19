# Roadmap — NotionGraph

**Last updated:** 2026-06-19

This is the step-by-step build plan, phase by phase. Each phase has a **goal**, the
**steps** to get there, and a **"done when"** exit criterion. Build in order — each phase
depends on the previous. The live status of every step lives in `Tracker.md`.

> Phases map 1:1 to the `[P1]`–`[P7]` tags in `Tracker.md`.

---

## Phase 0 — Planning ✅ (done)
**Goal:** Lock the problem, scope, stack, design, flows, rules, and tracker.
**Output:** All docs in `/docs` + `RULES.md` + `Tracker.md`.
**Done when:** Stack & scope agreed (✅ 2026-06-19).

---

## Phase 1 — Foundation & Auth
**Goal:** A deployable Next.js app where a user can sign in, with the design system wired up.

**Steps**
1. Scaffold **Next.js 16 (App Router)** + **TypeScript (strict)** + **Tailwind v4** + **Shadcn UI**.
2. Tooling: ESLint + Prettier, path aliases (`@/`), `.env.example`.
3. Wire the **design system**: define tokens from `DESIGN.md` in `globals.css` (Tailwind v4
   `@theme`/`:root`/`.dark` — no `tailwind.config.ts`); load **Geist Sans/Mono +
   Instrument Serif** via `next/font`; default to **dark theme**.
4. Build route skeleton: `(marketing)/` landing, `(app)/graph`, `(app)/settings`, `/connect`.
5. Integrate **Clerk**: `<ClerkProvider>`, sign-in/up routes, middleware protecting `(app)` routes.
6. **Clerk → Supabase users sync**: webhook (or first-login upsert) creating a `users` row keyed
   by `clerk_user_id`.
7. Landing page first pass (hero + "Connect your Notion" CTA + demo graph placeholder).

**Done when:** You can sign up, land on a protected `/graph` stub, and the app is themed and
deploys to Vercel preview cleanly.

---

## Phase 2 — Supabase & Data Model
**Goal:** A secure, typed database that can hold the graph, with airtight user isolation.

**Steps**
1. Create the Supabase project; set `SUPABASE_*` env vars (service role server-only).
2. Migration for tables: `users`, `notion_connections`, `nodes`, `edges`, `sync_runs`
   (schema sketch in `TECH_STACK.md` §4).
3. Enable **Row-Level Security** on every user-owned table; write policies scoping rows to the
   authenticated user.
4. **RLS isolation tests**: prove user A cannot read user B's nodes/edges/connection.
5. Generate **TypeScript types** from the schema; build a typed Supabase client in `lib/`.
6. **Token encryption** helper (`lib/crypto.ts`) using `TOKEN_ENCRYPTION_KEY` for Notion tokens.

**Done when:** Tables exist, RLS verified by tests, types generated, encryption helper unit-tested.

---

## Phase 3 — Notion Connect & Sync Engine
**Goal:** A user connects Notion and we build their graph data in the background.

**Steps**
1. Register a **Notion public OAuth integration**; configure `NOTION_CLIENT_ID/SECRET/REDIRECT_URI`.
2. `/connect` UI: explanation, privacy copy ("read-only, never edit"), "Authorize with Notion".
3. **OAuth callback** route handler: exchange `code` → access token → **encrypt** → store in
   `notion_connections`; then enqueue the initial sync.
4. **Notion client wrapper** (`lib/notion.ts`) using `@notionhq/client`: paginated fetch of
   pages, databases, database rows, and block children; every response validated with **Zod**.
5. **Node building**: transform pages/databases/rows into `nodes` (id, type, title, url, meta).
6. **Edge extraction** — the accuracy-critical step. Build `edges` from:
   - parent→child page nesting,
   - database→row containment,
   - inline `@page` mentions / links inside block content,
   - `relation` properties between database rows.
   Measure coverage against PRD's **≥95% of explicit links** bar.
7. **Trigger.dev `initial-sync` job**: orchestrates 4–6 above; **idempotent**, **retryable**,
   rate-limit aware (paginate + backoff); writes a `sync_runs` record with stats.
8. **Progress to client**: poll `sync_runs` (or stream) so `/graph` can show live sync progress.

**Done when:** Connecting a real Notion workspace results in correct `nodes` + `edges` rows in
Supabase, produced by a background job, with a `sync_runs` record and visible progress.

---

## Phase 4 — The Graph View (hero phase)
**Goal:** The smooth, accurate, beautiful interactive graph. This is the product.

**Steps**
1. Add **react-force-graph** as a client component (`"use client"`, dynamic import, `ssr:false`).
2. Load `GraphData = { nodes, links }` from Supabase (TanStack Query) and feed the engine.
3. **Custom node rendering**: size by degree (hubs bigger), color by type, soft **glow** —
   exactly per `DESIGN.md` graph palette.
4. **Interaction tuning**: smooth pan/zoom/drag with momentum; tune d3-force (charge, link
   distance, collision) for a pleasing, stable layout. Hit **60fps @ ~1,000 nodes**.
5. **Hover highlight**: focus a node + its neighbors, dim the rest; tooltip with title/type.
6. **Click → side panel**: title, type chip, connection count, **"Open in Notion ↗"** deep link.
7. **Level-of-detail labels**: fade labels in/out by zoom to declutter the overview.
8. **Loading state**: animated "constellation forming" skeleton during sync + first-run coachmarks.
9. **Performance pass**: profile; keep it usable (≥30fps) up to ~5,000 nodes; cap + note if larger.

**Done when:** A real workspace renders as a fluid, beautiful graph that you can pan/zoom/hover/
click, hitting the fps targets, matching the design.

---

## Phase 5 — Search, Filter & Re-Sync
**Goal:** Make the graph *useful*, and keep it fresh.

**Steps**
1. **Command palette (⌘K)**: fuzzy search node titles → select → camera **flies to** the node.
2. **Filters**: toggle node types, filter by a specific Notion database, "orphans only",
   and a depth/focus mode (isolate a node + N-hop neighborhood).
3. **`incremental-sync`** Trigger.dev job: re-fetch, **diff** against stored data (add/update/
   remove), update `last_synced_at`; run on a **schedule**.
4. **Re-sync UX**: "Re-sync now" button, last-synced timestamp, success/partial toasts, and a
   non-destructive failure path (keep the old graph, show "retry").
5. **`/settings`**: Notion connection details, recent `sync_runs`, **disconnect**,
   **delete-my-data** (RLS-scoped cascade, confirm), and **theme toggle**.

**Done when:** A user can find any node instantly, filter the view meaningfully, and the graph
re-syncs (scheduled + on demand) reflecting workspace changes.

---

## Phase 6 — Polish, Test & Ship
**Goal:** Production-quality, tested, deployed, demoable.

**Steps**
1. **States**: empty (no pages shared), large-workspace cap, expired token, sync-in-progress,
   network failure (USER_FLOW §7).
2. **Motion polish** (Framer Motion): panel slides, page transitions, `prefers-reduced-motion`.
3. **Accessibility**: contrast, focus rings, keyboard navigation, `prefers-color-scheme`.
4. **Tests**: Vitest for graph-build/edge-extraction (the riskiest logic); Playwright e2e for
   the connect → graph golden path.
5. **Performance**: Lighthouse ≥90 on landing; final graph fps verification.
6. **Deploy to Vercel**: production env wiring, secrets, custom domain optional; live demo URL.
7. **Docs/README pass**; record a demo GIF for the portfolio.

**Done when:** Live on Vercel, tests green, success criteria in `PRD.md` met, demo recorded.

---

## Phase 7 — AI Semantic Links (later / Could-have)
**Goal:** Surface hidden connections between thematically-similar notes.

**Steps**
1. Enable **pgvector**; add `embeddings` table (+ RLS).
2. **`embed-content`** Trigger.dev job: embed page text, store vectors.
3. **Suggested edges**: cosine-similarity → lighter **violet** edges; a toggleable "Show
   related (AI)" layer in the graph.
4. **Scale check**: if real graphs routinely exceed ~5,000 nodes, evaluate migrating the
   renderer to **Cosmograph** (GPU/WebGL) — the `nodes`/`edges` model is unchanged, so only
   the render layer moves.

**Done when:** Users can toggle AI-suggested links and the graph still performs.

---

## How to use this roadmap (for agents)
- Work phases **in order**; don't start Phase N+1 before Phase N's "done when" is met.
- For each step, update `Tracker.md` (To-Do → In Progress → Complete) per `RULES.md` §1.
- If a step reveals new work, add it to `Tracker.md` To-Do under the right phase.
- If reality diverges from a doc, update the doc and call it out — **docs are shared memory**.
