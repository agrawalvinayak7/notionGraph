# NotionGraph

> An Obsidian-style interactive graph for your Notion workspace.

NotionGraph connects to your Notion workspace, reads your pages, databases, and the
links between them, and renders a smooth, beautiful, force-directed knowledge graph —
so you can *see* how your notes connect instead of clicking through them one by one.

**Working codename:** NotionGraph · **Brand candidates:** Synapse, Constellation, Cortex

---

## 📚 Documentation Index

Read these in order. Every agent/contributor must read **RULES.md** and **Tracker.md** before touching code.

| Doc | Purpose |
|-----|---------|
| [docs/PRD.md](docs/PRD.md) | Problem statement, core features, success criteria |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | Every technology we use and *why* |
| [docs/SCHEMA.md](docs/SCHEMA.md) | Database schema, relations, Notion→edge mapping, RLS, render contract |
| [docs/DESIGN.md](docs/DESIGN.md) | Typography, fonts, colors, visual language |
| [docs/USER_FLOW.md](docs/USER_FLOW.md) | End-to-end user journeys |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Step-by-step build plan, phase by phase |
| [RULES.md](RULES.md) | Engineering rules for all agents/contributors |
| [Tracker.md](Tracker.md) | Live build tracker — **auto-updated by agents** |

---

## TL;DR Stack

- **Frontend:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Shadcn UI · Framer Motion
- **Graph engine:** react-force-graph (d3-force layout, Canvas/WebGL)
- **Auth:** Clerk
- **Database:** Supabase (Postgres + pgvector)
- **Data source:** Official Notion API (OAuth)
- **Background sync:** Trigger.dev
- **Hosting:** Vercel

## Getting started (local dev)

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build` (production build + type-check), `npm run lint`,
`npm run format`.

## Status

🚧 In development — **Phase 1 (Foundation) underway.** App scaffolded, design system
wired, landing + app screens built. Auth (Clerk) is the next step. See
[Tracker.md](Tracker.md) for live status.
