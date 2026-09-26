import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

declare global {
  // eslint-disable-next-line no-var
  var __deleteAccountOtpStore: Map<string, { code: string; email: string; expiresAt: number }> | undefined
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const code = (body.code || '').trim()

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit verification code.' }, { status: 400 })
    }

    // 1. Check in-memory store
    const otpStore = global.__deleteAccountOtpStore
    const memoryStored = otpStore?.get(user.id)

    // 2. Check Supabase user_metadata store (Vercel serverless persistence)
    const metaOtp = user.user_metadata?.delete_account_otp as { code: string; expiresAt: number } | undefined

    const storedCode = memoryStored?.code || metaOtp?.code
    const expiresAt = memoryStored?.expiresAt || metaOtp?.expiresAt

    if (!storedCode) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new code.' },
        { status: 400 }
      )
    }

    if (expiresAt && Date.now() > expiresAt) {
      otpStore?.delete(user.id)
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    if (storedCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your email and try again.' },
        { status: 400 }
      )
    }

    // Code is valid -> Clear OTP
    otpStore?.delete(user.id)
    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          delete_account_otp: null,
        },
      })
    } catch {}

    console.log(`[Delete Account] Permanently purging user account and telemetry for ID: ${user.id}`)

    // 1. Delete user from auth.users via supabaseAdmin
    // (PostgreSQL foreign keys on profiles, resumes, interviews, etc. will cascade delete all data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[Delete Account] Failed to delete user via admin API:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete account: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Sign out user session
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
    })
  } catch (err: any) {
    console.error('[verify-delete] error:', err)
    return NextResponse.json(
      { error: err?.message || 'An error occurred while deleting account' },
      { status: 500 }
    )
  }
}
