'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Shield, Zap, Lock, HelpCircle } from 'lucide-react'
import { LandingBackground } from '@/components/ui/landing-background'
import { PricingCard } from '@/components/pricing/pricing-card'

const FREE_FEATURES = [
  { text: '3 AI interviews / month', available: true },
  { text: '1 resume upload', available: true },
  { text: 'Basic AI feedback', available: true },
  { text: 'Performance history', available: true },
  { text: 'Analytics dashboard', available: false },
  { text: 'Deep follow-up questions', available: false },
  { text: 'API access', available: false },
  { text: 'Referral rewards', available: false },
]

const PRO_FEATURES = [
  { text: 'Unlimited AI interviews', available: true },
  { text: '5 resume uploads', available: true },
  { text: 'Deep AI feedback + follow-ups', available: true },
  { text: 'Performance history', available: true },
  { text: 'Analytics dashboard', available: true },
  { text: 'Deep follow-up questions', available: true },
  { text: 'API access', available: true },
  { text: 'Referral rewards', available: true },
]

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your Billing settings — access continues to the end of your billing period. No penalties.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free plan is your trial — no card required. Upgrade only when you need unlimited interviews.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All major cards, UPI, net banking, and wallets via Razorpay. 100% secure checkout.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day refund for new Pro subscriptions if you have not used more than 1 Pro interview.',
  },
  {
    q: 'Will you add a Team plan?',
    a: 'Yes — team billing is on our roadmap for Q4 2026. Join the waitlist at support@interviewai.app.',
  },
]

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/create-subscription', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error ?? 'Failed to start checkout')
        return
      }

      // Load Razorpay checkout JS
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: data.key_id,
          subscription_id: data.subscription_id,
          name: 'InterviewAI',
          description: 'Pro Plan — Unlimited AI Interviews',
          image: '/logo.png',
          prefill: {
            name: data.customer_name,
            email: data.customer_email,
          },
          theme: { color: '#4f46e5' },
          handler: () => {
            // Payment captured — webhook will update DB async
            window.location.href = '/dashboard/billing?upgraded=1'
          },
        })
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#000000] relative overflow-hidden">
      <LandingBackground />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-[#1e1e2f] bg-[#000000]/80 backdrop-blur-sm">
          <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
              <span className="font-mono text-[13px] font-bold text-[#ffffff] uppercase tracking-[0.1em]">
                InterviewAI
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="font-mono text-[11px] text-[#818cf8] hover:text-white uppercase tracking-[0.08em] transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-[1100px] mx-auto px-6 pt-20 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-4">
              // PRICING
            </p>
            <h1 className="font-display text-[52px] font-bold text-[#ffffff] tracking-[-0.025em] leading-[1.05] mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="font-body text-[17px] text-[#9ca3af] max-w-[520px] mx-auto mb-10">
              Start free. Upgrade when you need unlimited practice.
              No hidden fees — cancel anytime.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-0 bg-[#09090e] border border-[#1e1e2f] rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`font-mono text-[11px] uppercase tracking-[0.06em] px-4 py-1.5 rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-[#4f46e5] text-white font-bold shadow-[0_0_12px_rgba(79,70,229,0.35)]'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`font-mono text-[11px] uppercase tracking-[0.06em] px-4 py-1.5 rounded-md transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-[#4f46e5] text-white font-bold shadow-[0_0_12px_rgba(79,70,229,0.35)]'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1.5 text-[9px] bg-[#6366f1]/30 text-[#c7d2fe] px-1.5 py-0.5 rounded">
                  -17%
                </span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Cards */}
        <section className="max-w-[900px] mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PricingCard
              plan="free"
              monthlyPrice={0}
              yearlyPrice={0}
              billingCycle={billingCycle}
              features={FREE_FEATURES}
              cta="Get Started Free →"
              ctaHref="/auth/sign-up"
            />
            <PricingCard
              plan="pro"
              monthlyPrice={299}
              yearlyPrice={2990}
              billingCycle={billingCycle}
              features={PRO_FEATURES}
              cta="Upgrade to Pro →"
              ctaHref="/dashboard/billing"
              recommended
              onUpgrade={handleUpgrade}
              loading={loading}
            />
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-10"
          >
            {[
              { icon: Shield, text: 'Secure payments via Razorpay' },
              { icon: Lock, text: 'Your data is always private' },
              { icon: Zap, text: 'Cancel anytime — no lock-in' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-[#6366f1]" />
                <span className="font-mono text-[11px] text-[#64748b] uppercase tracking-[0.06em]">
                  {text}
                </span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="max-w-[700px] mx-auto px-6 pb-24">
          <div className="text-center mb-10">
            <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-2">
              // FAQ
            </p>
            <h2 className="font-display text-[30px] font-bold text-[#ffffff]">
              Questions? We have answers.
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border border-[#1e1e2f] rounded-lg bg-[#09090e]/80 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-mono text-[13px] text-[#f8fafc]">{faq.q}</span>
                  <HelpCircle
                    className={`h-4 w-4 flex-shrink-0 transition-colors ${
                      openFaq === i ? 'text-[#818cf8]' : 'text-[#64748b]'
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-[#1e1e2f]">
                    <p className="font-body text-[14px] text-[#9ca3af] leading-[1.7] pt-3">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1e1e2f] py-8">
          <div className="max-w-[1100px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
              <span className="font-mono text-[12px] font-bold text-[#ffffff] uppercase tracking-[0.08em]">
                InterviewAI
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="font-mono text-[10px] text-[#64748b] hover:text-[#9ca3af] uppercase tracking-[0.06em] transition-colors">Privacy</Link>
              <Link href="/terms" className="font-mono text-[10px] text-[#64748b] hover:text-[#9ca3af] uppercase tracking-[0.06em] transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
