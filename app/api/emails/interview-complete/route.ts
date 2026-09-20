import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/email/resend'
import { InterviewCompleteEmail } from '@/emails/interview-complete'

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, interviewTitle, overallScore, strengths, interviewId } =
      await request.json()

    if (!email || !interviewId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const html = InterviewCompleteEmail({
      fullName: fullName ?? 'Engineer',
      email,
      interviewTitle: interviewTitle ?? 'AI Interview',
      overallScore: overallScore ?? 0,
      strengths: strengths ?? [],
      interviewId,
    })

    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `📊 Your interview results — Score: ${overallScore}/100`,
      html,
    })

    if (error) {
      console.error('Resend interview-complete email error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Interview complete email route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
