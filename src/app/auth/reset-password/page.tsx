import { AuthShell, fieldStyles } from '../AuthShell'
import { resetPassword } from '../actions'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <AuthShell
      title="Set new password"
      subtitle="Pick a new password for your account."
      error={error}
    >
      <form action={resetPassword} style={fieldStyles.form}>
        <label style={fieldStyles.label}>
          New password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            style={{ ...fieldStyles.input, marginTop: 6, width: '100%' }}
          />
        </label>
        <button type="submit" style={fieldStyles.submit}>
          Update password
        </button>
      </form>
    </AuthShell>
  )
}
