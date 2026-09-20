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
  <body style="margin: 0; padding: 0; background-color: #04040b; font-family: 'Courier New', monospace;">
    <table width="100%" cellPadding="0" cellSpacing="0" style="background-color: #04040b; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 560px; background-color: #0c0c10; border: 1px solid #2b292d; border-radius: 8px;">
            {/* Header */}
            <tr>
              <td style="height: 3px; background-color: #71d083; border-radius: 8px 8px 0 0;"></td>
            </tr>
            <tr>
              <td style="padding: 32px 36px 24px;">
                <p style="margin: 0; color: #71d083; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;">
                  // WELCOME TO INTERVIEWAI
                </p>
                <h1 style="margin: 12px 0 0; color: #e5e5e5; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
                  Ready to ace your interviews, ${firstName}?
                </h1>
              </td>
            </tr>

            {/* Body */}
            <tr>
              <td style="padding: 0 36px 28px;">
                <p style="margin: 0; color: #7c7a85; font-size: 15px; line-height: 1.7;">
                  Your InterviewAI account is live. You have{' '}
                  <strong style="color: #71d083;">3 free AI interviews</strong> this month
                  to practice technical rounds, system design, and behavioral sessions.
                </p>

                {/* Feature list */}
                <table width="100%" style="margin-top: 24px; background-color: #0a0a0e; border: 1px solid #2b292d; border-radius: 6px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      ${features.map((item) => `<p style="margin: 0 0 8px; color: #b5b2bc; font-size: 13px;">${item}</p>`).join('')}
                    </td>
                  </tr>
                </table>

                {/* CTA */}
                <table style="margin-top: 28px;">
                  <tr>
                    <td>
                      <a
                        href="${appUrl}/interview/new"
                        style="display: inline-block; background-color: #71d083; color: #04040b; font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; padding: 12px 24px; border-radius: 6px;"
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
              <td style="padding: 20px 36px; border-top: 1px solid #2b292d;">
                <p style="margin: 0; color: #49474e; font-size: 11px; letter-spacing: 0.04em;">
                  InterviewAI • ${email}
                </p>
                <p style="margin: 4px 0 0; color: #49474e; font-size: 11px;">
                  <a href="${appUrl}/privacy" style="color: #70b8ff;">Privacy</a>
                  {' · '}
                  <a href="${appUrl}/terms" style="color: #70b8ff;">Terms</a>
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

