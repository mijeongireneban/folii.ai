import Link from 'next/link'
import { AuthShell, fieldStyles } from '../AuthShell'
import { forgotPassword } from '../actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const { error, sent } = await searchParams
  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link."
      error={error}
      notice={sent ? 'Reset link sent. Check your inbox.' : undefined}
    >
      <form action={forgotPassword} style={fieldStyles.form}>
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
        <button type="submit" style={fieldStyles.submit}>
          Send reset link
        </button>
      </form>
      <div style={fieldStyles.linkRow}>
        <Link href="/auth/login" style={fieldStyles.link}>
          Back to log in
        </Link>
      </div>
    </AuthShell>
  )
}
