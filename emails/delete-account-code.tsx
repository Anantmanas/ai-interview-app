export interface DeleteAccountEmailProps {
  email: string
  code: string
}

export function DeleteAccountEmail({ email, code }: DeleteAccountEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Confirm Account Deletion</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellPadding="0" cellSpacing="0" style="background-color: #000000; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 540px; background-color: #090912; border: 1px solid #1e2030; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
            
            <!-- Top Glowing Ambient Accent -->
            <tr>
              <td style="height: 3px; background: linear-gradient(90deg, #ef4444, #f59e0b, #6366f1);"></td>
            </tr>

            <!-- Apple Terminal Titlebar -->
            <tr>
              <td style="background-color: #11121b; padding: 12px 20px; border-bottom: 1px solid #1e2030;">
                <table width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td align="left">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #ff5f56; margin-right: 6px;"></span>
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #ffbd2e; margin-right: 6px;"></span>
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #27c93f; margin-right: 12px;"></span>
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; color: #9ca3af; letter-spacing: 0.05em;">
                        security-protocol.sh — purge_auth
                      </span>
                    </td>
                    <td align="right">
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 10px; color: #ef4444; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                        CRITICAL ACTION
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px 28px 24px;">
                <p style="margin: 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600;">
                  // AUTHORIZATION REQUIRED
                </p>
                <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
                  Account Deletion Confirmation
                </h1>
                <p style="margin: 14px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  We received a formal request to permanently delete your <strong>InterviewAI</strong> account associated with <span style="color: #ffffff; font-family: monospace;">${email}</span>.
                </p>

                <!-- Verification Code Box -->
                <div style="margin: 26px 0; background-color: #0c0d18; border: 1px solid #3730a3; border-radius: 10px; padding: 24px 16px; text-align: center;">
                  <span style="display: block; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; color: #818cf8; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px;">
                    6-DIGIT VERIFICATION CODE
                  </span>
                  <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 0.25em; text-shadow: 0 0 20px rgba(99,102,241,0.5);">
                    ${code}
                  </div>
                  <span style="display: inline-block; margin-top: 10px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; color: #64748b;">
                    ⏱️ Code expires in 10 minutes
                  </span>
                </div>

                <!-- Warning notice -->
                <div style="background-color: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 4px; padding: 12px 16px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #fca5a5; font-size: 12px; line-height: 1.6;">
                    <strong>Permanent Data Purge:</strong> Entering this code will permanently erase all your interview telemetry records, custom roadmaps, uploaded resumes, and billing links. This action cannot be reversed.
                  </p>
                </div>

                <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                  If you did not make this request, please safely ignore this email or change your password immediately.
                </p>
              </td>
            </tr>

            <!-- Terminal Footer -->
            <tr>
              <td style="padding: 18px 28px; background-color: #07070d; border-top: 1px solid #1e2030; text-align: center;">
                <p style="margin: 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; color: #64748b;">
                  InterviewAI Neo v2.0 • Security Subsystem
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
