'use client'

import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { X, Zap, BarChart3, Infinity, ArrowRight } from 'lucide-react'

interface QuotaGateProps {
  open: boolean
  onClose: () => void
  used: number
  limit: number
  plan: string
}

export function QuotaGate({ open, onClose, used, limit, plan }: QuotaGateProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] mx-4"
          >
            <div className="bg-[#0c0c10] border border-[#2b292d] rounded-[8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
              {/* Header glow */}
              <div className="relative h-1.5 bg-gradient-to-r from-[#71d083]/0 via-[#71d083] to-[#71d083]/0" />

              <div className="p-7">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-[#49474e] hover:text-[#e5e5e5] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-[#71d083]/10 border border-[#71d083]/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-[#71d083]" />
                  </div>
                  <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-2">
                    // LIMIT REACHED
                  </p>
                  <h2 className="font-display text-[24px] font-bold text-[#e5e5e5] leading-[1.1]">
                    You&apos;ve used all {limit} free interviews
                  </h2>
                  <p className="font-body text-[14px] text-[#7c7a85] mt-2">
                    Upgrade to Pro to practice without limits.
                  </p>
                </div>

                {/* Usage bar */}
                <div className="mb-6 p-4 bg-[#0a0a0e] border border-[#2b292d] rounded-[6px]">
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-[10px] text-[#49474e] uppercase tracking-[0.08em]">
                      Monthly usage
                    </span>
                    <span className="font-mono text-[11px] text-[#e5e5e5]">
                      {used} / {limit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2b292d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#71d083] rounded-full transition-all"
                      style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Pro benefits */}
                <div className="mb-6 space-y-2">
                  {[
                    { icon: Infinity, text: 'Unlimited AI interviews' },
                    { icon: BarChart3, text: 'Full analytics dashboard' },
                    { icon: Zap, text: 'Deep follow-up questions' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <Icon className="h-3.5 w-3.5 text-[#71d083]" />
                      <span className="font-mono text-[12px] text-[#b5b2bc]">{text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href="/pricing"
                  className="w-full flex items-center justify-center gap-2 bg-[#71d083] text-[#04040b] font-mono text-[13px] font-bold uppercase tracking-[0.06em] py-3.5 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                >
                  Upgrade to Pro — ₹299/mo
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="text-center font-mono text-[10px] text-[#49474e] mt-3">
                  Cancel anytime. No lock-in.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
