import { z } from 'zod'

export const blogPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  body: z.string().min(1).max(50000),
  excerpt: z.string().trim().max(300).optional(),
  tags: z.array(z.string().trim().max(40)).max(10).default([]),
  source: z.enum(['chat', 'import', 'github']).default('chat'),
  status: z.enum(['draft', 'published']).default('draft'),
})

export type BlogPost = z.infer<typeof blogPostSchema>
