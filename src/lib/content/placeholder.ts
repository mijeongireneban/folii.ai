import { contentSchema, type Content } from './schema'

// Default preview content shown in the editor before the user uploads a
// resume. Intentionally generic but shaped like a real portfolio so every
// template section has something to render.
export const PLACEHOLDER_CONTENT: Content = contentSchema.parse({
  name: 'Your Name',
  tagline: 'What you do, in one short line.',
  bio: 'Two to four sentences about what you build and why. Keep it specific. Upload your resume or tell the chat what to change, and this page updates in real time.',
  links: {},
  experience: [
    {
      company: 'Company',
      role: 'Your role',
      start: '2023',
      impact:
        'One concrete, quantified impact line. What changed because you were there.',
    },
  ],
  projects: [
    {
      title: 'Project name',
      description:
        'One sentence about what it does and why you built it.',
      tech: ['stack', 'tags', 'here'],
    },
  ],
})
