import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import {
  Plus,
  Search,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  X,
  Globe2,
  ClipboardList,
  Filter,
} from 'lucide-react'
import {
  usePublishingStore,
  groupByDomain,
  getAllCountryCodes,
  type LinkEntry,
  type DomainGroup,
} from '../store/publishingStore'
import { extractDomain, isUrl } from '../utils/domainParser'
import { normalizeCountry, isLikelyCountryName } from '../utils/countryUtils'
import { copyToClipboard } from '../utils/clipboardUtils'
import { COUNTRIES, getFlagEmoji, type Country } from '../data/countries'

// ─── Toast ───────────────────────────────────────────────────────────────────

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
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm p-3 text-center">No results</p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => { onSelect(c); onClose() }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-[#111827] hover:text-slate-100 transition-colors text-left"
            >
              <span className="text-lg">{getFlagEmoji(c.code)}</span>
              {c.name}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Add Links Modal ──────────────────────────────────────────────────────────

function AddLinksModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (data: { country: Country; text: string }[]) => void
}) {
  const [blocks, setBlocks] = useState<{ country: Country | null; text: string }[]>([
    { country: null, text: '' },
  ])
  const [dropdownIdx, setDropdownIdx] = useState<number | null>(null)

  const addBlock = () => setBlocks((b) => [...b, { country: null, text: '' }])
  const removeBlock = (i: number) => setBlocks((b) => b.filter((_, idx) => idx !== i))
  const setCountry = (i: number, c: Country) =>
    setBlocks((b) => b.map((bl, idx) => (idx === i ? { ...bl, country: c } : bl)))
  const setText = (i: number, t: string) =>
    setBlocks((b) => b.map((bl, idx) => (idx === i ? { ...bl, text: t } : bl)))

  const handleSave = () => {
    const valid = blocks.filter((b) => b.country && b.text.trim())
    if (valid.length === 0) return
    onSave(valid as { country: Country; text: string }[])
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E2D45]">
          <h2 className="text-slate-100 font-semibold text-lg">Add Links to Publishing Overview</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {blocks.map((block, i) => (
            <div key={i} className="bg-[#1A2235] border border-[#1E2D45] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <button
                    onClick={() => setDropdownIdx(dropdownIdx === i ? null : i)}
                    className="flex items-center gap-2 bg-[#0A0F1E] border border-[#1E2D45] text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:border-indigo-500/50 transition-colors"
                  >
                    {block.country ? (
                      <>
                        <span>{getFlagEmoji(block.country.code)}</span>
                        <span>{block.country.name}</span>
                      </>
                    ) : (
                      <span className="text-slate-500">Select country...</span>
                    )}
                    <ChevronDown size={14} className="text-slate-500 ml-1" />
                  </button>
                  {dropdownIdx === i && (
                    <CountryDropdown
                      onSelect={(c) => setCountry(i, c)}
                      onClose={() => setDropdownIdx(null)}
                    />
                  )}
                </div>
                {blocks.length > 1 && (
                  <button
                    onClick={() => removeBlock(i)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <textarea
                value={block.text}
                onChange={(e) => setText(i, e.target.value)}
                rows={5}
                placeholder="Paste URLs here, one per line..."
                className="w-full bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none placeholder-slate-600 font-mono"
              />
            </div>
          ))}

          <button
            onClick={addBlock}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#1E2D45] rounded-xl text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors text-sm"
          >
            <Plus size={14} />
            Add Another Country
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#1E2D45]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
          >
            Parse & Save All Countries
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Copy All Dropdown ─────────────────────────────────────────────────────────

function CopyAllDropdown({
  group,
  onCopy,
  onClose,
}: {
  group: DomainGroup
  onCopy: (text: string, label: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const allLinks = group.countries.flatMap((c) => c.links)
  const csv = ['domain,country,url', ...group.countries.flatMap((c) =>
    c.links.map((url) => `${group.domain},${c.countryName},${url}`)
  )].join('\n')
  const grouped = group.countries
    .map((c) => `## ${c.countryName}\n${c.links.join('\n')}`)
    .join('\n\n')

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-1 w-64 bg-[#1A2235] border border-[#1E2D45] rounded-xl shadow-2xl z-40 overflow-hidden"
    >
      {[
        { label: 'Copy All Links (All Countries)', text: allLinks.join('\n') },
        { label: 'Copy as CSV', text: csv },
        { label: 'Copy URLs by Country (grouped)', text: grouped },
      ].map((opt) => (
        <button
          key={opt.label}
          onClick={() => { onCopy(opt.text, opt.label); onClose() }}
          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-[#111827] hover:text-slate-100 transition-colors"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Domain Card ──────────────────────────────────────────────────────────────

function DomainCard({
  group,
  onToast,
}: {
  group: DomainGroup
  onToast: (msg: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [showCopyMenu, setShowCopyMenu] = useState(false)
  const [copiedCountry, setCopiedCountry] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const removeDomain = usePublishingStore((s) => s.removeDomain)

  const handleCopyCountry = async (countryCode: string, links: string[]) => {
    await copyToClipboard(links.join('\n'))
    setCopiedCountry(countryCode)
    onToast('Copied!')
    setTimeout(() => setCopiedCountry(null), 2000)
  }

  const handleCopyAll = async (text: string) => {
    await copyToClipboard(text)
    onToast('Copied!')
  }

  const handleDelete = () => {
    if (confirmDelete) {
      removeDomain(group.domain)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="bg-[#111827] border border-[#1E2D45] rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E2D45]">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2.5 text-left"
        >
          <Globe2 size={16} className="text-indigo-400 flex-shrink-0" />
          <span className="font-semibold text-slate-100">{group.domain}</span>
          <span className="text-xs text-slate-500 bg-[#0A0F1E] px-2 py-0.5 rounded-full">
            {group.countries.length} {group.countries.length === 1 ? 'country' : 'countries'}
          </span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">{group.totalLinks} links</span>
          {expanded ? (
            <ChevronUp size={14} className="text-slate-500" />
          ) : (
            <ChevronDown size={14} className="text-slate-500" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowCopyMenu((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 bg-[#1A2235] hover:bg-[#0A0F1E] border border-[#1E2D45] px-2.5 py-1.5 rounded-lg transition-all"
            >
              <Copy size={12} />
              Copy All
              <ChevronDown size={10} />
            </button>
            {showCopyMenu && (
              <CopyAllDropdown
                group={group}
                onCopy={handleCopyAll}
                onClose={() => setShowCopyMenu(false)}
              />
            )}
          </div>
          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete domain'}
            className={`p-1.5 rounded-lg transition-all ${
              confirmDelete
                ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Country Sections with full link lists */}
      {expanded && (
        <div className="divide-y divide-[#1E2D45]">
          {group.countries.map((country) => {
            const copied = copiedCountry === country.countryCode
            return (
              <div key={country.countryCode} className="p-4">
                {/* Country header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFlagEmoji(country.countryCode)}</span>
                    <span className="text-sm font-semibold text-slate-200">{country.countryName}</span>
                    <span className="text-xs text-slate-500 bg-[#0A0F1E] px-2 py-0.5 rounded-full">
                      {country.links.length} links
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCountry(country.countryCode, country.links)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      copied
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40'
                        : 'text-slate-400 bg-[#1A2235] border-[#1E2D45] hover:text-indigo-300 hover:border-indigo-500/50'
                    }`}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
                {/* Full link list */}
                <div className="space-y-1 pl-9">
                  {country.links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 group/link">
                      <span className="text-xs text-slate-700 w-4 flex-shrink-0 text-right">{idx + 1}.</span>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-indigo-400 truncate flex-1 font-mono transition-colors"
                        title={link}
                      >
                        {link}
                      </a>
                      <button
                        onClick={async () => { await copyToClipboard(link); onToast('Copied!') }}
                        className="opacity-0 group-hover/link:opacity-100 text-slate-600 hover:text-indigo-400 transition-all flex-shrink-0"
                        title="Copy link"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Quick Paste Section ───────────────────────────────────────────────────────

function QuickPasteSection({ onParsed }: { onParsed: (entries: LinkEntry[]) => void }) {
  const [text, setText] = useState('')

  const handleParse = () => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const entries: LinkEntry[] = []
    let currentCountry: { code: string; name: string } | null = null

    for (const line of lines) {
      if (isLikelyCountryName(line)) {
        const c = normalizeCountry(line)
        if (c) currentCountry = { code: c.code, name: c.name }
        continue
      }
      if (isUrl(line)) {
        const domain = extractDomain(line)
        if (!domain) continue
        const country = currentCountry ?? { code: 'XX', name: 'Unknown' }
        entries.push({
          url: line,
          domain,
          country: country.name,
          countryCode: country.code,
          addedAt: Date.now(),
        })
      }
    }

    if (entries.length > 0) {
      onParsed(entries)
      setText('')
    }
  }

  return (
    <div className="bg-[#111827] border border-[#1E2D45] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-indigo-400" />
          <span className="text-sm font-medium text-slate-300">Quick Paste</span>
          <span className="text-xs text-slate-600">
            — type a country name, then paste URLs below it
          </span>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={`USA\nhttps://example.com/article1\nhttps://example.com/article2\n\nJapan\nhttps://other.com/article1`}
        className="w-full bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y font-mono placeholder-slate-700"
      />
      <div className="flex justify-end mt-3">
        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
        >
          <ClipboardList size={14} />
          Parse & Group
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function PublishingOverview() {
  const { entries, addEntries, clearAll, importData } = usePublishingStore()
  const [searchText, setSearchText] = useState('')
  const [activeCountries, setActiveCountries] = useState<string[]>([])
  const [multiCountryOnly, setMultiCountryOnly] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQuickPaste, setShowQuickPaste] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const { toast, show: showToast } = useToast()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowAddModal(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const groups = useMemo(() => groupByDomain(entries), [entries])
  const allCountryCodes = useMemo(() => getAllCountryCodes(entries), [entries])

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (searchText && !g.domain.includes(searchText.toLowerCase())) return false
      if (multiCountryOnly && g.countries.length < 2) return false
      if (activeCountries.length > 0) {
        const has = g.countries.some((c) => activeCountries.includes(c.countryCode))
        if (!has) return false
      }
      return true
    })
  }, [groups, searchText, multiCountryOnly, activeCountries])

  const toggleCountryFilter = (code: string) => {
    setActiveCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const handleModalSave = (data: { country: { code: string; name: string }; text: string }[]) => {
    const newEntries: LinkEntry[] = []
    for (const { country, text } of data) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      for (const line of lines) {
        if (!isUrl(line)) continue
        const domain = extractDomain(line)
        if (!domain) continue
        newEntries.push({
          url: line,
          domain,
          country: country.name,
          countryCode: country.code,
          addedAt: Date.now(),
        })
      }
    }
    addEntries(newEntries)
    setShowAddModal(false)
    showToast(`Added ${newEntries.length} links`)
  }

  const handleExport = () => {
    const data = JSON.stringify({ entries, exportedAt: Date.now() }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `publishing-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        const toImport: LinkEntry[] = data.entries ?? data
        importData(toImport)
        showToast(`Imported ${toImport.length} links`)
      } catch {
        showToast('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearAll = () => {
    if (confirmClear) {
      clearAll()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  const totalLinks = entries.length
  const totalDomains = groups.length
  const totalCountries = allCountryCodes.length

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={15} />
              Add Links
            </button>

            <button
              onClick={() => setShowQuickPaste((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 bg-[#111827] hover:bg-[#1A2235] border border-[#1E2D45] rounded-lg transition-all"
            >
              <ClipboardList size={14} />
              Quick Paste
            </button>

            <button
              onClick={handleClearAll}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                confirmClear
                  ? 'text-red-400 bg-red-500/10 border-red-500/30'
                  : 'text-slate-500 hover:text-slate-300 bg-[#111827] border-[#1E2D45] hover:border-red-500/30'
              }`}
            >
              <Trash2 size={14} />
              {confirmClear ? 'Confirm Clear All' : 'Clear All'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 bg-[#111827] border border-[#1E2D45] px-3 py-1.5 rounded-lg">
              {totalDomains} domains · {totalCountries} countries · {totalLinks} links
            </span>

            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 bg-[#111827] border border-[#1E2D45] hover:border-indigo-500/50 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <Upload size={12} />
              Import
            </button>
            <button
              onClick={handleExport}
              disabled={entries.length === 0}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 disabled:opacity-40 bg-[#111827] border border-[#1E2D45] hover:border-indigo-500/50 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        {/* Quick Paste */}
        {showQuickPaste && (
          <QuickPasteSection
            onParsed={(newEntries) => {
              addEntries(newEntries)
              showToast(`Added ${newEntries.length} links`)
            }}
          />
        )}

        {/* Search + Filter Bar */}
        <div className="bg-[#111827] border border-[#1E2D45] rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search domains..."
                className="w-full bg-[#0A0F1E] border border-[#1E2D45] text-slate-100 text-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
              />
            </div>
            <button
              onClick={() => setMultiCountryOnly((s) => !s)}
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all ${
                multiCountryOnly
                  ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/40'
                  : 'text-slate-500 bg-[#0A0F1E] border-[#1E2D45] hover:border-indigo-500/30'
              }`}
            >
              <Filter size={12} />
              Multi-country only
            </button>
            {activeCountries.length > 0 && (
              <button
                onClick={() => setActiveCountries([])}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Country filter chips */}
          {allCountryCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allCountryCodes.map((code) => {
                const name = entries.find((e) => e.countryCode === code)?.country ?? code
                const active = activeCountries.includes(code)
                return (
                  <button
                    key={code}
                    onClick={() => toggleCountryFilter(code)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${
                      active
                        ? 'text-indigo-200 bg-indigo-500/20 border-indigo-500/40'
                        : 'text-slate-500 bg-[#0A0F1E] border-[#1E2D45] hover:border-indigo-500/30 hover:text-slate-300'
                    }`}
                  >
                    <span>{getFlagEmoji(code)}</span>
                    {name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Domain Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <Globe2 size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-500">No links yet</p>
            <p className="text-sm mt-1">Use "Add Links" or paste URLs in the Quick Paste section</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <DomainCard key={group.domain} group={group} onToast={showToast} />
            ))}
          </div>
        )}
      </div>

      {/* Add Links Modal */}
      {showAddModal && (
        <AddLinksModal onClose={() => setShowAddModal(false)} onSave={handleModalSave} />
      )}
    </div>
  )
}
