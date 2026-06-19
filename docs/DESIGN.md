# Design System — NotionGraph

**Last updated:** 2026-06-19

The product is a **graph you stare at**. The visual language must therefore be calm,
dark, and focused so that the colorful, glowing graph is the hero. Think "observatory at
night": a near-black canvas, restrained UI chrome, and luminous nodes.

**Design principles**
1. **The graph is the hero.** UI chrome recedes; the canvas glows.
2. **Dark-first.** Dark mode is the default and primary experience (light mode is secondary).
3. **Calm, not flashy.** One accent, generous space, subtle motion.
4. **Legible at any zoom.** Type and node labels must stay readable from overview to close-up.

---

## 1. Typography

### Fonts
| Role | Font | Notes |
|------|------|-------|
| **UI / body / headings** | **Geist Sans** | Modern, neutral, made by Vercel — pairs perfectly with our stack and reads cleanly in dense UI. (Fallback: Inter.) |
| **Monospace / data / node IDs / code** | **Geist Mono** | For sync logs, IDs, counts, technical labels. (Fallback: JetBrains Mono.) |
| **Marketing hero accent (optional)** | **Instrument Serif** | A single editorial serif for the landing hero headline only, to add character. Not used in-app. |

> Load via `next/font` (self-hosted, no layout shift).

### Type scale (rem, 16px base)
| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `display` | 3.5rem / 56px | 600 | Landing hero |
| `h1` | 2.25rem / 36px | 600 | Page titles |
| `h2` | 1.5rem / 24px | 600 | Section headers |
| `h3` | 1.25rem / 20px | 500 | Card / panel titles |
| `body` | 1rem / 16px | 400 | Default text |
| `small` | 0.875rem / 14px | 400 | Secondary text, side panel meta |
| `caption` | 0.75rem / 12px | 500 | Labels, tags, timestamps |
| `node-label` | 0.6875rem / 11px | 500 | Graph node labels (canvas-drawn) |

- **Line height:** 1.5 for body, 1.2 for headings.
- **Letter spacing:** -0.02em on `display`/`h1` (tighten large type), 0 elsewhere.

---

## 2. Color

Dark-first palette. All values are also exported as CSS variables / Tailwind tokens.

### 2.1 Core neutrals (dark theme — default)
| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#0A0B0F` | App background (the canvas void) |
| `surface` | `#13151C` | Cards, panels, popovers |
| `surface-2` | `#1A1D26` | Raised/hover surfaces, inputs |
| `border` | `#262A36` | Hairline borders, dividers |
| `text` | `#ECEDF1` | Primary text |
| `text-muted` | `#9AA1AE` | Secondary text |
| `text-faint` | `#5E6470` | Tertiary / placeholder |

### 2.2 Brand & accent
| Token | Hex | Use |
|-------|-----|-----|
| `primary` | `#6366F1` | Primary actions, focus rings, active states (indigo) |
| `primary-hover` | `#7C7FF2` | Hover state for primary |
| `accent` | `#22D3EE` | Secondary highlights, links, glow accents (cyan) |
| `accent-soft` | `rgba(34,211,238,0.12)` | Subtle accent fills |

### 2.3 Semantic
| Token | Hex |
|-------|-----|
| `success` | `#34D399` |
| `warning` | `#FBBF24` |
| `danger` | `#F87171` |
| `info` | `#38BDF8` |

### 2.4 Graph palette (node categories)
Curated, high-contrast-on-dark, harmonious together. Nodes glow softly (outer blur) on
the dark canvas.
| Node type | Color | Hex |
|-----------|-------|-----|
| Page | Indigo | `#818CF8` |
| Database | Cyan | `#22D3EE` |
| Database row | Emerald | `#34D399` |
| Tag / keyword | Amber | `#FBBF24` |
| Orphan (no links) | Slate (dim) | `#64748B` |
| Highlighted (hover/active) | White-hot | `#FFFFFF` |
| AI semantic link (later) | Violet | `#A78BFA` |

