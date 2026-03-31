# Dashboard 1: Publishing Overview

## Purpose

A link organizer that accepts bulk URL input (one per line), automatically extracts domains, and presents a clean visual grid grouped by domain → country. Designed to give a complete publishing overview at a glance — what's been published where, organized in a way that makes patterns visible instantly.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR  [Publishing Overview]  [Daily Work]                        │
├─────────────────────────────────────────────────────────────────────┤
│  [+ Add Links]  [Clear All]  [Search domains...]  [X domains total] │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  DOMAIN: example.com           [2 countries] [Copy All]     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ 🇺🇸 USA      │  │ 🇯🇵 Japan    │  │ 🇮🇳 India    │      │   │
│  │  │ 3 links      │  │ 2 links      │  │ 1 link       │      │   │
│  │  │ [Copy Links] │  │ [Copy Links] │  │ [Copy Links] │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  DOMAIN: another.com           [1 country]  [Copy All]      │   │
│  │  ┌──────────────┐                                           │   │
│  │  │ 🇬🇧 UK       │                                           │   │
│  │  │ 5 links      │                                           │   │
│  │  │ [Copy Links] │                                           │   │
│  │  └──────────────┘                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Quick Paste Input

### Behavior
- A large resizable `<textarea>` (at minimum 12 rows) for pasting links
- Each line is independently parsed
- Lines that are valid URLs → extract domain + attempt to infer country (if country is in the URL path or query)
- Lines that are plain text (country names) are used as the "current country context" for the lines that follow until a new country name appears

### Auto-detection Logic (Plain Text Mode)

If the user pastes:
```
USA
https://example.com/article1
https://example.com/article2
Japan
https://example.com/article3
https://other.com/article1
```
Then:
- `article1` and `article2` → domain `example.com`, country `USA`
- `article3` → domain `example.com`, country `Japan`
- `other.com/article1` → domain `other.com`, country `Japan`

### Parse Button
- "Parse & Group" button with gradient styling
- Parses all lines, groups by domain → country
- Merges with any existing data (does not overwrite — appends/deduplicates by URL)
- Clears the textarea after successful parse

---

## Section 2: Structured "Add Links" Modal

A modal dialog opened via the **"+ Add Links"** button in the header.

### Modal Layout

```
┌─────────────────────────────────────────────────────────┐
│  Add Links to Publishing Overview              [✕ Close] │
├─────────────────────────────────────────────────────────┤
│  Active Countries:                                       │
│  [🇺🇸 USA ✕]  [🇯🇵 Japan ✕]  [+ Add Country ▼]         │
├─────────────────────────────────────────────────────────┤
│  Per-Country Input Panels (one per active country)       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  🇺🇸 USA                                          │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ https://site1.com/usa-article1              │ │  │
│  │  │ https://site1.com/usa-article2              │ │  │
│  │  │ https://site2.com/usa-article1              │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  🇯🇵 Japan                                        │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ https://site1.com/japan-article1            │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│  [+ Add Another Country]                                 │
├─────────────────────────────────────────────────────────┤
│               [Cancel]   [Parse & Save All Countries]    │
└─────────────────────────────────────────────────────────┘
```

### Modal Behavior

1. User clicks **"+ Add Links"**
2. Modal opens with one country panel (no country selected yet)
3. User clicks **"+ Add Country"** → searchable dropdown of all countries with flag emojis
4. Country tag appears in the "Active Countries" bar and a text panel opens below
5. User pastes links into that country's panel (one per line)
6. User can add more countries by clicking **"+ Add Another Country"** — each adds a new panel
7. Clicking **"Parse & Save All Countries"** processes all panels simultaneously:
   - Each line in a country's panel → extract domain → assign that country
   - Merge into global publishing data
   - Close modal
8. Remove a country tag (✕) → its panel disappears (links in that panel are discarded)

### Country Search Dropdown
- Type to filter (case-insensitive)
- Shows flag emoji + full country name
- Keyboard navigable (arrow keys + Enter)
- Groups: recently used countries shown first

---

## Section 3: Domain-Country Grid (Main View)

### Sorting Rules
1. **Top group**: Domains with articles for **2 or more countries** — sorted by total country count (desc)
2. **Bottom group**: Domains with articles for only **1 country** — sorted alphabetically

### Domain Card

Each domain gets a card:

```
┌─────────────────────────────────────────────────────────────────┐
│  🌐 example.com          3 countries · 12 links   [Copy All ▼]  │
│  ─────────────────────────────────────────────────────────────  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  🇺🇸           │  │  🇯🇵           │  │  🇮🇳           │    │
│  │  United States │  │  Japan         │  │  India         │    │
│  │  4 links       │  │  5 links       │  │  3 links       │    │
│  │  [📋 Copy]     │  │  [📋 Copy]     │  │  [📋 Copy]     │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Country Chip Details

- **Flag emoji** — large (text-3xl), centered at top
- **Country name** — truncated if long
- **Link count** — "X links" badge
- **Copy button** — copies all URLs for that domain + country, one per line
- **Hover state** — border glows indigo, subtle lift shadow
- **Active/copied state** — border turns green, icon changes to ✓ for 2 seconds

### "Copy All" Domain-Level Dropdown

Clicking the **[Copy All ▼]** button on a domain card opens a small dropdown:
- "Copy All Links (All Countries)" → copies every URL for that domain, one per line
- "Copy as CSV (domain, country, url)" → CSV format
- "Copy URLs by Country (grouped with headers)" → grouped with `## USA` headers

### Domain Card Header Actions

- **Expand/Collapse** — clicking domain name toggles country chips visibility (default: expanded)
- **Delete Domain** — small trash icon (with confirmation tooltip) removes all data for that domain
- **Add More Links** — small `+` icon opens a mini panel to add more URLs for that domain

---

## Section 4: Search & Filter Bar

Located below the main action buttons:

- **Search input**: filters domains in real-time (matches domain name)
- **Country filter chips**: clicking a country chip shows only domains that have that country
- **"Multi-country only" toggle**: hides single-country domains
- **Total stats**: "X domains · Y countries · Z total links"

---

## Section 5: Persistence & Data Management

- All data stored in `localStorage` key: `vps_publishing_data`
- **Export button**: downloads a JSON file with all data
- **Import button**: accepts JSON file, merges with existing data
- **Clear All**: with a confirmation dialog (type "CLEAR" to confirm)

---

## Data Model

```typescript
interface LinkEntry {
  url: string;          // full URL
  domain: string;       // extracted bare domain (e.g. "example.com")
  country: string;      // normalized country name (e.g. "United States")
  countryCode: string;  // ISO 3166-1 alpha-2 (e.g. "US")
  addedAt: number;      // timestamp
}

interface PublishingData {
  entries: LinkEntry[];
  lastUpdated: number;
}

// Derived view (computed, not stored):
interface DomainGroup {
  domain: string;
  countries: {
    countryCode: string;
    countryName: string;
    flagEmoji: string;
    links: string[];
  }[];
  totalLinks: number;
}
```
