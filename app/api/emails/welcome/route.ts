import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/email/resend'
import { WelcomeEmail } from '@/emails/welcome'

export async function POST(request: NextRequest) {
  try {
    const { email, fullName } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const html = WelcomeEmail({ fullName: fullName ?? 'Engineer', email })

    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: '🚀 Welcome to InterviewAI — Fast-Track Your Dream Tech Role',
      html,
    })

    if (error) {
      console.error('Resend welcome email error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Welcome email route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
