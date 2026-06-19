# RULES.md — Engineering Rules for NotionGraph

> **Read this file before writing any code.** These rules exist so that any agent or
> contributor — regardless of which model or person — produces **consistent** output.
> If a rule blocks you and you believe it's wrong, stop and flag it; do not silently break it.

---

## 0. The Two Files You Must Always Respect
1. **`Tracker.md`** — the live build tracker. **You MUST update it** (see §1). Non-negotiable.
2. **This file (`RULES.md`)** — the rules. Re-read it at the start of each work session.

Also treat as source of truth: `docs/PRD.md`, `docs/TECH_STACK.md`, `docs/DESIGN.md`,
`docs/USER_FLOW.md`, `docs/ROADMAP.md`. **Do not contradict them.** If reality forces a
change, update the doc *and* note it in your summary.

---

## 1. Tracker Protocol (AUTO-UPDATE — mandatory)

`Tracker.md` has three sections: **To-Do**, **In Progress**, **Complete**.

You must keep it current **without being asked**:
- **Before starting** a task → move it from `To-Do` to `In Progress` and add your note + date.
- **While working** → if you discover new work, add it to `To-Do` (don't lose it).
- **When done** (code written, builds, tests pass) → move it from `In Progress` to `Complete`
  with the completion date and a one-line result.
- **Never** leave a task in `In Progress` across a finished session without a status note.
- Keep entries concise and dated (`YYYY-MM-DD`). Newest completions at the top of `Complete`.

> If you finish work and have NOT touched `Tracker.md`, you are not done. Update it.

---

## 2. Tech Stack Boundaries (do not improvise)
Use **only** the technologies in `docs/TECH_STACK.md`:
- Next.js 14 (App Router) · TypeScript · Tailwind · Shadcn UI · Framer Motion
- react-force-graph (graph) · Clerk (auth) · Supabase/Postgres (db) · Notion API (data)
- Trigger.dev (jobs) · Vercel (host) · Zod, TanStack Query, Vitest/Playwright

**Do not add a new dependency** without (a) a clear need, (b) it not overlapping an existing
one, and (c) noting it in `Tracker.md` and `TECH_STACK.md`. Prefer the libraries we already chose.

---

## 3. Code Standards

### Language & types
- **TypeScript everywhere.** `strict` mode on. No `any` — use `unknown` + narrowing or a Zod schema.
- Validate **all external data** (Notion API responses, route inputs, webhooks) with **Zod**.
- Share types from a single `types/` (or `lib/types.ts`) source — especially `Node`, `Edge`, `GraphData`.

### Structure (Next.js App Router)
```
app/                routes + route handlers (server)
  (marketing)/      landing
  (app)/            authed app (graph, settings)
  api/              route handlers (notion, sync, webhooks)
components/         UI (Shadcn-based); components/graph/ for the canvas
lib/                clients + logic (notion, supabase, clerk, graph-build, crypto)
trigger/            Trigger.dev job definitions
types/              shared types
docs/               the planning docs
```
- **Server vs client:** secrets and DB writes are **server-only** (route handlers / server
  components / Trigger jobs). The graph canvas is a client component (`"use client"`,
  dynamic import, `ssr: false`).
- One responsibility per file. Keep files focused; extract logic out of components into `lib/`.

### Naming
- Components `PascalCase`, files for components `PascalCase.tsx`.
- Functions/vars `camelCase`. Constants `UPPER_SNAKE`. Types/interfaces `PascalCase`.
- Routes/folders `kebab-case`. DB tables/columns `snake_case`.

### Style
- Prettier + ESLint must pass before a task is "Complete". No lint errors committed.
- Tailwind for styling; use the **design tokens** from `DESIGN.md` (`bg-surface`, `text-muted`,
  graph color vars) — **never hardcode hex** that already exists as a token.
- Keep components presentational; data fetching via TanStack Query or server components.

---

## 4. Security & Privacy (hard rules)
- **NotionGraph is read-only on Notion.** Never call Notion write endpoints.
- **Never expose secrets to the client.** Service-role keys, Notion tokens, Clerk secret,
  Trigger key live in server env only. Nothing secret in `NEXT_PUBLIC_*`.
- **Encrypt Notion tokens at rest** (`TOKEN_ENCRYPTION_KEY`). Never log raw tokens.
- **Enforce Row-Level Security** on every user-owned table. Every query is scoped to the
  authenticated user. Write an RLS test for each table.
- **Data isolation is sacred:** a user must never be able to read another user's nodes/edges.
- Validate and sanitize anything rendered from Notion content.

---

## 5. The Graph Is the Product (quality bar)
The graph must be **smooth, accurate, beautiful** (per PRD success criteria):
- Target **60fps** up to ~1,000 nodes; usable to ~5,000. Profile before claiming "done."
- Use Canvas/WebGL rendering (react-force-graph) — never plain SVG for the main graph.
- Implement level-of-detail labels (declutter when zoomed out) and hover highlighting.
- Accuracy: edges must reflect **real** Notion links (nesting, mentions, relations). If you
  change edge-extraction, measure coverage against PRD's "≥95% of explicit links."
- Follow `DESIGN.md` exactly for node colors, glow, edge opacity, and motion timings.

---

## 6. Data Model Discipline
- The canonical model is `nodes` + `edges` (+ `users`, `notion_connections`, `sync_runs`,
  `embeddings`). Don't fork it. Changes go through a migration **and** a `TECH_STACK.md` update.
- Use Supabase migrations (`apply_migration`) — never hand-edit the DB in ways that aren't
  reproducible. Regenerate TypeScript types after a schema change.
- The renderer consumes a stable `GraphData = { nodes, links }` shape. Keep render decoupled
  from storage so the engine can be swapped (react-force-graph → Cosmograph) without DB changes.

---

## 7. Background Jobs (Trigger.dev)
- All long Notion work (full crawl, re-sync, embeddings) runs as a Trigger.dev job, **not**
  in a request handler. Requests enqueue; jobs do the work.
- Jobs must be **idempotent** and **retryable**. Respect Notion rate limits (paginate, backoff).
- Always write a `sync_runs` record (status + stats). Never leave the UI unable to tell what happened.

---

## 8. Testing & "Definition of Done"
A task is **Complete** only when:
1. It builds (`next build`) with no type errors.
2. Lint passes.
3. The graph-build / data logic has unit tests (Vitest) where it has logic.
4. Critical flows (connect → graph, re-sync) have at least a smoke/e2e check where feasible.
5. It matches the relevant doc (PRD/DESIGN/USER_FLOW).
6. **`Tracker.md` is updated.**

Don't claim something works that you haven't run. If you couldn't verify it, say so explicitly.

---

## 9. Git & Commits
- Small, focused commits. Conventional style: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Reference the tracker item in the commit body when relevant.
- Never commit secrets or `.env*`. Commit `.env.example` instead.
- Branch per feature; don't commit straight to the default branch when avoidable.

---

## 10. Working With Multiple Agents (consistency contract)
- **Pick up from `Tracker.md`**: start with whatever is in `In Progress`, else the top of `To-Do`.
- Leave the codebase in the state the next agent expects: docs updated, tracker updated,
  no half-applied migrations, no dead/commented-out code.
- When you make a decision a future agent must know, write it into the relevant doc — not
  just into your chat reply. **The docs are the shared memory.**
- Prefer extending existing patterns over inventing new ones. Match the surrounding code.

---

## 11. When In Doubt
- If a requirement is ambiguous or conflicts with a doc, **stop and ask** rather than guessing.
- Default to the simplest thing that satisfies the PRD. Resist scope creep (see PRD MoSCoW).
- Optimize for the next person reading the code, not for cleverness.
