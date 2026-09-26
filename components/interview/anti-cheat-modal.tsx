'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, ShieldAlert, HeartHandshake, ArrowRight } from 'lucide-react'

interface AntiCheatModalProps {
  isOpen: boolean
  onClose: () => void
  pasteCount: number
}

export function AntiCheatModal({ isOpen, onClose, pasteCount }: AntiCheatModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="w-full max-w-md bg-[#0c0d18] border border-[#4f46e5]/50 rounded-2xl p-6 shadow-[0_0_60px_rgba(99,102,241,0.35)] relative overflow-hidden"
        >
          {/* Top glowing gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f59e0b] via-[#6366f1] to-[#ec4899]" />

          {/* Icon Badge */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#18182e] border border-[#3730a3] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <span className="text-2xl">🕵️‍♂️</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#f59e0b] border-2 border-[#0c0d18] flex items-center justify-center text-[11px] font-bold text-black">
                !
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-[10px] font-mono uppercase tracking-widest font-semibold">
              <ShieldAlert className="w-3 h-3" />
              <span>COPY-PASTE LIMIT REACHED</span>
            </div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight">
              Busted! But in a Good Way 😉
            </h3>
          </div>

          {/* Encouraging & Funny Message */}
          <div className="bg-[#141528]/80 border border-[#272848] rounded-xl p-4 mb-5 text-center space-y-2.5">
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Don&apos;t use Google or AI shortcuts for this! You&apos;re here to <span className="text-[#818cf8] font-bold">ACE something valuable</span> that truly represents <span className="text-white font-semibold">YOU</span>.
            </p>
            <div className="h-px bg-[#272848]" />
            <p className="text-[11px] text-[#94a3b8] leading-relaxed italic">
              &ldquo;Don&apos;t worry — we are not here to judge you, we&apos;re here to help you improve! Take a breath, trust your brain, and try by your OWN!&rdquo; 💡
            </p>
          </div>

          {/* Perks of writing on your own */}
          <div className="flex items-center justify-center gap-2 mb-6 text-[10px] font-mono text-[#a5b4fc] bg-[#1a1b35] py-2 px-3 rounded-lg border border-[#313264]">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Raw & imperfect answers get 10x better AI coaching!</span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-center bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Got it, let me cook! 👨‍🍳🔥</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
