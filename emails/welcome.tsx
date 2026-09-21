export interface WelcomeEmailProps {
  fullName: string
  email: string
}

export function WelcomeEmail({ fullName, email }: WelcomeEmailProps): string {
  const firstName = fullName.split(' ')[0] || 'Engineer'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'

  const features = [
    '🧠 AI-powered interview simulations',
    '📄 Resume-based personalisation',
    '📊 Real-time performance analytics',
    '🗺️ Personalised learning roadmap',
  ]

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to InterviewAI</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellPadding="0" cellSpacing="0" style="background-color: #000000; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 560px; background-color: #09090e; border: 1px solid #1e1e2f; border-radius: 8px;">
            {/* Header */}
            <tr>
              <td style="height: 3px; background-color: #4f46e5; border-radius: 8px 8px 0 0;"></td>
            </tr>
            <tr>
              <td style="padding: 32px 36px 24px;">
                <p style="margin: 0; color: #818cf8; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-family: monospace;">
                  // WELCOME TO INTERVIEWAI
                </p>
                <h1 style="margin: 12px 0 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
                  Ready to ace your interviews, ${firstName}?
                </h1>
              </td>
            </tr>

            {/* Body */}
            <tr>
              <td style="padding: 0 36px 28px;">
                <p style="margin: 0; color: #9ca3af; font-size: 15px; line-height: 1.7;">
                  Your InterviewAI account is live. You have{' '}
                  <strong style="color: #818cf8;">3 free AI interviews</strong> this month
                  to practice technical rounds, system design, and behavioral sessions.
                </p>

                {/* Feature list */}
                <table width="100%" style="margin-top: 24px; background-color: #000000; border: 1px solid #1e1e2f; border-radius: 6px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      ${features.map((item) => `<p style="margin: 0 0 8px; color: #ffffff; font-size: 13px;">${item}</p>`).join('')}
                    </td>
                  </tr>
                </table>

                {/* CTA */}
                <table style="margin-top: 28px;">
                  <tr>
                    <td>
                      <a
                        href="${appUrl}/interview/new"
                        style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-family: monospace; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; padding: 12px 24px; border-radius: 6px;"
                      >
                        Start Your First Interview →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            {/* Footer */}
            <tr>
              <td style="padding: 20px 36px; border-top: 1px solid #1e1e2f;">
                <p style="margin: 0; color: #64748b; font-size: 11px; letter-spacing: 0.04em;">
                  InterviewAI • ${email}
                </p>
                <p style="margin: 4px 0 0; color: #64748b; font-size: 11px;">
                  <a href="${appUrl}/privacy" style="color: #818cf8;">Privacy</a>
                  {' · '}
                  <a href="${appUrl}/terms" style="color: #818cf8;">Terms</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

