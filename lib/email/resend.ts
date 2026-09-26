interface SendEmailOptions {
  from: string
  to: string | string[]
  subject: string
  html: string
}

interface ResendResponse {
  data: { id: string } | null
  error: { message: string; name?: string } | null
}

function createResendClient() {
  const apiKey = process.env.RESEND_API_KEY || ''

  return {
    emails: {
      async send(options: SendEmailOptions): Promise<ResendResponse> {
        if (!apiKey || apiKey === 'your-resend-api-key' || apiKey === 're_...') {
          console.warn('[Resend] RESEND_API_KEY is missing or unconfigured. Email will not be delivered to inbox:', options.subject)
          return { data: null, error: { message: 'RESEND_API_KEY is not configured in .env file' } }
        }

        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
          })

          const json = await res.json().catch(() => ({}))

          if (!res.ok) {
            return {
              data: null,
              error: { message: json?.message || `Resend API failed (${res.status})` },
            }
          }

          return { data: json, error: null }
        } catch (err: any) {
          return { data: null, error: { message: err?.message || 'Network error sending email' } }
        }
      },
    },
  }
}

export const resend = createResendClient()
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
export const FROM_NAME = 'InterviewAI'

