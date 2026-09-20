'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { CreditCard, Zap, CheckCircle, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react'

interface Profile {
  plan: string | null
  subscription_status: string | null
  interviews_used_this_month: number | null
  interviews_limit: number | null
  plan_expires_at: string | null
  razorpay_subscription_id: string | null
}

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}

interface BillingClientProps {
  profile: Profile | null
  subscriptions: Subscription[]
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: 'Active', color: 'text-[#71d083] bg-[#71d083]/10 border-[#71d083]/20', icon: <CheckCircle className="h-3 w-3" /> },
    canceling: { label: 'Canceling', color: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20', icon: <AlertTriangle className="h-3 w-3" /> },
    canceled: { label: 'Canceled', color: 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20', icon: <XCircle className="h-3 w-3" /> },
    past_due: { label: 'Past Due', color: 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20', icon: <AlertTriangle className="h-3 w-3" /> },
    inactive: { label: 'Free', color: 'text-[#7c7a85] bg-[#7c7a85]/10 border-[#7c7a85]/20', icon: null },
  }
  const c = config[status] ?? config.inactive
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border ${c.color}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

export function BillingClient({ profile, subscriptions }: BillingClientProps) {
  const [canceling, setCanceling] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const plan = profile?.plan ?? 'free'
  const status = profile?.subscription_status ?? 'inactive'
  const used = profile?.interviews_used_this_month ?? 0
  const limit = profile?.interviews_limit ?? 3
  const isPro = plan === 'pro'
  const usagePct = Math.min((used / Math.max(limit, 1)) * 100, 100)

  const handleCancel = async () => {
    if (!confirm('Cancel your Pro subscription? Access continues until end of billing period.')) return
    setCanceling(true)
    const res = await fetch('/api/billing/cancel', { method: 'POST' })
    if (res.ok) {
      window.location.reload()
    } else {
      alert('Failed to cancel. Please try again.')
      setCanceling(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    const res = await fetch('/api/billing/create-subscription', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) { alert(data.error); setUpgrading(false); return }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: 'InterviewAI',
        description: 'Pro Plan',
        theme: { color: '#71d083' },
        handler: () => { window.location.reload() },
      })
      rzp.open()
      setUpgrading(false)
    }
    document.body.appendChild(script)
  }

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-1">
          // BILLING
        </p>
        <h1 className="font-display text-[28px] font-bold text-[#e5e5e5] tracking-[-0.02em]">
          Billing & Plan
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-[8px] border ${
            isPro
              ? 'border-[#71d083]/40 bg-[#0a1a0e] shadow-[0_0_40px_rgba(113,208,131,0.06)]'
              : 'border-[#2b292d] bg-[#0c0c10]'
          }`}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CreditCard className={`h-4 w-4 ${isPro ? 'text-[#71d083]' : 'text-[#7c7a85]'}`} />
                <h2 className="font-mono text-[14px] font-bold text-[#e5e5e5] uppercase tracking-[0.06em]">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <StatusBadge status={status} />
              </div>
              {isPro && profile?.plan_expires_at && (
                <p className="font-mono text-[11px] text-[#49474e] mt-1">
                  Renews {new Date(profile.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-display text-[28px] font-bold text-[#e5e5e5]">
                {isPro ? '₹299' : '₹0'}
              </p>
              <p className="font-mono text-[10px] text-[#49474e]">/month</p>
            </div>
          </div>

          {/* Usage */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] text-[#49474e] uppercase tracking-[0.08em]">
                Interviews this month
              </span>
              <span className="font-mono text-[11px] text-[#e5e5e5]">
                {used} / {isPro ? '∞' : limit}
              </span>
            </div>
            <div className="h-1.5 bg-[#2b292d] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePct >= 100 ? 'bg-[#f87171]' : usagePct >= 80 ? 'bg-[#f59e0b]' : 'bg-[#71d083]'
                }`}
                style={{ width: `${isPro ? Math.min((used / 30) * 100, 10) : usagePct}%` }}
              />
            </div>
            {!isPro && used >= limit && (
              <p className="font-mono text-[10px] text-[#f87171] mt-2">
                Monthly limit reached. Upgrade for unlimited access.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isPro ? (
              <>
                {status !== 'canceling' && status !== 'canceled' && (
                  <button
                    onClick={handleCancel}
                    disabled={canceling}
                    className="flex items-center gap-2 px-4 py-2 border border-[#2b292d] hover:border-[#f87171]/40 text-[#7c7a85] hover:text-[#f87171] font-mono text-[11px] uppercase tracking-[0.06em] rounded-[6px] transition-colors disabled:opacity-50"
                  >
                    {canceling ? 'Canceling...' : 'Cancel Plan'}
                  </button>
                )}
                {status === 'canceling' && (
                  <p className="font-mono text-[11px] text-[#f59e0b] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Cancellation scheduled at period end
                  </p>
                )}
              </>
            ) : (
              <motion.button
                onClick={handleUpgrade}
                disabled={upgrading}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#71d083] text-[#04040b] font-mono text-[12px] font-bold uppercase tracking-[0.06em] rounded-[6px] border border-[#366740] hover:bg-[#82dba2] disabled:opacity-50 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
              >
                <Zap className="h-3.5 w-3.5" />
                {upgrading ? 'Processing...' : 'Upgrade to Pro — ₹299/mo'}
              </motion.button>
            )}
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 border border-[#2b292d] hover:border-[#4b494e] text-[#7c7a85] hover:text-[#e5e5e5] font-mono text-[11px] uppercase tracking-[0.06em] rounded-[6px] transition-colors"
            >
              View Plans <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>

        {/* Subscription History */}
        {subscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-[8px] border border-[#2b292d] bg-[#0c0c10]"
          >
            <h2 className="font-mono text-[12px] font-bold text-[#b5b2bc] uppercase tracking-[0.1em] mb-4">
              Subscription History
            </h2>
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-3 border-b border-[#2b292d]/60 last:border-0"
                >
                  <div>
                    <p className="font-mono text-[12px] text-[#e5e5e5] capitalize">{sub.plan} Plan</p>
                    {sub.current_period_start && sub.current_period_end && (
                      <p className="font-mono text-[10px] text-[#49474e] mt-0.5">
                        {new Date(sub.current_period_start).toLocaleDateString('en-IN')} → {new Date(sub.current_period_end).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
