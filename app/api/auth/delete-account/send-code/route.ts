import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/email/resend'
import { DeleteAccountEmail } from '@/emails/delete-account-code'

// Global in-memory fallback
declare global {
  // eslint-disable-next-line no-var
  var __deleteAccountOtpStore: Map<string, { code: string; email: string; expiresAt: number }> | undefined
}

if (!global.__deleteAccountOtpStore) {
  global.__deleteAccountOtpStore = new Map()
}

const otpStore = global.__deleteAccountOtpStore

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to request a verification code.' }, { status: 401 })
    }

    // Generate 6-digit secure code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    // 1. Store in memory
    otpStore.set(user.id, {
      code,
      email: user.email,
      expiresAt,
    })

    // 2. Persist in Supabase user_metadata for reliable multi-serverless access on Vercel
    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          delete_account_otp: { code, expiresAt },
        },
      })
    } catch (dbErr) {
      console.warn('[send-code] failed to write OTP to user_metadata:', dbErr)
    }

    const emailHtml = DeleteAccountEmail({ email: user.email, code })

    console.log(`[Delete Account] Generating verification code for ${user.email}: ${code}`)

    const emailResult = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: `[ACTION REQUIRED] ${code} is your InterviewAI Account Deletion Code`,
      html: emailHtml,
    })

    const isApiKeyConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key')

    if (emailResult.error) {
      console.error('[Delete Account] Resend email send failed:', emailResult.error.message)
    } else {
      console.log(`[Delete Account] Verification email delivered to ${user.email} (ID: ${emailResult.data?.id})`)
    }

    // If Resend failed (e.g. sandbox email restriction with onboarding@resend.dev or missing env var)
    return NextResponse.json({
      success: true,
      message: isApiKeyConfigured && !emailResult.error
        ? `Verification code sent to ${user.email}`
        : `Verification code generated for ${user.email}`,
      resendStatus: emailResult.error ? 'failed' : 'sent',
      resendError: emailResult.error?.message,
      // Provide devCode fallback if Resend errored or in dev mode so the user is never stuck
      ...(Boolean(emailResult.error) || !isApiKeyConfigured || process.env.NODE_ENV === 'development' ? { devCode: code } : {}),
    })
  } catch (err: any) {
    console.error('[send-code] error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to send confirmation code' }, { status: 500 })
  }
}
