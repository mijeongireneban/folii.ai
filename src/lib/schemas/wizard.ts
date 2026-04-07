import { z } from 'zod'

export const WIZARD_STEPS = [
  'identity',     // name + title
  'bio',          // bio
  'currentRole',  // one experience entry
  'pastRoles',    // zero or more
  'projects',     // loop
  'skills',
  'contact',
] as const

export type WizardStep = typeof WIZARD_STEPS[number]

export const StepSchemas = {
  identity: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
  }),
  bio: z.object({ bio: z.string().min(1) }),
  currentRole: z.object({
    role: z.string(), company: z.string(), location: z.string(),
    duration: z.string(), description: z.string(),
    achievements: z.array(z.string()), technologies: z.array(z.string()),
  }),
  pastRoles: z.object({
    roles: z.array(z.object({
      role: z.string(), company: z.string(), location: z.string(),
      duration: z.string(), description: z.string(),
      achievements: z.array(z.string()), technologies: z.array(z.string()),
    })),
  }),
  projects: z.object({
    projects: z.array(z.object({
      title: z.string(), description: z.string(), tags: z.array(z.string()),
    })),
  }),
  skills: z.object({
    skills: z.array(z.object({ category: z.string(), items: z.array(z.string()) })),
  }),
  contact: z.object({ email: z.string(), message: z.string() }),
} as const
