import * as React from 'react'

interface PaymentFailedEmailProps {
  fullName: string
  email: string
}

export function PaymentFailedEmail({ fullName, email }: PaymentFailedEmailProps) {
  const firstName = fullName.split(' ')[0] || 'Engineer'

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Payment Failed — InterviewAI</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#04040b', fontFamily: '"Courier New", monospace' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#04040b', padding: '40px 20px' }}>
          <tr>
            <td align="center">
              <table width="100%" style={{ maxWidth: 560, backgroundColor: '#1a0a0a', border: '1px solid #5c1d28', borderRadius: 8 }}>
                <tr>
                  <td style={{ height: 3, backgroundColor: '#f87171', borderRadius: '8px 8px 0 0' }} />
                </tr>
                <tr>
                  <td style={{ padding: '32px 36px 24px' }}>
                    <p style={{ margin: 0, color: '#f87171', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      // PAYMENT FAILED
                    </p>
                    <h1 style={{ margin: '12px 0 0', color: '#e5e5e5', fontSize: 26, fontWeight: 700 }}>
                      Action Required, {firstName}
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#7c7a85', fontSize: 14 }}>
                      Your subscription payment could not be processed. Please update your payment method to continue using Pro features.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0 36px 28px' }}>
                    <table style={{ marginTop: 8 }}>
                      <tr>
                        <td>
                          <a
                            href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'}/dashboard/billing`}
                            style={{ display: 'inline-block', backgroundColor: '#f87171', color: '#04040b', fontFamily: '"Courier New", monospace', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 24px', borderRadius: 6 }}
                          >
                            Update Payment Method →
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style={{ margin: '20px 0 0', color: '#49474e', fontSize: 12 }}>
                      Your account will be downgraded to Free if payment is not received within 7 days.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '20px 36px', borderTop: '1px solid #5c1d28' }}>
                    <p style={{ margin: 0, color: '#49474e', fontSize: 11 }}>
                      InterviewAI • {email}
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
