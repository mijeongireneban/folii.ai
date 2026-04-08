import { contentSchema, type Content } from './schema'

// Default preview content shown in the editor before the user uploads a
// resume. Intentionally generic but shaped like a real portfolio so every
// v2 template section (Profile/Experience/Skills/Projects/Contact) has
// something to render.
export const PLACEHOLDER_CONTENT: Content = contentSchema.parse({
  name: 'Your Name',
  tagline: 'What you do, in one short line.',
  bio: 'Two to four sentences about what you build and why. Keep it specific. Upload your resume or tell the chat what to change, and this page updates in real time.',
  location: 'City, Country',
  timezone: 'America/Los_Angeles',
  email: 'you@example.com',
  avatar_initials: 'YN',
  headline_points: [
    'One-line highlight about your craft.',
    'Another thing that sets you apart.',
  ],
  years_experience: '5+ years',
  links: {},
  experience: [
    {
      company: 'Company',
      role: 'Your role',
      start: '2023',
      impact:
        'One concrete, quantified impact line. What changed because you were there.',
      location: 'Remote',
      achievements: [
        'A specific thing you shipped and the metric it moved.',
        'Another outcome worth calling out, past tense, concrete.',
      ],
      technologies: ['TypeScript', 'React', 'PostgreSQL'],
    },
  ],
  projects: [
    {
      title: 'Project name',
      description: 'One sentence about what it does and why you built it.',
      tech: ['TypeScript', 'Next.js'],
      category: 'Web App',
    },
  ],
  skills: [
    {
      category: 'Languages',
      icon: 'Code2',
      items: ['TypeScript', 'Python', 'Go'],
    },
    {
      category: 'Frontend',
      icon: 'Globe',
      items: ['React', 'Next.js', 'Tailwind CSS'],
    },
    {
      category: 'Backend',
      icon: 'Server',
      items: ['Node.js', 'FastAPI', 'PostgreSQL'],
    },
  ],
})
