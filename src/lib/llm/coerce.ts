// Defensive coercion for LLM output that is shape-adjacent but not
// schema-valid. Keep this pure so we can unit-test it without hitting
// the network. Each branch targets a specific mis-shaping seen in the
// wild; new branches should include a comment pointing at the raw output
// that prompted them.

type Obj = Record<string, unknown>

function isObj(v: unknown): v is Obj {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function ensureUrl(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  if (!s) return undefined
  if (/^https?:\/\//i.test(s)) return s
  // Bare domain like "github.com/maya" -> "https://github.com/maya"
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(s)) return `https://${s}`
  return undefined
}

// Given a URL, guess which links-field it belongs to.
function classifyLink(url: string): keyof LinksShape | null {
  const u = url.toLowerCase()
  if (u.includes('github.com')) return 'github'
  if (u.includes('linkedin.com')) return 'linkedin'
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter'
  return null
}

type LinksShape = {
  github?: string
  twitter?: string
  linkedin?: string
  website?: string
}

function coerceLinks(v: unknown): LinksShape {
  if (isObj(v)) {
    const out: LinksShape = {}
    for (const [k, val] of Object.entries(v)) {
      const url = ensureUrl(val)
      if (!url) continue
      if (k === 'github' || k === 'twitter' || k === 'linkedin' || k === 'website') {
        out[k] = url
      } else {
        const guessed = classifyLink(url)
        if (guessed) out[guessed] = url
        else if (!out.website) out.website = url
      }
    }
    return out
  }
  if (Array.isArray(v)) {
    // LLM returned an array of URLs. Classify by domain.
    const out: LinksShape = {}
    for (const item of v) {
      const url = ensureUrl(item)
      if (!url) continue
      const guessed = classifyLink(url)
      if (guessed) {
        out[guessed] = url
      } else if (!out.website) {
        out.website = url
      }
    }
    return out
  }
  return {}
}

function coerceEducation(v: unknown): Obj[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: Obj[] = []
  for (const raw of v) {
    if (!isObj(raw)) continue
    // Accept a few synonyms the LLM sometimes uses.
    const school =
      (raw.school as string | undefined) ??
      (raw.institution as string | undefined) ??
      (raw.university as string | undefined) ??
      (raw.name as string | undefined)
    const degree =
      (raw.degree as string | undefined) ??
      (raw.qualification as string | undefined) ??
      (raw.program as string | undefined)
    const year =
      (raw.year as string | undefined) ??
      (raw.graduation as string | undefined) ??
      (raw.end as string | undefined) ??
      (raw.date as string | undefined)
    // Only include entries that can satisfy all three required fields.
    if (
      typeof school === 'string' &&
      typeof degree === 'string' &&
      typeof year === 'string' &&
      school.trim() &&
      degree.trim() &&
      year.trim()
    ) {
      out.push({ school: school.trim(), degree: degree.trim(), year: year.trim() })
    }
  }
  return out.length > 0 ? out : undefined
}

export function coerceContent(input: unknown): unknown {
  if (!isObj(input)) return input
  const out: Obj = { ...input }

  if ('links' in out) {
    out.links = coerceLinks(out.links)
  }

  if ('education' in out) {
    const coerced = coerceEducation(out.education)
    if (coerced === undefined) {
      delete out.education
    } else {
      out.education = coerced
    }
  }

  // Drop well-known decorative fields if the model smuggled them in.
  delete out.icon
  delete out.banner_image
  delete out.illustration

  return out
}
