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
    <div className="p-6 max-w-[800px] mx-auto">
      <div className="mb-8">
        <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-1">// REFERRALS</p>
        <h1 className="font-display text-[28px] font-bold text-white tracking-[-0.02em]">Refer & Earn</h1>
        <p className="font-body text-[14px] text-[#9ca3af] mt-1">
          Share InterviewAI and earn 1 free Pro month for every 3 referrals that upgrade.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Referrals', value: referrals.length },
          { icon: CheckCircle, label: 'Converted', value: converted },
          { icon: Gift, label: 'Credits Earned', value: credits },
        ].map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#09090e] border border-[#1e1e2f] rounded-[8px] p-5 text-center"
          >
            <Icon className="h-5 w-5 text-[#818cf8] mx-auto mb-2" />
            <p className="font-display text-[28px] font-bold text-white">{value}</p>
            <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-[0.08em] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Referral link card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#09090e] border border-[#1e1e2f] rounded-[8px] p-6 mb-5"
      >
        <h2 className="font-mono text-[12px] font-bold text-[#818cf8] uppercase tracking-[0.1em] mb-4">
          Your Referral Link
        </h2>

        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-[#000000] border border-[#1e1e2f] rounded-[6px] px-4 py-2.5 font-mono text-[12px] text-[#9ca3af] truncate">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[6px] border font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition-all ${
              copied
                ? 'border-[#4f46e5] bg-[#4f46e5]/20 text-[#818cf8]'
                : 'border-[#1e1e2f] bg-[#000000] text-[#9ca3af] hover:border-[#3730a3] hover:text-white'
            }`}
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[#64748b] font-mono text-[10px]">
          <span className="bg-[#1e1e2f] px-2 py-0.5 rounded text-white font-bold">{referralCode}</span>
          <span>Your personal referral code</span>
        </div>

        {/* How it works */}
        <div className="mt-5 pt-5 border-t border-[#1e1e2f]/60">
          <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-[0.1em] mb-3">How it works</p>
          <div className="space-y-2">
            {[
              'Share your link with friends and colleagues',
              'They sign up and complete their first interview',
              'When 3 referrals upgrade to Pro → you get 1 free month',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#4f46e5]/15 border border-[#4f46e5]/30 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-[#818cf8]">{i + 1}</span>
                </div>
                <p className="font-body text-[13px] text-[#9ca3af]">{step}</p>
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
          className="bg-[#09090e] border border-[#1e1e2f] rounded-[8px] p-6"
        >
          <h2 className="font-mono text-[12px] font-bold text-[#818cf8] uppercase tracking-[0.1em] mb-4">
            Referral History
          </h2>
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-[#1e1e2f]/40 last:border-0">
                <p className="font-mono text-[11px] text-[#9ca3af]">
                  {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <span className={`font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded ${
                  r.status === 'rewarded'
                    ? 'bg-[#4f46e5]/15 text-[#818cf8]'
                    : 'bg-[#1e1e2f] text-[#64748b]'
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
