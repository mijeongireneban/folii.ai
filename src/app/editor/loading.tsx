import { Skeleton } from '@/components/ui/skeleton'

// Rendered by Next.js while /editor server component is fetching user + site.
// Matches TopBar + split workspace shape so the layout doesn't jump.
export default function EditorLoading() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-3.5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_400px]">
        <section className="flex min-w-0 border-r border-white/5 bg-[#050505] p-6">
          <Skeleton className="h-full w-full rounded-xl" />
        </section>
        <aside className="flex min-h-0 flex-col bg-black">
          <div className="flex flex-1 flex-col gap-3 p-5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-4 h-10 w-2/3 self-end rounded-xl" />
            <Skeleton className="h-10 w-3/4 rounded-xl" />
          </div>
          <div className="flex gap-2 border-t border-white/5 p-4">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
          </div>
        </aside>
      </div>
    </main>
  )
}
