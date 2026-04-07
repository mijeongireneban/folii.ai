import { requireUser } from '@/lib/auth/getUser'

export default async function EditLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}
