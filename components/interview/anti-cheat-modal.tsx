'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, ShieldAlert, ArrowRight } from 'lucide-react'

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
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="w-full max-w-md bg-[#060b18] border border-[#2563eb]/50 rounded-2xl p-6 shadow-[0_0_60px_rgba(37,99,235,0.25)] relative overflow-hidden"
        >
          {/* Top glowing gradient border accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#06b6d4]" />

          {/* Icon Badge */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#0a1226] border border-[#1e3a8a] flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.35)]">
                <ShieldAlert className="w-7 h-7 text-[#60a5fa]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#f43f5e] border-2 border-[#060b18] flex items-center justify-center text-[10px] font-bold text-white font-mono">
                !
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0a1226] border border-[#1e3a8a] text-[#60a5fa] text-[10px] font-mono uppercase tracking-widest font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e] animate-ping" />
              <span>AUTHENTICITY SENSOR TRIGGERED</span>
            </div>
            <h3 className="font-display text-xl font-bold text-[#f8fafc] tracking-tight">
              Paste Limit Exceeded (2/2 Allowed)
            </h3>
          </div>

          {/* Encouraging Message */}
          <div className="bg-[#02040a] border border-[#142347] rounded-xl p-4 mb-5 text-center space-y-2.5">
            <p className="text-[13px] text-[#cbd5e1] leading-relaxed">
              Don&apos;t rely on external copy-paste or AI shortcuts! You are here to build genuine confidence that holds up in a real technical round.
            </p>
            <div className="h-px bg-[#142347]" />
            <p className="text-[11.5px] text-[#94a3b8] leading-relaxed italic">
              &ldquo;Imperfect, authentic answers give our AI interviewer 10x better telemetry to diagnose your actual blindspots and build your roadmap.&rdquo;
            </p>
          </div>

          {/* Tip badge */}
          <div className="flex items-center justify-center gap-2 mb-6 text-[11px] font-mono text-[#60a5fa] bg-[#0a1226] py-2 px-3 rounded-lg border border-[#142347]">
            <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Type your honest reasoning—our coach will guide you!</span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="btn-cobalt w-full py-3 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Understood, Let&apos;s Code Authentically</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
