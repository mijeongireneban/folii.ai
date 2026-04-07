import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">folii.ai</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Build a developer portfolio by prompting. The template is done. You bring the words.
      </p>
      <Link href="/login" className={cn(buttonVariants({ size: 'lg' }))}>
        Get started
      </Link>
    </main>
  )
}
