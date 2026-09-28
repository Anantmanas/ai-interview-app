'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Copy, CheckCircle, Gift, Users, Zap } from 'lucide-react'

interface Referral {
  id: string
  status: string
  created_at: string
  reward_type: string | null
}

interface ReferralsClientProps {
  referralCode: string
  referralLink: string
  credits: number
  referrals: Referral[]
}

export function ReferralsClient({ referralCode, referralLink, credits, referrals }: ReferralsClientProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const converted = referrals.filter(r => r.status === 'rewarded').length
  const pending = referrals.filter(r => r.status === 'pending').length

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[800px] mx-auto">
      <div className="mb-6 sm:mb-8 border-b border-[#142347] pb-6">
        <p className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-[0.2em] mb-1 font-semibold">// REWARDS & REFERRALS</p>
        <h1 className="font-display text-[28px] font-bold text-white tracking-[-0.03em]">Refer & Earn</h1>
        <p className="font-body text-[13px] sm:text-[14px] text-[#94a3b8] mt-1">
          Share InterviewAI and earn 1 free Pro month for every 3 referrals that upgrade.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Referrals', value: referrals.length },
          { icon: CheckCircle, label: 'Converted', value: converted },
          { icon: Gift, label: 'Credits Earned', value: credits },
        ].map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#060b18] border border-[#142347] rounded-xl p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <Icon className="h-5 w-5 text-[#38bdf8] mx-auto mb-2" />
            <p className="font-display text-[28px] font-bold text-white tracking-tight">{value}</p>
            <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-[0.08em] mt-0.5 font-semibold">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Referral link card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#060b18] border border-[#142347] rounded-xl p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      >
        <h2 className="font-mono text-[12px] font-bold text-[#38bdf8] uppercase tracking-[0.1em] mb-4">
          Your Referral Link
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="flex-1 bg-[#040814] border border-[#142347] rounded-lg px-4 py-2.5 font-mono text-[12px] text-[#cbd5e1] truncate">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition-all cursor-pointer ${
              copied
                ? 'border-[#22c55e] bg-[#22c55e]/20 text-[#22c55e]'
                : 'border-[#3b82f6]/40 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:from-[#3b82f6] hover:to-[#2563eb] shadow-[0_0_20px_rgba(37,99,235,0.3)]'
            }`}
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[#94a3b8] font-mono text-[11px]">
          <span className="bg-[#0a1226] border border-[#142347] px-2.5 py-0.5 rounded text-white font-bold">{referralCode}</span>
          <span>Your personal referral token</span>
        </div>

        {/* How it works */}
        <div className="mt-5 pt-5 border-t border-[#142347]/60">
          <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-[0.1em] mb-3 font-semibold">How it works</p>
          <div className="space-y-2.5">
            {[
              'Share your link with friends, students, and engineering peers',
              'They sign up and complete their first adaptive AI mock interview',
              'When 3 referrals upgrade to Pro → you automatically receive 1 free month',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#0a1226] border border-[#2563eb]/40 flex items-center justify-center">
                  <span className="font-mono text-[10px] text-[#38bdf8] font-bold">{i + 1}</span>
                </div>
                <p className="font-body text-[13px] text-[#cbd5e1]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Referral history */}
      {referrals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#060b18] border border-[#142347] rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        >
          <h2 className="font-mono text-[12px] font-bold text-[#38bdf8] uppercase tracking-[0.1em] mb-4">
            Referral History
          </h2>
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-[#142347]/60 last:border-0">
                <p className="font-mono text-[11px] text-[#94a3b8]">
                  {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <span className={`font-mono text-[10px] uppercase tracking-[0.06em] px-2.5 py-0.5 rounded-full border ${
                  r.status === 'rewarded'
                    ? 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]'
                    : 'bg-[#0a1226] border-[#142347] text-[#94a3b8]'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
