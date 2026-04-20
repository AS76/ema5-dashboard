# EMA5 Operations Dashboard — SPEC.md

**Version:** 1.0
**Date:** 2026-04-20
**Author:** Cleo ⚡ (subagent design task)
**Status:** Draft — for Andrea review

---

## 1. Overview

**Project:** EMA5 Operations Dashboard
**Description:** A mobile-first web dashboard for Andrea Sassi's daily site management of the EMA5 Amazon automated warehouse project (TGW Group contractor, Kettering UK).
**Goal:** Replace fragmented WhatsApp/email/paper tracking with a single pane of glass for daily logs, issues, actions, team contacts, and rota.
**Users:** Andrea Sassi (primary), TGW supervisors and site leads (read-only).

---

## 2. Visual & Design Language

### 2.1 Style Reference

- **Reference:** Notion-inspired — clean, structured, document-like
- **Personality:** Professional, calm, efficient. Not flashy. Feels like a proper operations tool, not a startup SaaS demo.
- **Density:** Medium — enough white space to breathe, enough structure to scan fast on a phone during site walks.

### 2.2 Color Palette

**Primary TGW Brand Colors** (fonte: brandfetch.com/tgw-group.com):
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary / TGW Brand | TGW Yellow | `#F4DB0C` | Accents, active nav, logo highlight, primary buttons |
| TGW Logistics Red | TGW Red | `#E5332A` | Critical priority, alerts, blocker badges, danger actions |
| Sidebar Background | Dark Navy | `#1A1A2E` | Sidebar background, headings |
| Background | Off-White | `#F8F9FA` | Page background |
| Surface | White | `#FFFFFF` | Cards, panels, table rows |
| Border | Light Gray | `#E5E7EB` | Card borders, dividers |
| Text Primary | Charcoal | `#1F2937` | Body text, labels |
| Text Secondary | Gray | `#6B7280` | Metadata, secondary labels |

**Status Colors:**
| Status: Open | Blue | `#3B82F6` | Open issues / in-progress |
| Status: Done | Green | `#10B981` | Completed actions |
| Status: Blocked | Red | `#EF4444` | Blocked items |

**Priority Badges:**
| Priority: R (Red) | — | `#DC2626` | Critical priority badge |
| Priority: A (Amber) | — | `#F59E0B` | High priority badge |
| Priority: G (Green) | — | `#10B981` | Normal priority badge |

**TGW Skill/Certification Category Colors** (da materials TGW interni):
| Category | Hex | Usage |
|----------|-----|-------|
| Future Technological Skills | `#0080C8` | Tech/systems category indicators |
| Data Drive & Ethical Skills | `#D24190` | Data/ethics category indicators |
| Future Creative & Communication | `#FFCC03` | Creative/comm category indicators |
| Human Computer Interaction | `#AFCA0B` | HCI/digital leadership indicators |

