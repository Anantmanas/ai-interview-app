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
    <div className="p-4 sm:p-6 md:p-8 max-w-[860px] mx-auto font-sans">
      <div className="mb-6 sm:mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#8052ff] uppercase tracking-widest font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff]" />
          <span>// REWARDS & REFERRALS</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-light text-white tracking-tight">Refer & Earn</h1>
        <p className="font-sans text-sm sm:text-base text-white/60 font-light mt-1">
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
            className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:border-white/20 transition-all"
          >
            <Icon className="h-5 w-5 text-[#8052ff] mx-auto mb-2" />
            <p className="font-sans text-3xl sm:text-4xl font-light text-white tracking-tight">{value}</p>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1 font-semibold">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Referral link card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <h2 className="font-mono text-xs font-semibold text-[#8052ff] uppercase tracking-wider mb-4">
          Your Referral Link
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-5 py-3 font-mono text-xs text-white/90 truncate flex items-center">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className={`btn-dala-primary flex items-center justify-center gap-2 px-6 py-2.5 cursor-pointer shrink-0 ${
              copied ? '!from-[#15846e] !to-[#10b981]' : ''
            }`}
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 text-white/50 font-mono text-xs">
          <span className="bg-white/[0.05] border border-white/10 px-3 py-1 rounded-full text-white font-semibold">{referralCode}</span>
          <span>Your personal referral token</span>
        </div>

        {/* How it works */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-3 font-semibold">How it works</p>
          <div className="space-y-3">
            {[
              'Share your link with friends, students, and engineering peers',
              'They sign up and complete their first adaptive AI mock interview',
              'When 3 referrals upgrade to Pro → you automatically receive 1 free month',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <span className="font-mono text-[10px] text-[#8052ff] font-bold">{i + 1}</span>
                </div>
                <p className="font-sans text-xs text-white/70 font-light">{step}</p>
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
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          <h2 className="font-mono text-xs font-semibold text-[#8052ff] uppercase tracking-wider mb-4">
            Referral History
          </h2>
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
                <p className="font-mono text-xs text-white/60">
                  {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <span className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  r.status === 'rewarded'
                    ? 'bg-[#15846e]/20 border-[#15846e]/40 text-[#15846e]'
                    : 'bg-white/[0.04] border-white/10 text-white/50'
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
