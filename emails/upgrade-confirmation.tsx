import * as React from 'react'

interface UpgradeConfirmationEmailProps {
  fullName: string
  email: string
  plan: string
  amount: string
  nextBillingDate: string
}

export function UpgradeConfirmationEmail({
  fullName,
  email,
  plan,
  amount,
  nextBillingDate,
}: UpgradeConfirmationEmailProps) {
  const firstName = fullName.split(' ')[0] || 'Engineer'

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Welcome to Pro — InterviewAI</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#04040b', fontFamily: '"Courier New", monospace' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#04040b', padding: '40px 20px' }}>
          <tr>
            <td align="center">
              <table width="100%" style={{ maxWidth: 560, backgroundColor: '#0a1a0e', border: '1px solid #366740', borderRadius: 8 }}>
                <tr>
                  <td style={{ height: 3, backgroundColor: '#71d083', borderRadius: '8px 8px 0 0' }} />
                </tr>
                <tr>
                  <td style={{ padding: '32px 36px 24px' }}>
                    <p style={{ margin: 0, color: '#71d083', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      // UPGRADE CONFIRMED
                    </p>
                    <h1 style={{ margin: '12px 0 0', color: '#e5e5e5', fontSize: 28, fontWeight: 700 }}>
                      Welcome to Pro, {firstName}! 🎉
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#7c7a85', fontSize: 14 }}>
                      Your subscription is now active. Enjoy unlimited interviews.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0 36px 28px' }}>
                    <table width="100%" style={{ backgroundColor: '#0c0c10', border: '1px solid #2b292d', borderRadius: 6 }}>
                      <tr><td style={{ padding: '20px 24px' }}>
                        <p style={{ margin: '0 0 8px', color: '#49474e', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Receipt</p>
                        <p style={{ margin: '0 0 4px', color: '#b5b2bc', fontSize: 13 }}>Plan: <strong style={{ color: '#e5e5e5' }}>{plan}</strong></p>
                        <p style={{ margin: '0 0 4px', color: '#b5b2bc', fontSize: 13 }}>Amount: <strong style={{ color: '#71d083' }}>{amount}</strong></p>
                        <p style={{ margin: 0, color: '#b5b2bc', fontSize: 13 }}>Next billing: <strong style={{ color: '#e5e5e5' }}>{nextBillingDate}</strong></p>
                      </td></tr>
                    </table>

                    <table style={{ marginTop: 24 }}>
                      <tr>
                        <td>
                          <a
                            href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'}/interview/new`}
                            style={{ display: 'inline-block', backgroundColor: '#71d083', color: '#04040b', fontFamily: '"Courier New", monospace', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 24px', borderRadius: 6 }}
                          >
                            Start Practicing →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '20px 36px', borderTop: '1px solid #2b292d' }}>
                    <p style={{ margin: 0, color: '#49474e', fontSize: 11 }}>
                      Questions? <a href="mailto:support@interviewai.app" style={{ color: '#70b8ff' }}>support@interviewai.app</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}
