import { z } from 'zod'

export const themeSchema = z.object({
  preset: z.string().max(40).default('dark-minimal'),
})

export type ThemeSelection = z.infer<typeof themeSchema>
