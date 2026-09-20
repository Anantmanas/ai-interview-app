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
  const scoreColor = overallScore >= 80 ? '#71d083' : overallScore >= 60 ? '#f59e0b' : '#f87171'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'

  const strengthsHtml = strengths && strengths.length > 0
    ? `
      <div style="margin-top: 24px;">
        <p style="margin: 0 0 8px; color: #b5b2bc; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
          Key Strengths
        </p>
        ${strengths.slice(0, 3).map((s) => `
          <p style="margin: 0 0 6px; color: #7c7a85; font-size: 13px; padding-left: 16px; border-left: 2px solid #71d083;">
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
  <body style="margin: 0; padding: 0; background-color: #04040b; font-family: 'Courier New', monospace;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #04040b; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 560px; background-color: #0c0c10; border: 1px solid #2b292d; border-radius: 8px;">
            <tr>
              <td style="height: 3px; background-color: ${scoreColor}; border-radius: 8px 8px 0 0;"></td>
            </tr>
            <tr>
              <td style="padding: 32px 36px 24px;">
                <p style="margin: 0; color: #71d083; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;">
                  // INTERVIEW COMPLETE
                </p>
                <h1 style="margin: 12px 0 0; color: #e5e5e5; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">
                  Great session, ${firstName}!
                </h1>
                <p style="margin: 8px 0 0; color: #7c7a85; font-size: 14px;">${interviewTitle}</p>
              </td>
            </tr>

            {/* Score */}
            <tr>
              <td style="padding: 0 36px 28px;">
                <table width="100%" style="background-color: #0a0a0e; border: 1px solid #2b292d; border-radius: 6px;">
                  <tr>
                    <td style="padding: 20px 24px; text-align: center;">
                      <p style="margin: 0; color: #49474e; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">Overall Score</p>
                      <p style="margin: 4px 0 0; color: ${scoreColor}; font-size: 52px; font-weight: 700; letter-spacing: -0.03em;">
                        ${overallScore}
                      </p>
                      <p style="margin: 0; color: #49474e; font-size: 11px;">/ 100</p>
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
                        style="display: inline-block; background-color: #71d083; color: #04040b; font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; padding: 12px 24px; border-radius: 6px;"
                      >
                        View Full Feedback →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px 36px; border-top: 1px solid #2b292d;">
                <p style="margin: 0; color: #49474e; font-size: 11px;">
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

