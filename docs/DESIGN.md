# Design System — NotionGraph

**Last updated:** 2026-06-20

The product is a **professional tool you work in**, not a toy. The visual language is
clean, solid, and dark — like Linear or a serious dev tool. **No gradients, no "galaxy"
backdrop.** Solid surfaces give the colorful nodes maximum contrast and legibility.

**Design principles**
1. **The graph is the hero.** UI chrome recedes; the canvas is a calm solid backdrop.
2. **Solid over gradient.** Flat, solid backgrounds everywhere (better visibility + a more
   professional feel). Reserve any glow for hover/focus emphasis only.
3. **Dark-first.** Dark mode is the default and primary experience (light mode is secondary).
4. **Calm, not flashy.** Cool palette, one accent, generous space, restrained motion.
5. **Legible at any zoom.** Type and node labels must stay readable from overview to close-up.

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
Cool, high-contrast-on-dark. Nodes are rendered as **solid fills** with a thin dark
outline for crispness — **no resting glow** (glow/ring only on hover). Canvas background is
a solid `#0b0d12`. As implemented in `graph-canvas.tsx`:
| Node type | Color | Hex |
|-----------|-------|-----|
| Page | Indigo | `#7C8CF8` |
| Database | Teal | `#2DD4BF` |
| Database row | Sky | `#38BDF8` |
| Tag / keyword | Violet | `#A78BFA` |
| Orphan (no links) | Slate (dim) | `#5B6573` |
| Highlighted (hover) | White + colored ring | `#FFFFFF` |

**Edges:** default `rgba(120,130,150,0.22)` (faint neutral). On hover the focused node's
edges brighten to `rgba(124,140,248,0.7)` and others dim to `0.06`.

A **minimap** (bottom-right) shows all nodes scaled down with a viewport box; click it to
recenter the main view.

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

## 8. Design Tokens — IMPLEMENTED in `src/app/globals.css`

> **Tailwind v4 note:** we use Tailwind v4, which is **CSS-first**. There is no
> `tailwind.config.ts`. Tokens are defined as CSS variables under `:root` (light) and
> `.dark` (dark, the default), and exposed to Tailwind utilities via the `@theme inline`
> block. So `bg-surface`, `text-muted-foreground`, `text-node-page`, `border-border`,
> etc. all "just work". Dark mode is class-based: `<html>` has `class="dark"`.

The live token set (see the actual file for the full list) maps our palette onto shadcn's
semantic names plus our extras:

```css
@theme inline {
  /* shadcn semantic → utilities: bg-background, text-foreground, bg-primary, ... */
  --color-primary: var(--primary);        /* indigo #6366F1 in dark */
  --color-surface: var(--card);           /* #13151C */
  --color-cyan: var(--cyan);              /* #22D3EE brand accent */
  --color-success: var(--success);
  /* graph palette → bg-node-page, fill-node-database, ... */
  --color-node-page: var(--node-page);    /* #818CF8 */
  --color-node-database: var(--node-database);
  --color-edge: var(--edge);
}
.dark {
  --background: #0a0b0f;  --foreground: #ecedf1;
  --card: #13151c;        --primary: #6366f1;  --secondary: #1a1d26;
  --muted-foreground: #9aa1ae;  --border: #262a36;  --ring: #6366f1;
  /* ...full set in the file... */
}
```

**Custom utilities** in `globals.css`: `.glow-primary` / `.glow-cyan` (subtle CTA glow) and
the entrance animations `.animate-rise` / `.animate-fade` (respect `prefers-reduced-motion`).
The old gradient utilities (`.bg-observatory`, `.bg-grid`, `.text-gradient`) were **removed**
in favor of solid backgrounds — use `bg-background` for pages and the solid `#0b0d12` for the
graph canvas.
