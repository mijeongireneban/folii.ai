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

// Split a blob string on bullets/newlines into discrete items.
function splitBlob(s: string): string[] {
  return s
    .split(/\r?\n|(?<=[.!?])\s+(?=[A-Z•▸▪◦\-*])|\s*[•▸▪◦]\s+/)
    .map((x) => x.replace(/^[-*•▸▪◦\s]+/, '').trim())
    .filter(Boolean)
}

function coerceStringArray(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
  }
  if (typeof v === 'string') return splitBlob(v)
  return []
}

function coerceExperience(v: unknown): Obj[] | undefined {
  if (!Array.isArray(v)) return undefined
  return v.map((raw) => {
    if (!isObj(raw)) return raw as Obj
    const out: Obj = { ...raw }

    // Strip nulls from experience fields.
    for (const key of Object.keys(out)) {
      if (out[key] === null) delete out[key]
    }

    // Coerce string fields that LLM sometimes returns as arrays.
    for (const key of ['impact', 'company', 'role', 'start', 'end', 'location'] as const) {
      if (Array.isArray(out[key])) {
        out[key] = (out[key] as unknown[]).filter((x) => typeof x === 'string').join(' ')
      }
    }

    // Synonyms for description -> impact fallback.
    if (typeof out.impact !== 'string' && typeof out.description === 'string') {
      out.impact = out.description
    }
    if ('achievements' in out) {
      out.achievements = coerceStringArray(out.achievements)
    } else if (Array.isArray(out.bullets)) {
      out.achievements = coerceStringArray(out.bullets)
      delete out.bullets
    } else if (Array.isArray(out.highlights)) {
      out.achievements = coerceStringArray(out.highlights)
      delete out.highlights
    }
    if ('technologies' in out) {
      out.technologies = coerceStringArray(out.technologies)
    } else if ('tech' in out) {
      out.technologies = coerceStringArray(out.tech)
      delete out.tech
    } else if ('stack' in out) {
      out.technologies = coerceStringArray(out.stack)
      delete out.stack
    }
    return out
  })
}

function coerceProjects(v: unknown): Obj[] | undefined {
  if (!Array.isArray(v)) return undefined
  return v.map((raw) => {
    if (!isObj(raw)) return raw as Obj
    const out: Obj = { ...raw }

    // Strip nulls from project fields.
    for (const key of Object.keys(out)) {
      if (out[key] === null) delete out[key]
    }

    // Coerce string fields that LLM sometimes returns as arrays.
    for (const key of ['description', 'title', 'category', 'built_with'] as const) {
      if (Array.isArray(out[key])) {
        out[key] = (out[key] as unknown[]).filter((x) => typeof x === 'string').join(' ')
      }
    }

    // Coerce URL fields — bare domains, strip invalid values.
    for (const key of ['url', 'repo', 'release_url', 'screenshot'] as const) {
      if (key in out) {
        const coerced = ensureUrl(out[key])
        if (coerced) out[key] = coerced
        else delete out[key]
      }
    }

    if (!('tech' in out)) {
      if (Array.isArray(out.technologies)) {
        out.tech = coerceStringArray(out.technologies)
        delete out.technologies
      } else if (Array.isArray(out.stack)) {
        out.tech = coerceStringArray(out.stack)
        delete out.stack
      } else if (Array.isArray(out.tags)) {
        out.tech = coerceStringArray(out.tags)
        delete out.tags
      }
    } else {
      out.tech = coerceStringArray(out.tech)
    }
    // Release link synonyms.
    if (!out.release_url && typeof out.releases === 'string') {
      out.release_url = out.releases
      delete out.releases
    }
    // Built-with synonyms.
    if (!out.built_with && typeof out.builtWith === 'string') {
      out.built_with = out.builtWith
      delete out.builtWith
    }
    return out
  })
}

