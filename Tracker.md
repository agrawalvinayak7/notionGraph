# Tracker.md — NotionGraph Build Tracker

> **⚠️ AGENTS: This file is auto-maintained. You MUST update it as you work.**
> See `RULES.md` §1. Move items To-Do → In Progress (when you start) → Complete (when done,
> verified). Date every change (`YYYY-MM-DD`). Newest completions at the top of Complete.
> If you finished work and didn't touch this file, you are not done.

**Last updated:** 2026-06-19 · **Current phase:** Phase 0 — Planning

Legend: `[P0]`–`[P6]` = roadmap phase (see `docs/ROADMAP.md`). Priority: 🔴 Must · 🟡 Should · 🟢 Could

---

## 🟦 To-Do

### Phase 1 — Foundation & Auth
- 🔴 `[P1]` Scaffold Next.js 14 (App Router) + TypeScript + Tailwind + Shadcn UI project
- 🔴 `[P1]` Configure ESLint + Prettier + strict TS + path aliases
- 🔴 `[P1]` Add design tokens from `DESIGN.md` to `globals.css` + `tailwind.config.ts`
- 🔴 `[P1]` Load Geist Sans / Geist Mono via `next/font`; set dark theme default
- 🔴 `[P1]` Integrate Clerk (sign-in/up, middleware, protected routes)
- 🔴 `[P1]` Clerk → Supabase `users` sync via webhook
- 🔴 `[P1]` Build landing page shell + `/connect`, `/graph`, `/settings` route stubs

### Phase 2 — Supabase & Data Model
- 🔴 `[P2]` Create Supabase project; set env vars
- 🔴 `[P2]` Migration: `users`, `notion_connections`, `nodes`, `edges`, `sync_runs`
- 🔴 `[P2]` Enable + write RLS policies for every user-owned table
- 🔴 `[P2]` RLS isolation tests (user A cannot read user B)
- 🔴 `[P2]` Generate TypeScript types; create typed Supabase client
- 🔴 `[P2]` Token encryption helper (`lib/crypto.ts`) for Notion tokens at rest

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
_(nothing yet — pick the top 🔴 item from To-Do, move it here, and add your name/date)_

---

## 🟩 Complete

### 2026-06-19
- ✅ `[P0]` Planning docs authored: `README`, `PRD`, `TECH_STACK`, `DESIGN`, `USER_FLOW`,
  `ROADMAP`, `RULES`, `Tracker` — stack & scope locked (Notion API · Clerk · Supabase ·
  Trigger.dev · react-force-graph).
