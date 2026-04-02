export function isUrl(line: string): boolean {
  const t = line.trim()
  return t.startsWith('http://') || t.startsWith('https://')
}

export function extractDomain(url: string): string | null {
  try {
    const u = new URL(url.trim())
    let hostname = u.hostname
    hostname = hostname.replace(/^(www\.|m\.)/, '')
    return hostname || null
  } catch {
    return null
  }
}
