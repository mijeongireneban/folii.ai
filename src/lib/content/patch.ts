import { applyPatch, deepClone, Operation } from 'fast-json-patch'
import { ContentSchema, type Content } from '@/lib/schemas/content'

export type PatchResult =
  | { ok: true; content: Content }
  | { ok: false; error: string }

export function applyPatchValidated(
  before: Content,
  patch: Operation[],
): PatchResult {
  let next: unknown
  try {
    next = applyPatch(deepClone(before), patch, true, false).newDocument
  } catch (err) {
    return { ok: false, error: `patch apply failed: ${(err as Error).message}` }
  }
  const parsed = ContentSchema.safeParse(next)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message }
  }
  return { ok: true, content: parsed.data }
}
