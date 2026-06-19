# NotionGraph — agent orientation

An Obsidian-style interactive knowledge graph for Notion. Read these BEFORE writing code:

- **`RULES.md`** — engineering rules. Non-negotiable. Includes the Tracker auto-update protocol.
- **`Tracker.md`** — live build status. **You MUST update it** as you work (To-Do → In Progress → Complete).
- **`docs/`** — `PRD`, `TECH_STACK`, `SCHEMA`, `DESIGN`, `USER_FLOW`, `ROADMAP`. Source of truth; keep them in sync with reality.

## Stack reality check (don't trust training data)
- **Next.js 16** (App Router, Turbopack) — has breaking changes; see `AGENTS.md` and `node_modules/next/dist/docs/`.
- **Tailwind v4** — CSS-first. Tokens live in `src/app/globals.css` (`@theme`/`:root`/`.dark`). No `tailwind.config.ts`.
- **shadcn/ui on Base UI** (not Radix) — for link-buttons use `buttonVariants`, not `asChild`.
- Dark theme is default (`<html class="dark">`). Use design tokens (`bg-surface`, `text-node-page`, …), never raw hex.

## Commands
`npm run dev` · `npm run build` (type-checks) · `npm run lint` · `npm run format`

@AGENTS.md
