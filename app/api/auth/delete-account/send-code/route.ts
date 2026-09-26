import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/email/resend'
import { DeleteAccountEmail } from '@/emails/delete-account-code'

// Global OTP store with 10-minute expiration
// Map<userId, { code: string; email: string; expiresAt: number }>
declare global {
  // eslint-disable-next-line no-var
  var __deleteAccountOtpStore: Map<string, { code: string; email: string; expiresAt: number }> | undefined
}

if (!global.__deleteAccountOtpStore) {
  global.__deleteAccountOtpStore = new Map()
}

const otpStore = global.__deleteAccountOtpStore

export function getStoredOtp(userId: string) {
  return otpStore.get(userId)
}

export function clearStoredOtp(userId: string) {
  otpStore.delete(userId)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate 6-digit secure code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    otpStore.set(user.id, {
      code,
      email: user.email,
      expiresAt,
    })

    const emailHtml = DeleteAccountEmail({ email: user.email, code })

    console.log(`[Delete Account] Verification code generated for user ${user.email}: ${code}`)

    const emailResult = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: `[ACTION REQUIRED] ${code} is your InterviewAI Account Deletion Code`,
      html: emailHtml,
    })

    if (emailResult.error) {
      console.error('[Delete Account] Resend email send failed:', emailResult.error.message)
    } else {
      console.log(`[Delete Account] Verification email sent to ${user.email} (ID: ${emailResult.data?.id})`)
    }

    const isApiKeyConfigured = Boolean(process.env.RESEND_API_KEY)

    return NextResponse.json({
      success: true,
      message: isApiKeyConfigured && !emailResult.error
        ? `Verification code sent to ${user.email}`
        : `Verification code generated for ${user.email}`,
      // Provide devCode fallback if API key is not configured or in dev
      ...((!isApiKeyConfigured || Boolean(emailResult.error) || process.env.NODE_ENV === 'development') ? { devCode: code } : {}),
    })
  } catch (err: any) {
    console.error('[send-code] error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to send confirmation code' }, { status: 500 })
  }
}
