# VPS Content Management Tool — CLAUDE.md

## Project Overview

A beautiful, dark-themed single-page web application (React + TypeScript + Tailwind CSS) designed for content managers who publish articles across multiple domains and countries. The tool has two primary dashboards accessible via a top navigation bar.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom dark theme + gradient color palette
- **State**: Zustand (lightweight global state)
- **Icons**: react-flag-kit or country-flag-icons + Lucide React
- **Clipboard**: navigator.clipboard API
- **Persistence**: localStorage (no backend required)
- **Routing**: React Router v6 (hash-based)

## Color Palette

```
Background:       #0A0F1E  (deep navy black)
Surface:          #111827  (card background)
Surface Elevated: #1A2235  (elevated card)
Border:           #1E2D45  (subtle border)
Accent Primary:   #6366F1  (indigo)
Accent Secondary: #8B5CF6  (violet)
Accent Tertiary:  #06B6D4  (cyan)
Gradient 1:       from-indigo-600 to-violet-600
Gradient 2:       from-violet-600 to-cyan-500
Gradient 3:       from-cyan-500 to-indigo-600
Success:          #10B981  (emerald)
Warning:          #F59E0B  (amber)
Danger:           #EF4444  (red)
Text Primary:     #F1F5F9  (slate-100)
Text Secondary:   #94A3B8  (slate-400)
Text Muted:       #475569  (slate-600)
```

## App Structure

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── publishing/       # Dashboard 1 components
│   │   └── dailywork/        # Dashboard 2 components
│   ├── pages/
│   │   ├── PublishingOverview.tsx
│   │   └── DailyWork.tsx
│   ├── store/
│   │   ├── publishingStore.ts
│   │   └── dailyWorkStore.ts
│   ├── utils/
│   │   ├── domainParser.ts
│   │   ├── countryUtils.ts
│   │   └── clipboardUtils.ts
│   ├── data/
│   │   └── countries.ts       # Full country list with ISO codes + flag emojis
│   ├── App.tsx
│   └── main.tsx
├── PUBLISHING_OVERVIEW.md
├── DAILY_WORK.md
├── CLAUDE.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Reference Documents

- **[PUBLISHING_OVERVIEW.md](./PUBLISHING_OVERVIEW.md)** — Full specification for Dashboard 1: Link organizer grouped by domain and country.
- **[DAILY_WORK.md](./DAILY_WORK.md)** — Full specification for Dashboard 2: Daily work topics with domain selection and site groups.

## General UI/UX Rules

1. All cards use `bg-[#111827]` with `border border-[#1E2D45]` and `rounded-xl`
2. Hover states use `hover:border-indigo-500/50` with smooth transitions
3. Gradient buttons: `bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500`
4. All text inputs: `bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`
5. Country flags rendered as emoji using ISO 3166-1 alpha-2 codes
6. Copy-to-clipboard shows a brief "Copied!" toast (green, auto-dismiss after 2s)
7. Everything persists to localStorage automatically on every state change
8. Fully responsive — works at 1280px+ desktop widths (primary target)
9. Smooth page transitions with fade-in animations

## Country Normalization

The app must handle country name variations (case-insensitive, partial match):
- "USA" / "usa" / "united states" → 🇺🇸 United States
- "UK" / "united kingdom" / "england" → 🇬🇧 United Kingdom
- "Australia" / "austerlia" (typo) → 🇦🇺 Australia (fuzzy match)
- "Japan" / "japan" → 🇯🇵 Japan
- "Singapore" / "singapore" → 🇸🇬 Singapore
- "India" / "india" → 🇮🇳 India
- "Italy" / "italy" → 🇮🇹 Italy

Use a normalization map + fuzzy fallback (Levenshtein distance ≤ 2).

## Domain Parsing

- Extract domain from full URL: `https://www.example.com/article/123` → `example.com`
- Strip `www.`, `m.` subdomains
- If input line is not a URL (no `http`), treat as plain text — may be a country name (skip for domain grouping)
- Domains with articles for 2+ countries should sort to the top of the list
