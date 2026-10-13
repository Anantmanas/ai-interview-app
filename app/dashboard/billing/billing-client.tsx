'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { CreditCard, Zap, CheckCircle, AlertTriangle, XCircle, ArrowUpRight, Sparkles } from 'lucide-react'

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
    active: { label: 'Active', color: 'text-[#818cf8] bg-[#4f46e5]/15 border-[#4f46e5]/30', icon: <CheckCircle className="h-3 w-3" /> },
    canceling: { label: 'Canceling', color: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20', icon: <AlertTriangle className="h-3 w-3" /> },
    canceled: { label: 'Canceled', color: 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20', icon: <XCircle className="h-3 w-3" /> },
    past_due: { label: 'Past Due', color: 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20', icon: <AlertTriangle className="h-3 w-3" /> },
    inactive: { label: 'Free', color: 'text-[#9ca3af] bg-[#1e1e2f]/40 border-[#1e1e2f]', icon: null },
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
    try {
      const { toast } = await import('sonner')
      const res = await fetch('/api/billing/create-subscription', { method: 'POST' })
      const data = await res.json()

      if (data?.free_promo) {
        toast.success('Exhibition Promotion: Pro features unlocked 100% free!')
        setTimeout(() => {
          window.location.reload()
        }, 1200)
        return
      }

      if (!res.ok) {
        toast.error(data?.message || data?.error || 'Upgrade request failed')
        setUpgrading(false)
        return
      }

      if (data?.key_id && data?.subscription_id) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rzp = new (window as any).Razorpay({
            key: data.key_id,
            subscription_id: data.subscription_id,
            name: 'InterviewAI',
            description: 'Pro Plan',
            theme: { color: '#4f46e5' },
            handler: () => { window.location.reload() },
          })
          rzp.open()
          setUpgrading(false)
        }
        document.body.appendChild(script)
      } else {
        toast.success('Pro access active!')
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch {
      const { toast } = await import('sonner')
      toast.error('Failed to process upgrade. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }


  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[860px] mx-auto font-sans">
      {/* Header */}
      <div className="mb-6 sm:mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#8052ff] uppercase tracking-widest font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff]" />
          <span>// BILLING & LICENSING</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-light text-white tracking-tight">
          Billing & Plan
        </h1>
        <p className="font-sans text-sm sm:text-base text-white/60 font-light mt-1">
          Manage your subscription tier, usage quotas, and invoice history.
        </p>
      </div>

      {/* Exhibition Promotion Notice */}
      <div className="mb-6 p-5 rounded-3xl border border-[#8052ff]/30 bg-[#8052ff]/10 backdrop-blur-2xl flex items-start gap-3.5 shadow-[0_10px_30px_rgba(128,82,255,0.1)]">
        <Sparkles className="h-5 w-5 text-[#8052ff] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
            Limited Time Exhibition Access — 100% Free
          </p>
          <p className="font-sans text-xs text-white/70 font-light leading-relaxed">
            During our current platform exhibition, Pro features, unlimited mock interviews, and AI analysis are completely free. Click Upgrade to activate instant Pro tier access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all ${
            isPro
              ? 'border-[#8052ff]/50 bg-white/[0.04] shadow-[0_20px_60px_rgba(128,82,255,0.12)]'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
          }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CreditCard className={`h-4 w-4 ${isPro ? 'text-[#8052ff]' : 'text-white/50'}`} />
                <h2 className="font-mono text-sm font-semibold text-white uppercase tracking-wider">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <StatusBadge status={status} />
              </div>
              {isPro && profile?.plan_expires_at && (
                <p className="font-mono text-xs text-white/50 mt-1">
                  Renews {new Date(profile.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-sans text-3xl sm:text-4xl font-light text-white tracking-tight">
                {isPro ? '₹299' : '₹0'}
              </p>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-0.5">/month</p>
            </div>
          </div>

          {/* Usage */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
                Interviews this month
              </span>
              <span className="font-mono text-xs text-white font-medium">
                {used} / {isPro ? '∞' : limit}
              </span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePct >= 100 ? 'bg-[#f43f5e]' : usagePct >= 80 ? 'bg-[#ffb829]' : 'bg-gradient-to-r from-[#8052ff] to-[#a882ff] shadow-[0_0_8px_rgba(128,82,255,0.6)]'
                }`}
                style={{ width: `${isPro ? Math.min((used / 30) * 100, 10) : usagePct}%` }}
              />
            </div>
            {!isPro && used >= limit && (
              <p className="font-mono text-[11px] text-[#f43f5e] mt-2">
                Monthly limit reached. Upgrade for unlimited access.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {isPro ? (
              <>
                {status !== 'canceling' && status !== 'canceled' && (
                  <button
                    onClick={handleCancel}
                    disabled={canceling}
                    className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-[#f43f5e]/40 text-white/60 hover:text-[#f43f5e] font-mono text-xs uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {canceling ? 'Canceling...' : 'Cancel Plan'}
                  </button>
                )}
                {status === 'canceling' && (
                  <p className="font-mono text-xs text-[#ffb829] flex items-center gap-1.5">
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
                className="btn-dala-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                {upgrading ? 'Processing...' : 'Upgrade to Pro — ₹299/mo'}
              </motion.button>
            )}
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-5 py-2.5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-mono text-xs uppercase tracking-wider rounded-full transition-colors bg-white/[0.02]"
            >
              <span>View Plans</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Subscription History */}
        {subscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <h2 className="font-mono text-xs font-semibold text-[#8052ff] uppercase tracking-wider mb-4">
              Subscription History
            </h2>
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0"
                >
                  <div>
                    <p className="font-mono text-xs text-white capitalize">{sub.plan} Plan</p>
                    {sub.current_period_start && sub.current_period_end && (
                      <p className="font-mono text-[10px] text-white/40 mt-0.5">
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
