'use client'
export function UsernameClaim(props: {
  portfolioId: string; username: string | null; onChange: (u: string) => void
}) {
  return <span className="text-sm">{props.username ?? 'no username'}</span>
}
