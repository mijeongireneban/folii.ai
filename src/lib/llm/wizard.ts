import type { Content } from '@/types/content'
import { StepSchemas, type WizardStep } from '@/lib/schemas/wizard'
import { ContentSchema } from '@/lib/schemas/content'

interface RunArgs {
  llm: { chat: { completions: { create: (args: any) => Promise<any> } } }
  step: WizardStep
  userMessage: string
  content: Content
}

export type WizardResult =
  | { ok: true; content: Content }
  | { ok: false; error: string }

const STEP_PROMPTS: Record<WizardStep, string> = {
  identity: 'Extract the user\'s name and one-line job title from the message. Output JSON: {"name": ..., "title": ...}',
  bio: 'Extract or write a short personal bio (2-3 sentences) from the user\'s message. Output JSON: {"bio": ...}',
  currentRole: 'Extract details of the user\'s CURRENT role. Output JSON matching {role, company, location, duration, description, achievements[], technologies[]}',
  pastRoles: 'Extract any past roles mentioned. Output JSON: {"roles": [{role, company, location, duration, description, achievements[], technologies[]}]}',
  projects: 'Extract projects the user mentions. Output JSON: {"projects": [{title, description, tags[]}]}',
  skills: 'Extract skill categories and items. Output JSON: {"skills": [{category, items[]}]}',
  contact: 'Extract contact email and a short contact message. Output JSON: {"email": ..., "message": ...}',
}

export async function runWizardStep({ llm, step, userMessage, content }: RunArgs): Promise<WizardResult> {
  const res = await llm.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: STEP_PROMPTS[step] + ' Never invent facts the user did not provide; leave fields empty or as empty arrays if unknown.' },
      { role: 'user', content: userMessage },
    ],
  })
  const raw = res.choices[0].message.content
  let json
  try { json = StepSchemas[step].parse(JSON.parse(raw)) }
  catch (e) { return { ok: false, error: `step parse failed: ${(e as Error).message}` } }

  const next: Content = structuredClone(content)
  switch (step) {
    case 'identity':
      next.profile.name = (json as any).name
      next.profile.title = (json as any).title
      break
    case 'bio':
      next.profile.bio = (json as any).bio
      break
    case 'currentRole':
      next.experience.unshift({ ...(json as any), link: '#', projects: [] })
      break
    case 'pastRoles':
      next.experience.push(...(json as any).roles.map((r: any) => ({ ...r, link: '#', projects: [] })))
      break
    case 'projects':
      next.projects.push(...(json as any).projects.map((p: any, i: number) => ({
        id: `p${Date.now()}${i}`, image: '', ...p,
      })))
      break
    case 'skills':
      next.skills.push(...(json as any).skills)
      break
    case 'contact':
      next.contact = (json as any)
      break
  }

  const validated = ContentSchema.safeParse(next)
  if (!validated.success) return { ok: false, error: validated.error.message }
  return { ok: true, content: validated.data }
}
