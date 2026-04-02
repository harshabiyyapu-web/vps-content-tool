import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WorkTopic {
  id: string
  text: string
  isUrl: boolean
  isDone: boolean
  addedAt: number
}

export interface WorkEntry {
  id: string
  date: string // YYYY-MM-DD
  country: string
  countryCode: string
  topics: WorkTopic[]
  assignedDomains: string[]
  createdAt: number
  updatedAt: number
}

export interface SiteGroup {
  id: string
  name: string
  domains: string[]
  createdAt: number
}

interface DailyWorkState {
  entries: WorkEntry[]
  sites: string[]
  groups: SiteGroup[]
  addWorkEntries: (
    entries: Omit<WorkEntry, 'id' | 'createdAt' | 'updatedAt'>[],
  ) => void
  toggleTopicDone: (entryId: string, topicId: string) => void
  markAllTopicsDone: (entryId: string, done: boolean) => void
  removeTopic: (entryId: string, topicId: string) => void
  removeEntry: (entryId: string) => void
  addSite: (domain: string) => void
  removeSite: (domain: string) => void
  syncSitesFromPublishing: (domains: string[]) => void
  createGroup: (name: string, domains: string[]) => void
  updateGroup: (id: string, name: string, domains: string[]) => void
  deleteGroup: (id: string) => void
}

export const useDailyWorkStore = create<DailyWorkState>()(
  persist(
    (set) => ({
      entries: [],
      sites: [],
      groups: [],
      addWorkEntries: (newEntries) =>
        set((state) => {
          const now = Date.now()
          const toAdd: WorkEntry[] = newEntries.map((e) => ({
            ...e,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          }))
          return { entries: [...state.entries, ...toAdd] }
        }),
      toggleTopicDone: (entryId, topicId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  updatedAt: Date.now(),
                  topics: e.topics.map((t) =>
                    t.id === topicId ? { ...t, isDone: !t.isDone } : t,
                  ),
                }
              : e,
          ),
        })),
      markAllTopicsDone: (entryId, done) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  updatedAt: Date.now(),
                  topics: e.topics.map((t) => ({ ...t, isDone: done })),
                }
              : e,
          ),
        })),
      removeTopic: (entryId, topicId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  updatedAt: Date.now(),
                  topics: e.topics.filter((t) => t.id !== topicId),
                }
              : e,
          ),
        })),
      removeEntry: (entryId) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
        })),
      addSite: (domain) =>
        set((state) => ({
          sites: state.sites.includes(domain)
            ? state.sites
            : [...state.sites, domain],
        })),
      removeSite: (domain) =>
        set((state) => ({
          sites: state.sites.filter((s) => s !== domain),
        })),
      syncSitesFromPublishing: (domains) =>
        set((state) => {
          const existing = new Set(state.sites)
          const toAdd = domains.filter((d) => !existing.has(d))
          return toAdd.length ? { sites: [...state.sites, ...toAdd] } : state
        }),
      createGroup: (name, domains) =>
        set((state) => ({
          groups: [
            ...state.groups,
            {
              id: crypto.randomUUID(),
              name,
              domains,
              createdAt: Date.now(),
            },
          ],
        })),
      updateGroup: (id, name, domains) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, name, domains } : g,
          ),
        })),
      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        })),
    }),
    { name: 'vps_daily_work' },
  ),
)