// Skills come in wildly inconsistent shapes. Normalize to:
//   [{ category, icon?, items: [] }]
function coerceSkills(v: unknown): Obj[] | undefined {
  // Already looks right: array of { category, items }.
  if (Array.isArray(v)) {
    // If it's a flat array of strings, wrap into a single "Skills" category.
    if (v.every((x) => typeof x === 'string')) {
      const items = coerceStringArray(v)
      return items.length > 0 ? [{ category: 'Skills', items }] : undefined
    }
    const out: Obj[] = []
    for (const raw of v) {
      if (!isObj(raw)) continue
      const category =
        (raw.category as string | undefined) ??
        (raw.name as string | undefined) ??
        (raw.group as string | undefined) ??
        (raw.title as string | undefined)
      if (!category || typeof category !== 'string') continue
      const rawItems =
        (raw.items as unknown) ??
        (raw.skills as unknown) ??
        (raw.tools as unknown) ??
        (raw.tags as unknown) ??
        []
      // items can be strings or objects like { name: "Python" }.
      let items: string[]
      if (Array.isArray(rawItems)) {
        items = rawItems
          .map((it) =>
            typeof it === 'string'
              ? it
              : isObj(it) && typeof it.name === 'string'
              ? (it.name as string)
              : ''
          )
          .filter(Boolean)
      } else {
        items = coerceStringArray(rawItems)
      }
      const entry: Obj = { category: category.trim(), items }
      if (typeof raw.icon === 'string' && raw.icon.trim()) entry.icon = raw.icon.trim()
      out.push(entry)
    }
    return out.length > 0 ? out : undefined
  }
  // Object keyed by category name.
  if (isObj(v)) {
    const out: Obj[] = []
    for (const [category, val] of Object.entries(v)) {
      const items = coerceStringArray(val)
      if (items.length > 0) out.push({ category, items })
    }
    return out.length > 0 ? out : undefined
  }
  return undefined
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

  if ('experience' in out) {
    const coerced = coerceExperience(out.experience)
    if (coerced !== undefined) out.experience = coerced
  }

  if ('projects' in out) {
    const coerced = coerceProjects(out.projects)
    if (coerced !== undefined) out.projects = coerced
  }

  if ('skills' in out) {
    const coerced = coerceSkills(out.skills)
    if (coerced === undefined) {
      delete out.skills
    } else {
      out.skills = coerced
    }
  }

  // headline_points: allow a single string OR an array.
  if ('headline_points' in out) {
    out.headline_points = coerceStringArray(out.headline_points)
  }

  // Normalize hidden_sections to valid keys only.
  if ('hidden_sections' in out) {
    const valid = new Set(['experience', 'skills', 'projects', 'contact', 'blog'])
    out.hidden_sections = coerceStringArray(out.hidden_sections)
      .map((s) => (s as string).toLowerCase().trim())
      .filter((s) => valid.has(s))
  }

  // Drop well-known top-level decorative fields if the model smuggled them in.
  delete out.icon
  delete out.banner_image
  delete out.illustration

  // Strip null values — LLM returns null for optional fields but Zod expects undefined.
  for (const key of Object.keys(out)) {
    if (out[key] === null) delete out[key]
  }

  return out
}

// ---------------------------------------------------------------------------
// Blog post coercion — lighter than portfolio, mostly slug normalization
// and null stripping.
// ---------------------------------------------------------------------------
export function coerceBlogPost(input: unknown): unknown {
  if (!isObj(input)) return input
  const out: Obj = { ...input }

  // Strip null values — LLM returns null for optional fields.
  for (const key of Object.keys(out)) {
    if (out[key] === null) delete out[key]
  }

  // Normalize slug: lowercase, replace spaces/underscores with hyphens,
  // strip non-URL-safe chars, collapse multiple hyphens.
  if (typeof out.slug === 'string') {
    out.slug = out.slug
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  } else if (typeof out.title === 'string') {
    // Auto-generate slug from title if missing.
    out.slug = out.title
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Coerce tags to string array.
  if ('tags' in out) {
    out.tags = coerceStringArray(out.tags)
  }

  return out
}