*Nota: i colori skill sono usati come badge/category indicator nelle sezioni Team/Rota dove applicabile. I brand colors primari (#F4DB0C e #E5332A) hanno priorità visiva maggiore.*

### 2.3 Typography

**Font Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

**Scale:**
| Element | Size | Weight |
|---------|------|--------|
| Page title | 24px | 700 |
| Section heading | 18px | 600 |
| Card title | 15px | 600 |
| Body / table cell | 14px | 400 |
| Label / caption | 12px | 500 |
| Badge | 11px | 600 |

**Line height:** 1.5 for body, 1.3 for headings.

### 2.4 Spacing System

Base unit: **4px**

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |

**Card padding:** 16px
**Section gap:** 24px
**Sidebar width:** 240px (desktop), full-width overlay (mobile)

### 2.5 Elevation / Shadow

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
--shadow-md: 0 4px 12px rgba(0,0,0,0.10);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
```

Cards have `--shadow-sm` by default. Modals/overlays use `--shadow-lg`.

### 2.6 Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

---

## 3. Layout Structure

### 3.1 Desktop Layout (≥1024px)

```
┌──────────────────────────────────────────────────────┐
│ SIDEBAR (240px)    │ MAIN CONTENT                   │
│                    │                                │
│ [TGW Logo]         │ [Page Header + Action Button]  │
│                    │                                │
│ ▸ Daily Log        │ [Content Area]                  │
│ ▸ Issues           │   Cards / Tables               │
│ ▸ Actions          │                                │
│ ▸ Team             │                                │
│ ▸ Rota             │                                │
│                    │                                │
│ [Bottom: settings] │                                │
└──────────────────────────────────────────────────────┘
```

### 3.2 Mobile Layout (<768px)

```
┌────────────────────────┐
│ [≡] EMA5 Dashboard  [⚙]│  ← Top bar with hamburger
├────────────────────────┤
│                        │
│ [Content Area]         │
│ Full width, stacked    │
│                        │
│ [Bottom nav on some    │
│  pages for quick add]  │
└────────────────────────┘

Sidebar → slide-in overlay from left, backdrop blur
```

### 3.3 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px | Mobile: single column, hamburger menu |
| 640–1023px | Tablet: sidebar collapsed, content fluid |
| ≥ 1024px | Desktop: sidebar fixed, content max-width 1200px |

**Content max-width:** 900px (readable), 1200px (full table view).

---

## 4. Component Inventory

### 4.1 Sidebar Navigation

- **States:** Default, hover (bg highlight), active (left border accent + bold)
- **Items:** Icon (16px) + label, vertically stacked
- **Mobile:** Hidden by default, triggered by hamburger → full-screen overlay with blur backdrop
- **Logo area:** TGW logo (provided manually) + "EMA5 Ops" text label
- **Bottom:** Last sync timestamp, settings icon

### 4.2 Page Header

- **Contains:** Page title (h1), subtitle (last updated), primary action button (right-aligned)
- **Action button style:** TGW yellow background, dark text, rounded-md

### 4.3 Cards

- **Style:** White bg, shadow-sm, radius-md, 16px padding
- **Header:** Title + badge (count) right-aligned
- **Hover state:** Slight shadow increase

### 4.4 Data Tables

- **Style:** No outer border, internal row dividers only
- **Header row:** Gray bg (#F3F4F6), uppercase 11px label, sticky on scroll
- **Row hover:** Very light gray (#F9FAFB)
- **Cell padding:** 12px horizontal, 10px vertical
- **Overflow:** Horizontal scroll on mobile, sticky first column for context

### 4.5 Badges / Tags

| Badge | Style |
|-------|-------|
| Priority R | Red bg (#DC2626), white text, pill shape |
| Priority A | Amber bg (#F59E0B), dark text, pill shape |
| Priority G | Green bg (#10B981), white text, pill shape |
| Status: Open | Blue outline, blue text |
| Status: Done | Green outline, green text |
| Status: Blocked | Red outline, red text |

**Pill shape:** `border-radius: 9999px`, padding `4px 10px`, font-size 11px, font-weight 600.

### 4.6 Buttons

| Type | Style |
|------|-------|
| Primary | TGW Yellow bg (#F4DB0C), dark text, radius-md, font-weight 600 |
| Secondary | White bg, gray border, dark text |
| Danger | Red bg (#EF4444), white text |
| Ghost | No bg, text only, hover: light gray bg |

**All buttons:** Height 36px (compact), 44px (default). Touch target minimum 44px on mobile.

### 4.7 Status Indicators (Daily Log)

- **North / South status blocks:** Colored dot (green/amber/red) + label
- **Blocker badge:** Red background, "🔴 Blocker" label

### 4.8 Empty States

- Centered illustration placeholder (simple SVG, minimal)
- Message: "No entries yet. [Add first entry]"

### 4.9 Loading States

- Skeleton placeholders (gray animated shimmer) matching card/row shape
- No spinners for content load — skeletons feel faster

### 4.10 Toast Notifications

- Bottom-right on desktop, top-center on mobile
- Auto-dismiss after 3s
- Types: success (green), error (red), info (blue)

---

## 5. Page Sections & Data Schema

### 5.1 Daily Log (`/daily-log`)

**Purpose:** One-entry-per-day site status snapshot.

**Fields (Google Sheets columns):**
| Column | Type | Description |
|--------|------|-------------|
| Date | Date (YYYY-MM-DD) | Entry date, one per day |
| Day | Text | Day name (e.g. "Monday") |
| Presenze | Text | Headcount present, e.g. "12" or "Team A + 3 subcontractors" |
| North Status | Text | Green / Amber / Red / n/a |
| North Notes | Text | Detail on north zone status |
| South Status | Text | Green / Amber / Red / n/a |
| South Notes | Text | Detail on south zone status |
| Blockers | Text | Current blockers (empty if none) |
| Actions Taken | Text | Key actions taken that day |
| Notes | Text | General notes, observations |
| Last Updated | DateTime | Auto-timestamp |

**View:**
- Filter by week (default) or month
- Calendar week view on mobile, table view on desktop
- Status dots color-coded inline

### 5.2 Issues Tracker (`/issues`)

**Purpose:** All active site issues with priority and ownership.

**Fields (Google Sheets columns):**
| Column | Type | Description |
|--------|------|-------------|
| Issue ID | Text | Auto-increment: `ISS-001`, `ISS-002`... |
| Title | Text | Short, descriptive title |
| Description | Text | Detail, impact, context |
| Priority | Text | `R` / `A` / `G` |
| Owner | Text | Person responsible |
| Status | Text | `Open` / `In Progress` / `Blocked` / `Done` |
| Due Date | Date | Target resolution date |
| Created | Date | Creation date |
| Updated | DateTime | Last update |
| Linked Actions | Text | Comma-separated action IDs, e.g. `ACT-003, ACT-005` |

**View:**
- Table with sticky header
- Filter bar: all / R / A / G / Open / Done
- Sort by: due date, priority, created

### 5.3 Actions (`/actions`)

**Purpose:** Individual action items derived from issues or daily ops.

**Fields (Google Sheets columns):**
| Column | Type | Description |
|--------|------|-------------|
| Action ID | Text | `ACT-001`, `ACT-002`... |
| Title | Text | Action title |
| Owner | Text | Person responsible |
| Deadline | Date | Due date |
| Status | Text | `Open` / `In Progress` / `Done` / `Cancelled` |
| Linked Issue | Text | Issue ID e.g. `ISS-012` (optional) |
| Notes | Text | Additional context |
| Created | Date | Creation date |
| Updated | DateTime | Last update |

### 5.4 Team Contacts (`/team`)

**Purpose:** Site team directory with roles and contact info.

**Fields (Google Sheets columns):**
| Column | Type | Description |
|--------|------|-------------|
| Name | Text | Full name |
| Role | Text | Job title, e.g. "Site Engineer", "H&S Lead" |
| Company | Text | TGW / Amazon / Subcontractor / Other |
| Email | Text | Work email |
| Phone | Text | Work mobile |
| Site Area | Text | North / South / Both / Office |
| Notes | Text | Availability, languages, etc. |

**View:**
- Card grid on mobile (2 columns), table on desktop
- Search/filter by name or area

### 5.5 Rota (`/rota`)

**Purpose:** Weekly shift schedule — who covers which area and when.

**Fields (Google Sheets columns):**
| Column | Type | Description |
|--------|------|-------------|
| Week Of | Date (Mon) | Week starting Monday |
| Day | Text | Monday / Tuesday / ... / Sunday |
| Area | Text | North / South / Office / Gate / TGW Bay |
| Morning (06:00–14:00) | Text | Name(s) covering |
| Afternoon (14:00–22:00) | Text | Name(s) covering |
| Night (22:00–06:00) | Text | Name(s) covering (if applicable) |
| Notes | Text | Special instructions |

**View:**
- Week view grid: rows = days, columns = shifts
- Highlight current day

---

## 6. Technical Architecture

### 6.1 Frontend Stack

- **HTML5** — semantic, accessible
- **CSS3** — custom properties for theming, CSS Grid + Flexbox layout, no preprocessor needed
- **Vanilla JavaScript** — ES6+, no framework
- **No Tailwind** — justified exception: only if prototyping speed requires it; otherwise plain CSS

**CSS Architecture:**
```
styles/
  variables.css    ← CSS custom properties (colors, spacing, fonts)
  reset.css        ← minimal reset
  base.css         ← body, typography, global
  layout.css       ← sidebar, page structure, grid
  components.css   ← cards, tables, buttons, badges
  pages.css        ← page-specific overrides
  utilities.css    ← .flex, .mt-4, .text-sm, etc.
  responsive.css   ← media queries, mobile overrides
```

**JS Architecture:**
```
scripts/
  app.js           ← init, router, global state
  api.js           ← Google Sheets REST fetch helpers
  components.js    ← render functions for each component type
  pages/
    daily-log.js
    issues.js
    actions.js
    team.js
    rota.js
```

### 6.2 Google Sheets Integration

**Approach:** Google Sheets REST API via a read-only public sheet or via `gog` wrapper.

**Authentication options:**
1. **Public sheet (read-only):** Share sheet as "Anyone with the link" → no auth needed in JS
2. **gog wrapper:** Use `gog` CLI to fetch and cache sheet data → serve from static JSON files (GitHub Pages friendly)

**Recommended approach for GitHub Pages:**
- A background job (cron on a server or GitHub Actions) fetches sheet data nightly → converts to `data/*.json` files → committed/pushed to the repo
- The webapp reads local JSON files (zero auth, zero CORS issues, works on GitHub Pages)
- Latency: data is up to 24h old (acceptable for ops dashboard use case)

**Alternative (real-time, requires auth):**
- Use Google Sheets API v4 with an API key (limited to public data) or OAuth2
- CORS: Google API supports CORS for browser requests if properly configured

**Recommended final architecture:**
```
[Cron job on Hostinger VPS]
  → fetch from Google Sheets via gog
  → write /data/ema5-webapp/data/*.json
  → git commit + push to GitHub

[GitHub Pages webapp]
  → fetch /data/*.json on load (no auth, no CORS)
```

**JSON file structure:**
```
data/
  daily-log.json   ← array of log entries
  issues.json      ← array of issues
  actions.json     ← array of actions
  team.json        ← array of contacts
  rota-week.json   ← current + next week
  meta.json        ← last_updated timestamp, version
```

### 6.3 Routing

Single-page app, hash-based routing:
- `#/` → Daily Log (default)
- `#/issues` → Issues Tracker
- `#/actions` → Actions
- `#/team` → Team Contacts
- `#/rota` → Rota

Router: simple `window.addEventListener('hashchange')` handling.

### 6.4 State Management

Minimal, vanilla JS:
```javascript
const state = {
  currentPage: 'daily-log',
  data: { dailyLog: [], issues: [], actions: [], team: [], rota: [] },
  filters: {},
  lastSync: null
};
```

### 6.5 Hosting (GitHub Pages)

- Repo: `ema5-dashboard` (or similar)
- Branch: `gh-pages` or `main` with GitHub Pages enabled
- Custom domain: `ops.ema5.tgw` (optional, if TGW provides)
- HTTPS: enabled by default on GitHub Pages

**Deployment:** Any push to `main` triggers GitHub Pages rebuild (automatic).

### 6.6 Build / Development

- **No build step required** — pure static HTML/CSS/JS
- **Dev workflow:** Edit files → test locally (no server needed, just open `index.html`)
- **Optional:** VS Code Live Server extension for local dev with auto-refresh

---

## 7. Component Behavior

### 7.1 Navigation

- Sidebar nav items: click → hash change → page render
- Active state: left yellow border + bold text
- Mobile: hamburger icon in top bar → sidebar slides in from left with backdrop
- Close sidebar: click backdrop OR click X button OR select an item

### 7.2 Data Loading

1. On app init: fetch `data/meta.json` to check `last_updated`
2. Show skeleton loaders immediately
3. Fetch all `data/*.json` files in parallel
4. Render page content
5. Show toast: "Data synced [timestamp]"
6. If fetch fails: show error state with retry button

### 7.3 Filter & Sort

- Client-side filtering (data already loaded)
- Filter bar at top of each page
- Sort: click column header (toggle asc/desc)
- Persist last used filter/sort in `localStorage`

### 7.4 Add / Edit Entries (Future)

- Not in v1 (v1 is read-only display)
- v2: modal forms to add/edit daily log entries, issues, actions
- Data writes → Google Sheets via API (requires auth)

---

## 8. Accessibility

- Semantic HTML (`<nav>`, `<main>`, `<table>`, `<button>`)
- Keyboard navigation: tab through nav, enter to activate
- ARIA labels on icon-only buttons
- Color contrast: all text meets WCAG AA (4.5:1 minimum)
- Focus visible: custom outline (TGW yellow, 2px offset)

---

## 9. TGW Logo

**Status:** Andrea to provide manually.
**Suggested path:** Place at `assets/tgw-logo.svg` or `assets/tgw-logo.png`
**Fallback:** Text-only header "EMA5 Operations Dashboard" with TGW yellow accent
**Brand color usage:** `#F4DB0C` (TGW Yellow) for logo background if logo has transparent bg

**TGW brand info found:**
- Primary brand color: `#F4DB0C` (yellow/gold)
- TGW Logistics brand color: `#E5332A` (red)
- Source: tgw-group.com brand story page

---

## 10. File Structure

```
ema5-dashboard/
├── index.html
├── assets/
│   ├── tgw-logo.svg       ← Andrea to provide
│   ├── icons/             ← SVG icons (menu, plus, filter, etc.)
│   └── favicon.ico
├── styles/
│   ├── variables.css
│   ├── reset.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── pages.css
│   ├── utilities.css
│   └── responsive.css
├── scripts/
│   ├── app.js
│   ├── api.js
│   ├── router.js
│   ├── components.js
│   └── pages/
│       ├── daily-log.js
│       ├── issues.js
│       ├── actions.js
│       ├── team.js
│       └── rota.js
├── data/
│   ├── meta.json
│   ├── daily-log.json
│   ├── issues.json
│   ├── actions.json
│   ├── team.json
│   └── rota.json
├── SPEC.md
└── README.md
```

---

## 11. FAL.ai Mockup Prompt

*(Used to generate `design-mockup.png` — see next section)*

---

## 12. Sample Data (for Development)

### Daily Log Entry (sample)
```json
{
  "date": "2026-04-20",
  "day": "Monday",
  "presenze": "14 (Team A + 4 subbies)",
  "northStatus": "Amber",
  "northNotes": "Conveyor belt tensioner replacement in progress",
  "southStatus": "Green",
  "southNotes": "All systems operational",
  "blockers": "Awaiting spare part for north sorter — ETA Tuesday",
  "actionsTaken": "Replaced 2 sensors on Pack & Ship line; toolbox talk on PPE",
  "notes": "Amazon supervisor flagged concern on aisle 7 floor markings"
}
```

### Issue Entry (sample)
```json
{
  "id": "ISS-012",
  "title": "North sorter encoder failure",
  "description": "Encoder on sort module 3 giving intermittent readings. Causes mis-sorts every ~200 items.",
  "priority": "A",
  "owner": "Andrea Sassi",
  "status": "In Progress",
  "dueDate": "2026-04-22",
  "created": "2026-04-18",
  "updated": "2026-04-20",
  "linkedActions": ["ACT-003"]
}
```

---

## 13. Development Phases

**Phase 1 — MVP (this spec):**
- Static webapp, reads local JSON files
- All 5 sections, read-only view
- Mobile-responsive
- GitHub Pages hosting

**Phase 2 — Writeback:**
- Google Sheets API write access
- Add/edit forms (modal-based)
- Real-time data refresh button

**Phase 3 — Automation:**
- Cron job on Hostinger to update JSON files nightly
- Auto-refresh daily at 06:00 UK time

---

*End of SPEC.md*