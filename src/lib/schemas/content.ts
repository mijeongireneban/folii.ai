import { z } from 'zod'

export const CaseStudySectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  image: z.string(),
  bullets: z.array(z.string()),
})

export const CaseStudySchema = z.object({
  title: z.string(),
  client: z.string(),
  timeline: z.string(),
  year: z.string(),
  summary: z.string(),
  mainImage: z.string(),
  tags: z.array(z.string()),
  sections: z.array(CaseStudySectionSchema),
  testimonial: z.object({
    quote: z.string(),
    author: z.string(),
    role: z.string(),
  }),
  tools: z.array(z.string()),
  link: z.string(),
})

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  caseStudy: CaseStudySchema.optional(),
})

export const WorkExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  location: z.string(),
  duration: z.string(),
  description: z.string(),
  achievements: z.array(z.string()),
  technologies: z.array(z.string()),
  link: z.string(),
  projects: z.array(ProjectSchema),
})

export const SkillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
})

export const ProfileSchema = z.object({
  // .min(1) intentionally omitted: empty string is valid here so emptyContent()
  // passes validation. Required-field enforcement happens at the publish gate.
  name: z.string(),
  title: z.string(),
  bio: z.string(),
  avatar: z.string(),
  location: z.string(),
  links: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
  }),
})

export const ContentSchema = z.object({
  profile: ProfileSchema,
  experience: z.array(WorkExperienceSchema),
  projects: z.array(ProjectSchema),
  skills: z.array(SkillCategorySchema),
  contact: z.object({
    email: z.string(),
    message: z.string(),
  }),
})

export type Content = z.infer<typeof ContentSchema>

export function emptyContent(): Content {
  return {
    profile: { name: '', title: '', bio: '', avatar: '', location: '', links: {} },
    experience: [],
    projects: [],
    skills: [],
    contact: { email: '', message: '' },
  }
}
