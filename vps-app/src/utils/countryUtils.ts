import { COUNTRIES, type Country } from '../data/countries'

// Common aliases / abbreviations
const ALIASES: Record<string, string> = {
  usa: 'US',
  'u.s.a.': 'US',
  'u.s.': 'US',
  'united states of america': 'US',
  'united states': 'US',
  america: 'US',
  uk: 'GB',
  'u.k.': 'GB',
  england: 'GB',
  'great britain': 'GB',
  britain: 'GB',
  scotland: 'GB',
  wales: 'GB',
  uae: 'AE',
  'u.a.e.': 'AE',
  emirates: 'AE',
  korea: 'KR',
  'south korea': 'KR',
  'north korea': 'KP',
  czechia: 'CZ',
  'czech republic': 'CZ',
  russia: 'RU',
  taiwan: 'TW',
  'hong kong': 'HK',
  macau: 'MO',
  macao: 'MO',
  iran: 'IR',
  syria: 'SY',
  burma: 'MM',
  myanmar: 'MM',
  'ivory coast': 'CI',
  'cape verde': 'CV',
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function normalizeCountry(input: string): Country | null {
  const lower = input.trim().toLowerCase()
  if (!lower || lower.length < 2) return null

  // 1. Alias lookup
  const aliasCode = ALIASES[lower]
  if (aliasCode) {
    return COUNTRIES.find((c) => c.code === aliasCode) ?? null
  }

  // 2. Exact match (case-insensitive)
  const exact = COUNTRIES.find((c) => c.name.toLowerCase() === lower)
  if (exact) return exact

  // 3. Starts-with match
  const startsWith = COUNTRIES.find(
    (c) =>
      c.name.toLowerCase().startsWith(lower) ||
      lower.startsWith(c.name.toLowerCase()),
  )
  if (startsWith) return startsWith

  // 4. Fuzzy match (Levenshtein ≤ 2 for strings > 5 chars)
  if (lower.length < 4) return null
  const maxDist = lower.length > 7 ? 2 : 1
  let best: Country | null = null
  let bestDist = maxDist + 1
  for (const country of COUNTRIES) {
    const dist = levenshtein(lower, country.name.toLowerCase())
    if (dist < bestDist) {
      bestDist = dist
      best = country
    }
  }
  return best
}

export function isLikelyCountryName(line: string): boolean {
  const t = line.trim()
  if (t.startsWith('http') || t.includes('/') || t.includes('.') || t.length > 60) {
    return false
  }
  return normalizeCountry(t) !== null
}
