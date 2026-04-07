import { createAdminClient } from '@/lib/supabase/admin'

const DAILY_LIMIT = 100

export async function checkAndIncrement(userId: string): Promise<{ ok: boolean; remaining: number }> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: portfolios } = await supabase
    .from('portfolios').select('id').eq('user_id', userId)
  const ids = (portfolios ?? []).map((p) => p.id)
  if (ids.length === 0) return { ok: true, remaining: DAILY_LIMIT }

  const { count } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
    .in('portfolio_id', ids)
    .eq('role', 'user')
  const used = count ?? 0
  return { ok: used < DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used - 1) }
}
