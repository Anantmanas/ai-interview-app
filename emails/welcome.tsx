export interface WelcomeEmailProps {
  fullName: string
  email: string
}

export function WelcomeEmail({ fullName, email }: WelcomeEmailProps): string {
  const firstName = fullName?.split(' ')[0] || 'Engineer'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to InterviewAI</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellPadding="0" cellSpacing="0" style="background-color: #000000; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 560px; background-color: #090912; border: 1px solid #1e1e2f; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 48px rgba(0,0,0,0.85);">
            
            <!-- Top Electric Indigo Accent -->
            <tr>
              <td style="height: 3px; background: linear-gradient(90deg, #4f46e5, #818cf8, #06b6d4);"></td>
            </tr>

            <!-- Apple Terminal Titlebar -->
            <tr>
              <td style="background-color: #11121b; padding: 12px 20px; border-bottom: 1px solid #1e1e2f;">
                <table width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td align="left">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #ff5f56; margin-right: 6px;"></span>
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #ffbd2e; margin-right: 6px;"></span>
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #27c93f; margin-right: 12px;"></span>
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; color: #9ca3af; letter-spacing: 0.05em;">
                        interviewai-onboarding.sh — launch
                      </span>
                    </td>
                    <td align="right">
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 10px; color: #818cf8; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                        READY
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Email Body -->
            <tr>
              <td style="padding: 32px 30px 28px;">
                <p style="margin: 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; color: #818cf8; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600;">
                  // FAST-TRACK COCKPIT READY
                </p>
                <h1 style="margin: 10px 0 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.25;">
                  Welcome aboard, ${firstName}! 🚀
                </h1>
                
                <!-- Motivational Callout -->
                <p style="margin: 18px 0 0; color: #cbd5e1; font-size: 15px; line-height: 1.7;">
                  You don&apos;t need another 6-month generic boot camp or endless video playlists to land your dream tech role. You just need to master what <strong style="color: #ffffff;">actually matters</strong> in the real interview room.
                </p>

                <p style="margin: 12px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.65;">
                  InterviewAI isolates your exact skill gaps in real-time, builds a <strong style="color: #818cf8;">laser-focused quick roadmap</strong>, and gives you realistic AI-powered mock interviews — bridging the gap between you and your dream company in record time!
                </p>

                <!-- Feature Highlights Grid -->
                <table width="100%" cellPadding="0" cellSpacing="0" style="margin: 24px 0; background-color: #0c0d18; border: 1px solid #1e1e35; border-radius: 10px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <table width="100%" cellPadding="0" cellSpacing="0">
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace;">
                            ⚡ <strong style="color: #ffffff;">Live Speech & Code Cockpit:</strong> Instant AI audio & syntax evaluation
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace;">
                            🎯 <strong style="color: #ffffff;">Precision Roadmaps:</strong> Curated high-yield YouTube videos for your weak spots
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace;">
                            🏢 <strong style="color: #ffffff;">Target Company Calibration:</strong> Tailored for Google, Meta, Stripe & top startups
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Primary CTA Button -->
                <table width="100%" cellPadding="0" cellSpacing="0" style="margin: 28px 0 10px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${appUrl}/dashboard"
                        style="display: inline-block; width: 85%; max-width: 380px; background: linear-gradient(90deg, #4f46e5, #6366f1); color: #ffffff; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.08em; padding: 14px 28px; border-radius: 8px; text-align: center; box-shadow: 0 0 25px rgba(79, 70, 229, 0.45);"
                      >
                        Go to Dashboard & Launch Interview →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Terminal Footer -->
            <tr>
              <td style="padding: 20px 30px; background-color: #07070d; border-top: 1px solid #1e1e2f;">
                <table width="100%" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td align="left">
                      <p style="margin: 0; color: #64748b; font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace;">
                        InterviewAI Neo v2.0 • Sent to ${email}
                      </p>
                    </td>
                    <td align="right">
                      <p style="margin: 0; font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace;">
                        <a href="${appUrl}/dashboard" style="color: #818cf8; text-decoration: none;">Dashboard</a>
                        <span style="color: #334155; margin: 0 4px;">•</span>
                        <a href="${appUrl}/help" style="color: #818cf8; text-decoration: none;">Help</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
