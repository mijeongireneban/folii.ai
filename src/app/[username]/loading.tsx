import { Skeleton } from '@/components/ui/skeleton'

// Server-side skeleton for the public portfolio pages. Next.js shows this
// automatically while the async page components await Supabase. Shape
// roughly mirrors the Profile card so content doesn't jump on arrival.
export default function PublicSiteLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6 rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
