import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LinkEntry {
  url: string
  domain: string
  country: string
  countryCode: string
  addedAt: number
}

export interface CountryGroup {
  countryCode: string
  countryName: string
  links: string[]
}

export interface DomainGroup {
  domain: string
  countries: CountryGroup[]
  totalLinks: number
}

interface PublishingState {
  entries: LinkEntry[]
  addEntries: (entries: LinkEntry[]) => void
  removeDomain: (domain: string) => void
  removeCountryFromDomain: (domain: string, countryCode: string) => void
  clearAll: () => void
  importData: (entries: LinkEntry[]) => void
}

export const usePublishingStore = create<PublishingState>()(
  persist(
    (set) => ({
      entries: [],
      addEntries: (newEntries) =>
        set((state) => {
          const existing = new Set(state.entries.map((e) => e.url))
          const toAdd = newEntries.filter((e) => !existing.has(e.url))
          return { entries: [...state.entries, ...toAdd] }
        }),
      removeDomain: (domain) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.domain !== domain),
        })),
      removeCountryFromDomain: (domain, countryCode) =>
        set((state) => ({
          entries: state.entries.filter(
            (e) => !(e.domain === domain && e.countryCode === countryCode),
          ),
        })),
      clearAll: () => set({ entries: [] }),
      importData: (entries) =>
        set((state) => {
          const existing = new Set(state.entries.map((e) => e.url))
          const toAdd = entries.filter((e) => !existing.has(e.url))
          return { entries: [...state.entries, ...toAdd] }
        }),
    }),
    { name: 'vps_publishing_data' },
  ),
)

export function groupByDomain(entries: LinkEntry[]): DomainGroup[] {
  const map = new Map<string, Map<string, CountryGroup>>()

  for (const entry of entries) {
    if (!map.has(entry.domain)) map.set(entry.domain, new Map())
    const domainMap = map.get(entry.domain)!
    if (!domainMap.has(entry.countryCode)) {
      domainMap.set(entry.countryCode, {
        countryCode: entry.countryCode,
        countryName: entry.country,
        links: [],
      })
    }
    domainMap.get(entry.countryCode)!.links.push(entry.url)
  }

  const groups: DomainGroup[] = []
  for (const [domain, countryMap] of map) {
    const countries = Array.from(countryMap.values())
    groups.push({
      domain,
      countries,
      totalLinks: countries.reduce((s, c) => s + c.links.length, 0),
    })
  }

  // Multi-country domains first (sorted by country count desc), then alphabetical
  return groups.sort((a, b) => {
    const aM = a.countries.length >= 2
    const bM = b.countries.length >= 2
    if (aM && !bM) return -1
    if (!aM && bM) return 1
    if (aM && bM) return b.countries.length - a.countries.length
    return a.domain.localeCompare(b.domain)
  })
}

export function getAllCountryCodes(entries: LinkEntry[]): string[] {
  return [...new Set(entries.map((e) => e.countryCode))]
}
