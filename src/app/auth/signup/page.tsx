import Link from 'next/link'
import { AuthShell, fieldStyles } from '../AuthShell'
import { signUp } from '../actions'
import { SubmitButton } from '../SubmitButton'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check?: string }>
}) {
  const { error, check } = await searchParams
  return (
    <AuthShell
      title="Create account"
      subtitle="Upload a resume, refine via chat, publish in five minutes."
      error={error}
      notice={check ? 'Check your email to confirm your account.' : undefined}
    >
      <form action={signUp} style={fieldStyles.form}>
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
            minLength={8}
            autoComplete="new-password"
            style={{ ...fieldStyles.input, marginTop: 6, width: '100%' }}
          />
        </label>
        <SubmitButton style={fieldStyles.submit} pendingLabel="Creating account…">
          Sign up
        </SubmitButton>
      </form>
      <div style={fieldStyles.linkRow}>
        <Link href="/auth/login" style={fieldStyles.link}>
          Already have an account? Log in
        </Link>
      </div>
    </AuthShell>
  )
}
