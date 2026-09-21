export interface InterviewCompleteEmailProps {
  fullName: string
  email: string
  interviewTitle: string
  overallScore: number
  strengths: string[]
  interviewId: string
}

export function InterviewCompleteEmail({
  fullName,
  email,
  interviewTitle,
  overallScore,
  strengths,
  interviewId,
}: InterviewCompleteEmailProps): string {
  const firstName = fullName.split(' ')[0] || 'Engineer'
  const scoreColor = overallScore >= 80 ? '#818cf8' : overallScore >= 60 ? '#f59e0b' : '#f87171'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'

  const strengthsHtml = strengths && strengths.length > 0
    ? `
      <div style="margin-top: 24px;">
        <p style="margin: 0 0 8px; color: #ffffff; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-family: monospace;">
          Key Strengths
        </p>
        ${strengths.slice(0, 3).map((s) => `
          <p style="margin: 0 0 6px; color: #9ca3af; font-size: 13px; padding-left: 16px; border-left: 2px solid #6366f1;">
            ${s}
          </p>
        `).join('')}
      </div>
    `
    : ''

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>Interview Complete — InterviewAI</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 560px; background-color: #09090e; border: 1px solid #1e1e2f; border-radius: 8px;">
            <tr>
              <td style="height: 3px; background-color: ${scoreColor}; border-radius: 8px 8px 0 0;"></td>
            </tr>
            <tr>
              <td style="padding: 32px 36px 24px;">
                <p style="margin: 0; color: #818cf8; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-family: monospace;">
                  // INTERVIEW COMPLETE
                </p>
                <h1 style="margin: 12px 0 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">
                  Great session, ${firstName}!
                </h1>
                <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">${interviewTitle}</p>
              </td>
            </tr>

            {/* Score */}
            <tr>
              <td style="padding: 0 36px 28px;">
                <table width="100%" style="background-color: #000000; border: 1px solid #1e1e2f; border-radius: 6px;">
                  <tr>
                    <td style="padding: 20px 24px; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace;">Overall Score</p>
                      <p style="margin: 4px 0 0; color: ${scoreColor}; font-size: 52px; font-weight: 700; letter-spacing: -0.03em;">
                        ${overallScore}
                      </p>
                      <p style="margin: 0; color: #64748b; font-size: 11px; font-family: monospace;">/ 100</p>
                    </td>
                  </tr>
                </table>

                ${strengthsHtml}

                {/* CTA */}
                <table style="margin-top: 28px;">
                  <tr>
                    <td>
                      <a
                        href="${appUrl}/interview/${interviewId}"
                        style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-family: monospace; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; padding: 12px 24px; border-radius: 6px;"
                      >
                        View Full Feedback →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px 36px; border-top: 1px solid #1e1e2f;">
                <p style="margin: 0; color: #64748b; font-size: 11px; font-family: monospace;">
                  InterviewAI • ${email}
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

