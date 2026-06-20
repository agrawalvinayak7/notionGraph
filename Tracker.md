# Tracker.md — NotionGraph Build Tracker

> **⚠️ AGENTS: This file is auto-maintained. You MUST update it as you work.**
> See `RULES.md` §1. Move items To-Do → In Progress (when you start) → Complete (when done,
> verified). Date every change (`YYYY-MM-DD`). Newest completions at the top of Complete.
> If you finished work and didn't touch this file, you are not done.

**Last updated:** 2026-06-19 · **Current phase:** Phase 1 — Foundation & Auth

Legend: `[P0]`–`[P6]` = roadmap phase (see `docs/ROADMAP.md`). Priority: 🔴 Must · 🟡 Should · 🟢 Could

---

## 🟦 To-Do

### Phase 1 — Foundation & Auth
- 🔴 `[P1]` Clerk → Supabase `users` sync (webhook or first-login upsert) — *needs Clerk + Supabase keys*

### Phase 2 — Supabase & Data Model
- 🔴 `[P2]` Write per-user RLS **policies** (currently RLS-on/no-policy = locked) — pairs with
  Clerk ↔ Supabase third-party auth so the browser client can read own rows under RLS
- 🔴 `[P2]` RLS isolation tests (user A cannot read user B) once policies exist

### Phase 3 — Notion Connect & Sync Engine
- 🔴 `[P3]` Register Notion public OAuth integration; set redirect URI
- 🔴 `[P3]` `/connect` UI + "Authorize with Notion" + privacy copy
- 🔴 `[P3]` OAuth callback route: code → token → encrypt → store connection
- 🔴 `[P3]` Notion client wrapper (`lib/notion.ts`) with pagination + Zod validation
- 🔴 `[P3]` Graph-build logic: pages/databases/rows → `nodes`
- 🔴 `[P3]` Edge extraction: nesting, `@mentions`, relations → `edges` (target ≥95% coverage)
- 🔴 `[P3]` Trigger.dev `initial-sync` job (idempotent, rate-limited, retryable)
- 🔴 `[P3]` Stream/poll sync progress to client; write `sync_runs`

### Phase 4 — The Graph View (hero)
- 🔴 `[P4]` Integrate `react-force-graph` as client component (dynamic import, ssr:false)
- 🔴 `[P4]` Map `GraphData = { nodes, links }` from Supabase
- 🔴 `[P4]` Custom node painting: size by degree, color by type, glow (per `DESIGN.md`)
- 🔴 `[P4]` Pan / zoom / drag tuned for smoothness; momentum; 60fps @ ~1k nodes
- 🔴 `[P4]` Hover: highlight node + neighbors, dim rest; tooltip
- 🔴 `[P4]` Click → side panel (title, type, connections, "Open in Notion")
- 🔴 `[P4]` Level-of-detail labels (fade by zoom)
- 🔴 `[P4]` Syncing/loading "constellation" skeleton + first-run coachmarks
- 🔴 `[P4]` Performance pass: profile + verify fps targets up to ~5k nodes

### Phase 5 — Search, Filter & Re-Sync
- 🔴 `[P5]` Command palette (⌘K) fuzzy search → camera fly-to-node
- 🔴 `[P5]` Filters: node type, by database, orphans-only, depth/focus mode
- 🟡 `[P5]` Trigger.dev `incremental-sync` (diff add/update/remove) + schedule
- 🟡 `[P5]` "Re-sync now" button, last-synced display, sync toasts + failure handling
- 🟡 `[P5]` `/settings`: connection, sync history, disconnect, delete-my-data, theme toggle

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
- 🔴 `[P1]` Clerk → Supabase `users` sync (create a `users` row on first authenticated visit) —
  now unblocked: Clerk live + `users` table live.

---

## 🟩 Complete

### 2026-06-20
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
