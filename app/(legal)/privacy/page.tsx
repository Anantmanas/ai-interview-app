import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — InterviewAI',
  description: 'How InterviewAI collects, uses, and protects your personal data.',
}

const sections = [
  {
    id: 'data-collected',
    label: '01 — Data We Collect',
    content: [
      {
        heading: 'Account Information',
        body: 'When you create an account, we collect your email address, full name, and an encrypted password. If you sign in with Google or GitHub, we receive your public profile data (name, email, avatar) from the OAuth provider.',
      },
      {
        heading: 'Interview Data',
        body: 'We store the questions asked during practice sessions, your answers, AI-generated evaluations, and performance scores. This data is used exclusively to power your personal feedback and analytics.',
      },
      {
        heading: 'Resume Data',
        body: 'Uploaded resumes are parsed and stored to personalise your interview experience. You can delete your resume at any time from your profile settings.',
      },
      {
        heading: 'Usage & Telemetry',
        body: 'We collect anonymised usage events (pages visited, features clicked) to improve the product. No personally identifiable information is included in telemetry.',
      },
    ],
  },
  {
    id: 'how-we-use',
    label: '02 — How We Use Your Data',
    content: [
      {
        heading: 'Service Delivery',
        body: 'To operate InterviewAI — authenticate you, generate personalised interview questions, produce AI feedback, and maintain your performance history.',
      },
      {
        heading: 'Communication',
        body: 'We may send transactional emails (e.g., interview completion summaries, billing confirmations) and, with your consent, weekly progress digests. You may opt out of digest emails at any time.',
      },
      {
        heading: 'Billing',
        body: 'Payment processing is handled by Razorpay. InterviewAI does not store your card details. We receive a customer ID and subscription status from Razorpay to manage your plan.',
      },
      {
        heading: 'Product Improvement',
        body: 'Aggregated, anonymised data helps us improve question quality, AI model accuracy, and the overall user experience.',
      },
    ],
  },
  {
    id: 'cookies',
    label: '03 — Cookies & Storage',
    content: [
      {
        heading: 'Authentication Cookies',
        body: 'We use secure, HTTP-only cookies to maintain your login session via Supabase Auth. These cookies expire when you sign out or after 7 days of inactivity.',
      },
      {
        heading: 'Preferences',
        body: 'Local Storage may be used to persist UI preferences (theme, sidebar state) on your device. This data never leaves your browser.',
      },
      {
        heading: 'No Third-Party Ad Cookies',
        body: 'We do not use advertising cookies or sell your data to third-party advertisers.',
      },
    ],
  },
  {
    id: 'data-retention',
    label: '04 — Data Retention',
    content: [
      {
        heading: 'Active Accounts',
        body: 'Your data is retained for as long as your account is active.',
      },
      {
        heading: 'Account Deletion',
        body: 'You may request full account deletion by emailing privacy@interviewai.app. We will permanently delete all your personal data within 30 days, except where retention is required by law (e.g., billing records for 7 years under Indian tax regulations).',
      },
    ],
  },
  {
    id: 'security',
    label: '05 — Security',
    content: [
      {
        heading: 'Encryption',
        body: 'All data is transmitted over TLS 1.2+. Data at rest is encrypted by Supabase (AES-256) on AWS infrastructure in the Asia South 1 region.',
      },
      {
        heading: 'Access Controls',
        body: 'Row Level Security (RLS) policies ensure that each user can only access their own data. Administrative access is restricted and logged.',
      },
    ],
  },
  {
    id: 'contact',
    label: '06 — Contact Us',
    content: [
      {
        heading: 'Privacy Inquiries',
        body: 'For questions, data requests, or deletion requests, contact: privacy@interviewai.app. We will respond within 72 hours.',
      },
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-14">
        <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-3">
          // LEGAL
        </p>
        <h1 className="font-display text-[44px] font-bold text-[#e5e5e5] tracking-[-0.025em] leading-[1.05] mb-4">
          Privacy Policy
        </h1>
        <p className="font-body text-[15px] text-[#7c7a85] max-w-[560px]">
          We built InterviewAI with privacy as a default. This policy explains exactly what we
          collect, how we use it, and the controls you have.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#49474e] uppercase tracking-[0.08em] border border-[#2b292d] rounded-[4px] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#71d083]" />
            Last updated: September 2026
          </span>
        </div>
      </div>

      {/* Quick nav */}
      <nav className="mb-12 p-5 border border-[#2b292d] rounded-[6px] bg-[#0c0c10]/60">
        <p className="font-mono text-[10px] text-[#49474e] uppercase tracking-[0.12em] mb-3">
          Contents
        </p>
        <ul className="space-y-1.5">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="font-mono text-[12px] text-[#7c7a85] hover:text-[#71d083] transition-colors uppercase tracking-[0.06em]"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sections */}
      <div className="space-y-14">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="font-mono text-[13px] text-[#71d083] uppercase tracking-[0.12em] mb-6 border-b border-[#2b292d]/60 pb-3">
              {section.label}
            </h2>
            <div className="space-y-6">
              {section.content.map((item) => (
                <div key={item.heading} className="pl-4 border-l border-[#2b292d]">
                  <h3 className="font-mono text-[12px] font-bold text-[#b5b2bc] uppercase tracking-[0.08em] mb-2">
                    {item.heading}
                  </h3>
                  <p className="font-body text-[14px] text-[#7c7a85] leading-[1.75]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 p-6 border border-[#2b292d] rounded-[6px] bg-[#0c0c10]/40 text-center">
        <p className="font-mono text-[11px] text-[#7c7a85] mb-1">
          Questions about this policy?
        </p>
        <a
          href="mailto:privacy@interviewai.app"
          className="font-mono text-[12px] text-[#71d083] hover:text-[#82dba2] transition-colors uppercase tracking-[0.06em]"
        >
          privacy@interviewai.app →
        </a>
      </div>
    </div>
  )
}