**Edges:** default `rgba(154,161,174,0.18)` (faint neutral). On hover-highlight, the
focused node's edges brighten to `rgba(99,102,241,0.6)` and others dim to `0.05`.

### 2.5 Light theme (secondary)
| Token | Hex |
|-------|-----|
| `bg` | `#FAFAFB` |
| `surface` | `#FFFFFF` |
| `border` | `#E6E8EC` |
| `text` | `#15171C` |
| `text-muted` | `#5E6470` |
| `primary` | `#5457E5` |

Graph palette stays the same hues but with slightly reduced glow on light bg.

---

## 3. Spacing, Radius, Elevation

- **Spacing scale (px):** 2, 4, 8, 12, 16, 24, 32, 48, 64 (Tailwind default-aligned).
- **Radius:** `sm` 6px · `md` 10px · `lg` 14px · `xl` 20px · `full` 9999px.
  Panels/cards use `lg`; buttons/inputs use `md`; pills/avatars use `full`.
- **Elevation (dark):** shadows are subtle; rely on `surface` lightening + 1px border.
  - `e1`: `0 1px 2px rgba(0,0,0,0.4)`
  - `e2` (popovers/panels): `0 8px 30px rgba(0,0,0,0.5)`
- **Glow utility (for graph + primary CTAs):** `0 0 24px rgba(99,102,241,0.35)`.

---

## 4. Motion (Framer Motion)

- **Durations:** micro 120ms · standard 200ms · panel/large 320ms.
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutExpo-ish) for entrances.
- **Patterns:**
  - Side panel: slide + fade from right, 320ms.
  - Camera fly-to-node: 600ms eased zoom/pan (handled by the graph engine, not Framer).
  - Hover highlight on graph: 150ms opacity transitions.
  - Buttons: 120ms scale `0.98` on press.
- **Respect `prefers-reduced-motion`:** disable non-essential motion.

---

## 5. Component Notes (Shadcn-based)

- **Command palette** (`⌘K`): primary search/jump-to-node + actions.
- **Side panel** (right): selected node details — title, type chip, connection count,
  "Open in Notion" button.
- **Top bar:** minimal — workspace name, last-synced timestamp, "Re-sync", filter toggles,
  search trigger, user avatar (Clerk).
- **Left rail (optional):** filters (node type, database, orphans-only, depth).
- **Tooltips:** on node hover (title + type), 11px, `surface-2`, `e2` shadow.
- **Empty/loading states:** animated constellation skeleton while syncing.

---

## 6. Iconography
- **Lucide icons** (ships with Shadcn). Stroke width 1.5, 20px default in chrome.

---

## 7. Accessibility
- Text contrast ≥ 4.5:1 against its surface (verified for `text`/`text-muted`).
- Focus rings always visible (`primary`, 2px) — never remove outlines.
- Graph interactions reachable via keyboard (search-to-focus, arrow-to-neighbor) where feasible.
- Honor `prefers-reduced-motion` and `prefers-color-scheme`.

---

## 8. Design Tokens (starter — `globals.css`)
```css
:root[data-theme="dark"] {
  --bg: #0A0B0F;
  --surface: #13151C;
  --surface-2: #1A1D26;
  --border: #262A36;
  --text: #ECEDF1;
  --text-muted: #9AA1AE;
  --text-faint: #5E6470;
  --primary: #6366F1;
  --primary-hover: #7C7FF2;
  --accent: #22D3EE;
  --success: #34D399;
  --warning: #FBBF24;
  --danger: #F87171;
  /* graph */
  --node-page: #818CF8;
  --node-database: #22D3EE;
  --node-row: #34D399;
  --node-tag: #FBBF24;
  --node-orphan: #64748B;
  --edge: rgba(154,161,174,0.18);
}
```
> Mirror these into `tailwind.config.ts` `theme.extend.colors` so classes like
> `bg-surface`, `text-muted`, `border-border` work everywhere.
