import Link from 'next/link'
import { AuthShell, fieldStyles } from '../AuthShell'
import { signIn } from '../actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  return (
    <AuthShell title="Log in" error={error}>
      <form action={signIn} style={fieldStyles.form}>
        <input type="hidden" name="next" value={next ?? '/editor'} />
        <label style={fieldStyles.label}>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{ ...fieldStyles.input, marginTop: 6, width: '100%' }}
          />
        </label>
        <label style={fieldStyles.label}>
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{ ...fieldStyles.input, marginTop: 6, width: '100%' }}
          />
        </label>
        <button type="submit" style={fieldStyles.submit}>
          Log in
        </button>
      </form>
      <div style={fieldStyles.linkRow}>
        <Link href="/auth/signup" style={fieldStyles.link}>
          Create account
        </Link>
        <Link href="/auth/forgot-password" style={fieldStyles.link}>
          Forgot password?
        </Link>
      </div>
    </AuthShell>
  )
}
