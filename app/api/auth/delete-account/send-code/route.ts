import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/email/resend'

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

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirm Account Deletion</title>
        </head>
        <body style="background-color: #09090f; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; margin: 0;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #0c0d15; border: 1px solid #27273a; border-radius: 12px; padding: 32px;">
            <div style="margin-bottom: 24px;">
              <span style="font-family: monospace; font-size: 11px; color: #818cf8; letter-spacing: 0.15em; text-transform: uppercase;">// SECURITY PROTOCOL</span>
              <h1 style="color: #ffffff; font-size: 24px; margin: 8px 0 0 0; font-weight: 700;">Account Deletion Request</h1>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
              We received a request to permanently delete your <strong>InterviewAI</strong> account and purge all associated interview telemetry, resumes, and roadmap data.
            </p>

            <div style="background-color: #14142b; border: 1px solid #4338ca; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
              <span style="display: block; font-size: 12px; font-family: monospace; color: #a5b4fc; text-transform: uppercase; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 0.25em; font-family: monospace; color: #ffffff;">${code}</span>
              <span style="display: block; font-size: 11px; color: #64748b; margin-top: 8px;">Expires in 10 minutes</span>
            </div>

            <p style="color: #ef4444; font-size: 12px; line-height: 1.5; border-left: 2px solid #ef4444; padding-left: 12px; margin: 20px 0;">
              <strong>Warning:</strong> Entering this code will immediately and permanently delete your account and all data. If you did not initiate this request, please ignore this email and secure your password.
            </p>

            <div style="border-top: 1px solid #1e2030; padding-top: 20px; margin-top: 28px; text-align: center;">
              <p style="font-family: monospace; font-size: 11px; color: #64748b; margin: 0;">InterviewAI Security &middot; Automated System</p>
            </div>
          </div>
        </body>
      </html>
    `

    console.log(`[Delete Account] Verification code generated for user ${user.email}: ${code}`)

    const emailResult = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: `[ACTION REQUIRED] ${code} is your InterviewAI Account Deletion Code`,
      html: emailHtml,
    })

    if (emailResult.error) {
      console.warn('[Delete Account] Email send notice:', emailResult.error.message)
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${user.email}`,
      // For easy local development if SMTP is not hooked up:
      ...(process.env.NODE_ENV === 'development' ? { devCode: code } : {}),
    })
  } catch (err: any) {
    console.error('[send-code] error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to send confirmation code' }, { status: 500 })
  }
}
