'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

function getOrigin(h: Headers): string {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL
  if (envOrigin) return envOrigin.replace(/\/$/, '')
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')
  if (!email || !password) {
    redirect('/auth/signup?error=missing')
  }
  if (password !== confirmPassword) {
    redirect('/auth/signup?error=Passwords%20do%20not%20match')
  }

  const supabase = await createClient()
  const origin = getOrigin(await headers())
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })
  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/auth/signup?check=1')
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/editor')
  if (!email || !password) {
    redirect('/auth/login?error=missing')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }
  redirect(next || '/editor')
}

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) redirect('/auth/forgot-password?error=missing')

  const supabase = await createClient()
  const origin = getOrigin(await headers())
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  })
  if (error) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/auth/forgot-password?sent=1')
}

export async function resetPassword(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  if (!password) redirect('/auth/reset-password?error=missing')

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/editor')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
