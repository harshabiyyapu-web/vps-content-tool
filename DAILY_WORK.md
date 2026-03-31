# Dashboard 2: Daily Work

## Purpose

A daily workflow management tool for content teams. Each day, a manager selects one or more countries, pastes a list of article topics/URLs to work on, and assigns which domains (websites) those articles should be published on. The tool provides a clear, visual overview of all active work: what needs to be done, for which countries, on which sites.

---

## Layout Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR  [Publishing Overview]  [Daily Work]                         │
├──────────────────────────────────────────────────────────────────────┤
│  [+ Add Today's Work]  [Date: Today ▼]  [View: Grid | List]         │
├────────────────────────────────────────────────────────────────────  │
│                                                                      │
│  ┌──────────────────────────────┐   ┌───────────────────────────┐   │
│  │  SITES MANAGER               │   │  TODAY'S WORK              │   │
│  │  [Groups]  [All Sites]       │   │  (Topic → Country → Domains)│   │
│  └──────────────────────────────┘   └───────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

The screen is split into two panels:
- **Left panel** (~35%): Sites Manager — manage domains and groups
- **Right panel** (~65%): Today's Work — view and manage daily topics

---

## Left Panel: Sites Manager

### Sub-tabs: [Groups] and [All Sites]

#### "All Sites" Tab

Displays every domain that has ever been added to the system in a grid:

```
┌─────────────────────────────────────────────────────┐
│  All Sites (18)             [+ Add Site]  [Search]  │
├─────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ example.com│  │ site2.com │  │ site3.com │       │
│  │  SELECTED  │  │           │  │  SELECTED │       │
│  └───────────┘  └───────────┘  └───────────┘       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ site4.com │  │ site5.com │  │ site6.com │       │
│  └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────────────────────────────────┘
```

- Each site is a clickable chip/card
- **Click to toggle selection** — selected sites are highlighted with gradient border + indigo background tint
- Selected sites count shown: "3 selected"
- **"+ Add Site"** — simple input to add a new domain name (validates domain format)
- Sites can be deleted (hover → trash icon appears)
- Sites are automatically populated from Publishing Overview data (any domain in the publishing data appears here)

#### "Groups" Tab

```
┌─────────────────────────────────────────────────────┐
│  Site Groups              [+ Create Group]           │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │  📁 Tier 1 Sites             (5 sites)  [▼] │   │
│  │  example.com  site2.com  site3.com          │   │
│  │  site4.com  site5.com                       │   │
│  │  [Select All in Group]  [Edit]  [Delete]    │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  📁 News Sites               (3 sites)  [▼] │   │
│  │  news1.com  news2.com  news3.com            │   │
│  │  [Select All in Group]  [Edit]  [Delete]    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Create/Edit Group Modal

```
┌───────────────────────────────────────────────────┐
│  Create New Group                        [✕ Close] │
├───────────────────────────────────────────────────┤
│  Group Name: [_________________________]          │
│                                                   │
│  Select Sites for this Group:                     │
│  [Search sites...]                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │example.com│ │ site2.com│ │ site3.com│         │
│  │  ✓ Added  │ │          │ │  ✓ Added │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ site4.com│ │ site5.com│ │ site6.com│         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                   │
│  Selected: example.com, site3.com (2 sites)       │
├───────────────────────────────────────────────────┤
│           [Cancel]    [Save Group]                │
└───────────────────────────────────────────────────┘
```

### Group Selection Behavior

- Clicking **[Select All in Group]** → all sites in that group become "selected" in the All Sites view
- A selected group is visually highlighted (gradient border on group card)
- Multiple groups can be selected simultaneously — union of all sites in selected groups
- Selecting a group auto-switches to the "All Sites" tab to show which sites are now selected

---

## Right Panel: Today's Work

### Date Navigation

- Default: today's date
- Arrow buttons to navigate days (← yesterday | today | tomorrow →)
- Date picker dropdown for jumping to specific dates
- Badge showing topic count for each date (visible in date picker)

### "Add Today's Work" Modal

Opens when the user clicks **"+ Add Today's Work"** button.

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Daily Work                                      [✕ Close]  │
├─────────────────────────────────────────────────────────────────┤
│  Step 1 — Select Country                                        │
│  [🇺🇸 USA ▼ search countries...]                               │
│                                                                 │
│  Step 2 — Add Topics / Article URLs (one per line)             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Topic 1 or https://...                                    │ │
│  │ Topic 2 or https://...                                    │ │
│  │ Topic 3 or https://...                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│  (paste as many lines as needed — each line = one article/task) │
│                                                                 │
│  Step 3 — Assign Domains to Work On                            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Quick select: [All] [None]  or choose a group ▼          │ │
│  │                                                           │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │example.com│ │ site2.com│ │ site3.com│ │ site4.com│   │ │
│  │  │ SELECTED  │ │          │ │ SELECTED │ │          │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  │  (click to toggle selection — selected = gradient fill)  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [+ Add Another Country Block]  (adds a new Step 1+2+3 block)  │
├─────────────────────────────────────────────────────────────────┤
│                    [Cancel]   [Save Work Items]                 │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Country Work Entry

The user can add multiple country blocks in one session:

- Each block has: country selector + topics textarea + domain selector
- **"+ Add Another Country Block"** appends a new complete block below
- All blocks are saved together when "Save Work Items" is clicked
- Each block is collapsible (clicking country name toggles the body)

---

## Daily Work Cards (Right Panel Main View)

After adding work, the right panel shows a card for each **country** assigned that day:

```
┌─────────────────────────────────────────────────────────────────┐
│  🇺🇸 United States            8 topics · 3 domains  [▼ Expand] │
├─────────────────────────────────────────────────────────────────┤
│  Assigned Domains:                                              │
│  [example.com ✓] [site2.com ✓] [site3.com ✓]                  │
│                                                                 │
│  Topics:                                                        │
│  1.  https://example.com/topic-article-1       [✓ Done] [✕]   │
│  2.  https://example.com/topic-article-2       [✓ Done] [✕]   │
│  3.  AI trends in 2025                         [✓ Done] [✕]   │
│  4.  https://other.com/another-topic                    [✕]   │
│  ...                                                           │
│                                                                 │
│  Progress: ████████░░░░ 2/8 done                               │
└─────────────────────────────────────────────────────────────────┘
```

### Topic Item Behavior
- Each topic line has a **[✓ Done]** toggle button — marks it complete (line gets strikethrough + green tint)
- **[✕]** removes the topic from the list
- Clicking a URL topic opens it in a new tab
- Topics that are URLs show a small favicon/domain indicator

### Domain Tag Behavior (inside work card)
- Each assigned domain shown as a clickable tag
- Clicking a domain tag navigates to the Publishing Overview filtered to that domain
- Long-press (or right-click) → "Remove this domain from today's work for [country]"

---

## Progress Tracking

At the top of the right panel, a daily summary bar:

```
┌──────────────────────────────────────────────────────────┐
│  Today's Progress          Total: 24 topics              │
│  ████████████░░░░░░░░░░░░  14 done / 10 remaining       │
│  Countries: 🇺🇸 4/8  🇯🇵 6/8  🇮🇳 4/8                   │
└──────────────────────────────────────────────────────────┘
```

---

## Sites Manager — Full All-Sites View

Accessible via a **"Full Site View"** button that expands the left panel to full-width (or opens as modal):

```
┌─────────────────────────────────────────────────────────────────────┐
│  All Sites (18)  [+ Add Site]  [Search...]          [← Collapse]   │
├────────────────────────────────────────────────────────────────────┤
│  Groups Quick-Select:                                               │
│  [Tier 1] [News Sites] [Tech Blogs] [Create Group +]               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │example.com│ │ site2.com│ │ site3.com│ │ site4.com│ │ site5.com│ │
│  │ SELECTED  │ │          │ │ SELECTED │ │ SELECTED │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ site6.com│ │ site7.com│ │ site8.com│ │ site9.com│ │site10.com│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ... (all sites, side by side, wrapping grid)                       │
│                                                                     │
│  Selected (3): example.com, site3.com, site4.com    [Clear] [Use] │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Model

```typescript
interface WorkTopic {
  id: string;              // uuid
  text: string;            // raw text or URL
  isUrl: boolean;
  isDone: boolean;
  addedAt: number;
}

interface WorkEntry {
  id: string;              // uuid
  date: string;            // "YYYY-MM-DD"
  country: string;         // normalized country name
  countryCode: string;     // ISO 3166-1 alpha-2
  topics: WorkTopic[];
  assignedDomains: string[]; // list of domain strings
  createdAt: number;
  updatedAt: number;
}

interface SiteGroup {
  id: string;
  name: string;
  domains: string[];
  createdAt: number;
}

interface DailyWorkData {
  entries: WorkEntry[];
  sites: string[];          // all known domains
  groups: SiteGroup[];
  lastUpdated: number;
}
```

---

## localStorage Keys

| Key | Contents |
|-----|----------|
| `vps_daily_work` | `DailyWorkData` JSON |
| `vps_publishing_data` | Publishing overview data (see PUBLISHING_OVERVIEW.md) |
| `vps_selected_sites` | Temporary selection state for site picker |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Open "Add Today's Work" modal |
| `Ctrl+P` | Open "Add Links" modal (Publishing) |
| `Escape` | Close any open modal |
| `Ctrl+/` | Toggle keyboard shortcuts help overlay |
