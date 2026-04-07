import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">folii.ai</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Build a developer portfolio by prompting. The template is done. You bring the words.
      </p>
      <Button asChild size="lg">
        <Link href="/login">Get started</Link>
      </Button>
    </main>
  )
}
