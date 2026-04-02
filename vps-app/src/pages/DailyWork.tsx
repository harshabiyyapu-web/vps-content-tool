import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import {
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  FolderOpen,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart2,
  ExternalLink,
} from 'lucide-react'
import {
  useDailyWorkStore,
  type WorkEntry,
  type WorkTopic,
  type SiteGroup,
} from '../store/dailyWorkStore'
import { usePublishingStore } from '../store/publishingStore'
import { COUNTRIES, getFlagEmoji, type Country } from '../data/countries'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function isUrl(t: string): boolean {
  return t.startsWith('http://') || t.startsWith('https://')
}

function useToast() {
  const [toast, setToast] = useState<string | null>(null)
  const show = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])
  return { toast, show }
}

// ─── Country Dropdown ─────────────────────────────────────────────────────────

function CountryDropdown({
  onSelect,
  exclude = [],
  onClose,
}: {
  onSelect: (c: Country) => void
  exclude?: string[]
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const filtered = COUNTRIES.filter(
    (c) => !exclude.includes(c.code) && c.name.toLowerCase().includes(q.toLowerCase()),
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 w-64 bg-[#1A2235] border border-[#1E2D45] rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-2 border-b border-[#1E2D45]">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search countries..."
          className="w-full bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-600"
        />
      </div>
      <div className="max-h-52 overflow-y-auto">
        {filtered.map((c) => (
          <button
            key={c.code}
            onClick={() => { onSelect(c); onClose() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-[#111827] hover:text-slate-100 transition-colors text-left"
          >
            <span className="text-lg">{getFlagEmoji(c.code)}</span>
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Group Modal ──────────────────────────────────────────────────────────────

function GroupModal({
  group,
  allSites,
  onSave,
  onClose,
}: {
  group?: SiteGroup
  allSites: string[]
  onSave: (name: string, domains: string[]) => void
  onClose: () => void
}) {
  const [name, setName] = useState(group?.name ?? '')
  const [selected, setSelected] = useState<string[]>(group?.domains ?? [])
  const [q, setQ] = useState('')

  const filtered = allSites.filter((s) => s.includes(q.toLowerCase()))
  const toggle = (d: string) =>
    setSelected((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#1E2D45]">
          <h2 className="text-slate-100 font-semibold">{group ? 'Edit Group' : 'Create Group'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name..."
            className="w-full bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
          />
          <div>
            <p className="text-xs text-slate-500 mb-2">Select sites for this group:</p>
            <div className="relative mb-2">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sites..."
                className="w-full bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>
            {allSites.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-4">No sites yet. Add sites first.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2">
                {filtered.map((site) => {
                  const sel = selected.includes(site)
                  return (
                    <button
                      key={site}
                      onClick={() => toggle(site)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        sel
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-[#0A0F1E] border-[#1E2D45] text-slate-400 hover:border-indigo-500/30 hover:text-slate-300'
                      }`}
                    >
                      {site}
                    </button>
                  )
                })}
              </div>
            )}
            {selected.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Selected: {selected.join(', ')} ({selected.length} sites)
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#1E2D45]">
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-100 px-4 py-2">
            Cancel
          </button>
          <button
            onClick={() => { if (name.trim()) { onSave(name.trim(), selected); onClose() } }}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-lg"
          >
            Save Group
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sites Manager ─────────────────────────────────────────────────────────────

function SitesManager({
  selectedSites,
  onSelectionChange,
}: {
  selectedSites: string[]
  onSelectionChange: (sites: string[]) => void
}) {
  const { sites, groups, addSite, removeSite, createGroup, updateGroup, deleteGroup } =
    useDailyWorkStore()
  const pubEntries = usePublishingStore((s) => s.entries)
  const syncSites = useDailyWorkStore((s) => s.syncSitesFromPublishing)
  const [tab, setTab] = useState<'sites' | 'groups'>('sites')
  const [newSite, setNewSite] = useState('')
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<SiteGroup | undefined>()

  // Sync from publishing store
  useEffect(() => {
    const domains = [...new Set(pubEntries.map((e) => e.domain))]
    syncSites(domains)
  }, [pubEntries, syncSites])

  const toggleSite = (domain: string) => {
    onSelectionChange(
      selectedSites.includes(domain)
        ? selectedSites.filter((s) => s !== domain)
        : [...selectedSites, domain],
    )
  }

  const selectGroup = (group: SiteGroup) => {
    const union = [...new Set([...selectedSites, ...group.domains])]
    onSelectionChange(union)
  }

  const handleAddSite = () => {
    const d = newSite.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (d) { addSite(d); setNewSite('') }
  }

  return (
    <div className="bg-[#111827] border border-[#1E2D45] rounded-xl flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-[#1E2D45]">
        {(['sites', 'groups'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t === 'sites' ? `All Sites (${sites.length})` : `Groups (${groups.length})`}
          </button>
        ))}
      </div>

      {tab === 'sites' && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          {/* Add site */}
          <div className="flex gap-2 mb-3">
            <input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
              placeholder="Add domain..."
              className="flex-1 bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
            <button
              onClick={handleAddSite}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {selectedSites.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-indigo-400">{selectedSites.length} selected</span>
              <button
                onClick={() => onSelectionChange([])}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          )}

          {/* Site grid */}
          <div className="flex-1 overflow-y-auto">
            {sites.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-8">
                No sites yet. Add a domain or import from Publishing Overview.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sites.map((site) => {
                  const sel = selectedSites.includes(site)
                  return (
                    <div key={site} className="group relative">
                      <button
                        onClick={() => toggleSite(site)}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-all font-semibold ${
                          sel
                            ? 'bg-indigo-600/50 border-indigo-400/60 text-white'
                            : 'bg-[#1E3A5F]/60 border-indigo-800/60 text-slate-200 hover:border-indigo-500/60 hover:text-white'
                        }`}
                      >
                        {site}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSite(site) }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'groups' && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          <button
            onClick={() => { setEditingGroup(undefined); setShowGroupModal(true) }}
            className="w-full flex items-center justify-center gap-2 py-2 mb-3 border border-dashed border-[#1E2D45] rounded-xl text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors text-xs"
          >
            <Plus size={12} />
            Create Group
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {groups.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-8">
                No groups yet. Create a group to quickly select sets of sites.
              </p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-[#1A2235] border border-[#1E2D45] rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={13} className="text-indigo-400" />
                      <span className="text-sm font-medium text-slate-300">{group.name}</span>
                      <span className="text-xs text-slate-600">({group.domains.length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingGroup(group); setShowGroupModal(true) }}
                        className="text-slate-500 hover:text-indigo-400 p-1 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.domains.slice(0, 5).map((d) => (
                      <span key={d} className="text-xs text-slate-500 bg-[#0A0F1E] px-2 py-0.5 rounded">
                        {d}
                      </span>
                    ))}
                    {group.domains.length > 5 && (
                      <span className="text-xs text-slate-600">+{group.domains.length - 5} more</span>
                    )}
                  </div>
                  <button
                    onClick={() => selectGroup(group)}
                    className="w-full text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 py-1.5 rounded-lg transition-colors"
                  >
                    Select All in Group
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showGroupModal && (
        <GroupModal
          group={editingGroup}
          allSites={sites}
          onSave={(name, domains) => {
            if (editingGroup) updateGroup(editingGroup.id, name, domains)
            else createGroup(name, domains)
          }}
          onClose={() => setShowGroupModal(false)}
        />
      )}
    </div>
  )
}

// ─── Add Work Modal ────────────────────────────────────────────────────────────

function AddWorkModal({
  date,
  allSites,
  groups,
  onClose,
  onSave,
}: {
  date: string
  allSites: string[]
  groups: SiteGroup[]
  onClose: () => void
  onSave: (entries: Omit<WorkEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => void
}) {
  const [blocks, setBlocks] = useState<{
    country: Country | null
    text: string
    selectedDomains: string[]
    collapsed: boolean
    dropdownOpen: boolean
  }[]>([{ country: null, text: '', selectedDomains: [], collapsed: false, dropdownOpen: false }])

  const addBlock = () =>
    setBlocks((b) => [
      ...b,
      { country: null, text: '', selectedDomains: [], collapsed: false, dropdownOpen: false },
    ])

  const setField = <K extends keyof (typeof blocks)[0]>(
    i: number,
    key: K,
    val: (typeof blocks)[0][K],
  ) => setBlocks((b) => b.map((bl, idx) => (idx === i ? { ...bl, [key]: val } : bl)))

  const toggleDomain = (i: number, d: string) => {
    const cur = blocks[i].selectedDomains
    setField(i, 'selectedDomains', cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d])
  }

  const selectGroup = (i: number, group: SiteGroup) => {
    const union = [...new Set([...blocks[i].selectedDomains, ...group.domains])]
    setField(i, 'selectedDomains', union)
  }

  const handleSave = () => {
    const valid = blocks.filter((b) => b.country && b.text.trim())
    if (valid.length === 0) return
    const entries = valid.map((b) => {
      const topics: WorkTopic[] = b.text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((text) => ({
          id: crypto.randomUUID(),
          text,
          isUrl: isUrl(text),
          isDone: false,
          addedAt: Date.now(),
        }))
      return {
        date,
        country: b.country!.name,
        countryCode: b.country!.code,
        topics,
        assignedDomains: b.selectedDomains,
      }
    })
    onSave(entries)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#1E2D45]">
          <h2 className="text-slate-100 font-semibold text-lg">Add Daily Work — {formatDate(date)}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {blocks.map((block, i) => (
            <div key={i} className="bg-[#1A2235] border border-[#1E2D45] rounded-xl overflow-hidden">
              {/* Block header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2D45]">
                <button
                  onClick={() => setField(i, 'collapsed', !block.collapsed)}
                  className="flex items-center gap-2"
                >
                  {block.country ? (
                    <>
                      <span className="text-xl">{getFlagEmoji(block.country.code)}</span>
                      <span className="text-sm font-medium text-slate-300">{block.country.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">Block {i + 1} — select country</span>
                  )}
                  {block.collapsed ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronUp size={14} className="text-slate-500" />}
                </button>
                {blocks.length > 1 && (
                  <button
                    onClick={() => setBlocks((b) => b.filter((_, idx) => idx !== i))}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {!block.collapsed && (
                <div className="p-4 space-y-4">
                  {/* Step 1: Country */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">Step 1 — Select Country</p>
                    <div className="relative inline-block">
                      <button
                        onClick={() => setField(i, 'dropdownOpen', !block.dropdownOpen)}
                        className="flex items-center gap-2 bg-[#0A0F1E] border border-[#1E2D45] text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:border-indigo-500/50 transition-colors"
                      >
                        {block.country ? (
                          <>
                            <span>{getFlagEmoji(block.country.code)}</span>
                            <span>{block.country.name}</span>
                          </>
                        ) : (
                          <span className="text-slate-500">Choose country...</span>
                        )}
                        <ChevronDown size={13} className="text-slate-500" />
                      </button>
                      {block.dropdownOpen && (
                        <CountryDropdown
                          onSelect={(c) => {
                            setField(i, 'country', c)
                            setField(i, 'dropdownOpen', false)
                          }}
                          onClose={() => setField(i, 'dropdownOpen', false)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Step 2: Topics */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">
                      Step 2 — Add Topics / Article URLs (one per line)
                    </p>
                    <textarea
                      value={block.text}
                      onChange={(e) => setField(i, 'text', e.target.value)}
                      rows={5}
                      placeholder="Topic or URL, one per line..."
                      className="w-full bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono placeholder-slate-600"
                    />
                  </div>

                  {/* Step 3: Domains */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-slate-500">Step 3 — Assign Domains</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setField(i, 'selectedDomains', allSites)}
                          className="text-xs text-slate-500 hover:text-indigo-400"
                        >
                          All
                        </button>
                        <span className="text-slate-700">·</span>
                        <button
                          onClick={() => setField(i, 'selectedDomains', [])}
                          className="text-xs text-slate-500 hover:text-slate-300"
                        >
                          None
                        </button>
                        {groups.length > 0 && (
                          <>
                            <span className="text-slate-700">·</span>
                            {groups.map((g) => (
                              <button
                                key={g.id}
                                onClick={() => selectGroup(i, g)}
                                className="text-xs text-indigo-400 hover:text-indigo-300"
                              >
                                {g.name}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    {allSites.length === 0 ? (
                      <p className="text-xs text-slate-600">
                        No sites yet. Add sites in the Sites Manager.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {allSites.map((site) => {
                          const sel = block.selectedDomains.includes(site)
                          return (
                            <button
                              key={site}
                              onClick={() => toggleDomain(i, site)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                sel
                                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                  : 'bg-[#0A0F1E] border-[#1E2D45] text-slate-500 hover:text-slate-300 hover:border-indigo-500/30'
                              }`}
                            >
                              {site}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addBlock}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#1E2D45] rounded-xl text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors text-sm"
          >
            <Plus size={14} />
            Add Another Country Block
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#1E2D45]">
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-100 px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg shadow-lg shadow-indigo-500/20"
          >
            Save Work Items
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Topic Item ─────────────────────────────────────────────────────────────────

function TopicItem({
  topic,
  onRemove,
  allDone,
}: {
  topic: WorkTopic
  onRemove: () => void
  allDone: boolean
}) {
  return (
    <div
      className={`flex items-start gap-2 py-1.5 px-3 rounded-lg group transition-all ${
        allDone ? 'bg-emerald-500/5' : 'hover:bg-[#1A2235]'
      }`}
    >
      <div className="flex-1 min-w-0">
        {topic.isUrl ? (
          <a
            href={topic.text}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm flex items-center gap-1 hover:text-indigo-400 transition-colors ${
              allDone ? 'line-through text-slate-600' : 'text-slate-300'
            }`}
          >
            <ExternalLink size={11} className="flex-shrink-0 opacity-50" />
            <span className="truncate">{topic.text}</span>
          </a>
        ) : (
          <p
            className={`text-sm ${
              allDone ? 'line-through text-slate-600' : 'text-slate-300'
            }`}
          >
            {topic.text}
          </p>
        )}
      </div>

      <button
        onClick={onRemove}
        className="flex-shrink-0 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ─── Work Card ─────────────────────────────────────────────────────────────────

function WorkCard({ entry }: { entry: WorkEntry }) {
  const [expanded, setExpanded] = useState(true)
  const { markAllTopicsDone, removeTopic, removeEntry } = useDailyWorkStore()

  const total = entry.topics.length
  const allDone = total > 0 && entry.topics.every((t) => t.isDone)
  const progress = allDone ? 100 : 0

  const handleToggleAll = () => {
    markAllTopicsDone(entry.id, !allDone)
  }

  return (
    <div className={`bg-[#111827] border rounded-xl overflow-hidden transition-all duration-200 ${
      allDone ? 'border-emerald-500/40' : 'border-[#1E2D45] hover:border-indigo-500/20'
    }`}>
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E2D45]">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2.5"
        >
          <span className="text-2xl">{getFlagEmoji(entry.countryCode)}</span>
          <div>
            <span className="font-semibold text-slate-100">{entry.country}</span>
            <span className="text-xs text-slate-500 ml-2">
              {total} topics · {entry.assignedDomains.length} domains
            </span>
          </div>
          {expanded ? (
            <ChevronUp size={14} className="text-slate-500" />
          ) : (
            <ChevronDown size={14} className="text-slate-500" />
          )}
        </button>
        <div className="flex items-center gap-3">
          {/* Per-country checkbox */}
          <button
            onClick={handleToggleAll}
            title={allDone ? 'Mark all as not done' : 'Mark all as done'}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              allDone
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                : 'bg-[#1A2235] border-[#1E2D45] text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400'
            }`}
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
              allDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
            }`}>
              {allDone && <Check size={10} className="text-white" />}
            </span>
            {allDone ? 'Done' : 'Mark Done'}
          </button>
          <button
            onClick={() => removeEntry(entry.id)}
            className="text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#1E2D45] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Assigned domains */}
          {entry.assignedDomains.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.assignedDomains.map((d) => (
                <span
                  key={d}
                  className="text-sm font-semibold text-white bg-indigo-600/50 border border-indigo-400/60 px-3 py-1.5 rounded-lg"
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* Topics */}
          <div className="space-y-0.5">
            {entry.topics.map((topic, idx) => (
              <div key={topic.id} className="flex items-start gap-2">
                <span className="text-xs text-slate-700 w-5 text-right flex-shrink-0 mt-2">
                  {idx + 1}.
                </span>
                <div className="flex-1">
                  <TopicItem
                    topic={topic}
                    allDone={allDone}
                    onRemove={() => removeTopic(entry.id, topic.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function DailyWork() {
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const { entries, sites, groups, addWorkEntries } = useDailyWorkStore()
  const { toast, show: showToast } = useToast()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setShowAddModal(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const dateEntries = useMemo(
    () => entries.filter((e) => e.date === selectedDate),
    [entries, selectedDate],
  )


  const totalCountries = dateEntries.length
  const doneCountries = dateEntries.filter((e) => e.topics.length > 0 && e.topics.every((t) => t.isDone)).length

  const navDate = (delta: number) => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleSaveWork = (
    newEntries: Omit<WorkEntry, 'id' | 'createdAt' | 'updatedAt'>[],
  ) => {
    addWorkEntries(newEntries)
    setShowAddModal(false)
    showToast(`Added ${newEntries.reduce((s, e) => s + e.topics.length, 0)} topics`)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={15} />
              Add Today's Work
            </button>

            {/* Date nav */}
            <div className="flex items-center gap-1 bg-[#111827] border border-[#1E2D45] rounded-xl px-2 py-1">
              <button
                onClick={() => navDate(-1)}
                className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setSelectedDate(todayStr())}
                className="px-3 py-1 text-sm text-slate-300 hover:text-slate-100 transition-colors min-w-[120px] text-center"
              >
                {selectedDate === todayStr() ? 'Today' : formatDate(selectedDate)}
              </button>
              <button
                onClick={() => navDate(1)}
                className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {totalCountries > 0 && (
            <div className="flex items-center gap-3">
              <BarChart2 size={14} className="text-indigo-400" />
              <span className="text-sm text-slate-400">
                <span className="font-semibold text-slate-200">{doneCountries}/{totalCountries}</span> countries done
              </span>
              <div className="w-32 h-2 bg-[#1E2D45] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalCountries > 0 ? (doneCountries / totalCountries) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Per-country progress */}
        {dateEntries.length > 1 && (
          <div className="bg-[#111827] border border-[#1E2D45] rounded-xl p-3 mb-5 flex flex-wrap gap-3">
            {dateEntries.map((e) => {
              const done = e.topics.filter((t) => t.isDone).length
              const tot = e.topics.length
              return (
                <div key={e.id} className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{getFlagEmoji(e.countryCode)}</span>
                  <span>{done}/{tot}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Two-panel layout */}
        <div className="flex gap-5">
          {/* Left: Sites Manager */}
          <div className="w-72 flex-shrink-0" style={{ height: 'calc(100vh - 200px)' }}>
            <SitesManager
              selectedSites={selectedSites}
              onSelectionChange={setSelectedSites}
            />
          </div>

          {/* Right: Work Cards */}
          <div className="flex-1 space-y-4">
            {dateEntries.length === 0 ? (
              <div className="text-center py-20 text-slate-600">
                <Globe2 size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-slate-500">No work for {formatDate(selectedDate)}</p>
                <p className="text-sm mt-1">Click "Add Today's Work" to get started</p>
              </div>
            ) : (
              dateEntries.map((entry) => <WorkCard key={entry.id} entry={entry} />)
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddWorkModal
          date={selectedDate}
          allSites={sites}
          groups={groups}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveWork}
        />
      )}
    </div>
  )
}
