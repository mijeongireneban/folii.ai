import { z } from 'zod'

// v1 SWE portfolio content schema — single source of truth.
// Every downstream piece (LLM extraction, template renderer, chat-to-patch,
// publish) reads/writes against this schema. TypeScript types are derived via
// z.infer — never hand-written. Per DESIGN.md §4 and §7, no decorative fields:
// icon, banner_image, illustration, etc. are deliberately absent.

const trimmed = (max: number) => z.string().trim().min(1).max(max)
const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? undefined : v))

export const linksSchema = z.object({
  github: z.string().url().max(200).optional(),
  twitter: z.string().url().max(200).optional(),
  linkedin: z.string().url().max(200).optional(),
  instagram: z.string().url().max(200).optional(),
  website: z.string().url().max(200).optional(),
})

export const projectSchema = z.object({
  title: trimmed(80),
  description: trimmed(400),
  url: z.string().url().max(200).optional(),
  repo: z.string().url().max(200).optional(),
  tech: z.array(trimmed(32)).max(20).default([]),
  // Optional content image — the engineer's own screenshot, not decoration.
  screenshot: z.string().url().max(500).optional(),
  screenshot_alt: optionalTrimmed(160),
  // Projects page extras (v2 template): category pill, "built with" credit.
  category: optionalTrimmed(40), // e.g. "Web App", "Desktop App", "Mobile App"
  built_with: optionalTrimmed(40), // e.g. "Claude Code", "Cursor"
  release_url: z.string().url().max(200).optional(),
})

export const experienceSchema = z.object({
  company: trimmed(80),
  role: trimmed(80),
  start: trimmed(20), // free-form date string, e.g. "Jan 2022"
  end: z.string().trim().max(20).optional(), // undefined or "" → current
  impact: trimmed(240), // one-line impact summary used by accordion header
  // Experience page extras (v2 template):
  location: optionalTrimmed(80),
  achievements: z.array(trimmed(500)).max(15).default([]),
  technologies: z.array(trimmed(40)).max(60).default([]),
})

// Skills are organized by category, matching abt-mj's SkillsPage grid.
export const skillCategorySchema = z.object({
  category: trimmed(40),
  // Optional lucide icon name (e.g. "Code2", "Server", "Globe").
  // Renderer maps known names to components; unknown names fall back to a dot.
  icon: optionalTrimmed(40),
  items: z.array(trimmed(40)).max(30).default([]),
})

export const educationSchema = z.object({
  school: trimmed(120),
  degree: trimmed(120),
  year: trimmed(20),
})

export const contentSchema = z.object({
  name: trimmed(80),
  tagline: trimmed(120),
  bio: trimmed(1200),
  links: linksSchema.default({}),
  experience: z.array(experienceSchema).max(20).default([]),
  projects: z.array(projectSchema).max(20).default([]),
  education: z.array(educationSchema).max(10).optional(),
  // v2 template additions
  location: optionalTrimmed(80), // "San Francisco Bay Area, CA"
  timezone: optionalTrimmed(60), // IANA TZ, e.g. "America/Los_Angeles"
  email: optionalTrimmed(120),
  avatar: z.string().url().max(500).optional(),
  avatar_initials: optionalTrimmed(4),
  headline_points: z.array(trimmed(120)).max(4).default([]),
  years_experience: optionalTrimmed(20),
  skills: z.array(skillCategorySchema).max(10).default([]),
  resume_url: z.string().url().max(500).optional(),
})

export type Links = z.infer<typeof linksSchema>
export type Project = z.infer<typeof projectSchema>
export type Experience = z.infer<typeof experienceSchema>
export type Education = z.infer<typeof educationSchema>
export type SkillCategory = z.infer<typeof skillCategorySchema>
export type Content = z.infer<typeof contentSchema>
